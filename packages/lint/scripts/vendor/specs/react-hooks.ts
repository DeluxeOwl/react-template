import type { PluginSpec } from "../spec.ts"

const bundle = "upstream/eslint-plugin-react-hooks.development.js"
const guardWhy = "Remove the development-only guard: the package's index.js picks this build only when NODE_ENV is not production, and we vendor only this build, so without the edit the copy would export nothing under NODE_ENV=production. The compiler and rule code are unchanged."

export default {
    dir:     "react-hooks",
    install: { "eslint-plugin-react-hooks": "7.1.1" },
    layout:  { kind: "plugin", pluginFile: "cjs/eslint-plugin-react-hooks.development.js" },
    patches: {
        [bundle]: [
            [
                `'use strict';

if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';`,
                `'use strict';

  (function() {
'use strict';`,
                guardWhy,
            ],
            [
                `module.exports = plugin;
  })();
}`,
                `module.exports = plugin;
  })();`,
                guardWhy,
            ],
        ],
    },
    pkg:    "eslint-plugin-react-hooks",
    prefix: "react-hooks",
} satisfies PluginSpec
