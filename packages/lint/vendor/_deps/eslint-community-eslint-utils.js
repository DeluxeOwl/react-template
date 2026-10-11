import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import {
  __export
} from "./chunk-WPQ5MXLX.js";

// node_modules/@eslint-community/eslint-utils/index.mjs
var eslint_utils_exports = {};
__export(eslint_utils_exports, {
  CALL: () => CALL,
  CONSTRUCT: () => CONSTRUCT,
  ESM: () => ESM,
  PatternMatcher: () => PatternMatcher,
  READ: () => READ,
  ReferenceTracker: () => ReferenceTracker,
  default: () => index,
  findVariable: () => findVariable,
  getFunctionHeadLocation: () => getFunctionHeadLocation,
  getFunctionNameWithKind: () => getFunctionNameWithKind,
  getInnermostScope: () => getInnermostScope,
  getPropertyName: () => getPropertyName,
  getStaticValue: () => getStaticValue,
  getStringIfConstant: () => getStringIfConstant,
  hasSideEffect: () => hasSideEffect,
  isArrowToken: () => isArrowToken,
  isClosingBraceToken: () => isClosingBraceToken,
  isClosingBracketToken: () => isClosingBracketToken,
  isClosingParenToken: () => isClosingParenToken,
  isColonToken: () => isColonToken,
  isCommaToken: () => isCommaToken,
  isCommentToken: () => isCommentToken,
  isNotArrowToken: () => isNotArrowToken,
  isNotClosingBraceToken: () => isNotClosingBraceToken,
  isNotClosingBracketToken: () => isNotClosingBracketToken,
  isNotClosingParenToken: () => isNotClosingParenToken,
  isNotColonToken: () => isNotColonToken,
  isNotCommaToken: () => isNotCommaToken,
  isNotCommentToken: () => isNotCommentToken,
  isNotOpeningBraceToken: () => isNotOpeningBraceToken,
  isNotOpeningBracketToken: () => isNotOpeningBracketToken,
  isNotOpeningParenToken: () => isNotOpeningParenToken,
  isNotSemicolonToken: () => isNotSemicolonToken,
  isOpeningBraceToken: () => isOpeningBraceToken,
  isOpeningBracketToken: () => isOpeningBracketToken,
  isOpeningParenToken: () => isOpeningParenToken,
  isParenthesized: () => isParenthesized,
  isSemicolonToken: () => isSemicolonToken
});
import { getKeys, KEYS } from "eslint-visitor-keys";
function getInnermostScope(initialScope, node) {
  const location = (
    /** @type {[number, number]} */
    node.range[0]
  );
  let scope = initialScope;
  let found = false;
  do {
    found = false;
    for (const childScope of scope.childScopes) {
      const range = (
        /** @type {[number, number]} */
        childScope.block.range
      );
      if (range[0] <= location && location < range[1]) {
        scope = childScope;
        found = true;
        break;
      }
    }
  } while (found);
  return scope;
}
function findVariable(initialScope, nameOrNode) {
  let name = "";
  let scope = initialScope;
  if (typeof nameOrNode === "string") {
    name = nameOrNode;
  } else {
    name = nameOrNode.name;
    scope = getInnermostScope(scope, nameOrNode);
  }
  while (scope != null) {
    const variable = scope.set.get(name);
    if (variable != null) {
      return variable;
    }
    scope = scope.upper;
  }
  return null;
}
function negate(f) {
  return (token) => !f(token);
}
function isPunctuatorTokenWithValue(token, value) {
  return token.type === "Punctuator" && token.value === value;
}
function isArrowToken(token) {
  return isPunctuatorTokenWithValue(token, "=>");
}
function isCommaToken(token) {
  return isPunctuatorTokenWithValue(token, ",");
}
function isSemicolonToken(token) {
  return isPunctuatorTokenWithValue(token, ";");
}
function isColonToken(token) {
  return isPunctuatorTokenWithValue(token, ":");
}
function isOpeningParenToken(token) {
  return isPunctuatorTokenWithValue(token, "(");
}
function isClosingParenToken(token) {
  return isPunctuatorTokenWithValue(token, ")");
}
function isOpeningBracketToken(token) {
  return isPunctuatorTokenWithValue(token, "[");
}
function isClosingBracketToken(token) {
  return isPunctuatorTokenWithValue(token, "]");
}
function isOpeningBraceToken(token) {
  return isPunctuatorTokenWithValue(token, "{");
}
function isClosingBraceToken(token) {
  return isPunctuatorTokenWithValue(token, "}");
}
function isCommentToken(token) {
  return ["Block", "Line", "Shebang"].includes(token.type);
}
var isNotArrowToken = negate(isArrowToken);
var isNotCommaToken = negate(isCommaToken);
var isNotSemicolonToken = negate(isSemicolonToken);
var isNotColonToken = negate(isColonToken);
var isNotOpeningParenToken = negate(isOpeningParenToken);
var isNotClosingParenToken = negate(isClosingParenToken);
var isNotOpeningBracketToken = negate(isOpeningBracketToken);
var isNotClosingBracketToken = negate(isClosingBracketToken);
var isNotOpeningBraceToken = negate(isOpeningBraceToken);
var isNotClosingBraceToken = negate(isClosingBraceToken);
var isNotCommentToken = negate(isCommentToken);
function getOpeningParenOfParams(node, sourceCode) {
  return node.id ? (
    /** @type {Token} */
    sourceCode.getTokenAfter(node.id, isOpeningParenToken)
  ) : (
    /** @type {Token} */
    sourceCode.getFirstToken(node, isOpeningParenToken)
  );
}
function getFunctionHeadLocation(node, sourceCode) {
  const parent = (
    /** @type {RuleNode} */
    node.parent
  );
  let start = null;
  let end = null;
  if (node.type === "ArrowFunctionExpression") {
    const arrowToken = (
      /** @type {Token} */
      sourceCode.getTokenBefore(node.body, isArrowToken)
    );
    start = arrowToken.loc.start;
    end = arrowToken.loc.end;
  } else if (parent && (parent.type === "Property" || parent.type === "MethodDefinition" || parent.type === "PropertyDefinition")) {
    start = /** @type {SourceLocation} */
    parent.loc.start;
    end = getOpeningParenOfParams(node, sourceCode).loc.start;
  } else {
    start = /** @type {SourceLocation} */
    node.loc.start;
    end = getOpeningParenOfParams(node, sourceCode).loc.start;
  }
  return {
    start: { ...start },
    end: { ...end }
  };
}
var globalObject = typeof globalThis !== "undefined" ? globalThis : (
  // @ts-ignore
  typeof self !== "undefined" ? (
    // @ts-ignore
    self
  ) : (
    // @ts-ignore
    typeof window !== "undefined" ? (
      // @ts-ignore
      window
    ) : typeof global !== "undefined" ? global : {}
  )
);
var builtinNames = Object.freeze(
  /* @__PURE__ */ new Set([
    "Array",
    "ArrayBuffer",
    "BigInt",
    "BigInt64Array",
    "BigUint64Array",
    "Boolean",
    "DataView",
    "Date",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "escape",
    "Float32Array",
    "Float64Array",
    "Function",
    "Infinity",
    "Int16Array",
    "Int32Array",
    "Int8Array",
    "isFinite",
    "isNaN",
    "isPrototypeOf",
    "JSON",
    "Map",
    "Math",
    "NaN",
    "Number",
    "Object",
    "parseFloat",
    "parseInt",
    "Promise",
    "Proxy",
    "Reflect",
    "RegExp",
    "Set",
    "String",
    "Symbol",
    "Uint16Array",
    "Uint32Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "undefined",
    "unescape",
    "WeakMap",
    "WeakSet"
  ])
);
var callAllowed = new Set(
  [
    Array.isArray,
    Array.of,
    Array.prototype.at,
    Array.prototype.concat,
    Array.prototype.entries,
    Array.prototype.every,
    Array.prototype.filter,
    Array.prototype.find,
    Array.prototype.findIndex,
    Array.prototype.flat,
    Array.prototype.includes,
    Array.prototype.indexOf,
    Array.prototype.join,
    Array.prototype.keys,
    Array.prototype.lastIndexOf,
    Array.prototype.slice,
    Array.prototype.some,
    Array.prototype.toString,
    Array.prototype.values,
    typeof BigInt === "function" ? BigInt : void 0,
    Boolean,
    Date,
    Date.parse,
    decodeURI,
    decodeURIComponent,
    encodeURI,
    encodeURIComponent,
    escape,
    isFinite,
    isNaN,
    // @ts-ignore
    isPrototypeOf,
    Map,
    Map.prototype.entries,
    Map.prototype.get,
    Map.prototype.has,
    Map.prototype.keys,
    Map.prototype.values,
    .../** @type {(keyof typeof Math)[]} */
    Object.getOwnPropertyNames(Math).filter((k) => k !== "random").map((k) => Math[k]).filter((f) => typeof f === "function"),
    Number,
    Number.isFinite,
    Number.isNaN,
    Number.parseFloat,
    Number.parseInt,
    Number.prototype.toExponential,
    Number.prototype.toFixed,
    Number.prototype.toPrecision,
    Number.prototype.toString,
    Object,
    Object.entries,
    Object.is,
    Object.isExtensible,
    Object.isFrozen,
    Object.isSealed,
    Object.keys,
    Object.values,
    parseFloat,
    parseInt,
    RegExp,
    Set,
    Set.prototype.entries,
    Set.prototype.has,
    Set.prototype.keys,
    Set.prototype.values,
    String,
    String.fromCharCode,
    String.fromCodePoint,
    String.raw,
    String.prototype.at,
    String.prototype.charAt,
    String.prototype.charCodeAt,
    String.prototype.codePointAt,
    String.prototype.concat,
    String.prototype.endsWith,
    String.prototype.includes,
    String.prototype.indexOf,
    String.prototype.lastIndexOf,
    String.prototype.normalize,
    String.prototype.padEnd,
    String.prototype.padStart,
    String.prototype.slice,
    String.prototype.startsWith,
    String.prototype.substr,
    String.prototype.substring,
    String.prototype.toLowerCase,
    String.prototype.toString,
    String.prototype.toUpperCase,
    String.prototype.trim,
    String.prototype.trimEnd,
    String.prototype.trimLeft,
    String.prototype.trimRight,
    String.prototype.trimStart,
    Symbol.for,
    Symbol.keyFor,
    unescape
  ].filter((f) => typeof f === "function")
);
var callPassThrough = /* @__PURE__ */ new Set([
  Object.freeze,
  Object.preventExtensions,
  Object.seal
]);
var getterAllowed = [
  [Map, /* @__PURE__ */ new Set(["size"])],
  [
    RegExp,
    /* @__PURE__ */ new Set([
      "dotAll",
      "flags",
      "global",
      "hasIndices",
      "ignoreCase",
      "multiline",
      "source",
      "sticky",
      "unicode"
    ])
  ],
  [Set, /* @__PURE__ */ new Set(["size"])]
];
function getPropertyDescriptor(object, name) {
  let x = object;
  while ((typeof x === "object" || typeof x === "function") && x !== null) {
    const d = Object.getOwnPropertyDescriptor(x, name);
    if (d) {
      return d;
    }
    x = Object.getPrototypeOf(x);
  }
  return null;
}
function isGetter(object, name) {
  const d = getPropertyDescriptor(object, name);
  return d != null && d.get != null;
}
function getElementValues(nodeList, initialScope) {
  const valueList = [];
  for (let i = 0; i < nodeList.length; ++i) {
    const elementNode = nodeList[i];
    if (elementNode == null) {
      valueList.length = i + 1;
    } else if (elementNode.type === "SpreadElement") {
      const argument = getStaticValueR(elementNode.argument, initialScope);
      if (argument == null) {
        return null;
      }
      valueList.push(.../** @type {Iterable<any>} */
      argument.value);
    } else {
      const element = getStaticValueR(elementNode, initialScope);
      if (element == null) {
        return null;
      }
      valueList.push(element.value);
    }
  }
  return valueList;
}
function isBuiltinGlobal(variable) {
  return variable != null && variable.defs.length === 0 && builtinNames.has(variable.name) && variable.name in globalObject;
}
function canBeConsideredConst(variable) {
  if (variable.defs.length !== 1) {
    return false;
  }
  const def = variable.defs[0];
  return Boolean(
    def.parent && def.type === "Variable" && (def.parent.kind === "const" || isEffectivelyConst(variable))
  );
}
function isEffectivelyConst(variable) {
  const refs = variable.references;
  const inits = refs.filter((r) => r.init).length;
  const reads = refs.filter((r) => r.isReadOnly()).length;
  if (inits === 1 && reads + inits === refs.length) {
    return true;
  }
  return false;
}
function hasMutationInProperty(variable, initialScope) {
  for (const ref of variable.references) {
    let node = (
      /** @type {TSESTreeNode} */
      ref.identifier
    );
    while (node && node.parent && node.parent.type === "MemberExpression") {
      node = node.parent;
    }
    if (!node || !node.parent) {
      continue;
    }
    if (node.parent.type === "AssignmentExpression" && node.parent.left === node || node.parent.type === "UpdateExpression" && node.parent.argument === node) {
      return true;
    }
    if (node.parent.type === "CallExpression" && node.parent.callee === node && node.type === "MemberExpression") {
      const methodName = getStaticPropertyNameValue(node, initialScope);
      if (isNameOfMutationArrayMethod(methodName)) {
        return true;
      }
    }
  }
  return false;
  function isNameOfMutationArrayMethod(methodName) {
    if (methodName == null || methodName.value == null) {
      return false;
    }
    const name = methodName.value;
    return name === "copyWithin" || name === "fill" || name === "pop" || name === "push" || name === "reverse" || name === "shift" || name === "sort" || name === "splice" || name === "unshift";
  }
}
var operations = Object.freeze({
  ArrayExpression(node, initialScope) {
    const elements = getElementValues(node.elements, initialScope);
    return elements != null ? { value: elements } : null;
  },
  AssignmentExpression(node, initialScope) {
    if (node.operator === "=") {
      return getStaticValueR(node.right, initialScope);
    }
    return null;
  },
  //eslint-disable-next-line complexity
  BinaryExpression(node, initialScope) {
    if (node.operator === "in" || node.operator === "instanceof") {
      return null;
    }
    const left = getStaticValueR(node.left, initialScope);
    const right = getStaticValueR(node.right, initialScope);
    if (left != null && right != null) {
      switch (node.operator) {
        case "==":
          return { value: left.value == right.value };
        //eslint-disable-line eqeqeq
        case "!=":
          return { value: left.value != right.value };
        //eslint-disable-line eqeqeq
        case "===":
          return { value: left.value === right.value };
        case "!==":
          return { value: left.value !== right.value };
        case "<":
          return {
            value: (
              /** @type {any} */
              left.value < /** @type {any} */
              right.value
            )
          };
        case "<=":
          return {
            value: (
              /** @type {any} */
              left.value <= /** @type {any} */
              right.value
            )
          };
        case ">":
          return {
            value: (
              /** @type {any} */
              left.value > /** @type {any} */
              right.value
            )
          };
        case ">=":
          return {
            value: (
              /** @type {any} */
              left.value >= /** @type {any} */
              right.value
            )
          };
        case "<<":
          return {
            value: (
              /** @type {any} */
              left.value << /** @type {any} */
              right.value
            )
          };
        case ">>":
          return {
            value: (
              /** @type {any} */
              left.value >> /** @type {any} */
              right.value
            )
          };
        case ">>>":
          return {
            value: (
              /** @type {any} */
              left.value >>> /** @type {any} */
              right.value
            )
          };
        case "+":
          return {
            value: (
              /** @type {any} */
              left.value + /** @type {any} */
              right.value
            )
          };
        case "-":
          return {
            value: (
              /** @type {any} */
              left.value - /** @type {any} */
              right.value
            )
          };
        case "*":
          return {
            value: (
              /** @type {any} */
              left.value * /** @type {any} */
              right.value
            )
          };
        case "/":
          return {
            value: (
              /** @type {any} */
              left.value / /** @type {any} */
              right.value
            )
          };
        case "%":
          return {
            value: (
              /** @type {any} */
              left.value % /** @type {any} */
              right.value
            )
          };
        case "**":
          return {
            value: (
              /** @type {any} */
              left.value ** /** @type {any} */
              right.value
            )
          };
        case "|":
          return {
            value: (
              /** @type {any} */
              left.value | /** @type {any} */
              right.value
            )
          };
        case "^":
          return {
            value: (
              /** @type {any} */
              left.value ^ /** @type {any} */
              right.value
            )
          };
        case "&":
          return {
            value: (
              /** @type {any} */
              left.value & /** @type {any} */
              right.value
            )
          };
      }
    }
    return null;
  },
  CallExpression(node, initialScope) {
    const calleeNode = node.callee;
    const args = getElementValues(node.arguments, initialScope);
    if (args != null) {
      if (calleeNode.type === "MemberExpression") {
        if (calleeNode.property.type === "PrivateIdentifier") {
          return null;
        }
        const object = getStaticValueR(calleeNode.object, initialScope);
        if (object != null) {
          if (object.value == null && (object.optional || node.optional)) {
            return { value: void 0, optional: true };
          }
          const property = getStaticPropertyNameValue(
            calleeNode,
            initialScope
          );
          if (property != null) {
            const receiver = (
              /** @type {Record<PropertyKey, (...args: any[]) => any>} */
              object.value
            );
            const methodName = (
              /** @type {PropertyKey} */
              property.value
            );
            if (callAllowed.has(receiver[methodName])) {
              return {
                value: receiver[methodName](...args)
              };
            }
            if (callPassThrough.has(receiver[methodName])) {
              return { value: args[0] };
            }
          }
        }
      } else {
        const callee = getStaticValueR(calleeNode, initialScope);
        if (callee != null) {
          if (callee.value == null && node.optional) {
            return { value: void 0, optional: true };
          }
          const func = (
            /** @type {(...args: any[]) => any} */
            callee.value
          );
          if (callAllowed.has(func)) {
            return { value: func(...args) };
          }
          if (callPassThrough.has(func)) {
            return { value: args[0] };
          }
        }
      }
    }
    return null;
  },
  ConditionalExpression(node, initialScope) {
    const test = getStaticValueR(node.test, initialScope);
    if (test != null) {
      return test.value ? getStaticValueR(node.consequent, initialScope) : getStaticValueR(node.alternate, initialScope);
    }
    return null;
  },
  ExpressionStatement(node, initialScope) {
    return getStaticValueR(node.expression, initialScope);
  },
  Identifier(node, initialScope) {
    if (initialScope != null) {
      const variable = findVariable(initialScope, node);
      if (variable != null) {
        if (isBuiltinGlobal(variable)) {
          return { value: globalObject[variable.name] };
        }
        if (canBeConsideredConst(variable)) {
          const def = variable.defs[0];
          if (
            // TODO(mysticatea): don't support destructuring here.
            def.node.id.type === "Identifier"
          ) {
            const init = getStaticValueR(
              def.node.init,
              initialScope
            );
            if (init && typeof init.value === "object" && init.value !== null) {
              if (hasMutationInProperty(variable, initialScope)) {
                return null;
              }
            }
            return init;
          }
        }
      }
    }
    return null;
  },
  Literal(node) {
    const literal = (
      /** @type {Partial<Literal> & Partial<RegExpLiteral> & Partial<BigIntLiteral>} */
      node
    );
    if ((literal.regex != null || literal.bigint != null) && literal.value == null) {
      return null;
    }
    return { value: literal.value };
  },
  LogicalExpression(node, initialScope) {
    const left = getStaticValueR(node.left, initialScope);
    if (left != null) {
      if (node.operator === "||" && Boolean(left.value) === true || node.operator === "&&" && Boolean(left.value) === false || node.operator === "??" && left.value != null) {
        return left;
      }
      const right = getStaticValueR(node.right, initialScope);
      if (right != null) {
        return right;
      }
    }
    return null;
  },
  MemberExpression(node, initialScope) {
    if (node.property.type === "PrivateIdentifier") {
      return null;
    }
    const object = getStaticValueR(node.object, initialScope);
    if (object != null) {
      if (object.value == null && (object.optional || node.optional)) {
        return { value: void 0, optional: true };
      }
      const property = getStaticPropertyNameValue(node, initialScope);
      if (property != null) {
        if (!isGetter(
          /** @type {object} */
          object.value,
          /** @type {PropertyKey} */
          property.value
        )) {
          return {
            value: (
              /** @type {Record<PropertyKey, unknown>} */
              object.value[
                /** @type {PropertyKey} */
                property.value
              ]
            )
          };
        }
        for (const [classFn, allowed] of getterAllowed) {
          if (object.value instanceof classFn && allowed.has(
            /** @type {string} */
            property.value
          )) {
            return {
              value: (
                /** @type {Record<PropertyKey, unknown>} */
                object.value[
                  /** @type {PropertyKey} */
                  property.value
                ]
              )
            };
          }
        }
      }
    }
    return null;
  },
  ChainExpression(node, initialScope) {
    const expression = getStaticValueR(node.expression, initialScope);
    if (expression != null) {
      return { value: expression.value };
    }
    return null;
  },
  NewExpression(node, initialScope) {
    const callee = getStaticValueR(node.callee, initialScope);
    const args = getElementValues(node.arguments, initialScope);
    if (callee != null && args != null) {
      const Func = (
        /** @type {new (...args: any[]) => any} */
        callee.value
      );
      if (callAllowed.has(Func)) {
        return { value: new Func(...args) };
      }
    }
    return null;
  },
  ObjectExpression(node, initialScope) {
    const object = {};
    for (const propertyNode of node.properties) {
      if (propertyNode.type === "Property") {
        if (propertyNode.kind !== "init") {
          return null;
        }
        const key = getStaticPropertyNameValue(
          propertyNode,
          initialScope
        );
        const value = getStaticValueR(propertyNode.value, initialScope);
        if (key == null || value == null) {
          return null;
        }
        object[
          /** @type {PropertyKey} */
          key.value
        ] = value.value;
      } else if (propertyNode.type === "SpreadElement" || // @ts-expect-error -- Backward compatibility
      propertyNode.type === "ExperimentalSpreadProperty") {
        const argument = getStaticValueR(
          propertyNode.argument,
          initialScope
        );
        if (argument == null) {
          return null;
        }
        Object.assign(object, argument.value);
      } else {
        return null;
      }
    }
    return { value: object };
  },
  SequenceExpression(node, initialScope) {
    const last = node.expressions[node.expressions.length - 1];
    return getStaticValueR(last, initialScope);
  },
  TaggedTemplateExpression(node, initialScope) {
    const tag = getStaticValueR(node.tag, initialScope);
    const expressions = getElementValues(
      node.quasi.expressions,
      initialScope
    );
    if (tag != null && expressions != null) {
      const func = (
        /** @type {(...args: any[]) => any} */
        tag.value
      );
      const strings = node.quasi.quasis.map((q) => q.value.cooked);
      strings.raw = node.quasi.quasis.map((q) => q.value.raw);
      if (func === String.raw) {
        return { value: func(strings, ...expressions) };
      }
    }
    return null;
  },
  TemplateLiteral(node, initialScope) {
    const expressions = getElementValues(node.expressions, initialScope);
    if (expressions != null) {
      let value = node.quasis[0].value.cooked;
      for (let i = 0; i < expressions.length; ++i) {
        value += expressions[i];
        value += /** @type {string} */
        node.quasis[i + 1].value.cooked;
      }
      return { value };
    }
    return null;
  },
  UnaryExpression(node, initialScope) {
    if (node.operator === "delete") {
      return null;
    }
    if (node.operator === "void") {
      return { value: void 0 };
    }
    const arg = getStaticValueR(node.argument, initialScope);
    if (arg != null) {
      switch (node.operator) {
        case "-":
          return { value: -/** @type {any} */
          arg.value };
        case "+":
          return { value: +/** @type {any} */
          arg.value };
        //eslint-disable-line no-implicit-coercion
        case "!":
          return { value: !arg.value };
        case "~":
          return { value: ~/** @type {any} */
          arg.value };
        case "typeof":
          return { value: typeof arg.value };
      }
    }
    return null;
  },
  TSAsExpression(node, initialScope) {
    return getStaticValueR(node.expression, initialScope);
  },
  TSSatisfiesExpression(node, initialScope) {
    return getStaticValueR(node.expression, initialScope);
  },
  TSTypeAssertion(node, initialScope) {
    return getStaticValueR(node.expression, initialScope);
  },
  TSNonNullExpression(node, initialScope) {
    return getStaticValueR(node.expression, initialScope);
  },
  TSInstantiationExpression(node, initialScope) {
    return getStaticValueR(node.expression, initialScope);
  }
});
function getStaticValueR(node, initialScope) {
  if (node != null && Object.hasOwnProperty.call(operations, node.type)) {
    return (
      /** @type {VisitorCallback<any>} */
      operations[node.type](
        /** @type {TSESTreeNode} */
        node,
        initialScope
      )
    );
  }
  return null;
}
function getStaticPropertyNameValue(node, initialScope) {
  const nameNode = node.type === "Property" ? node.key : node.property;
  if (node.computed) {
    return getStaticValueR(nameNode, initialScope);
  }
  if (nameNode.type === "Identifier") {
    return { value: nameNode.name };
  }
  if (nameNode.type === "Literal") {
    if (
      /** @type {Partial<BigIntLiteral>} */
      nameNode.bigint
    ) {
      return { value: (
        /** @type {BigIntLiteral} */
        nameNode.bigint
      ) };
    }
    return { value: String(nameNode.value) };
  }
  return null;
}
function getStaticValue(node, initialScope = null) {
  try {
    return getStaticValueR(node, initialScope);
  } catch (_error) {
    return null;
  }
}
function getStringIfConstant(node, initialScope = null) {
  if (node && node.type === "Literal" && node.value === null) {
    const literal = (
      /** @type {Partial<SimpleLiteral> & Partial<RegExpLiteral> & Partial<BigIntLiteral>} */
      node
    );
    if (literal.regex) {
      return `/${literal.regex.pattern}/${literal.regex.flags}`;
    }
    if (literal.bigint) {
      return literal.bigint;
    }
  }
  const evaluated = getStaticValue(node, initialScope);
  if (evaluated) {
    try {
      return String(evaluated.value);
    } catch {
    }
  }
  return null;
}
function getPropertyName(node, initialScope) {
  switch (node.type) {
    case "MemberExpression":
      if (node.computed) {
        return getStringIfConstant(node.property, initialScope);
      }
      if (node.property.type === "PrivateIdentifier") {
        return null;
      }
      return (
        /** @type {Partial<Identifier>} */
        node.property.name
      );
    case "Property":
    case "MethodDefinition":
    case "PropertyDefinition":
      if (node.computed) {
        return getStringIfConstant(node.key, initialScope);
      }
      if (node.key.type === "Literal") {
        return String(node.key.value);
      }
      if (node.key.type === "PrivateIdentifier") {
        return null;
      }
      return (
        /** @type {Partial<Identifier>} */
        node.key.name
      );
  }
  return null;
}
function getFunctionNameWithKind(node, sourceCode) {
  const parent = (
    /** @type {RuleNode} */
    node.parent
  );
  if (!parent) {
    return "";
  }
  const tokens = [];
  const isObjectMethod = parent.type === "Property" && parent.value === node;
  const isClassMethod = parent.type === "MethodDefinition" && parent.value === node;
  const isClassFieldMethod = parent.type === "PropertyDefinition" && parent.value === node;
  if (isClassMethod || isClassFieldMethod) {
    if (parent.static) {
      tokens.push("static");
    }
    if (parent.key.type === "PrivateIdentifier") {
      tokens.push("private");
    }
  }
  if (node.async) {
    tokens.push("async");
  }
  if (node.generator) {
    tokens.push("generator");
  }
  if (isObjectMethod || isClassMethod) {
    if (parent.kind === "constructor") {
      return "constructor";
    }
    if (parent.kind === "get") {
      tokens.push("getter");
    } else if (parent.kind === "set") {
      tokens.push("setter");
    } else {
      tokens.push("method");
    }
  } else if (isClassFieldMethod) {
    tokens.push("method");
  } else {
    if (node.type === "ArrowFunctionExpression") {
      tokens.push("arrow");
    }
    tokens.push("function");
  }
  if (isObjectMethod || isClassMethod || isClassFieldMethod) {
    if (parent.key.type === "PrivateIdentifier") {
      tokens.push(`#${parent.key.name}`);
    } else {
      const name = getPropertyName(parent);
      if (name) {
        tokens.push(`'${name}'`);
      } else if (sourceCode) {
        const keyText = sourceCode.getText(parent.key);
        if (!keyText.includes("\n")) {
          tokens.push(`[${keyText}]`);
        }
      }
    }
  } else if (hasId(node)) {
    tokens.push(`'${node.id.name}'`);
  } else if (parent.type === "VariableDeclarator" && parent.id && parent.id.type === "Identifier") {
    tokens.push(`'${parent.id.name}'`);
  } else if ((parent.type === "AssignmentExpression" || parent.type === "AssignmentPattern") && parent.left && parent.left.type === "Identifier") {
    tokens.push(`'${parent.left.name}'`);
  } else if (parent.type === "ExportDefaultDeclaration" && parent.declaration === node) {
    tokens.push("'default'");
  }
  return tokens.join(" ");
}
function hasId(node) {
  return Boolean(
    /** @type {Partial<FunctionDeclaration | FunctionExpression>} */
    node.id
  );
}
var typeConversionBinaryOps = Object.freeze(
  /* @__PURE__ */ new Set([
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">=",
    "<<",
    ">>",
    ">>>",
    "+",
    "-",
    "*",
    "/",
    "%",
    "|",
    "^",
    "&",
    "in"
  ])
);
var typeConversionUnaryOps = Object.freeze(/* @__PURE__ */ new Set(["-", "+", "!", "~"]));
function isNode(x) {
  return x !== null && typeof x === "object" && typeof x.type === "string";
}
var visitor = Object.freeze(
  Object.assign(/* @__PURE__ */ Object.create(null), {
    /**
     * @param {Node} node
     * @param {HasSideEffectOptions} options
     * @param {Record<string, string[]>} visitorKeys
     */
    $visit(node, options, visitorKeys) {
      const { type } = node;
      if (typeof /** @type {any} */
      this[type] === "function") {
        return (
          /** @type {any} */
          this[type](
            node,
            options,
            visitorKeys
          )
        );
      }
      return this.$visitChildren(node, options, visitorKeys);
    },
    /**
     * @param {Node} node
     * @param {HasSideEffectOptions} options
     * @param {Record<string, string[]>} visitorKeys
     */
    $visitChildren(node, options, visitorKeys) {
      const { type } = node;
      for (
        const key of
        /** @type {(keyof Node)[]} */
        visitorKeys[type] || getKeys(node)
      ) {
        const value = node[key];
        if (Array.isArray(value)) {
          for (const element of value) {
            if (isNode(element) && this.$visit(element, options, visitorKeys)) {
              return true;
            }
          }
        } else if (isNode(value) && this.$visit(value, options, visitorKeys)) {
          return true;
        }
      }
      return false;
    },
    ArrowFunctionExpression() {
      return false;
    },
    AssignmentExpression() {
      return true;
    },
    AwaitExpression() {
      return true;
    },
    /**
     * @param {BinaryExpression} node
     * @param {HasSideEffectOptions} options
     * @param {Record<string, string[]>} visitorKeys
     */
    BinaryExpression(node, options, visitorKeys) {
      if (options.considerImplicitTypeConversion && typeConversionBinaryOps.has(node.operator) && (node.left.type !== "Literal" || node.right.type !== "Literal")) {
        return true;
      }
      return this.$visitChildren(node, options, visitorKeys);
    },
    CallExpression() {
      return true;
    },
    FunctionExpression() {
      return false;
    },
    ImportExpression() {
      return true;
    },
    /**
     * @param {MemberExpression} node
     * @param {HasSideEffectOptions} options
     * @param {Record<string, string[]>} visitorKeys
     */
    MemberExpression(node, options, visitorKeys) {
      if (options.considerGetters) {
        return true;
      }
      if (options.considerImplicitTypeConversion && node.computed && node.property.type !== "Literal") {
        return true;
      }
      return this.$visitChildren(node, options, visitorKeys);
    },
    /**
     * @param {MethodDefinition} node
     * @param {HasSideEffectOptions} options
     * @param {Record<string, string[]>} visitorKeys
     */
    MethodDefinition(node, options, visitorKeys) {
      if (options.considerImplicitTypeConversion && node.computed && node.key.type !== "Literal") {
        return true;
      }
      return this.$visitChildren(node, options, visitorKeys);
    },
    NewExpression() {
      return true;
    },
    /**
     * @param {Property} node
     * @param {HasSideEffectOptions} options
     * @param {Record<string, string[]>} visitorKeys
     */
    Property(node, options, visitorKeys) {
      if (options.considerImplicitTypeConversion && node.computed && node.key.type !== "Literal") {
        return true;
      }
      return this.$visitChildren(node, options, visitorKeys);
    },
    /**
     * @param {PropertyDefinition} node
     * @param {HasSideEffectOptions} options
     * @param {Record<string, string[]>} visitorKeys
     */
    PropertyDefinition(node, options, visitorKeys) {
      if (options.considerImplicitTypeConversion && node.computed && node.key.type !== "Literal") {
        return true;
      }
      return this.$visitChildren(node, options, visitorKeys);
    },
    /**
     * @param {UnaryExpression} node
     * @param {HasSideEffectOptions} options
     * @param {Record<string, string[]>} visitorKeys
     */
    UnaryExpression(node, options, visitorKeys) {
      if (node.operator === "delete") {
        return true;
      }
      if (options.considerImplicitTypeConversion && typeConversionUnaryOps.has(node.operator) && node.argument.type !== "Literal") {
        return true;
      }
      return this.$visitChildren(node, options, visitorKeys);
    },
    UpdateExpression() {
      return true;
    },
    YieldExpression() {
      return true;
    }
  })
);
function hasSideEffect(node, sourceCode, options = {}) {
  const { considerGetters = false, considerImplicitTypeConversion = false } = options;
  return visitor.$visit(
    node,
    { considerGetters, considerImplicitTypeConversion },
    sourceCode.visitorKeys || KEYS
  );
}
function getParentSyntaxParen(node, sourceCode) {
  const parent = (
    /** @type {RuleNode} */
    node.parent
  );
  if (!parent) {
    return null;
  }
  switch (parent.type) {
    case "CallExpression":
    case "NewExpression":
      if (parent.arguments.length === 1 && parent.arguments[0] === node) {
        return sourceCode.getTokenAfter(
          // @ts-expect-error https://github.com/typescript-eslint/typescript-eslint/pull/5384
          parent.typeArguments || /** @type {RuleNode} */
          /** @type {unknown} */
          /** @type {TSNewExpression | TSCallExpression} */
          parent.typeParameters || parent.callee,
          isOpeningParenToken
        );
      }
      return null;
    case "DoWhileStatement":
      if (parent.test === node) {
        return sourceCode.getTokenAfter(
          parent.body,
          isOpeningParenToken
        );
      }
      return null;
    case "IfStatement":
    case "WhileStatement":
      if (parent.test === node) {
        return sourceCode.getFirstToken(parent, 1);
      }
      return null;
    case "ImportExpression":
      if (parent.source === node) {
        return sourceCode.getFirstToken(parent, 1);
      }
      return null;
    case "SwitchStatement":
      if (parent.discriminant === node) {
        return sourceCode.getFirstToken(parent, 1);
      }
      return null;
    case "WithStatement":
      if (parent.object === node) {
        return sourceCode.getFirstToken(parent, 1);
      }
      return null;
    default:
      return null;
  }
}
function isParenthesized(timesOrNode, nodeOrSourceCode, optionalSourceCode) {
  let times, node, sourceCode, maybeLeftParen, maybeRightParen;
  if (typeof timesOrNode === "number") {
    times = timesOrNode | 0;
    node = /** @type {RuleNode} */
    nodeOrSourceCode;
    sourceCode = /** @type {SourceCode} */
    optionalSourceCode;
    if (!(times >= 1)) {
      throw new TypeError("'times' should be a positive integer.");
    }
  } else {
    times = 1;
    node = /** @type {RuleNode} */
    timesOrNode;
    sourceCode = /** @type {SourceCode} */
    nodeOrSourceCode;
  }
  if (node == null || // `Program` can't be parenthesized
  node.parent == null || // `CatchClause.param` can't be parenthesized, example `try {} catch (error) {}`
  node.parent.type === "CatchClause" && node.parent.param === node) {
    return false;
  }
  maybeLeftParen = maybeRightParen = node;
  do {
    maybeLeftParen = sourceCode.getTokenBefore(maybeLeftParen);
    maybeRightParen = sourceCode.getTokenAfter(maybeRightParen);
  } while (maybeLeftParen != null && maybeRightParen != null && isOpeningParenToken(maybeLeftParen) && isClosingParenToken(maybeRightParen) && // Avoid false positive such as `if (a) {}`
  maybeLeftParen !== getParentSyntaxParen(node, sourceCode) && --times > 0);
  return times === 0;
}
var placeholder = /\$(?:[$&`']|[1-9][0-9]?)/gu;
var internal = /* @__PURE__ */ new WeakMap();
function isEscaped(str, index2) {
  let escaped = false;
  for (let i = index2 - 1; i >= 0 && str.charCodeAt(i) === 92; --i) {
    escaped = !escaped;
  }
  return escaped;
}
function replaceS(matcher, str, replacement) {
  const chunks = [];
  let index2 = 0;
  function replacer(key, match) {
    switch (key) {
      case "$$":
        return "$";
      case "$&":
        return match[0];
      case "$`":
        return str.slice(0, match.index);
      case "$'":
        return str.slice(match.index + match[0].length);
      default: {
        const i = key.slice(1);
        if (i in match) {
          return match[
            /** @type {any} */
            i
          ];
        }
        return key;
      }
    }
  }
  for (const match of matcher.execAll(str)) {
    chunks.push(str.slice(index2, match.index));
    chunks.push(
      replacement.replace(placeholder, (key) => replacer(key, match))
    );
    index2 = match.index + match[0].length;
  }
  chunks.push(str.slice(index2));
  return chunks.join("");
}
function replaceF(matcher, str, replace) {
  const chunks = [];
  let index2 = 0;
  for (const match of matcher.execAll(str)) {
    chunks.push(str.slice(index2, match.index));
    chunks.push(
      String(
        replace(
          .../** @type {[string, ...string[]]} */
          /** @type {string[]} */
          match,
          match.index,
          match.input
        )
      )
    );
    index2 = match.index + match[0].length;
  }
  chunks.push(str.slice(index2));
  return chunks.join("");
}
var PatternMatcher = class {
  /**
   * Initialize this matcher.
   * @param {RegExp} pattern The pattern to match.
   * @param {{escaped?:boolean}} [options] The options.
   */
  constructor(pattern, options = {}) {
    const { escaped = false } = options;
    if (!(pattern instanceof RegExp)) {
      throw new TypeError("'pattern' should be a RegExp instance.");
    }
    if (!pattern.flags.includes("g")) {
      throw new Error("'pattern' should contains 'g' flag.");
    }
    internal.set(this, {
      pattern: new RegExp(pattern.source, pattern.flags),
      escaped: Boolean(escaped)
    });
  }
  /**
   * Find the pattern in a given string.
   * @param {string} str The string to find.
   * @returns {IterableIterator<RegExpExecArray>} The iterator which iterate the matched information.
   */
  *execAll(str) {
    const { pattern, escaped } = (
      /** @type {{pattern:RegExp,escaped:boolean}} */
      internal.get(this)
    );
    let match = null;
    let lastIndex = 0;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(str)) != null) {
      if (escaped || !isEscaped(str, match.index)) {
        lastIndex = pattern.lastIndex;
        yield match;
        pattern.lastIndex = lastIndex;
      }
    }
  }
  /**
   * Check whether the pattern is found in a given string.
   * @param {string} str The string to check.
   * @returns {boolean} `true` if the pattern was found in the string.
   */
  test(str) {
    const it = this.execAll(str);
    const ret = it.next();
    return !ret.done;
  }
  /**
   * Replace a given string.
   * @param {string} str The string to be replaced.
   * @param {(string|((...strs:string[])=>string))} replacer The string or function to replace. This is the same as the 2nd argument of `String.prototype.replace`.
   * @returns {string} The replaced string.
   */
  [Symbol.replace](str, replacer) {
    return typeof replacer === "function" ? replaceF(this, String(str), replacer) : replaceS(this, String(str), String(replacer));
  }
};
var IMPORT_TYPE = /^(?:Import|Export(?:All|Default|Named))Declaration$/u;
function isHasSource(node) {
  return IMPORT_TYPE.test(node.type) && /** @type {ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration} */
  node.source != null;
}
var has = (
  /** @type {<T>(traceMap: TraceMap<unknown>, v: T) => v is (string extends T ? string : T)} */
  Function.call.bind(Object.hasOwnProperty)
);
var READ = Symbol("read");
var CALL = Symbol("call");
var CONSTRUCT = Symbol("construct");
var ESM = Symbol("esm");
var requireCall = { require: { [CALL]: true } };
function isModifiedGlobal(variable) {
  return variable == null || variable.defs.length !== 0 || variable.references.some((r) => r.isWrite());
}
function isPassThrough(node) {
  const parent = (
    /** @type {TSESTreeNode} */
    node.parent
  );
  if (parent) {
    switch (parent.type) {
      case "ConditionalExpression":
        return parent.consequent === node || parent.alternate === node;
      case "LogicalExpression":
        return true;
      case "SequenceExpression":
        return parent.expressions[parent.expressions.length - 1] === node;
      case "ChainExpression":
        return true;
      case "TSAsExpression":
      case "TSSatisfiesExpression":
      case "TSTypeAssertion":
      case "TSNonNullExpression":
      case "TSInstantiationExpression":
        return true;
      default:
        return false;
    }
  }
  return false;
}
var ReferenceTracker = class {
  /**
   * Initialize this tracker.
   * @param {Scope} globalScope The global scope.
   * @param {object} [options] The options.
   * @param {"legacy"|"strict"} [options.mode="strict"] The mode to determine the ImportDeclaration's behavior for CJS modules.
   * @param {string[]} [options.globalObjectNames=["global","globalThis","self","window"]] The variable names for Global Object.
   */
  constructor(globalScope, options = {}) {
    const {
      mode = "strict",
      globalObjectNames = ["global", "globalThis", "self", "window"]
    } = options;
    this.variableStack = [];
    this.globalScope = globalScope;
    this.mode = mode;
    this.globalObjectNames = globalObjectNames.slice(0);
  }
  /**
   * Iterate the references of global variables.
   * @template T
   * @param {TraceMap<T>} traceMap The trace map.
   * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
   */
  *iterateGlobalReferences(traceMap) {
    for (const key of Object.keys(traceMap)) {
      const nextTraceMap = traceMap[key];
      const path = [key];
      const variable = this.globalScope.set.get(key);
      if (isModifiedGlobal(variable)) {
        continue;
      }
      yield* this._iterateVariableReferences(
        /** @type {Variable} */
        variable,
        path,
        nextTraceMap,
        true
      );
    }
    for (const key of this.globalObjectNames) {
      const path = [];
      const variable = this.globalScope.set.get(key);
      if (isModifiedGlobal(variable)) {
        continue;
      }
      yield* this._iterateVariableReferences(
        /** @type {Variable} */
        variable,
        path,
        traceMap,
        false
      );
    }
  }
  /**
   * Iterate the references of CommonJS modules.
   * @template T
   * @param {TraceMap<T>} traceMap The trace map.
   * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
   */
  *iterateCjsReferences(traceMap) {
    for (const { node } of this.iterateGlobalReferences(requireCall)) {
      const key = getStringIfConstant(
        /** @type {CallExpression} */
        node.arguments[0]
      );
      if (key == null || !has(traceMap, key)) {
        continue;
      }
      const nextTraceMap = traceMap[key];
      const path = [key];
      if (nextTraceMap[READ]) {
        yield {
          node,
          path,
          type: READ,
          info: nextTraceMap[READ]
        };
      }
      yield* this._iteratePropertyReferences(
        /** @type {CallExpression} */
        node,
        path,
        nextTraceMap
      );
    }
  }
  /**
   * Iterate the references of ES modules.
   * @template T
   * @param {TraceMap<T>} traceMap The trace map.
   * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
   */
  *iterateEsmReferences(traceMap) {
    const programNode = (
      /** @type {Program} */
      this.globalScope.block
    );
    for (const node of programNode.body) {
      if (!isHasSource(node)) {
        continue;
      }
      const moduleId = (
        /** @type {string} */
        node.source.value
      );
      if (!has(traceMap, moduleId)) {
        continue;
      }
      const nextTraceMap = traceMap[moduleId];
      const path = [moduleId];
      if (nextTraceMap[READ]) {
        yield {
          // eslint-disable-next-line object-shorthand -- apply type
          node: (
            /** @type {RuleNode} */
            node
          ),
          path,
          type: READ,
          info: nextTraceMap[READ]
        };
      }
      if (node.type === "ExportAllDeclaration") {
        for (const key of Object.keys(nextTraceMap)) {
          const exportTraceMap = nextTraceMap[key];
          if (exportTraceMap[READ]) {
            yield {
              // eslint-disable-next-line object-shorthand -- apply type
              node: (
                /** @type {RuleNode} */
                node
              ),
              path: path.concat(key),
              type: READ,
              info: exportTraceMap[READ]
            };
          }
        }
      } else {
        for (const specifier of node.specifiers) {
          const esm = has(nextTraceMap, ESM);
          const it = this._iterateImportReferences(
            specifier,
            path,
            esm ? nextTraceMap : this.mode === "legacy" ? { default: nextTraceMap, ...nextTraceMap } : { default: nextTraceMap }
          );
          if (esm) {
            yield* it;
          } else {
            for (const report of it) {
              report.path = report.path.filter(exceptDefault);
              if (report.path.length >= 2 || report.type !== READ) {
                yield report;
              }
            }
          }
        }
      }
    }
  }
  /**
   * Iterate the property references for a given expression AST node.
   * @template T
   * @param {Expression} node The expression AST node to iterate property references.
   * @param {TraceMap<T>} traceMap The trace map.
   * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate property references.
   */
  *iteratePropertyReferences(node, traceMap) {
    yield* this._iteratePropertyReferences(node, [], traceMap);
  }
  /**
   * Iterate the references for a given variable.
   * @private
   * @template T
   * @param {Variable} variable The variable to iterate that references.
   * @param {string[]} path The current path.
   * @param {TraceMapObject<T>} traceMap The trace map.
   * @param {boolean} shouldReport = The flag to report those references.
   * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
   */
  *_iterateVariableReferences(variable, path, traceMap, shouldReport) {
    if (this.variableStack.includes(variable)) {
      return;
    }
    this.variableStack.push(variable);
    try {
      for (const reference of variable.references) {
        if (!reference.isRead()) {
          continue;
        }
        const node = (
          /** @type {RuleNode & Identifier} */
          reference.identifier
        );
        if (shouldReport && traceMap[READ]) {
          yield { node, path, type: READ, info: traceMap[READ] };
        }
        yield* this._iteratePropertyReferences(node, path, traceMap);
      }
    } finally {
      this.variableStack.pop();
    }
  }
  /**
   * Iterate the references for a given AST node.
   * @private
   * @template T
   * @param {Expression} rootNode The AST node to iterate references.
   * @param {string[]} path The current path.
   * @param {TraceMapObject<T>} traceMap The trace map.
   * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
   */
  //eslint-disable-next-line complexity
  *_iteratePropertyReferences(rootNode, path, traceMap) {
    let node = rootNode;
    while (isPassThrough(node)) {
      node = node.parent;
    }
    const parent = (
      /** @type {RuleNode} */
      node.parent
    );
    if (!parent) {
      return;
    }
    if (parent.type === "MemberExpression") {
      if (parent.object === node) {
        const key = getPropertyName(parent);
        if (key == null || !has(traceMap, key)) {
          return;
        }
        path = path.concat(key);
        const nextTraceMap = traceMap[key];
        if (nextTraceMap[READ]) {
          yield {
            node: parent,
            path,
            type: READ,
            info: nextTraceMap[READ]
          };
        }
        yield* this._iteratePropertyReferences(
          parent,
          path,
          nextTraceMap
        );
      }
      return;
    }
    if (parent.type === "CallExpression") {
      if (parent.callee === node && traceMap[CALL]) {
        yield { node: parent, path, type: CALL, info: traceMap[CALL] };
      }
      return;
    }
    if (parent.type === "NewExpression") {
      if (parent.callee === node && traceMap[CONSTRUCT]) {
        yield {
          node: parent,
          path,
          type: CONSTRUCT,
          info: traceMap[CONSTRUCT]
        };
      }
      return;
    }
    if (parent.type === "AssignmentExpression") {
      if (parent.right === node) {
        yield* this._iterateLhsReferences(parent.left, path, traceMap);
        yield* this._iteratePropertyReferences(parent, path, traceMap);
      }
      return;
    }
    if (parent.type === "AssignmentPattern") {
      if (parent.right === node) {
        yield* this._iterateLhsReferences(parent.left, path, traceMap);
      }
      return;
    }
    if (parent.type === "VariableDeclarator") {
      if (parent.init === node) {
        yield* this._iterateLhsReferences(parent.id, path, traceMap);
      }
    }
  }
  /**
   * Iterate the references for a given Pattern node.
   * @private
   * @template T
   * @param {Pattern} patternNode The Pattern node to iterate references.
   * @param {string[]} path The current path.
   * @param {TraceMapObject<T>} traceMap The trace map.
   * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
   */
  *_iterateLhsReferences(patternNode, path, traceMap) {
    if (patternNode.type === "Identifier") {
      const variable = findVariable(this.globalScope, patternNode);
      if (variable != null) {
        yield* this._iterateVariableReferences(
          variable,
          path,
          traceMap,
          false
        );
      }
      return;
    }
    if (patternNode.type === "ObjectPattern") {
      for (const property of patternNode.properties) {
        const key = getPropertyName(
          /** @type {AssignmentProperty} */
          property
        );
        if (key == null || !has(traceMap, key)) {
          continue;
        }
        const nextPath = path.concat(key);
        const nextTraceMap = traceMap[key];
        if (nextTraceMap[READ]) {
          yield {
            node: (
              /** @type {RuleNode} */
              property
            ),
            path: nextPath,
            type: READ,
            info: nextTraceMap[READ]
          };
        }
        yield* this._iterateLhsReferences(
          /** @type {AssignmentProperty} */
          property.value,
          nextPath,
          nextTraceMap
        );
      }
      return;
    }
    if (patternNode.type === "AssignmentPattern") {
      yield* this._iterateLhsReferences(patternNode.left, path, traceMap);
    }
  }
  /**
   * Iterate the references for a given ModuleSpecifier node.
   * @private
   * @template T
   * @param {ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier} specifierNode The ModuleSpecifier node to iterate references.
   * @param {string[]} path The current path.
   * @param {TraceMapObject<T>} traceMap The trace map.
   * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
   */
  *_iterateImportReferences(specifierNode, path, traceMap) {
    const type = specifierNode.type;
    if (type === "ImportSpecifier" || type === "ImportDefaultSpecifier") {
      const key = type === "ImportDefaultSpecifier" ? "default" : specifierNode.imported.type === "Identifier" ? specifierNode.imported.name : specifierNode.imported.value;
      if (!has(traceMap, key)) {
        return;
      }
      path = path.concat(key);
      const nextTraceMap = traceMap[key];
      if (nextTraceMap[READ]) {
        yield {
          node: (
            /** @type {RuleNode} */
            specifierNode
          ),
          path,
          type: READ,
          info: nextTraceMap[READ]
        };
      }
      yield* this._iterateVariableReferences(
        /** @type {Variable} */
        findVariable(this.globalScope, specifierNode.local),
        path,
        nextTraceMap,
        false
      );
      return;
    }
    if (type === "ImportNamespaceSpecifier") {
      yield* this._iterateVariableReferences(
        /** @type {Variable} */
        findVariable(this.globalScope, specifierNode.local),
        path,
        traceMap,
        false
      );
      return;
    }
    if (type === "ExportSpecifier") {
      const key = specifierNode.local.type === "Identifier" ? specifierNode.local.name : specifierNode.local.value;
      if (!has(traceMap, key)) {
        return;
      }
      path = path.concat(key);
      const nextTraceMap = traceMap[key];
      if (nextTraceMap[READ]) {
        yield {
          node: (
            /** @type {RuleNode} */
            specifierNode
          ),
          path,
          type: READ,
          info: nextTraceMap[READ]
        };
      }
    }
  }
};
ReferenceTracker.READ = READ;
ReferenceTracker.CALL = CALL;
ReferenceTracker.CONSTRUCT = CONSTRUCT;
ReferenceTracker.ESM = ESM;
function exceptDefault(name, index2) {
  return !(index2 === 1 && name === "default");
}
var index = {
  CALL,
  CONSTRUCT,
  ESM,
  findVariable,
  getFunctionHeadLocation,
  getFunctionNameWithKind,
  getInnermostScope,
  getPropertyName,
  getStaticValue,
  getStringIfConstant,
  hasSideEffect,
  isArrowToken,
  isClosingBraceToken,
  isClosingBracketToken,
  isClosingParenToken,
  isColonToken,
  isCommaToken,
  isCommentToken,
  isNotArrowToken,
  isNotClosingBraceToken,
  isNotClosingBracketToken,
  isNotClosingParenToken,
  isNotColonToken,
  isNotCommaToken,
  isNotCommentToken,
  isNotOpeningBraceToken,
  isNotOpeningBracketToken,
  isNotOpeningParenToken,
  isNotSemicolonToken,
  isOpeningBraceToken,
  isOpeningBracketToken,
  isOpeningParenToken,
  isParenthesized,
  isSemicolonToken,
  PatternMatcher,
  READ,
  ReferenceTracker
};

// inlined:@eslint-community/eslint-utils
var { CALL: CALL2, CONSTRUCT: CONSTRUCT2, ESM: ESM2, PatternMatcher: PatternMatcher2, READ: READ2, ReferenceTracker: ReferenceTracker2, findVariable: findVariable2, getFunctionHeadLocation: getFunctionHeadLocation2, getFunctionNameWithKind: getFunctionNameWithKind2, getInnermostScope: getInnermostScope2, getPropertyName: getPropertyName2, getStaticValue: getStaticValue2, getStringIfConstant: getStringIfConstant2, hasSideEffect: hasSideEffect2, isArrowToken: isArrowToken2, isClosingBraceToken: isClosingBraceToken2, isClosingBracketToken: isClosingBracketToken2, isClosingParenToken: isClosingParenToken2, isColonToken: isColonToken2, isCommaToken: isCommaToken2, isCommentToken: isCommentToken2, isNotArrowToken: isNotArrowToken2, isNotClosingBraceToken: isNotClosingBraceToken2, isNotClosingBracketToken: isNotClosingBracketToken2, isNotClosingParenToken: isNotClosingParenToken2, isNotColonToken: isNotColonToken2, isNotCommaToken: isNotCommaToken2, isNotCommentToken: isNotCommentToken2, isNotOpeningBraceToken: isNotOpeningBraceToken2, isNotOpeningBracketToken: isNotOpeningBracketToken2, isNotOpeningParenToken: isNotOpeningParenToken2, isNotSemicolonToken: isNotSemicolonToken2, isOpeningBraceToken: isOpeningBraceToken2, isOpeningBracketToken: isOpeningBracketToken2, isOpeningParenToken: isOpeningParenToken2, isParenthesized: isParenthesized2, isSemicolonToken: isSemicolonToken2 } = eslint_utils_exports;
export {
  CALL2 as CALL,
  CONSTRUCT2 as CONSTRUCT,
  ESM2 as ESM,
  PatternMatcher2 as PatternMatcher,
  READ2 as READ,
  ReferenceTracker2 as ReferenceTracker,
  findVariable2 as findVariable,
  getFunctionHeadLocation2 as getFunctionHeadLocation,
  getFunctionNameWithKind2 as getFunctionNameWithKind,
  getInnermostScope2 as getInnermostScope,
  getPropertyName2 as getPropertyName,
  getStaticValue2 as getStaticValue,
  getStringIfConstant2 as getStringIfConstant,
  hasSideEffect2 as hasSideEffect,
  isArrowToken2 as isArrowToken,
  isClosingBraceToken2 as isClosingBraceToken,
  isClosingBracketToken2 as isClosingBracketToken,
  isClosingParenToken2 as isClosingParenToken,
  isColonToken2 as isColonToken,
  isCommaToken2 as isCommaToken,
  isCommentToken2 as isCommentToken,
  isNotArrowToken2 as isNotArrowToken,
  isNotClosingBraceToken2 as isNotClosingBraceToken,
  isNotClosingBracketToken2 as isNotClosingBracketToken,
  isNotClosingParenToken2 as isNotClosingParenToken,
  isNotColonToken2 as isNotColonToken,
  isNotCommaToken2 as isNotCommaToken,
  isNotCommentToken2 as isNotCommentToken,
  isNotOpeningBraceToken2 as isNotOpeningBraceToken,
  isNotOpeningBracketToken2 as isNotOpeningBracketToken,
  isNotOpeningParenToken2 as isNotOpeningParenToken,
  isNotSemicolonToken2 as isNotSemicolonToken,
  isOpeningBraceToken2 as isOpeningBraceToken,
  isOpeningBracketToken2 as isOpeningBracketToken,
  isOpeningParenToken2 as isOpeningParenToken,
  isParenthesized2 as isParenthesized,
  isSemicolonToken2 as isSemicolonToken
};
