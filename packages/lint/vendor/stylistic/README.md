# @stylistic (vendored)

Copied from `@stylistic/eslint-plugin@5.10.0` (MIT) by the oxlint migration's vendoring tool (`scratch/oxlint-migration/vendor/vendor.ts`, local to the migration branch for now). Do not edit these files by hand: change the tool and regenerate.
Only the rules enabled in our presets are included; they run inside oxlint as a JS plugin.

Rules (71): `array-bracket-spacing`, `arrow-parens`, `arrow-spacing`, `block-spacing`, `brace-style`, `comma-dangle`, `comma-spacing`, `comma-style`, `computed-property-spacing`, `dot-location`, `eol-last`, `generator-star-spacing`, `indent`, `indent-binary-ops`, `key-spacing`, `keyword-spacing`, `lines-between-class-members`, `max-statements-per-line`, `member-delimiter-style`, `multiline-ternary`, `new-parens`, `no-extra-parens`, `no-floating-decimal`, `no-mixed-operators`, `no-mixed-spaces-and-tabs`, `no-multi-spaces`, `no-multiple-empty-lines`, `no-tabs`, `no-trailing-spaces`, `no-whitespace-before-property`, `object-curly-spacing`, `operator-linebreak`, `padded-blocks`, `quote-props`, `quotes`, `rest-spread-spacing`, `semi`, `semi-spacing`, `space-before-blocks`, `space-before-function-paren`, `space-in-parens`, `space-infix-ops`, `space-unary-ops`, `spaced-comment`, `template-curly-spacing`, `template-tag-spacing`, `type-annotation-spacing`, `type-generic-spacing`, `type-named-tuple-spacing`, `wrap-iife`, `yield-star-spacing`, `jsx-closing-bracket-location`, `jsx-closing-tag-location`, `jsx-curly-brace-presence`, `jsx-curly-newline`, `jsx-curly-spacing`, `jsx-equals-spacing`, `jsx-first-prop-new-line`, `jsx-function-call-newline`, `jsx-indent-props`, `jsx-max-props-per-line`, `jsx-quotes`, `jsx-tag-spacing`, `jsx-wrap-multilines`, `array-bracket-newline`, `array-element-newline`, `curly-newline`, `function-call-argument-newline`, `newline-per-chained-call`, `object-curly-newline`, `object-property-newline`.

External runtime dependencies: `@eslint-community/eslint-utils` (upstream range `^4.9.1`), `@typescript-eslint/types` (upstream range `^8.56.0`), `eslint-visitor-keys` (upstream range `^4.2.1`), `espree` (upstream range `^10.4.0`), `estraverse` (upstream range `^5.3.0`).

## Local patches

- `rules/indent.js`: import the JSX entity decoder
- `rules/indent.js`: JSXText indentation: oxc leaves HTML entities undecoded in `JSXText.value`; `&nbsp;` decodes to U+00A0, which `\S` does not match
- `rules/jsx-quotes.js`: import the JSX entity decoder
- `rules/jsx-quotes.js`: oxc leaves HTML entities undecoded in JSX attribute values; decode from `raw` like typescript-estree
