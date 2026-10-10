import { DEFAULT_ESLINT_REACT_SETTINGS } from "../../@eslint-react/shared/lib/index.js";
import * as ESLintUtils from "@typescript-eslint/utils/eslint-utils";
import { Check, Extract } from "../../@eslint-react/ast/lib/index.js";
import * as core from "../../@eslint-react/core/lib/index.js";
import { merge } from "../../@eslint-react/eslint/lib/index.js";
import { resolve } from "../../@eslint-react/var/lib/index.js";
import { AST_NODE_TYPES } from "@typescript-eslint/types";

//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (!no_symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};

//#endregion
//#region src/configs/disable-experimental.ts
var disable_experimental_exports = /* @__PURE__ */ __exportAll({
	name: () => name$5,
	rules: () => rules$4
});
const name$5 = "react-rsc/disable-experimental";
const rules$4 = { "react-rsc/function-definition": "off" };

//#endregion
//#region package.json
var name$4 = "eslint-plugin-react-rsc";
var version = "5.7.1";

//#endregion
//#region src/utils/create-rule.ts
function getDocsUrl(ruleName) {
	return `https://eslint-react.xyz/docs/rules/${ruleName}`;
}
const createRule = ESLintUtils.RuleCreator(getDocsUrl);

//#endregion
//#region src/rules/function-definition/function-definition.ts
const RULE_NAME = "function-definition";
var function_definition_default = createRule({
	meta: {
		type: "problem",
		docs: { description: "Validates and transforms React Client/Server Function definitions." },
		fixable: "code",
		messages: {
			file: "Functions exported from files with `use server` directive are React Server Functions and therefore must be async.",
			fileDirectivePosition: "The '{{name}}' directive must be at the very beginning of the file, before any imports or other code.",
			fileDirectiveQuote: "The '{{name}}' directive must be written with single or double quotes, not backticks.",
			local: "Functions with `use server` directive are React Server Functions and therefore must be async.",
			localDirectivePosition: "The '{{name}}' directive must be at the very beginning of the function body.",
			localDirectiveQuote: "The '{{name}}' directive must be written with single or double quotes, not backticks.",
			localDirectiveUnexpected: "The '{{name}}' directive can only be used at the top of a file, not inside a function body."
		},
		schema: []
	},
	name: RULE_NAME,
	create,
	defaultOptions: []
});
function create(context) {
	const hasUseServer = context.sourceCode.text.includes("use server");
	const hasUseClient = context.sourceCode.text.includes("use client");
	if (!hasUseServer && !hasUseClient) return {};
	const hasFileLevelUseServerDirective = context.sourceCode.ast.body.some(Check.isDirective("use server"));
	/**
	* Check if `node` is an async function, and report if not
	* @param node The function node to check
	* @returns Whether a report was made
	*/
	function getAsyncFix(node) {
		if (node.type === AST_NODE_TYPES.FunctionDeclaration || node.type === AST_NODE_TYPES.FunctionExpression) {
			const fnToken = context.sourceCode.getFirstToken(node);
			if (fnToken != null) return (fixer) => fixer.insertTextBefore(fnToken, "async ");
			return null;
		}
		if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) return (fixer) => fixer.insertTextBefore(node, "async ");
		return null;
	}
	function reportNonAsyncFunction(node, messageId) {
		if (node == null) return false;
		const unwrapped = Extract.unwrap(node);
		if (!Check.isFunction(unwrapped)) return false;
		if (!unwrapped.async) {
			context.report({
				fix: getAsyncFix(unwrapped),
				messageId,
				node: unwrapped
			});
			return true;
		}
		return false;
	}
	/**
	* Check non-exported local functions for 'use server' directives, and report if they are not async
	* @param node The function node to check
	*/
	function checkLocalServerFunction(node) {
		if (core.getFunctionDirectives(node).some((d) => d.directive === "use server")) reportNonAsyncFunction(node, "local");
	}
	/**
	* Find function declarations from exports and check them
	* @param id The identifier of the exported function
	*/
	function findAndCheckExportedFunctionDeclarations(id) {
		const initNode = resolve(context, id);
		if (initNode == null) return;
		const unwrapped = Extract.unwrap(initNode);
		if (!Check.isFunction(unwrapped)) return;
		reportNonAsyncFunction(unwrapped, "file");
	}
	/**
	* Check file-level directives for correct position and quote style.
	* Well-formed directives at the beginning of the file will have a `directive` property.
	* If they appear after other code, the parser will not set `directive`.
	*/
	function checkFileLevelDirectives() {
		for (const node of context.sourceCode.ast.body) {
			if (node.type !== AST_NODE_TYPES.ExpressionStatement) continue;
			if (Check.isLiteral("string")(node.expression)) {
				const value = node.expression.value;
				if ((value === "use server" || value === "use client") && node.directive == null) context.report({
					data: { name: value },
					messageId: "fileDirectivePosition",
					node
				});
				continue;
			}
			if (node.expression.type === AST_NODE_TYPES.TemplateLiteral && node.expression.quasis.length === 1 && node.expression.expressions.length === 0) {
				const value = node.expression.quasis[0]?.value.cooked;
				if (value === "use server" || value === "use client") context.report({
					data: { name: value },
					messageId: "fileDirectiveQuote",
					node
				});
			}
		}
	}
	/**
	* Check function-level directives for correct position and quote style.
	* @param node The function node to check
	*/
	function checkFunctionDirectives(node) {
		if (node.body.type !== AST_NODE_TYPES.BlockStatement) return;
		for (const stmt of node.body.body) {
			if (stmt.type !== AST_NODE_TYPES.ExpressionStatement) continue;
			if (Check.isLiteral("string")(stmt.expression)) {
				const value = stmt.expression.value;
				if (value === "use server" && stmt.directive == null) context.report({
					data: { name: value },
					messageId: "localDirectivePosition",
					node: stmt
				});
				if (value === "use client") context.report({
					data: { name: value },
					messageId: "localDirectiveUnexpected",
					node: stmt
				});
				continue;
			}
			if (stmt.expression.type === AST_NODE_TYPES.TemplateLiteral && stmt.expression.quasis.length === 1 && stmt.expression.expressions.length === 0) {
				const value = stmt.expression.quasis[0]?.value.cooked;
				if (value === "use server" || value === "use client") context.report({
					data: { name: value },
					messageId: "localDirectiveQuote",
					node: stmt
				});
			}
		}
	}
	return merge({
		ArrowFunctionExpression(node) {
			checkFunctionDirectives(node);
			checkLocalServerFunction(node);
		},
		ExportDefaultDeclaration(node) {
			if (!hasFileLevelUseServerDirective) return;
			const decl = node.declaration;
			if (reportNonAsyncFunction(decl, "file")) return;
			if (decl.type === AST_NODE_TYPES.Identifier) findAndCheckExportedFunctionDeclarations(decl);
		},
		ExportNamedDeclaration(node) {
			if (!hasFileLevelUseServerDirective) return;
			if (node.declaration != null) {
				const decl = node.declaration;
				if (reportNonAsyncFunction(decl, "file")) return;
				if (decl.type === AST_NODE_TYPES.VariableDeclaration) for (const declarator of decl.declarations) reportNonAsyncFunction(declarator.init, "file");
				return;
			}
			if (node.source == null && node.specifiers.length > 0) for (const spec of node.specifiers) findAndCheckExportedFunctionDeclarations(spec.local);
		},
		FunctionDeclaration(node) {
			checkFunctionDirectives(node);
			checkLocalServerFunction(node);
		},
		FunctionExpression(node) {
			checkFunctionDirectives(node);
			checkLocalServerFunction(node);
		},
		Program() {
			checkFileLevelDirectives();
		}
	});
}

//#endregion
//#region src/plugin.ts
const plugin = {
	meta: {
		name: name$4,
		version
	},
	rules: { "function-definition": function_definition_default }
};

//#endregion
//#region src/configs/recommended.ts
var recommended_exports = /* @__PURE__ */ __exportAll({
	name: () => name$3,
	plugins: () => plugins$3,
	rules: () => rules$3,
	settings: () => settings$3
});
const name$3 = "react-rsc/recommended";
const rules$3 = { "react-rsc/function-definition": "error" };
const plugins$3 = { "react-rsc": plugin };
const settings$3 = { "react-rsc": DEFAULT_ESLINT_REACT_SETTINGS };

//#endregion
//#region src/configs/recommended-typescript.ts
var recommended_typescript_exports = /* @__PURE__ */ __exportAll({
	name: () => name$2,
	plugins: () => plugins$2,
	rules: () => rules$2,
	settings: () => settings$2
});
const name$2 = "react-rsc/recommended-typescript";
const rules$2 = { ...rules$3 };
const plugins$2 = { ...plugins$3 };
const settings$2 = { ...settings$3 };

//#endregion
//#region src/configs/strict.ts
var strict_exports = /* @__PURE__ */ __exportAll({
	name: () => name$1,
	plugins: () => plugins$1,
	rules: () => rules$1,
	settings: () => settings$1
});
const name$1 = "react-rsc/strict";
const rules$1 = { ...rules$3 };
const plugins$1 = { ...plugins$3 };
const settings$1 = { ...settings$3 };

//#endregion
//#region src/configs/strict-typescript.ts
var strict_typescript_exports = /* @__PURE__ */ __exportAll({
	name: () => name,
	plugins: () => plugins,
	rules: () => rules,
	settings: () => settings
});
const name = "react-rsc/strict-typescript";
const rules = { ...rules$1 };
const plugins = { ...plugins$1 };
const settings = { ...settings$1 };

//#endregion
//#region src/index.ts
const finalPlugin = {
	...plugin,
	configs: {
		/**
		* Disable experimental rules that might be subject to change in the future
		*/
		["disable-experimental"]: disable_experimental_exports,
		/**
		* Enforce rules that are recommended by ESLint React for general purpose React + React DOM projects
		*/
		["recommended"]: recommended_exports,
		/**
		* Same as the `recommended` preset but disables rules that can be enforced by TypeScript
		*/
		["recommended-typescript"]: recommended_typescript_exports,
		/**
		* More strict version of the `recommended` preset
		*/
		["strict"]: strict_exports,
		/**
		* Same as the `strict` preset but disables rules that can be enforced by TypeScript
		*/
		["strict-typescript"]: strict_typescript_exports
	}
};

//#endregion
export { finalPlugin as default };