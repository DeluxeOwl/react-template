"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  plugin: () => plugin
});
module.exports = __toCommonJS(index_exports);

// src/rules/no-title-case-props.ts
function getPropName(node) {
  if (node.type === "JSXIdentifier") {
    return node.name;
  }
  if (node.type === "JSXNamespacedName") {
    return `${node.namespace.name}:${node.name.name}`;
  }
  return null;
}
function isTitleCase(name) {
  if (name.length === 0) return false;
  const first = name[0];
  return first >= "A" && first <= "Z";
}
var rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow TitleCase JSX props",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-title-case-props.md"
    },
    messages: {
      noTitleCase: "Prop '{{prop}}' uses TitleCase. Use camelCase instead (e.g. {{suggestion}})."
    },
    schema: []
  },
  create(context) {
    return {
      JSXAttribute(node) {
        const attrName = node.name;
        const propName = getPropName(attrName);
        if (!propName || !isTitleCase(propName)) return;
        const suggestion = propName.length > 1 ? propName[0].toLowerCase() + propName.slice(1) : propName.toLowerCase();
        context.report({
          node: node.name,
          messageId: "noTitleCase",
          data: { prop: propName, suggestion }
        });
      }
    };
  }
};
var no_title_case_props_default = rule;

// src/rules/no-custom-kebab-case-props.ts
var DEFAULT_ALLOWED_KEBAB_PREFIXES = ["aria-", "data-"];
function getPropName2(node) {
  if (node.type === "JSXIdentifier") {
    return node.name;
  }
  if (node.type === "JSXNamespacedName") {
    return `${node.namespace.name}:${node.name.name}`;
  }
  return null;
}
function isKebabCase(name) {
  return name.includes("-");
}
function kebabToCamelCase(name) {
  const segments = name.split("-").filter(Boolean);
  if (segments.length === 0) return name;
  const first = segments[0] ?? "";
  const tail = segments.slice(1).map((segment) => segment[0]?.toUpperCase() + segment.slice(1)).join("");
  return `${first}${tail}`;
}
function resolveRuleOptions(context) {
  const option = context.options[0] ?? {};
  const allowedPrefixes = Array.from(
    /* @__PURE__ */ new Set([...DEFAULT_ALLOWED_KEBAB_PREFIXES, ...option.extendPrefixes ?? []])
  );
  const allowedProps = new Set(option.allowedProps ?? []);
  return {
    allowedPrefixes,
    allowedProps
  };
}
function isAllowedKebabProp(name, options) {
  if (options.allowedProps.has(name)) return true;
  return options.allowedPrefixes.some((prefix) => name.startsWith(prefix));
}
var rule2 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow custom kebab-case JSX props (allows aria-* and data-* by default with configurable additions)",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-custom-kebab-case-props.md"
    },
    messages: {
      noCustomKebab: "Custom kebab-case prop '{{prop}}' is not allowed. Use '{{suggestion}}')."
    },
    schema: [
      {
        type: "object",
        properties: {
          extendPrefixes: {
            type: "array",
            items: { type: "string" }
          },
          allowedProps: {
            type: "array",
            items: { type: "string" }
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = resolveRuleOptions(context);
    return {
      JSXAttribute(node) {
        const attrName = node.name;
        const propName = getPropName2(attrName);
        if (!propName || !isKebabCase(propName)) return;
        if (isAllowedKebabProp(propName, options)) return;
        context.report({
          node: node.name,
          messageId: "noCustomKebab",
          data: { prop: propName, suggestion: kebabToCamelCase(propName) }
        });
      }
    };
  }
};
var no_custom_kebab_case_props_default = rule2;

// src/rules/no-set-prefix-utils.ts
var SET_PREFIX = "set";
function startsWithSet(name) {
  return name.startsWith(SET_PREFIX) && name.length > SET_PREFIX.length;
}
function isUseStateCall(node) {
  if (!node || node.type !== "CallExpression") return false;
  const call = node;
  const callee = call.callee;
  if (callee.type === "Identifier") {
    return callee.name === "useState";
  }
  if (callee.type === "MemberExpression") {
    const mem = callee;
    return mem.property.type === "Identifier" && mem.property.name === "useState";
  }
  return false;
}
function isFunctionInit(node) {
  if (!node) return false;
  return node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression";
}
var rule3 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Forbid util/helper functions prefixed with set*; allow React state setter identifiers from useState tuple destructuring",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-set-prefix-utils.md"
    },
    messages: {
      noSetPrefixUtil: "Util/helper function '{{name}}' should not use set*. Reserve set* for React useState setters."
    },
    schema: []
  },
  create(context) {
    return {
      FunctionDeclaration(node) {
        const fn = node;
        if (!fn.id || !startsWithSet(fn.id.name)) return;
        context.report({
          node: fn.id,
          messageId: "noSetPrefixUtil",
          data: { name: fn.id.name }
        });
      },
      VariableDeclarator(node) {
        const decl = node;
        const { id, init } = decl;
        if (id.type === "ArrayPattern") {
          const arr = id;
          if (arr.elements.length >= 2 && arr.elements[1]?.type === "Identifier" && isUseStateCall(init)) {
            return;
          }
        }
        if (id.type === "Identifier" && startsWithSet(id.name) && isFunctionInit(init)) {
          context.report({
            node: id,
            messageId: "noSetPrefixUtil",
            data: { name: id.name }
          });
        }
      }
    };
  }
};
var no_set_prefix_utils_default = rule3;

// src/rules/no-handle-prefix-utils.ts
var HANDLE_PREFIX = "handle";
function startsWithHandle(name) {
  return name.startsWith(HANDLE_PREFIX) && name.length > HANDLE_PREFIX.length;
}
function isOnJsxPropName(name) {
  if (!name.startsWith("on") || name.length <= 2) return false;
  const third = name[2];
  return third >= "A" && third <= "Z";
}
function asIdentifier(node) {
  if (!node || node.type !== "Identifier") return null;
  const identifier = node;
  if (typeof identifier.name !== "string") return null;
  return identifier;
}
function isFunctionInit2(node) {
  if (!node) return false;
  return node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression";
}
function isUseCallbackIdentifier(node) {
  if (node.type !== "Identifier") return false;
  const identifier = node;
  return identifier.name === "useCallback";
}
function isUseCallbackMemberExpression(node) {
  if (node.type !== "MemberExpression") return false;
  const memberExpression = node;
  const property = asIdentifier(memberExpression.property ?? null);
  if (!property) return false;
  return property.name === "useCallback";
}
function isUseCallbackCallee(node) {
  if (!node) return false;
  if (isUseCallbackIdentifier(node)) return true;
  return isUseCallbackMemberExpression(node);
}
function isCallbackInit(node) {
  if (!node || node.type !== "CallExpression") return false;
  const callExpression = node;
  return isUseCallbackCallee(callExpression.callee ?? null);
}
function isValidHandleInit(node) {
  return isFunctionInit2(node) || isCallbackInit(node);
}
function getHandleNamesFromText(text) {
  const matches = text.match(/\bhandle[A-Za-z0-9_$]*\b/g);
  if (!matches) return [];
  return [...new Set(matches)];
}
function mergeUnique(left, right) {
  return [.../* @__PURE__ */ new Set([...left, ...right])];
}
function getHandleIdentifier(node) {
  const id = asIdentifier(node);
  if (!id) return null;
  if (!startsWithHandle(id.name)) return null;
  return id;
}
function getFunctionDeclarationCandidate(node) {
  if (node.type !== "FunctionDeclaration") return null;
  const declaration = node;
  const id = getHandleIdentifier(declaration.id ?? null);
  if (!id) return null;
  return {
    name: id.name,
    node: id
  };
}
function getVariableCandidate(node) {
  if (node.type !== "VariableDeclarator") return null;
  const declaration = node;
  const id = getHandleIdentifier(declaration.id);
  if (!id || !isValidHandleInit(declaration.init ?? null)) return null;
  return {
    name: id.name,
    node: id
  };
}
function getOnPropName(attribute) {
  const nameNode = attribute.name;
  if (!nameNode || nameNode.type !== "JSXIdentifier") return null;
  const propName = nameNode.name;
  if (!isOnJsxPropName(propName)) return null;
  return propName;
}
function getExpressionFromAttribute(attribute) {
  const value = attribute.value;
  if (!value || value.type !== "JSXExpressionContainer") return null;
  return value.expression ?? null;
}
function getUsedHandleNamesFromAttribute(attribute, sourceCode) {
  const onPropName = getOnPropName(attribute);
  if (!onPropName) return [];
  const expression = getExpressionFromAttribute(attribute);
  if (!expression) return [];
  const expressionText = sourceCode.getText(expression);
  return getHandleNamesFromText(expressionText);
}
function getOnPropNameFromIdentifierKey(key) {
  if (key.type === "Identifier") {
    const identifier = key;
    if (typeof identifier.name !== "string") return null;
    return isOnJsxPropName(identifier.name) ? identifier.name : null;
  }
  return null;
}
function getOnPropNameFromLiteralKey(key) {
  if (key.type !== "Literal") return null;
  const literal = key;
  if (typeof literal.value !== "string") return null;
  return isOnJsxPropName(literal.value) ? literal.value : null;
}
function getOnPropNameFromObjectProperty(property) {
  const propertyNode = property;
  if (propertyNode.type !== "Property" || propertyNode.computed) return null;
  if (!propertyNode.key) return null;
  const identifierName = getOnPropNameFromIdentifierKey(propertyNode.key);
  if (identifierName) return identifierName;
  return getOnPropNameFromLiteralKey(propertyNode.key);
}
function getObjectExpressionProperties(argument) {
  if (!argument || argument.type !== "ObjectExpression") return [];
  const objectExpression = argument;
  return objectExpression.properties ?? [];
}
function getUsedHandleNamesFromObjectPropertyValue(property, sourceCode) {
  const onPropName = getOnPropNameFromObjectProperty(property);
  if (!onPropName) return [];
  const propertyNode = property;
  if (!propertyNode.value) return [];
  const propertyValueText = sourceCode.getText(propertyNode.value);
  return getHandleNamesFromText(propertyValueText);
}
function getUsedHandleNamesFromSpreadAttribute(spreadAttribute, sourceCode) {
  const properties = getObjectExpressionProperties(spreadAttribute.argument);
  let usedNames = [];
  for (const property of properties) {
    const namesFromValue = getUsedHandleNamesFromObjectPropertyValue(property, sourceCode);
    usedNames = mergeUnique(usedNames, namesFromValue);
  }
  return usedNames;
}
function isEventListenerMethodName(name) {
  return name === "addEventListener" || name === "removeEventListener";
}
function getEventListenerMethodName(callee) {
  if (!callee || callee.type !== "MemberExpression") return null;
  const calleeNode = callee;
  if (calleeNode.computed) return null;
  const property = asIdentifier(calleeNode.property ?? null);
  if (!property) return null;
  return property.name;
}
function getEventListenerCallbackArgument(callExpression) {
  if (callExpression.type !== "CallExpression") return null;
  const callNode = callExpression;
  const eventListenerMethodName = getEventListenerMethodName(callNode.callee);
  if (!eventListenerMethodName || !isEventListenerMethodName(eventListenerMethodName)) return null;
  if (!callNode.arguments || callNode.arguments.length < 2) return null;
  return callNode.arguments[1] ?? null;
}
function getUsedHandleNamesFromEventListenerCall(node, sourceCode) {
  const callbackArgument = getEventListenerCallbackArgument(node);
  if (!callbackArgument) return [];
  const callbackText = sourceCode.getText(callbackArgument);
  return getHandleNamesFromText(callbackText);
}
var rule4 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Forbid util/helper functions prefixed with handle* unless they are used as JSX on* handlers",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-handle-prefix-utils.md"
    },
    messages: {
      noHandlePrefixUtil: "Util/helper function '{{name}}' should not use handle*. Reserve handle* for functions used in JSX on* props."
    },
    schema: []
  },
  create(context) {
    const reportContext = context;
    const sourceCode = context.sourceCode;
    let candidates = [];
    let usedNames = [];
    return {
      FunctionDeclaration(node) {
        const candidate = getFunctionDeclarationCandidate(node);
        if (!candidate) return;
        candidates = [...candidates, candidate];
      },
      VariableDeclarator(node) {
        const candidate = getVariableCandidate(node);
        if (!candidate) return;
        candidates = [...candidates, candidate];
      },
      JSXAttribute(node) {
        const attribute = node;
        const namesFromAttribute = getUsedHandleNamesFromAttribute(attribute, sourceCode);
        usedNames = mergeUnique(usedNames, namesFromAttribute);
      },
      JSXSpreadAttribute(node) {
        const spreadAttribute = node;
        const namesFromSpread = getUsedHandleNamesFromSpreadAttribute(spreadAttribute, sourceCode);
        usedNames = mergeUnique(usedNames, namesFromSpread);
      },
      CallExpression(node) {
        const namesFromEventListenerCall = getUsedHandleNamesFromEventListenerCall(node, sourceCode);
        usedNames = mergeUnique(usedNames, namesFromEventListenerCall);
      },
      "Program:exit"() {
        for (const candidate of candidates) {
          if (usedNames.includes(candidate.name)) continue;
          reportContext.report({
            node: candidate.node,
            messageId: "noHandlePrefixUtil",
            data: { name: candidate.name }
          });
        }
      }
    };
  }
};
var no_handle_prefix_utils_default = rule4;

// src/rules/no-hook-jsx.ts
function isUseName2(name) {
  return name.startsWith("use") && name.length > 3;
}
function isJSXNode(node) {
  if (!node) return false;
  const type = node.type;
  return type === "JSXElement" || type === "JSXFragment";
}
var CHILD_KEYS2 = {
  Program: ["body"],
  BlockStatement: ["body"],
  ReturnStatement: ["argument"],
  VariableDeclarator: ["id", "init"],
  ExpressionStatement: ["expression"],
  IfStatement: ["test", "consequent", "alternate"],
  ForStatement: ["init", "test", "update", "body"],
  ForInStatement: ["left", "right", "body"],
  ForOfStatement: ["left", "right", "body"],
  WhileStatement: ["test", "body"],
  DoWhileStatement: ["body", "test"],
  SwitchStatement: ["discriminant", "cases"],
  SwitchCase: ["test", "consequent"],
  TryStatement: ["block", "handler", "finalizer"],
  CatchClause: ["param", "body"],
  // Expression nodes that may contain nested JSX
  ArrowFunctionExpression: ["params", "body"],
  FunctionExpression: ["params", "body"],
  ObjectExpression: ["properties"],
  Property: ["key", "value"],
  ArrayExpression: ["elements"],
  ConditionalExpression: ["test", "consequent", "alternate"],
  LogicalExpression: ["left", "right"],
  CallExpression: ["callee", "arguments"],
  SequenceExpression: ["expressions"],
  SpreadElement: ["argument"],
  MemberExpression: ["object", "property"],
  JSXElement: ["openingElement", "closingElement", "children"],
  JSXFragment: ["openingFragment", "closingFragment", "children"]
};
var STATEMENT_CHILD_KEYS = {
  ...CHILD_KEYS2,
  // Do not descend into nested function bodies when finding ReturnStatements
  FunctionDeclaration: ["params"],
  FunctionExpression: ["params"],
  ArrowFunctionExpression: ["params"]
};
function* traverse2(node, opts) {
  if (!node || typeof node !== "object") return;
  const keysMap = opts?.skipFunctionBodies ? STATEMENT_CHILD_KEYS : CHILD_KEYS2;
  const stack = [node];
  const seen = /* @__PURE__ */ new WeakSet();
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    yield current;
    const keys = keysMap[current.type ?? ""] ?? [];
    const n = current;
    for (const key of keys) {
      const val = n[key];
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = val.length - 1; i >= 0; i--) {
            const child = val[i];
            if (child && typeof child === "object" && "type" in child) {
              stack.push(child);
            }
          }
        } else if ("type" in val) {
          stack.push(val);
        }
      }
    }
  }
}
function containsJSX(node) {
  for (const n of traverse2(node)) {
    if (isJSXNode(n)) return true;
  }
  return false;
}
function returnsJSX(body) {
  if (!body) return false;
  const b = body;
  if (b.type === "JSXElement" || b.type === "JSXFragment") {
    return true;
  }
  if (b.type === "BlockStatement") {
    const block = body;
    for (const statement of block.body ?? []) {
      for (const child of traverse2(statement, {
        skipFunctionBodies: true
      })) {
        const c = child;
        if (c.type === "ReturnStatement" && c.argument) {
          if (containsJSX(c.argument)) return true;
        }
      }
    }
    return false;
  }
  return containsJSX(body);
}
var rule6 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow use* functions that return JSX. Hooks should return values, not components.",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-hook-jsx.md"
    },
    messages: {
      noHookJsx: "Function '{{name}}' is named like a hook but returns JSX."
    },
    schema: []
  },
  create(context) {
    function checkHookLikeFunction(name, body, reportNode) {
      if (!isUseName2(name)) return;
      if (!returnsJSX(body)) return;
      context.report({
        node: reportNode,
        messageId: "noHookJsx",
        data: { name }
      });
    }
    return {
      FunctionDeclaration(node) {
        const fn = node;
        if (!fn.id) return;
        checkHookLikeFunction(fn.id.name, fn.body, fn.id);
      },
      VariableDeclarator(node) {
        const decl = node;
        const { id, init } = decl;
        if (id.type !== "Identifier") return;
        const name = id.name;
        if (!isUseName2(name)) return;
        if (init?.type !== "ArrowFunctionExpression" && init?.type !== "FunctionExpression") {
          return;
        }
        const body = init.body;
        checkHookLikeFunction(name, body, id);
      }
    };
  }
};
var no_hook_jsx_default = rule6;

// src/rules/no-exported-context-hooks.ts
function isContextHookName(name) {
  return name.startsWith("use") && name.endsWith("Context") && name.length > 10;
}
function reportIfContextHook(context, node, name) {
  if (!isContextHookName(name)) return;
  context.report({
    node,
    messageId: "noExportedContextHook",
    data: { name }
  });
}
var rule7 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow exporting use*Context hooks. Keep context hooks private to the component module.",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-exported-context-hooks.md"
    },
    messages: {
      noExportedContextHook: "Do not export context hook '{{name}}'. Keep it private and expose a controlled API instead."
    },
    schema: []
  },
  create(context) {
    function checkNamedExport(node) {
      const exp = node;
      const declaration = exp.declaration;
      if (declaration?.type === "FunctionDeclaration") {
        const fn = declaration;
        if (!fn.id?.name) return;
        reportIfContextHook(context, declaration, fn.id.name);
        return;
      }
      if (declaration?.type === "VariableDeclaration") {
        const decl = declaration;
        for (const entry of decl.declarations ?? []) {
          const d = entry;
          if (d.id?.type !== "Identifier") continue;
          const id = d.id;
          reportIfContextHook(context, d.id, id.name);
        }
        return;
      }
      for (const specifier of exp.specifiers ?? []) {
        if (specifier.type !== "ExportSpecifier") continue;
        const s = specifier;
        if (s.local?.type === "Identifier") {
          const local = s.local;
          reportIfContextHook(context, s.local, local.name);
          continue;
        }
        if (s.exported?.type === "Identifier") {
          const exported = s.exported;
          reportIfContextHook(context, s.exported, exported.name);
        }
      }
    }
    function checkDefaultExport(node) {
      const exp = node;
      const declaration = exp.declaration;
      if (!declaration) return;
      if (declaration.type === "Identifier") {
        const id = declaration;
        reportIfContextHook(context, declaration, id.name);
        return;
      }
      if (declaration.type === "FunctionDeclaration") {
        const fn = declaration;
        if (!fn.id?.name) return;
        reportIfContextHook(context, declaration, fn.id.name);
      }
    }
    return {
      ExportNamedDeclaration: checkNamedExport,
      ExportDefaultDeclaration: checkDefaultExport
    };
  }
};
var no_exported_context_hooks_default = rule7;

// src/rules/no-handler-return-type.ts
function getKeyName(node) {
  if (node.type === "Identifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  return null;
}
function isHandlerProp(name) {
  if (!name.startsWith("on") || name.length <= 2) return false;
  const third = name[2];
  return third >= "A" && third <= "Z";
}
function getReturnTypeAnnotation(node) {
  const rt = node.returnType;
  return rt?.typeAnnotation ?? null;
}
function isVoidType(typeNode) {
  return typeNode.type === "TSVoidKeyword";
}
function isAllowedHandlerReturnType(typeNode) {
  return isVoidType(typeNode);
}
function getFunctionReturnTypes(typeNode) {
  const n = typeNode;
  if (n.type === "TSFunctionType") {
    const returnType = getReturnTypeAnnotation(typeNode);
    return returnType ? [returnType] : [];
  }
  if (n.type === "TSParenthesizedType" && n.typeAnnotation) {
    return getFunctionReturnTypes(n.typeAnnotation);
  }
  if ((n.type === "TSUnionType" || n.type === "TSIntersectionType") && Array.isArray(n.types)) {
    const result = [];
    for (const entry of n.types) result.push(...getFunctionReturnTypes(entry));
    return result;
  }
  return [];
}
function getInvalidReturnType(typeNode) {
  const returnTypes = getFunctionReturnTypes(typeNode);
  for (const returnType of returnTypes) {
    if (!isAllowedHandlerReturnType(returnType)) return returnType;
  }
  return null;
}
function reportInvalidReturnType(context, node, propName, returnType) {
  context.report({
    node,
    messageId: "noHandlerReturnType",
    data: {
      prop: propName,
      returnType: context.sourceCode.getText(returnType)
    }
  });
}
function isComponentPropsContractName(name) {
  return name?.endsWith("Props") ?? false;
}
var rule8 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow handler prop definitions (on*) that expect return values. Handler contracts must return void.",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-handler-return-type.md"
    },
    messages: {
      noHandlerReturnType: "Handler prop '{{prop}}' expects return type '{{returnType}}'. Handler props must return void."
    },
    schema: []
  },
  create(context) {
    function checkPropertySignature(node) {
      const property = node;
      if (!property.key || !property.typeAnnotation?.typeAnnotation) return;
      const propName = getKeyName(property.key);
      if (!propName || !isHandlerProp(propName)) return;
      const invalidReturnType = getInvalidReturnType(property.typeAnnotation.typeAnnotation);
      if (!invalidReturnType) return;
      reportInvalidReturnType(context, node, propName, invalidReturnType);
    }
    function checkMethodSignature(node) {
      const method = node;
      if (!method.key || !method.returnType?.typeAnnotation) return;
      const propName = getKeyName(method.key);
      if (!propName || !isHandlerProp(propName)) return;
      if (isAllowedHandlerReturnType(method.returnType.typeAnnotation)) return;
      reportInvalidReturnType(context, node, propName, method.returnType.typeAnnotation);
    }
    function checkMembers(members) {
      for (const member of members) {
        const maybeMember = member;
        if (maybeMember.type === "TSPropertySignature") {
          checkPropertySignature(member);
          continue;
        }
        if (maybeMember.type === "TSMethodSignature") {
          checkMethodSignature(member);
        }
      }
    }
    return {
      TSInterfaceDeclaration(node) {
        const declaration = node;
        if (!isComponentPropsContractName(declaration.id?.name)) return;
        if (declaration.body?.type !== "TSInterfaceBody") return;
        checkMembers(declaration.body.body ?? []);
      },
      TSTypeAliasDeclaration(node) {
        const declaration = node;
        if (!isComponentPropsContractName(declaration.id?.name)) return;
        if (declaration.typeAnnotation?.type !== "TSTypeLiteral") return;
        checkMembers(declaration.typeAnnotation.members ?? []);
      }
    };
  }
};
var no_handler_return_type_default = rule8;

// src/rules/jsx-server-action-prop-suffix.ts
function getKeyName2(node) {
  if (node.type === "Identifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  return null;
}
function isActionPropName(name) {
  return name === "action" || name.endsWith("Action");
}
function getReturnTypeAnnotation2(node) {
  return node.returnType?.typeAnnotation ?? null;
}
function isPromiseType(typeNode) {
  const n = typeNode;
  if (n.type !== "TSTypeReference") return false;
  const typeName = n.typeName?.name ?? n.typeName?.right?.name;
  return typeName === "Promise";
}
function isComponentPropsContractName2(name) {
  return name?.endsWith("Props") ?? false;
}
function getFunctionReturnTypes2(typeNode) {
  const n = typeNode;
  if (n.type === "TSFunctionType") {
    const returnType = getReturnTypeAnnotation2(typeNode);
    return returnType ? [returnType] : [];
  }
  if (n.type === "TSParenthesizedType" && n.typeAnnotation) {
    return getFunctionReturnTypes2(n.typeAnnotation);
  }
  if ((n.type === "TSUnionType" || n.type === "TSIntersectionType") && Array.isArray(n.types)) {
    const result = [];
    for (const entry of n.types) result.push(...getFunctionReturnTypes2(entry));
    return result;
  }
  return [];
}
var rule9 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce async function prop contracts to use action prop names (action or *Action).",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/jsx-server-action-prop-suffix.md"
    },
    messages: {
      asyncPropRequiresActionName: "Async function prop '{{prop}}' must be named 'action' or end with 'Action'."
    },
    schema: []
  },
  create(context) {
    function reportIfNeeded(node, propName, returnType) {
      if (isActionPropName(propName)) return;
      context.report({
        node,
        messageId: "asyncPropRequiresActionName",
        data: { prop: propName, returnType: context.sourceCode.getText(returnType) }
      });
    }
    function checkPropertySignature(node) {
      const property = node;
      const key = property.key;
      const typeNode = property.typeAnnotation?.typeAnnotation;
      if (!key || !typeNode) return;
      const propName = getKeyName2(key);
      if (!propName) return;
      for (const returnType of getFunctionReturnTypes2(typeNode)) {
        if (isPromiseType(returnType)) {
          reportIfNeeded(node, propName, returnType);
          return;
        }
      }
    }
    function checkMethodSignature(node) {
      const method = node;
      const key = method.key;
      const returnType = method.returnType?.typeAnnotation;
      if (!key || !returnType) return;
      if (!isPromiseType(returnType)) return;
      const propName = getKeyName2(key);
      if (!propName) return;
      reportIfNeeded(node, propName, returnType);
    }
    function checkMembers(members) {
      for (const member of members) {
        const maybeMember = member;
        if (maybeMember.type === "TSPropertySignature") {
          checkPropertySignature(member);
          continue;
        }
        if (maybeMember.type === "TSMethodSignature") {
          checkMethodSignature(member);
        }
      }
    }
    return {
      TSInterfaceDeclaration(node) {
        const declaration = node;
        if (!isComponentPropsContractName2(declaration.id?.name)) return;
        if (declaration.body?.type !== "TSInterfaceBody") return;
        checkMembers(declaration.body.body ?? []);
      },
      TSTypeAliasDeclaration(node) {
        const declaration = node;
        if (!isComponentPropsContractName2(declaration.id?.name)) return;
        if (declaration.typeAnnotation?.type !== "TSTypeLiteral") return;
        checkMembers(declaration.typeAnnotation.members ?? []);
      }
    };
  }
};
var jsx_server_action_prop_suffix_default = rule9;

// src/rules/no-render-helper-functions.ts
function isPascalCase(name) {
  if (!name || name.length === 0) return false;
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}
function expressionReturnsJSX(node) {
  if (!node) return false;
  const n = node;
  const t = n.type;
  if (t === "JSXElement" || t === "JSXFragment") return true;
  if (t === "ParenthesizedExpression") {
    return expressionReturnsJSX(n.expression);
  }
  if (t === "ConditionalExpression") {
    return expressionReturnsJSX(n.consequent) || expressionReturnsJSX(n.alternate);
  }
  if (t === "LogicalExpression") {
    return expressionReturnsJSX(n.left) || expressionReturnsJSX(n.right);
  }
  return false;
}
var STATEMENT_CHILD_KEYS2 = {
  BlockStatement: ["body"],
  IfStatement: ["test", "consequent", "alternate"],
  ForStatement: ["init", "test", "update", "body"],
  ForInStatement: ["left", "right", "body"],
  ForOfStatement: ["left", "right", "body"],
  WhileStatement: ["test", "body"],
  DoWhileStatement: ["body", "test"],
  SwitchStatement: ["discriminant", "cases"],
  SwitchCase: ["test", "consequent"],
  TryStatement: ["block", "handler", "finalizer"],
  CatchClause: ["param", "body"],
  ReturnStatement: ["argument"],
  ExpressionStatement: ["expression"],
  VariableDeclaration: ["declarations"]
};
function* traverseStatements(node) {
  if (!node || typeof node !== "object") return;
  const stack = [node];
  const seen = /* @__PURE__ */ new WeakSet();
  while (stack.length > 0) {
    const current = stack.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    yield current;
    const keys = STATEMENT_CHILD_KEYS2[current.type ?? ""] ?? [];
    const n = current;
    for (const key of keys) {
      const val = n[key];
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = val.length - 1; i >= 0; i--) {
            const child = val[i];
            if (child && typeof child === "object" && "type" in child) {
              stack.push(child);
            }
          }
        } else if ("type" in val) {
          stack.push(val);
        }
      }
    }
  }
}
function functionReturnsJSX(body) {
  if (!body) return false;
  const b = body;
  if (b.type === "JSXElement" || b.type === "JSXFragment") {
    return true;
  }
  if (b.type === "BlockStatement") {
    for (const child of traverseStatements(body)) {
      const s = child;
      if (s.type === "ReturnStatement" && s.argument) {
        if (expressionReturnsJSX(s.argument)) return true;
      }
    }
  }
  return false;
}
var rule11 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Forbid JSX returned from non-component functions. Functions that return JSX should use PascalCase names.",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-render-helper-functions.md"
    },
    messages: {
      noRenderHelperFunctions: "Function '{{name}}' returns JSX but is not PascalCase. Create a component instead."
    },
    schema: []
  },
  create(context) {
    function checkFunction(name, body, reportNode) {
      if (isPascalCase(name)) return;
      if (!functionReturnsJSX(body)) return;
      context.report({
        node: reportNode,
        messageId: "noRenderHelperFunctions",
        data: { name }
      });
    }
    return {
      FunctionDeclaration(node) {
        const fn = node;
        if (!fn.id) return;
        checkFunction(fn.id.name, fn.body, fn.id);
      },
      VariableDeclarator(node) {
        const decl = node;
        const { id, init } = decl;
        if (id.type !== "Identifier") return;
        const name = id.name;
        if (init?.type !== "ArrowFunctionExpression" && init?.type !== "FunctionExpression") {
          return;
        }
        const body = init.body;
        checkFunction(name, body, id);
      }
    };
  }
};
var no_render_helper_functions_default = rule11;

// src/rules/no-element-props.ts
function getPropKeyName(prop) {
  const key = prop.key;
  if (key.type === "Identifier" && "name" in key) return key.name ?? null;
  return null;
}
function getPropsFromInterfaceBody(body) {
  return body.body ?? [];
}
function getPropsFromTypeLiteral(typeNode) {
  const n = typeNode;
  if (n && n.type === "TSTypeLiteral" && Array.isArray(n.members)) return n.members;
  return [];
}
function isComponentPropsContractName3(name) {
  return name?.endsWith("Props") ?? false;
}
var rule12 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow ReactNode/ReactElement-typed props except children/render.",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-element-props.md"
    },
    messages: {
      noElementProps: "Prop '{{prop}}' has an element type. Use compound composition via children or parts instead."
    },
    schema: []
  },
  create(context) {
    const aliasTypeMap = /* @__PURE__ */ new Map();
    function getTypeNameFromRef2(node) {
      const typeName = node.typeName;
      if ("name" in typeName && typeName.name) return typeName.name;
      if ("right" in typeName && typeName.right?.name) return typeName.right.name;
      return null;
    }
    function astContainsReactElementType(typeNode, visitedAliases) {
      if (!typeNode || typeof typeNode !== "object") return false;
      const node = typeNode;
      if (node.type === "TSTypeReference") {
        const ref = node;
        const typeName = getTypeNameFromRef2(ref);
        if (typeName === "ReactNode" || typeName === "ReactElement") return true;
        if (typeName && aliasTypeMap.has(typeName) && !visitedAliases.has(typeName)) {
          visitedAliases.add(typeName);
          return astContainsReactElementType(aliasTypeMap.get(typeName), visitedAliases);
        }
        return false;
      }
      if (node.type === "TSUnionType" || node.type === "TSIntersectionType") {
        const unionNode = node;
        return (unionNode.types ?? []).some(
          (entry) => astContainsReactElementType(entry, visitedAliases)
        );
      }
      if (node.type === "TSOptionalType" || node.type === "TSParenthesizedType") {
        const wrapped = node;
        return astContainsReactElementType(wrapped.typeAnnotation, visitedAliases);
      }
      return false;
    }
    function checkProp(prop, reportNode) {
      const name = getPropKeyName(prop);
      if (!name) return;
      const typeAnn = prop.typeAnnotation?.typeAnnotation;
      const hasElementType = astContainsReactElementType(typeAnn, /* @__PURE__ */ new Set());
      if (hasElementType && name !== "children" && name !== "render") {
        context.report({
          node: reportNode,
          messageId: "noElementProps",
          data: { prop: name }
        });
      }
    }
    function visitProps(props) {
      for (const prop of props) {
        if (prop.type !== "TSPropertySignature") continue;
        checkProp(prop, prop.key);
      }
    }
    const pendingChecks = [];
    return {
      TSInterfaceDeclaration(node) {
        const decl = node;
        if (!isComponentPropsContractName3(decl.id?.name)) return;
        if (decl.body?.type === "TSInterfaceBody") {
          const props = getPropsFromInterfaceBody(decl.body);
          pendingChecks.push(() => visitProps(props));
        }
      },
      TSTypeAliasDeclaration(node) {
        const decl = node;
        if (decl.id?.type === "Identifier" && decl.id.name && decl.typeAnnotation) {
          aliasTypeMap.set(decl.id.name, decl.typeAnnotation);
        }
        if (!isComponentPropsContractName3(decl.id?.name)) return;
        const typeAnn = decl.typeAnnotation;
        if (typeAnn) {
          const props = getPropsFromTypeLiteral(typeAnn);
          pendingChecks.push(() => visitProps(props));
        }
      },
      "Program:exit"() {
        for (const check of pendingChecks) check();
      }
    };
  }
};
var no_element_props_default = rule12;

// src/rules/no-componenttype-props.ts
var FORBIDDEN_TYPE_NAMES = /* @__PURE__ */ new Set(["ComponentType", "FC", "FunctionComponent"]);
function getTypeNameFromRef(node) {
  const tn = node.typeName;
  if ("name" in tn && tn.name) return tn.name;
  if ("right" in tn && tn.right) return tn.right.name;
  return null;
}
function isComponentTypeProp(typeNode, resolveAliasType, seenAliases = /* @__PURE__ */ new Set()) {
  if (!typeNode || typeof typeNode !== "object") return false;
  const n = typeNode;
  if (n.type === "TSTypeReference") {
    const ref = n;
    const name = getTypeNameFromRef(ref);
    if (name !== null && FORBIDDEN_TYPE_NAMES.has(name)) return true;
    if (!name || !resolveAliasType || seenAliases.has(name)) return false;
    const aliasType = resolveAliasType(name);
    if (!aliasType) return false;
    const nextSeenAliases = new Set(seenAliases);
    nextSeenAliases.add(name);
    return isComponentTypeProp(aliasType, resolveAliasType, nextSeenAliases);
  }
  if (n.type === "TSUnionType" || n.type === "TSIntersectionType") {
    const union = n;
    return (union.types ?? []).some((t) => isComponentTypeProp(t, resolveAliasType, seenAliases));
  }
  if (n.type === "TSOptionalType") {
    const opt = n;
    return isComponentTypeProp(opt.typeAnnotation, resolveAliasType, seenAliases);
  }
  return false;
}
function getPropKeyName2(prop) {
  const key = prop.key;
  if (key.type === "Identifier" && "name" in key) return key.name ?? null;
  return null;
}
function getPropsFromInterfaceBody2(body) {
  return body.body ?? [];
}
function getPropsFromTypeLiteral2(typeNode) {
  const n = typeNode;
  if (n && n.type === "TSTypeLiteral" && Array.isArray(n.members)) return n.members;
  return [];
}
function isComponentPropsContractName4(name) {
  return name?.endsWith("Props") ?? false;
}
var rule13 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow ComponentType/FC/FunctionComponent in prop definitions. Prefer asChild or render prop for polymorphism.",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-componenttype-props.md"
    },
    messages: {
      noComponentTypeProps: "Prop '{{prop}}' has a component type. Use asChild or a render prop for polymorphism."
    },
    schema: []
  },
  create(context) {
    const localTypeAliases = /* @__PURE__ */ new Map();
    function checkProp(prop) {
      const name = getPropKeyName2(prop);
      if (!name) return;
      const typeAnn = prop.typeAnnotation?.typeAnnotation;
      if (!typeAnn) return;
      if (!isComponentTypeProp(typeAnn, (aliasName) => localTypeAliases.get(aliasName) ?? null)) {
        return;
      }
      context.report({
        node: prop.key,
        messageId: "noComponentTypeProps",
        data: { prop: name }
      });
    }
    function visitProps(props) {
      for (const prop of props) {
        if (prop.type !== "TSPropertySignature") continue;
        checkProp(prop);
      }
    }
    const pendingChecks = [];
    return {
      TSInterfaceDeclaration(node) {
        const decl = node;
        if (!isComponentPropsContractName4(decl.id?.name)) return;
        if (decl.body?.type === "TSInterfaceBody") {
          const props = getPropsFromInterfaceBody2(decl.body);
          pendingChecks.push(() => visitProps(props));
        }
      },
      TSTypeAliasDeclaration(node) {
        const decl = node;
        const typeAliasName = decl.id?.name;
        if (typeAliasName) {
          localTypeAliases.set(typeAliasName, decl.typeAnnotation);
        }
        if (!isComponentPropsContractName4(typeAliasName)) return;
        const typeAnn = decl.typeAnnotation;
        if (typeAnn) {
          const props = getPropsFromTypeLiteral2(typeAnn);
          pendingChecks.push(() => visitProps(props));
        }
      },
      "Program:exit"() {
        for (const check of pendingChecks) check();
      }
    };
  }
};
var no_componenttype_props_default = rule13;

// src/rules/no-prefixed-prop-bundles.ts
var DEFAULT_THRESHOLD = 3;
var IGNORED_PREFIXES = /* @__PURE__ */ new Set(["aria", "can", "data", "has", "is", "on", "should"]);
function getBundlePrefix(propName) {
  if (!propName) return null;
  const first = propName[0];
  if (!first || first < "a" || first > "z") return null;
  let firstUpperIndex = -1;
  for (let index = 1; index < propName.length; index += 1) {
    const char = propName[index];
    if (char >= "A" && char <= "Z") {
      firstUpperIndex = index;
      break;
    }
  }
  if (firstUpperIndex <= 0 || firstUpperIndex >= propName.length) return null;
  const prefix = propName.slice(0, firstUpperIndex);
  if (!prefix || IGNORED_PREFIXES.has(prefix)) return null;
  return prefix;
}
function getPropName4(node) {
  const key = node.key;
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal" && typeof key.value === "string") return key.value;
  return null;
}
function reportPrefixedPropBundle(context, properties, prefix) {
  for (const property of properties) {
    const propName = getPropName4(property);
    if (!propName) continue;
    context.report({
      node: property.key,
      messageId: "noPrefixedPropBundle",
      data: {
        prop: propName,
        prefix,
        count: String(properties.length)
      }
    });
  }
}
function checkMembersForPrefixedBundles(context, members, threshold) {
  const groups = /* @__PURE__ */ new Map();
  for (const memberNode of members) {
    const maybeProperty = memberNode;
    if (maybeProperty.type !== "TSPropertySignature") continue;
    const property = memberNode;
    const propName = getPropName4(property);
    if (!propName) continue;
    const prefix = getBundlePrefix(propName);
    if (!prefix) continue;
    const existing = groups.get(prefix);
    if (existing) {
      existing.push(property);
      continue;
    }
    groups.set(prefix, [property]);
  }
  for (const [prefix, properties] of groups.entries()) {
    if (properties.length < threshold) continue;
    reportPrefixedPropBundle(context, properties, prefix);
  }
}
function isComponentPropsContractName5(name) {
  return name?.endsWith("Props") ?? false;
}
var rule16 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow bundles of similarly-prefixed prop type declarations that suggest over-grouped component APIs",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-prefixed-prop-bundles.md"
    },
    messages: {
      noPrefixedPropBundle: "Prop '{{prop}}' is in a '{{prefix}}*' bundle ({{count}} props). Prefer explicit props and compound composition."
    },
    schema: [
      {
        type: "object",
        properties: {
          threshold: {
            type: "integer",
            minimum: 2
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = context.options[0] ?? {};
    const threshold = options.threshold ?? DEFAULT_THRESHOLD;
    return {
      TSInterfaceDeclaration(node) {
        const declaration = node;
        if (!isComponentPropsContractName5(declaration.id?.name)) return;
        if (declaration.body?.type !== "TSInterfaceBody") return;
        checkMembersForPrefixedBundles(context, declaration.body.body ?? [], threshold);
      },
      TSTypeAliasDeclaration(node) {
        const declaration = node;
        if (!isComponentPropsContractName5(declaration.id?.name)) return;
        const annotation = declaration.typeAnnotation;
        if (!annotation || annotation.type !== "TSTypeLiteral") return;
        checkMembersForPrefixedBundles(context, annotation.members ?? [], threshold);
      }
    };
  }
};
var no_prefixed_prop_bundles_default = rule16;

// src/rules/no-optional-props-without-defaults.ts
function isPascalCaseName(name) {
  const first = name[0];
  return Boolean(first && first >= "A" && first <= "Z");
}
function getPropertyName3(node) {
  if (node.type === "Identifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  return null;
}
function globToRegex2(globPattern) {
  const escaped = globPattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`);
}
function createIgnoredPropMatcher2(ignorePatterns) {
  const regexes = ignorePatterns.map(globToRegex2);
  return (propName) => regexes.some((regex) => regex.test(propName));
}
function getTypeReferenceName(typeNode) {
  const maybeRef = typeNode;
  if (maybeRef.type !== "TSTypeReference" || !maybeRef.typeName) return null;
  if (maybeRef.typeName.type === "Identifier" && maybeRef.typeName.name) {
    return maybeRef.typeName.name;
  }
  if (maybeRef.typeName.type === "TSQualifiedName" && maybeRef.typeName.right?.name) {
    return maybeRef.typeName.right.name;
  }
  return null;
}
function collectOptionalPropNamesFromMembers(members, isIgnoredPropName) {
  const optionalPropNames = /* @__PURE__ */ new Set();
  for (const member of members) {
    const maybeProperty = member;
    if (maybeProperty.type !== "TSPropertySignature" || !maybeProperty.optional) continue;
    const propName = getPropertyName3(maybeProperty.key);
    if (!propName) continue;
    if (isIgnoredPropName(propName)) continue;
    optionalPropNames.add(propName);
  }
  return optionalPropNames;
}
function getAuthoredOptionalPropNamesFromTypeNode(typeNode, optionalPropMap, isIgnoredPropName) {
  if (!typeNode) return /* @__PURE__ */ new Set();
  const maybeTypeLiteral = typeNode;
  if (maybeTypeLiteral.type === "TSTypeLiteral") {
    return collectOptionalPropNamesFromMembers(maybeTypeLiteral.members ?? [], isIgnoredPropName);
  }
  const typeRefName = getTypeReferenceName(typeNode);
  if (typeRefName) {
    return new Set(optionalPropMap.get(typeRefName) ?? []);
  }
  return /* @__PURE__ */ new Set();
}
function collectDefaultedParamKeys(paramNode) {
  const defaultedKeys = /* @__PURE__ */ new Set();
  const maybeObjectPattern = paramNode;
  if (maybeObjectPattern.type !== "ObjectPattern") return defaultedKeys;
  for (const propertyNode of maybeObjectPattern.properties ?? []) {
    const maybeProperty = propertyNode;
    if (maybeProperty.type !== "Property") continue;
    const propName = getPropertyName3(maybeProperty.key);
    if (!propName) continue;
    const maybeValue = maybeProperty.value;
    if (!maybeValue || maybeValue.type !== "AssignmentPattern") continue;
    defaultedKeys.add(propName);
  }
  return defaultedKeys;
}
function getParamTypeAnnotationNode(paramNode) {
  const maybeAnnotatedParam = paramNode;
  if (maybeAnnotatedParam.typeAnnotation?.typeAnnotation) {
    return maybeAnnotatedParam.typeAnnotation.typeAnnotation;
  }
  const maybeAssignment = paramNode;
  if (maybeAssignment.type !== "AssignmentPattern") return null;
  const maybeAssignmentLeft = maybeAssignment.left;
  return maybeAssignmentLeft.typeAnnotation?.typeAnnotation ?? null;
}
var rule17 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow authored optional component props unless they are defaulted at the component boundary",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-optional-props-without-defaults.md"
    },
    messages: {
      noOptionalPropWithoutDefault: "Component '{{component}}' prop '{{prop}}' is optional without a default."
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            type: "array",
            items: { type: "string" }
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = context.options[0] ?? {};
    const isIgnoredPropName = createIgnoredPropMatcher2(options.ignore ?? []);
    const optionalPropsByTypeName = /* @__PURE__ */ new Map();
    function storeTypeOptionalProps(typeName, members) {
      optionalPropsByTypeName.set(
        typeName,
        collectOptionalPropNamesFromMembers(members, isIgnoredPropName)
      );
    }
    function reportOptionalPropsWithoutDefaults(componentName, paramNode) {
      const defaultedKeys = collectDefaultedParamKeys(paramNode);
      const paramTypeAnnotation = getParamTypeAnnotationNode(paramNode);
      const optionalPropNames = getAuthoredOptionalPropNamesFromTypeNode(
        paramTypeAnnotation ?? void 0,
        optionalPropsByTypeName,
        isIgnoredPropName
      );
      for (const propName of optionalPropNames) {
        if (defaultedKeys.has(propName)) continue;
        context.report({
          node: paramNode,
          messageId: "noOptionalPropWithoutDefault",
          data: {
            component: componentName,
            prop: propName
          }
        });
      }
    }
    return {
      TSInterfaceDeclaration(node) {
        const declaration = node;
        const typeName = declaration.id?.name;
        if (!typeName) return;
        if (declaration.body?.type !== "TSInterfaceBody") return;
        storeTypeOptionalProps(typeName, declaration.body.body ?? []);
      },
      TSTypeAliasDeclaration(node) {
        const declaration = node;
        const typeName = declaration.id?.name;
        if (!typeName) return;
        const typeAnnotation = declaration.typeAnnotation;
        if (typeAnnotation?.type !== "TSTypeLiteral") return;
        storeTypeOptionalProps(typeName, typeAnnotation.members ?? []);
      },
      FunctionDeclaration(node) {
        const declaration = node;
        const componentName = declaration.id?.name;
        if (!componentName || !isPascalCaseName(componentName)) return;
        const firstParam = declaration.params?.[0];
        if (!firstParam) return;
        reportOptionalPropsWithoutDefaults(componentName, firstParam);
      },
      VariableDeclarator(node) {
        const declaration = node;
        const componentName = declaration.id?.name;
        if (!componentName || !isPascalCaseName(componentName)) return;
        const init = declaration.init;
        if (!init) return;
        if (init.type !== "ArrowFunctionExpression" && init.type !== "FunctionExpression") return;
        const firstParam = init.params?.[0];
        if (!firstParam) return;
        reportOptionalPropsWithoutDefaults(componentName, firstParam);
      }
    };
  }
};
var no_optional_props_without_defaults_default = rule17;

// src/rules/no-boolean-capability-props.ts
var NATIVE_BOOLEAN_PROPS = /* @__PURE__ */ new Set([
  "allowFullScreen",
  "allowTransparency",
  "async",
  "autoFocus",
  "autoPlay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formNoValidate",
  "hidden",
  "inert",
  "loop",
  "multiple",
  "muted",
  "noModule",
  "noValidate",
  "open",
  "playsInline",
  "readOnly",
  "required",
  "reversed",
  "selected"
]);
function getPropName5(node) {
  if (node.type === "Identifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  return null;
}
function isBooleanLikeType(typeNode) {
  if (!typeNode) return false;
  const maybeType = typeNode;
  if (maybeType.type === "TSBooleanKeyword") return true;
  if (maybeType.type === "TSLiteralType") {
    const literalValue = maybeType.literal?.value;
    return literalValue === true || literalValue === false;
  }
  if (maybeType.type === "TSParenthesizedType" || maybeType.type === "TSOptionalType") {
    return isBooleanLikeType(maybeType.typeAnnotation);
  }
  if (maybeType.type === "TSUnionType" || maybeType.type === "TSIntersectionType") {
    return (maybeType.types ?? []).some((member) => isBooleanLikeType(member));
  }
  return false;
}
function isHandlerPropName(name) {
  if (!name.startsWith("on") || name.length <= 2) return false;
  const firstCharAfterPrefix = name[2];
  return firstCharAfterPrefix >= "A" && firstCharAfterPrefix <= "Z";
}
function isFunctionLikeType(typeNode) {
  if (!typeNode) return false;
  const maybeType = typeNode;
  if (maybeType.type === "TSFunctionType") return true;
  if (maybeType.type === "TSParenthesizedType" || maybeType.type === "TSOptionalType") {
    return isFunctionLikeType(maybeType.typeAnnotation);
  }
  if (maybeType.type === "TSUnionType" || maybeType.type === "TSIntersectionType") {
    return (maybeType.types ?? []).some((member) => isFunctionLikeType(member));
  }
  return false;
}
function capitalize(value) {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
}
function isComponentPropsContractName6(name) {
  return name?.endsWith("Props") ?? false;
}
var rule18 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow boolean component props without associated control handlers in prop contracts",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-boolean-capability-props.md"
    },
    messages: {
      noBooleanCapabilityProp: "Boolean prop '{{prop}}' has no controlled handler. Prefer controlled APIs, compound composition, or an explicit variant prop."
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            type: "array",
            items: {
              type: "string"
            }
          },
          ignoreNativeBooleanProps: {
            type: "boolean"
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = context.options[0] ?? {};
    const ignoredProps = new Set(options.ignore ?? []);
    if (options.ignoreNativeBooleanProps) {
      for (const propName of NATIVE_BOOLEAN_PROPS) {
        ignoredProps.add(propName);
      }
    }
    function checkMembers(members) {
      const booleanProps = [];
      const handlerProps = /* @__PURE__ */ new Set();
      for (const memberNode of members) {
        const maybeProperty = memberNode;
        if (maybeProperty.type !== "TSPropertySignature") continue;
        const propName = getPropName5(maybeProperty.key);
        if (!propName) continue;
        if (ignoredProps.has(propName)) continue;
        const typeNode = maybeProperty.typeAnnotation?.typeAnnotation;
        if (isFunctionLikeType(typeNode) && isHandlerPropName(propName)) {
          handlerProps.add(propName);
          continue;
        }
        if (!isBooleanLikeType(typeNode)) continue;
        booleanProps.push({ name: propName, node: maybeProperty });
      }
      for (const booleanProp of booleanProps) {
        const handlerPrefix = `on${capitalize(booleanProp.name)}`;
        const hasAssociatedHandler = [...handlerProps].some(
          (handlerName) => handlerName.startsWith(handlerPrefix)
        );
        if (hasAssociatedHandler) continue;
        context.report({
          node: booleanProp.node.key,
          messageId: "noBooleanCapabilityProp",
          data: { prop: booleanProp.name }
        });
      }
    }
    return {
      TSInterfaceDeclaration(node) {
        const declaration = node;
        if (!isComponentPropsContractName6(declaration.id?.name)) return;
        if (declaration.body?.type !== "TSInterfaceBody") return;
        checkMembers(declaration.body.body ?? []);
      },
      TSTypeAliasDeclaration(node) {
        const declaration = node;
        if (!isComponentPropsContractName6(declaration.id?.name)) return;
        const typeAnnotation = declaration.typeAnnotation;
        if (!typeAnnotation || typeAnnotation.type !== "TSTypeLiteral") return;
        checkMembers(typeAnnotation.members ?? []);
      }
    };
  }
};
var no_boolean_capability_props_default = rule18;

// src/rules/max-custom-props.ts
var DEFAULT_THRESHOLD2 = 8;
var DEFAULT_IGNORED_PROPS = /* @__PURE__ */ new Set(["children"]);
function isComponentPropsContractName7(name) {
  return name.endsWith("Props");
}
function getCustomPropCount(members, ignoredProps) {
  let count = 0;
  for (const member of members) {
    const maybeMember = member;
    if (maybeMember.type !== "TSPropertySignature" && maybeMember.type !== "TSMethodSignature") {
      continue;
    }
    const key = maybeMember.key;
    if (!key) continue;
    let propName = null;
    if (key.type === "Identifier" && key.name) propName = key.name;
    if (key.type === "Literal" && typeof key.value === "string") propName = key.value;
    if (!propName) continue;
    if (ignoredProps.has(propName)) continue;
    count += 1;
  }
  return count;
}
var rule20 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Limit the number of custom props in component prop contracts to encourage composition",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/max-custom-props.md"
    },
    messages: {
      maxCustomProps: "Prop contract '{{name}}' declares {{count}} props (max {{threshold}}). Prefer splitting into compound parts."
    },
    schema: [
      {
        type: "object",
        properties: {
          threshold: {
            type: "integer",
            minimum: 1
          },
          ignore: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = context.options[0] ?? {};
    const threshold = options.threshold ?? DEFAULT_THRESHOLD2;
    const ignoredProps = /* @__PURE__ */ new Set([...DEFAULT_IGNORED_PROPS, ...options.ignore ?? []]);
    function checkContract(contractName, members, node) {
      if (!contractName || !isComponentPropsContractName7(contractName)) return;
      const customPropCount = getCustomPropCount(members ?? [], ignoredProps);
      if (customPropCount <= threshold) return;
      context.report({
        node,
        messageId: "maxCustomProps",
        data: {
          name: contractName,
          count: String(customPropCount),
          threshold: String(threshold)
        }
      });
    }
    return {
      TSInterfaceDeclaration(node) {
        const declaration = node;
        if (declaration.body?.type !== "TSInterfaceBody") return;
        checkContract(declaration.id?.name, declaration.body.body, node);
      },
      TSTypeAliasDeclaration(node) {
        const declaration = node;
        if (declaration.typeAnnotation?.type !== "TSTypeLiteral") return;
        checkContract(declaration.id?.name, declaration.typeAnnotation.members, node);
      }
    };
  }
};
var max_custom_props_default = rule20;

// src/rules/jsx-bem-compound-naming.ts
var import_node_path = __toESM(require("path"), 1);
function isPascalCase2(name) {
  if (name.length === 0) return false;
  const first = name[0];
  return first >= "A" && first <= "Z";
}
function isFunctionLikeComponentInit(node) {
  if (!node) return false;
  const typed = node;
  return typed.type === "ArrowFunctionExpression" || typed.type === "FunctionExpression";
}
function normalizeForComparison(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function buildExampleName(block, localName) {
  if (localName.startsWith(block)) return localName;
  let overlapLength = 0;
  for (let index = 1; index < block.length; index += 1) {
    const suffix = block.slice(index);
    if (localName.startsWith(suffix)) {
      overlapLength = suffix.length;
      break;
    }
  }
  if (overlapLength === 0) return `${block}${localName}`;
  return `${block}${localName.slice(overlapLength)}`;
}
function getFileStem(filename) {
  if (!filename || filename === "<input>") return null;
  const base = import_node_path.default.basename(filename);
  const ext = import_node_path.default.extname(base);
  if (!ext) return base;
  return base.slice(0, -ext.length);
}
function getExportedIdentifierName(node) {
  if (!node) return null;
  const typedNode = node;
  if (typedNode.type === "Identifier" && typedNode.name) return typedNode.name;
  if (typedNode.type === "Literal" && typeof typedNode.value === "string") return typedNode.value;
  return null;
}
var rule21 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce compound component export naming by matching exported component names to the file stem block prefix",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/jsx-bem-compound-naming.md"
    },
    messages: {
      exportedPartMustUseBlockPrefix: "Exported component '{{name}}' should be prefixed with compound block '{{block}}' (e.g. '{{example}}')."
    },
    schema: []
  },
  create(context) {
    const localComponents = /* @__PURE__ */ new Map();
    let exportedComponents = [];
    function registerLocalComponent(name, node) {
      if (!isPascalCase2(name)) return;
      localComponents.set(name, node);
    }
    function recordExport(localName, exportedName, node) {
      if (!localComponents.has(localName)) return;
      if (!isPascalCase2(exportedName)) return;
      exportedComponents = [...exportedComponents, { localName, exportedName, node }];
    }
    function recordFunctionDeclarationExport(node) {
      if (node.type !== "FunctionDeclaration") return false;
      const fn = node;
      const idName = getExportedIdentifierName(fn.id);
      if (!idName || !fn.id) return true;
      registerLocalComponent(idName, fn.id);
      recordExport(idName, idName, fn.id);
      return true;
    }
    function recordVariableDeclarationExport(node) {
      if (node.type !== "VariableDeclaration") return false;
      const variableDeclaration = node;
      for (const entry of variableDeclaration.declarations ?? []) {
        if (!isFunctionLikeComponentInit(entry.init)) continue;
        const idName = getExportedIdentifierName(entry.id);
        if (!idName || !entry.id) continue;
        registerLocalComponent(idName, entry.id);
        recordExport(idName, idName, entry.id);
      }
      return true;
    }
    function recordExportSpecifiers(specifiers) {
      for (const specifier of specifiers ?? []) {
        if (specifier.type !== "ExportSpecifier") continue;
        const exportSpecifier = specifier;
        const localName = getExportedIdentifierName(exportSpecifier.local);
        const exportedName = getExportedIdentifierName(exportSpecifier.exported);
        if (!localName || !exportedName) continue;
        if (!exportSpecifier.exported) continue;
        recordExport(localName, exportedName, exportSpecifier.exported);
      }
    }
    return {
      FunctionDeclaration(node) {
        const fn = node;
        const idName = getExportedIdentifierName(fn.id);
        if (!idName) return;
        registerLocalComponent(idName, fn.id);
      },
      VariableDeclarator(node) {
        const declaration = node;
        if (!isFunctionLikeComponentInit(declaration.init)) return;
        const idName = getExportedIdentifierName(declaration.id);
        if (!idName || !declaration.id) return;
        registerLocalComponent(idName, declaration.id);
      },
      ExportNamedDeclaration(node) {
        const declaration = node;
        if (declaration.source) return;
        const declarationNode = declaration.declaration;
        if (declarationNode && recordFunctionDeclarationExport(declarationNode)) return;
        if (declarationNode && recordVariableDeclarationExport(declarationNode)) return;
        recordExportSpecifiers(declaration.specifiers);
      },
      ExportDefaultDeclaration(node) {
        const declaration = node;
        const declared = declaration.declaration;
        if (!declared) return;
        if (declared.type === "FunctionDeclaration") {
          const fn = declared;
          const idName = getExportedIdentifierName(fn.id);
          if (!idName || !fn.id) return;
          registerLocalComponent(idName, fn.id);
          recordExport(idName, idName, fn.id);
          return;
        }
        if (declared.type === "Identifier") {
          const idName = getExportedIdentifierName(declared);
          if (!idName) return;
          recordExport(idName, idName, declared);
        }
      },
      "Program:exit"() {
        if (exportedComponents.length < 2) return;
        const stem = getFileStem(context.filename);
        if (!stem) return;
        if (stem.toLowerCase() === "index") return;
        const normalizedStem = normalizeForComparison(stem);
        const blockCandidates = exportedComponents.map((entry) => entry.localName).filter((name) => normalizeForComparison(name) === normalizedStem);
        if (blockCandidates.length === 0) return;
        for (const exported of exportedComponents) {
          const isBlockExport = blockCandidates.includes(exported.localName);
          if (isBlockExport) continue;
          const usesAnyBlockPrefix = blockCandidates.some(
            (block) => exported.localName.startsWith(block)
          );
          if (usesAnyBlockPrefix) continue;
          const preferredBlock = blockCandidates[0] ?? "Block";
          context.report({
            node: exported.node,
            messageId: "exportedPartMustUseBlockPrefix",
            data: {
              name: exported.localName,
              block: preferredBlock,
              example: buildExampleName(preferredBlock, exported.localName)
            }
          });
        }
      }
    };
  }
};
var jsx_bem_compound_naming_default = rule21;

// src/rules/no-prop-drilling.ts
var DEFAULT_ALLOWED_DEPTH = 1;
var DEFAULT_IGNORE_PROPS_SPREAD = true;
function isPascalCase4(name) {
  if (name.length === 0) return false;
  const first = name[0];
  return first >= "A" && first <= "Z";
}
function walkAst(node, parent, seen, visitor) {
  if (!node || typeof node !== "object") return;
  if (seen.has(node)) return;
  seen.add(node);
  visitor(node, parent);
  const record = node;
  for (const [key, value] of Object.entries(record)) {
    if (key === "parent") continue;
    if (!value) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry && typeof entry === "object" && "type" in entry) {
          walkAst(entry, node, seen, visitor);
        }
      }
      continue;
    }
    if (typeof value === "object" && "type" in value) {
      walkAst(value, node, seen, visitor);
    }
  }
}
function getIdentifierFromPattern(pattern) {
  if (!pattern) return null;
  if (pattern.type === "Identifier") return pattern;
  if (pattern.type === "AssignmentPattern") {
    const assignmentPattern = pattern;
    if (assignmentPattern.left?.type === "Identifier") return assignmentPattern.left;
  }
  return null;
}
function getCustomJsxName(node) {
  if (!node) return null;
  const typedNode = node;
  if (typedNode.type === "JSXIdentifier" && typedNode.name) {
    return isPascalCase4(typedNode.name) ? typedNode.name : null;
  }
  if (typedNode.type === "JSXMemberExpression" && typedNode.object) {
    const member = typedNode;
    const objectNode = member.object;
    if (objectNode.type === "JSXIdentifier" && objectNode.name) {
      return isPascalCase4(objectNode.name) ? objectNode.name : null;
    }
  }
  return null;
}
function getStaticPropKey(property) {
  if (property.type !== "Property") return null;
  const prop = property;
  if (!prop.key || prop.computed) return null;
  if (prop.key.type === "Identifier") {
    return prop.key.name;
  }
  if (prop.key.type === "Literal") {
    const literal = prop.key;
    return typeof literal.value === "string" ? literal.value : null;
  }
  return null;
}
function getPropBindings(param, ignorePropsSpread) {
  if (!param || param.type !== "ObjectPattern") return [];
  const objectPattern = param;
  const bindings = [];
  for (const property of objectPattern.properties ?? []) {
    if (property.type === "RestElement") {
      if (ignorePropsSpread) continue;
      const rest = property;
      if (rest.argument?.type !== "Identifier") continue;
      const identifier2 = rest.argument;
      bindings.push({
        propName: `...${identifier2.name}`,
        localName: identifier2.name,
        node: rest.argument
      });
      continue;
    }
    if (property.type !== "Property") continue;
    const prop = property;
    if (!prop.value) continue;
    const identifier = getIdentifierFromPattern(prop.value);
    if (!identifier) continue;
    const localName = identifier.name;
    const propName = getStaticPropKey(property) ?? localName;
    bindings.push({
      propName,
      localName,
      node: identifier
    });
  }
  return bindings;
}
function isDefinitionLikeIdentifier(node, parent, name) {
  if (!parent) return false;
  if (parent.type === "Property") {
    const property = parent;
    if (property.key === node && !property.computed) return true;
    if (property.value === node && property.value?.type === "Identifier") {
      const value = property.value;
      if (value.name === name && property.key === node) return true;
    }
  }
  if (parent.type === "VariableDeclarator") {
    const declarator = parent;
    if (declarator.id === node) return true;
  }
  if (parent.type === "FunctionDeclaration" || parent.type === "FunctionExpression") {
    const fn = parent;
    if (fn.id === node) return true;
    if ((fn.params ?? []).includes(node)) return true;
  }
  if (parent.type === "ArrowFunctionExpression") {
    const arrow = parent;
    if ((arrow.params ?? []).includes(node)) return true;
  }
  if (parent.type === "RestElement") {
    const restElement = parent;
    if (restElement.argument === node) return true;
  }
  if (parent.type === "AssignmentPattern") {
    const assignmentPattern = parent;
    if (assignmentPattern.left === node) return true;
  }
  return false;
}
function isDirectJsxAttributeForward(node, parent, parentMap) {
  if (!parent) return false;
  const typedParent = parent;
  if (typedParent.type !== "JSXExpressionContainer") return false;
  const container = parent;
  if (container.expression !== node) return false;
  const ref = parentMap.get(parent);
  if (!ref?.parent) return false;
  const typedGrandParent = ref.parent;
  return typedGrandParent.type === "JSXAttribute";
}
function getForwardedTargetProp(node, parent, parentMap) {
  if (!isDirectJsxAttributeForward(node, parent, parentMap)) return null;
  const ref = parent ? parentMap.get(parent) : null;
  const grandParent = ref?.parent;
  if (!grandParent || grandParent.type !== "JSXAttribute") return null;
  if (grandParent.name?.type !== "JSXIdentifier") return null;
  return grandParent.name.name ?? null;
}
function getDirectJsxSpreadInfo(node, parent, parentMap) {
  if (!parent) return null;
  const typedParent = parent;
  if (typedParent.type !== "JSXSpreadAttribute") return null;
  const spread = parent;
  if (spread.argument !== node) return null;
  const openingRef = parentMap.get(parent);
  const openingElement = openingRef?.parent;
  if (!openingElement || openingElement.type !== "JSXOpeningElement") return null;
  return {
    forwardedTo: "props spread",
    forwardedComponent: getCustomJsxName(openingElement.name)
  };
}
function getDirectJsxAttributeInfo(node, parent, parentMap) {
  const forwardedTarget = getForwardedTargetProp(node, parent, parentMap);
  if (!forwardedTarget) return null;
  if (!parent) return null;
  const attributeRef = parentMap.get(parent);
  const attribute = attributeRef?.parent;
  if (!attribute || attribute.type !== "JSXAttribute") return null;
  const openingRef = parentMap.get(attribute);
  const openingElement = openingRef?.parent;
  return {
    forwardedTo: forwardedTarget,
    forwardedComponent: openingElement && openingElement.type === "JSXOpeningElement" ? getCustomJsxName(openingElement.name) : null
  };
}
function getDirectForwardedUsageInfo(node, parent, parentMap) {
  return getDirectJsxAttributeInfo(node, parent, parentMap) ?? getDirectJsxSpreadInfo(node, parent, parentMap);
}
function analyzeComponent(functionNode, name, params, body, ignorePropsSpread) {
  if (!name || !isPascalCase4(name)) return null;
  const firstParam = (params ?? [])[0];
  const bindings = getPropBindings(firstParam, ignorePropsSpread);
  if (bindings.length === 0) return null;
  const bindingMap = /* @__PURE__ */ new Map();
  for (const binding of bindings) {
    if (binding.propName === "children") continue;
    bindingMap.set(binding.localName, binding);
  }
  if (bindingMap.size === 0) return null;
  const usageMap = /* @__PURE__ */ new Map();
  for (const localName of bindingMap.keys()) {
    usageMap.set(localName, {
      seen: false,
      owned: false,
      forwardedTo: /* @__PURE__ */ new Set(),
      forwardedComponents: /* @__PURE__ */ new Set()
    });
  }
  const parentMap = /* @__PURE__ */ new WeakMap();
  const seenForUsage = /* @__PURE__ */ new WeakSet();
  walkAst(body, functionNode, seenForUsage, (node, parent) => {
    parentMap.set(node, { parent });
    if (node.type !== "Identifier") return;
    const identifier = node;
    const usage = usageMap.get(identifier.name);
    if (!usage) return;
    if (isDefinitionLikeIdentifier(node, parent, identifier.name)) return;
    usage.seen = true;
    const forwardedUsageInfo = getDirectForwardedUsageInfo(node, parent, parentMap);
    if (!forwardedUsageInfo) {
      usage.owned = true;
      return;
    }
    usage.forwardedTo.add(forwardedUsageInfo.forwardedTo);
    if (forwardedUsageInfo.forwardedComponent) {
      usage.forwardedComponents.add(forwardedUsageInfo.forwardedComponent);
    }
  });
  const violations = [];
  const passThroughChildren = /* @__PURE__ */ new Set();
  for (const [localName, usage] of usageMap.entries()) {
    if (!usage.seen || usage.owned) continue;
    const binding = bindingMap.get(localName);
    if (!binding) continue;
    violations.push({
      binding,
      forwardedTo: usage.forwardedTo
    });
    for (const childName of usage.forwardedComponents) {
      passThroughChildren.add(childName);
    }
  }
  if (violations.length === 0) return null;
  return {
    name,
    node: functionNode,
    passThroughChildren,
    violations
  };
}
function computePassThroughDepth(componentName, components, memo, visiting) {
  const cached = memo.get(componentName);
  if (cached != null) return cached;
  if (visiting.has(componentName)) return 1;
  visiting.add(componentName);
  const component = components.get(componentName);
  if (!component) {
    memo.set(componentName, 1);
    visiting.delete(componentName);
    return 1;
  }
  let childMaxDepth = 0;
  for (const childName of component.passThroughChildren) {
    if (!components.has(childName)) continue;
    const childDepth = computePassThroughDepth(childName, components, memo, visiting);
    if (childDepth > childMaxDepth) childMaxDepth = childDepth;
  }
  const depth = 1 + childMaxDepth;
  memo.set(componentName, depth);
  visiting.delete(componentName);
  return depth;
}
var rule23 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow prop drilling in component owners",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-prop-drilling.md"
    },
    messages: {
      noPropDrilling: "Prop '{{prop}}' in '{{component}}' has a prop drilling depth of {{depth}} (allowed {{allowedDepth}}). Use compound composition."
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedDepth: {
            type: "integer",
            minimum: 1
          },
          ignorePropsSpread: {
            type: "boolean"
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const rawOptions = context.options[0] ?? {};
    const allowedDepthRaw = rawOptions.allowedDepth;
    const allowedDepth = Number.isInteger(allowedDepthRaw) && (allowedDepthRaw ?? 0) >= 1 ? allowedDepthRaw : DEFAULT_ALLOWED_DEPTH;
    const ignorePropsSpread = typeof rawOptions.ignorePropsSpread === "boolean" ? rawOptions.ignorePropsSpread : DEFAULT_IGNORE_PROPS_SPREAD;
    const components = /* @__PURE__ */ new Map();
    return {
      FunctionDeclaration(node) {
        const fn = node;
        const component = analyzeComponent(
          node,
          fn.id?.name,
          fn.params,
          fn.body,
          ignorePropsSpread
        );
        if (!component) return;
        components.set(component.name, component);
      },
      VariableDeclarator(node) {
        const declaration = node;
        if (declaration.id?.type !== "Identifier") return;
        const id = declaration.id;
        const init = declaration.init;
        if (!init) return;
        if (init.type !== "ArrowFunctionExpression" && init.type !== "FunctionExpression") return;
        const component = init;
        const record = analyzeComponent(
          init,
          id.name,
          component.params,
          component.body,
          ignorePropsSpread
        );
        if (!record) return;
        components.set(record.name, record);
      },
      "Program:exit"() {
        const memo = /* @__PURE__ */ new Map();
        const flaggedComponents = [];
        for (const component of components.values()) {
          const depth = computePassThroughDepth(
            component.name,
            components,
            memo,
            /* @__PURE__ */ new Set()
          );
          if (depth <= allowedDepth) {
            continue;
          }
          flaggedComponents.push({ component, depth });
        }
        flaggedComponents.sort((left, right) => {
          if (right.depth !== left.depth) {
            return right.depth - left.depth;
          }
          return left.component.name.localeCompare(right.component.name);
        });
        const flaggedNames = new Set(flaggedComponents.map((entry) => entry.component.name));
        for (const flaggedComponent of flaggedComponents) {
          const component = flaggedComponent.component;
          const depth = flaggedComponent.depth;
          const hasFlaggedParent = flaggedComponents.some((candidate) => {
            if (candidate.component.name === component.name) {
              return false;
            }
            if (!flaggedNames.has(candidate.component.name)) {
              return false;
            }
            return candidate.component.passThroughChildren.has(component.name);
          });
          if (hasFlaggedParent) {
            continue;
          }
          for (const violation of component.violations) {
            context.report({
              node: violation.binding.node,
              messageId: "noPropDrilling",
              data: {
                prop: violation.binding.propName,
                component: component.name,
                forwardedTo: violation.forwardedTo.size > 0 ? Array.from(violation.forwardedTo).sort().join(", ") : "child prop",
                depth: String(depth),
                allowedDepth: String(allowedDepth)
              }
            });
          }
        }
      }
    };
  }
};
var no_prop_drilling_default = rule23;

// src/rules/jsx-flat-owner-tree.ts
var DEFAULT_ALLOWED_CHAIN_DEPTH = 2;
function isPascalCase5(name) {
  if (name.length === 0) return false;
  const first = name[0];
  return first >= "A" && first <= "Z";
}
function getCustomJsxName2(node) {
  if (!node) return null;
  const typedNode = node;
  if (typedNode.type === "JSXIdentifier" && typedNode.name) {
    const name = typedNode.name;
    return isPascalCase5(name) ? name : null;
  }
  if (typedNode.type === "JSXMemberExpression" && typedNode.object) {
    const member = typedNode;
    const typedObject = member.object;
    if (typedObject.type === "JSXIdentifier" && typedObject.name) {
      const object = typedObject;
      return isPascalCase5(object.name) ? object.name : null;
    }
  }
  return null;
}
function collectSelfClosingCustomJsxNames(node, names) {
  if (!node) return;
  const typedNode = node;
  if (typedNode.type === "JSXElement") {
    const element = node;
    if (element.openingElement.selfClosing) {
      const customName = getCustomJsxName2(element.openingElement.name);
      if (customName) names.add(customName);
    }
    for (const child of element.children ?? []) {
      const typedChild = child;
      if (typedChild.type !== "JSXElement" && typedChild.type !== "JSXFragment") continue;
      collectSelfClosingCustomJsxNames(child, names);
    }
    return;
  }
  if (typedNode.type === "JSXFragment") {
    const fragment = node;
    for (const child of fragment.children ?? []) {
      const typedChild = child;
      if (typedChild.type !== "JSXElement" && typedChild.type !== "JSXFragment") continue;
      collectSelfClosingCustomJsxNames(child, names);
    }
  }
}
function getSelfClosingCustomChildren(body) {
  const names = /* @__PURE__ */ new Set();
  if (!body) return names;
  const typedBody = body;
  if (typedBody.type === "JSXElement" || typedBody.type === "JSXFragment") {
    collectSelfClosingCustomJsxNames(body, names);
  } else if (typedBody.type === "BlockStatement") {
    const block = body;
    for (const statement of block.body ?? []) {
      if (statement.type !== "ReturnStatement") continue;
      const returnStatement = statement;
      const argument = returnStatement.argument;
      if (!argument) continue;
      const typedArgument = argument;
      if (typedArgument.type !== "JSXElement" && typedArgument.type !== "JSXFragment") continue;
      collectSelfClosingCustomJsxNames(argument, names);
    }
  }
  return names;
}
function computeLongestChain(componentName, components, memo, visiting) {
  const cached = memo.get(componentName);
  if (cached != null) return cached;
  if (visiting.has(componentName)) {
    return [componentName];
  }
  visiting.add(componentName);
  const component = components.get(componentName);
  if (!component) {
    memo.set(componentName, [componentName]);
    visiting.delete(componentName);
    return [componentName];
  }
  if (component.selfClosingCustomChildren.size === 0) {
    const base = [componentName];
    memo.set(componentName, base);
    visiting.delete(componentName);
    return base;
  }
  let bestChildChain = [];
  for (const childName of component.selfClosingCustomChildren) {
    if (!components.has(childName)) continue;
    const childChain = computeLongestChain(childName, components, memo, visiting);
    if (childChain.length > bestChildChain.length) bestChildChain = childChain;
  }
  const fullChain = [componentName, ...bestChildChain];
  memo.set(componentName, fullChain);
  visiting.delete(componentName);
  return fullChain;
}
var rule24 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Encourage flatter parent component chains by reporting self-closing custom component handoffs deeper than allowedChainDepth",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/jsx-flat-owner-tree.md"
    },
    messages: {
      deepParentTree: "Component '{{component}}' is in a {{depth}}-deep self-closing handoff chain (allowed {{allowedDepth}}): {{chain}}. Flatten at '{{nextHandoff}}'."
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedChainDepth: {
            type: "integer",
            minimum: 1
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const rawOptions = context.options[0] ?? {};
    const allowedChainDepthRaw = rawOptions.allowedChainDepth;
    const allowedChainDepth = Number.isInteger(allowedChainDepthRaw) && (allowedChainDepthRaw ?? 0) >= 1 ? allowedChainDepthRaw : DEFAULT_ALLOWED_CHAIN_DEPTH;
    const minReportedChainDepth = allowedChainDepth + 1;
    const components = /* @__PURE__ */ new Map();
    function registerComponent(name, body, node) {
      if (!name || !isPascalCase5(name)) return;
      components.set(name, {
        name,
        node,
        selfClosingCustomChildren: getSelfClosingCustomChildren(body)
      });
    }
    return {
      FunctionDeclaration(node) {
        const fn = node;
        registerComponent(fn.id?.name, fn.body, node);
      },
      VariableDeclarator(node) {
        const declaration = node;
        if (declaration.id?.type !== "Identifier") return;
        if (!declaration.init) return;
        if (declaration.init.type !== "ArrowFunctionExpression" && declaration.init.type !== "FunctionExpression") {
          return;
        }
        const id = declaration.id;
        const init = declaration.init;
        registerComponent(id.name, init.body, declaration.id);
      },
      "Program:exit"() {
        const memo = /* @__PURE__ */ new Map();
        for (const component of components.values()) {
          const chain = computeLongestChain(component.name, components, memo, /* @__PURE__ */ new Set());
          const depth = chain.length;
          if (depth < minReportedChainDepth) continue;
          context.report({
            node: component.node,
            messageId: "deepParentTree",
            data: {
              component: component.name,
              depth: String(depth),
              allowedDepth: String(allowedChainDepth),
              chain: chain.join(" -> "),
              nextHandoff: chain[1] ?? component.name
            }
          });
        }
      }
    };
  }
};
var jsx_flat_owner_tree_default = rule24;

// src/rules/complexity.ts
var THRESHOLD_DEFAULT = 20;
function isPascalCaseFunctionName(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}
function upperCaseFirst(value) {
  if (value.length === 0) return value;
  return value[0].toUpperCase() + value.slice(1);
}
function isLogicalAssignmentOperator(operator) {
  return operator === "&&=" || operator === "||=" || operator === "??=";
}
function asString(value) {
  return typeof value === "string" ? value : null;
}
function getMethodName(parent) {
  const key = parent.key;
  if (!key) return null;
  if (key.type === "Identifier") return asString(key.name);
  if (key.type === "Literal") return asString(key.value);
  return null;
}
function getVariableFunctionName(parent) {
  if (parent.type !== "VariableDeclarator") return null;
  if (parent.id?.type !== "Identifier") return null;
  return parent.id.name ?? null;
}
function getParentFunctionName(parent) {
  const variableName = getVariableFunctionName(parent);
  if (variableName) return `function '${variableName}'`;
  if (parent.type !== "MethodDefinition") {
    return "function";
  }
  const methodName = getMethodName(parent);
  if (methodName) return `method '${methodName}'`;
  return "function";
}
function getFunctionNameWithKind(node) {
  const declarationName = getNamedFunctionDeclaration(node);
  if (declarationName) return `function '${declarationName}'`;
  const parent = node.parent;
  if (!parent) {
    return "function";
  }
  return getParentFunctionName(parent);
}
function getFunctionLoc(node) {
  const typedNode = node;
  return typedNode.loc;
}
function getNamedFunctionDeclaration(node) {
  const fn = node;
  if (fn.id?.type !== "Identifier") return null;
  return fn.id.name ?? null;
}
function getVariableDeclaratorName(node) {
  const fn = node;
  const parent = fn.parent;
  if (!parent || parent.type !== "VariableDeclarator") return null;
  const id = parent.id;
  if (!id || id.type !== "Identifier") return null;
  return asString(id.name);
}
function getPascalCaseFunctionName(node) {
  const declarationName = getNamedFunctionDeclaration(node);
  if (declarationName && isPascalCaseFunctionName(declarationName)) return declarationName;
  const variableName = getVariableDeclaratorName(node);
  if (variableName && isPascalCaseFunctionName(variableName)) return variableName;
  return null;
}
function parseOptions(option) {
  if (typeof option === "number") {
    return { threshold: option, isModifiedComplexity: false };
  }
  if (!option) {
    return { threshold: THRESHOLD_DEFAULT, isModifiedComplexity: false };
  }
  const threshold = option.maximum ?? option.max ?? THRESHOLD_DEFAULT;
  return { threshold, isModifiedComplexity: option.variant === "modified" };
}
function shouldTrackOrigin(origin) {
  return origin === "function" || origin === "class-field-initializer" || origin === "class-static-block";
}
function getReportName(origin, node) {
  if (origin === "class-field-initializer") return "class field initializer";
  if (origin === "class-static-block") return "class static block";
  return getFunctionNameWithKind(node);
}
function createComplexityDescriptor(details) {
  const reportDescriptor = {
    node: details.node,
    messageId: "complex",
    data: {
      name: upperCaseFirst(details.name),
      complexity: details.complexity,
      max: details.max
    }
  };
  return details.loc ? { ...reportDescriptor, loc: details.loc } : reportDescriptor;
}
var rule25 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce a maximum cyclomatic complexity allowed in a program",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/complexity.md"
    },
    schema: [
      {
        oneOf: [
          {
            type: "integer",
            minimum: 0
          },
          {
            type: "object",
            properties: {
              maximum: {
                type: "integer",
                minimum: 0
              },
              max: {
                type: "integer",
                minimum: 0
              },
              variant: {
                enum: ["classic", "modified"]
              }
            },
            additionalProperties: false
          }
        ]
      }
    ],
    messages: {
      complex: "{{name}} has a complexity of {{complexity}}. Maximum allowed is {{max}}."
    }
  },
  create(context) {
    const report = context.report.bind(context);
    const option = context.options[0];
    const parsedOptions = parseOptions(option);
    let complexities = [];
    function increaseComplexity() {
      const current = complexities.at(-1) ?? 1;
      complexities = [...complexities.slice(0, -1), current + 1];
    }
    function pushComplexity() {
      complexities = [...complexities, 1];
    }
    function popComplexity() {
      const current = complexities.at(-1) ?? 1;
      complexities = complexities.slice(0, -1);
      return current;
    }
    function isOptionalNode(node) {
      return node.optional === true;
    }
    return {
      onCodePathStart: pushComplexity,
      CatchClause: increaseComplexity,
      ConditionalExpression: increaseComplexity,
      LogicalExpression: increaseComplexity,
      ForStatement: increaseComplexity,
      ForInStatement: increaseComplexity,
      ForOfStatement: increaseComplexity,
      IfStatement: increaseComplexity,
      WhileStatement: increaseComplexity,
      DoWhileStatement: increaseComplexity,
      AssignmentPattern: increaseComplexity,
      "SwitchCase[test]"() {
        if (!parsedOptions.isModifiedComplexity) increaseComplexity();
      },
      SwitchStatement() {
        if (parsedOptions.isModifiedComplexity) increaseComplexity();
      },
      AssignmentExpression(node) {
        const assignment = node;
        if (assignment.operator && isLogicalAssignmentOperator(assignment.operator)) {
          increaseComplexity();
        }
      },
      MemberExpression(node) {
        if (isOptionalNode(node)) increaseComplexity();
      },
      CallExpression(node) {
        if (isOptionalNode(node)) increaseComplexity();
      },
      onCodePathEnd(codePath, node) {
        const complexity = popComplexity();
        const origin = codePath.origin;
        if (!shouldTrackOrigin(origin)) return;
        if (origin === "function" && getPascalCaseFunctionName(node)) return;
        if (complexity <= parsedOptions.threshold) return;
        const name = getReportName(origin, node);
        const loc = getFunctionLoc(node);
        const descriptor = createComplexityDescriptor({
          node,
          loc,
          name,
          complexity,
          max: parsedOptions.threshold
        });
        report(descriptor);
      }
    };
  }
};
var complexity_default = rule25;

// src/rules/no-return-object-repetition.ts
var DEFAULT_MIN_SHARED_KEYS = 3;
var DEFAULT_MIN_OVERLAP_RATIO = 0.7;
function parseOptions3(option) {
  const minSharedKeys = typeof option?.minSharedKeys === "number" ? option.minSharedKeys : DEFAULT_MIN_SHARED_KEYS;
  const minOverlapRatio = typeof option?.minOverlapRatio === "number" ? option.minOverlapRatio : DEFAULT_MIN_OVERLAP_RATIO;
  return {
    minSharedKeys: Math.max(1, Math.floor(minSharedKeys)),
    minOverlapRatio: Math.max(0, Math.min(1, minOverlapRatio))
  };
}
function getNodeKey2(node) {
  const typedNode = node;
  if (typedNode.range) {
    return `${typedNode.range[0]}:${typedNode.range[1]}`;
  }
  const line = typedNode.loc?.start.line ?? -1;
  const column = typedNode.loc?.start.column ?? -1;
  return `${line}:${column}`;
}
function getPropertyKeyName(propertyKey) {
  if (!propertyKey) return null;
  if (propertyKey.type === "Identifier") {
    const identifierKey = propertyKey;
    return identifierKey.name ?? null;
  }
  if (propertyKey.type === "Literal") {
    const literalKey = propertyKey;
    if (typeof literalKey.value === "string" || typeof literalKey.value === "number") {
      return String(literalKey.value);
    }
  }
  return null;
}
function collectObjectKeys(objectExpression, keySet, parentPath = null) {
  if (objectExpression.type !== "ObjectExpression") return;
  const objectNode = objectExpression;
  const properties = objectNode.properties ?? [];
  for (const property of properties) {
    if (property.type !== "Property") continue;
    const objectProperty = property;
    if (objectProperty.computed) continue;
    const keyName = getPropertyKeyName(objectProperty.key);
    if (!keyName) continue;
    const keyPath = parentPath ? `${parentPath}.${keyName}` : keyName;
    keySet.add(keyPath);
    if (objectProperty.value?.type === "ObjectExpression") {
      collectObjectKeys(objectProperty.value, keySet, keyPath);
    }
  }
}
function getObjectKeys(objectExpression) {
  const keySet = /* @__PURE__ */ new Set();
  collectObjectKeys(objectExpression, keySet);
  return keySet;
}
function countSharedKeys(left, right) {
  let count = 0;
  for (const key of left) {
    if (right.has(key)) {
      count += 1;
    }
  }
  return count;
}
function calculateOverlapRatio(left, right, sharedCount) {
  const smallest = Math.min(left.size, right.size);
  if (smallest === 0) return 0;
  return sharedCount / smallest;
}
function shouldReportPair(left, right, options) {
  if (left.keySet.size === 0 || right.keySet.size === 0) return null;
  const sharedKeys = countSharedKeys(left.keySet, right.keySet);
  if (sharedKeys === 0) return null;
  const overlapRatio = calculateOverlapRatio(left.keySet, right.keySet, sharedKeys);
  if (sharedKeys >= options.minSharedKeys && overlapRatio >= options.minOverlapRatio) {
    return { sharedKeys, overlapRatio };
  }
  return null;
}
var rule27 = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer constructing shared defaults once when multiple object return statements mostly repeat keys.",
      url: "https://github.com/jjenzz/sweepit/tree/main/skills/sweepi/rules/no-return-object-repetition.md"
    },
    schema: [
      {
        type: "object",
        properties: {
          minSharedKeys: {
            type: "integer",
            minimum: 1
          },
          minOverlapRatio: {
            type: "number",
            minimum: 0,
            maximum: 1
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      preferSharedDefaults: "Multiple object return statements repeat many keys ({{sharedKeys}} shared, {{overlapPercent}}% overlap)."
    }
  },
  create(context) {
    const options = parseOptions3(context.options[0]);
    const functionStack = [];
    const reportedNodeKeys = /* @__PURE__ */ new Set();
    function enterFunction() {
      functionStack.push({ returnObjects: [] });
    }
    function exitFunction() {
      const functionContext = functionStack.pop();
      if (!functionContext || functionContext.returnObjects.length < 2) return;
      const returnObjects = functionContext.returnObjects;
      for (let leftIndex = 0; leftIndex < returnObjects.length; leftIndex += 1) {
        const left = returnObjects[leftIndex];
        for (let rightIndex = leftIndex + 1; rightIndex < returnObjects.length; rightIndex += 1) {
          const right = returnObjects[rightIndex];
          const pair = shouldReportPair(left, right, options);
          if (!pair) continue;
          const overlapPercent = Math.round(pair.overlapRatio * 100);
          const leftNodeKey = getNodeKey2(left.node);
          if (!reportedNodeKeys.has(leftNodeKey)) {
            reportedNodeKeys.add(leftNodeKey);
            context.report({
              node: left.node,
              messageId: "preferSharedDefaults",
              data: {
                sharedKeys: String(pair.sharedKeys),
                overlapPercent: String(overlapPercent)
              }
            });
          }
          const rightNodeKey = getNodeKey2(right.node);
          if (!reportedNodeKeys.has(rightNodeKey)) {
            reportedNodeKeys.add(rightNodeKey);
            context.report({
              node: right.node,
              messageId: "preferSharedDefaults",
              data: {
                sharedKeys: String(pair.sharedKeys),
                overlapPercent: String(overlapPercent)
              }
            });
          }
        }
      }
    }
    return {
      FunctionDeclaration: enterFunction,
      "FunctionDeclaration:exit": exitFunction,
      FunctionExpression: enterFunction,
      "FunctionExpression:exit": exitFunction,
      ArrowFunctionExpression: enterFunction,
      "ArrowFunctionExpression:exit": exitFunction,
      ReturnStatement(node) {
        const currentFunction = functionStack.at(-1);
        if (!currentFunction) return;
        const returnStatement = node;
        if (!returnStatement.argument || returnStatement.argument.type !== "ObjectExpression") return;
        const keySet = getObjectKeys(returnStatement.argument);
        if (keySet.size === 0) return;
        currentFunction.returnObjects.push({ node, keySet });
      }
    };
  }
};
var no_return_object_repetition_default = rule27;

// src/index.ts
var pluginBase = {
  meta: {
    name: "eslint-plugin-sweepit",
    version: "0.0.0"
  },
  rules: {
    "no-title-case-props": no_title_case_props_default,
    "no-custom-kebab-case-props": no_custom_kebab_case_props_default,
    "no-set-prefix-utils": no_set_prefix_utils_default,
    "no-handle-prefix-utils": no_handle_prefix_utils_default,
    "no-hook-jsx": no_hook_jsx_default,
    "no-exported-context-hooks": no_exported_context_hooks_default,
    "no-handler-return-type": no_handler_return_type_default,
    "jsx-server-action-prop-suffix": jsx_server_action_prop_suffix_default,
    "no-render-helper-functions": no_render_helper_functions_default,
    "no-element-props": no_element_props_default,
    "no-componenttype-props": no_componenttype_props_default,
    "no-prefixed-prop-bundles": no_prefixed_prop_bundles_default,
    "no-optional-props-without-defaults": no_optional_props_without_defaults_default,
    "no-boolean-capability-props": no_boolean_capability_props_default,
    "max-custom-props": max_custom_props_default,
    "jsx-bem-compound-naming": jsx_bem_compound_naming_default,
    "no-prop-drilling": no_prop_drilling_default,
    "jsx-flat-owner-tree": jsx_flat_owner_tree_default,
    complexity: complexity_default,
    "no-return-object-repetition": no_return_object_repetition_default
  }
};
var plugin = pluginBase;
var index_default = plugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  plugin
});
