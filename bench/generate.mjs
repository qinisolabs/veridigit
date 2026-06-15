// Deterministic benchmark generator: arbitrary (non-memorised) identifiers with
// INDEPENDENT ground truth (computed here, not via the library under test).
// Usage: import { generate } from "./generate.mjs"; const items = generate(200, seed);

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- independent ground-truth implementations ---
function ibanCheck(cc, bban) {
  const r = bban + cc + "00";
  const e = r.replace(/[A-Z]/g, (c) => (c.charCodeAt(0) - 55).toString());
  let rem = 0;
  for (const ch of e) rem = (rem * 10 + (ch.charCodeAt(0) - 48)) % 97;
  return String(98 - rem).padStart(2, "0");
}
function luhn(num) {
  let sum = 0, dbl = true;
  for (let i = num.length - 1; i >= 0; i--) {
    let x = +num[i];
    if (dbl) { x *= 2; if (x > 9) x -= 9; }
    sum += x; dbl = !dbl;
  }
  return String((10 - (sum % 10)) % 10);
}
function isbn(d12) {
  let s = 0;
  for (let i = 0; i < 12; i++) s += +d12[i] * (i % 2 ? 3 : 1);
  return String((10 - (s % 10)) % 10);
}
const VT = { A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9,
  0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9 };
const VW = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
const VINCH = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
function vinCheck(v) {
  let s = 0;
  for (let i = 0; i < 17; i++) { if (i === 8) continue; s += VT[v[i]] * VW[i]; }
  const r = s % 11;
  return r === 10 ? "X" : String(r);
}

const IBAN_LENS = { NO:15, BE:16, DK:18, DE:22, ES:24, FR:27, IT:27, PT:25, FI:18, AT:20 };
const IBAN_CC = Object.keys(IBAN_LENS);

export function generate(n = 200, seed = 1) {
  const rnd = mulberry32(seed);
  const ri = (m) => Math.floor(rnd() * m);
  const digits = (k) => Array.from({ length: k }, () => String(ri(10))).join("");
  const items = [];
  let id = 0;
  const per = Math.floor(n / 4);

  for (let i = 0; i < per; i++) {
    const cc = IBAN_CC[ri(IBAN_CC.length)];
    const bban = digits(IBAN_LENS[cc] - 4);
    items.push({ id: ++id, category: "IBAN",
      question: `Return ONLY the two IBAN check digits (positions 3-4) for ${cc}XX${bban} (ISO 7064 mod-97). Answer with two digits, nothing else.`,
      answer: ibanCheck(cc, bban), probe: { kind: "iban", value: `${cc}${ibanCheck(cc, bban)}${bban}` } });
  }
  for (let i = 0; i < per; i++) {
    const base = digits(15);
    items.push({ id: ++id, category: "card-Luhn",
      question: `Return ONLY the single check digit that, appended to ${base}, makes it pass the Luhn check. One digit.`,
      answer: luhn(base), probe: { kind: "card", value: base + luhn(base) } });
  }
  for (let i = 0; i < per; i++) {
    const body = (ri(2) ? "978" : "979") + digits(9);
    items.push({ id: ++id, category: "ISBN-13",
      question: `Return ONLY the ISBN-13 check digit (13th) for the 12-digit prefix ${body}. One digit.`,
      answer: isbn(body), probe: { kind: "isbn", value: body + isbn(body) } });
  }
  for (let i = 0; i < n - 3 * per; i++) {
    const arr = Array.from({ length: 17 }, () => VINCH[ri(VINCH.length)]);
    const full = arr.map((c, idx) => (idx === 8 ? "0" : c)).join("");
    const cd = vinCheck(full);
    arr[8] = "_";
    items.push({ id: ++id, category: "VIN",
      question: `Return ONLY the correct VIN check digit (position 9, the "_") for ${arr.join("")} (ISO 3779). One char: 0-9 or X.`,
      answer: cd, probe: { kind: "vin", value: arr.map((c, idx) => (idx === 8 ? cd : c)).join("") } });
  }
  return items;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = Number(process.argv[2] || 200);
  const items = generate(n, Number(process.argv[3] || 1));
  console.log(JSON.stringify(items, null, 2));
}
