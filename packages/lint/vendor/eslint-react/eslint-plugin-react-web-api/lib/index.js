import { DEFAULT_ESLINT_REACT_SETTINGS } from "../../@eslint-react/shared/lib/index.js";
import * as core from "../../@eslint-react/core/lib/index.js";
import birecord from "birecord";
import { P, isMatching, match } from "ts-pattern";
import * as ESLintUtils from "@typescript-eslint/utils/eslint-utils";
import { Check, Compare, Extract, Traverse, isOneOf } from "../../@eslint-react/ast/lib/index.js";
import { merge } from "../../@eslint-react/eslint/lib/index.js";
import { isAssignmentTargetEqual, isValueEqual, resolve, resolveEnclosingAssignmentTarget } from "../../@eslint-react/var/lib/index.js";
import { AST_NODE_TYPES } from "@typescript-eslint/types";
import { getStaticValue } from "@typescript-eslint/utils/ast-utils";

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
//#region package.json
var name$1 = "eslint-plugin-react-web-api";
var version = "5.7.1";

//#endregion
//#region src/types/component-phase.ts
const ComponentPhaseRelevance = birecord({ setup: "cleanup" });
function getPhaseKindOfFunction(node) {
	return match(node).when(core.isUseEffectSetupCallback, () => "setup").when(core.isUseEffectCleanupCallback, () => "cleanup").otherwise(() => null);
}

//#endregion
//#region src/utils/create-rule.ts
function getDocsUrl(ruleName) {
	return `https://eslint-react.xyz/docs/rules/web-api-${ruleName}`;
}
const createRule = ESLintUtils.RuleCreator(getDocsUrl);

//#endregion
//#region src/rules/no-leaked-event-listener/lib.ts
function findProperty$1(of, named) {
	for (const property of of) {
		if (property.type === AST_NODE_TYPES.Property && Extract.getPropertyName(property.key) === named) return property;
		if (property.type === AST_NODE_TYPES.SpreadElement && property.argument.type === AST_NODE_TYPES.ObjectExpression) {
			const found = findProperty$1(property.argument.properties, named);
			if (found != null) return found;
		}
	}
	return null;
}
function getSignalValueExpression(context, node) {
	if (node == null) return null;
	switch (node.type) {
		case AST_NODE_TYPES.Identifier: {
			const resolved = resolve(context, node);
			const unwrapped = resolved == null ? null : Extract.unwrap(resolved);
			if (unwrapped != null && Check.isFunction(unwrapped)) return node;
			return getSignalValueExpression(context, unwrapped);
		}
		case AST_NODE_TYPES.MemberExpression: return node;
		default: return null;
	}
}
const defaultOptions = {
	capture: false,
	signal: null
};
function getOptions(context, node) {
	const initialScope = context.sourceCode.getScope(node);
	function getOpts(node) {
		switch (node.type) {
			case AST_NODE_TYPES.Identifier: {
				const initNode = resolve(context, node);
				if (initNode?.type === AST_NODE_TYPES.ObjectExpression) return getOpts(initNode);
				return defaultOptions;
			}
			case AST_NODE_TYPES.Literal: return {
				...defaultOptions,
				capture: Boolean(node.value)
			};
			case AST_NODE_TYPES.ObjectExpression: {
				const vCapture = match(findProperty$1(node.properties, "capture")).with(P.nullish, () => false).with({ type: AST_NODE_TYPES.Property }, (prop) => {
					const value = prop.value;
					switch (value.type) {
						case AST_NODE_TYPES.Literal: return Boolean(value.value);
						default: return Boolean(getStaticValue(value, initialScope)?.value);
					}
				}).otherwise(() => false);
				const pSignal = findProperty$1(node.properties, "signal");
				return {
					capture: vCapture,
					signal: pSignal?.type === AST_NODE_TYPES.Property ? getSignalValueExpression(context, pSignal.value) : null
				};
			}
			default: return defaultOptions;
		}
	}
	return getOpts(node);
}

//#endregion
//#region src/rules/no-leaked-event-listener/no-leaked-event-listener.ts
const RULE_NAME$4 = "no-leaked-event-listener";
function getCallKind$4(node) {
	const callee = Extract.unwrap(node.callee);
	switch (true) {
		case callee.type === AST_NODE_TYPES.Identifier && isMatching(P.union("addEventListener", "removeEventListener", "abort"))(callee.name): return callee.name;
		case callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier && isMatching(P.union("addEventListener", "removeEventListener", "abort"))(callee.property.name): return callee.property.name;
		default: return "other";
	}
}
function getFunctionKind$1(node) {
	return getPhaseKindOfFunction(node) ?? "other";
}
var no_leaked_event_listener_default = createRule({
	meta: {
		type: "problem",
		docs: { description: "Enforces that every 'addEventListener' in a component or custom hook has a corresponding 'removeEventListener'." },
		messages: {
			expectedRemoveEventListenerInCleanup: "An 'addEventListener' in '{{effectMethodKind}}' should have a corresponding 'removeEventListener' in its cleanup function.",
			unexpectedInlineFunction: "A/an '{{eventMethodKind}}' should not have an inline listener function."
		},
		schema: []
	},
	name: RULE_NAME$4,
	create: create$4,
	defaultOptions: []
});
function create$4(context) {
	if (!context.sourceCode.text.includes("addEventListener")) return {};
	if (!/use\w*Effect/u.test(context.sourceCode.text)) return {};
	const fEntries = [];
	const aEntries = [];
	const rEntries = [];
	const abortedSignals = [];
	function isSameObject(a, b) {
		switch (true) {
			case a.type === AST_NODE_TYPES.MemberExpression && b.type === AST_NODE_TYPES.MemberExpression: return Compare.isEqual(a.object, b.object);
			default: return false;
		}
	}
	function isInverseEntry(aEntry, rEntry) {
		const { type: aType, callee: aCallee, capture: aCapture, listener: aListener, phase: aPhase } = aEntry;
		const { type: rType, callee: rCallee, capture: rCapture, listener: rListener, phase: rPhase } = rEntry;
		if (ComponentPhaseRelevance.get(aPhase) !== rPhase) return false;
		return isSameObject(aCallee, rCallee) && Compare.isEqual(aListener, rListener) && isValueEqual(context, aType, rType) && aCapture === rCapture;
	}
	function checkInlineFunction(node, callKind, options) {
		const listener = node.arguments.at(1);
		if (!Check.isFunction(listener)) return;
		if (options.signal != null) return;
		context.report({
			data: { eventMethodKind: callKind },
			messageId: "unexpectedInlineFunction",
			node: listener
		});
	}
	return merge({
		[":function"](node) {
			const kind = getFunctionKind$1(node);
			fEntries.push({
				kind,
				node
			});
		},
		[":function:exit"]() {
			fEntries.pop();
		},
		["CallExpression"](node) {
			const fKind = fEntries.findLast((x) => x.kind !== "other")?.kind;
			if (fKind == null) return;
			if (!ComponentPhaseRelevance.has(fKind)) return;
			const unwrappedCallee = Extract.unwrap(node.callee);
			match(getCallKind$4(node)).with("addEventListener", (callKind) => {
				if (unwrappedCallee.type === AST_NODE_TYPES.MemberExpression && unwrappedCallee.object.type === AST_NODE_TYPES.Identifier && core.isAPIFromReactNative(unwrappedCallee.object.name, context.sourceCode.getScope(node))) return;
				const [type, listener, options] = node.arguments;
				if (type == null || listener == null) return;
				const opts = options == null ? defaultOptions : getOptions(context, options);
				const { callee } = node;
				checkInlineFunction(node, callKind, opts);
				aEntries.push({
					...opts,
					type,
					callee,
					listener,
					method: "addEventListener",
					node,
					phase: fKind
				});
			}).with("removeEventListener", (callKind) => {
				const [type, listener, options] = node.arguments;
				if (type == null || listener == null) return;
				const opts = options == null ? defaultOptions : getOptions(context, options);
				const { callee } = node;
				checkInlineFunction(node, callKind, opts);
				rEntries.push({
					...opts,
					type,
					callee,
					listener,
					method: "removeEventListener",
					node,
					phase: fKind
				});
			}).with("abort", () => {
				abortedSignals.push(node.callee);
			}).otherwise(() => null);
		},
		["Program:exit"]() {
			for (const aEntry of aEntries) {
				if (aEntry.signal != null) continue;
				if (rEntries.some((rEntry) => isInverseEntry(aEntry, rEntry))) continue;
				switch (aEntry.phase) {
					case "setup":
					case "cleanup":
						context.report({
							data: { effectMethodKind: "useEffect" },
							messageId: "expectedRemoveEventListenerInCleanup",
							node: aEntry.node
						});
						continue;
				}
			}
		}
	});
}

//#endregion
//#region src/rules/no-leaked-fetch/lib.ts
function findProperty(of, named) {
	for (const property of of) {
		if (property.type === AST_NODE_TYPES.Property && Extract.getPropertyName(property.key) === named) return property;
		if (property.type === AST_NODE_TYPES.SpreadElement && property.argument.type === AST_NODE_TYPES.ObjectExpression) {
			const found = findProperty(property.argument.properties, named);
			if (found != null) return found;
		}
	}
	return null;
}
function resolveToObjectExpression(context, node) {
	node = Extract.unwrap(node);
	switch (node.type) {
		case AST_NODE_TYPES.ObjectExpression: return node;
		case AST_NODE_TYPES.Identifier: {
			let resolved = resolve(context, node);
			resolved = resolved == null ? null : Extract.unwrap(resolved);
			if (resolved?.type === AST_NODE_TYPES.ObjectExpression) return resolved;
			return null;
		}
		default: return null;
	}
}

//#endregion
//#region src/rules/no-leaked-fetch/no-leaked-fetch.ts
const RULE_NAME$3 = "no-leaked-fetch";
function getCallKind$3(node) {
	const callee = Extract.unwrap(node.callee);
	switch (true) {
		case callee.type === AST_NODE_TYPES.Identifier && callee.name === "fetch": return "fetch";
		case callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier && callee.property.name === "fetch": return "fetch";
		case callee.type === AST_NODE_TYPES.Identifier && callee.name === "abort": return "abort";
		case callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier && callee.property.name === "abort": return "abort";
		default: return "other";
	}
}
function getControllerFromSignal(context, node) {
	node = Extract.unwrap(node);
	switch (node.type) {
		case AST_NODE_TYPES.MemberExpression: return {
			controller: node.object,
			isParamSignal: false
		};
		case AST_NODE_TYPES.Identifier: {
			const resolved = resolve(context, node);
			const resolvedUnwrapped = resolved == null ? null : Extract.unwrap(resolved);
			if (resolvedUnwrapped?.type === AST_NODE_TYPES.MemberExpression) return {
				controller: resolvedUnwrapped.object,
				isParamSignal: false
			};
			if (resolved != null && Check.isFunction(resolved)) return {
				controller: node,
				isParamSignal: true
			};
			return {
				controller: null,
				isParamSignal: false
			};
		}
		default: return {
			controller: null,
			isParamSignal: false
		};
	}
}
function getFetchController(context, node) {
	const [, optionsArg] = node.arguments;
	if (optionsArg == null) return {
		controller: null,
		isParamSignal: false
	};
	const options = resolveToObjectExpression(context, optionsArg);
	if (options == null) return {
		controller: null,
		isParamSignal: false
	};
	const signalProp = findProperty(options.properties, "signal");
	if (signalProp?.type !== AST_NODE_TYPES.Property) return {
		controller: null,
		isParamSignal: false
	};
	return getControllerFromSignal(context, signalProp.value);
}
function getAbortController(node) {
	const callee = Extract.unwrap(node.callee);
	if (callee.type === AST_NODE_TYPES.MemberExpression) return callee.object;
	return null;
}
var no_leaked_fetch_default = createRule({
	meta: {
		type: "problem",
		docs: { description: "Enforces that every 'fetch' in a component or custom hook has a corresponding 'AbortController' abort in the cleanup function." },
		messages: {
			expectedAbortController: "A 'fetch' must be provided with an 'AbortController' for proper cleanup.",
			expectedAbortInCleanup: "A 'fetch' started in effect must be aborted with 'AbortController.abort' in the cleanup function."
		},
		schema: []
	},
	name: RULE_NAME$3,
	create: create$3,
	defaultOptions: []
});
function create$3(context) {
	if (!context.sourceCode.text.includes("fetch")) return {};
	if (!/use\w*Effect/u.test(context.sourceCode.text)) return {};
	const fEntries = [];
	const fetchEntries = [];
	const abortEntries = [];
	return merge({
		[":function"](node) {
			const kind = getPhaseKindOfFunction(node) ?? "other";
			fEntries.push({
				kind,
				node
			});
		},
		[":function:exit"]() {
			fEntries.pop();
		},
		["CallExpression"](node) {
			const fEntry = fEntries.at(-1);
			if (fEntry == null || !ComponentPhaseRelevance.has(fEntry.kind)) return;
			switch (getCallKind$3(node)) {
				case "fetch": {
					if (fEntry.kind !== "setup") return;
					const { controller, isParamSignal } = getFetchController(context, node);
					fetchEntries.push({
						controller,
						isParamSignal,
						node,
						phase: fEntry.kind
					});
					break;
				}
				case "abort": {
					if (fEntry.kind !== "cleanup") return;
					const controller = getAbortController(node);
					if (controller == null) break;
					abortEntries.push({
						controller,
						node,
						phase: fEntry.kind
					});
					break;
				}
			}
		},
		["Program:exit"]() {
			for (const fEntry of fetchEntries) {
				const controller = fEntry.controller;
				if (controller == null) {
					context.report({
						messageId: "expectedAbortController",
						node: fEntry.node
					});
					continue;
				}
				if (fEntry.isParamSignal) continue;
				if (!abortEntries.some((aEntry) => isAssignmentTargetEqual(context, aEntry.controller, controller))) context.report({
					messageId: "expectedAbortInCleanup",
					node: fEntry.node
				});
			}
		}
	});
}

//#endregion
//#region src/rules/no-leaked-interval/no-leaked-interval.ts
const RULE_NAME$2 = "no-leaked-interval";
function getCallKind$2(node) {
	const callee = Extract.unwrap(node.callee);
	switch (true) {
		case callee.type === AST_NODE_TYPES.Identifier && isMatching(P.union("setInterval", "clearInterval"))(callee.name): return callee.name;
		case callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier && isMatching(P.union("setInterval", "clearInterval"))(callee.property.name): return callee.property.name;
		default: return "other";
	}
}
var no_leaked_interval_default = createRule({
	meta: {
		type: "problem",
		docs: { description: "Enforces that every 'setInterval' in a component or custom hook has a corresponding 'clearInterval'." },
		messages: {
			expectedClearIntervalInCleanup: "A 'setInterval' created in '{{ kind }}' must be cleared with 'clearInterval' in the cleanup function.",
			expectedIntervalId: "A 'setInterval' must be assigned to a variable for proper cleanup."
		},
		schema: []
	},
	name: RULE_NAME$2,
	create: create$2,
	defaultOptions: []
});
function create$2(context) {
	if (!context.sourceCode.text.includes("setInterval")) return {};
	const fEntries = [];
	const sEntries = [];
	const cEntries = [];
	function isInverseEntry(a, b) {
		return isAssignmentTargetEqual(context, a.timerId, b.timerId);
	}
	return merge({
		[":function"](node) {
			const kind = getPhaseKindOfFunction(node) ?? "other";
			fEntries.push({
				kind,
				node
			});
		},
		[":function:exit"]() {
			fEntries.pop();
		},
		["CallExpression"](node) {
			switch (getCallKind$2(node)) {
				case "setInterval": {
					const fEntry = fEntries.findLast((x) => x.kind !== "other");
					if (fEntry == null) break;
					if (!ComponentPhaseRelevance.has(fEntry.kind)) break;
					const intervalIdNode = resolveEnclosingAssignmentTarget(node);
					if (intervalIdNode == null) {
						context.report({
							messageId: "expectedIntervalId",
							node
						});
						break;
					}
					sEntries.push({
						kind: "interval",
						callee: node.callee,
						node,
						phase: fEntry.kind,
						timerId: intervalIdNode
					});
					break;
				}
				case "clearInterval": {
					const fEntry = fEntries.findLast((x) => x.kind !== "other");
					if (fEntry == null) break;
					if (!ComponentPhaseRelevance.has(fEntry.kind)) break;
					const [intervalIdNode] = node.arguments;
					if (intervalIdNode == null) break;
					cEntries.push({
						kind: "interval",
						callee: node.callee,
						node,
						phase: fEntry.kind,
						timerId: intervalIdNode
					});
					break;
				}
			}
		},
		["Program:exit"]() {
			for (const sEntry of sEntries) {
				if (cEntries.some((cEntry) => isInverseEntry(sEntry, cEntry))) continue;
				switch (sEntry.phase) {
					case "setup":
					case "cleanup":
						context.report({
							data: { kind: "useEffect" },
							messageId: "expectedClearIntervalInCleanup",
							node: sEntry.node
						});
						continue;
				}
			}
		}
	});
}

//#endregion
//#region ../../.pkgs/eff/dist/index.js
function or(a, b) {
	return (data) => a(data) || b(data);
}
/**
* Creates a function that can be used in a data-last (aka `pipe`able) or
* data-first style.
*
* The first parameter to `dual` is either the arity of the uncurried function
* or a predicate that determines if the function is being used in a data-first
* or data-last style.
*
* Using the arity is the most common use case, but there are some cases where
* you may want to use a predicate. For example, if you have a function that
* takes an optional argument, you can use a predicate to determine if the
* function is being used in a data-first or data-last style.
*
* You can pass either the arity of the uncurried function or a predicate
* which determines if the function is being used in a data-first or
* data-last style.
*
* **Example** (Using arity to determine data-first or data-last style)
*
* ```ts
* import { dual, pipe } from "effect/Function"
*
* const sum = dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(2, (self, that) => self + that)
*
* console.log(sum(2, 3)) // 5
* console.log(pipe(2, sum(3))) // 5
* ```
*
* **Example** (Using call signatures to define the overloads)
*
* ```ts
* import { dual, pipe } from "effect/Function"
*
* const sum: {
*   (that: number): (self: number) => number
*   (self: number, that: number): number
* } = dual(2, (self: number, that: number): number => self + that)
*
* console.log(sum(2, 3)) // 5
* console.log(pipe(2, sum(3))) // 5
* ```
*
* **Example** (Using a predicate to determine data-first or data-last style)
*
* ```ts
* import { dual, pipe } from "effect/Function"
*
* const sum = dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(
*   (args) => args.length === 2,
*   (self, that) => self + that
* )
*
* console.log(sum(2, 3)) // 5
* console.log(pipe(2, sum(3))) // 5
* ```
*
* @param arity - The arity of the uncurried function or a predicate that determines if the function is being used in a data-first or data-last style.
* @param body - The function to be curried.
* @since 1.0.0
*/
const dual = function(arity, body) {
	if (typeof arity === "function") return function() {
		return arity(arguments) ? body.apply(this, arguments) : ((self) => body(self, ...arguments));
	};
	switch (arity) {
		case 0:
		case 1: throw new RangeError(`Invalid arity ${arity}`);
		case 2: return function(a, b) {
			if (arguments.length >= 2) return body(a, b);
			return function(self) {
				return body(self, a);
			};
		};
		case 3: return function(a, b, c) {
			if (arguments.length >= 3) return body(a, b, c);
			return function(self) {
				return body(self, a, b);
			};
		};
		default: return function() {
			if (arguments.length >= arity) return body.apply(this, arguments);
			const args = arguments;
			return function(self) {
				return body(self, ...args);
			};
		};
	}
};
/**
* Composes two functions, `ab` and `bc` into a single function that takes in an argument `a` of type `A` and returns a result of type `C`.
* The result is obtained by first applying the `ab` function to `a` and then applying the `bc` function to the result of `ab`.
*
* @param self - The first function to apply (or the composed function in data-last style).
* @param bc - The second function to apply.
* @returns A composed function that applies both functions in sequence.
* @example
* ```ts
* import * as assert from "node:assert"
* import { compose } from "effect/Function"
*
* const increment = (n: number) => n + 1;
* const square = (n: number) => n * n;
*
* assert.strictEqual(compose(increment, square)(2), 9);
* ```
*
* @since 1.0.0
*/
const compose = dual(2, (ab, bc) => (a) => bc(ab(a)));

//#endregion
//#region src/rules/no-leaked-resize-observer/lib.ts
/**
* Check if a node is a loop statement
* @param node The node to check
* @returns True if the node is a loop
*/
const isLoop = isOneOf([
	AST_NODE_TYPES.DoWhileStatement,
	AST_NODE_TYPES.ForInStatement,
	AST_NODE_TYPES.ForOfStatement,
	AST_NODE_TYPES.ForStatement,
	AST_NODE_TYPES.WhileStatement
]);
/**
* Check if a node is a conditional expression or control flow statement
* @param node The node to check
* @returns True if the node is conditional
*/
const isConditional = isOneOf([
	AST_NODE_TYPES.DoWhileStatement,
	AST_NODE_TYPES.ForInStatement,
	AST_NODE_TYPES.ForOfStatement,
	AST_NODE_TYPES.ForStatement,
	AST_NODE_TYPES.WhileStatement,
	AST_NODE_TYPES.IfStatement,
	AST_NODE_TYPES.SwitchStatement,
	AST_NODE_TYPES.LogicalExpression,
	AST_NODE_TYPES.ConditionalExpression
]);
function isNewResizeObserver(node) {
	if (node?.type !== AST_NODE_TYPES.NewExpression) return false;
	const callee = Extract.unwrap(node.callee);
	return callee.type === AST_NODE_TYPES.Identifier && callee.name === "ResizeObserver";
}
function isFromObserver(context, node) {
	switch (true) {
		case node.type === AST_NODE_TYPES.Identifier: {
			const initNode = resolve(context, node);
			return isNewResizeObserver(initNode == null ? null : Extract.unwrap(initNode));
		}
		case node.type === AST_NODE_TYPES.MemberExpression: return isFromObserver(context, node.object);
		default: return false;
	}
}

//#endregion
//#region src/rules/no-leaked-resize-observer/no-leaked-resize-observer.ts
const RULE_NAME$1 = "no-leaked-resize-observer";
function getCallKind$1(context, node) {
	const callee = Extract.unwrap(node.callee);
	switch (true) {
		case callee.type === AST_NODE_TYPES.Identifier && isMatching(P.union("observe", "unobserve", "disconnect"))(callee.name) && isFromObserver(context, callee): return callee.name;
		case callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier && isMatching(P.union("observe", "unobserve", "disconnect"))(callee.property.name) && isFromObserver(context, callee): return callee.property.name;
		default: return "other";
	}
}
function getFunctionKind(node) {
	return getPhaseKindOfFunction(node) ?? "other";
}
var no_leaked_resize_observer_default = createRule({
	meta: {
		type: "problem",
		docs: { description: "Enforces that every 'ResizeObserver' created in a component or custom hook has a corresponding 'ResizeObserver.disconnect()'." },
		messages: {
			expectedDisconnectInControlFlow: "Dynamically added 'ResizeObserver.observe' should be cleared all at once using 'ResizeObserver.disconnect' in the cleanup function.",
			expectedDisconnectOrUnobserveInCleanup: "A 'ResizeObserver' instance created in 'useEffect' must be disconnected in the cleanup function.",
			unexpectedFloatingInstance: "A 'ResizeObserver' instance created in component or custom hook must be assigned to a variable for proper cleanup."
		},
		schema: []
	},
	name: RULE_NAME$1,
	create: create$1,
	defaultOptions: []
});
function create$1(context) {
	if (!context.sourceCode.text.includes("ResizeObserver")) return {};
	const fEntries = [];
	const observers = [];
	const oEntries = [];
	const uEntries = [];
	const dEntries = [];
	return merge({
		[":function"](node) {
			const kind = getFunctionKind(node);
			fEntries.push({
				kind,
				node
			});
		},
		[":function:exit"]() {
			fEntries.pop();
		},
		["CallExpression"](node) {
			const unwrappedCallee = Extract.unwrap(node.callee);
			if (unwrappedCallee.type !== AST_NODE_TYPES.MemberExpression) return;
			const fKind = fEntries.findLast((x) => x.kind !== "other")?.kind;
			if (fKind == null || !ComponentPhaseRelevance.has(fKind)) return;
			const { object } = unwrappedCallee;
			match(getCallKind$1(context, node)).with("disconnect", () => {
				dEntries.push({
					kind: "ResizeObserver",
					callee: node.callee,
					method: "disconnect",
					node,
					observer: object,
					phase: fKind
				});
			}).with("observe", () => {
				const [element] = node.arguments;
				if (element == null) return;
				oEntries.push({
					kind: "ResizeObserver",
					callee: node.callee,
					element,
					method: "observe",
					node,
					observer: object,
					phase: fKind
				});
			}).with("unobserve", () => {
				const [element] = node.arguments;
				if (element == null) return;
				uEntries.push({
					kind: "ResizeObserver",
					callee: node.callee,
					element,
					method: "unobserve",
					node,
					observer: object,
					phase: fKind
				});
			}).otherwise(() => null);
		},
		["NewExpression"](node) {
			const fEntry = fEntries.findLast((x) => x.kind !== "other");
			if (fEntry == null) return;
			if (!ComponentPhaseRelevance.has(fEntry.kind)) return;
			if (!isNewResizeObserver(node)) return;
			const id = resolveEnclosingAssignmentTarget(node);
			if (id == null) {
				context.report({
					messageId: "unexpectedFloatingInstance",
					node
				});
				return;
			}
			observers.push({
				id,
				node,
				phase: fEntry.kind,
				phaseNode: fEntry.node
			});
		},
		["Program:exit"]() {
			for (const { id, node, phaseNode } of observers) {
				if (dEntries.some((e) => isAssignmentTargetEqual(context, e.observer, id))) continue;
				const oentries = oEntries.filter((e) => isAssignmentTargetEqual(context, e.observer, id));
				const uentries = uEntries.filter((e) => isAssignmentTargetEqual(context, e.observer, id));
				const isDynamic = (node) => node?.type === AST_NODE_TYPES.CallExpression || isConditional(node);
				const isPhaseNode = (node) => node === phaseNode;
				if (oentries.some((e) => !isPhaseNode(Traverse.findParent(e.node, or(isDynamic, isPhaseNode))))) {
					context.report({
						messageId: "expectedDisconnectInControlFlow",
						node
					});
					continue;
				}
				for (const oEntry of oentries) {
					if (uentries.some((uEntry) => isAssignmentTargetEqual(context, uEntry.element, oEntry.element))) continue;
					context.report({
						messageId: "expectedDisconnectOrUnobserveInCleanup",
						node: oEntry.node
					});
				}
			}
		}
	});
}

//#endregion
//#region src/rules/no-leaked-timeout/no-leaked-timeout.ts
const RULE_NAME = "no-leaked-timeout";
function getCallKind(node) {
	const callee = Extract.unwrap(node.callee);
	switch (true) {
		case callee.type === AST_NODE_TYPES.Identifier && isMatching(P.union("setTimeout", "clearTimeout"))(callee.name): return callee.name;
		case callee.type === AST_NODE_TYPES.MemberExpression && callee.property.type === AST_NODE_TYPES.Identifier && isMatching(P.union("setTimeout", "clearTimeout"))(callee.property.name): return callee.property.name;
		default: return "other";
	}
}
var no_leaked_timeout_default = createRule({
	meta: {
		type: "problem",
		docs: { description: "Enforces that every 'setTimeout' in a component or custom hook has a corresponding 'clearTimeout'." },
		messages: {
			expectedClearTimeoutInCleanup: "A 'setTimeout' created in '{{ kind }}' must be cleared with 'clearTimeout' in the cleanup function.",
			expectedTimeoutId: "A 'setTimeout' must be assigned to a variable for proper cleanup."
		},
		schema: []
	},
	name: RULE_NAME,
	create,
	defaultOptions: []
});
function create(context) {
	if (!context.sourceCode.text.includes("setTimeout")) return {};
	const fEntries = [];
	const sEntries = [];
	const rEntries = [];
	function isInverseEntry(a, b) {
		return isAssignmentTargetEqual(context, a.timerId, b.timerId);
	}
	return merge({
		[":function"](node) {
			const kind = getPhaseKindOfFunction(node) ?? "other";
			fEntries.push({
				kind,
				node
			});
		},
		[":function:exit"]() {
			fEntries.pop();
		},
		["CallExpression"](node) {
			const fEntry = fEntries.findLast((f) => f.kind !== "other");
			if (!ComponentPhaseRelevance.has(fEntry?.kind)) return;
			switch (getCallKind(node)) {
				case "setTimeout": {
					const timeoutIdNode = resolveEnclosingAssignmentTarget(node);
					if (timeoutIdNode == null) {
						context.report({
							messageId: "expectedTimeoutId",
							node
						});
						break;
					}
					sEntries.push({
						kind: "timeout",
						callee: node.callee,
						node,
						phase: fEntry.kind,
						timerId: timeoutIdNode
					});
					break;
				}
				case "clearTimeout": {
					const [timeoutIdNode] = node.arguments;
					if (timeoutIdNode == null) break;
					rEntries.push({
						kind: "timeout",
						callee: node.callee,
						node,
						phase: fEntry.kind,
						timerId: timeoutIdNode
					});
					break;
				}
			}
		},
		["Program:exit"]() {
			for (const sEntry of sEntries) {
				if (rEntries.some((rEntry) => isInverseEntry(sEntry, rEntry))) continue;
				switch (sEntry.phase) {
					case "setup":
					case "cleanup":
						context.report({
							data: { kind: "useEffect" },
							messageId: "expectedClearTimeoutInCleanup",
							node: sEntry.node
						});
						continue;
				}
			}
		}
	});
}

//#endregion
//#region src/plugin.ts
const plugin = {
	meta: {
		name: name$1,
		version
	},
	rules: {
		"no-leaked-event-listener": no_leaked_event_listener_default,
		"no-leaked-fetch": no_leaked_fetch_default,
		"no-leaked-interval": no_leaked_interval_default,
		"no-leaked-resize-observer": no_leaked_resize_observer_default,
		"no-leaked-timeout": no_leaked_timeout_default
	}
};

//#endregion
//#region src/configs/recommended.ts
var recommended_exports = /* @__PURE__ */ __exportAll({
	name: () => name,
	plugins: () => plugins,
	rules: () => rules,
	settings: () => settings
});
const name = "react-web-api/recommended";
const rules = {
	"react-web-api/no-leaked-event-listener": "warn",
	"react-web-api/no-leaked-fetch": "warn",
	"react-web-api/no-leaked-interval": "warn",
	"react-web-api/no-leaked-resize-observer": "warn",
	"react-web-api/no-leaked-timeout": "warn"
};
const plugins = { "react-web-api": plugin };
const settings = { "react-x": DEFAULT_ESLINT_REACT_SETTINGS };

//#endregion
//#region src/index.ts
const finalPlugin = {
	...plugin,
	configs: { ["recommended"]: recommended_exports }
};

//#endregion
export { finalPlugin as default };