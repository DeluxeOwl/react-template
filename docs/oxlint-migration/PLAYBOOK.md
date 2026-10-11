# Rule-migration playbook (for batch agents)

You migrate a **batch** of ESLint rules to oxlint, or prove a rule cannot be migrated. The orchestrator applies the results to the presets and commits; you produce **evidence** and a **verdict** per rule.

Read first: `docs/oxlint-migration.md` §0 (goal), §4 (decisions D-001, D-007, D-008, D-009, D-010, D-013, D-014), §5 (facts F-001…F-026 — oxlint quirks already found), §7 (harness usage). Repo rules: `AGENTS.md`.

## The bar (D-001)

A rule is **migrated** when the harness shows, against ESLint with the repo's own options: the same diagnostics (rule + span; messages too for ports), and byte-identical `--fix` output, on the real corpus, the mangled corpus and the rule's cases — and the result is **not vacuous**: ESLint reported ≥ 1 diagnostic, and for a fixable rule ≥ 1 file changed. "Fixable" means the rule produces autofixes under the repo's options: a rule that only offers suggestions is not, because `eslint --fix` never applies suggestions and our oxlint scripts don't pass `--fix-suggestions` — for it, ≥ 1 diagnostic plus "0 changed files on both sides" is the complete proof. A third-party ESLint plugin may not stay in the final config, not even through `jsPlugins`; its code may be vendored (copied, license kept) instead.

## Per rule — steps

1. **Know the rule.** `scratch/oxlint-migration/inventory/inventory.json` has its options per config class, `meta` (fixable, type info), and native oxlint candidates. Read the upstream source (installed in `scratch/oxlint-migration/oracle/packages/lint/node_modules/<pkg>`) and docs. For a native candidate read the oxlint rule docs (`docs_url` in `node_modules/.bin/oxlint --rules --format=json`) and, if behaviour is unclear, its source (oxc repo, tag `oxlint_v1.86.0`, `crates/oxc_linter/src/rules/...`).
2. **Get cases.** Harvest the upstream tests: `bun scratch/oxlint-migration/harness/harvest.ts <rule-id> <upstream test file>... [--test-file]` (use `--test-file` for rules that only apply to test files). Upstream repos are cloned under `scratch/oxlint-migration/upstream/<repo>`; clone the one you need there at the **installed version's tag** (`git clone --depth 1 --branch <tag> <url> scratch/oxlint-migration/upstream/<repo>`) if it is missing. typescript-eslint v8.59.1 is already there. If the shim cannot run a test file, write cases by hand in `scratch/oxlint-migration/harness/cases/<rule-key>/` (`/` in the id → `__`; first line `// parity-path: apps/web/__parity__/x.tsx` picks the virtual path; a sub-directory layout `cases/<rule-key>/<workspace path>/<file>` works too) — cover every option the repo uses and the fixable paths. Harvested files are named `upstream-N.<ext>`: rules that read `context.filename` need hand cases with real file names.
3. **Run parity.** `bun scratch/oxlint-migration/harness/parity.ts <rule-id> --impl native|port|upstream [--type-aware] [--oxlint-config '<json>']`. Native first when a candidate exists. `--oxlint-config` sets the oxlint rule's config when its option names differ from ESLint's (that value is what goes into the preset). Type-aware rules need `--type-aware` (sandbox; slower).
   **Optional type use:** the repo's real ESLint run always has type information, and some rules not marked type-aware still use the checker when it is there (sweepit `no-array-props`/`no-object-props` report more with types). Grep the upstream source for `parserServices`, `getParserServices`, `getTypeChecker`, `program`, `esTreeNodeToTSNodeMap`; if any is used, the final evidence must be a `--type-aware` run (ESLint with types vs oxlint).
4. **Read the result.** PASS + non-vacuous → verdict. FAIL → open the report (`harness/reports/<rule-key>.<impl>.json`, `--show <n>` for more code frames) and find the **cause**: option mapping, a real native-rule difference, parser difference (F-013/F-014), fix-order (F-016/F-017), or a harness artefact. Try the next implementation (native → port). Record every attempt with its numbers.
5. **Port when native fails or does not exist** (non-type-aware rules only — JS plugins get no type information): add `scratch/oxlint-migration/vendor/specs/<dir>.ts` (see `specs/types.ts` and `specs/stylistic.ts`; `<dir>` = prefix without `@`, `/` → `-`), run `bun scratch/oxlint-migration/vendor/vendor.ts <prefix>`, then `parity.ts --impl port`. Fix oxlint incompatibilities with **patches in the spec** (search/replace + why), never by editing vendored files. Check the upstream license allows copying (MIT/ISC/BSD/Apache: yes; none/unknown: verdict `blocked`). Reserved plugin names (F-006) get the alias `<dir>-js` automatically in the harness; list the repo's `eslint-disable` comments that name such rules (`git grep -n "<rule-id>"`).
6. **Together run (fixable rules, D-010).** When ≥ 2 rules of your batch are fixable and run on the same files, run them together: `parity.ts <id> <id>… --impl …` (or `--plugin <prefix>`), plus 2 extra seeds (`--seed 2`, `--seed 3`).

A rule is done when it has a verdict below with the evidence filled in.

## Verdicts

- `migrate-native` — oxlint's own rule, with the exact preset value (`"typescript/x": ["error", {...}]`).
- `migrate-port` — vendored rule (spec file + vendored dir exist, parity PASS with `--impl port`).
- `keep-eslint` — not portable after trying; say exactly why (e.g. needs type information and oxlint has no native rule; behaviour differs in a way no option/patch fixes — show the case).
- `blocked` — you could not finish (license, harness limitation, oxc parse bug…): what is missing and what you tried.

## Rules for working in parallel

- Do **not** edit: `packages/lint/src/**`, any `eslint.config.ts`/`oxlint.config.ts`, `docs/oxlint-migration.md`, `scratch/oxlint-migration/harness/lib/**`, `harness/parity.ts`, `harness/batch.ts`, `vendor/vendor.ts`, `packages/lint/vendor/_compat/**`, other batches' files. Do not commit, do not run `bun install`/`bun add`, do not touch git state.
- You may write: `harness/cases/<your rules>/`, `vendor/specs/<your plugin>.ts`, `packages/lint/vendor/<your plugin>/` (through vendor.ts only), `upstream/<repo you clone>`, `results/<batch>.*`, temp files under `/tmp`.
- If the harness is wrong or missing a capability, do not patch it: write the evidence under "Harness requests" in your result and continue with the other rules.
- Other agents run the harness at the same time; runs are independent (temp dirs). A run can be slow under load — that is not a failure.

## Output

`scratch/oxlint-migration/results/<batch>.json` — an array, one object per rule:

```json
{
    "rule": "@typescript-eslint/array-type",
    "verdict": "migrate-native",
    "oxlint": {
        "rule": "typescript/array-type",
        "value": ["error", { "default": "array-simple" }],
        "typeAware": false,
        "jsPlugin": null
    },
    "evidence": {
        "impl": "native",
        "command": "bun …/parity.ts … ",
        "corpus": "real 71, mangled 141, cases 120",
        "eslintDiagnostics": 57,
        "oxlintDiagnostics": 57,
        "changedFiles": "40/40",
        "maxPasses": 1,
        "report": "harness/reports/…json"
    },
    "attempts": [
        "native with ESLint options: FAIL — …",
        "native with --oxlint-config …: PASS"
    ],
    "directives": [],
    "notes": "…"
}
```

`jsPlugin` for ports: `{ "name": "<alias>", "specifier": "packages/lint/vendor/<dir>/index.js" }`.

`scratch/oxlint-migration/results/<batch>.md` — short human summary: table (rule, verdict, numbers), every non-trivial finding (with file paths and line numbers), anything uncertain, harness requests. Findings that are new facts about oxlint get a proposed `F-` text the orchestrator can paste into §5.
