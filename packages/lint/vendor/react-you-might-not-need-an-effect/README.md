# react-you-might-not-need-an-effect (vendored)

Copied from `eslint-plugin-react-you-might-not-need-an-effect@0.10.0` (MIT) by `packages/lint/scripts/vendor/vendor.ts`. Do not edit these files by hand: change the spec (`scripts/vendor/specs/react-you-might-not-need-an-effect.ts`) or the tool, and run `bun run vendor react-you-might-not-need-an-effect` in packages/lint.
The upstream plugin is a single bundle, copied whole; index.js exposes only the rules enabled in our presets. They run inside oxlint as a JS plugin.

Rules (8): `no-derived-state`, `no-chain-state-updates`, `no-event-handler`, `no-adjust-state-on-prop-change`, `no-reset-all-state-on-prop-change`, `no-pass-live-state-to-parent`, `no-pass-data-to-parent`, `no-initialize-state`.

External runtime dependencies: none.

## Local patches

- `index.mjs`: Remove the globals import used only by upstream ESLint presets; the generated oxlint entry exposes rules, not those presets
- `index.mjs`: Remove upstream flat/legacy ESLint presets, which are unused by the generated rule-only entry; preserve every rule implementation
