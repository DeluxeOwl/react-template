import type { PluginSpec } from "../spec.ts"

// better-tailwindcss exports each rule through `.rule`, so use its plugin entry. It runs Tailwind in
// synckit workers whose modules it starts by computed paths: those are listed in `additionalFiles`
// (found by the tailwind batch, results/tailwind.shadow.json).
export default {
    additionalFiles: [
        "lib/async-utils/module.js",
        "lib/async-utils/path.js",
        "lib/async-utils/platform.js",
        "lib/tailwindcss/canonical-classes.async.v4.js",
        "lib/tailwindcss/class-order.async.v3.js",
        "lib/tailwindcss/class-order.async.v4.js",
        "lib/tailwindcss/conflicting-classes.async.v4.js",
        "lib/tailwindcss/context.async.v3.js",
        "lib/tailwindcss/context.async.v4.js",
        "lib/tailwindcss/custom-component-classes.async.v3.js",
        "lib/tailwindcss/custom-component-classes.async.v4.js",
        "lib/tailwindcss/dissect-classes.async.v3.js",
        "lib/tailwindcss/dissect-classes.async.v4.js",
        "lib/tailwindcss/prefix.async.v3.js",
        "lib/tailwindcss/prefix.async.v4.js",
        "lib/tailwindcss/tailwind.async.worker.v3.js",
        "lib/tailwindcss/tailwind.async.worker.v4.js",
        "lib/tailwindcss/unknown-classes.async.v3.js",
        "lib/tailwindcss/unknown-classes.async.v4.js",
        "lib/tailwindcss/variant-order.async.v3.js",
        "lib/tailwindcss/variant-order.async.v4.js",
    ],
    dir:     "better-tailwindcss",
    install: { "eslint-plugin-better-tailwindcss": "4.5.0" },
    layout:  { kind: "plugin", pluginFile: "lib/configs/config.js" },
    pkg:     "eslint-plugin-better-tailwindcss",
    prefix:  "better-tailwindcss",
} satisfies PluginSpec
