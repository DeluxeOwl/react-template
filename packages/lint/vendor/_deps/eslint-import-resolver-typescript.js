import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import {
  __export
} from "./chunk-WPQ5MXLX.js";

// node_modules/eslint-import-resolver-typescript/lib/index.js
var lib_exports = {};
__export(lib_exports, {
  DEFAULT_CONFIGS: () => DEFAULT_CONFIGS,
  DEFAULT_IGNORE: () => DEFAULT_IGNORE,
  DEFAULT_JSCONFIG: () => DEFAULT_JSCONFIG,
  DEFAULT_TRY_PATHS: () => DEFAULT_TRY_PATHS,
  DEFAULT_TSCONFIG: () => DEFAULT_TSCONFIG,
  IMPORT_RESOLVER_NAME: () => IMPORT_RESOLVER_NAME,
  JS_EXT_PATTERN: () => JS_EXT_PATTERN,
  MATCH_ALL: () => MATCH_ALL,
  TSCONFIG_NOT_FOUND_REGEXP: () => TSCONFIG_NOT_FOUND_REGEXP,
  createTypeScriptImportResolver: () => createTypeScriptImportResolver,
  defaultConditionNames: () => defaultConditionNames,
  defaultConfigFile: () => defaultConfigFile,
  defaultExtensionAlias: () => defaultExtensionAlias,
  defaultExtensions: () => defaultExtensions,
  defaultMainFields: () => defaultMainFields,
  interfaceVersion: () => interfaceVersion,
  mangleScopedPackage: () => mangleScopedPackage,
  normalizeOptions: () => normalizeOptions,
  removeQuerystring: () => removeQuerystring,
  resolve: () => resolve,
  sortProjectsByAffinity: () => sortProjectsByAffinity,
  toGlobPath: () => toGlobPath,
  toNativePath: () => toNativePath,
  tryFile: () => tryFile
});
import { isBuiltin } from "node:module";
import path2 from "node:path";
import { useRuleContext } from "eslint-import-context";
import { createFilesMatcher, parseTsconfig } from "get-tsconfig";
import { isBunBuiltin } from "is-bun-module";
import { stableHash as stableHash2 } from "stable-hash-x";
import { ResolverFactory } from "unrs-resolver";

// node_modules/eslint-import-resolver-typescript/lib/constants.js
var defaultConditionNames = [
  "types",
  "import",
  "esm2020",
  "es2020",
  "es2015",
  "require",
  "node",
  "node-addons",
  "browser",
  "default"
];
var defaultExtensions = [
  ".ts",
  ".tsx",
  ".d.ts",
  ".js",
  ".jsx",
  ".json",
  ".node"
];
var defaultExtensionAlias = {
  ".js": [
    ".ts",
    ".tsx",
    ".d.ts",
    ".js"
  ],
  ".ts": [".ts", ".d.ts", ".js"],
  ".jsx": [".tsx", ".d.ts", ".jsx"],
  ".tsx": [
    ".tsx",
    ".d.ts",
    ".jsx",
    ".js"
  ],
  ".cjs": [".cts", ".d.cts", ".cjs"],
  ".cts": [".cts", ".d.cts", ".cjs"],
  ".mjs": [".mts", ".d.mts", ".mjs"],
  ".mts": [".mts", ".d.mts", ".mjs"]
};
var defaultMainFields = [
  "types",
  "typings",
  "fesm2020",
  "fesm2015",
  "esm2020",
  "es2020",
  "module",
  "jsnext:main",
  "main"
];
var JS_EXT_PATTERN = /\.(?:[cm]js|jsx?)$/;
var IMPORT_RESOLVER_NAME = "eslint-import-resolver-typescript";
var interfaceVersion = 2;
var DEFAULT_TSCONFIG = "tsconfig.json";
var DEFAULT_JSCONFIG = "jsconfig.json";
var DEFAULT_CONFIGS = [DEFAULT_TSCONFIG, DEFAULT_JSCONFIG];
var DEFAULT_TRY_PATHS = ["", ...DEFAULT_CONFIGS];
var MATCH_ALL = "**";
var DEFAULT_IGNORE = [MATCH_ALL, "node_modules", MATCH_ALL].join("/");
var TSCONFIG_NOT_FOUND_REGEXP = /^Tsconfig not found\b/;

// node_modules/eslint-import-resolver-typescript/lib/helpers.js
import fs from "node:fs";
import path from "node:path";
function mangleScopedPackage(moduleName) {
  if (moduleName.startsWith("@")) {
    const replaceSlash = moduleName.replace("/", "__");
    if (replaceSlash !== moduleName) {
      return replaceSlash.slice(1);
    }
  }
  return moduleName;
}
function removeQuerystring(id) {
  const querystringIndex = id.lastIndexOf("?");
  if (querystringIndex !== -1) {
    return id.slice(0, querystringIndex);
  }
  return id;
}
var tryFile = (filename, includeDir = false, base = process.cwd()) => {
  if (typeof filename === "string") {
    const filepath = path.resolve(base, filename);
    return fs.existsSync(filepath) && (includeDir || fs.statSync(filepath).isFile()) ? filepath : "";
  }
  for (const file of filename ?? []) {
    const filepath = tryFile(file, includeDir, base);
    if (filepath) {
      return filepath;
    }
  }
  return "";
};
var computeAffinity = (projectDir, targetDir) => {
  const a = projectDir.split(path.sep);
  const b = targetDir.split(path.sep);
  let lca = 0;
  while (lca < a.length && lca < b.length && a[lca] === b[lca]) {
    lca++;
  }
  return a.length - lca + (b.length - lca);
};
var sortProjectsByAffinity = (projects, file) => {
  const fileDir = path.dirname(file);
  return projects.map((project) => ({
    project,
    affinity: computeAffinity(path.dirname(project), fileDir)
  })).sort((a, b) => a.affinity - b.affinity).map((item) => item.project);
};
var toGlobPath = (pathname) => pathname.replaceAll("\\", "/");
var toNativePath = (pathname) => "/" === path.sep ? pathname : pathname.replaceAll("/", "\\");

// node_modules/eslint-import-resolver-typescript/lib/logger.js
import debug from "debug";
var log = debug(IMPORT_RESOLVER_NAME);

// node_modules/eslint-import-resolver-typescript/lib/normalize-options.js
import { stableHash } from "stable-hash-x";
import { globSync, isDynamicPattern } from "tinyglobby";
var defaultConfigFile;
var configFileMapping = /* @__PURE__ */ new Map();
var warned;
function normalizeOptions(options, cwd = process.cwd()) {
  let { project, tsconfig, noWarnOnMultipleProjects } = options ||= {};
  let { configFile, references } = tsconfig ?? {};
  let ensured;
  if (configFile) {
    configFile = tryFile(configFile);
    ensured = true;
  } else if (project) {
    project = Array.isArray(project) ? project : [project];
    log("original projects:", ...project);
    project = project.map(toGlobPath);
    if (project.some((p) => isDynamicPattern(p))) {
      project = globSync(project, {
        absolute: true,
        cwd,
        dot: true,
        expandDirectories: false,
        onlyFiles: false,
        ignore: DEFAULT_IGNORE
      });
    }
    log("resolving projects:", ...project);
    project = project.flatMap((p) => tryFile(DEFAULT_TRY_PATHS, false, toNativePath(p)) || []);
    log("resolved projects:", ...project);
    if (project.length === 1) {
      configFile = project[0];
      ensured = true;
    }
    if (project.length <= 1) {
      project = void 0;
    } else if (!warned && !noWarnOnMultipleProjects) {
      warned = true;
      console.warn("Multiple projects found, consider using a single `tsconfig` with `references` to speed up, or use `noWarnOnMultipleProjects` to suppress this warning");
    }
  }
  if (!project && !configFile) {
    configFile = defaultConfigFile ||= tryFile(DEFAULT_CONFIGS);
    ensured = true;
  }
  const optionsHash = stableHash(options);
  const cacheKey = `${configFile}\0${optionsHash}`;
  if (configFile) {
    const cachedOptions = configFileMapping.get(cacheKey);
    if (cachedOptions) {
      log("using cached options for", configFile, "with options", options);
      return cachedOptions;
    }
  }
  if (!ensured && configFile && configFile !== defaultConfigFile) {
    configFile = tryFile(DEFAULT_TRY_PATHS, false, configFile);
  }
  options = {
    conditionNames: defaultConditionNames,
    extensions: defaultExtensions,
    extensionAlias: defaultExtensionAlias,
    mainFields: defaultMainFields,
    ...options,
    project,
    tsconfig: configFile ? { references: references ?? "auto", configFile } : void 0
  };
  if (configFile) {
    configFileMapping.set(cacheKey, options);
  }
  return options;
}

// node_modules/eslint-import-resolver-typescript/lib/index.js
var resolverCache = /* @__PURE__ */ new Map();
var tsconfigCache = /* @__PURE__ */ new Map();
var matcherCache = /* @__PURE__ */ new Map();
var unrsResolve = (source, file, resolver) => {
  const result = resolver.sync(path2.dirname(file), source);
  if (result.path) {
    return {
      found: true,
      path: result.path
    };
  }
  if (result.error) {
    log("unrs-resolver error:", result.error);
    if (TSCONFIG_NOT_FOUND_REGEXP.test(result.error)) {
      throw new Error(result.error);
    }
  }
  return {
    found: false
  };
};
var isBun = !!process.versions.bun;
var resolve = (source, file, options, resolver) => {
  options ||= {};
  if (isBun || options.bun ? isBunBuiltin(source) : isBuiltin(source)) {
    log("matched core:", source);
    return { found: true, path: null };
  }
  source = removeQuerystring(source);
  if (!resolver) {
    const optionsHash = stableHash2(options);
    const context = useRuleContext();
    const cwd = context?.cwd || process.cwd();
    options = normalizeOptions(options, cwd);
    const cacheKey = `${optionsHash}\0${cwd}`;
    let cached = resolverCache.get(cacheKey);
    if (!cached && !options.project) {
      resolverCache.set(cacheKey, cached = new ResolverFactory(options));
    }
    resolver = cached;
  }
  createResolver: if (!resolver) {
    const projects = sortProjectsByAffinity(options.project, file);
    for (const tsconfigPath of projects) {
      const resolverCached = resolverCache.get(tsconfigPath);
      if (resolverCached) {
        resolver = resolverCached;
        break createResolver;
      }
      let tsconfigCached = tsconfigCache.get(tsconfigPath);
      if (!tsconfigCached) {
        tsconfigCache.set(tsconfigPath, tsconfigCached = parseTsconfig(tsconfigPath));
      }
      let matcherCached = matcherCache.get(tsconfigPath);
      if (!matcherCached) {
        matcherCache.set(tsconfigPath, matcherCached = createFilesMatcher({
          config: tsconfigCached,
          path: tsconfigPath
        }));
      }
      const tsconfig = matcherCached(file);
      if (!tsconfig) {
        log("tsconfig", tsconfigPath, "does not match", file);
        continue;
      }
      log("matched tsconfig at:", tsconfigPath, "for", file);
      options = {
        ...options,
        tsconfig: {
          references: "auto",
          ...options.tsconfig,
          configFile: tsconfigPath
        }
      };
      resolver = new ResolverFactory(options);
      const resolved2 = resolve(source, file, options, resolver);
      if (resolved2.found) {
        resolverCache.set(tsconfigPath, resolver);
        return resolved2;
      }
    }
    log("no tsconfig matched", file, "with", ...projects, ", trying from the the nearest one instead");
    for (const project of projects) {
      const resolved2 = resolve(source, file, { ...options, project }, resolver);
      if (resolved2.found) {
        return resolved2;
      }
    }
  }
  if (!resolver) {
    return {
      found: false
    };
  }
  const resolved = unrsResolve(source, file, resolver);
  const foundPath = resolved.path;
  if ((foundPath && JS_EXT_PATTERN.test(foundPath) || options.alwaysTryTypes !== false && !foundPath) && !/^@types[/\\]/.test(source) && !path2.isAbsolute(source) && !source.startsWith(".")) {
    const definitelyTyped = unrsResolve("@types/" + mangleScopedPackage(source), file, resolver);
    if (definitelyTyped.found) {
      return definitelyTyped;
    }
  }
  if (foundPath) {
    log("matched path:", foundPath);
  } else {
    log("didn't find", source, "with", options.tsconfig?.configFile || options.project);
  }
  return resolved;
};
var createTypeScriptImportResolver = (options) => {
  let cwd = process.cwd();
  options = normalizeOptions(options, cwd);
  let resolver = options.project ? void 0 : new ResolverFactory(options);
  return {
    interfaceVersion: 3,
    name: IMPORT_RESOLVER_NAME,
    resolve(source, file) {
      const context = useRuleContext();
      if (context && cwd !== context.cwd) {
        cwd = context.cwd;
        options = normalizeOptions(options, cwd);
        if (options.project) {
          resolver = resolver ? resolver.cloneWithOptions(options) : new ResolverFactory(options);
        }
      }
      return resolve(source, file, options, resolver);
    }
  };
};

// inlined:eslint-import-resolver-typescript
var { DEFAULT_CONFIGS: DEFAULT_CONFIGS2, DEFAULT_IGNORE: DEFAULT_IGNORE2, DEFAULT_JSCONFIG: DEFAULT_JSCONFIG2, DEFAULT_TRY_PATHS: DEFAULT_TRY_PATHS2, DEFAULT_TSCONFIG: DEFAULT_TSCONFIG2, IMPORT_RESOLVER_NAME: IMPORT_RESOLVER_NAME2, JS_EXT_PATTERN: JS_EXT_PATTERN2, MATCH_ALL: MATCH_ALL2, TSCONFIG_NOT_FOUND_REGEXP: TSCONFIG_NOT_FOUND_REGEXP2, createTypeScriptImportResolver: createTypeScriptImportResolver2, defaultConditionNames: defaultConditionNames2, defaultConfigFile: defaultConfigFile2, defaultExtensionAlias: defaultExtensionAlias2, defaultExtensions: defaultExtensions2, defaultMainFields: defaultMainFields2, interfaceVersion: interfaceVersion2, mangleScopedPackage: mangleScopedPackage2, normalizeOptions: normalizeOptions2, removeQuerystring: removeQuerystring2, resolve: resolve2, sortProjectsByAffinity: sortProjectsByAffinity2, toGlobPath: toGlobPath2, toNativePath: toNativePath2, tryFile: tryFile2 } = lib_exports;
export {
  DEFAULT_CONFIGS2 as DEFAULT_CONFIGS,
  DEFAULT_IGNORE2 as DEFAULT_IGNORE,
  DEFAULT_JSCONFIG2 as DEFAULT_JSCONFIG,
  DEFAULT_TRY_PATHS2 as DEFAULT_TRY_PATHS,
  DEFAULT_TSCONFIG2 as DEFAULT_TSCONFIG,
  IMPORT_RESOLVER_NAME2 as IMPORT_RESOLVER_NAME,
  JS_EXT_PATTERN2 as JS_EXT_PATTERN,
  MATCH_ALL2 as MATCH_ALL,
  TSCONFIG_NOT_FOUND_REGEXP2 as TSCONFIG_NOT_FOUND_REGEXP,
  createTypeScriptImportResolver2 as createTypeScriptImportResolver,
  defaultConditionNames2 as defaultConditionNames,
  defaultConfigFile2 as defaultConfigFile,
  defaultExtensionAlias2 as defaultExtensionAlias,
  defaultExtensions2 as defaultExtensions,
  defaultMainFields2 as defaultMainFields,
  interfaceVersion2 as interfaceVersion,
  mangleScopedPackage2 as mangleScopedPackage,
  normalizeOptions2 as normalizeOptions,
  removeQuerystring2 as removeQuerystring,
  resolve2 as resolve,
  sortProjectsByAffinity2 as sortProjectsByAffinity,
  toGlobPath2 as toGlobPath,
  toNativePath2 as toNativePath,
  tryFile2 as tryFile
};
