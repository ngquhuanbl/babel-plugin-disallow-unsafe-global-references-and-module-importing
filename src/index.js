// const forbiddenGlobalNodePattern = /(?:window|global(?:This)|eval|Function)$/;
const defaultDisallowedGlobalReferences = ['window', 'global', 'globalThis', 'eval', 'Function'];
const defaultAllowedModuleSources = ['zalo/*'];
const messages = {
  noReferenceToForbiddenNode: "Disallow references to {{name}}.",
  onlyImportWhitelistedModule: "'{{name}}' is not a whitelisted module and cannot be imported."
};

/**
 * Fill the template string with the given placeholder value.
 * Template string can contain placeholders. These are indicated by the two nested curly braces ({{placeholderValue}}).
 * @param {string} templateString The template string
 * @param {object} placeholderValuesObject The object containing placeholder values
 * @returns {string} The resulted string after embedding placeholder values into the template string
 */
function fillTemplateString(templateString, placeholderValuesObject) {
  let res = templateString;
  Object.entries(placeholderValuesObject).forEach(function ([key, value]) {
    res = res.replace(`{{${key}}}`, value);
  });
  console.log(res);
  return res;
}

/**
 * Check if the given source value matches the wildcard module pattern
 * @param {string} sourceValue The source value
 * @returns {boolean} Whether or not the given source value matches the wildcard module pattern
 */
function isWildcardModuleSource(sourceValue) {
  return /^[\d\w]+(\/(?:[\d\w]+|\*))*$/.test(sourceValue);
}

/**
 * Check if the given source value is allowed according to the given list of allowed module sources
 * @param {string} sourceValue The source value
 * @param {Array.<string>} allowedModuleSourceList The list of allowed module sources
 * @returns {boolean} Whether or not the given source value is allowed according to the given list of allowed module sources
 */
function isAllowedModuleSource(sourceValue, allowedModuleSourceList) {
  let isValidImport = false;

  allowedModuleSourceList.forEach(function(allowedModule) {
    let regexString = `^${allowedModule}$`;
    if (isWildcardModuleSource(allowedModule)) {
      regexString = regexString.replace(/\/\*\//g,'\/[\\d\\w]+\/').replace(/\/\*\$/g,'(\/[\\d\\w]+)*$');
    }
    if (new RegExp(regexString).test(sourceValue)) isValidImport = true;
  });

  return isValidImport
}

export default function () {
  return {
    name: "zalo-pc-no-unsafe-access",
    visitor: {
      // Rule 1: Disallow references to the defined subjects
      Program(path, state) {
        const { opts } = state;
        const additionalDisallowedGlobalReferences = (opts.disallowedGlobalReferences || []).filter(function(item) {
          return typeof item === 'string'
        });
        const disallowedGlobalReferences = [...defaultDisallowedGlobalReferences, ...additionalDisallowedGlobalReferences];

        const globalScope = path.scope;
        // Get all global identifier nodes
        const { globals } = globalScope;

        // Filter the forbidden global nodes
        const forbiddenGlobalReferences = Object.values(globals).filter(function (
          node
        ) {
          return disallowedGlobalReferences.includes(node.name);
        });

        // Throw error for any found forbidden global nodes
        forbiddenGlobalReferences.forEach(function (node) {
          const errorMessage = fillTemplateString(messages.noReferenceToForbiddenNode, {
            name: node.name
          });
          throw path.hub.file.buildCodeFrameError(node, errorMessage);
        });
      },
      // Rule 2: Only allow to import the whitelisted modules
      // Static import
      ImportDeclaration(path, state) {
        const { opts } = state;
        const additionalAllowedModuleSources = (opts.allowedModuleSources || []).filter(function(item) {
          return typeof item === 'string'
        });
        const allowedModuleSources = [...defaultAllowedModuleSources, ...additionalAllowedModuleSources];

        const { node } = path;
        const sourceValue = node.source.value;

        if (!isAllowedModuleSource(sourceValue, allowedModuleSources)) {
          const errorMessage = fillTemplateString(messages.onlyImportWhitelistedModule, {
            name: sourceValue
          });
          throw path.buildCodeFrameError(errorMessage);
        }
      },
      // Dynamic import
      CallExpression(path, state) {
        const { opts } = state;
        const additionalAllowedModuleSources = (opts.allowedModuleSources || []).filter(function(item) {
          return typeof item === 'string'
        });
        const allowedModuleSources = [...defaultAllowedModuleSources, ...additionalAllowedModuleSources];

        const { node } = path;
        const calleeType = node.callee.type;
        if (calleeType !== "Import") return;

        const sourceValue = node.arguments[0].value;

        if (!isAllowedModuleSource(sourceValue, allowedModuleSources)) {
          const errorMessage = fillTemplateString(messages.onlyImportWhitelistedModule, {
            name: sourceValue
          });
          throw path.buildCodeFrameError(errorMessage);
        }
      }
    }
  };
}
