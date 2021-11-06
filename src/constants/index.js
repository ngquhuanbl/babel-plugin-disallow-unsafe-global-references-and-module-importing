export const DEFAULT_GLOBAL_IDENTIFIER_BLACKLIST = [
  "window",
  "global",
  "globalThis",
  "eval",
  "Function",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "document.cookie",
];

export const DEFAULT_MODULE_SOURCE_WHITELIST = ["zalo"];

export const ERROR_MESSAGES = {
  noReferenceToBlacklistedGlobalIdentifiers: "Disallow references to {{name}}.",
  onlyImportWhitelistedModules:
    "'{{name}}' is not a whitelisted module and cannot be imported.",
};