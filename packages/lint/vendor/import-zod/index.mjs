/*
 * eslint-plugin-import-zod@1.2.1
 * Source: https://github.com/samchungy/eslint-plugin-import-zod/tree/v1.2.1
 * SPDX-License-Identifier: MIT (declared in upstream package.json)
 * Upstream ships no separate copyright notice or LICENSE file.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import * as ESLintUtils from "../_deps/typescript-eslint-utils-eslint-utils.js";
import { TSESTree } from "@typescript-eslint/types";

//#region rolldown:runtime
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

//#endregion
//#region src/rules/prefer-zod-namespace.ts
var createRule, getImportSource, isAllSameSubmodule, prefer_zod_namespace_default;
var init_prefer_zod_namespace = __esm({ "src/rules/prefer-zod-namespace.ts"() {
	createRule = ESLintUtils.RuleCreator((name) => `https://github.com/samchungy/eslint-plugin-import-zod/blob/main/docs/rules/${name}.md`);
	getImportSource = (importedName, originalSource) => {
		return importedName === "core" && originalSource === "zod/v4" ? `${originalSource}/${importedName}` : originalSource;
	};
	isAllSameSubmodule = (specifiers, targetName) => {
		return specifiers.every((s) => s.imported.type === TSESTree.AST_NODE_TYPES.Identifier && s.imported.name === targetName);
	};
	prefer_zod_namespace_default = createRule({
		name: "prefer-zod-namespace",
		meta: {
			type: "suggestion",
			docs: { description: "Enforce using namespace imports for zod" },
			fixable: "code",
			schema: [],
			messages: { preferNamespaceImport: "Import zod as a namespace (import * as z from \"zod\") instead of destructuring its exports or using default imports" }
		},
		defaultOptions: [],
		create(context) {
			return { ImportDeclaration(node) {
				if (node.source.value !== "zod" && !node.source.value.startsWith("zod/")) return;
				const namedSpecifiers = node.specifiers.filter((specifier) => specifier.type === TSESTree.AST_NODE_TYPES.ImportSpecifier);
				const defaultSpecifiers = node.specifiers.filter((specifier) => specifier.type === TSESTree.AST_NODE_TYPES.ImportDefaultSpecifier);
				if (namedSpecifiers.length === 0 && defaultSpecifiers.length === 0) return;
				const zodSpecifiers = namedSpecifiers.filter((specifier) => specifier.imported.type === TSESTree.AST_NODE_TYPES.Identifier && (specifier.imported.name === "z" || specifier.imported.name === "core"));
				const zodDefaultSpecifiers = defaultSpecifiers;
				if (zodSpecifiers.length === 0 && zodDefaultSpecifiers.length === 0) return;
				for (const zodDefaultSpecifier of zodDefaultSpecifiers) {
					const localName = zodDefaultSpecifier.local.name;
					const importSource = node.source.value;
					context.report({
						node: zodDefaultSpecifier,
						messageId: "preferNamespaceImport",
						fix(fixer) {
							if (node.specifiers.length === 1) {
								const isTypeOnlyImport = node.importKind === "type";
								const typePrefix = isTypeOnlyImport ? "type " : "";
								return fixer.replaceText(node, `import ${typePrefix}* as ${localName} from '${importSource}';`);
							} else {
								const otherSpecifiers = node.specifiers.filter((s) => s !== zodDefaultSpecifier);
								const isTypeOnlyImport = node.importKind === "type";
								const typePrefix = isTypeOnlyImport ? "type " : "";
								const namespaceImport = `import ${typePrefix}* as ${localName} from '${importSource}';\n`;
								const otherImportParts = [];
								const otherDefaultSpecifiers = otherSpecifiers.filter((s) => s.type === TSESTree.AST_NODE_TYPES.ImportDefaultSpecifier);
								const otherNamedSpecifiers = otherSpecifiers.filter((s) => s.type === TSESTree.AST_NODE_TYPES.ImportSpecifier);
								if (otherDefaultSpecifiers.length > 0) {
									const defaultName = otherDefaultSpecifiers[0].local.name;
									otherImportParts.push(defaultName);
								}
								if (otherNamedSpecifiers.length > 0) {
									const namedPart = `{ ${otherNamedSpecifiers.map((s) => {
										const specifierLocalName = s.local.name;
										const specifierImportedName = s.imported.type === TSESTree.AST_NODE_TYPES.Identifier ? s.imported.name : "";
										const typeModifier = !isTypeOnlyImport && s.importKind === "type" ? "type " : "";
										return specifierLocalName === specifierImportedName ? `${typeModifier}${specifierImportedName}` : `${typeModifier}${specifierImportedName} as ${specifierLocalName}`;
									}).join(", ")} }`;
									otherImportParts.push(namedPart);
								}
								const otherImport = `import ${isTypeOnlyImport ? "type " : ""}${otherImportParts.join(", ")} from '${importSource}';`;
								return fixer.replaceText(node, `${namespaceImport}${otherImport}`);
							}
						}
					});
				}
				for (const zodSpecifier of zodSpecifiers) {
					const localName = zodSpecifier.local.name;
					const importedName = zodSpecifier.imported.name;
					const importSource = getImportSource(importedName, node.source.value);
					const isSubmoduleImport = importSource !== node.source.value;
					context.report({
						node: zodSpecifier,
						messageId: "preferNamespaceImport",
						fix(fixer) {
							if (namedSpecifiers.length === 1 || isSubmoduleImport && isAllSameSubmodule(namedSpecifiers, importedName)) {
								const isTypeOnlyImport = node.importKind === "type";
								const typePrefix = isTypeOnlyImport ? "type " : "";
								return fixer.replaceText(node, `import ${typePrefix}* as ${localName} from '${importSource}';`);
							} else {
								const otherSpecifiers = namedSpecifiers.filter((s) => s !== zodSpecifier);
								const isTypeOnlyImport = node.importKind === "type";
								const typePrefix = isTypeOnlyImport ? "type " : "";
								const namespaceImport = `import ${typePrefix}* as ${localName} from '${importSource}';\n`;
								const originalSource = node.source.value;
								const otherImport = `import ${isTypeOnlyImport ? "type " : ""}{ ${otherSpecifiers.map((s) => {
									const specifierLocalName = s.local.name;
									const specifierImportedName = s.imported.type === TSESTree.AST_NODE_TYPES.Identifier ? s.imported.name : "";
									const typeModifier = !isTypeOnlyImport && s.importKind === "type" ? "type " : "";
									return specifierLocalName === specifierImportedName ? `${typeModifier}${specifierImportedName}` : `${typeModifier}${specifierImportedName} as ${specifierLocalName}`;
								}).join(", ")} } from '${originalSource}';`;
								return fixer.replaceText(node, `${namespaceImport}${otherImport}`);
							}
						}
					});
				}
			} };
		}
	});
} });

//#endregion
//#region src/index.ts
var require_src = __commonJS({ "src/index.ts"(exports, module) {
	init_prefer_zod_namespace();
	const importZod = {
		meta: {
			name: "import-zod",
			version: "1.0.0"
		},
		rules: { "prefer-zod-namespace": prefer_zod_namespace_default },
		configs: {}
	};
	Object.assign(importZod.configs, { recommended: [{
		plugins: { "import-zod": importZod },
		rules: { "import-zod/prefer-zod-namespace": "error" }
	}] });
	module.exports = importZod;
} });

//#endregion
export default require_src();
