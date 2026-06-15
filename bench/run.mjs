// veridigit benchmark runner.
//
//   node bench/run.mjs [N] [seed]
//
// Always runs the "veridigit" arm (the built library) against independent ground truth.
// For each LLM whose API key is in the environment, queries it tool-free and scores it:
//   OPENAI_API_KEY      -> OPENAI_MODEL      (default gpt-4o)
//   ANTHROPIC_API_KEY   -> ANTHROPIC_MODEL   (default claude-sonnet-4-6)
//   GEMINI_API_KEY      -> GEMINI_MODEL      (default gemini-2.5-pro)
// Models without a key are skipped (reported as "no key").
//
// Requires the library to be built first:  npm run build

import { generate } from "./generate.mjs";
import {
  validateIban, ibanCheckDigits, luhnCheckDigit, isbn13CheckDigit, vinCheckDigit,
  validateCard, validateIsbn13, validateVin,
} from "../dist/index.js";

const N = Number(process.argv[2] || 200);
const SEED = Number(process.argv[3] || 1);
const items = generate(N, SEED);
const norm = (s) => String(s ?? "").trim().toUpperCase().replace(/[^0-9X]/g, "");

// ---- veridigit arm: compute the same answer the library would, prove it matches GT ----
function veridigitAnswer(it) {
  switch (it.category) {
    case "IBAN": {
      const m = it.question.match(/for ([A-Z]{2})XX(\w+)/);
      return ibanCheckDigits(m[1], m[2]);
    }
    case "card-Luhn": return luhnCheckDigit(it.question.match(/appended to (\d+)/)[1]);
    case "ISBN-13":   return isbn13CheckDigit(it.question.match(/prefix (\d{12})/)[1]);
    case "VIN":       return vinCheckDigit(it.probe.value);
  }
}

// ---- LLM callers (tool-free, single short answer) ----
async function askOpenAI(prompt) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }], temperature: 0, max_tokens: 16 }),
  });
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}
async function askAnthropic(prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 16, messages: [{ role: "user", content: prompt }] }),
  });
  const j = await r.json();
  return j.content?.[0]?.text ?? "";
}
async function askGemini(prompt) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 16 } }),
  });
  const j = await r.json();
  return j.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

const MODELS = [
  { name: process.env.OPENAI_MODEL || "gpt-4o", key: "OPENAI_API_KEY", ask: askOpenAI },
  { name: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6", key: "ANTHROPIC_API_KEY", ask: askAnthropic },
  { name: process.env.GEMINI_MODEL || "gemini-2.5-pro", key: "GEMINI_API_KEY", ask: askGemini },
];

function tally() { return { IBAN: [0,0], "card-Luhn": [0,0], "ISBN-13": [0,0], VIN: [0,0] }; }
function pct(arr) { return arr[1] ? Math.round((100 * arr[0]) / arr[1]) : 0; }
function reportRow(label, t) {
  let n = 0, wrong = 0;
  for (const c of Object.keys(t)) { wrong += t[c][0]; n += t[c][1]; }
  console.log(
    `${label.padEnd(26)} ${String(pct(t.IBAN)).padStart(4)}% ${String(pct(t["card-Luhn"])).padStart(5)}% ` +
    `${String(pct(t["ISBN-13"])).padStart(5)}% ${String(pct(t.VIN)).padStart(4)}%   ${String(n ? Math.round(100*wrong/n) : 0).padStart(3)}%  (n=${n})`
  );
}

async function main() {
  console.log(`veridigit benchmark — N=${N}, seed=${SEED}\n`);
  console.log(`${"".padEnd(26)}  IBAN  Luhn  ISBN   VIN   TOTAL error`);

  // veridigit arm (also asserts library == independent ground truth)
  const vt = tally();
  let mismatch = 0;
  for (const it of items) {
    const a = veridigitAnswer(it);
    vt[it.category][1]++;
    if (norm(a) !== norm(it.answer)) { vt[it.category][0]++; mismatch++; }
  }
  reportRow("veridigit (library)", vt);
  if (mismatch) console.log(`  !! ${mismatch} library/ground-truth mismatches — investigate before trusting results`);

  // LLM arms
  for (const m of MODELS) {
    if (!process.env[m.key]) { console.log(`${m.name.padEnd(26)} (skipped — set ${m.key})`); continue; }
    const t = tally();
    for (const it of items) {
      let got = "";
      try { got = await m.ask(it.question); } catch (e) { got = "ERR"; }
      t[it.category][1]++;
      if (norm(got) !== norm(it.answer)) t[it.category][0]++;
    }
    reportRow(m.name, t);
  }
  console.log(`\nLLM rows are tool-free baselines. veridigit is deterministic.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
