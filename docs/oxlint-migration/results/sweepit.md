# Sweepit migration evidence

## Verdict

- **20 migrate-port**, **2 keep-eslint**, **0 migrate-native**, **0 blocked**.
- Sweepit 0.0.23 has an MIT license. The installed `package.json:5` and `LICENSE:1–21` agree.
- All 22 enabled rules are non-fixable. Every compared `--fix` output equals its input, byte for byte.
- Every migration verdict has nonzero ESLint diagnostics from cases. No parser rejection or rule crash weakens this evidence.
- This batch changed no presets, workspace configs, dependency lists, or git state.

Paths in this document are relative to the repository root.
The oracle package root is `scratch/oxlint-migration/oracle/packages/lint/node_modules/eslint-plugin-sweepit/`.

## Per-rule proof

The single-rule column uses `--impl port` with the oracle configuration.
The two `keep-eslint` rows also use `--type-aware`.
The together column counts diagnostics for each rule across all batch cases, with types disabled.
That column does **not** prove typed behavior for the two retained rules.

| Rule (`sweepit/`)                    | Verdict      | Single ESLint/oxlint | Own cases | Together ESLint=oxlint |
| ------------------------------------ | ------------ | -------------------: | --------: | ---------------------: |
| `complexity`                         | migrate-port |                  9/9 |         8 |                      9 |
| `jsx-bem-compound-naming`            | migrate-port |                  5/5 |        15 |                      5 |
| `jsx-flat-owner-tree`                | migrate-port |                  6/6 |         7 |                     14 |
| `jsx-server-action-prop-suffix`      | migrate-port |                  6/6 |        16 |                     10 |
| `max-custom-props`                   | migrate-port |                  3/3 |         8 |                      5 |
| `no-array-props`                     | keep-eslint  |                  8/5 |        12 |                      5 |
| `no-boolean-capability-props`        | migrate-port |                  7/7 |        14 |                     11 |
| `no-componenttype-props`             | migrate-port |                  9/9 |        15 |                      9 |
| `no-custom-kebab-case-props`         | migrate-port |                  9/9 |        11 |                      9 |
| `no-element-props`                   | migrate-port |                  8/8 |        20 |                     15 |
| `no-exported-context-hooks`          | migrate-port |                  4/4 |         9 |                      4 |
| `no-handle-prefix-utils`             | migrate-port |                  6/6 |        19 |                      6 |
| `no-handler-return-type`             | migrate-port |                  8/8 |        14 |                     12 |
| `no-hook-jsx`                        | migrate-port |                10/10 |        18 |                     10 |
| `no-object-props`                    | keep-eslint  |                  9/2 |        14 |                      2 |
| `no-optional-props-without-defaults` | migrate-port |                  7/7 |        11 |                      7 |
| `no-prefixed-prop-bundles`           | migrate-port |                12/12 |        10 |                     12 |
| `no-prop-drilling`                   | migrate-port |                  2/2 |        10 |                      2 |
| `no-render-helper-functions`         | migrate-port |                  8/8 |        16 |                     13 |
| `no-return-object-repetition`        | migrate-port |                10/10 |         9 |                     10 |
| `no-set-prefix-utils`                | migrate-port |                  3/3 |         7 |                      3 |
| `no-title-case-props`                | migrate-port |                  5/5 |         7 |                      5 |

Single reports: `scratch/oxlint-migration/harness/reports/sweepit__<name>.port.json`.
The stable snapshot is `scratch/oxlint-migration/results/sweepit-single-reports.json`.
The per-rule configuration values and commands are in `scratch/oxlint-migration/results/sweepit.json`.

## Together runs

D-010 requires together runs for fixable rules. Sweepit has none, but these additional runs also prove shared execution.

| Run                               | Real | Mangled | Cases | ESLint/oxlint | Missing | Changed output |
| --------------------------------- | ---: | ------: | ----: | ------------: | ------: | -------------: |
| Initial upstream, harvested cases |   72 |     143 |   245 |       129/129 |       0 |              0 |
| Initial port, first hand cases    |   72 |     143 |   249 |       133/133 |       0 |              0 |
| Final port, seed 1                |   72 |     143 |   270 |       178/178 |       0 |              0 |
| Final port, seed 2                |   72 |     140 |   270 |       178/178 |       0 |              0 |
| Final port, seed 3                |   72 |     141 |   270 |       178/178 |       0 |              0 |
| Final port, types enabled         |   72 |       0 |   270 |       209/178 |      31 |              0 |

The typed together run has **only** `no-array-props` (3) and `no-object-props` (28) missing diagnostics.
All 20 proposed ports still match with typed ESLint enabled.
All shared messages and spans match. There are no oxlint-only diagnostics.

```sh
bun scratch/oxlint-migration/harness/parity.ts --plugin sweepit --impl port --seed 1 --show 100
bun scratch/oxlint-migration/harness/parity.ts --plugin sweepit --impl port --seed 2 --show 100
bun scratch/oxlint-migration/harness/parity.ts --plugin sweepit --impl port --seed 3 --show 100
bun scratch/oxlint-migration/harness/parity.ts --plugin sweepit --impl port --type-aware --show 100
```

Stable reports and logs: `scratch/oxlint-migration/results/sweepit-together-seed-{1,2,3}.{json,log}` and `sweepit-together-typed.{json,log}`.
The harness overwrites `harness/reports/together-sweepit.json` on each run. The stable files preserve every final run.

## Why two rules stay in ESLint

### `sweepit/no-array-props`

The rule reads parser services at oracle `dist/index.js:1895–1897`.
Its checker path at `:1947–1949` detects types that the AST path does not resolve.
Oxlint JS plugins receive no parser services, even with `--type-aware`.

Both upstream and port probes produced **8 ESLint / 5 oxlint**, with **3 missing diagnostics**:

- `harness/cases/sweepit__no-array-props/apps/web/__parity__/typed-array-alias.tsx:1`: a forward `Items` alias.
- The same file at `:3`: `ReturnType<typeof getItems>`.
- `harness/cases/sweepit__no-array-props/apps/web/__parity__/imported-array-type.tsx:2`: an imported `ExternalItems` alias.

These case paths start with `scratch/oxlint-migration/`.
The imported definition exists beside the consumer and both files enter the typed sandbox.
A local alias patch cannot recover imported declarations or general inferred/utility types.
There is no native candidate. An AST-only port changes the configured behavior.

```sh
bun scratch/oxlint-migration/harness/parity.ts sweepit/no-array-props --impl upstream --type-aware --show 50
bun scratch/oxlint-migration/harness/parity.ts sweepit/no-array-props --impl port --type-aware --show 50
```

### `sweepit/no-object-props`

The rule reads parser services at oracle `dist/index.js:1747–1749`.
Its checker path at `:1776–1778` detects aliases, imported interfaces, and standard-library objects.
The AST-only path at `:1782–1794` does not resolve property aliases.

Both upstream and port probes produced **9 ESLint / 2 oxlint**, with **7 missing diagnostics**:

- Two original upstream cases: `upstream-0009.tsx:1` (`UserRow`) and `upstream-0010.tsx:1` (`Config`).
- Four hand-case diagnostics: `typed-object-alias.tsx:2,4,5` (`UserRow`, `Config`, `Date`, and `Map`).
- One imported interface: `imported-object-type.tsx:2` (`ExternalUserRow`).

These files are under `scratch/oxlint-migration/harness/cases/sweepit__no-object-props/apps/web/__parity__/`.
The `ref` ignore and built-in `style` exclusion remain correct on both sides.
The typed together run adds 21 more missing diagnostics for React element/node type branches from other rules' cases.
There is no native candidate. A syntax patch cannot recover these checker results.

```sh
bun scratch/oxlint-migration/harness/parity.ts sweepit/no-object-props --impl upstream --type-aware --show 50
bun scratch/oxlint-migration/harness/parity.ts sweepit/no-object-props --impl port --type-aware --show 50
```

Full probe reports and code frames: `scratch/oxlint-migration/results/sweepit-typed-probes.json`.
The first local-type probes missed 2 array and 6 object diagnostics. Imported-type cases increased those counts to 3 and 7.

## Source, cases, and vendoring

### Provenance

The installed version is **0.0.23**, with `gitHead` `c2c1b5c418aee03c93ad90593fdaee3c734a1f9d` (`package.json:45`).
The public repository has no `v0.0.23` tag. Fetching that commit returned `not our ref`.
The clone is therefore pinned to **v0.0.22**, commit `6ae0f2ad53be3146620cf9a7a4ccc001c0122f2a`.

I compiled every enabled v0.0.22 rule and compared its AST with the installed 0.0.23 bundle.
All **22/22** match after normalization of bundler variable names, declaration kinds, and export boilerplate.
No runtime rule code comes from the fallback tag. Vendoring always copies the installed 0.0.23 bundle.

- Clone: `scratch/oxlint-migration/upstream/sweepit/`.
- Provenance result/script: `scratch/oxlint-migration/results/sweepit-source-provenance.{json,mjs}`.
- Upstream tests: `upstream/sweepit/packages/eslint-plugin-sweepit/test/rules/<name>.test.ts`, under `scratch/oxlint-migration/`.
- Harvest: **249 snippets → 245 unique parseable cases**, with zero skipped parse failures.
- Final corpus: **270 cases**, including option boundaries and imported-type counterexamples.
- Harvest log: `scratch/oxlint-migration/results/sweepit-harvest.log`.

### Port

- Spec: `scratch/oxlint-migration/vendor/specs/sweepit.ts`.
- Generated entry/bundle: `packages/lint/vendor/sweepit/index.{js,cjs}`.
- Attribution: `packages/lint/vendor/sweepit/LICENSE`.
- Regeneration: `bun scratch/oxlint-migration/vendor/vendor.ts sweepit`.

The spec removes upstream config constructors and their eager imports of five third-party ESLint plugins.
It also removes five rules absent from the inventory.
It uses `dist/index.cjs` because the generated wrapper itself is named `index.js`.
No rule-body behavior patch was necessary.

Actual remaining external imports are **`typescript`** and Node's **`path`** (`index.cjs:1266,2136`).
TypeScript is already a peer dependency.
The two non-portable rule definitions remain in the generated inventory-based bundle for repeatable probes.
They are **not** migration targets and must remain disabled in the oxlint preset.
A later trimming pass can remove them after the generator supports an explicit rule exclusion.

### Non-vacuity and options

- `complexity`: upstream cases use `max:4`, but this repo uses `max:10`. Initial harvested parity was vacuous.
  Hand cases cover complexity 10/11, PascalCase exemption, modified switches, optional/logical operators, nested functions, and class initialization paths.
  The upstream code-path listeners at oracle `dist/index.js:3915,3944` work in oxlint.
- BEM naming: the rule infers a block from `context.filename` (`dist/index.js:2966`).
  Harvested filenames lost the `button-group` stem. Actual `button-group.tsx` cases now produce five matching diagnostics.
  Named/default exports, aliases, overlapping prefixes, compliant names, `index.tsx`, and re-exports have coverage.
- Optional defaults: source `dist/index.js:2126–2296` uses syntax only, despite older README accuracy wording.
  Cases cover local/inline types, parameter defaults, inherited-prop exemption, and `ignore:[on*,ref,render]`.
- Boolean capabilities: cases cover `ignore:[asChild]`, `ignoreNativeBooleanProps:true`, associated handlers, and quoted keys.
- Prop drilling: cases cover `allowedDepth:1`, `ignorePropsSpread:true`, renamed/defaulted bindings, local ownership, and `children`.
- Repeated returns: extra cases cover `minSharedKeys:3`, ratio `0.7`, nested keys, and isolation between functions.
- Contract/name rules also include quoted keys, JSX namespaces, Unicode names, and handler references where applicable.

The 20 ported rules use their original `sweepit/` ids.
Existing directives at `packages/lint/src/custom/no-margin-on-root-jsx.ts:128` and `prefer-state-class.ts:2` need no rename.

## Orchestrator notes

The JSON contains exact values for all 20 ports.
`complexity` and `no-return-object-repetition` apply to the base configuration too.
The other 18 migrated rules belong to the React configuration.

The ESLint generated-UI override also disables four migrated rules (`packages/lint/src/react.ts:64–70`):
`complexity`, `jsx-bem-compound-naming`, `no-boolean-capability-props`, and `no-prop-drilling`.
Those exemptions must move to the matching oxlint generated-UI override.
The harness uses the current web workspace configuration (`apps/web/eslint.config.ts:15`).
That configuration exempts `ui/components/ui/**` and `ui/hooks/**`. Cases use `__parity__` paths and remain outside those exemptions.

## Harness requests

These requests do not block the 20 ports. The evidence uses workarounds.

1. **Preserve upstream filename stems during harvest.** `harvest.ts:205–215` keeps only the extension and writes `upstream-N.tsx`.
   This made BEM naming vacuous. Real workspace case directories supplied the required stem.
   `caseCorpus` also does not interpret the playbook's `// parity-path:` marker (`lib/corpus.ts:60–68`).
   Support the marker or document workspace directories as the required path mechanism.
2. **Calculate runtime dependencies after patches.** `vendor/vendor.ts:185–186` scans before patches at `:214–224`.
   The generated README incorrectly lists the five removed plugin imports (`README.md:9`).
   No corresponding imports remain in the bundle. Node built-ins also need exclusion from the dependency list.
3. **Allow explicit rule exclusions in a plugin spec.** The generator exposes every inventory rule (`vendor.ts:200–201`).
   This retains the two rejected typed definitions. Removing only their source bodies makes generated rule entries undefined.
   An exclusion field can trim them without a hand edit or an inventory change.

## Proposed facts for the living document

- **F-new — Sweepit has two optional checker paths that are mandatory for parity.**
  `no-array-props` and `no-object-props` work without types, but miss imported/derived types that ESLint currently detects.
  `requiresTypes:false` does not imply syntax-only behavior. `--impl upstream --type-aware` proves these gaps.
- **F-new — Oxlint supports Sweepit's code-path complexity listeners.**
  Functions, PascalCase exemptions, class field initializers, static blocks, and modified-switch counting match ESLint on non-vacuous cases.

## Remaining uncertainty

There is no unresolved behavior divergence for the 20 ports.
The public 0.0.23 source commit is unavailable, but all copied runtime code comes from the pinned installed package.
The normalized source comparison and original tests provide the fallback provenance.
The generated README dependency list needs the generator correction above.
