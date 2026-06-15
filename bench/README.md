# veridigit benchmark harness

Measures how often a tool-free LLM gets identifier check digits right, versus `veridigit`
(which is deterministic). Identifiers are randomly generated, so models can't have
memorised them, and ground truth is computed independently of the library under test.

## Run

Build the library first, then run:

```bash
npm run build
node bench/run.mjs 200 1     # N questions, seed
```

With no API keys, only the `veridigit` arm runs (and asserts the library matches the
independent ground truth — a correctness check). To add model rows, set any of:

```bash
export OPENAI_API_KEY=...        # OPENAI_MODEL    (default gpt-4o)
export ANTHROPIC_API_KEY=...     # ANTHROPIC_MODEL (default claude-sonnet-4-6)
export GEMINI_API_KEY=...        # GEMINI_MODEL    (default gemini-2.5-pro)
node bench/run.mjs 200 1
```

Each model is asked, tool-free and at temperature 0, to return just the check digit;
its answer is normalised and compared to ground truth. Models without a key are skipped.

## Files
- `generate.mjs` — deterministic question + ground-truth generator (seeded).
- `run.mjs` — runs the veridigit arm and any key-configured models, prints a per-category
  error table.

## Note
LLM rows are *tool-free baselines* — they show what an agent gets without veridigit. The
point of the tool is to replace that guess with the algorithm.
