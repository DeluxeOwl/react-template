import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import {
  require_ast_utils
} from "./chunk-SFE3BQ7O.js";
import {
  require_eslint_utils
} from "./chunk-VZLOIFVZ.js";
import {
  __commonJS,
  __require
} from "./chunk-WPQ5MXLX.js";

// node_modules/@typescript-eslint/utils/dist/ts-eslint/Scope.js
var require_Scope = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ts-eslint/Scope.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scope = void 0;
    var scopeManager = __importStar(__require("@typescript-eslint/scope-manager"));
    var Scope;
    (function(Scope2) {
      Scope2.ScopeType = scopeManager.ScopeType;
      Scope2.DefinitionType = scopeManager.DefinitionType;
    })(Scope || (exports.Scope = Scope = {}));
  }
});

// node_modules/@typescript-eslint/utils/dist/ts-utils/isArray.js
var require_isArray = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ts-utils/isArray.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isArray = isArray;
    function isArray(arg) {
      return Array.isArray(arg);
    }
  }
});

// node_modules/@typescript-eslint/utils/dist/ts-utils/NoInfer.js
var require_NoInfer = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ts-utils/NoInfer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@typescript-eslint/utils/dist/ts-utils/index.js
var require_ts_utils = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ts-utils/index.js"(exports) {
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
    __exportStar(require_isArray(), exports);
    __exportStar(require_NoInfer(), exports);
  }
});

// pure-utils:@typescript-eslint/utils
var require_utils = __commonJS({
  "pure-utils:@typescript-eslint/utils"(exports) {
    var types = __require("@typescript-eslint/types");
    exports.AST_NODE_TYPES = types.AST_NODE_TYPES;
    exports.AST_TOKEN_TYPES = types.AST_TOKEN_TYPES;
    exports.TSESTree = types.TSESTree;
    exports.ASTUtils = require_ast_utils();
    exports.ESLintUtils = require_eslint_utils();
    exports.TSESLint = { Scope: require_Scope().Scope };
    exports.TSUtils = require_ts_utils();
  }
});

export {
  require_utils
};
