import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import {
  require_utils
} from "./chunk-XXE54OPM.js";
import "./chunk-SFE3BQ7O.js";
import "./chunk-VZLOIFVZ.js";
import {
  __commonJS,
  __require,
  __toESM
} from "./chunk-WPQ5MXLX.js";

// node_modules/@typescript-eslint/type-utils/dist/isSymbolFromDefaultLibrary.js
var require_isSymbolFromDefaultLibrary = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/isSymbolFromDefaultLibrary.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSymbolFromDefaultLibrary = isSymbolFromDefaultLibrary2;
    function isSymbolFromDefaultLibrary2(program, symbol) {
      if (!symbol) {
        return false;
      }
      const declarations = symbol.getDeclarations() ?? [];
      for (const declaration of declarations) {
        const sourceFile = declaration.getSourceFile();
        if (program.isSourceFileDefaultLibrary(sourceFile)) {
          return true;
        }
      }
      return false;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/builtinSymbolLikes.js
var require_builtinSymbolLikes = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/builtinSymbolLikes.js"(exports) {
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
    exports.isPromiseLike = isPromiseLike2;
    exports.isPromiseConstructorLike = isPromiseConstructorLike2;
    exports.isErrorLike = isErrorLike2;
    exports.isReadonlyErrorLike = isReadonlyErrorLike2;
    exports.isReadonlyTypeLike = isReadonlyTypeLike2;
    exports.isBuiltinTypeAliasLike = isBuiltinTypeAliasLike2;
    exports.isBuiltinSymbolLike = isBuiltinSymbolLike2;
    exports.isBuiltinSymbolLikeRecurser = isBuiltinSymbolLikeRecurser2;
    var tsutils = __importStar(__require("ts-api-utils"));
    var ts = __importStar(__require("typescript"));
    var isSymbolFromDefaultLibrary_1 = require_isSymbolFromDefaultLibrary();
    function isPromiseLike2(program, type) {
      return isBuiltinSymbolLike2(program, type, "Promise");
    }
    function isPromiseConstructorLike2(program, type) {
      return isBuiltinSymbolLike2(program, type, "PromiseConstructor");
    }
    function isErrorLike2(program, type) {
      return isBuiltinSymbolLike2(program, type, "Error");
    }
    function isReadonlyErrorLike2(program, type) {
      return isReadonlyTypeLike2(program, type, (subtype) => {
        const [typeArgument] = subtype.aliasTypeArguments;
        return isErrorLike2(program, typeArgument) || isReadonlyErrorLike2(program, typeArgument);
      });
    }
    function isReadonlyTypeLike2(program, type, predicate) {
      return isBuiltinTypeAliasLike2(program, type, (subtype) => {
        return subtype.aliasSymbol.getName() === "Readonly" && !!predicate?.(subtype);
      });
    }
    function isBuiltinTypeAliasLike2(program, type, predicate) {
      return isBuiltinSymbolLikeRecurser2(program, type, (subtype) => {
        const { aliasSymbol, aliasTypeArguments } = subtype;
        if (!aliasSymbol || !aliasTypeArguments) {
          return false;
        }
        if ((0, isSymbolFromDefaultLibrary_1.isSymbolFromDefaultLibrary)(program, aliasSymbol) && predicate(subtype)) {
          return true;
        }
        return null;
      });
    }
    function isBuiltinSymbolLike2(program, type, symbolName) {
      return isBuiltinSymbolLikeRecurser2(program, type, (subType) => {
        const symbol = subType.getSymbol();
        if (!symbol) {
          return false;
        }
        const actualSymbolName = symbol.getName();
        if ((Array.isArray(symbolName) ? symbolName.some((name) => actualSymbolName === name) : actualSymbolName === symbolName) && (0, isSymbolFromDefaultLibrary_1.isSymbolFromDefaultLibrary)(program, symbol)) {
          return true;
        }
        return null;
      });
    }
    function isBuiltinSymbolLikeRecurser2(program, type, predicate) {
      if (type.isIntersection()) {
        return type.types.some((t) => isBuiltinSymbolLikeRecurser2(program, t, predicate));
      }
      if (type.isUnion()) {
        return type.types.every((t) => isBuiltinSymbolLikeRecurser2(program, t, predicate));
      }
      if (tsutils.isTypeParameter(type)) {
        const t = type.getConstraint();
        if (t) {
          return isBuiltinSymbolLikeRecurser2(program, t, predicate);
        }
        return false;
      }
      const predicateResult = predicate(type);
      if (typeof predicateResult === "boolean") {
        return predicateResult;
      }
      const symbol = type.getSymbol();
      if (symbol && tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) {
        const checker = program.getTypeChecker();
        const declaredType = checker.getDeclaredTypeOfSymbol(symbol);
        for (const baseType of checker.getBaseTypes(declaredType)) {
          if (isBuiltinSymbolLikeRecurser2(program, baseType, predicate)) {
            return true;
          }
        }
      }
      return false;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/typeFlagUtils.js
var require_typeFlagUtils = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/typeFlagUtils.js"(exports) {
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
    exports.getTypeFlags = getTypeFlags2;
    exports.isTypeFlagSet = isTypeFlagSet2;
    var tsutils = __importStar(__require("ts-api-utils"));
    var ts = __importStar(__require("typescript"));
    var ANY_OR_UNKNOWN = ts.TypeFlags.Any | ts.TypeFlags.Unknown;
    function getTypeFlags2(type) {
      let flags = 0;
      for (const t of tsutils.unionConstituents(type)) {
        flags |= t.flags;
      }
      return flags;
    }
    function isTypeFlagSet2(type, flagsToCheck, isReceiver) {
      const flags = getTypeFlags2(type);
      if (isReceiver && flags & ANY_OR_UNKNOWN) {
        return true;
      }
      return (flags & flagsToCheck) !== 0;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/containsAllTypesByName.js
var require_containsAllTypesByName = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/containsAllTypesByName.js"(exports) {
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
    exports.containsAllTypesByName = containsAllTypesByName2;
    var tsutils = __importStar(__require("ts-api-utils"));
    var ts = __importStar(__require("typescript"));
    var typeFlagUtils_1 = require_typeFlagUtils();
    function containsAllTypesByName2(type, allowAny, allowedNames, matchAnyInstead = false) {
      if ((0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        return !allowAny;
      }
      if (tsutils.isTypeReference(type)) {
        type = type.target;
      }
      const symbol = type.getSymbol();
      if (symbol && allowedNames.has(symbol.name)) {
        return true;
      }
      const predicate = (t) => containsAllTypesByName2(t, allowAny, allowedNames, matchAnyInstead);
      if (tsutils.isUnionOrIntersectionType(type)) {
        return matchAnyInstead ? type.types.some(predicate) : type.types.every(predicate);
      }
      const bases = type.getBaseTypes();
      return bases != null && (matchAnyInstead ? bases.some(predicate) : bases.length > 0 && bases.every(predicate));
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/getConstrainedTypeAtLocation.js
var require_getConstrainedTypeAtLocation = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/getConstrainedTypeAtLocation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getConstrainedTypeAtLocation = getConstrainedTypeAtLocation2;
    function getConstrainedTypeAtLocation2(services, node) {
      const nodeType = services.getTypeAtLocation(node);
      const constrained = services.program.getTypeChecker().getBaseConstraintOfType(nodeType);
      return constrained ?? nodeType;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/getContextualType.js
var require_getContextualType = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/getContextualType.js"(exports) {
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
    exports.getContextualType = getContextualType2;
    var ts = __importStar(__require("typescript"));
    function getContextualType2(checker, node) {
      const parent = node.parent;
      if (ts.isCallExpression(parent) || ts.isNewExpression(parent)) {
        if (node === parent.expression) {
          return;
        }
      } else if (ts.isVariableDeclaration(parent) || ts.isPropertyDeclaration(parent) || ts.isParameter(parent)) {
        return parent.type ? checker.getTypeFromTypeNode(parent.type) : void 0;
      } else if (ts.isJsxExpression(parent)) {
        return checker.getContextualType(parent);
      } else if (ts.isIdentifier(node) && (ts.isPropertyAssignment(parent) || ts.isShorthandPropertyAssignment(parent))) {
        return checker.getContextualType(node);
      } else if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && parent.right === node) {
        return checker.getTypeAtLocation(parent.left);
      } else if (![ts.SyntaxKind.JsxExpression, ts.SyntaxKind.TemplateSpan].includes(parent.kind)) {
        return;
      }
      return checker.getContextualType(node);
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/getDeclaration.js
var require_getDeclaration = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/getDeclaration.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDeclaration = getDeclaration2;
    function getDeclaration2(services, node) {
      const symbol = services.getSymbolAtLocation(node);
      if (!symbol) {
        return null;
      }
      const declarations = symbol.getDeclarations();
      return declarations?.[0] ?? null;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/getSourceFileOfNode.js
var require_getSourceFileOfNode = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/getSourceFileOfNode.js"(exports) {
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
    exports.getSourceFileOfNode = getSourceFileOfNode2;
    var ts = __importStar(__require("typescript"));
    function getSourceFileOfNode2(node) {
      while (node.kind !== ts.SyntaxKind.SourceFile) {
        node = node.parent;
      }
      return node;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/getTypeName.js
var require_getTypeName = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/getTypeName.js"(exports) {
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
    exports.getTypeName = getTypeName2;
    var tsutils = __importStar(__require("ts-api-utils"));
    var ts = __importStar(__require("typescript"));
    function getTypeName2(typeChecker, type) {
      if (tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike)) {
        return "string";
      }
      if (tsutils.isTypeFlagSet(type, ts.TypeFlags.TypeParameter)) {
        const symbol = type.getSymbol();
        const decls = symbol?.getDeclarations();
        const typeParamDecl = decls?.[0];
        if (typeParamDecl != null && ts.isTypeParameterDeclaration(typeParamDecl) && typeParamDecl.constraint != null) {
          return getTypeName2(typeChecker, typeChecker.getTypeFromTypeNode(typeParamDecl.constraint));
        }
      }
      if (type.isUnion() && type.types.map((value) => getTypeName2(typeChecker, value)).every((t) => t === "string")) {
        return "string";
      }
      if (type.isIntersection() && type.types.map((value) => getTypeName2(typeChecker, value)).some((t) => t === "string")) {
        return "string";
      }
      return typeChecker.typeToString(type);
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/isTypeBrandedLiteralLike.js
var require_isTypeBrandedLiteralLike = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/isTypeBrandedLiteralLike.js"(exports) {
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
    exports.isTypeBrandedLiteralLike = isTypeBrandedLiteralLike2;
    var tsutils = __importStar(__require("ts-api-utils"));
    var ts = __importStar(__require("typescript"));
    function isLiteralOrTaggablePrimitiveLike(type) {
      return type.isLiteral() || tsutils.isTypeFlagSet(type, ts.TypeFlags.BigInt | ts.TypeFlags.Number | ts.TypeFlags.String | ts.TypeFlags.TemplateLiteral);
    }
    function isObjectLiteralLike(type) {
      return !type.getCallSignatures().length && !type.getConstructSignatures().length && tsutils.isObjectType(type);
    }
    function isTypeBrandedLiteral(type) {
      if (!type.isIntersection()) {
        return false;
      }
      let hadObjectLike = false;
      let hadPrimitiveLike = false;
      for (const constituent of type.types) {
        if (isObjectLiteralLike(constituent)) {
          hadPrimitiveLike = true;
        } else if (isLiteralOrTaggablePrimitiveLike(constituent)) {
          hadObjectLike = true;
        } else {
          return false;
        }
      }
      return hadPrimitiveLike && hadObjectLike;
    }
    function isTypeBrandedLiteralLike2(type) {
      return type.isUnion() ? type.types.every(isTypeBrandedLiteral) : isTypeBrandedLiteral(type);
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/propertyTypes.js
var require_propertyTypes = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/propertyTypes.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTypeOfPropertyOfName = getTypeOfPropertyOfName2;
    exports.getTypeOfPropertyOfType = getTypeOfPropertyOfType2;
    function getTypeOfPropertyOfName2(checker, type, name, escapedName) {
      if (!escapedName || !isSymbol(escapedName)) {
        return checker.getTypeOfPropertyOfType(type, name);
      }
      const escapedProperty = type.getProperties().find((property) => property.escapedName === escapedName);
      return escapedProperty ? checker.getDeclaredTypeOfSymbol(escapedProperty) : void 0;
    }
    function getTypeOfPropertyOfType2(checker, type, property) {
      return getTypeOfPropertyOfName2(checker, type, property.getName(), property.getEscapedName());
    }
    function isSymbol(escapedName) {
      return isKnownSymbol(escapedName) || isPrivateIdentifierSymbol(escapedName);
    }
    function isKnownSymbol(escapedName) {
      return escapedName.startsWith("__@");
    }
    function isPrivateIdentifierSymbol(escapedName) {
      return escapedName.startsWith("__#");
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/specifierNameMatches.js
var require_specifierNameMatches = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/specifierNameMatches.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.specifierNameMatches = specifierNameMatches;
    function specifierNameMatches(type, names) {
      if (typeof names === "string") {
        names = [names];
      }
      const symbol = type.aliasSymbol ?? type.getSymbol();
      const candidateNames = symbol ? [symbol.escapedName, type.intrinsicName] : [type.intrinsicName];
      if (names.some((item) => candidateNames.includes(item))) {
        return true;
      }
      return false;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/typeDeclaredInFile.js
var require_typeDeclaredInFile = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/typeDeclaredInFile.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.typeDeclaredInFile = typeDeclaredInFile;
    var typescript_estree_1 = __require("@typescript-eslint/typescript-estree");
    var node_path_1 = __importDefault(__require("node:path"));
    function typeDeclaredInFile(relativePath, declarationFiles, program) {
      if (relativePath == null) {
        const cwd = (0, typescript_estree_1.getCanonicalFileName)(program.getCurrentDirectory());
        return declarationFiles.some((declaration) => (0, typescript_estree_1.getCanonicalFileName)(declaration.fileName).startsWith(cwd));
      }
      const absolutePath = (0, typescript_estree_1.getCanonicalFileName)(node_path_1.default.join(program.getCurrentDirectory(), relativePath));
      return declarationFiles.some((declaration) => (0, typescript_estree_1.getCanonicalFileName)(declaration.fileName) === absolutePath);
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/typeDeclaredInLib.js
var require_typeDeclaredInLib = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/typeDeclaredInLib.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.typeDeclaredInLib = typeDeclaredInLib;
    function typeDeclaredInLib(declarationFiles, program) {
      if (declarationFiles.length === 0) {
        return true;
      }
      return declarationFiles.some((declaration) => program.isSourceFileDefaultLibrary(declaration));
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/typeDeclaredInPackageDeclarationFile.js
var require_typeDeclaredInPackageDeclarationFile = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/typeDeclaredInPackageDeclarationFile.js"(exports) {
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
    exports.typeDeclaredInPackageDeclarationFile = typeDeclaredInPackageDeclarationFile;
    var ts = __importStar(__require("typescript"));
    function findParentModuleDeclaration(node) {
      switch (node.kind) {
        case ts.SyntaxKind.ModuleDeclaration:
          if (node.flags & ts.NodeFlags.Namespace) {
            break;
          }
          return ts.isStringLiteral(node.name) ? node : void 0;
        case ts.SyntaxKind.SourceFile:
          return void 0;
      }
      return findParentModuleDeclaration(node.parent);
    }
    function typeDeclaredInDeclareModule(packageName, declarations) {
      return declarations.some((declaration) => findParentModuleDeclaration(declaration)?.name.text === packageName);
    }
    function typeDeclaredInDeclarationFile(packageName, declarationFiles, program) {
      const typesPackageName = packageName.replace(/^@([^/]+)\//, "$1__");
      const matcher = new RegExp(`${packageName}|${typesPackageName}`);
      return declarationFiles.some((declaration) => {
        const packageIdName = program.sourceFileToPackageName.get(declaration.path);
        return packageIdName != null && matcher.test(packageIdName) && program.isSourceFileFromExternalLibrary(declaration);
      });
    }
    function typeDeclaredInPackageDeclarationFile(packageName, declarations, declarationFiles, program) {
      return typeDeclaredInDeclareModule(packageName, declarations) || typeDeclaredInDeclarationFile(packageName, declarationFiles, program);
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/TypeOrValueSpecifier.js
var require_TypeOrValueSpecifier = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/TypeOrValueSpecifier.js"(exports) {
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
    exports.valueMatchesSomeSpecifier = exports.typeMatchesSomeSpecifier = exports.typeOrValueSpecifiersSchema = void 0;
    exports.typeMatchesSpecifier = typeMatchesSpecifier2;
    exports.valueMatchesSpecifier = valueMatchesSpecifier2;
    var types_1 = __require("@typescript-eslint/types");
    var tsutils = __importStar(__require("ts-api-utils"));
    var specifierNameMatches_1 = require_specifierNameMatches();
    var typeDeclaredInFile_1 = require_typeDeclaredInFile();
    var typeDeclaredInLib_1 = require_typeDeclaredInLib();
    var typeDeclaredInPackageDeclarationFile_1 = require_typeDeclaredInPackageDeclarationFile();
    exports.typeOrValueSpecifiersSchema = {
      items: {
        oneOf: [
          {
            type: "string"
          },
          {
            additionalProperties: false,
            properties: {
              from: {
                enum: ["file"],
                type: "string"
              },
              name: {
                oneOf: [
                  {
                    type: "string"
                  },
                  {
                    items: {
                      type: "string"
                    },
                    minItems: 1,
                    type: "array",
                    uniqueItems: true
                  }
                ]
              },
              path: {
                type: "string"
              }
            },
            required: ["from", "name"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              from: {
                enum: ["lib"],
                type: "string"
              },
              name: {
                oneOf: [
                  {
                    type: "string"
                  },
                  {
                    items: {
                      type: "string"
                    },
                    minItems: 1,
                    type: "array",
                    uniqueItems: true
                  }
                ]
              }
            },
            required: ["from", "name"],
            type: "object"
          },
          {
            additionalProperties: false,
            properties: {
              from: {
                enum: ["package"],
                type: "string"
              },
              name: {
                oneOf: [
                  {
                    type: "string"
                  },
                  {
                    items: {
                      type: "string"
                    },
                    minItems: 1,
                    type: "array",
                    uniqueItems: true
                  }
                ]
              },
              package: {
                type: "string"
              }
            },
            required: ["from", "name", "package"],
            type: "object"
          }
        ]
      },
      type: "array"
    };
    function typeMatchesSpecifier2(type, specifier, program) {
      if (tsutils.isUnionType(type)) {
        return type.types.every((t) => typeMatchesSpecifier2(t, specifier, program));
      }
      const wholeTypeMatches = (() => {
        if (tsutils.isIntrinsicErrorType(type)) {
          return false;
        }
        if (typeof specifier === "string") {
          return (0, specifierNameMatches_1.specifierNameMatches)(type, specifier);
        }
        if (!(0, specifierNameMatches_1.specifierNameMatches)(type, specifier.name)) {
          return false;
        }
        const symbol = type.getSymbol() ?? type.aliasSymbol;
        const declarations = symbol?.getDeclarations() ?? [];
        const declarationFiles = declarations.map((declaration) => declaration.getSourceFile());
        switch (specifier.from) {
          case "file":
            return (0, typeDeclaredInFile_1.typeDeclaredInFile)(specifier.path, declarationFiles, program);
          case "lib":
            return (0, typeDeclaredInLib_1.typeDeclaredInLib)(declarationFiles, program);
          case "package":
            return (0, typeDeclaredInPackageDeclarationFile_1.typeDeclaredInPackageDeclarationFile)(specifier.package, declarations, declarationFiles, program);
        }
      })();
      if (wholeTypeMatches) {
        return true;
      }
      if (tsutils.isIntersectionType(type) && tsutils.intersectionConstituents(type).some((part) => typeMatchesSpecifier2(part, specifier, program))) {
        return true;
      }
      return false;
    }
    var typeMatchesSomeSpecifier2 = (type, specifiers = [], program) => specifiers.some((specifier) => typeMatchesSpecifier2(type, specifier, program));
    exports.typeMatchesSomeSpecifier = typeMatchesSomeSpecifier2;
    var getSpecifierNames = (specifierName) => {
      return typeof specifierName === "string" ? [specifierName] : specifierName;
    };
    var getStaticName = (node) => {
      if (node.type === types_1.AST_NODE_TYPES.Identifier || node.type === types_1.AST_NODE_TYPES.JSXIdentifier || node.type === types_1.AST_NODE_TYPES.PrivateIdentifier) {
        return node.name;
      }
      if (node.type === types_1.AST_NODE_TYPES.Literal && typeof node.value === "string") {
        return node.value;
      }
      return void 0;
    };
    function valueMatchesSpecifier2(node, specifier, program, type) {
      const staticName = getStaticName(node);
      if (!staticName) {
        return false;
      }
      if (typeof specifier === "string") {
        return specifier === staticName;
      }
      if (!getSpecifierNames(specifier.name).includes(staticName)) {
        return false;
      }
      if (specifier.from === "package") {
        const symbol = type.getSymbol() ?? type.aliasSymbol;
        const declarations = symbol?.getDeclarations() ?? [];
        const declarationFiles = declarations.map((declaration) => declaration.getSourceFile());
        return (0, typeDeclaredInPackageDeclarationFile_1.typeDeclaredInPackageDeclarationFile)(specifier.package, declarations, declarationFiles, program);
      }
      return true;
    }
    var valueMatchesSomeSpecifier2 = (node, specifiers = [], program, type) => specifiers.some((specifier) => valueMatchesSpecifier2(node, specifier, program, type));
    exports.valueMatchesSomeSpecifier = valueMatchesSomeSpecifier2;
  }
});

// node_modules/@typescript-eslint/type-utils/dist/isTypeReadonly.js
var require_isTypeReadonly = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/isTypeReadonly.js"(exports) {
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
    exports.readonlynessOptionsDefaults = exports.readonlynessOptionsSchema = void 0;
    exports.isTypeReadonly = isTypeReadonly2;
    var utils_1 = require_utils();
    var tsutils = __importStar(__require("ts-api-utils"));
    var ts = __importStar(__require("typescript"));
    var propertyTypes_1 = require_propertyTypes();
    var TypeOrValueSpecifier_1 = require_TypeOrValueSpecifier();
    var Readonlyness;
    (function(Readonlyness2) {
      Readonlyness2[Readonlyness2["UnknownType"] = 1] = "UnknownType";
      Readonlyness2[Readonlyness2["Mutable"] = 2] = "Mutable";
      Readonlyness2[Readonlyness2["Readonly"] = 3] = "Readonly";
    })(Readonlyness || (Readonlyness = {}));
    exports.readonlynessOptionsSchema = {
      additionalProperties: false,
      properties: {
        allow: TypeOrValueSpecifier_1.typeOrValueSpecifiersSchema,
        treatMethodsAsReadonly: {
          type: "boolean"
        }
      },
      type: "object"
    };
    exports.readonlynessOptionsDefaults = {
      allow: [],
      treatMethodsAsReadonly: false
    };
    function hasSymbol(node) {
      return Object.hasOwn(node, "symbol");
    }
    function isTypeReadonlyArrayOrTuple(program, type, options, seenTypes) {
      const checker = program.getTypeChecker();
      function checkTypeArguments(arrayType) {
        const typeArguments = checker.getTypeArguments(arrayType);
        if (typeArguments.length === 0) {
          return Readonlyness.Readonly;
        }
        if (typeArguments.some((typeArg) => isTypeReadonlyRecurser(program, typeArg, options, seenTypes) === Readonlyness.Mutable)) {
          return Readonlyness.Mutable;
        }
        return Readonlyness.Readonly;
      }
      if (checker.isArrayType(type)) {
        const symbol = utils_1.ESLintUtils.nullThrows(type.getSymbol(), utils_1.ESLintUtils.NullThrowsReasons.MissingToken("symbol", "array type"));
        const escapedName = symbol.getEscapedName();
        if (escapedName === "Array") {
          return Readonlyness.Mutable;
        }
        return checkTypeArguments(type);
      }
      if (checker.isTupleType(type)) {
        if (!type.target.readonly) {
          return Readonlyness.Mutable;
        }
        return checkTypeArguments(type);
      }
      return Readonlyness.UnknownType;
    }
    function isTypeReadonlyObject(program, type, options, seenTypes) {
      const checker = program.getTypeChecker();
      function checkIndexSignature(kind) {
        const indexInfo = checker.getIndexInfoOfType(type, kind);
        if (indexInfo) {
          if (!indexInfo.isReadonly) {
            return Readonlyness.Mutable;
          }
          if (indexInfo.type === type || seenTypes.has(indexInfo.type)) {
            return Readonlyness.Readonly;
          }
          return isTypeReadonlyRecurser(program, indexInfo.type, options, seenTypes);
        }
        return Readonlyness.UnknownType;
      }
      const properties = type.getProperties();
      if (properties.length) {
        for (const property of properties) {
          if (options.treatMethodsAsReadonly) {
            if (property.valueDeclaration != null && hasSymbol(property.valueDeclaration) && tsutils.isSymbolFlagSet(property.valueDeclaration.symbol, ts.SymbolFlags.Method)) {
              continue;
            }
            const declarations = property.getDeclarations();
            const lastDeclaration = declarations != null && declarations.length > 0 ? declarations[declarations.length - 1] : void 0;
            if (lastDeclaration != null && hasSymbol(lastDeclaration) && tsutils.isSymbolFlagSet(lastDeclaration.symbol, ts.SymbolFlags.Method)) {
              continue;
            }
          }
          if (tsutils.isPropertyReadonlyInType(type, property.getEscapedName(), checker)) {
            continue;
          }
          const name = ts.getNameOfDeclaration(property.valueDeclaration);
          if (name && ts.isPrivateIdentifier(name)) {
            continue;
          }
          return Readonlyness.Mutable;
        }
        for (const property of properties) {
          const propertyType = utils_1.ESLintUtils.nullThrows((0, propertyTypes_1.getTypeOfPropertyOfType)(checker, type, property), utils_1.ESLintUtils.NullThrowsReasons.MissingToken(`property "${property.name}"`, "type"));
          if (seenTypes.has(propertyType)) {
            continue;
          }
          if (isTypeReadonlyRecurser(program, propertyType, options, seenTypes) === Readonlyness.Mutable) {
            return Readonlyness.Mutable;
          }
        }
      }
      const isStringIndexSigReadonly = checkIndexSignature(ts.IndexKind.String);
      if (isStringIndexSigReadonly === Readonlyness.Mutable) {
        return isStringIndexSigReadonly;
      }
      const isNumberIndexSigReadonly = checkIndexSignature(ts.IndexKind.Number);
      if (isNumberIndexSigReadonly === Readonlyness.Mutable) {
        return isNumberIndexSigReadonly;
      }
      return Readonlyness.Readonly;
    }
    function isTypeReadonlyRecurser(program, type, options, seenTypes) {
      const checker = program.getTypeChecker();
      seenTypes.add(type);
      if (type.aliasSymbol && options.allow) {
        const aliasSymbol = type.aliasSymbol;
        const aliasMatches = options.allow.some((specifier) => {
          const specifierName = typeof specifier === "string" ? specifier : specifier.name;
          const names = Array.isArray(specifierName) ? specifierName : [specifierName];
          return names.includes(aliasSymbol.getName());
        });
        if (aliasMatches) {
          return Readonlyness.Readonly;
        }
      }
      if ((0, TypeOrValueSpecifier_1.typeMatchesSomeSpecifier)(type, options.allow, program)) {
        return Readonlyness.Readonly;
      }
      if (tsutils.isUnionType(type)) {
        const result = tsutils.unionConstituents(type).every((t) => seenTypes.has(t) || isTypeReadonlyRecurser(program, t, options, seenTypes) === Readonlyness.Readonly);
        const readonlyness = result ? Readonlyness.Readonly : Readonlyness.Mutable;
        return readonlyness;
      }
      if (tsutils.isIntersectionType(type)) {
        if (type.types.some((t) => checker.isArrayType(t) || checker.isTupleType(t))) {
          const allReadonlyParts = type.types.every((t) => seenTypes.has(t) || isTypeReadonlyRecurser(program, t, options, seenTypes) === Readonlyness.Readonly);
          return allReadonlyParts ? Readonlyness.Readonly : Readonlyness.Mutable;
        }
        const isReadonlyObject2 = isTypeReadonlyObject(program, type, options, seenTypes);
        if (isReadonlyObject2 !== Readonlyness.UnknownType) {
          return isReadonlyObject2;
        }
      }
      if (tsutils.isConditionalType(type)) {
        const result = [type.root.node.trueType, type.root.node.falseType].map(checker.getTypeFromTypeNode).every((t) => seenTypes.has(t) || isTypeReadonlyRecurser(program, t, options, seenTypes) === Readonlyness.Readonly);
        const readonlyness = result ? Readonlyness.Readonly : Readonlyness.Mutable;
        return readonlyness;
      }
      if (!tsutils.isObjectType(type)) {
        return Readonlyness.Readonly;
      }
      if (type.getCallSignatures().length > 0 && type.getProperties().length === 0) {
        return Readonlyness.Readonly;
      }
      const isReadonlyArray = isTypeReadonlyArrayOrTuple(program, type, options, seenTypes);
      if (isReadonlyArray !== Readonlyness.UnknownType) {
        return isReadonlyArray;
      }
      const isReadonlyObject = isTypeReadonlyObject(program, type, options, seenTypes);
      if (isReadonlyObject !== Readonlyness.UnknownType) {
        return isReadonlyObject;
      }
      throw new Error("Unhandled type");
    }
    function isTypeReadonly2(program, type, options = exports.readonlynessOptionsDefaults) {
      return isTypeReadonlyRecurser(program, type, options, /* @__PURE__ */ new Set()) === Readonlyness.Readonly;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/predicates.js
var require_predicates = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/predicates.js"(exports) {
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
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNullableType = isNullableType2;
    exports.isTypeArrayTypeOrUnionOfArrayTypes = isTypeArrayTypeOrUnionOfArrayTypes2;
    exports.isTypeNeverType = isTypeNeverType2;
    exports.isTypeUnknownType = isTypeUnknownType2;
    exports.isTypeReferenceType = isTypeReferenceType2;
    exports.isTypeAnyType = isTypeAnyType2;
    exports.isTypeAnyArrayType = isTypeAnyArrayType2;
    exports.isTypeUnknownArrayType = isTypeUnknownArrayType2;
    exports.typeIsOrHasBaseType = typeIsOrHasBaseType2;
    exports.isTypeBigIntLiteralType = isTypeBigIntLiteralType2;
    exports.isTypeTemplateLiteralType = isTypeTemplateLiteralType2;
    var debug_1 = __importDefault(__require("debug"));
    var tsutils = __importStar(__require("ts-api-utils"));
    var ts = __importStar(__require("typescript"));
    var typeFlagUtils_1 = require_typeFlagUtils();
    var log = (0, debug_1.default)("typescript-eslint:type-utils:predicates");
    function isNullableType2(type) {
      return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void);
    }
    function isTypeArrayTypeOrUnionOfArrayTypes2(type, checker) {
      for (const t of tsutils.unionConstituents(type)) {
        if (!checker.isArrayType(t)) {
          return false;
        }
      }
      return true;
    }
    function isTypeNeverType2(type) {
      return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Never);
    }
    function isTypeUnknownType2(type) {
      return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Unknown);
    }
    var Nullable = ts.TypeFlags.Undefined | ts.TypeFlags.Null;
    var ObjectFlagsType = ts.TypeFlags.Any | Nullable | ts.TypeFlags.Never | ts.TypeFlags.Object | ts.TypeFlags.Union | ts.TypeFlags.Intersection;
    function isTypeReferenceType2(type) {
      if ((type.flags & ObjectFlagsType) === 0) {
        return false;
      }
      const objectTypeFlags = type.objectFlags;
      return (objectTypeFlags & ts.ObjectFlags.Reference) !== 0;
    }
    function isTypeAnyType2(type) {
      if ((0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.Any)) {
        if (type.intrinsicName === "error") {
          log('Found an "error" any type');
        }
        return true;
      }
      return false;
    }
    function isTypeAnyArrayType2(type, checker) {
      return checker.isArrayType(type) && isTypeAnyType2(checker.getTypeArguments(type)[0]);
    }
    function isTypeUnknownArrayType2(type, checker) {
      return checker.isArrayType(type) && isTypeUnknownType2(checker.getTypeArguments(type)[0]);
    }
    function typeIsOrHasBaseType2(type, parentType) {
      const parentSymbol = parentType.getSymbol();
      if (!type.getSymbol() || !parentSymbol) {
        return false;
      }
      const typeAndBaseTypes = [type];
      const ancestorTypes = type.getBaseTypes();
      if (ancestorTypes) {
        typeAndBaseTypes.push(...ancestorTypes);
      }
      for (const baseType of typeAndBaseTypes) {
        const baseSymbol = baseType.getSymbol();
        if (baseSymbol?.name === parentSymbol.name) {
          return true;
        }
      }
      return false;
    }
    function isTypeBigIntLiteralType2(type) {
      return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.BigIntLiteral);
    }
    function isTypeTemplateLiteralType2(type) {
      return (0, typeFlagUtils_1.isTypeFlagSet)(type, ts.TypeFlags.TemplateLiteral);
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/isUnsafeAssignment.js
var require_isUnsafeAssignment = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/isUnsafeAssignment.js"(exports) {
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
    exports.isUnsafeAssignment = isUnsafeAssignment2;
    var utils_1 = require_utils();
    var tsutils = __importStar(__require("ts-api-utils"));
    var predicates_1 = require_predicates();
    function isUnsafeAssignment2(type, receiver, checker, senderNode) {
      return isUnsafeAssignmentWorker(type, receiver, checker, senderNode, /* @__PURE__ */ new Map());
    }
    function isUnsafeAssignmentWorker(type, receiver, checker, senderNode, visited) {
      if ((0, predicates_1.isTypeAnyType)(type)) {
        if ((0, predicates_1.isTypeUnknownType)(receiver)) {
          return false;
        }
        if (!(0, predicates_1.isTypeAnyType)(receiver)) {
          return { receiver, sender: type };
        }
      }
      const typeAlreadyVisited = visited.get(type);
      if (typeAlreadyVisited) {
        if (typeAlreadyVisited.has(receiver)) {
          return false;
        }
        typeAlreadyVisited.add(receiver);
      } else {
        visited.set(type, /* @__PURE__ */ new Set([receiver]));
      }
      if (tsutils.isTypeReference(type) && tsutils.isTypeReference(receiver)) {
        if (type.target !== receiver.target) {
          return false;
        }
        if (senderNode?.type === utils_1.AST_NODE_TYPES.NewExpression && senderNode.callee.type === utils_1.AST_NODE_TYPES.Identifier && senderNode.callee.name === "Map" && senderNode.arguments.length === 0 && senderNode.typeArguments == null) {
          return false;
        }
        const typeArguments = type.typeArguments ?? [];
        const receiverTypeArguments = receiver.typeArguments ?? [];
        for (let i = 0; i < typeArguments.length; i += 1) {
          const arg = typeArguments[i];
          const receiverArg = receiverTypeArguments[i];
          const unsafe = isUnsafeAssignmentWorker(arg, receiverArg, checker, senderNode, visited);
          if (unsafe) {
            return { receiver, sender: type };
          }
        }
        return false;
      }
      return false;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/requiresQuoting.js
var require_requiresQuoting = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/requiresQuoting.js"(exports) {
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
    exports.requiresQuoting = requiresQuoting2;
    var ts = __importStar(__require("typescript"));
    function requiresQuoting2(name, target = ts.ScriptTarget.ESNext) {
      if (name.length === 0) {
        return true;
      }
      if (!ts.isIdentifierStart(name.charCodeAt(0), target)) {
        return true;
      }
      for (let i = 1; i < name.length; i += 1) {
        if (!ts.isIdentifierPart(name.charCodeAt(i), target)) {
          return true;
        }
      }
      return false;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/discriminateAnyType.js
var require_discriminateAnyType = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/discriminateAnyType.js"(exports) {
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
    exports.AnyType = void 0;
    exports.discriminateAnyType = discriminateAnyType2;
    var tsutils = __importStar(__require("ts-api-utils"));
    var predicates_1 = require_predicates();
    var AnyType2;
    (function(AnyType3) {
      AnyType3[AnyType3["Any"] = 0] = "Any";
      AnyType3[AnyType3["PromiseAny"] = 1] = "PromiseAny";
      AnyType3[AnyType3["AnyArray"] = 2] = "AnyArray";
      AnyType3[AnyType3["Safe"] = 3] = "Safe";
    })(AnyType2 || (exports.AnyType = AnyType2 = {}));
    function discriminateAnyType2(type, checker, program, tsNode) {
      return discriminateAnyTypeWorker(type, checker, program, tsNode, /* @__PURE__ */ new Set());
    }
    function discriminateAnyTypeWorker(type, checker, program, tsNode, visited) {
      if (visited.has(type)) {
        return AnyType2.Safe;
      }
      visited.add(type);
      if ((0, predicates_1.isTypeAnyType)(type)) {
        return AnyType2.Any;
      }
      if ((0, predicates_1.isTypeAnyArrayType)(type, checker)) {
        return AnyType2.AnyArray;
      }
      for (const part of tsutils.typeConstituents(type)) {
        if (tsutils.isThenableType(checker, tsNode, part)) {
          const awaitedType = checker.getAwaitedType(part);
          if (awaitedType) {
            const awaitedAnyType = discriminateAnyTypeWorker(awaitedType, checker, program, tsNode, visited);
            if (awaitedAnyType === AnyType2.Any) {
              return AnyType2.PromiseAny;
            }
          }
        }
      }
      return AnyType2.Safe;
    }
  }
});

// node_modules/@typescript-eslint/type-utils/dist/index.js
var require_dist = __commonJS({
  "node_modules/@typescript-eslint/type-utils/dist/index.js"(exports) {
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
    exports.typescriptVersionIsAtLeast = exports.getModifiers = exports.getDecorators = void 0;
    __exportStar(require_builtinSymbolLikes(), exports);
    __exportStar(require_containsAllTypesByName(), exports);
    __exportStar(require_getConstrainedTypeAtLocation(), exports);
    __exportStar(require_getContextualType(), exports);
    __exportStar(require_getDeclaration(), exports);
    __exportStar(require_getSourceFileOfNode(), exports);
    __exportStar(require_getTypeName(), exports);
    __exportStar(require_isSymbolFromDefaultLibrary(), exports);
    __exportStar(require_isTypeBrandedLiteralLike(), exports);
    __exportStar(require_isTypeReadonly(), exports);
    __exportStar(require_isUnsafeAssignment(), exports);
    __exportStar(require_predicates(), exports);
    __exportStar(require_propertyTypes(), exports);
    __exportStar(require_requiresQuoting(), exports);
    __exportStar(require_typeFlagUtils(), exports);
    __exportStar(require_TypeOrValueSpecifier(), exports);
    __exportStar(require_discriminateAnyType(), exports);
    var typescript_estree_1 = __require("@typescript-eslint/typescript-estree");
    Object.defineProperty(exports, "getDecorators", { enumerable: true, get: function() {
      return typescript_estree_1.getDecorators;
    } });
    Object.defineProperty(exports, "getModifiers", { enumerable: true, get: function() {
      return typescript_estree_1.getModifiers;
    } });
    Object.defineProperty(exports, "typescriptVersionIsAtLeast", { enumerable: true, get: function() {
      return typescript_estree_1.typescriptVersionIsAtLeast;
    } });
  }
});

// inlined:@typescript-eslint/type-utils
var upstream = __toESM(require_dist());
var { AnyType, containsAllTypesByName, discriminateAnyType, getConstrainedTypeAtLocation, getContextualType, getDeclaration, getDecorators, getModifiers, getSourceFileOfNode, getTypeFlags, getTypeName, getTypeOfPropertyOfName, getTypeOfPropertyOfType, isBuiltinSymbolLike, isBuiltinSymbolLikeRecurser, isBuiltinTypeAliasLike, isErrorLike, isNullableType, isPromiseConstructorLike, isPromiseLike, isReadonlyErrorLike, isReadonlyTypeLike, isSymbolFromDefaultLibrary, isTypeAnyArrayType, isTypeAnyType, isTypeArrayTypeOrUnionOfArrayTypes, isTypeBigIntLiteralType, isTypeBrandedLiteralLike, isTypeFlagSet, isTypeNeverType, isTypeReadonly, isTypeReferenceType, isTypeTemplateLiteralType, isTypeUnknownArrayType, isTypeUnknownType, isUnsafeAssignment, readonlynessOptionsDefaults, readonlynessOptionsSchema, requiresQuoting, typeIsOrHasBaseType, typeMatchesSomeSpecifier, typeMatchesSpecifier, typeOrValueSpecifiersSchema, typescriptVersionIsAtLeast, valueMatchesSomeSpecifier, valueMatchesSpecifier } = upstream;
export {
  AnyType,
  containsAllTypesByName,
  discriminateAnyType,
  getConstrainedTypeAtLocation,
  getContextualType,
  getDeclaration,
  getDecorators,
  getModifiers,
  getSourceFileOfNode,
  getTypeFlags,
  getTypeName,
  getTypeOfPropertyOfName,
  getTypeOfPropertyOfType,
  isBuiltinSymbolLike,
  isBuiltinSymbolLikeRecurser,
  isBuiltinTypeAliasLike,
  isErrorLike,
  isNullableType,
  isPromiseConstructorLike,
  isPromiseLike,
  isReadonlyErrorLike,
  isReadonlyTypeLike,
  isSymbolFromDefaultLibrary,
  isTypeAnyArrayType,
  isTypeAnyType,
  isTypeArrayTypeOrUnionOfArrayTypes,
  isTypeBigIntLiteralType,
  isTypeBrandedLiteralLike,
  isTypeFlagSet,
  isTypeNeverType,
  isTypeReadonly,
  isTypeReferenceType,
  isTypeTemplateLiteralType,
  isTypeUnknownArrayType,
  isTypeUnknownType,
  isUnsafeAssignment,
  readonlynessOptionsDefaults,
  readonlynessOptionsSchema,
  requiresQuoting,
  typeIsOrHasBaseType,
  typeMatchesSomeSpecifier,
  typeMatchesSpecifier,
  typeOrValueSpecifiersSchema,
  typescriptVersionIsAtLeast,
  valueMatchesSomeSpecifier,
  valueMatchesSpecifier
};
