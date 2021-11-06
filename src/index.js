import {
  DEFAULT_GLOBAL_IDENTIFIER_BLACKLIST,
  DEFAULT_MODULE_SOURCE_WHITELIST,
  ERROR_MESSAGES,
} from "./constants";
import {
  fillTemplateString,
  isValidIdentifier,
  isMemberExpressionIdentifier,
  isValidModuleSource,
  isWhitelistedModuleSource,
  looksLike,
} from "./utils";

/**
 * Optimization nested visitor
 * @see [Babel Plugin Handbook] {@link https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-optimizing-nested-visitors}
 */
const ruleOneNestedVisitor = {
  ReferencedIdentifier(memberExpressionPath) {
    const { globalIdentifierNode, identifierArray, path } = this;
    let currentPath = memberExpressionPath;

    // Check if the current node match the root identifier location
    if (looksLike(globalIdentifierNode.loc.start, currentPath.node.loc.start)) {
      let identifierIndex = 1; // The smallest index of a branch identifier is 1
      while (identifierIndex < identifierArray.length) {
        currentPath = currentPath.parentPath;
        if (!currentPath || currentPath.node.type !== "MemberExpression") break;

        const property = currentPath.node.property;
        const { name } = property;
        if (name !== identifierArray[identifierIndex]) break;
        identifierIndex += 1;
      }

      if (identifierIndex === identifierArray.length) {
        const errorMessage = fillTemplateString(
          ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
          {
            name: identifierArray.join("."),
          }
        );
        throw path.hub.file.buildCodeFrameError(
          currentPath.node.property,
          errorMessage
        );
      }
    }
  },
};

export default function () {
  return {
    name: "disallow-unsafe-global-references-and-module-importing",
    visitor: {
      /**
       * RULE 1: Disallow references to the blacklisted global identifiers
       */
      Program(path, state) {
        const { opts } = state;

        /**
         * additionalGlobalIdentifierBlacklist: An array of additional blacklisted global identifiers
         * specified via the plugin option - globalIndentifierBlacklist
         */
        const additionalGlobalIdentifierBlacklist = (
          opts.globalIndentifierBlacklist || []
        ).filter(function (identifier) {
          // Filter out invalid identifier values
          return (
            typeof identifier === "string" && isValidIdentifier(identifier)
          );
        });

        const globalIndentifierBlacklist = [
          ...DEFAULT_GLOBAL_IDENTIFIER_BLACKLIST,
          ...additionalGlobalIdentifierBlacklist,
        ];

        const globalScope = path.scope;

        /**
         * globals: An object of all global-scoped identifier
         * E.g. globals = { window: {...}, foo: {...} }
         */
        const { globals } = globalScope;

        /**
         * The plugin accepts 2 types of global indentifier:
         * - Single identifier (e.g. 'foo', 'bar', etc.)
         * - Member-expression identifier: A group of identifiers separated by '.'
         * (e.g. 'foo.bar', 'ab.cd.ef', etc.)
         * In AST, an identifier is always a single identifier (*),
         * hence the 'globals' object includes all global-scoped single indentifiers
         * existed in the examined code.
         * -> Single identifier (Solved ✅)
         * About the member-expression identifiers, we have to manually check
         * their presences due to (*).
         * A member-expression identifier can be divided into multiple single identifiers (which are originally separated by '.')
         * From left to right, the first single identifier will be called THE ROOT IDENTIFIER,
         * the other will be called THE BRANCH IDENTIFERS
         * (e.g. 'foo.bar.baz' has THE ROOT IDENTIFIER as 'foo')
         * This ROOT IDENTIFIER appears in the 'globals' object,
         * which will be our starting point to verify the presence of the BRANCH INDENTIFIERS.
         * While traversing the AST tree,
         * after reaching the ROOT IDENTIFIER (which we know its location by using 'globals' object),
         * we will make use of the relationship between the 'object' and 'property' of a MemberExpression AST node
         * to check if the BRANCH INDENTIFIERS matches.
         * -> Member-expression identifiers (Solved ✅)
         */

        // SINGLE GLOBAL INDETIFIERS (e.g. 'foo', 'bar', etc.)
        const singleGlobalIdentifierBlacklist =
          globalIndentifierBlacklist.filter(function (identifier) {
            return !isMemberExpressionIdentifier(identifier);
          });

        if (singleGlobalIdentifierBlacklist.length !== 0) {
          const existedSingleGlobalIdentifiersInBlacklist =
            singleGlobalIdentifierBlacklist
              .filter(function (identifier) {
                return identifier in globals;
              })
              .map(function (identifier) {
                return globals[identifier];
              });

          // Throw error for any found blacklisted global identifiers
          existedSingleGlobalIdentifiersInBlacklist.forEach(function (node) {
            const errorMessage = fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: node.name,
              }
            );
            throw path.hub.file.buildCodeFrameError(node, errorMessage);
          });
        }

        // MEMBER EXPRESSION IDENTIFIERS (e.g. 'foo.bar', 'ab.cd.ef', etc.)
        const memberExpressionGlobalIndentifierBlacklist =
          globalIndentifierBlacklist
            .filter(function (identifier) {
              return isMemberExpressionIdentifier(identifier);
            })
            .map(function (identifier) {
              // Transform the member expression identifier into an array of identifiers : [rootIdentifier, ...branchIdentifiers]
              return identifier.split(".");
            });

        if (memberExpressionGlobalIndentifierBlacklist.length !== 0) {
          const existedMemberExpressionGlobalIdentifiersInBlacklist =
            memberExpressionGlobalIndentifierBlacklist.filter(function (
              identifier
            ) {
              const rootIdentifier = identifier[0];
              return rootIdentifier in globals;
            });

          existedMemberExpressionGlobalIdentifiersInBlacklist.forEach(function (
            identifierArray // [rootIdentifier, ...branchIdentifiers]
          ) {
            const rootIdentifier = identifierArray[0];
            const globalIdentifierNode = globals[rootIdentifier];

            path.traverse(ruleOneNestedVisitor, {
              globalIdentifierNode,
              identifierArray,
              path,
            });
          });
        }
      },
      /**
       * RULE 2: Only allow to import the whitelisted modules
       * There are two types of import in JS,
       * and we will handle them separately.
       */
      // Static import (ES Modules)
      ImportDeclaration(path, state) {
        const { opts } = state;
        const additionalModuleSourceWhitelist = (
          opts.moduleSourceWhitelist || []
        ).filter(function (moduleSource) {
          return (
            typeof moduleSource === "string" &&
            isValidModuleSource(moduleSource)
          );
        });

        const moduleSourceWhitelist = [
          ...DEFAULT_MODULE_SOURCE_WHITELIST,
          ...additionalModuleSourceWhitelist,
        ];

        const { node } = path;
        const sourceValue = node.source.value;

        if (!isWhitelistedModuleSource(sourceValue, moduleSourceWhitelist)) {
          const errorMessage = fillTemplateString(
            ERROR_MESSAGES.onlyImportWhitelistedModules,
            {
              name: sourceValue,
            }
          );
          throw path.buildCodeFrameError(errorMessage);
        }
      },
      // Dynamic import (ES Modules) + CommonJS
      CallExpression(path, state) {
        const { opts } = state;
        const additionalModuleSourceWhitelist = (
          opts.moduleSourceWhitelist || []
        ).filter(function (moduleSource) {
          return (
            typeof moduleSource === "string" &&
            isValidModuleSource(moduleSource)
          );
        });

        const moduleSourceWhitelist = [
          ...DEFAULT_MODULE_SOURCE_WHITELIST,
          ...additionalModuleSourceWhitelist,
        ];

        const { node } = path;
        const calleeType = node.callee.type;
        const calleeName = node.callee.name;

        if (
          calleeType === "Import" ||
          (calleeType === "Identifier" && calleeName === "require")
        ) {
          const sourceValue = node.arguments[0].value;

          if (!isWhitelistedModuleSource(sourceValue, moduleSourceWhitelist)) {
            const errorMessage = fillTemplateString(
              ERROR_MESSAGES.onlyImportWhitelistedModules,
              {
                name: sourceValue,
              }
            );
            throw path.buildCodeFrameError(errorMessage);
          }
        }
      },
    },
  };
}
