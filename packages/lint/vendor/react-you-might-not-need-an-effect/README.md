# react-you-might-not-need-an-effect (vendored)

Copied from `eslint-plugin-react-you-might-not-need-an-effect@0.10.0` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (8): `no-derived-state`, `no-chain-state-updates`, `no-event-handler`, `no-adjust-state-on-prop-change`, `no-reset-all-state-on-prop-change`, `no-pass-live-state-to-parent`, `no-pass-data-to-parent`, `no-initialize-state`.

External runtime dependencies: none.

## Local patches

- `index.mjs`: Remove the globals import used only by upstream ESLint presets; the generated oxlint entry exposes rules, not those presets
- `index.mjs`: Remove upstream flat/legacy ESLint presets, which are unused by the generated rule-only entry; preserve every rule implementation
