
//#region src/util/ast.js
/**
* @import {Scope,Rule} from 'eslint'
*/
/**
* Ascend the AST from `ref`, calling `visit` on each reference.
*
* @param {Rule.RuleContext} context
* @param {Scope.Reference} ref
* @param {(ref: Scope.Reference) => boolean|undefined} visit Return `false` to stop ascending at this reference.
* @param {Set<Scope.Reference>} visited
*/
const ascend = (context, ref, visit, visited = /* @__PURE__ */ new Set()) => {
	var _ref$resolved;
	if (visited.has(ref)) return;
	const contine = visit(ref);
	visited.add(ref);
	if (contine === false) return;
	(_ref$resolved = ref.resolved) === null || _ref$resolved === void 0 || _ref$resolved.defs.filter((def) => def.type !== "ImportBinding").filter((def) => def.type !== "Parameter").map((def) => def.node.init ?? def.node.body).filter(Boolean).flatMap((node) => getDownstreamRefs(context, node)).forEach((ref) => ascend(context, ref, visit, visited));
};
/**
* Descend the AST from `node`, calling `visit` on each node.
*
* @param {Rule.RuleContext} context
* @param {Rule.Node} node
* @param {(node: Rule.Node) => void} visit
* @param {Set<Rule.Node>} visited
*/
const descend = (context, node, visit, visited = /* @__PURE__ */ new Set()) => {
	if (visited.has(node)) return;
	visit(node);
	visited.add(node);
	(context.sourceCode.visitorKeys[node.type] || []).map((key) => node[key]).filter(Boolean).flatMap((child) => Array.isArray(child) ? child : [child]).filter(Boolean).filter((child) => typeof child.type === "string").forEach((child) => descend(context, child, visit, visited));
};
/**
* Get all upstream references that ultimately flow into `ref`.
* Includes `ref` itself.
*
* @param {Rule.RuleContext} context
* @param {Scope.Reference} ref
*
* @returns {Scope.Reference[]}
*/
const getUpstreamRefs = (context, ref) => {
	const refs = [];
	ascend(context, ref, (upRef) => refs.push(upRef));
	return refs;
};
/**
* @param {Rule.RuleContext} context
* @param {Rule.Node} topNode
* @param {string} type
*/
const findDownstreamNodes = (context, topNode, type) => {
	const nodes = [];
	descend(context, topNode, (node) => {
		if (node.type === type) nodes.push(node);
	});
	return nodes;
};
/**
* @param {Rule.RuleContext} context
* @param {Rule.Node} node
*/
const getDownstreamRefs = (context, node) => findDownstreamNodes(context, node, "Identifier").map((identifier) => getRef(context, identifier)).filter(Boolean);
/**
* @param {Scope.Reference} ref
* @param {Rule.Node} current
* @returns {Rule.Node | undefined}
*/
const getCallExpr = (ref, current = ref.identifier.parent) => {
	if (current.type === "CallExpression") {
		let node = ref.identifier;
		while (node.parent.type === "MemberExpression") node = node.parent;
		if (current.callee === node) return current;
	}
	if (current.type === "MemberExpression") return getCallExpr(ref, current.parent);
};
/**
* When using this, we assume that args passed to the derived function are always eventually passed to underlying functions.
* Which they may not be. Would be better to trace the actual flow of values, but that's complex. We'll start with this for now.
*
* @param {Rule.RuleContext} context
* @param {Scope.Reference} ref
* @returns {Rule.Node[]}
*/
const getArgsUpstreamRefs = (context, ref) => getUpstreamRefs(context, ref).map((ref) => getCallExpr(ref)).filter(Boolean).flatMap((callExpr) => callExpr.arguments).flatMap((arg) => getDownstreamRefs(context, arg)).flatMap((ref) => getUpstreamRefs(context, ref));
/**
* Walks up the AST until `within` (returns `true`) or finding any of (returns `false`):
* - An `async` function
* - A function declaration, which may be called at an arbitrary later time.
*   - While we return false for *this* call, we may still return true for a call to a function containing this call. Combined with `getUpstreamRefs()`, it will still flag calls to the containing function.
* - A function passed as a callback to another function or `new` - event handler, `setTimeout`, `Promise.then()` `new ResizeObserver()`, etc.
*
* Inspired by https://eslint-react.xyz/docs/rules/hooks-extra-no-direct-set-state-in-use-effect
*
* @param {Rule.Node} node
* @param {Rule.Node} within
* @returns {boolean}
*/
const isSynchronous = (node, within) => {
	if (node == within) return true;
	else if (node.async || node.type === "AwaitExpression" || node.type === "UnaryExpression" && node.operator === "void" || node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") return false;
	else return isSynchronous(node.parent, within);
};
/**
* @param {Rule.RuleContext} context
* @param {Rule.Node} identifier
*
* @returns {Scope.Reference | undefined}
*/
const getRef = (context, identifier) => {
	var _context$sourceCode$g;
	return (_context$sourceCode$g = context.sourceCode.getScope(identifier)) === null || _context$sourceCode$g === void 0 ? void 0 : _context$sourceCode$g.references.find((ref) => ref.identifier == identifier);
};
/**
* Checks whether `ref` is a call expression that eventually calls another expression matching the given predicate.
*
* Beware this can false negative when function refs are passed to external functions that call them internally (which we can't see).
* But we prefer that to assuming that refs passed to external functions are always called -
* we don't have type information, so would false positive on non-function refs passed to external functions.
*
* @param {Rule.RuleContext} context
* @param {Scope.Reference} ref
* @param {(ref: Scope.Reference) => boolean} predicate
* @returns {boolean} Whether this reference eventually calls a function matching the given predicate.
*/
const isEventualCallTo = (context, ref, predicate) => {
	const callExprRefs = [];
	ascend(context, ref, (upRef) => {
		if (getCallExpr(upRef)) callExprRefs.push(upRef);
		else return false;
	});
	return callExprRefs.some(predicate);
};
//#endregion
//#region src/util/react.js
/**
* @import {Scope,Rule} from 'eslint'
*/
/**
* @param {Rule.Node} node
* @returns {boolean}
*/
const isReactFunctionalComponent = (node) => (node.type === "FunctionDeclaration" || node.type === "VariableDeclarator" && (node.init.type === "ArrowFunctionExpression" || node.init.type === "CallExpression")) && node.id.type === "Identifier" && node.id.name[0].toUpperCase() === node.id.name[0];
/**
* Determines whether `node` is a React HOC, whose props are likely to have side effects.
*
* Heuristic: If the component variable or its function is wrapped in a function call other than known pure HOCs (`memo` and `forwardRef`).
*
* @param {Rule.RuleContext} context
* @param {Rule.Node} node
*/
const isReactFunctionalHOC = (context, node) => {
	const knownPureHocs = ["memo", "forwardRef"];
	const isWrappedInline = (node) => node.type === "VariableDeclarator" && node.init.type === "CallExpression" && node.init.callee.type === "Identifier" && !knownPureHocs.includes(node.init.callee.name) && node.init.arguments.length > 0 && (node.init.arguments[0].type === "ArrowFunctionExpression" || node.init.arguments[0].type === "FunctionExpression");
	const isWrappedSeparately = (node) => {
		var _getRef;
		return ((_getRef = getRef(context, node.id)) === null || _getRef === void 0 || (_getRef = _getRef.resolved) === null || _getRef === void 0 ? void 0 : _getRef.references.filter((ref) => {
			const parent = ref.identifier.parent;
			return (parent === null || parent === void 0 ? void 0 : parent.type) === "CallExpression" && parent.arguments.includes(ref.identifier);
		}).map((ref) => ref.identifier.parent).some((wrapper) => !knownPureHocs.includes(wrapper.callee.name))) ?? false;
	};
	return isReactFunctionalComponent(node) && (isWrappedInline(node) || isWrappedSeparately(node));
};
/**
* @param {Rule.Node} node
* @returns {boolean}
*/
const isCustomHook = (node) => (node.type === "FunctionDeclaration" || node.type === "VariableDeclarator" && node.init && (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression")) && node.id.type === "Identifier" && node.id.name.startsWith("use") && node.id.name[3] === node.id.name[3].toUpperCase();
/**
* @param {Rule.Node} node
* @returns {boolean}
*/
const isUseState = (node) => node.type === "Identifier" && node.name === "useState" || node.type === "MemberExpression" && node.object.name === "React" && node.property.name === "useState" || node.parent.type === "MemberExpression" && node.parent.object.name === "React" && node.parent.property.name === "useState";
/**
* @param {Rule.Node} node
* @returns {boolean}
*/
const isUseRef = (node) => node.type === "Identifier" && node.name === "useRef" || node.parent.type === "MemberExpression" && node.parent.object.name === "React" && node.parent.property.name === "useRef";
/**
* Does not include `useLayoutEffect`.
* When used correctly, it interacts with the DOM = external system = (probably) valid effect.
* When used incorrectly, it's probably too difficult to accurately analyze anyway.
*
* @param {Rule.Node} node
* @returns {boolean}
*/
const isUseEffect = (node) => node.type === "CallExpression" && (node.callee.type === "Identifier" && node.callee.name === "useEffect" || node.callee.type === "MemberExpression" && node.callee.object.name === "React" && node.callee.property.name === "useEffect");
/**
* @param {Rule.Node} node - The `useEffect` `CallExpression` node
* @returns {Rule.Node | undefined}
*/
const getEffectFn = (node) => {
	const effectFn = node.arguments[0];
	if ((effectFn === null || effectFn === void 0 ? void 0 : effectFn.type) !== "ArrowFunctionExpression" && (effectFn === null || effectFn === void 0 ? void 0 : effectFn.type) !== "FunctionExpression") return;
	return effectFn;
};
/**
* @param {Rule.RuleContext} context
* @param {Rule.Node} node - The `useEffect` `CallExpression` node
* @returns {Scope.Reference[] | undefined}
*/
const getEffectFnRefs = (context, node) => {
	const effectFn = getEffectFn(node);
	return effectFn ? getDownstreamRefs(context, effectFn) : void 0;
};
/**
* @param {Rule.RuleContext} context
* @param {Rule.Node} node - The `useEffect` `CallExpression` node
* @returns {Scope.Reference[] | undefined}
*/
function getEffectDepsRefs(context, node) {
	const depsArr = node.arguments[1];
	if ((depsArr === null || depsArr === void 0 ? void 0 : depsArr.type) !== "ArrayExpression") return;
	return getDownstreamRefs(context, depsArr);
}
/**
* @param {Scope.Reference} ref
* @returns {boolean}
*/
const isState = (ref) => {
	var _ref$resolved;
	return (_ref$resolved = ref.resolved) === null || _ref$resolved === void 0 ? void 0 : _ref$resolved.defs.some((def) => {
		var _def$node$init, _def$node$id$elements;
		return def.node.type === "VariableDeclarator" && ((_def$node$init = def.node.init) === null || _def$node$init === void 0 ? void 0 : _def$node$init.type) === "CallExpression" && isUseState(def.node.init.callee) && def.node.id.type === "ArrayPattern" && (def.node.id.elements.length === 1 || def.node.id.elements.length === 2) && ((_def$node$id$elements = def.node.id.elements[0]) === null || _def$node$id$elements === void 0 ? void 0 : _def$node$id$elements.type) === "Identifier" && def.node.id.elements[0].name === ref.identifier.name;
	});
};
/**
* @param {Scope.Reference} ref
* @returns {boolean}
*/
const isStateSetter = (ref) => {
	var _ref$resolved2;
	return (_ref$resolved2 = ref.resolved) === null || _ref$resolved2 === void 0 ? void 0 : _ref$resolved2.defs.some((def) => {
		var _def$node$init2, _def$node$id$elements2;
		return def.node.type === "VariableDeclarator" && ((_def$node$init2 = def.node.init) === null || _def$node$init2 === void 0 ? void 0 : _def$node$init2.type) === "CallExpression" && isUseState(def.node.init.callee) && def.node.id.type === "ArrayPattern" && def.node.id.elements.length === 2 && ((_def$node$id$elements2 = def.node.id.elements[1]) === null || _def$node$id$elements2 === void 0 ? void 0 : _def$node$id$elements2.type) === "Identifier" && def.node.id.elements[1].name === ref.identifier.name;
	});
};
/**
* Returns false for props of HOCs (e.g. `withRouter`) because they usually have side effects.
*
* @param {Rule.RuleContext} context
* @param {Scope.Reference} ref
* @returns {boolean}
*/
const isProp = (context, ref) => {
	var _ref$resolved3;
	return (_ref$resolved3 = ref.resolved) === null || _ref$resolved3 === void 0 ? void 0 : _ref$resolved3.defs.some((def) => {
		const declaringNode = def.node.type === "ArrowFunctionExpression" ? def.node.parent.type === "CallExpression" ? def.node.parent.parent : def.node.parent : def.node;
		return def.type === "Parameter" && (isReactFunctionalComponent(declaringNode) && !isReactFunctionalHOC(context, declaringNode) || isCustomHook(declaringNode));
	});
};
/**
* @param {Scope.Reference} ref
* @returns {boolean}
*/
const isConstant = (ref) => {
	var _ref$resolved4;
	return (((_ref$resolved4 = ref.resolved) === null || _ref$resolved4 === void 0 ? void 0 : _ref$resolved4.defs) ?? []).some((def) => {
		var _def$node$init3, _def$node$init4, _def$node$init5, _def$node$init6;
		return def.node.type === "VariableDeclarator" && ((_def$node$init3 = def.node.init) === null || _def$node$init3 === void 0 ? void 0 : _def$node$init3.type) === "Literal" || ((_def$node$init4 = def.node.init) === null || _def$node$init4 === void 0 ? void 0 : _def$node$init4.type) === "TemplateLiteral" || ((_def$node$init5 = def.node.init) === null || _def$node$init5 === void 0 ? void 0 : _def$node$init5.type) === "ArrayExpression" || ((_def$node$init6 = def.node.init) === null || _def$node$init6 === void 0 ? void 0 : _def$node$init6.type) === "ObjectExpression";
	});
};
/**
* @param {Scope.Reference} ref
* @returns {boolean}
*/
const isRef = (ref) => {
	var _ref$resolved5;
	return (_ref$resolved5 = ref.resolved) === null || _ref$resolved5 === void 0 ? void 0 : _ref$resolved5.defs.some((def) => {
		var _def$node$init7;
		return def.node.type === "VariableDeclarator" && ((_def$node$init7 = def.node.init) === null || _def$node$init7 === void 0 ? void 0 : _def$node$init7.type) === "CallExpression" && (def.node.init.callee.type === "Identifier" && def.node.init.callee.name === "useRef" || def.node.init.callee.type === "MemberExpression" && def.node.init.callee.object.name === "React" && def.node.init.callee.property.name === "useRef");
	});
};
/**
* Whether the reference's `current` property is being accessed.
* Heuristic for whether the reference is a React ref object.
* Because we don't always have access to the `useRef` call itself.
* For example when receiving a ref from props.
*
* @param {Scope.Reference} ref
* @returns {boolean}
*/
const isRefCurrent = (ref) => ref.identifier.parent.type === "MemberExpression" && ref.identifier.parent.property.type === "Identifier" && ref.identifier.parent.property.name === "current";
/**
* @param {Rule.RuleContext} context
* @param {Scope.Reference} ref
* @returns {boolean} Whether this reference eventually calls a state setter function or a method on state.
*/
const isStateSetterCall = (context, ref) => isEventualCallTo(context, ref, isStateSetter);
/**
* @param {Rule.RuleContext} context
* @param {Scope.Reference} ref
* @returns {boolean} Whether this reference eventually calls a prop function or a method on a prop.
*/
const isPropCall = (context, ref) => isEventualCallTo(context, ref, (ref) => isProp(context, ref));
/**
* @param {Rule.RuleContext} context
* @param {Scope.Reference} ref
* @returns {boolean} Whether this reference eventually calls a method on a ref.
*/
const isRefCall = (context, ref) => isEventualCallTo(context, ref, (ref) => isRefCurrent(ref) || isRef(ref));
/**
* @param context {Rule.RuleContext}
* @param {Scope.Reference} ref
* @returns {Rule.Node | undefined} The `VariableDeclarator` node of the `useState` call.
*/
const getUseStateDecl = (context, ref) => {
	var _getUpstreamRefs$find;
	let node = (_getUpstreamRefs$find = getUpstreamRefs(context, ref).find((ref) => isUseState(ref.identifier))) === null || _getUpstreamRefs$find === void 0 ? void 0 : _getUpstreamRefs$find.identifier;
	while (node && node.type !== "VariableDeclarator") node = node.parent;
	return node;
};
/**
* While it *could* be an anti-pattern or unnecessary, effects *are* meant to synchronize systems.
* So we presume that a "subscription effect" is usually valid, or at least may be more readable.
*
* TODO: We might be able to use this more granularly, e.g. ignore state setters inside a subscription effect,
* instead of ignoring the whole effect...? But it'd have to be more complicated, like also ignore the same state setters called in the body.
*
* @param {Rule.Node} node - The `useEffect` `CallExpression` node
* @returns {boolean}
*/
const hasCleanup = (node) => {
	const effectFn = node.arguments[0];
	return (effectFn.type === "ArrowFunctionExpression" || effectFn.type === "FunctionExpression") && effectFn.body.type === "BlockStatement" && effectFn.body.body.some((stmt) => stmt.type === "ReturnStatement" && stmt.argument);
};
//#endregion
//#region src/rules/no-adjust-state-on-prop-change.js
/**
* @type {import("eslint").Rule.RuleModule}
*/
var no_adjust_state_on_prop_change_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow adjusting state in an effect when a prop changes.",
			url: "https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes"
		},
		schema: [],
		messages: { avoidAdjustingStateWhenAPropChanges: "Avoid adjusting state when a prop changes. Instead, adjust the state directly during render, or refactor your state to avoid this need entirely." }
	},
	create: (context) => ({ CallExpression: (node) => {
		if (!isUseEffect(node)) return;
		const effectFnRefs = getEffectFnRefs(context, node);
		const depsRefs = getEffectDepsRefs(context, node);
		if (!effectFnRefs || !depsRefs) return;
		const isSomeDepsProps = depsRefs.flatMap((ref) => getUpstreamRefs(context, ref)).some((ref) => isProp(context, ref));
		effectFnRefs.filter((ref) => isStateSetterCall(context, ref)).filter((ref) => isSynchronous(ref.identifier, getEffectFn(node))).forEach((ref) => {
			const callExpr = getCallExpr(ref);
			const isSomeArgsProps = getArgsUpstreamRefs(context, ref).some((ref) => isProp(context, ref));
			if (isSomeDepsProps && !isSomeArgsProps) context.report({
				node: callExpr,
				messageId: "avoidAdjustingStateWhenAPropChanges"
			});
		});
	} })
};
//#endregion
//#region src/rules/no-reset-all-state-on-prop-change.js
/**
* @type {import("eslint").Rule.RuleModule}
*/
var no_reset_all_state_on_prop_change_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow resetting all state in an effect when a prop changes.",
			url: "https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes"
		},
		schema: [],
		messages: { avoidResettingAllStateWhenAPropChanges: "Avoid resetting all state when a prop changes. If \"{{prop}}\" is a key, pass it as `key` instead so React will reset the component." }
	},
	create: (context) => ({ CallExpression: (node) => {
		if (!isUseEffect(node)) return;
		const effectFnRefs = getEffectFnRefs(context, node);
		const depsRefs = getEffectDepsRefs(context, node);
		if (!effectFnRefs || !depsRefs) return;
		const containingNode = findContainingNode(context, node);
		if (containingNode && isCustomHook(containingNode)) return;
		const propUsedToResetAllState = findPropUsedToResetAllState(context, effectFnRefs, depsRefs, node);
		if (propUsedToResetAllState) context.report({
			node,
			messageId: "avoidResettingAllStateWhenAPropChanges",
			data: { prop: propUsedToResetAllState.identifier.name }
		});
	} })
};
const findPropUsedToResetAllState = (context, effectFnRefs, depsRefs, useEffectNode) => {
	const stateSetterRefs = effectFnRefs.filter((ref) => isStateSetterCall(context, ref));
	return stateSetterRefs.length > 0 && stateSetterRefs.every((ref) => isSetStateToInitialValue(context, ref)) && stateSetterRefs.length === countUseStates(context, findContainingNode(context, useEffectNode)) ? depsRefs.flatMap((ref) => getUpstreamRefs(context, ref)).find((ref) => isProp(context, ref)) : void 0;
};
const isSetStateToInitialValue = (context, setterRef) => {
	const setStateToValue = getCallExpr(setterRef).arguments[0];
	const stateInitialValue = getUseStateDecl(context, setterRef).init.arguments[0];
	const isUndefined = (node) => node === void 0 || node.name === "undefined";
	if (isUndefined(setStateToValue) && isUndefined(stateInitialValue)) return true;
	if (setStateToValue === null && stateInitialValue === null) return true;
	else if (setStateToValue && !stateInitialValue || !setStateToValue && stateInitialValue) return false;
	return context.sourceCode.getText(setStateToValue) === context.sourceCode.getText(stateInitialValue);
};
const countUseStates = (context, componentNode) => {
	if (!componentNode) return 0;
	return getDownstreamRefs(context, componentNode).filter((ref) => isState(ref)).length;
};
const findContainingNode = (context, node) => {
	if (!node) return;
	else if (isReactFunctionalComponent(node) || isReactFunctionalHOC(context, node) || isCustomHook(node)) return node;
	else return findContainingNode(context, node.parent);
};
//#endregion
//#region src/rules/no-event-handler.js
/**
* @type {import("eslint").Rule.RuleModule}
*/
var no_event_handler_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow using state and an effect as an event handler.",
			url: "https://react.dev/learn/you-might-not-need-an-effect#sharing-logic-between-event-handlers"
		},
		schema: [],
		messages: { avoidEventHandler: "Avoid using state and effects as an event handler. Instead, call the event handling code directly when the event occurs." }
	},
	create: (context) => ({ CallExpression: (node) => {
		if (!isUseEffect(node) || hasCleanup(node)) return;
		const effectFnRefs = getEffectFnRefs(context, node);
		const depsRefs = getEffectDepsRefs(context, node);
		if (!effectFnRefs || !depsRefs) return;
		findDownstreamNodes(context, node, "IfStatement").filter((ifNode) => !ifNode.alternate).filter((ifNode) => getDownstreamRefs(context, ifNode.test).flatMap((ref) => getUpstreamRefs(context, ref)).some((ref) => isState(ref))).forEach((ifNode) => {
			context.report({
				node: ifNode.test,
				messageId: "avoidEventHandler"
			});
		});
	} })
};
//#endregion
//#region src/rules/no-pass-live-state-to-parent.js
/**
* @type {import("eslint").Rule.RuleModule}
*/
var no_pass_live_state_to_parent_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow passing live state to parent components in an effect.",
			url: "https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes"
		},
		schema: [],
		messages: { avoidPassingLiveStateToParent: "Avoid passing live state to parents in an effect. Instead, lift the state to the parent and pass it down to the child as a prop." }
	},
	create: (context) => ({ CallExpression: (node) => {
		if (!isUseEffect(node)) return;
		const effectFnRefs = getEffectFnRefs(context, node);
		const depsRefs = getEffectDepsRefs(context, node);
		if (!effectFnRefs || !depsRefs) return;
		effectFnRefs.filter((ref) => isPropCall(context, ref)).filter((ref) => isSynchronous(ref.identifier, getEffectFn(node))).forEach((ref) => {
			const callExpr = getCallExpr(ref);
			if (getArgsUpstreamRefs(context, ref).some((ref) => isState(ref))) context.report({
				node: callExpr,
				messageId: "avoidPassingLiveStateToParent"
			});
		});
	} })
};
//#endregion
//#region src/rules/no-initialize-state.js
/**
* @type {import("eslint").Rule.RuleModule}
*/
var no_initialize_state_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow initializing state in an effect.",
			url: "https://tkdodo.eu/blog/avoiding-hydration-mismatches-with-use-sync-external-store"
		},
		schema: [],
		messages: { avoidInitializingState: "Avoid initializing state in an effect. Instead, initialize \"{{state}}\"'s `useState()` with \"{{arguments}}\". For SSR hydration, prefer `useSyncExternalStore()`." }
	},
	create: (context) => ({ CallExpression: (node) => {
		if (!isUseEffect(node)) return;
		const effectFnRefs = getEffectFnRefs(context, node);
		const depsRefs = getEffectDepsRefs(context, node);
		if (!effectFnRefs || !depsRefs) return;
		if (depsRefs.length > 0) return;
		effectFnRefs.filter((ref) => isStateSetterCall(context, ref)).filter((ref) => isSynchronous(ref.identifier, getEffectFn(node))).forEach((ref) => {
			var _ref;
			const callExpr = getCallExpr(ref);
			const useStateNode = getUseStateDecl(context, ref);
			const stateName = (_ref = useStateNode.id.elements[0] ?? useStateNode.id.elements[1]) === null || _ref === void 0 ? void 0 : _ref.name;
			const argumentText = callExpr.arguments[0] ? context.sourceCode.getText(callExpr.arguments[0]) : "undefined";
			context.report({
				node: getCallExpr(ref),
				messageId: "avoidInitializingState",
				data: {
					state: stateName,
					arguments: argumentText
				}
			});
		});
	} })
};
//#endregion
//#region src/rules/no-chain-state-updates.js
/**
* @type {import("eslint").Rule.RuleModule}
*/
var no_chain_state_updates_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow chaining state changes in an effect.",
			url: "https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations"
		},
		schema: [],
		messages: { avoidChainingStateUpdates: "Avoid chaining state changes. When possible, update all relevant state simultaneously." }
	},
	create: (context) => ({ CallExpression: (node) => {
		if (!isUseEffect(node) || hasCleanup(node)) return;
		const effectFnRefs = getEffectFnRefs(context, node);
		const depsRefs = getEffectDepsRefs(context, node);
		if (!effectFnRefs || !depsRefs) return;
		const isSomeDepsState = depsRefs.flatMap((ref) => getUpstreamRefs(context, ref)).some((ref) => isState(ref));
		effectFnRefs.filter((ref) => isStateSetterCall(context, ref)).filter((ref) => isSynchronous(ref.identifier, getEffectFn(node))).forEach((ref) => {
			const callExpr = getCallExpr(ref);
			const isSomeArgsState = getArgsUpstreamRefs(context, ref).some((ref) => isState(ref));
			if (isSomeDepsState && !isSomeArgsState) context.report({
				node: callExpr,
				messageId: "avoidChainingStateUpdates"
			});
		});
	} })
};
//#endregion
//#region src/rules/no-derived-state.js
/**
* @type {import('eslint').Rule.RuleModule}
*/
var no_derived_state_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow storing derived state in an effect.",
			url: "https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state"
		},
		schema: [],
		messages: {
			avoidDerivedState: "Avoid storing derived state. Compute \"{{state}}\" directly during render, optionally with `useMemo` if it's expensive.",
			avoidSingleSetter: "Avoid storing derived state. \"{{state}}\" is only set here, and thus could be computed directly during render."
		}
	},
	create: (context) => ({ CallExpression: (node) => {
		if (!isUseEffect(node) || hasCleanup(node)) return;
		const effectFnRefs = getEffectFnRefs(context, node);
		const depsRefs = getEffectDepsRefs(context, node);
		if (!effectFnRefs || !depsRefs) return;
		effectFnRefs.filter((ref) => isStateSetterCall(context, ref)).filter((ref) => isSynchronous(ref.identifier, getEffectFn(node))).forEach((ref) => {
			var _ref;
			const callExpr = getCallExpr(ref);
			const useStateNode = getUseStateDecl(context, ref);
			const stateName = (_ref = (useStateNode === null || useStateNode === void 0 ? void 0 : useStateNode.id.elements[0]) ?? (useStateNode === null || useStateNode === void 0 ? void 0 : useStateNode.id.elements[1])) === null || _ref === void 0 ? void 0 : _ref.name;
			const argsUpstreamRefs = getArgsUpstreamRefs(context, ref);
			const depsUpstreamRefs = depsRefs.flatMap((ref) => getUpstreamRefs(context, ref));
			const isSomeArgsInternal = argsUpstreamRefs.some((ref) => isState(ref) || isProp(context, ref));
			const isValueAlwaysInSync = argsUpstreamRefs.length && argsUpstreamRefs.every((argRef) => depsUpstreamRefs.some((depRef) => argRef.resolved == depRef.resolved)) && countCalls(ref) === 1;
			if (isSomeArgsInternal) context.report({
				node: callExpr,
				messageId: "avoidDerivedState",
				data: { state: stateName }
			});
			else if (isValueAlwaysInSync) context.report({
				node: callExpr,
				messageId: "avoidSingleSetter",
				data: { state: stateName }
			});
		});
	} })
};
const countCalls = (ref) => ref.resolved.references.filter((ref) => ref.identifier.parent.type === "CallExpression").length;
//#endregion
//#region src/rules/no-pass-data-to-parent.js
/**
* @type {import("eslint").Rule.RuleModule}
*/
var no_pass_data_to_parent_default = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow passing data to parents in an effect.",
			url: "https://react.dev/learn/you-might-not-need-an-effect#passing-data-to-the-parent"
		},
		schema: [],
		messages: { avoidPassingDataToParent: "Avoid passing data to parents in an effect. Instead, let the parent fetch the data itself and pass it down to the child as a prop." }
	},
	create: (context) => ({ CallExpression: (node) => {
		if (!isUseEffect(node) || hasCleanup(node)) return;
		const effectFnRefs = getEffectFnRefs(context, node);
		const depsRefs = getEffectDepsRefs(context, node);
		if (!effectFnRefs || !depsRefs) return;
		effectFnRefs.filter((ref) => isPropCall(context, ref)).filter((ref) => !isRefCall(context, ref)).filter((ref) => isSynchronous(ref.identifier, getEffectFn(node))).forEach((ref) => {
			const callExpr = getCallExpr(ref);
			if (getArgsUpstreamRefs(context, ref).filter((ref) => getUpstreamRefs(context, ref).length === 1).some((ref) => !isUseState(ref.identifier) && !isProp(context, ref) && !isUseRef(ref.identifier) && !isRefCurrent(ref) && !isConstant(ref))) context.report({
				node: callExpr,
				messageId: "avoidPassingDataToParent"
			});
		});
	} })
};
//#endregion
//#region src/index.ts
const plugin = {
	meta: { name: "react-you-might-not-need-an-effect" },
	configs: {},
	rules: {
		"no-derived-state": no_derived_state_default,
		"no-chain-state-updates": no_chain_state_updates_default,
		"no-event-handler": no_event_handler_default,
		"no-adjust-state-on-prop-change": no_adjust_state_on_prop_change_default,
		"no-reset-all-state-on-prop-change": no_reset_all_state_on_prop_change_default,
		"no-pass-live-state-to-parent": no_pass_live_state_to_parent_default,
		"no-pass-data-to-parent": no_pass_data_to_parent_default,
		"no-initialize-state": no_initialize_state_default
	}
};

//#endregion
export { plugin as default };

//# sourceMappingURL=index.mjs.map