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
```bash
mcp-publisher login github      # uses your kristaffa GitHub auth
mcp-publisher publish
```
Requires `kristaffa`'s org membership to be **public** (already set).

## Step 10 — GitHub Pages
Repo → Settings → Pages → Deploy from branch → `main` / `/docs` → Save.
Live at https://qinisolabs.github.io/veridigit (favicon + logo already wired).

## Step 11 — Directories
- **Glama** (glama.ai): "Add MCP Server → Server" form. Free — do NOT enter billing.
- **mcp.so**: submit the server.
- **awesome-mcp-servers** (punkpeye): PR adding, in the best category:
  `- [qinisolabs/veridigit](https://github.com/qinisolabs/veridigit) 📇 🏠 - Verified IBAN, card, ISBN-13 & VIN validation — checksums, not guesses.`
  Add the Glama score badge once indexed:
  `[![](https://glama.ai/mcp/servers/qinisolabs/veridigit/badges/score.svg)](https://glama.ai/mcp/servers/qinisolabs/veridigit)`

## Step 12 — Launch
Post `LAUNCH_POST.md` (Show HN + r/mcp + r/ClaudeAI + MCP Discord), led with the 91%
benchmark. Optionally run the multi-model API benchmark first for a stronger, multi-model
number. Use brand accounts, not personal.
