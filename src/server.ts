#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { validateIban } from "./iban.js";
import { validateCard } from "./card.js";
import { validateIsbn13 } from "./isbn.js";
import { validateVin } from "./vin.js";

const server = new McpServer({ name: "veridigit", version: "0.1.0" });

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

server.tool(
  "validate_iban",
  "USE THIS to verify an IBAN (international bank account number) before relying on it — instead of guessing whether it looks right. Checks the country, the country-specific length, and the ISO 7064 mod-97 checksum, and returns the country, check digits and BBAN. Call this whenever a user supplies a bank account for a payment, payout or invoice.",
  { iban: z.string().describe("The IBAN to validate; spaces are ignored.") },
  async ({ iban }) => json(validateIban(iban))
);

server.tool(
  "validate_card",
  "USE THIS to check a payment card number's structure before using it — never assume a card number is valid or guess its brand. Verifies the Luhn checksum, detects the brand (Visa, Mastercard, Amex, Discover, Diners, JCB, UnionPay) from its BIN, and checks the length. Does NOT check whether the card is real, active or has funds.",
  { number: z.string().describe("The card number; spaces and dashes are ignored.") },
  async ({ number }) => json(validateCard(number))
);

server.tool(
  "validate_isbn",
  "USE THIS to verify an ISBN-13 book identifier instead of trusting that 13 digits are correct. Checks the 978/979 prefix and the mod-10 weighted check digit, and returns the expected check digit when it fails.",
  { isbn: z.string().describe("The ISBN-13; hyphens and spaces are ignored.") },
  async ({ isbn }) => json(validateIsbn13(isbn))
);

server.tool(
  "validate_vin",
  "USE THIS to verify a vehicle VIN before acting on it — do not assume a 17-character string is a valid VIN. Checks the allowed alphabet (no I/O/Q) and the ISO 3779 transliteration check digit in position 9, and returns the expected check digit when it fails.",
  { vin: z.string().describe("The 17-character VIN to validate.") },
  async ({ vin }) => json(validateVin(vin))
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("veridigit MCP server failed to start:", err);
  process.exit(1);
});
