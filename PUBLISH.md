# veridigit — publish checklist (Steps 7–12)

Run from the `veridigit/` repo root, logged into the **brand** accounts (`qinisolabs` on
npm + GitHub). These steps need your credentials/2FA, so they're done by hand.

## Step 7 — Publish to npm

> Note: install dependencies **on this machine** — never reuse a `node_modules` copied
> from another OS (esbuild/tsx ship per-platform native binaries). If you see an esbuild
> "installed for another platform" error, run `rm -rf node_modules package-lock.json`
> then `npm install`.

Run one line at a time (no trailing comments — zsh would treat them as arguments):
```bash
npm whoami
npm install
npm run build
npm test
npm pack --dry-run
npm publish --access public
```
Expect `npm whoami` to print `qinisolabs` (else `npm login`); `npm test` to be 37/37
green; `npm pack --dry-run` to list only `dist/ data/ README LICENSE`; and the 2FA passkey
to prompt on publish. npm versions are permanent — bump the version for any change.

## Step 8 — GitHub repo + push
```bash
git init
git config user.name  "Qiniso"
git config user.email "qinisolabs@gmail.com"   # per-repo, NOT --global
git add .
git commit -m "Initial commit: veridigit"
git branch -M main
gh repo create qinisolabs/veridigit --source=. --remote=origin --push --public \
  --description "Verified IBAN, card, ISBN-13 & VIN validation for AI agents — checksums, not guesses."
```

## Step 9 — Official MCP Registry
`server.json` is already on the 2025-12-11 schema and its `name` matches `package.json`'s
`mcpName` (`io.github.qinisolabs/veridigit`). Re-check the registry quickstart for any
newer schema, then:
Run one line at a time:
```bash
mcp-publisher --help
mcp-publisher login github
mcp-publisher publish
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.qinisolabs/veridigit"
```
`login github` is a device-code flow — authenticate as **`kristaffa`** (the org owner).
Publishing under `io.github.qinisolabs/` works because `kristaffa`'s org membership is
**public** (already set). The final `curl` should return the server's metadata. If you see
"You do not have permission to publish this server", you authed with the wrong GitHub
account — re-run `login github` as `kristaffa`.

## Step 10 — GitHub Pages
Repo → Settings → Pages → Deploy from branch → `main` / `/docs` → Save.
Live at https://qinisolabs.github.io/veridigit (favicon + logo already wired).

## Step 11 — Directories
- **Glama** (glama.ai): "Add MCP Server" → **Server** tab (not Connector). Free — do NOT
  enter billing on later screens.
  - Name: `veridigit`
  - Description: `Verified validation of structured identifiers — IBAN, payment cards, ISBN-13 and VIN — for AI agents. Runs the real checksum algorithms (mod-97, Luhn, mod-10, ISO 3779) instead of letting the model guess, and returns structured results with clear errors.`
  - GitHub Repository URL: `https://github.com/qinisolabs/veridigit`
  - Submit for Review (submissions are reviewed before going public).
- **mcp.so** ✅ submitted (status "created" = pending review). Submit form values used:
  - Type `MCP Server`, Name `veridigit`, GitHub `https://github.com/qinisolabs/veridigit`
  - Server Config: `{"mcpServers":{"veridigit":{"command":"npx","args":["-y","veridigit"]}}}`
  - Tags: `validation,iban,credit-card,isbn,vin,checksum,fintech,identifiers`
  - Avatar URL: `https://qinisolabs.github.io/veridigit/logo.svg`
  - Content: condensed README (benchmark + tools + install).
- **Smithery** (smithery.ai): NOTE the "Publish → servers/new" form asks for a hosted HTTP
  URL — that's the *remote-server* path and does NOT apply to a local stdio package. For
  veridigit use the local-stdio route instead:
  1. `smithery.yaml` (in repo root) declares the stdio start command (`npx -y veridigit`,
     no config). Already added.
  2. Commit + push it, then on Smithery connect/authorize the GitHub `qinisolabs` org and
     claim/select `qinisolabs/veridigit`.
  3. Open the **Deployments** tab on the server's Smithery page to list it.
  (Since veridigit is also in the official MCP Registry, Smithery may ingest it passively.)
  localecheck used this directory too.
- **awesome-mcp-servers** (punkpeye): PR adding, in the best category:
  `- [qinisolabs/veridigit](https://github.com/qinisolabs/veridigit) 📇 🏠 - Verified IBAN, card, ISBN-13 & VIN validation — checksums, not guesses.`
  Add the Glama score badge once indexed:
  `[![](https://glama.ai/mcp/servers/qinisolabs/veridigit/badges/score.svg)](https://glama.ai/mcp/servers/qinisolabs/veridigit)`

## Step 12 — Launch
Post `LAUNCH_POST.md` (Show HN + r/mcp + r/ClaudeAI + MCP Discord), led with the 91%
benchmark. Optionally run the multi-model API benchmark first for a stronger, multi-model
number. Use brand accounts, not personal.
