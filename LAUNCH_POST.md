# veridigit — launch post drafts

Lead with the finding, not a pitch. Numbers below are from a single-model, cold (no-tool)
run on 32 randomly generated identifiers — keep that caveat in. If you run the multi-model
benchmark, swap in that number and drop the "single model" caveat.

---

## Show HN

**Title:** Show HN: veridigit – an MCP tool that validates IBANs/cards/ISBNs/VINs (LLMs get them 91% wrong)

**Body:**

I kept watching agents confidently accept malformed IBANs and invent card/ISBN/VIN check
digits — well-formatted, plausible, and wrong. So I measured it: on 32 randomly generated,
non-memorised identifiers, a frontier model with no tool got the check digit wrong **91%**
of the time (IBAN 100%, VIN 100%, ISBN-13 88%, card/Luhn 75%). The failure is silent — you
get a clean answer that happens to be incorrect.

veridigit is a small MCP server (and typed TS library) that just runs the real checksum
algorithms — ISO 7064 mod-97 for IBAN, Luhn + BIN brand detection for cards, ISBN-13
mod-10, ISO 3779 for VIN — and returns a structured result with the parsed parts and a
clear reason when something's off. On the same 32 it's correct 100% of the time, because
it's deterministic.

It validates *structure* (format + checksum), not existence — no network calls, no keys,
free and open (Apache-2.0). It's the second tool in a small line of verified-data MCP tools
(the first does locale/date/currency/tax correctness).

- Repo: https://github.com/qinisolabs/veridigit
- npm: `npx -y veridigit`  (tools: validate_iban, validate_card, validate_isbn, validate_vin)
- Benchmark + method (reproducible harness): https://qinisolabs.github.io/veridigit

Caveat: the 91% is a single-model cold baseline; a multi-model run is coming. Feedback
welcome, especially on which identifier types to add next (VAT, EAN/UPC, routing numbers
are on the list).

---

## Reddit (r/mcp, r/ClaudeAI)

**Title:** I measured how often LLMs botch IBAN/card/ISBN/VIN check digits — 91%. So I built an MCP tool that doesn't.

**Body:**

Agents treat structured identifiers as if they're guessable. They're not — they have
checksums. On 32 randomly generated identifiers, a frontier model with no tool got the
check digit wrong 91% of the time, silently.

`veridigit` is a tiny, free MCP server that runs the actual algorithms (mod-97 for IBAN,
Luhn + BIN for cards, mod-10 for ISBN-13, ISO 3779 for VIN) and returns a structured result
with clear errors. Add it with `npx -y veridigit`. It's also importable as a typed TS
library. Validates structure only (no existence checks, no network, no keys, Apache-2.0).

Benchmark + reproducible harness: https://qinisolabs.github.io/veridigit
Repo: https://github.com/qinisolabs/veridigit

What identifier should it cover next — VAT numbers, EAN/UPC, bank routing/ABA?

---

## One-liner (Discord / X)

veridigit: an MCP tool that validates IBANs, cards, ISBNs and VINs with the real checksum
algorithms. LLMs alone got these ~91% wrong in a cold test; veridigit gets them right.
Free, no keys: `npx -y veridigit` · https://github.com/qinisolabs/veridigit
