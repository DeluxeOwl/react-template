# Lint backport from vetsolution

## Source

The comparison uses vetsolution at `ef207e3` and react-template at `7f535fb`.
Vetsolution derives from the separate `tanstack-orpc-template` repository.
It consumes `@deluxeowl/lint@0.2.0`. React-template already contains version `0.3.0`.
The installed oxlint, ast-grep, and dprint configuration matches upstream exactly.
ESLint differs only by the provider rule added in version `0.3.0`.
All other downstream changes live in repository configuration or scripts.

## Backported changes

| Downstream change                                             | Upstream location and decision                                                                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vitest/max-expects: off` (`317f5b9`)                         | The base preset permits multiple assertions for one behavior. The full Vitest preset also applies to `*.test.tsx`.                                                  |
| `unicorn/expiring-todo-comments: off` (`1f151e3`)             | The base preset no longer requires expiry dates for TODO comments.                                                                                                  |
| `sweepit/no-useless-hook: off` (initial template)             | The React preset permits view-model hooks and React 19 `use` wrappers.                                                                                              |
| `sweepit/jsx-on-handler-verb-suffix: off` (`0846eb3`)         | The React preset accepts verb-first callbacks such as `onCreateAppointment`.                                                                                        |
| Vendored shadcn/ReUI ESLint exceptions (`0393283`, `0846eb3`) | `vendoredFiles` selects explicit paths. Type safety and return-type rules remain enabled.                                                                           |
| Vendored oxlint exceptions (same commits)                     | The opt-in `oxlint/react-vendored.json` preset covers standard vendor directories. Unsupported rule names are omitted for oxlint 1.62 compatibility.                |
| Smooth-shadow restrictions (`1ca5776`)                        | Exported as opt-in `smoothShadowRestrictions`. `additionalTailwindRestrictions` appends entries without duplicating the shared color and RTL restrictions.          |
| Phosphor barrel restriction (`9e1d721`)                       | The React oxlint preset rejects `@phosphor-icons/react` and accepts direct icon imports.                                                                            |
| Node imports in scripts, configuration, and tests             | The React oxlint preset supplies the exceptions. Browser source remains restricted.                                                                                 |
| Vendored ast-grep suppression script (`0393283`)              | The script accepts vendor directories. A shared helper groups findings and places valid JSX directives. Invalid scanner output and stale directives fail the check. |
| Workspace-local ast-grep binary                               | The root dependency and VSCode setting select the same binary.                                                                                                      |

The base preset also recognizes suffix-named `*.command.ts` and `*.query.ts` handlers used in vetsolution.
The React factory forwards the base factory options rather than replacing its parser configuration.
The monorepo web workspace selects both vendor presets and uses its actual `index.css` entry point.

## Changes that remain local

- The TanStack route export exception for `react-refresh/only-export-components` remains local.
  The monorepo web app is not a TanStack Start app.
- The `.output` ignore remains local to TanStack Start.
  The shared presets already ignore generated `*.gen.ts` files.
- The stylesheet path and installed shadow plugin remain consumer choices.
  No plugin-dependent shadow restriction is enabled by default.
- Knip entry paths and the `defineMessages` preprocessor remain tied to the application and its i18n extractor.
- The dprint configuration has no reusable downstream changes.
  The downstream `nub.lock` exclude is a typo, not a new shared rule.
- The global `--off=unused-suppression` flag is not copied.
  The improved check detects stale directives instead of hiding them.
- No shared ast-grep YAML or custom ESLint rule implementation required a downstream backport.

## Release and adoption

The shared package version is `0.4.0`, with a matching workspace lockfile entry.
The release workflow builds and publishes it after a `lint-v0.4.0` tag push.
This backport does not push the tag or publish the package.

Vetsolution remains on its published `0.2.0` dependency without configuration changes.
After publication, it can use the shared defaults, `vendoredFiles`, the vendor oxlint preset,
and `smoothShadowRestrictions` instead of its duplicated overrides.
The intervening `0.3.0` provider rule also requires validation during that upgrade.
