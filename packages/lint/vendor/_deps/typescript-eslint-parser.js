import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import {
  __commonJS,
  __require,
  __toESM
} from "./chunk-WPQ5MXLX.js";

// node_modules/@typescript-eslint/parser/dist/parser.js
var require_parser = __commonJS({
  "node_modules/@typescript-eslint/parser/dist/parser.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = parse2;
    exports.parseForESLint = parseForESLint2;
    var scope_manager_1 = __require("@typescript-eslint/scope-manager");
    var typescript_estree_1 = __require("@typescript-eslint/typescript-estree");
    var visitor_keys_1 = __require("@typescript-eslint/visitor-keys");
    var debug_1 = __importDefault(__require("debug"));
    var typescript_1 = __require("typescript");
    var log = (0, debug_1.default)("typescript-eslint:parser:parser");
    function validateBoolean(value, fallback = false) {
      if (typeof value !== "boolean") {
        return fallback;
      }
      return value;
    }
    var LIB_FILENAME_REGEX = /lib\.(.+)\.d\.[cm]?ts$/;
    function getLib(compilerOptions) {
      if (compilerOptions.lib) {
        return compilerOptions.lib.map((lib) => LIB_FILENAME_REGEX.exec(lib.toLowerCase())?.[1]).filter((lib) => !!lib);
      }
      const defaultTarget = typescript_estree_1.typescriptVersionIsAtLeast["6.0"] ? typescript_1.ScriptTarget.LatestStandard : typescript_1.ScriptTarget.ES5;
      const target = compilerOptions.target ?? defaultTarget;
      switch (target) {
        case typescript_1.ScriptTarget.ES2015:
          return ["es6"];
        case typescript_1.ScriptTarget.ES2016:
          return ["es2016.full"];
        case typescript_1.ScriptTarget.ES2017:
          return ["es2017.full"];
        case typescript_1.ScriptTarget.ES2018:
          return ["es2018.full"];
        case typescript_1.ScriptTarget.ES2019:
          return ["es2019.full"];
        case typescript_1.ScriptTarget.ES2020:
          return ["es2020.full"];
        case typescript_1.ScriptTarget.ES2021:
          return ["es2021.full"];
        case typescript_1.ScriptTarget.ES2022:
          return ["es2022.full"];
        case typescript_1.ScriptTarget.ES2023:
          return ["es2023.full"];
        case typescript_1.ScriptTarget.ES2024:
          return ["es2024.full"];
        case typescript_1.ScriptTarget.ES2025:
          return ["es2025.full"];
        case typescript_1.ScriptTarget.ESNext:
          return ["esnext.full"];
        default:
          return ["lib"];
      }
    }
    function parse2(code, options) {
      return parseForESLint2(code, options).ast;
    }
    function parseForESLint2(code, parserOptions) {
      if (!parserOptions || typeof parserOptions !== "object") {
        parserOptions = {};
      } else {
        parserOptions = { ...parserOptions };
      }
      if (parserOptions.sourceType !== "module" && parserOptions.sourceType !== "script") {
        parserOptions.sourceType = "script";
      }
      if (typeof parserOptions.ecmaFeatures !== "object") {
        parserOptions.ecmaFeatures = {};
      }
      const warnOnUnsupportedTypeScriptVersion = validateBoolean(parserOptions.warnOnUnsupportedTypeScriptVersion, true);
      const tsestreeOptions = {
        jsx: validateBoolean(parserOptions.ecmaFeatures.jsx),
        ...!warnOnUnsupportedTypeScriptVersion && { loggerFn: false },
        ...parserOptions,
        // Override errorOnTypeScriptSyntacticAndSemanticIssues and set it to false to prevent use from user config
        // https://github.com/typescript-eslint/typescript-eslint/issues/8681#issuecomment-2000411834
        errorOnTypeScriptSyntacticAndSemanticIssues: false,
        // comment, loc, range, and tokens should always be set for ESLint usage
        // https://github.com/typescript-eslint/typescript-eslint/issues/8347
        comment: true,
        loc: true,
        range: true,
        tokens: true
      };
      const analyzeOptions = {
        globalReturn: parserOptions.ecmaFeatures.globalReturn,
        jsxFragmentName: parserOptions.jsxFragmentName,
        jsxPragma: parserOptions.jsxPragma,
        lib: parserOptions.lib,
        sourceType: parserOptions.sourceType
      };
      const { ast, services } = (0, typescript_estree_1.parseAndGenerateServices)(code, tsestreeOptions);
      ast.sourceType = parserOptions.sourceType;
      if (services.program) {
        const compilerOptions = services.program.getCompilerOptions();
        if (analyzeOptions.lib == null) {
          analyzeOptions.lib = getLib(compilerOptions);
          log("Resolved libs from program: %o", analyzeOptions.lib);
        }
        if (
          // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
          analyzeOptions.jsxPragma === void 0 && compilerOptions.jsxFactory != null
        ) {
          const factory = compilerOptions.jsxFactory.split(".")[0].trim();
          analyzeOptions.jsxPragma = factory;
          log("Resolved jsxPragma from program: %s", analyzeOptions.jsxPragma);
        }
        if (
          // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
          analyzeOptions.jsxFragmentName === void 0 && compilerOptions.jsxFragmentFactory != null
        ) {
          const fragFactory = compilerOptions.jsxFragmentFactory.split(".")[0].trim();
          analyzeOptions.jsxFragmentName = fragFactory;
          log("Resolved jsxFragmentName from program: %s", analyzeOptions.jsxFragmentName);
        }
      }
      const scopeManager = (0, scope_manager_1.analyze)(ast, analyzeOptions);
      services.emitDecoratorMetadata ??= parserOptions.emitDecoratorMetadata === true;
      services.experimentalDecorators ??= parserOptions.experimentalDecorators === true;
      services.isolatedDeclarations ??= parserOptions.isolatedDeclarations === true;
      return { ast, scopeManager, services, visitorKeys: visitor_keys_1.visitorKeys };
    }
  }
});

// node_modules/@typescript-eslint/parser/package.json
var require_package = __commonJS({
  "node_modules/@typescript-eslint/parser/package.json"(exports, module) {
    module.exports = {
      name: "@typescript-eslint/parser",
      version: "8.59.1",
      description: "An ESLint custom parser which leverages TypeScript ESTree",
      files: [
        "dist",
        "!**/*.tsbuildinfo",
        "README.md",
        "LICENSE"
      ],
      type: "commonjs",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          default: "./dist/index.js"
        },
        "./package.json": "./package.json"
      },
      engines: {
        node: "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      repository: {
        type: "git",
        url: "https://github.com/typescript-eslint/typescript-eslint.git",
        directory: "packages/parser"
      },
      bugs: {
        url: "https://github.com/typescript-eslint/typescript-eslint/issues"
      },
      homepage: "https://typescript-eslint.io/packages/parser",
      license: "MIT",
      keywords: [
        "ast",
        "ecmascript",
        "javascript",
        "typescript",
        "parser",
        "syntax",
        "eslint"
      ],
      peerDependencies: {
        eslint: "^8.57.0 || ^9.0.0 || ^10.0.0",
        typescript: ">=4.8.4 <6.1.0"
      },
      dependencies: {
        debug: "^4.4.3",
        "@typescript-eslint/types": "8.59.1",
        "@typescript-eslint/scope-manager": "8.59.1",
        "@typescript-eslint/typescript-estree": "8.59.1",
        "@typescript-eslint/visitor-keys": "8.59.1"
      },
      devDependencies: {
        "@vitest/coverage-v8": "^4.0.18",
        eslint: "^10.0.0",
        glob: "^11.1.0",
        rimraf: "^5.0.10",
        typescript: ">=4.8.4 <6.1.0",
        vitest: "^4.0.18"
      },
      funding: {
        type: "opencollective",
        url: "https://opencollective.com/typescript-eslint"
      },
      nx: {
        name: "parser",
        includedScripts: [
          "clean"
        ],
        targets: {
          lint: {
            command: "eslint"
          }
        }
      },
      scripts: {
        build: "pnpm exec nx build",
        clean: "rimraf dist/ coverage/",
        format: "pnpm -w run format",
        lint: "pnpm -w exec nx lint",
        test: "pnpm -w exec nx test",
        typecheck: "pnpm -w exec nx typecheck"
      }
    };
  }
});

// node_modules/@typescript-eslint/parser/dist/index.js
var require_dist = __commonJS({
  "node_modules/@typescript-eslint/parser/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.meta = exports.version = exports.withoutProjectParserOptions = exports.createProgram = exports.clearCaches = exports.parseForESLint = exports.parse = void 0;
    var parser_1 = require_parser();
    Object.defineProperty(exports, "parse", { enumerable: true, get: function() {
      return parser_1.parse;
    } });
    Object.defineProperty(exports, "parseForESLint", { enumerable: true, get: function() {
      return parser_1.parseForESLint;
    } });
    var typescript_estree_1 = __require("@typescript-eslint/typescript-estree");
    Object.defineProperty(exports, "clearCaches", { enumerable: true, get: function() {
      return typescript_estree_1.clearCaches;
    } });
    Object.defineProperty(exports, "createProgram", { enumerable: true, get: function() {
      return typescript_estree_1.createProgram;
    } });
    Object.defineProperty(exports, "withoutProjectParserOptions", { enumerable: true, get: function() {
      return typescript_estree_1.withoutProjectParserOptions;
    } });
    exports.version = require_package().version;
    exports.meta = {
      name: "typescript-eslint/parser",
      version: exports.version
    };
  }
});

// inlined:@typescript-eslint/parser
var upstream = __toESM(require_dist());
var { clearCaches, createProgram, meta, parse, parseForESLint, version, withoutProjectParserOptions } = upstream;
export {
  clearCaches,
  createProgram,
  meta,
  parse,
  parseForESLint,
  version,
  withoutProjectParserOptions
};
