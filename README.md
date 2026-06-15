# veridigit

**Verified validation of structured identifiers for AI agents — checksums, not guesses.**

LLMs cheerfully accept malformed IBANs, mistype card check digits, invent ISBN and VIN
check digits, and guess a card's brand wrong. `veridigit` gives an agent a deterministic,
authoritative answer instead: it runs the real checksum algorithms and returns structured
results with the parsed parts and clear error reasons.

It ships as **both** an MCP server (for agents to call live) and a typed TypeScript
library (for apps to import).

Supported in v1:

- **IBAN** — ISO 7064 mod-97 checksum + country-specific length, for 75+ countries.
- **Payment cards** — Luhn (ISO/IEC 7812) checksum, brand detection from the BIN
  (Visa, Mastercard, Amex, Discover, Diners, JCB, UnionPay), and length rules.
- **ISBN-13** — 978/979 prefix and mod-10 weighted check digit.
- **VIN** — ISO 3779 alphabet (no I/O/Q) and the position-9 transliteration check digit.

## Why

On 32 randomly generated, non-memorised identifiers, a frontier model with no tool got the
check digit **wrong 91% of the time** — IBAN 100%, VIN 100%, ISBN-13 88%, card/Luhn 75% —
versus **0%** for `veridigit`. The failure is invisible: the model returns a confident,
well-formatted answer that happens to be wrong. `veridigit` replaces the guess with the
algorithm.

Benchmark and reproducible harness: **https://qinisolabs.github.io/veridigit**

> The 91% figure is a single-model, cold (no-tool) baseline; a broader multi-model run is
> in progress.

## Use as an MCP server

```jsonc
// in your MCP client config
{
  "mcpServers": {
    "veridigit": { "command": "npx", "args": ["-y", "veridigit"] }
  }
}
```

Tools exposed: `validate_iban`, `validate_card`, `validate_isbn`, `validate_vin`.

## Use as a library

```bash
npm install veridigit
```

```ts
import { validateIban, validateCard, validateIsbn13, validateVin } from "veridigit";

validateIban("GB82 WEST 1234 5698 7654 32");
// { valid: true, countryCode: "GB", country: "United Kingdom", checkDigits: "82", ... }

validateCard("4111 1111 1111 1111");
// { valid: true, luhnValid: true, brand: "Visa", lengthValid: true, ... }

validateIsbn13("978-0-306-40615-7"); // { valid: true, type: "ISBN-13", checkDigit: "7", ... }
validateVin("1HGCM82633A004352");    // { valid: true, checkDigit: "3", ... }
```

Helper exports are also available: `ibanCheckDigits`, `luhnValid`, `luhnCheckDigit`,
`detectBrand`, `isbn13CheckDigit`, `vinCheckDigit`, `supportedIbanCountries`.

## Scope

`veridigit` validates the **structure** of an identifier — its format and checksum. It
does **not** confirm that a bank account, card, book or vehicle actually exists, is active,
or belongs to anyone. It performs no network calls.

## Development

```bash
npm install
npm run build   # tsc -> dist/
npm test        # parity/known-answer tests via tsx
```

The curated reference data (IBAN country specs, card BIN ranges) lives in `data/`.

## License

Apache-2.0
