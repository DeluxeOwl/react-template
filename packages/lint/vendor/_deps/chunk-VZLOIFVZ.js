import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import {
  __commonJS
} from "./chunk-WPQ5MXLX.js";

// node_modules/@typescript-eslint/utils/dist/eslint-utils/deepMerge.js
var require_deepMerge = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/eslint-utils/deepMerge.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isObjectNotArray = isObjectNotArray;
    exports.deepMerge = deepMerge;
    function isObjectNotArray(obj) {
      return typeof obj === "object" && obj != null && !Array.isArray(obj);
    }
    function deepMerge(first = {}, second = {}) {
      const keys = /* @__PURE__ */ new Set([...Object.keys(first), ...Object.keys(second)]);
      return Object.fromEntries([...keys].map((key) => {
        const firstHasKey = key in first;
        const secondHasKey = key in second;
        const firstValue = first[key];
        const secondValue = second[key];
        let value;
        if (firstHasKey && secondHasKey) {
          if (isObjectNotArray(firstValue) && isObjectNotArray(secondValue)) {
            value = deepMerge(firstValue, secondValue);
          } else {
            value = secondValue;
          }
        } else if (firstHasKey) {
          value = firstValue;
        } else {
          value = secondValue;
        }
        return [key, value];
      }));
    }
  }
});

// node_modules/@typescript-eslint/utils/dist/eslint-utils/applyDefault.js
var require_applyDefault = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/eslint-utils/applyDefault.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyDefault = applyDefault;
    var deepMerge_1 = require_deepMerge();
    function applyDefault(defaultOptions, userOptions) {
      const options = structuredClone(defaultOptions);
      if (userOptions == null) {
        return options;
      }
      options.forEach((opt, i) => {
        if (userOptions[i] !== void 0) {
          const userOpt = userOptions[i];
          if ((0, deepMerge_1.isObjectNotArray)(userOpt) && (0, deepMerge_1.isObjectNotArray)(opt)) {
            options[i] = (0, deepMerge_1.deepMerge)(opt, userOpt);
          } else {
            options[i] = userOpt;
          }
        }
      });
      return options;
    }
  }
});

// node_modules/@typescript-eslint/utils/dist/eslint-utils/parserSeemsToBeTSESLint.js
var require_parserSeemsToBeTSESLint = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/eslint-utils/parserSeemsToBeTSESLint.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parserSeemsToBeTSESLint = parserSeemsToBeTSESLint;
    function parserSeemsToBeTSESLint(parser) {
      return !!parser && /(?:typescript-eslint|\.\.)[\w/\\]*parser/.test(parser);
    }
  }
});

// node_modules/@typescript-eslint/utils/dist/eslint-utils/getParserServices.js
var require_getParserServices = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/eslint-utils/getParserServices.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getParserServices = getParserServices;
    var parserSeemsToBeTSESLint_1 = require_parserSeemsToBeTSESLint();
    var ERROR_MESSAGE_REQUIRES_PARSER_SERVICES = "You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file. See https://tseslint.com/typed-linting for enabling linting with type information.";
    var ERROR_MESSAGE_UNKNOWN_PARSER = 'Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward "parserOptions.project" to @typescript-eslint/parser.';
    function getParserServices(context, allowWithoutFullTypeInformation = false) {
      const parser = (
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8
        context.parserPath || context.languageOptions.parser?.meta?.name
      );
      if (context.sourceCode.parserServices?.esTreeNodeToTSNodeMap == null || context.sourceCode.parserServices.tsNodeToESTreeNodeMap == null) {
        throwError(parser);
      }
      if (context.sourceCode.parserServices.program == null && !allowWithoutFullTypeInformation) {
        throwError(parser);
      }
      return context.sourceCode.parserServices;
    }
    function throwError(parser) {
      const messages = [
        ERROR_MESSAGE_REQUIRES_PARSER_SERVICES,
        `Parser: ${parser || "(unknown)"}`,
        !(0, parserSeemsToBeTSESLint_1.parserSeemsToBeTSESLint)(parser) && ERROR_MESSAGE_UNKNOWN_PARSER
      ].filter(Boolean);
      throw new Error(messages.join("\n"));
    }
  }
});

// node_modules/@typescript-eslint/utils/dist/eslint-utils/InferTypesFromRule.js
var require_InferTypesFromRule = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/eslint-utils/InferTypesFromRule.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@typescript-eslint/utils/dist/eslint-utils/nullThrows.js
var require_nullThrows = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/eslint-utils/nullThrows.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NullThrowsReasons = void 0;
    exports.nullThrows = nullThrows;
    exports.NullThrowsReasons = {
      MissingParent: "Expected node to have a parent.",
      MissingToken: (token, thing) => `Expected to find a ${token} for the ${thing}.`
    };
    function nullThrows(value, message) {
      if (value == null) {
        throw new Error(`Non-null Assertion Failed: ${message}`);
      }
      return value;
    }
  }
});

// node_modules/@typescript-eslint/utils/dist/eslint-utils/RuleCreator.js
var require_RuleCreator = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/eslint-utils/RuleCreator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RuleCreator = RuleCreator;
    var applyDefault_1 = require_applyDefault();
    function RuleCreator(urlCreator) {
      return function createNamedRule({ meta, name, ...rule }) {
        const ruleWithDocs = createRule({
          meta: {
            ...meta,
            docs: {
              ...meta.docs,
              url: urlCreator(name)
            }
          },
          name,
          ...rule
        });
        return ruleWithDocs;
      };
    }
    function createRule({
      create,
      // Keep accepting deprecated defaultOptions for backward compatibility.
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      defaultOptions,
      meta,
      name
    }) {
      const resolvedDefaultOptions = meta.defaultOptions ?? defaultOptions ?? [];
      return {
        create(context) {
          const optionsWithDefault = (0, applyDefault_1.applyDefault)(resolvedDefaultOptions, context.options);
          return create(context, optionsWithDefault);
        },
        defaultOptions,
        meta,
        name
      };
    }
    RuleCreator.withoutDocs = function withoutDocs(args) {
      return createRule(args);
    };
  }
});

// node_modules/@typescript-eslint/utils/dist/eslint-utils/index.js
var require_eslint_utils = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/eslint-utils/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_applyDefault(), exports);
    __exportStar(require_deepMerge(), exports);
    __exportStar(require_getParserServices(), exports);
    __exportStar(require_InferTypesFromRule(), exports);
    __exportStar(require_nullThrows(), exports);
    __exportStar(require_RuleCreator(), exports);
  }
});

export {
  require_eslint_utils
};
