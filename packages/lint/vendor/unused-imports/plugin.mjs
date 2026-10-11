import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@typescript-eslint/scope-manager/dist/definition/DefinitionType.js
var require_DefinitionType = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/definition/DefinitionType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefinitionType = void 0;
    var DefinitionType;
    (function(DefinitionType2) {
      DefinitionType2["CatchClause"] = "CatchClause";
      DefinitionType2["ClassName"] = "ClassName";
      DefinitionType2["FunctionName"] = "FunctionName";
      DefinitionType2["ImplicitGlobalVariable"] = "ImplicitGlobalVariable";
      DefinitionType2["ImportBinding"] = "ImportBinding";
      DefinitionType2["Parameter"] = "Parameter";
      DefinitionType2["TSEnumName"] = "TSEnumName";
      DefinitionType2["TSEnumMember"] = "TSEnumMemberName";
      DefinitionType2["TSModuleName"] = "TSModuleName";
      DefinitionType2["Type"] = "Type";
      DefinitionType2["Variable"] = "Variable";
    })(DefinitionType || (exports.DefinitionType = DefinitionType = {}));
  }
});

// node_modules/@typescript-eslint/scope-manager/dist/scope/ScopeType.js
var require_ScopeType = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/scope/ScopeType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScopeType = void 0;
    var ScopeType;
    (function(ScopeType2) {
      ScopeType2["block"] = "block";
      ScopeType2["catch"] = "catch";
      ScopeType2["class"] = "class";
      ScopeType2["classFieldInitializer"] = "class-field-initializer";
      ScopeType2["classStaticBlock"] = "class-static-block";
      ScopeType2["conditionalType"] = "conditionalType";
      ScopeType2["for"] = "for";
      ScopeType2["function"] = "function";
      ScopeType2["functionExpressionName"] = "function-expression-name";
      ScopeType2["functionType"] = "functionType";
      ScopeType2["global"] = "global";
      ScopeType2["mappedType"] = "mappedType";
      ScopeType2["module"] = "module";
      ScopeType2["switch"] = "switch";
      ScopeType2["tsEnum"] = "tsEnum";
      ScopeType2["tsModule"] = "tsModule";
      ScopeType2["type"] = "type";
      ScopeType2["with"] = "with";
    })(ScopeType || (exports.ScopeType = ScopeType = {}));
  }
});

// node_modules/@typescript-eslint/visitor-keys/dist/get-keys.js
var require_get_keys = __commonJS({
  "node_modules/@typescript-eslint/visitor-keys/dist/get-keys.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getKeys = void 0;
    var eslint_visitor_keys_1 = __require("eslint-visitor-keys");
    exports.getKeys = eslint_visitor_keys_1.getKeys;
  }
});

// node_modules/@typescript-eslint/visitor-keys/dist/visitor-keys.js
var require_visitor_keys = __commonJS({
  "node_modules/@typescript-eslint/visitor-keys/dist/visitor-keys.js"(exports) {
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
    exports.visitorKeys = void 0;
    var eslintVisitorKeys = __importStar(__require("eslint-visitor-keys"));
    var SharedVisitorKeys = (() => {
      const FunctionType = ["typeParameters", "params", "returnType"];
      const AnonymousFunction = [...FunctionType, "body"];
      const AbstractPropertyDefinition = [
        "decorators",
        "key",
        "typeAnnotation"
      ];
      return {
        AbstractPropertyDefinition: ["decorators", "key", "typeAnnotation"],
        AnonymousFunction,
        AsExpression: ["expression", "typeAnnotation"],
        ClassDeclaration: [
          "decorators",
          "id",
          "typeParameters",
          "superClass",
          "superTypeArguments",
          "implements",
          "body"
        ],
        Function: ["id", ...AnonymousFunction],
        FunctionType,
        PropertyDefinition: [...AbstractPropertyDefinition, "value"]
      };
    })();
    var additionalKeys = {
      AccessorProperty: SharedVisitorKeys.PropertyDefinition,
      ArrayPattern: ["decorators", "elements", "typeAnnotation"],
      ArrowFunctionExpression: SharedVisitorKeys.AnonymousFunction,
      AssignmentPattern: ["decorators", "left", "right", "typeAnnotation"],
      CallExpression: ["callee", "typeArguments", "arguments"],
      ClassDeclaration: SharedVisitorKeys.ClassDeclaration,
      ClassExpression: SharedVisitorKeys.ClassDeclaration,
      Decorator: ["expression"],
      ExportAllDeclaration: ["exported", "source", "attributes"],
      ExportNamedDeclaration: ["declaration", "specifiers", "source", "attributes"],
      FunctionDeclaration: SharedVisitorKeys.Function,
      FunctionExpression: SharedVisitorKeys.Function,
      Identifier: ["decorators", "typeAnnotation"],
      ImportAttribute: ["key", "value"],
      ImportDeclaration: ["specifiers", "source", "attributes"],
      ImportExpression: ["source", "options"],
      JSXClosingFragment: [],
      JSXOpeningElement: ["name", "typeArguments", "attributes"],
      JSXOpeningFragment: [],
      JSXSpreadChild: ["expression"],
      MethodDefinition: ["decorators", "key", "value"],
      NewExpression: ["callee", "typeArguments", "arguments"],
      ObjectPattern: ["decorators", "properties", "typeAnnotation"],
      PropertyDefinition: SharedVisitorKeys.PropertyDefinition,
      RestElement: ["decorators", "argument", "typeAnnotation"],
      StaticBlock: ["body"],
      TaggedTemplateExpression: ["tag", "typeArguments", "quasi"],
      TSAbstractAccessorProperty: SharedVisitorKeys.AbstractPropertyDefinition,
      TSAbstractKeyword: [],
      TSAbstractMethodDefinition: ["key", "value"],
      TSAbstractPropertyDefinition: SharedVisitorKeys.AbstractPropertyDefinition,
      TSAnyKeyword: [],
      TSArrayType: ["elementType"],
      TSAsExpression: SharedVisitorKeys.AsExpression,
      TSAsyncKeyword: [],
      TSBigIntKeyword: [],
      TSBooleanKeyword: [],
      TSCallSignatureDeclaration: SharedVisitorKeys.FunctionType,
      TSClassImplements: ["expression", "typeArguments"],
      TSConditionalType: ["checkType", "extendsType", "trueType", "falseType"],
      TSConstructorType: SharedVisitorKeys.FunctionType,
      TSConstructSignatureDeclaration: SharedVisitorKeys.FunctionType,
      TSDeclareFunction: SharedVisitorKeys.Function,
      TSDeclareKeyword: [],
      TSEmptyBodyFunctionExpression: ["id", ...SharedVisitorKeys.FunctionType],
      TSEnumBody: ["members"],
      TSEnumDeclaration: ["id", "body"],
      TSEnumMember: ["id", "initializer"],
      TSExportAssignment: ["expression"],
      TSExportKeyword: [],
      TSExternalModuleReference: ["expression"],
      TSFunctionType: SharedVisitorKeys.FunctionType,
      TSImportEqualsDeclaration: ["id", "moduleReference"],
      TSImportType: ["source", "options", "qualifier", "typeArguments"],
      TSIndexedAccessType: ["objectType", "indexType"],
      TSIndexSignature: ["parameters", "typeAnnotation"],
      TSInferType: ["typeParameter"],
      TSInstantiationExpression: ["expression", "typeArguments"],
      TSInterfaceBody: ["body"],
      TSInterfaceDeclaration: ["id", "typeParameters", "extends", "body"],
      TSInterfaceHeritage: ["expression", "typeArguments"],
      TSIntersectionType: ["types"],
      TSIntrinsicKeyword: [],
      TSLiteralType: ["literal"],
      TSMappedType: ["key", "constraint", "nameType", "typeAnnotation"],
      TSMethodSignature: ["key", "typeParameters", "params", "returnType"],
      TSModuleBlock: ["body"],
      TSModuleDeclaration: ["id", "body"],
      TSNamedTupleMember: ["label", "elementType"],
      TSNamespaceExportDeclaration: ["id"],
      TSNeverKeyword: [],
      TSNonNullExpression: ["expression"],
      TSNullKeyword: [],
      TSNumberKeyword: [],
      TSObjectKeyword: [],
      TSOptionalType: ["typeAnnotation"],
      TSParameterProperty: ["decorators", "parameter"],
      TSPrivateKeyword: [],
      TSPropertySignature: ["key", "typeAnnotation"],
      TSProtectedKeyword: [],
      TSPublicKeyword: [],
      TSQualifiedName: ["left", "right"],
      TSReadonlyKeyword: [],
      TSRestType: ["typeAnnotation"],
      TSSatisfiesExpression: SharedVisitorKeys.AsExpression,
      TSStaticKeyword: [],
      TSStringKeyword: [],
      TSSymbolKeyword: [],
      TSTemplateLiteralType: ["quasis", "types"],
      TSThisType: [],
      TSTupleType: ["elementTypes"],
      TSTypeAliasDeclaration: ["id", "typeParameters", "typeAnnotation"],
      TSTypeAnnotation: ["typeAnnotation"],
      TSTypeAssertion: ["typeAnnotation", "expression"],
      TSTypeLiteral: ["members"],
      TSTypeOperator: ["typeAnnotation"],
      TSTypeParameter: ["name", "constraint", "default"],
      TSTypeParameterDeclaration: ["params"],
      TSTypeParameterInstantiation: ["params"],
      TSTypePredicate: ["parameterName", "typeAnnotation"],
      TSTypeQuery: ["exprName", "typeArguments"],
      TSTypeReference: ["typeName", "typeArguments"],
      TSUndefinedKeyword: [],
      TSUnionType: ["types"],
      TSUnknownKeyword: [],
      TSVoidKeyword: []
    };
    exports.visitorKeys = eslintVisitorKeys.unionWith(additionalKeys);
  }
});

// node_modules/@typescript-eslint/visitor-keys/dist/index.js
var require_dist = __commonJS({
  "node_modules/@typescript-eslint/visitor-keys/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.visitorKeys = exports.getKeys = void 0;
    var get_keys_1 = require_get_keys();
    Object.defineProperty(exports, "getKeys", { enumerable: true, get: function() {
      return get_keys_1.getKeys;
    } });
    var visitor_keys_1 = require_visitor_keys();
    Object.defineProperty(exports, "visitorKeys", { enumerable: true, get: function() {
      return visitor_keys_1.visitorKeys;
    } });
  }
});

// node_modules/@typescript-eslint/scope-manager/dist/referencer/VisitorBase.js
var require_VisitorBase = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/referencer/VisitorBase.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VisitorBase = void 0;
    var visitor_keys_1 = require_dist();
    function isObject(obj) {
      return typeof obj === "object" && obj != null;
    }
    function isNode(node) {
      return isObject(node) && typeof node.type === "string";
    }
    var VisitorBase = class {
      #childVisitorKeys;
      #visitChildrenEvenIfSelectorExists;
      constructor(options) {
        this.#childVisitorKeys = options.childVisitorKeys ?? visitor_keys_1.visitorKeys;
        this.#visitChildrenEvenIfSelectorExists = options.visitChildrenEvenIfSelectorExists ?? false;
      }
      /**
       * Default method for visiting children.
       * @param node the node whose children should be visited
       * @param excludeArr a list of keys to not visit
       */
      visitChildren(node, excludeArr = []) {
        if (node?.type == null) {
          return;
        }
        const exclude = /* @__PURE__ */ new Set([...excludeArr, "parent"]);
        const children = this.#childVisitorKeys[node.type] ?? Object.keys(node);
        for (const key of children) {
          if (exclude.has(key)) {
            continue;
          }
          const child = node[key];
          if (!child) {
            continue;
          }
          if (Array.isArray(child)) {
            for (const subChild of child) {
              if (isNode(subChild)) {
                this.visit(subChild);
              }
            }
          } else if (isNode(child)) {
            this.visit(child);
          }
        }
      }
      /**
       * Dispatching node.
       */
      visit(node) {
        if (node?.type == null) {
          return;
        }
        const visitor = this[node.type];
        if (visitor) {
          visitor.call(this, node);
          if (!this.#visitChildrenEvenIfSelectorExists) {
            return;
          }
        }
        this.visitChildren(node);
      }
    };
    exports.VisitorBase = VisitorBase;
  }
});

// node_modules/@typescript-eslint/scope-manager/dist/referencer/PatternVisitor.js
var require_PatternVisitor = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/referencer/PatternVisitor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PatternVisitor = void 0;
    var types_1 = __require("@typescript-eslint/types");
    var VisitorBase_1 = require_VisitorBase();
    var PatternVisitor = class extends VisitorBase_1.VisitorBase {
      #assignments = [];
      #callback;
      #restElements = [];
      #rootPattern;
      rightHandNodes = [];
      constructor(options, rootPattern, callback) {
        super(options);
        this.#rootPattern = rootPattern;
        this.#callback = callback;
      }
      static isPattern(node) {
        const nodeType = node.type;
        return nodeType === types_1.AST_NODE_TYPES.Identifier || nodeType === types_1.AST_NODE_TYPES.ObjectPattern || nodeType === types_1.AST_NODE_TYPES.ArrayPattern || nodeType === types_1.AST_NODE_TYPES.SpreadElement || nodeType === types_1.AST_NODE_TYPES.RestElement || nodeType === types_1.AST_NODE_TYPES.AssignmentPattern;
      }
      ArrayExpression(node) {
        node.elements.forEach(this.visit, this);
      }
      ArrayPattern(pattern) {
        for (const element of pattern.elements) {
          this.visit(element);
        }
      }
      AssignmentExpression(node) {
        this.#assignments.push(node);
        this.visit(node.left);
        this.rightHandNodes.push(node.right);
        this.#assignments.pop();
      }
      AssignmentPattern(pattern) {
        this.#assignments.push(pattern);
        this.visit(pattern.left);
        this.rightHandNodes.push(pattern.right);
        this.#assignments.pop();
      }
      CallExpression(node) {
        node.arguments.forEach((a) => {
          this.rightHandNodes.push(a);
        });
        this.visit(node.callee);
      }
      Decorator() {
      }
      Identifier(pattern) {
        const lastRestElement = this.#restElements.at(-1);
        this.#callback(pattern, {
          assignments: this.#assignments,
          rest: lastRestElement?.argument === pattern,
          topLevel: pattern === this.#rootPattern
        });
      }
      MemberExpression(node) {
        if (node.computed) {
          this.rightHandNodes.push(node.property);
        }
        this.rightHandNodes.push(node.object);
      }
      Property(property) {
        if (property.computed) {
          this.rightHandNodes.push(property.key);
        }
        this.visit(property.value);
      }
      RestElement(pattern) {
        this.#restElements.push(pattern);
        this.visit(pattern.argument);
        this.#restElements.pop();
      }
      SpreadElement(node) {
        this.visit(node.argument);
      }
      TSTypeAnnotation() {
      }
    };
    exports.PatternVisitor = PatternVisitor;
  }
});

// node_modules/@typescript-eslint/scope-manager/dist/referencer/Visitor.js
var require_Visitor = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/referencer/Visitor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VisitorBase = exports.Visitor = void 0;
    var PatternVisitor_1 = require_PatternVisitor();
    var VisitorBase_1 = require_VisitorBase();
    var Visitor = class _Visitor extends VisitorBase_1.VisitorBase {
      #options;
      constructor(optionsOrVisitor) {
        super(optionsOrVisitor instanceof _Visitor ? optionsOrVisitor.#options : optionsOrVisitor);
        this.#options = optionsOrVisitor instanceof _Visitor ? optionsOrVisitor.#options : optionsOrVisitor;
      }
      visitPattern(node, callback, options = { processRightHandNodes: false }) {
        const visitor = new PatternVisitor_1.PatternVisitor(this.#options, node, callback);
        visitor.visit(node);
        if (options.processRightHandNodes) {
          visitor.rightHandNodes.forEach(this.visit, this);
        }
      }
    };
    exports.Visitor = Visitor;
    var VisitorBase_2 = require_VisitorBase();
    Object.defineProperty(exports, "VisitorBase", { enumerable: true, get: function() {
      return VisitorBase_2.VisitorBase;
    } });
  }
});

// node_modules/@typescript-eslint/scope-manager/dist/ID.js
var require_ID = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/ID.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createIdGenerator = createIdGenerator;
    exports.resetIds = resetIds;
    var ID_CACHE = /* @__PURE__ */ new Map();
    var NEXT_KEY = 0;
    function createIdGenerator() {
      const key = NEXT_KEY += 1;
      ID_CACHE.set(key, 0);
      return () => {
        const current = ID_CACHE.get(key) ?? 0;
        const next = current + 1;
        ID_CACHE.set(key, next);
        return next;
      };
    }
    function resetIds() {
      ID_CACHE.clear();
    }
  }
});

// node_modules/@typescript-eslint/scope-manager/dist/variable/VariableBase.js
var require_VariableBase = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/variable/VariableBase.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VariableBase = void 0;
    var ID_1 = require_ID();
    var generator = (0, ID_1.createIdGenerator)();
    var VariableBase = class {
      /**
       * A unique ID for this instance - primarily used to help debugging and testing
       */
      $id = generator();
      /**
       * The array of the definitions of this variable.
       * @public
       */
      defs = [];
      /**
       * True if the variable is considered used for the purposes of `no-unused-vars`, false otherwise.
       * @public
       */
      eslintUsed = false;
      /**
       * The array of `Identifier` nodes which define this variable.
       * If this variable is redeclared, this array includes two or more nodes.
       * @public
       */
      identifiers = [];
      /**
       * The variable name, as given in the source code.
       * @public
       */
      name;
      /**
       * List of {@link Reference} of this variable (excluding parameter entries)  in its defining scope and all nested scopes.
       * For defining occurrences only see {@link Variable#defs}.
       * @public
       */
      references = [];
      /**
       * Reference to the enclosing Scope.
       */
      scope;
      constructor(name, scope) {
        this.name = name;
        this.scope = scope;
      }
    };
    exports.VariableBase = VariableBase;
  }
});

// node_modules/@typescript-eslint/scope-manager/dist/variable/ESLintScopeVariable.js
var require_ESLintScopeVariable = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/variable/ESLintScopeVariable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ESLintScopeVariable = void 0;
    var VariableBase_1 = require_VariableBase();
    var ESLintScopeVariable = class extends VariableBase_1.VariableBase {
      /**
       * Written to by ESLint.
       * If this key exists, this variable is a global variable added by ESLint.
       * If this is `true`, this variable can be assigned arbitrary values.
       * If this is `false`, this variable is readonly.
       */
      writeable;
      // note that this isn't a typo - ESlint uses this spelling here
      /**
       * Written to by ESLint.
       * This property is undefined if there are no globals comment directives.
       * The array of globals comment directives which defined this global variable in the source code file.
       */
      eslintExplicitGlobal;
      /**
       * Written to by ESLint.
       * The configured value in config files. This can be different from `variable.writeable` if there are globals comment directives.
       */
      eslintImplicitGlobalSetting;
      /**
       * Written to by ESLint.
       * If this key exists, it is a global variable added by ESLint.
       * If `true`, this global variable was defined by a globals comment directive in the source code file.
       */
      eslintExplicitGlobalComments;
    };
    exports.ESLintScopeVariable = ESLintScopeVariable;
  }
});

// node_modules/@typescript-eslint/scope-manager/dist/variable/ImplicitLibVariable.js
var require_ImplicitLibVariable = __commonJS({
  "node_modules/@typescript-eslint/scope-manager/dist/variable/ImplicitLibVariable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImplicitLibVariable = void 0;
    var ESLintScopeVariable_1 = require_ESLintScopeVariable();
    var ImplicitLibVariable = class extends ESLintScopeVariable_1.ESLintScopeVariable {
      /**
       * `true` if the variable is valid in a type context, false otherwise
       */
      isTypeVariable;
      /**
       * `true` if the variable is valid in a value context, false otherwise
       */
      isValueVariable;
      constructor(scope, name, { eslintImplicitGlobalSetting, isTypeVariable, isValueVariable, writeable }) {
        super(name, scope);
        this.isTypeVariable = isTypeVariable ?? false;
        this.isValueVariable = isValueVariable ?? false;
        this.writeable = writeable ?? false;
        this.eslintImplicitGlobalSetting = eslintImplicitGlobalSetting ?? "readonly";
      }
    };
    exports.ImplicitLibVariable = ImplicitLibVariable;
  }
});

// small-unused-pure:scope
var require_scope = __commonJS({
  "small-unused-pure:scope"(exports) {
    exports.DefinitionType = require_DefinitionType().DefinitionType;
    exports.ScopeType = require_ScopeType().ScopeType;
    exports.Visitor = require_Visitor().Visitor;
    exports.PatternVisitor = require_PatternVisitor().PatternVisitor;
    exports.ImplicitLibVariable = require_ImplicitLibVariable().ImplicitLibVariable;
  }
});

// node_modules/@typescript-eslint/types/dist/generated/ast-spec.js
var require_ast_spec = __commonJS({
  "node_modules/@typescript-eslint/types/dist/generated/ast-spec.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AST_TOKEN_TYPES = exports.AST_NODE_TYPES = void 0;
    var AST_NODE_TYPES;
    (function(AST_NODE_TYPES2) {
      AST_NODE_TYPES2["AccessorProperty"] = "AccessorProperty";
      AST_NODE_TYPES2["ArrayExpression"] = "ArrayExpression";
      AST_NODE_TYPES2["ArrayPattern"] = "ArrayPattern";
      AST_NODE_TYPES2["ArrowFunctionExpression"] = "ArrowFunctionExpression";
      AST_NODE_TYPES2["AssignmentExpression"] = "AssignmentExpression";
      AST_NODE_TYPES2["AssignmentPattern"] = "AssignmentPattern";
      AST_NODE_TYPES2["AwaitExpression"] = "AwaitExpression";
      AST_NODE_TYPES2["BinaryExpression"] = "BinaryExpression";
      AST_NODE_TYPES2["BlockStatement"] = "BlockStatement";
      AST_NODE_TYPES2["BreakStatement"] = "BreakStatement";
      AST_NODE_TYPES2["CallExpression"] = "CallExpression";
      AST_NODE_TYPES2["CatchClause"] = "CatchClause";
      AST_NODE_TYPES2["ChainExpression"] = "ChainExpression";
      AST_NODE_TYPES2["ClassBody"] = "ClassBody";
      AST_NODE_TYPES2["ClassDeclaration"] = "ClassDeclaration";
      AST_NODE_TYPES2["ClassExpression"] = "ClassExpression";
      AST_NODE_TYPES2["ConditionalExpression"] = "ConditionalExpression";
      AST_NODE_TYPES2["ContinueStatement"] = "ContinueStatement";
      AST_NODE_TYPES2["DebuggerStatement"] = "DebuggerStatement";
      AST_NODE_TYPES2["Decorator"] = "Decorator";
      AST_NODE_TYPES2["DoWhileStatement"] = "DoWhileStatement";
      AST_NODE_TYPES2["EmptyStatement"] = "EmptyStatement";
      AST_NODE_TYPES2["ExportAllDeclaration"] = "ExportAllDeclaration";
      AST_NODE_TYPES2["ExportDefaultDeclaration"] = "ExportDefaultDeclaration";
      AST_NODE_TYPES2["ExportNamedDeclaration"] = "ExportNamedDeclaration";
      AST_NODE_TYPES2["ExportSpecifier"] = "ExportSpecifier";
      AST_NODE_TYPES2["ExpressionStatement"] = "ExpressionStatement";
      AST_NODE_TYPES2["ForInStatement"] = "ForInStatement";
      AST_NODE_TYPES2["ForOfStatement"] = "ForOfStatement";
      AST_NODE_TYPES2["ForStatement"] = "ForStatement";
      AST_NODE_TYPES2["FunctionDeclaration"] = "FunctionDeclaration";
      AST_NODE_TYPES2["FunctionExpression"] = "FunctionExpression";
      AST_NODE_TYPES2["Identifier"] = "Identifier";
      AST_NODE_TYPES2["IfStatement"] = "IfStatement";
      AST_NODE_TYPES2["ImportAttribute"] = "ImportAttribute";
      AST_NODE_TYPES2["ImportDeclaration"] = "ImportDeclaration";
      AST_NODE_TYPES2["ImportDefaultSpecifier"] = "ImportDefaultSpecifier";
      AST_NODE_TYPES2["ImportExpression"] = "ImportExpression";
      AST_NODE_TYPES2["ImportNamespaceSpecifier"] = "ImportNamespaceSpecifier";
      AST_NODE_TYPES2["ImportSpecifier"] = "ImportSpecifier";
      AST_NODE_TYPES2["JSXAttribute"] = "JSXAttribute";
      AST_NODE_TYPES2["JSXClosingElement"] = "JSXClosingElement";
      AST_NODE_TYPES2["JSXClosingFragment"] = "JSXClosingFragment";
      AST_NODE_TYPES2["JSXElement"] = "JSXElement";
      AST_NODE_TYPES2["JSXEmptyExpression"] = "JSXEmptyExpression";
      AST_NODE_TYPES2["JSXExpressionContainer"] = "JSXExpressionContainer";
      AST_NODE_TYPES2["JSXFragment"] = "JSXFragment";
      AST_NODE_TYPES2["JSXIdentifier"] = "JSXIdentifier";
      AST_NODE_TYPES2["JSXMemberExpression"] = "JSXMemberExpression";
      AST_NODE_TYPES2["JSXNamespacedName"] = "JSXNamespacedName";
      AST_NODE_TYPES2["JSXOpeningElement"] = "JSXOpeningElement";
      AST_NODE_TYPES2["JSXOpeningFragment"] = "JSXOpeningFragment";
      AST_NODE_TYPES2["JSXSpreadAttribute"] = "JSXSpreadAttribute";
      AST_NODE_TYPES2["JSXSpreadChild"] = "JSXSpreadChild";
      AST_NODE_TYPES2["JSXText"] = "JSXText";
      AST_NODE_TYPES2["LabeledStatement"] = "LabeledStatement";
      AST_NODE_TYPES2["Literal"] = "Literal";
      AST_NODE_TYPES2["LogicalExpression"] = "LogicalExpression";
      AST_NODE_TYPES2["MemberExpression"] = "MemberExpression";
      AST_NODE_TYPES2["MetaProperty"] = "MetaProperty";
      AST_NODE_TYPES2["MethodDefinition"] = "MethodDefinition";
      AST_NODE_TYPES2["NewExpression"] = "NewExpression";
      AST_NODE_TYPES2["ObjectExpression"] = "ObjectExpression";
      AST_NODE_TYPES2["ObjectPattern"] = "ObjectPattern";
      AST_NODE_TYPES2["PrivateIdentifier"] = "PrivateIdentifier";
      AST_NODE_TYPES2["Program"] = "Program";
      AST_NODE_TYPES2["Property"] = "Property";
      AST_NODE_TYPES2["PropertyDefinition"] = "PropertyDefinition";
      AST_NODE_TYPES2["RestElement"] = "RestElement";
      AST_NODE_TYPES2["ReturnStatement"] = "ReturnStatement";
      AST_NODE_TYPES2["SequenceExpression"] = "SequenceExpression";
      AST_NODE_TYPES2["SpreadElement"] = "SpreadElement";
      AST_NODE_TYPES2["StaticBlock"] = "StaticBlock";
      AST_NODE_TYPES2["Super"] = "Super";
      AST_NODE_TYPES2["SwitchCase"] = "SwitchCase";
      AST_NODE_TYPES2["SwitchStatement"] = "SwitchStatement";
      AST_NODE_TYPES2["TaggedTemplateExpression"] = "TaggedTemplateExpression";
      AST_NODE_TYPES2["TemplateElement"] = "TemplateElement";
      AST_NODE_TYPES2["TemplateLiteral"] = "TemplateLiteral";
      AST_NODE_TYPES2["ThisExpression"] = "ThisExpression";
      AST_NODE_TYPES2["ThrowStatement"] = "ThrowStatement";
      AST_NODE_TYPES2["TryStatement"] = "TryStatement";
      AST_NODE_TYPES2["UnaryExpression"] = "UnaryExpression";
      AST_NODE_TYPES2["UpdateExpression"] = "UpdateExpression";
      AST_NODE_TYPES2["VariableDeclaration"] = "VariableDeclaration";
      AST_NODE_TYPES2["VariableDeclarator"] = "VariableDeclarator";
      AST_NODE_TYPES2["WhileStatement"] = "WhileStatement";
      AST_NODE_TYPES2["WithStatement"] = "WithStatement";
      AST_NODE_TYPES2["YieldExpression"] = "YieldExpression";
      AST_NODE_TYPES2["TSAbstractAccessorProperty"] = "TSAbstractAccessorProperty";
      AST_NODE_TYPES2["TSAbstractKeyword"] = "TSAbstractKeyword";
      AST_NODE_TYPES2["TSAbstractMethodDefinition"] = "TSAbstractMethodDefinition";
      AST_NODE_TYPES2["TSAbstractPropertyDefinition"] = "TSAbstractPropertyDefinition";
      AST_NODE_TYPES2["TSAnyKeyword"] = "TSAnyKeyword";
      AST_NODE_TYPES2["TSArrayType"] = "TSArrayType";
      AST_NODE_TYPES2["TSAsExpression"] = "TSAsExpression";
      AST_NODE_TYPES2["TSAsyncKeyword"] = "TSAsyncKeyword";
      AST_NODE_TYPES2["TSBigIntKeyword"] = "TSBigIntKeyword";
      AST_NODE_TYPES2["TSBooleanKeyword"] = "TSBooleanKeyword";
      AST_NODE_TYPES2["TSCallSignatureDeclaration"] = "TSCallSignatureDeclaration";
      AST_NODE_TYPES2["TSClassImplements"] = "TSClassImplements";
      AST_NODE_TYPES2["TSConditionalType"] = "TSConditionalType";
      AST_NODE_TYPES2["TSConstructorType"] = "TSConstructorType";
      AST_NODE_TYPES2["TSConstructSignatureDeclaration"] = "TSConstructSignatureDeclaration";
      AST_NODE_TYPES2["TSDeclareFunction"] = "TSDeclareFunction";
      AST_NODE_TYPES2["TSDeclareKeyword"] = "TSDeclareKeyword";
      AST_NODE_TYPES2["TSEmptyBodyFunctionExpression"] = "TSEmptyBodyFunctionExpression";
      AST_NODE_TYPES2["TSEnumBody"] = "TSEnumBody";
      AST_NODE_TYPES2["TSEnumDeclaration"] = "TSEnumDeclaration";
      AST_NODE_TYPES2["TSEnumMember"] = "TSEnumMember";
      AST_NODE_TYPES2["TSExportAssignment"] = "TSExportAssignment";
      AST_NODE_TYPES2["TSExportKeyword"] = "TSExportKeyword";
      AST_NODE_TYPES2["TSExternalModuleReference"] = "TSExternalModuleReference";
      AST_NODE_TYPES2["TSFunctionType"] = "TSFunctionType";
      AST_NODE_TYPES2["TSImportEqualsDeclaration"] = "TSImportEqualsDeclaration";
      AST_NODE_TYPES2["TSImportType"] = "TSImportType";
      AST_NODE_TYPES2["TSIndexedAccessType"] = "TSIndexedAccessType";
      AST_NODE_TYPES2["TSIndexSignature"] = "TSIndexSignature";
      AST_NODE_TYPES2["TSInferType"] = "TSInferType";
      AST_NODE_TYPES2["TSInstantiationExpression"] = "TSInstantiationExpression";
      AST_NODE_TYPES2["TSInterfaceBody"] = "TSInterfaceBody";
      AST_NODE_TYPES2["TSInterfaceDeclaration"] = "TSInterfaceDeclaration";
      AST_NODE_TYPES2["TSInterfaceHeritage"] = "TSInterfaceHeritage";
      AST_NODE_TYPES2["TSIntersectionType"] = "TSIntersectionType";
      AST_NODE_TYPES2["TSIntrinsicKeyword"] = "TSIntrinsicKeyword";
      AST_NODE_TYPES2["TSLiteralType"] = "TSLiteralType";
      AST_NODE_TYPES2["TSMappedType"] = "TSMappedType";
      AST_NODE_TYPES2["TSMethodSignature"] = "TSMethodSignature";
      AST_NODE_TYPES2["TSModuleBlock"] = "TSModuleBlock";
      AST_NODE_TYPES2["TSModuleDeclaration"] = "TSModuleDeclaration";
      AST_NODE_TYPES2["TSNamedTupleMember"] = "TSNamedTupleMember";
      AST_NODE_TYPES2["TSNamespaceExportDeclaration"] = "TSNamespaceExportDeclaration";
      AST_NODE_TYPES2["TSNeverKeyword"] = "TSNeverKeyword";
      AST_NODE_TYPES2["TSNonNullExpression"] = "TSNonNullExpression";
      AST_NODE_TYPES2["TSNullKeyword"] = "TSNullKeyword";
      AST_NODE_TYPES2["TSNumberKeyword"] = "TSNumberKeyword";
      AST_NODE_TYPES2["TSObjectKeyword"] = "TSObjectKeyword";
      AST_NODE_TYPES2["TSOptionalType"] = "TSOptionalType";
      AST_NODE_TYPES2["TSParameterProperty"] = "TSParameterProperty";
      AST_NODE_TYPES2["TSPrivateKeyword"] = "TSPrivateKeyword";
      AST_NODE_TYPES2["TSPropertySignature"] = "TSPropertySignature";
      AST_NODE_TYPES2["TSProtectedKeyword"] = "TSProtectedKeyword";
      AST_NODE_TYPES2["TSPublicKeyword"] = "TSPublicKeyword";
      AST_NODE_TYPES2["TSQualifiedName"] = "TSQualifiedName";
      AST_NODE_TYPES2["TSReadonlyKeyword"] = "TSReadonlyKeyword";
      AST_NODE_TYPES2["TSRestType"] = "TSRestType";
      AST_NODE_TYPES2["TSSatisfiesExpression"] = "TSSatisfiesExpression";
      AST_NODE_TYPES2["TSStaticKeyword"] = "TSStaticKeyword";
      AST_NODE_TYPES2["TSStringKeyword"] = "TSStringKeyword";
      AST_NODE_TYPES2["TSSymbolKeyword"] = "TSSymbolKeyword";
      AST_NODE_TYPES2["TSTemplateLiteralType"] = "TSTemplateLiteralType";
      AST_NODE_TYPES2["TSThisType"] = "TSThisType";
      AST_NODE_TYPES2["TSTupleType"] = "TSTupleType";
      AST_NODE_TYPES2["TSTypeAliasDeclaration"] = "TSTypeAliasDeclaration";
      AST_NODE_TYPES2["TSTypeAnnotation"] = "TSTypeAnnotation";
      AST_NODE_TYPES2["TSTypeAssertion"] = "TSTypeAssertion";
      AST_NODE_TYPES2["TSTypeLiteral"] = "TSTypeLiteral";
      AST_NODE_TYPES2["TSTypeOperator"] = "TSTypeOperator";
      AST_NODE_TYPES2["TSTypeParameter"] = "TSTypeParameter";
      AST_NODE_TYPES2["TSTypeParameterDeclaration"] = "TSTypeParameterDeclaration";
      AST_NODE_TYPES2["TSTypeParameterInstantiation"] = "TSTypeParameterInstantiation";
      AST_NODE_TYPES2["TSTypePredicate"] = "TSTypePredicate";
      AST_NODE_TYPES2["TSTypeQuery"] = "TSTypeQuery";
      AST_NODE_TYPES2["TSTypeReference"] = "TSTypeReference";
      AST_NODE_TYPES2["TSUndefinedKeyword"] = "TSUndefinedKeyword";
      AST_NODE_TYPES2["TSUnionType"] = "TSUnionType";
      AST_NODE_TYPES2["TSUnknownKeyword"] = "TSUnknownKeyword";
      AST_NODE_TYPES2["TSVoidKeyword"] = "TSVoidKeyword";
    })(AST_NODE_TYPES || (exports.AST_NODE_TYPES = AST_NODE_TYPES = {}));
    var AST_TOKEN_TYPES;
    (function(AST_TOKEN_TYPES2) {
      AST_TOKEN_TYPES2["Boolean"] = "Boolean";
      AST_TOKEN_TYPES2["Identifier"] = "Identifier";
      AST_TOKEN_TYPES2["JSXIdentifier"] = "JSXIdentifier";
      AST_TOKEN_TYPES2["PrivateIdentifier"] = "PrivateIdentifier";
      AST_TOKEN_TYPES2["JSXText"] = "JSXText";
      AST_TOKEN_TYPES2["Keyword"] = "Keyword";
      AST_TOKEN_TYPES2["Null"] = "Null";
      AST_TOKEN_TYPES2["Numeric"] = "Numeric";
      AST_TOKEN_TYPES2["Punctuator"] = "Punctuator";
      AST_TOKEN_TYPES2["RegularExpression"] = "RegularExpression";
      AST_TOKEN_TYPES2["String"] = "String";
      AST_TOKEN_TYPES2["Template"] = "Template";
      AST_TOKEN_TYPES2["Block"] = "Block";
      AST_TOKEN_TYPES2["Line"] = "Line";
    })(AST_TOKEN_TYPES || (exports.AST_TOKEN_TYPES = AST_TOKEN_TYPES = {}));
  }
});

// node_modules/@typescript-eslint/types/dist/lib.js
var require_lib = __commonJS({
  "node_modules/@typescript-eslint/types/dist/lib.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@typescript-eslint/types/dist/parser-options.js
var require_parser_options = __commonJS({
  "node_modules/@typescript-eslint/types/dist/parser-options.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@typescript-eslint/types/dist/ts-estree.js
var require_ts_estree = __commonJS({
  "node_modules/@typescript-eslint/types/dist/ts-estree.js"(exports) {
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
    exports.TSESTree = void 0;
    exports.TSESTree = __importStar(require_ast_spec());
  }
});

// node_modules/@typescript-eslint/types/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/@typescript-eslint/types/dist/index.js"(exports) {
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
    exports.AST_TOKEN_TYPES = exports.AST_NODE_TYPES = void 0;
    var ast_spec_1 = require_ast_spec();
    Object.defineProperty(exports, "AST_NODE_TYPES", { enumerable: true, get: function() {
      return ast_spec_1.AST_NODE_TYPES;
    } });
    Object.defineProperty(exports, "AST_TOKEN_TYPES", { enumerable: true, get: function() {
      return ast_spec_1.AST_TOKEN_TYPES;
    } });
    __exportStar(require_lib(), exports);
    __exportStar(require_parser_options(), exports);
    __exportStar(require_ts_estree(), exports);
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/astUtilities.js
var require_astUtilities = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/astUtilities.js"(exports) {
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
    exports.isParenthesized = exports.hasSideEffect = exports.getStringIfConstant = exports.getStaticValue = exports.getPropertyName = exports.getFunctionNameWithKind = exports.getFunctionHeadLocation = void 0;
    var eslintUtils = __importStar(__require("../_deps/eslint-community-eslint-utils.js"));
    exports.getFunctionHeadLocation = eslintUtils.getFunctionHeadLocation;
    exports.getFunctionNameWithKind = eslintUtils.getFunctionNameWithKind;
    exports.getPropertyName = eslintUtils.getPropertyName;
    exports.getStaticValue = eslintUtils.getStaticValue;
    exports.getStringIfConstant = eslintUtils.getStringIfConstant;
    exports.hasSideEffect = eslintUtils.hasSideEffect;
    exports.isParenthesized = eslintUtils.isParenthesized;
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/PatternMatcher.js
var require_PatternMatcher = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/PatternMatcher.js"(exports) {
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
    exports.PatternMatcher = void 0;
    var eslintUtils = __importStar(__require("../_deps/eslint-community-eslint-utils.js"));
    exports.PatternMatcher = eslintUtils.PatternMatcher;
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/predicates.js
var require_predicates = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/predicates.js"(exports) {
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
    exports.isNotSemicolonToken = exports.isSemicolonToken = exports.isNotOpeningParenToken = exports.isOpeningParenToken = exports.isNotOpeningBracketToken = exports.isOpeningBracketToken = exports.isNotOpeningBraceToken = exports.isOpeningBraceToken = exports.isNotCommentToken = exports.isCommentToken = exports.isNotCommaToken = exports.isCommaToken = exports.isNotColonToken = exports.isColonToken = exports.isNotClosingParenToken = exports.isClosingParenToken = exports.isNotClosingBracketToken = exports.isClosingBracketToken = exports.isNotClosingBraceToken = exports.isClosingBraceToken = exports.isNotArrowToken = exports.isArrowToken = void 0;
    var eslintUtils = __importStar(__require("../_deps/eslint-community-eslint-utils.js"));
    exports.isArrowToken = eslintUtils.isArrowToken;
    exports.isNotArrowToken = eslintUtils.isNotArrowToken;
    exports.isClosingBraceToken = eslintUtils.isClosingBraceToken;
    exports.isNotClosingBraceToken = eslintUtils.isNotClosingBraceToken;
    exports.isClosingBracketToken = eslintUtils.isClosingBracketToken;
    exports.isNotClosingBracketToken = eslintUtils.isNotClosingBracketToken;
    exports.isClosingParenToken = eslintUtils.isClosingParenToken;
    exports.isNotClosingParenToken = eslintUtils.isNotClosingParenToken;
    exports.isColonToken = eslintUtils.isColonToken;
    exports.isNotColonToken = eslintUtils.isNotColonToken;
    exports.isCommaToken = eslintUtils.isCommaToken;
    exports.isNotCommaToken = eslintUtils.isNotCommaToken;
    exports.isCommentToken = eslintUtils.isCommentToken;
    exports.isNotCommentToken = eslintUtils.isNotCommentToken;
    exports.isOpeningBraceToken = eslintUtils.isOpeningBraceToken;
    exports.isNotOpeningBraceToken = eslintUtils.isNotOpeningBraceToken;
    exports.isOpeningBracketToken = eslintUtils.isOpeningBracketToken;
    exports.isNotOpeningBracketToken = eslintUtils.isNotOpeningBracketToken;
    exports.isOpeningParenToken = eslintUtils.isOpeningParenToken;
    exports.isNotOpeningParenToken = eslintUtils.isNotOpeningParenToken;
    exports.isSemicolonToken = eslintUtils.isSemicolonToken;
    exports.isNotSemicolonToken = eslintUtils.isNotSemicolonToken;
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/ReferenceTracker.js
var require_ReferenceTracker = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/ReferenceTracker.js"(exports) {
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
    exports.ReferenceTracker = void 0;
    var eslintUtils = __importStar(__require("../_deps/eslint-community-eslint-utils.js"));
    var ReferenceTrackerREAD = eslintUtils.ReferenceTracker.READ;
    var ReferenceTrackerCALL = eslintUtils.ReferenceTracker.CALL;
    var ReferenceTrackerCONSTRUCT = eslintUtils.ReferenceTracker.CONSTRUCT;
    var ReferenceTrackerESM = eslintUtils.ReferenceTracker.ESM;
    exports.ReferenceTracker = eslintUtils.ReferenceTracker;
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/scopeAnalysis.js
var require_scopeAnalysis = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/scopeAnalysis.js"(exports) {
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
    exports.getInnermostScope = exports.findVariable = void 0;
    var eslintUtils = __importStar(__require("../_deps/eslint-community-eslint-utils.js"));
    exports.findVariable = eslintUtils.findVariable;
    exports.getInnermostScope = eslintUtils.getInnermostScope;
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/index.js
var require_eslint_utils = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/eslint-utils/index.js"(exports) {
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
    __exportStar(require_astUtilities(), exports);
    __exportStar(require_PatternMatcher(), exports);
    __exportStar(require_predicates(), exports);
    __exportStar(require_ReferenceTracker(), exports);
    __exportStar(require_scopeAnalysis(), exports);
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/helpers.js
var require_helpers = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/helpers.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNotTokenOfTypeWithConditions = exports.isTokenOfTypeWithConditions = exports.isNodeOfTypeWithConditions = exports.isNodeOfTypes = exports.isNodeOfType = void 0;
    var isNodeOfType = (nodeType) => (node) => node?.type === nodeType;
    exports.isNodeOfType = isNodeOfType;
    var isNodeOfTypes = (nodeTypes) => (node) => !!node && nodeTypes.includes(node.type);
    exports.isNodeOfTypes = isNodeOfTypes;
    var isNodeOfTypeWithConditions = (nodeType, conditions) => {
      const entries = Object.entries(conditions);
      return (node) => node?.type === nodeType && entries.every(([key, value]) => node[key] === value);
    };
    exports.isNodeOfTypeWithConditions = isNodeOfTypeWithConditions;
    var isTokenOfTypeWithConditions = (tokenType, conditions) => {
      const entries = Object.entries(conditions);
      return (token) => token?.type === tokenType && entries.every(([key, value]) => token[key] === value);
    };
    exports.isTokenOfTypeWithConditions = isTokenOfTypeWithConditions;
    var isNotTokenOfTypeWithConditions = (tokenType, conditions) => (token) => !(0, exports.isTokenOfTypeWithConditions)(tokenType, conditions)(token);
    exports.isNotTokenOfTypeWithConditions = isNotTokenOfTypeWithConditions;
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/misc.js
var require_misc = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/misc.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LINEBREAK_MATCHER = void 0;
    exports.isTokenOnSameLine = isTokenOnSameLine;
    exports.LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;
    function isTokenOnSameLine(left, right) {
      return left.loc.end.line === right.loc.start.line;
    }
  }
});

// node_modules/@typescript-eslint/utils/dist/ts-estree.js
var require_ts_estree2 = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ts-estree.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TSESTree = exports.AST_TOKEN_TYPES = exports.AST_NODE_TYPES = void 0;
    var types_1 = __require("@typescript-eslint/types");
    Object.defineProperty(exports, "AST_NODE_TYPES", { enumerable: true, get: function() {
      return types_1.AST_NODE_TYPES;
    } });
    Object.defineProperty(exports, "AST_TOKEN_TYPES", { enumerable: true, get: function() {
      return types_1.AST_TOKEN_TYPES;
    } });
    Object.defineProperty(exports, "TSESTree", { enumerable: true, get: function() {
      return types_1.TSESTree;
    } });
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/predicates.js
var require_predicates2 = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/predicates.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLoop = exports.isImportKeyword = exports.isTypeKeyword = exports.isAwaitKeyword = exports.isAwaitExpression = exports.isIdentifier = exports.isConstructor = exports.isClassOrTypeElement = exports.isTSConstructorType = exports.isTSFunctionType = exports.isFunctionOrFunctionType = exports.isFunctionType = exports.isFunction = exports.isVariableDeclarator = exports.isTypeAssertion = exports.isLogicalOrOperator = exports.isOptionalCallExpression = exports.isNotNonNullAssertionPunctuator = exports.isNonNullAssertionPunctuator = exports.isNotOptionalChainPunctuator = exports.isOptionalChainPunctuator = void 0;
    exports.isSetter = isSetter;
    var ts_estree_1 = require_ts_estree2();
    var helpers_1 = require_helpers();
    exports.isOptionalChainPunctuator = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Punctuator, { value: "?." });
    exports.isNotOptionalChainPunctuator = (0, helpers_1.isNotTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Punctuator, { value: "?." });
    exports.isNonNullAssertionPunctuator = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Punctuator, { value: "!" });
    exports.isNotNonNullAssertionPunctuator = (0, helpers_1.isNotTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Punctuator, { value: "!" });
    exports.isOptionalCallExpression = (0, helpers_1.isNodeOfTypeWithConditions)(
      ts_estree_1.AST_NODE_TYPES.CallExpression,
      // this flag means the call expression itself is option
      // i.e. it is foo.bar?.() and not foo?.bar()
      { optional: true }
    );
    exports.isLogicalOrOperator = (0, helpers_1.isNodeOfTypeWithConditions)(ts_estree_1.AST_NODE_TYPES.LogicalExpression, { operator: "||" });
    exports.isTypeAssertion = (0, helpers_1.isNodeOfTypes)([
      ts_estree_1.AST_NODE_TYPES.TSAsExpression,
      ts_estree_1.AST_NODE_TYPES.TSTypeAssertion
    ]);
    exports.isVariableDeclarator = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.VariableDeclarator);
    var functionTypes = [
      ts_estree_1.AST_NODE_TYPES.ArrowFunctionExpression,
      ts_estree_1.AST_NODE_TYPES.FunctionDeclaration,
      ts_estree_1.AST_NODE_TYPES.FunctionExpression
    ];
    exports.isFunction = (0, helpers_1.isNodeOfTypes)(functionTypes);
    var functionTypeTypes = [
      ts_estree_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
      ts_estree_1.AST_NODE_TYPES.TSConstructorType,
      ts_estree_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
      ts_estree_1.AST_NODE_TYPES.TSDeclareFunction,
      ts_estree_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
      ts_estree_1.AST_NODE_TYPES.TSFunctionType,
      ts_estree_1.AST_NODE_TYPES.TSMethodSignature
    ];
    exports.isFunctionType = (0, helpers_1.isNodeOfTypes)(functionTypeTypes);
    exports.isFunctionOrFunctionType = (0, helpers_1.isNodeOfTypes)([
      ...functionTypes,
      ...functionTypeTypes
    ]);
    exports.isTSFunctionType = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.TSFunctionType);
    exports.isTSConstructorType = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.TSConstructorType);
    exports.isClassOrTypeElement = (0, helpers_1.isNodeOfTypes)([
      // ClassElement
      ts_estree_1.AST_NODE_TYPES.PropertyDefinition,
      ts_estree_1.AST_NODE_TYPES.FunctionExpression,
      ts_estree_1.AST_NODE_TYPES.MethodDefinition,
      ts_estree_1.AST_NODE_TYPES.TSAbstractPropertyDefinition,
      ts_estree_1.AST_NODE_TYPES.TSAbstractMethodDefinition,
      ts_estree_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
      ts_estree_1.AST_NODE_TYPES.TSIndexSignature,
      // TypeElement
      ts_estree_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
      ts_estree_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
      // AST_NODE_TYPES.TSIndexSignature,
      ts_estree_1.AST_NODE_TYPES.TSMethodSignature,
      ts_estree_1.AST_NODE_TYPES.TSPropertySignature
    ]);
    exports.isConstructor = (0, helpers_1.isNodeOfTypeWithConditions)(ts_estree_1.AST_NODE_TYPES.MethodDefinition, { kind: "constructor" });
    function isSetter(node) {
      return !!node && (node.type === ts_estree_1.AST_NODE_TYPES.MethodDefinition || node.type === ts_estree_1.AST_NODE_TYPES.Property) && node.kind === "set";
    }
    exports.isIdentifier = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.Identifier);
    exports.isAwaitExpression = (0, helpers_1.isNodeOfType)(ts_estree_1.AST_NODE_TYPES.AwaitExpression);
    exports.isAwaitKeyword = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Identifier, { value: "await" });
    exports.isTypeKeyword = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Identifier, { value: "type" });
    exports.isImportKeyword = (0, helpers_1.isTokenOfTypeWithConditions)(ts_estree_1.AST_TOKEN_TYPES.Keyword, { value: "import" });
    exports.isLoop = (0, helpers_1.isNodeOfTypes)([
      ts_estree_1.AST_NODE_TYPES.DoWhileStatement,
      ts_estree_1.AST_NODE_TYPES.ForStatement,
      ts_estree_1.AST_NODE_TYPES.ForInStatement,
      ts_estree_1.AST_NODE_TYPES.ForOfStatement,
      ts_estree_1.AST_NODE_TYPES.WhileStatement
    ]);
  }
});

// node_modules/@typescript-eslint/utils/dist/ast-utils/index.js
var require_ast_utils = __commonJS({
  "node_modules/@typescript-eslint/utils/dist/ast-utils/index.js"(exports) {
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
    __exportStar(require_eslint_utils(), exports);
    __exportStar(require_helpers(), exports);
    __exportStar(require_misc(), exports);
    __exportStar(require_predicates2(), exports);
  }
});

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
var require_eslint_utils2 = __commonJS({
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
    var scopeManager = __importStar(require_scope());
    var Scope;
    (function(Scope2) {
      Scope2.ScopeType = scopeManager.ScopeType;
      Scope2.DefinitionType = scopeManager.DefinitionType;
    })(Scope || (exports.Scope = Scope = {}));
  }
});

// small-unused-pure:utils
var require_utils = __commonJS({
  "small-unused-pure:utils"(exports) {
    var types = require_dist2();
    exports.AST_NODE_TYPES = types.AST_NODE_TYPES;
    exports.AST_TOKEN_TYPES = types.AST_TOKEN_TYPES;
    exports.TSESTree = types.TSESTree;
    exports.ASTUtils = require_ast_utils();
    exports.ESLintUtils = require_eslint_utils2();
    exports.TSESLint = { Scope: require_Scope().Scope };
  }
});

// node_modules/@typescript-eslint/eslint-plugin/dist/util/createRule.js
var require_createRule = __commonJS({
  "node_modules/@typescript-eslint/eslint-plugin/dist/util/createRule.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createRule = void 0;
    var utils_1 = require_utils();
    exports.createRule = utils_1.ESLintUtils.RuleCreator((name) => `https://typescript-eslint.io/rules/${name}`);
  }
});

// node_modules/@typescript-eslint/eslint-plugin/dist/util/isTypeImport.js
var require_isTypeImport = __commonJS({
  "node_modules/@typescript-eslint/eslint-plugin/dist/util/isTypeImport.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isTypeImport = isTypeImport;
    var scope_manager_1 = require_scope();
    var utils_1 = require_utils();
    function isTypeImport(definition) {
      return definition?.type === scope_manager_1.DefinitionType.ImportBinding && (definition.parent.importKind === "type" || definition.node.type === utils_1.AST_NODE_TYPES.ImportSpecifier && definition.node.importKind === "type");
    }
  }
});

// node_modules/@typescript-eslint/eslint-plugin/dist/util/referenceContainsTypePredicate.js
var require_referenceContainsTypePredicate = __commonJS({
  "node_modules/@typescript-eslint/eslint-plugin/dist/util/referenceContainsTypePredicate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.referenceContainsTypePredicate = referenceContainsTypePredicate;
    var utils_1 = require_utils();
    function referenceContainsTypePredicate(node) {
      switch (node.type) {
        case utils_1.AST_NODE_TYPES.TSTypePredicate:
          return true;
        case utils_1.AST_NODE_TYPES.TSQualifiedName:
        case utils_1.AST_NODE_TYPES.Identifier:
          return referenceContainsTypePredicate(node.parent);
        default:
          return false;
      }
    }
  }
});

// node_modules/@typescript-eslint/eslint-plugin/dist/util/referenceContainsTypeQuery.js
var require_referenceContainsTypeQuery = __commonJS({
  "node_modules/@typescript-eslint/eslint-plugin/dist/util/referenceContainsTypeQuery.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.referenceContainsTypeQuery = referenceContainsTypeQuery;
    var utils_1 = require_utils();
    function referenceContainsTypeQuery(node) {
      switch (node.type) {
        case utils_1.AST_NODE_TYPES.TSTypeQuery:
          return true;
        case utils_1.AST_NODE_TYPES.TSQualifiedName:
        case utils_1.AST_NODE_TYPES.Identifier:
          return referenceContainsTypeQuery(node.parent);
        default:
          return false;
      }
    }
  }
});

// node_modules/@typescript-eslint/eslint-plugin/dist/util/collectUnusedVariables.js
var require_collectUnusedVariables = __commonJS({
  "node_modules/@typescript-eslint/eslint-plugin/dist/util/collectUnusedVariables.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.collectVariables = collectVariables;
    var scope_manager_1 = require_scope();
    var utils_1 = require_utils();
    var isTypeImport_1 = require_isTypeImport();
    var referenceContainsTypePredicate_1 = require_referenceContainsTypePredicate();
    var referenceContainsTypeQuery_1 = require_referenceContainsTypeQuery();
    var UnusedVarsVisitor = class extends scope_manager_1.Visitor {
      /**
       * We keep a weak cache so that multiple rules can share the calculation
       */
      static RESULTS_CACHE = /* @__PURE__ */ new WeakMap();
      ClassDeclaration = this.visitClass;
      ClassExpression = this.visitClass;
      ForInStatement = this.visitForInForOf;
      ForOfStatement = this.visitForInForOf;
      //#region HELPERS
      FunctionDeclaration = this.visitFunction;
      FunctionExpression = this.visitFunction;
      MethodDefinition = this.visitSetter;
      Property = this.visitSetter;
      TSCallSignatureDeclaration = this.visitFunctionTypeSignature;
      TSConstructorType = this.visitFunctionTypeSignature;
      TSConstructSignatureDeclaration = this.visitFunctionTypeSignature;
      TSDeclareFunction = this.visitFunctionTypeSignature;
      TSEmptyBodyFunctionExpression = this.visitFunctionTypeSignature;
      //#endregion HELPERS
      //#region VISITORS
      // NOTE - This is a simple visitor - meaning it does not support selectors
      TSFunctionType = this.visitFunctionTypeSignature;
      TSMethodSignature = this.visitFunctionTypeSignature;
      #scopeManager;
      constructor(scopeManager) {
        super({
          visitChildrenEvenIfSelectorExists: true
        });
        this.#scopeManager = scopeManager;
      }
      static collectUnusedVariables(program, scopeManager) {
        const cached = this.RESULTS_CACHE.get(program);
        if (cached) {
          return cached;
        }
        const visitor = new this(scopeManager);
        visitor.visit(program);
        const unusedVars = visitor.collectUnusedVariables(visitor.getScope(program));
        this.RESULTS_CACHE.set(program, unusedVars);
        return unusedVars;
      }
      Identifier(node) {
        const scope = this.getScope(node);
        if (scope.type === utils_1.TSESLint.Scope.ScopeType.function && node.name === "this" && // this parameters should always be considered used as they're pseudo-parameters
        "params" in scope.block && scope.block.params.includes(node)) {
          this.markVariableAsUsed(node);
        }
      }
      TSEnumDeclaration(node) {
        const scope = this.getScope(node);
        for (const variable of scope.variables) {
          this.markVariableAsUsed(variable);
        }
      }
      TSMappedType(node) {
        this.markVariableAsUsed(node.key);
      }
      TSModuleDeclaration(node) {
        if (node.kind === "global") {
          this.markVariableAsUsed("global", node.parent);
        }
      }
      TSParameterProperty(node) {
        let identifier;
        switch (node.parameter.type) {
          case utils_1.AST_NODE_TYPES.AssignmentPattern:
            identifier = node.parameter.left;
            break;
          case utils_1.AST_NODE_TYPES.Identifier:
            identifier = node.parameter;
            break;
        }
        this.markVariableAsUsed(identifier);
      }
      collectUnusedVariables(scope, variables = {
        unusedVariables: /* @__PURE__ */ new Set(),
        usedVariables: /* @__PURE__ */ new Set()
      }) {
        if (
          // skip function expression names
          // this scope is created just to house the variable that allows a function
          // expression to self-reference if it has a name defined
          !scope.functionExpressionScope
        ) {
          for (const variable of scope.variables) {
            if (
              // implicit lib variables (from @typescript-eslint/scope-manager)
              // these aren't variables that should be checked ever
              variable instanceof scope_manager_1.ImplicitLibVariable
            ) {
              continue;
            }
            if (
              // variables marked with markVariableAsUsed()
              variable.eslintUsed || // basic exported variables
              isExported(variable) || // variables implicitly exported via a merged declaration
              isMergeableExported(variable) || // used variables
              isUsedVariable(variable)
            ) {
              variables.usedVariables.add(variable);
            } else {
              variables.unusedVariables.add(variable);
            }
          }
        }
        for (const childScope of scope.childScopes) {
          this.collectUnusedVariables(childScope, variables);
        }
        return variables;
      }
      getScope(currentNode) {
        const inner = currentNode.type !== utils_1.AST_NODE_TYPES.Program;
        let node = currentNode;
        while (node) {
          const scope = this.#scopeManager.acquire(node, inner);
          if (scope) {
            if (scope.type === scope_manager_1.ScopeType.functionExpressionName) {
              return scope.childScopes[0];
            }
            return scope;
          }
          node = node.parent;
        }
        return this.#scopeManager.scopes[0];
      }
      markVariableAsUsed(variableOrIdentifierOrName, parent) {
        if (typeof variableOrIdentifierOrName !== "string" && !("type" in variableOrIdentifierOrName)) {
          variableOrIdentifierOrName.eslintUsed = true;
          return;
        }
        let name;
        let node;
        if (typeof variableOrIdentifierOrName === "string") {
          name = variableOrIdentifierOrName;
          node = parent;
        } else {
          name = variableOrIdentifierOrName.name;
          node = variableOrIdentifierOrName;
        }
        let currentScope = this.getScope(node);
        while (currentScope) {
          const variable = currentScope.variables.find((scopeVar) => scopeVar.name === name);
          if (variable) {
            variable.eslintUsed = true;
            return;
          }
          currentScope = currentScope.upper;
        }
      }
      visitClass(node) {
        const scope = this.getScope(node);
        for (const variable of scope.variables) {
          if (variable.identifiers[0] === scope.block.id) {
            this.markVariableAsUsed(variable);
            return;
          }
        }
      }
      visitForInForOf(node) {
        let idOrVariable;
        if (node.left.type === utils_1.AST_NODE_TYPES.VariableDeclaration) {
          const variable = this.#scopeManager.getDeclaredVariables(node.left).at(0);
          if (!variable) {
            return;
          }
          idOrVariable = variable;
        }
        if (node.left.type === utils_1.AST_NODE_TYPES.Identifier) {
          idOrVariable = node.left;
        }
        if (idOrVariable == null) {
          return;
        }
        let body = node.body;
        if (node.body.type === utils_1.AST_NODE_TYPES.BlockStatement) {
          if (node.body.body.length !== 1) {
            return;
          }
          body = node.body.body[0];
        }
        if (body.type !== utils_1.AST_NODE_TYPES.ReturnStatement) {
          return;
        }
        this.markVariableAsUsed(idOrVariable);
      }
      visitFunction(node) {
        const scope = this.getScope(node);
        const variable = scope.set.get("arguments");
        if (variable?.defs.length === 0) {
          this.markVariableAsUsed(variable);
        }
      }
      visitFunctionTypeSignature(node) {
        for (const param of node.params) {
          this.visitPattern(param, (name) => {
            this.markVariableAsUsed(name);
          });
        }
      }
      visitSetter(node) {
        if (node.kind === "set") {
          for (const param of node.value.params) {
            this.visitPattern(param, (id) => {
              this.markVariableAsUsed(id);
            });
          }
        }
      }
    };
    function isInside(inner, outer) {
      return inner.range[0] >= outer.range[0] && inner.range[1] <= outer.range[1];
    }
    function isSelfReference(ref, nodes) {
      let scope = ref.from;
      while (scope) {
        if (nodes.has(scope.block)) {
          return true;
        }
        scope = scope.upper;
      }
      return false;
    }
    var MERGEABLE_TYPES = /* @__PURE__ */ new Set([
      utils_1.AST_NODE_TYPES.ClassDeclaration,
      utils_1.AST_NODE_TYPES.FunctionDeclaration,
      utils_1.AST_NODE_TYPES.TSInterfaceDeclaration,
      utils_1.AST_NODE_TYPES.TSModuleDeclaration,
      utils_1.AST_NODE_TYPES.TSTypeAliasDeclaration
    ]);
    function isMergeableExported(variable) {
      for (const def of variable.defs) {
        if (def.type === utils_1.TSESLint.Scope.DefinitionType.Parameter) {
          continue;
        }
        if (MERGEABLE_TYPES.has(def.node.type) && def.node.parent.type === utils_1.AST_NODE_TYPES.ExportNamedDeclaration || def.node.parent.type === utils_1.AST_NODE_TYPES.ExportDefaultDeclaration) {
          return true;
        }
      }
      return false;
    }
    function isExported(variable) {
      return variable.defs.some((definition) => {
        let node = definition.node;
        if (node.type === utils_1.AST_NODE_TYPES.VariableDeclarator) {
          node = node.parent;
        } else if (definition.type === utils_1.TSESLint.Scope.DefinitionType.Parameter) {
          return false;
        }
        return node.parent.type.startsWith("Export");
      });
    }
    var LOGICAL_ASSIGNMENT_OPERATORS = /* @__PURE__ */ new Set(["??=", "&&=", "||="]);
    function isUsedVariable(variable) {
      function getFunctionDefinitions(variable2) {
        const functionDefinitions = /* @__PURE__ */ new Set();
        variable2.defs.forEach((def) => {
          if (def.type === utils_1.TSESLint.Scope.DefinitionType.FunctionName) {
            functionDefinitions.add(def.node);
          }
          if (def.type === utils_1.TSESLint.Scope.DefinitionType.Variable && (def.node.init?.type === utils_1.AST_NODE_TYPES.FunctionExpression || def.node.init?.type === utils_1.AST_NODE_TYPES.ArrowFunctionExpression)) {
            functionDefinitions.add(def.node.init);
          }
        });
        return functionDefinitions;
      }
      function getTypeDeclarations(variable2) {
        const nodes = /* @__PURE__ */ new Set();
        variable2.defs.forEach((def) => {
          if (def.node.type === utils_1.AST_NODE_TYPES.TSInterfaceDeclaration || def.node.type === utils_1.AST_NODE_TYPES.TSTypeAliasDeclaration) {
            nodes.add(def.node);
          }
        });
        return nodes;
      }
      function getModuleDeclarations(variable2) {
        const nodes = /* @__PURE__ */ new Set();
        variable2.defs.forEach((def) => {
          if (def.node.type === utils_1.AST_NODE_TYPES.TSModuleDeclaration) {
            nodes.add(def.node);
          }
        });
        return nodes;
      }
      function getEnumDeclarations(variable2) {
        const nodes = /* @__PURE__ */ new Set();
        variable2.defs.forEach((def) => {
          if (def.node.type === utils_1.AST_NODE_TYPES.TSEnumDeclaration) {
            nodes.add(def.node);
          }
        });
        return nodes;
      }
      function isInsideOneOf(ref, nodes) {
        for (const node of nodes) {
          if (isInside(ref.identifier, node)) {
            return true;
          }
        }
        return false;
      }
      function isUnusedExpression(node) {
        const parent = node.parent;
        if (parent.type === utils_1.AST_NODE_TYPES.ExpressionStatement) {
          return true;
        }
        if (parent.type === utils_1.AST_NODE_TYPES.SequenceExpression) {
          const isLastExpression = parent.expressions[parent.expressions.length - 1] === node;
          if (!isLastExpression) {
            return true;
          }
          return isUnusedExpression(parent);
        }
        return false;
      }
      function getRhsNode(ref, prevRhsNode) {
        function isInLoop(node) {
          let currentNode = node;
          while (currentNode) {
            if (utils_1.ASTUtils.isFunction(currentNode)) {
              break;
            }
            if (utils_1.ASTUtils.isLoop(currentNode)) {
              return true;
            }
            currentNode = currentNode.parent;
          }
          return false;
        }
        const id = ref.identifier;
        const parent = id.parent;
        const refScope = ref.from.variableScope;
        const varScope = ref.resolved.scope.variableScope;
        const canBeUsedLater = refScope !== varScope || isInLoop(id);
        if (prevRhsNode && isInside(id, prevRhsNode)) {
          return prevRhsNode;
        }
        if (parent.type === utils_1.AST_NODE_TYPES.AssignmentExpression && isUnusedExpression(parent) && id === parent.left && !canBeUsedLater) {
          return parent.right;
        }
        return null;
      }
      function isReadForItself(ref, rhsNode2) {
        function isInsideOfStorableFunction(id2, rhsNode3) {
          function getUpperFunction(node) {
            let currentNode = node;
            while (currentNode) {
              if (utils_1.ASTUtils.isFunction(currentNode)) {
                return currentNode;
              }
              currentNode = currentNode.parent;
            }
            return null;
          }
          function isStorableFunction(funcNode2, rhsNode4) {
            let node = funcNode2;
            let parent2 = funcNode2.parent;
            while (parent2 && isInside(parent2, rhsNode4)) {
              switch (parent2.type) {
                case utils_1.AST_NODE_TYPES.SequenceExpression:
                  if (parent2.expressions[parent2.expressions.length - 1] !== node) {
                    return false;
                  }
                  break;
                case utils_1.AST_NODE_TYPES.CallExpression:
                case utils_1.AST_NODE_TYPES.NewExpression:
                  return parent2.callee !== node;
                case utils_1.AST_NODE_TYPES.AssignmentExpression:
                case utils_1.AST_NODE_TYPES.TaggedTemplateExpression:
                case utils_1.AST_NODE_TYPES.YieldExpression:
                  return true;
                default:
                  if (parent2.type.endsWith("Statement") || parent2.type.endsWith("Declaration")) {
                    return true;
                  }
              }
              node = parent2;
              parent2 = parent2.parent;
            }
            return false;
          }
          const funcNode = getUpperFunction(id2);
          return !!funcNode && isInside(funcNode, rhsNode3) && isStorableFunction(funcNode, rhsNode3);
        }
        const id = ref.identifier;
        const parent = id.parent;
        return ref.isRead() && // in RHS of an assignment for itself. e.g. `a = a + 1`
        // self update. e.g. `a += 1`, `a++`
        (parent.type === utils_1.AST_NODE_TYPES.AssignmentExpression && !LOGICAL_ASSIGNMENT_OPERATORS.has(parent.operator) && isUnusedExpression(parent) && parent.left === id || parent.type === utils_1.AST_NODE_TYPES.UpdateExpression && isUnusedExpression(parent) || !!rhsNode2 && isInside(id, rhsNode2) && !isInsideOfStorableFunction(id, rhsNode2));
      }
      const functionNodes = getFunctionDefinitions(variable);
      const isFunctionDefinition = functionNodes.size > 0;
      const typeDeclNodes = getTypeDeclarations(variable);
      const isTypeDecl = typeDeclNodes.size > 0;
      const moduleDeclNodes = getModuleDeclarations(variable);
      const isModuleDecl = moduleDeclNodes.size > 0;
      const enumDeclNodes = getEnumDeclarations(variable);
      const isEnumDecl = enumDeclNodes.size > 0;
      const isImportedAsType = variable.defs.every(isTypeImport_1.isTypeImport);
      let rhsNode = null;
      return variable.references.some((ref) => {
        const forItself = isReadForItself(ref, rhsNode);
        rhsNode = getRhsNode(ref, rhsNode);
        return ref.isRead() && !forItself && !(!isImportedAsType && ((0, referenceContainsTypeQuery_1.referenceContainsTypeQuery)(ref.identifier) || (0, referenceContainsTypePredicate_1.referenceContainsTypePredicate)(ref.identifier))) && !(isFunctionDefinition && isSelfReference(ref, functionNodes)) && !(isTypeDecl && isInsideOneOf(ref, typeDeclNodes)) && !(isModuleDecl && isSelfReference(ref, moduleDeclNodes)) && !(isEnumDecl && isSelfReference(ref, enumDeclNodes));
      });
    }
    function collectVariables(context) {
      return UnusedVarsVisitor.collectUnusedVariables(context.sourceCode.ast, utils_1.ESLintUtils.nullThrows(context.sourceCode.scopeManager, "Missing required scope manager"));
    }
  }
});

// node_modules/@typescript-eslint/eslint-plugin/dist/util/escapeRegExp.js
var require_escapeRegExp = __commonJS({
  "node_modules/@typescript-eslint/eslint-plugin/dist/util/escapeRegExp.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.escapeRegExp = escapeRegExp;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reHasRegExpChar = RegExp(reRegExpChar.source);
    function escapeRegExp(string = "") {
      return string && reHasRegExpChar.test(string) ? string.replaceAll(reRegExpChar, "\\$&") : string;
    }
  }
});

// small-unused-pure-util:rule-utils
var require_rule_utils = __commonJS({
  "small-unused-pure-util:rule-utils"(exports) {
    var utils = require_utils();
    exports.createRule = require_createRule().createRule;
    exports.collectVariables = require_collectUnusedVariables().collectVariables;
    exports.isFunction = utils.ASTUtils.isFunction;
    exports.nullThrows = utils.ESLintUtils.nullThrows;
    exports.NullThrowsReasons = utils.ESLintUtils.NullThrowsReasons;
    var escapeRegExp_1 = require_escapeRegExp();
    function getNameLocationInGlobalDirectiveComment(sourceCode, comment, name) {
      const namePattern = new RegExp(`[\\s,]${(0, escapeRegExp_1.escapeRegExp)(name)}(?:$|[\\s,:])`, "gu");
      namePattern.lastIndex = comment.value.indexOf("global") + 6;
      const match = namePattern.exec(comment.value);
      const start = sourceCode.getLocFromIndex(comment.range[0] + "/*".length + (match ? match.index + 1 : 0));
      const end = {
        column: start.column + (match ? name.length : 1),
        line: start.line
      };
      return { end, start };
    }
    exports.getNameLocationInGlobalDirectiveComment = getNameLocationInGlobalDirectiveComment;
    var DEFINITION_EXTENSIONS = [".d.ts", ".d.cts", ".d.mts"];
    function isDefinitionFile(fileName) {
      const lowerFileName = fileName.toLowerCase();
      for (const definitionExt of DEFINITION_EXTENSIONS) {
        if (lowerFileName.endsWith(definitionExt)) {
          return true;
        }
      }
      return /\.d\.(ts|cts|mts|.*\.ts)$/.test(lowerFileName);
    }
    exports.isDefinitionFile = isDefinitionFile;
  }
});

// node_modules/@typescript-eslint/eslint-plugin/dist/rules/no-unused-vars.js
var require_no_unused_vars = __commonJS({
  "node_modules/@typescript-eslint/eslint-plugin/dist/rules/no-unused-vars.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var scope_manager_1 = require_scope();
    var utils_1 = require_utils();
    var util_1 = require_rule_utils();
    var referenceContainsTypePredicate_1 = require_referenceContainsTypePredicate();
    var referenceContainsTypeQuery_1 = require_referenceContainsTypeQuery();
    var VariableType;
    (function(VariableType2) {
      VariableType2[VariableType2["ArrayDestructure"] = 0] = "ArrayDestructure";
      VariableType2[VariableType2["CatchClause"] = 1] = "CatchClause";
      VariableType2[VariableType2["ClassName"] = 2] = "ClassName";
      VariableType2[VariableType2["FunctionName"] = 3] = "FunctionName";
      VariableType2[VariableType2["ImportBinding"] = 4] = "ImportBinding";
      VariableType2[VariableType2["ImplicitGlobalVariable"] = 5] = "ImplicitGlobalVariable";
      VariableType2[VariableType2["Parameter"] = 6] = "Parameter";
      VariableType2[VariableType2["TSEnumMember"] = 7] = "TSEnumMember";
      VariableType2[VariableType2["TSEnumName"] = 8] = "TSEnumName";
      VariableType2[VariableType2["TSModuleName"] = 9] = "TSModuleName";
      VariableType2[VariableType2["Type"] = 10] = "Type";
      VariableType2[VariableType2["Variable"] = 11] = "Variable";
    })(VariableType || (VariableType = {}));
    var isCommaToken = {
      predicate: (token) => token.type === utils_1.AST_TOKEN_TYPES.Punctuator && token.value === ",",
      tokenChar: ","
    };
    var isLeftCurlyToken = {
      predicate: (token) => token.type === utils_1.AST_TOKEN_TYPES.Punctuator && token.value === "{",
      tokenChar: "{"
    };
    var isRightCurlyToken = {
      predicate: (token) => token.type === utils_1.AST_TOKEN_TYPES.Punctuator && token.value === "}",
      tokenChar: "}"
    };
    function assertToken({ predicate, tokenChar }, token) {
      if (token == null) {
        throw new Error(`Expected a valid "${tokenChar}" token, but found no token`);
      }
      if (!predicate(token)) {
        throw new Error(`Expected a valid "${tokenChar}" token, but got "${token.value}" instead`);
      }
      return token;
    }
    exports.default = (0, util_1.createRule)({
      name: "no-unused-vars",
      meta: {
        type: "problem",
        docs: {
          description: "Disallow unused variables",
          extendsBaseRule: true,
          recommended: "recommended"
        },
        fixable: "code",
        hasSuggestions: true,
        messages: {
          removeUnusedImportDeclaration: "Remove unused import declaration.",
          removeUnusedVar: 'Remove unused variable "{{varName}}".',
          unusedVar: "'{{varName}}' is {{action}} but never used{{additional}}.",
          usedIgnoredVar: "'{{varName}}' is marked as ignored but is used{{additional}}.",
          usedOnlyAsType: "'{{varName}}' is {{action}} but only used as a type{{additional}}."
        },
        schema: [
          {
            oneOf: [
              {
                type: "string",
                description: "Broad setting for unused variables to target.",
                enum: ["all", "local"]
              },
              {
                type: "object",
                additionalProperties: false,
                properties: {
                  args: {
                    type: "string",
                    description: "Whether to check all, some, or no arguments.",
                    enum: ["all", "after-used", "none"]
                  },
                  argsIgnorePattern: {
                    type: "string",
                    description: "Regular expressions of argument names to not check for usage."
                  },
                  caughtErrors: {
                    type: "string",
                    description: "Whether to check catch block arguments.",
                    enum: ["all", "none"]
                  },
                  caughtErrorsIgnorePattern: {
                    type: "string",
                    description: "Regular expressions of catch block argument names to not check for usage."
                  },
                  destructuredArrayIgnorePattern: {
                    type: "string",
                    description: "Regular expressions of destructured array variable names to not check for usage."
                  },
                  enableAutofixRemoval: {
                    type: "object",
                    additionalProperties: false,
                    description: "Configurable automatic fixes for different types of unused variables.",
                    properties: {
                      imports: {
                        type: "boolean",
                        description: "Whether to enable automatic removal of unused imports."
                      }
                    }
                  },
                  ignoreClassWithStaticInitBlock: {
                    type: "boolean",
                    description: "Whether to ignore classes with at least one static initialization block."
                  },
                  ignoreRestSiblings: {
                    type: "boolean",
                    description: "Whether to ignore sibling properties in `...` destructurings."
                  },
                  ignoreUsingDeclarations: {
                    type: "boolean",
                    description: "Whether to ignore using or await using declarations."
                  },
                  reportUsedIgnorePattern: {
                    type: "boolean",
                    description: "Whether to report variables that match any of the valid ignore pattern options if they have been used."
                  },
                  vars: {
                    type: "string",
                    description: "Whether to check all variables or only locally-declared variables.",
                    enum: ["all", "local"]
                  },
                  varsIgnorePattern: {
                    type: "string",
                    description: "Regular expressions of variable names to not check for usage."
                  }
                }
              }
            ]
          }
        ]
      },
      defaultOptions: [{}],
      create(context, [firstOption]) {
        const MODULE_DECL_CACHE = /* @__PURE__ */ new Map();
        const reportedUnusedVariables = /* @__PURE__ */ new Set();
        function areAllSpecifiersUnused(decl) {
          return context.sourceCode.getDeclaredVariables(decl).every((variable) => {
            return reportedUnusedVariables.has(variable);
          });
        }
        const report = (unusedVar, opts) => {
          reportedUnusedVariables.add(unusedVar);
          const writeReferences = unusedVar.references.filter((ref) => ref.isWrite() && ref.from.variableScope === unusedVar.scope.variableScope);
          const id = writeReferences.length ? writeReferences[writeReferences.length - 1].identifier : unusedVar.identifiers[0];
          const { start } = id.loc;
          const idLength = id.name.length;
          const loc = {
            start,
            end: {
              column: start.column + idLength,
              line: start.line
            }
          };
          const fixer = (() => {
            const { messageId, fix, useAutofix } = (() => {
              if (unusedVar.defs.length !== 1) {
                return {};
              }
              const { type, def } = defToVariableType(unusedVar.defs[0]);
              switch (type) {
                case VariableType.ArrayDestructure:
                  return {};
                case VariableType.CatchClause:
                  return {};
                case VariableType.ClassName:
                  return {};
                case VariableType.FunctionName:
                  return {};
                case VariableType.ImportBinding:
                  return {
                    ...getImportFixer(def),
                    useAutofix: options.enableAutofixRemoval.imports
                  };
                case VariableType.ImplicitGlobalVariable:
                  return {};
                case VariableType.Parameter:
                  return {};
                case VariableType.TSEnumMember:
                  return {};
                case VariableType.TSEnumName:
                  return {};
                case VariableType.TSModuleName:
                  return {};
                case VariableType.Type:
                  return {};
                case VariableType.Variable:
                  return {};
              }
            })();
            if (!fix) {
              return {};
            }
            if (useAutofix) {
              return { fix };
            }
            const data = {
              varName: unusedVar.name
            };
            return {
              suggest: [
                {
                  messageId: messageId ?? "removeUnusedVar",
                  data,
                  fix
                }
              ]
            };
          })();
          context.report({
            ...opts,
            ...fixer,
            loc,
            node: id
          });
        };
        const options = (() => {
          const options2 = {
            args: "after-used",
            caughtErrors: "all",
            enableAutofixRemoval: {
              imports: false
            },
            ignoreClassWithStaticInitBlock: false,
            ignoreRestSiblings: false,
            ignoreUsingDeclarations: false,
            reportUsedIgnorePattern: false,
            vars: "all"
          };
          if (typeof firstOption === "string") {
            options2.vars = firstOption;
          } else {
            options2.vars = firstOption.vars ?? options2.vars;
            options2.args = firstOption.args ?? options2.args;
            options2.ignoreRestSiblings = firstOption.ignoreRestSiblings ?? options2.ignoreRestSiblings;
            options2.ignoreUsingDeclarations = firstOption.ignoreUsingDeclarations ?? options2.ignoreUsingDeclarations;
            options2.caughtErrors = firstOption.caughtErrors ?? options2.caughtErrors;
            options2.ignoreClassWithStaticInitBlock = firstOption.ignoreClassWithStaticInitBlock ?? options2.ignoreClassWithStaticInitBlock;
            options2.reportUsedIgnorePattern = firstOption.reportUsedIgnorePattern ?? options2.reportUsedIgnorePattern;
            if (firstOption.varsIgnorePattern) {
              options2.varsIgnorePattern = new RegExp(firstOption.varsIgnorePattern, "u");
            }
            if (firstOption.argsIgnorePattern) {
              options2.argsIgnorePattern = new RegExp(firstOption.argsIgnorePattern, "u");
            }
            if (firstOption.caughtErrorsIgnorePattern) {
              options2.caughtErrorsIgnorePattern = new RegExp(firstOption.caughtErrorsIgnorePattern, "u");
            }
            if (firstOption.destructuredArrayIgnorePattern) {
              options2.destructuredArrayIgnorePattern = new RegExp(firstOption.destructuredArrayIgnorePattern, "u");
            }
            if (firstOption.enableAutofixRemoval) {
              if (firstOption.enableAutofixRemoval.imports != null) {
                options2.enableAutofixRemoval.imports = firstOption.enableAutofixRemoval.imports;
              }
            }
          }
          return options2;
        })();
        function removeNodeWithTrailingNewline(fixer, node) {
          const sourceCode = context.sourceCode;
          const { line: startLine } = node.loc.start;
          const { line: endLine } = node.loc.end;
          const lineRangeStart = sourceCode.getIndexFromLoc({
            column: 0,
            line: startLine
          });
          const lineRangeEnd = endLine < sourceCode.lines.length ? sourceCode.getIndexFromLoc({ column: 0, line: endLine + 1 }) : sourceCode.text.length;
          if (sourceCode.getText(node) === sourceCode.text.slice(lineRangeStart, lineRangeEnd).trim()) {
            return fixer.removeRange([lineRangeStart, lineRangeEnd]);
          }
          return fixer.remove(node);
        }
        function getImportFixer(def) {
          switch (def.node.type) {
            case utils_1.AST_NODE_TYPES.TSImportEqualsDeclaration:
              return {
                messageId: "removeUnusedImportDeclaration",
                fix: (fixer) => removeNodeWithTrailingNewline(fixer, def.node)
              };
            case utils_1.AST_NODE_TYPES.ImportDefaultSpecifier: {
              const importDecl = def.node.parent;
              if (importDecl.specifiers.length === 1 || areAllSpecifiersUnused(importDecl)) {
                return {
                  messageId: "removeUnusedImportDeclaration",
                  fix: (fixer) => removeNodeWithTrailingNewline(fixer, importDecl)
                };
              }
              return {
                messageId: "removeUnusedVar",
                fix: (fixer) => {
                  const comma = (0, util_1.nullThrows)(context.sourceCode.getTokenAfter(def.node), util_1.NullThrowsReasons.MissingToken(",", "import specifier"));
                  assertToken(isCommaToken, comma);
                  return fixer.removeRange([
                    Math.min(def.node.range[0], comma.range[0]),
                    Math.max(def.node.range[1], comma.range[1])
                  ]);
                }
              };
            }
            case utils_1.AST_NODE_TYPES.ImportSpecifier: {
              const importDecl = def.node.parent;
              if (importDecl.specifiers.length === 1 || areAllSpecifiersUnused(importDecl)) {
                return {
                  messageId: "removeUnusedImportDeclaration",
                  fix: (fixer) => removeNodeWithTrailingNewline(fixer, importDecl)
                };
              }
              return {
                messageId: "removeUnusedVar",
                fix: (fixer) => {
                  const usedNamedSpecifiers = context.sourceCode.getDeclaredVariables(importDecl).map((variable) => {
                    if (reportedUnusedVariables.has(variable)) {
                      return null;
                    }
                    const specifier = variable.defs[0].node;
                    if (specifier.type !== utils_1.AST_NODE_TYPES.ImportSpecifier) {
                      return null;
                    }
                    return specifier;
                  }).filter((v) => v != null);
                  if (usedNamedSpecifiers.length === 0) {
                    const leftCurly = assertToken(isLeftCurlyToken, context.sourceCode.getFirstToken(importDecl, isLeftCurlyToken.predicate));
                    const leftToken = assertToken(isCommaToken, context.sourceCode.getTokenBefore(leftCurly));
                    const rightToken = assertToken(isRightCurlyToken, context.sourceCode.getFirstToken(importDecl, isRightCurlyToken.predicate));
                    return fixer.removeRange([
                      leftToken.range[0],
                      rightToken.range[1]
                    ]);
                  }
                  const maybeComma = context.sourceCode.getTokenBefore(def.node);
                  const comma = maybeComma && isCommaToken.predicate(maybeComma) ? maybeComma : assertToken(isCommaToken, context.sourceCode.getTokenAfter(def.node));
                  return fixer.removeRange([
                    Math.min(def.node.range[0], comma.range[0]),
                    Math.max(def.node.range[1], comma.range[1])
                  ]);
                }
              };
            }
            case utils_1.AST_NODE_TYPES.ImportNamespaceSpecifier: {
              const importDecl = def.node.parent;
              return {
                messageId: "removeUnusedImportDeclaration",
                fix: (fixer) => removeNodeWithTrailingNewline(fixer, importDecl)
              };
            }
          }
        }
        function defToVariableType(def) {
          if (options.destructuredArrayIgnorePattern && def.name.parent.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
            return { type: VariableType.ArrayDestructure, def };
          }
          switch (def.type) {
            case scope_manager_1.DefinitionType.CatchClause:
              return { type: VariableType.CatchClause, def };
            case scope_manager_1.DefinitionType.ClassName:
              return { type: VariableType.ClassName, def };
            case scope_manager_1.DefinitionType.FunctionName:
              return { type: VariableType.FunctionName, def };
            case scope_manager_1.DefinitionType.ImplicitGlobalVariable:
              return { type: VariableType.ImplicitGlobalVariable, def };
            case scope_manager_1.DefinitionType.ImportBinding:
              return { type: VariableType.ImportBinding, def };
            case scope_manager_1.DefinitionType.Parameter:
              return { type: VariableType.Parameter, def };
            case scope_manager_1.DefinitionType.TSEnumName:
              return { type: VariableType.TSEnumName, def };
            case scope_manager_1.DefinitionType.TSEnumMember:
              return { type: VariableType.TSEnumMember, def };
            case scope_manager_1.DefinitionType.TSModuleName:
              return { type: VariableType.TSModuleName, def };
            case scope_manager_1.DefinitionType.Type:
              return { type: VariableType.Type, def };
            case scope_manager_1.DefinitionType.Variable:
              return { type: VariableType.Variable, def };
          }
        }
        function getVariableDescription(variableType) {
          switch (variableType) {
            case VariableType.ArrayDestructure:
              return {
                pattern: options.destructuredArrayIgnorePattern?.toString(),
                variableDescription: "elements of array destructuring"
              };
            case VariableType.CatchClause:
              return {
                pattern: options.caughtErrorsIgnorePattern?.toString(),
                variableDescription: "caught errors"
              };
            case VariableType.Parameter:
              return {
                pattern: options.argsIgnorePattern?.toString(),
                variableDescription: "args"
              };
            default:
              return {
                pattern: options.varsIgnorePattern?.toString(),
                variableDescription: "vars"
              };
          }
        }
        function getDefinedMessageData(unusedVar) {
          const def = unusedVar.defs.at(0);
          let additionalMessageData = "";
          if (def) {
            const { pattern, variableDescription } = getVariableDescription(defToVariableType(def).type);
            if (pattern && variableDescription) {
              additionalMessageData = `. Allowed unused ${variableDescription} must match ${pattern}`;
            }
          }
          return {
            action: "defined",
            additional: additionalMessageData,
            varName: unusedVar.name
          };
        }
        function getAssignedMessageData(unusedVar) {
          const def = unusedVar.defs.at(0);
          let additionalMessageData = "";
          if (def) {
            const { pattern, variableDescription } = getVariableDescription(defToVariableType(def).type);
            if (pattern && variableDescription) {
              additionalMessageData = `. Allowed unused ${variableDescription} must match ${pattern}`;
            }
          }
          return {
            action: "assigned a value",
            additional: additionalMessageData,
            varName: unusedVar.name
          };
        }
        function getUsedIgnoredMessageData(variable, variableType) {
          const { pattern, variableDescription } = getVariableDescription(variableType);
          let additionalMessageData = "";
          if (pattern && variableDescription) {
            additionalMessageData = `. Used ${variableDescription} must not match ${pattern}`;
          }
          return {
            additional: additionalMessageData,
            varName: variable.name
          };
        }
        function collectUnusedVariables() {
          function hasRestSibling(node) {
            return node.type === utils_1.AST_NODE_TYPES.Property && node.parent.type === utils_1.AST_NODE_TYPES.ObjectPattern && node.parent.properties[node.parent.properties.length - 1].type === utils_1.AST_NODE_TYPES.RestElement;
          }
          function hasRestSpreadSibling(variable) {
            if (options.ignoreRestSiblings) {
              const hasRestSiblingDefinition = variable.defs.some((def) => hasRestSibling(def.name.parent));
              const hasRestSiblingReference = variable.references.some((ref) => hasRestSibling(ref.identifier.parent));
              return hasRestSiblingDefinition || hasRestSiblingReference;
            }
            return false;
          }
          function isAfterLastUsedArg(variable) {
            const def = variable.defs[0];
            const params = context.sourceCode.getDeclaredVariables(def.node);
            const posteriorParams = params.slice(params.indexOf(variable) + 1);
            return !posteriorParams.some((v) => v.references.length > 0 || v.eslintUsed);
          }
          const analysisResults = (0, util_1.collectVariables)(context);
          const variables = [
            ...Array.from(analysisResults.unusedVariables, (variable) => ({
              used: false,
              variable
            })),
            ...Array.from(analysisResults.usedVariables, (variable) => ({
              used: true,
              variable
            }))
          ];
          const unusedVariablesReturn = [];
          for (const { used, variable } of variables) {
            if (variable.defs.length === 0) {
              if (!used) {
                unusedVariablesReturn.push(variable);
              }
              continue;
            }
            const def = variable.defs[0];
            if (variable.scope.type === utils_1.TSESLint.Scope.ScopeType.global && options.vars === "local") {
              continue;
            }
            const refUsedInArrayPatterns = variable.references.some((ref) => ref.identifier.parent.type === utils_1.AST_NODE_TYPES.ArrayPattern);
            if ((def.name.parent.type === utils_1.AST_NODE_TYPES.ArrayPattern || refUsedInArrayPatterns) && def.name.type === utils_1.AST_NODE_TYPES.Identifier && options.destructuredArrayIgnorePattern?.test(def.name.name)) {
              if (options.reportUsedIgnorePattern && used) {
                report(variable, {
                  messageId: "usedIgnoredVar",
                  data: getUsedIgnoredMessageData(variable, VariableType.ArrayDestructure)
                });
              }
              continue;
            }
            if (def.type === utils_1.TSESLint.Scope.DefinitionType.ClassName) {
              const hasStaticBlock = def.node.body.body.some((node) => node.type === utils_1.AST_NODE_TYPES.StaticBlock);
              if (options.ignoreClassWithStaticInitBlock && hasStaticBlock) {
                continue;
              }
            }
            if (def.type === utils_1.TSESLint.Scope.DefinitionType.CatchClause) {
              if (options.caughtErrors === "none") {
                continue;
              }
              if (options.caughtErrorsIgnorePattern?.test(def.name.name)) {
                if (options.reportUsedIgnorePattern && used) {
                  report(variable, {
                    messageId: "usedIgnoredVar",
                    data: getUsedIgnoredMessageData(variable, VariableType.CatchClause)
                  });
                }
                continue;
              }
            } else if (def.type === utils_1.TSESLint.Scope.DefinitionType.Parameter) {
              if (options.args === "none") {
                continue;
              }
              if (def.name.type === utils_1.AST_NODE_TYPES.Identifier && options.argsIgnorePattern?.test(def.name.name)) {
                if (options.reportUsedIgnorePattern && used) {
                  report(variable, {
                    messageId: "usedIgnoredVar",
                    data: getUsedIgnoredMessageData(variable, VariableType.Parameter)
                  });
                }
                continue;
              }
              if (options.args === "after-used" && (0, util_1.isFunction)(def.name.parent) && !isAfterLastUsedArg(variable)) {
                continue;
              }
            } else if (def.name.type === utils_1.AST_NODE_TYPES.Identifier && options.varsIgnorePattern?.test(def.name.name)) {
              if (options.reportUsedIgnorePattern && used && /* enum members are always marked as 'used' by `collectVariables`, but in reality they may be used or
                 unused. either way, don't complain about their naming. */
              def.type !== utils_1.TSESLint.Scope.DefinitionType.TSEnumMember) {
                report(variable, {
                  messageId: "usedIgnoredVar",
                  data: getUsedIgnoredMessageData(variable, VariableType.Variable)
                });
              }
              continue;
            }
            if (def.type === utils_1.TSESLint.Scope.DefinitionType.Variable && options.ignoreUsingDeclarations && (def.parent.kind === "await using" || def.parent.kind === "using")) {
              continue;
            }
            if (hasRestSpreadSibling(variable)) {
              continue;
            }
            if (variable.eslintUsed) {
              continue;
            }
            if (!used) {
              unusedVariablesReturn.push(variable);
            }
          }
          return unusedVariablesReturn;
        }
        return {
          // top-level declaration file handling
          [ambientDeclarationSelector(utils_1.AST_NODE_TYPES.Program)](node) {
            if (!(0, util_1.isDefinitionFile)(context.filename)) {
              return;
            }
            const moduleDecl = (0, util_1.nullThrows)(node.parent, util_1.NullThrowsReasons.MissingParent);
            if (checkForOverridingExportStatements(moduleDecl)) {
              return;
            }
            markDeclarationChildAsUsed(node);
          },
          // children of a namespace that is a child of a declared namespace are auto-exported
          [ambientDeclarationSelector("TSModuleDeclaration[declare = true] > TSModuleBlock TSModuleDeclaration > TSModuleBlock")](node) {
            const moduleDecl = (0, util_1.nullThrows)(node.parent.parent, util_1.NullThrowsReasons.MissingParent);
            if (checkForOverridingExportStatements(moduleDecl)) {
              return;
            }
            markDeclarationChildAsUsed(node);
          },
          // declared namespace handling
          [ambientDeclarationSelector("TSModuleDeclaration[declare = true] > TSModuleBlock")](node) {
            const moduleDecl = (0, util_1.nullThrows)(node.parent.parent, util_1.NullThrowsReasons.MissingParent);
            if (checkForOverridingExportStatements(moduleDecl)) {
              return;
            }
            markDeclarationChildAsUsed(node);
          },
          // namespace handling in definition files
          [ambientDeclarationSelector("TSModuleDeclaration > TSModuleBlock")](node) {
            if (!(0, util_1.isDefinitionFile)(context.filename)) {
              return;
            }
            const moduleDecl = (0, util_1.nullThrows)(node.parent.parent, util_1.NullThrowsReasons.MissingParent);
            if (checkForOverridingExportStatements(moduleDecl)) {
              return;
            }
            markDeclarationChildAsUsed(node);
          },
          // collect
          "Program:exit"(programNode) {
            const unusedVars = collectUnusedVariables();
            for (const unusedVar of unusedVars) {
              if (unusedVar.defs.length > 0) {
                const usedOnlyAsType = unusedVar.references.some((ref) => (0, referenceContainsTypeQuery_1.referenceContainsTypeQuery)(ref.identifier) || (0, referenceContainsTypePredicate_1.referenceContainsTypePredicate)(ref.identifier));
                const messageId = usedOnlyAsType ? "usedOnlyAsType" : "unusedVar";
                const isImportUsedOnlyAsType = usedOnlyAsType && unusedVar.defs.some((def) => def.type === scope_manager_1.DefinitionType.ImportBinding);
                if (isImportUsedOnlyAsType) {
                  continue;
                }
                report(unusedVar, {
                  messageId,
                  data: unusedVar.references.some((ref) => ref.isWrite()) ? getAssignedMessageData(unusedVar) : getDefinedMessageData(unusedVar)
                });
              } else if ("eslintExplicitGlobalComments" in unusedVar && unusedVar.eslintExplicitGlobalComments) {
                const directiveComment = unusedVar.eslintExplicitGlobalComments[0];
                context.report({
                  loc: (0, util_1.getNameLocationInGlobalDirectiveComment)(context.sourceCode, directiveComment, unusedVar.name),
                  node: programNode,
                  messageId: "unusedVar",
                  data: getDefinedMessageData(unusedVar)
                });
              }
            }
          }
        };
        function checkForOverridingExportStatements(node) {
          const cached = MODULE_DECL_CACHE.get(node);
          if (cached != null) {
            return cached;
          }
          const body = getStatementsOfNode(node);
          if (hasOverridingExportStatement(body)) {
            MODULE_DECL_CACHE.set(node, true);
            return true;
          }
          MODULE_DECL_CACHE.set(node, false);
          return false;
        }
        function ambientDeclarationSelector(parent) {
          return [
            // Types are ambiently exported
            `${parent} > :matches(${[
              utils_1.AST_NODE_TYPES.TSInterfaceDeclaration,
              utils_1.AST_NODE_TYPES.TSTypeAliasDeclaration
            ].join(", ")})`,
            // Value things are ambiently exported if they are "declare"d
            `${parent} > :matches(${[
              utils_1.AST_NODE_TYPES.ClassDeclaration,
              utils_1.AST_NODE_TYPES.TSDeclareFunction,
              utils_1.AST_NODE_TYPES.TSEnumDeclaration,
              utils_1.AST_NODE_TYPES.TSModuleDeclaration,
              utils_1.AST_NODE_TYPES.VariableDeclaration
            ].join(", ")})`
          ].join(", ");
        }
        function markDeclarationChildAsUsed(node) {
          const identifiers = [];
          switch (node.type) {
            case utils_1.AST_NODE_TYPES.TSInterfaceDeclaration:
            case utils_1.AST_NODE_TYPES.TSTypeAliasDeclaration:
            case utils_1.AST_NODE_TYPES.ClassDeclaration:
            case utils_1.AST_NODE_TYPES.FunctionDeclaration:
            case utils_1.AST_NODE_TYPES.TSDeclareFunction:
            case utils_1.AST_NODE_TYPES.TSEnumDeclaration:
            case utils_1.AST_NODE_TYPES.TSModuleDeclaration:
              if (node.id?.type === utils_1.AST_NODE_TYPES.Identifier) {
                identifiers.push(node.id);
              }
              break;
            case utils_1.AST_NODE_TYPES.VariableDeclaration:
              for (const declaration of node.declarations) {
                visitPattern(declaration, (pattern) => {
                  identifiers.push(pattern);
                });
              }
              break;
          }
          let scope = context.sourceCode.getScope(node);
          const shouldUseUpperScope = [
            utils_1.AST_NODE_TYPES.TSDeclareFunction,
            utils_1.AST_NODE_TYPES.TSModuleDeclaration
          ].includes(node.type);
          if (scope.variableScope !== scope) {
            scope = scope.variableScope;
          } else if (shouldUseUpperScope && scope.upper) {
            scope = scope.upper;
          }
          for (const id of identifiers) {
            const superVar = scope.set.get(id.name);
            if (superVar) {
              superVar.eslintUsed = true;
            }
          }
        }
        function visitPattern(node, cb) {
          const visitor = new scope_manager_1.PatternVisitor({}, node, cb);
          visitor.visit(node);
        }
      }
    });
    function hasOverridingExportStatement(body) {
      for (const statement of body) {
        if (statement.type === utils_1.AST_NODE_TYPES.ExportNamedDeclaration && statement.declaration == null || statement.type === utils_1.AST_NODE_TYPES.ExportAllDeclaration || statement.type === utils_1.AST_NODE_TYPES.TSExportAssignment) {
          return true;
        }
        if (statement.type === utils_1.AST_NODE_TYPES.ExportDefaultDeclaration && statement.declaration.type === utils_1.AST_NODE_TYPES.Identifier) {
          return true;
        }
      }
      return false;
    }
    function getStatementsOfNode(block) {
      if (block.type === utils_1.AST_NODE_TYPES.Program) {
        return block.body;
      }
      return block.body.body;
    }
  }
});

// node_modules/eslint-plugin-unused-imports/dist/index.mjs
var import_no_unused_vars = __toESM(require_no_unused_vars(), 1);
var noUnusedVarsBase = import_no_unused_vars.default.default ?? import_no_unused_vars.default;
var commaFilter = { filter: (token) => token.value === "," };
var includeCommentsFilter = { includeComments: true };
function isUsedInJSDoc(identifierName, sourceCode) {
  const comments = sourceCode.getAllComments();
  const jsdocPattern = new RegExp(
    // {@link Name} or @see Name
    `(?:@(?:link|linkcode|linkplain|see)\\s+${identifierName}\\b)|(?:\\{@(?:link|linkcode|linkplain)\\s+${identifierName}\\b\\})|(?:[@{](?:type|typedef|param|returns?|template|augments|extends|implements)\\s+[^}]*\\b${identifierName}\\b)`
  );
  return comments.some((comment) => {
    if (comment.type !== "Block") {
      return false;
    }
    return jsdocPattern.test(comment.value);
  });
}
function makePredicate(isImport, addFixer) {
  return (problem, context) => {
    const sourceCode = context.sourceCode || context.getSourceCode();
    const node = problem.node ?? // typescript-eslint >= 7.8 sets a range instead of a node
    sourceCode.getNodeByRangeIndex(sourceCode.getIndexFromLoc(problem.loc.start));
    const { parent } = node;
    if (parent && /^Import(|Default|Namespace)Specifier$/.test(parent.type) && isImport) {
      const identifierName = node.name;
      if (identifierName && isUsedInJSDoc(identifierName, sourceCode)) {
        return false;
      }
    }
    return parent ? /^Import(|Default|Namespace)Specifier$/.test(parent.type) == isImport ? Object.assign(problem, addFixer?.(parent, sourceCode)) : false : isImport ? false : problem;
  };
}
var unusedVarsPredicate = makePredicate(false);
var unusedImportsPredicate = makePredicate(true, (parent, sourceCode) => ({
  fix(fixer) {
    const grandParent = parent.parent;
    if (!grandParent) {
      return null;
    }
    if (grandParent.specifiers.length === 1) {
      const nextToken = sourceCode.getTokenAfter(grandParent, includeCommentsFilter);
      const newLinesBetween = nextToken ? nextToken.loc.start.line - grandParent.loc.start.line : 0;
      const endOfReplaceRange = nextToken ? nextToken.range[0] : grandParent.range[1];
      const count = Math.max(0, newLinesBetween - 1);
      return [
        fixer.remove(grandParent),
        fixer.replaceTextRange(
          [grandParent.range[1], endOfReplaceRange],
          "\n".repeat(count)
        )
      ];
    }
    if (parent !== grandParent.specifiers[grandParent.specifiers.length - 1]) {
      const comma = sourceCode.getTokenAfter(parent, commaFilter);
      const prevNode = sourceCode.getTokenBefore(parent);
      return [
        fixer.removeRange([prevNode.range[1], parent.range[0]]),
        fixer.remove(parent),
        fixer.remove(comma)
      ];
    }
    if (grandParent.specifiers.filter((specifier) => specifier.type === "ImportSpecifier").length === 1) {
      const start = sourceCode.getTokenBefore(parent, commaFilter);
      const end = sourceCode.getTokenAfter(parent, {
        filter: (token) => token.value === "}"
      });
      return fixer.removeRange([start.range[0], end.range[1]]);
    }
    return fixer.removeRange([
      sourceCode.getTokenBefore(parent, commaFilter).range[0],
      parent.range[1]
    ]);
  }
}));
function createRuleWithPredicate(name, baseRule, predicate) {
  return {
    ...baseRule,
    meta: {
      ...baseRule.meta,
      fixable: "code",
      docs: {
        ...baseRule.meta?.docs,
        url: `https://github.com/sweepline/eslint-plugin-unused-imports/blob/master/docs/rules/${name}.md`
      }
    },
    create(context) {
      prepareInlineGlobals(context);
      return baseRule.create(
        Object.create(context, {
          report: {
            enumerable: true,
            value(problem) {
              const result = predicate(problem, context);
              if (result) {
                context.report(result);
              }
            }
          }
        })
      );
    }
  };
}
// Modified for oxlint: inline global initialization, using @eslint/plugin-kit@0.7.1 parser methods by Nicholas C. Zakas (Apache-2.0; full license below).
// typescript-eslint@8.59.1 implicit esnext lib variables are excluded by its no-unused-vars visitor even when mentioned in a global directive.
const implicitTypeScriptGlobals = new Set(["AggregateError","AggregateErrorConstructor","Array","ArrayBuffer","ArrayBufferConstructor","ArrayBufferLike","ArrayBufferTypes","ArrayBufferView","ArrayConstructor","ArrayIterator","ArrayLike","AsyncDisposable","AsyncDisposableStack","AsyncDisposableStackConstructor","AsyncGenerator","AsyncGeneratorFunction","AsyncGeneratorFunctionConstructor","AsyncIterable","AsyncIterableIterator","AsyncIterator","AsyncIteratorObject","Atomics","Awaited","BigInt","BigInt64Array","BigInt64ArrayConstructor","BigIntConstructor","BigIntToLocaleStringOptions","BigUint64Array","BigUint64ArrayConstructor","Boolean","BooleanConstructor","BuiltinIteratorReturn","CallableFunction","Capitalize","ClassAccessorDecoratorContext","ClassAccessorDecoratorResult","ClassAccessorDecoratorTarget","ClassDecorator","ClassDecoratorContext","ClassFieldDecoratorContext","ClassGetterDecoratorContext","ClassMemberDecoratorContext","ClassMethodDecoratorContext","ClassSetterDecoratorContext","ConcatArray","ConstructorParameters","DataView","DataViewConstructor","Date","DateConstructor","DecoratorContext","DecoratorMetadata","DecoratorMetadataObject","Disposable","DisposableStack","DisposableStackConstructor","Error","ErrorConstructor","ErrorOptions","EvalError","EvalErrorConstructor","Exclude","Extract","FinalizationRegistry","FinalizationRegistryConstructor","FlatArray","Float16Array","Float16ArrayConstructor","Float32Array","Float32ArrayConstructor","Float64Array","Float64ArrayConstructor","Function","FunctionConstructor","Generator","GeneratorFunction","GeneratorFunctionConstructor","IArguments","ImportAssertions","ImportAttributes","ImportCallOptions","ImportMeta","InstanceType","Int16Array","Int16ArrayConstructor","Int32Array","Int32ArrayConstructor","Int8Array","Int8ArrayConstructor","Intl","Iterable","IterableIterator","Iterator","IteratorObject","IteratorObjectConstructor","IteratorResult","IteratorReturnResult","IteratorYieldResult","JSON","Lowercase","Map","MapConstructor","MapIterator","Math","MethodDecorator","NewableFunction","NoInfer","NonNullable","Number","NumberConstructor","Object","ObjectConstructor","Omit","OmitThisParameter","ParameterDecorator","Parameters","Partial","Pick","Promise","PromiseConstructor","PromiseConstructorLike","PromiseFulfilledResult","PromiseLike","PromiseRejectedResult","PromiseSettledResult","PromiseWithResolvers","PropertyDecorator","PropertyDescriptor","PropertyDescriptorMap","PropertyKey","ProxyConstructor","ProxyHandler","RangeError","RangeErrorConstructor","Readonly","ReadonlyArray","ReadonlyMap","ReadonlySet","ReadonlySetLike","Record","ReferenceError","ReferenceErrorConstructor","Reflect","RegExp","RegExpConstructor","RegExpExecArray","RegExpIndicesArray","RegExpMatchArray","RegExpStringIterator","Required","ReturnType","Set","SetConstructor","SetIterator","SharedArrayBuffer","SharedArrayBufferConstructor","String","StringConstructor","StringIterator","SuppressedError","SuppressedErrorConstructor","Symbol","SymbolConstructor","SyntaxError","SyntaxErrorConstructor","TemplateStringsArray","Temporal","ThisParameterType","ThisType","TypeError","TypeErrorConstructor","TypedPropertyDescriptor","URIError","URIErrorConstructor","Uint16Array","Uint16ArrayConstructor","Uint32Array","Uint32ArrayConstructor","Uint8Array","Uint8ArrayConstructor","Uint8ClampedArray","Uint8ClampedArrayConstructor","Uncapitalize","Uppercase","WeakKey","WeakKeyTypes","WeakMap","WeakMapConstructor","WeakRef","WeakRefConstructor","WeakSet","WeakSetConstructor"]);
const directivesPattern = /^([a-z]+(?:-[a-z]+)*)(?:\s|$)/u;
class DirectiveComment {
	/**
	 * The label of the directive, such as "eslint", "eslint-disable", etc.
	 * @type {string}
	 */
	label = "";

	/**
	 * The value of the directive (the string after the label).
	 * @type {string}
	 */
	value = "";

	/**
	 * The justification of the directive (the string after the --).
	 * @type {string}
	 */
	justification = "";

	/**
	 * Creates a new directive comment.
	 * @param {string} label The label of the directive.
	 * @param {string} value The value of the directive.
	 * @param {string} justification The justification of the directive.
	 */
	constructor(label, value, justification) {
		this.label = label;
		this.value = value;
		this.justification = justification;
	}
}
class InlineGlobalCommentParser {
	parseStringConfig(string) {
		const items = /** @type {StringConfig} */ ({});

		// Collapse whitespace around `:` and `,` to make parsing easier
		const trimmedString = string
			.trim()
			.replace(/(?<!\s)\s*([:,])\s*/gu, "$1");

		trimmedString.split(/\s|,+/u).forEach(name => {
			if (!name) {
				return;
			}

			// value defaults to null (if not provided), e.g: "foo" => ["foo", null]
			const [key, value = null] = name.split(":");

			items[key] = value;
		});

		return items;
	}
	#extractDirectiveComment(value) {
		const match = /\s-{2,}\s/u.exec(value);

		if (!match) {
			return { directivePart: value.trim(), justificationPart: "" };
		}

		const directive = value.slice(0, match.index).trim();
		const justification = value.slice(match.index + match[0].length).trim();

		return { directivePart: directive, justificationPart: justification };
	}
	parseDirective(string) {
		const { directivePart, justificationPart } =
			this.#extractDirectiveComment(string);
		const match = directivesPattern.exec(directivePart);

		if (!match) {
			return undefined;
		}

		const directiveText = match[1];
		const directiveValue = directivePart.slice(
			match.index + directiveText.length,
		);

		return new DirectiveComment(
			directiveText,
			directiveValue.trim(),
			justificationPart,
		);
	}
}
const inlineGlobalsPrepared = new WeakSet();
const inlineGlobalParser = new InlineGlobalCommentParser();
function prepareInlineGlobals(context) {
    const sourceCode = context.sourceCode;
    if (inlineGlobalsPrepared.has(sourceCode.ast)) return;
    inlineGlobalsPrepared.add(sourceCode.ast);
    const inline = new Map();
    for (const comment of sourceCode.getAllComments()) {
        if (comment.type !== 'Block') continue;
        const directive = inlineGlobalParser.parseDirective(comment.value);
        if (!directive || (directive.label !== 'global' && directive.label !== 'globals')) continue;
        for (const [name, value] of Object.entries(inlineGlobalParser.parseStringConfig(directive.value))) {
            if (![null, 'off', 'true', 'false', 'writeable', 'writable', 'readable', 'readonly'].includes(value)) continue;
            const prior = inline.get(name);
            inline.set(name, { value, comments: [...(prior?.comments ?? []), comment] });
        }
    }
    const global = sourceCode.scopeManager.scopes[0];
    const active = [...inline].filter(([, entry]) => entry.value !== 'off');
    global.addVariables(active.map(([name]) => name));
    for (const [name, entry] of active) {
        const variable = global.set.get(name);
        if (implicitTypeScriptGlobals.has(name)) variable.eslintUsed = true;
        variable.eslintExplicitGlobal = true;
        variable.eslintExplicitGlobalComments = entry.comments;
        variable.writeable = ['true', 'writeable', 'writable'].includes(entry.value);
    }
}
function getBaseRule() {
  return noUnusedVarsBase;
}
var no_unused_vars_default = createRuleWithPredicate("no-unused-vars", getBaseRule(), unusedVarsPredicate);
var no_unused_imports_default = createRuleWithPredicate("no-unused-imports", getBaseRule(), unusedImportsPredicate);
var plugin = {
  meta: {
    name: "unused-imports"
  },
  rules: {
    "no-unused-vars": no_unused_vars_default,
    "no-unused-imports": no_unused_imports_default
  }
};
var index_default = plugin;
export {
  index_default as default
};

/*
Bundled dependency: @eslint/plugin-kit@0.7.1
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/
/*
Bundled dependency: @typescript-eslint/eslint-plugin@8.59.1
MIT License

Copyright (c) 2019 typescript-eslint and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/*
Bundled dependency: @typescript-eslint/scope-manager@8.59.1
MIT License

Copyright (c) 2019 typescript-eslint and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/*
Bundled dependency: @typescript-eslint/types@8.59.1
MIT License

Copyright (c) 2019 typescript-eslint and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/*
Bundled dependency: @typescript-eslint/utils@8.59.1
MIT License

Copyright (c) 2019 typescript-eslint and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/*
Bundled dependency: @typescript-eslint/visitor-keys@8.59.1
MIT License

Copyright (c) 2019 typescript-eslint and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/*
Bundled dependency: eslint-plugin-unused-imports@4.4.1
MIT License

Copyright (c) 2022 Mikkel Holmer Pedersen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
