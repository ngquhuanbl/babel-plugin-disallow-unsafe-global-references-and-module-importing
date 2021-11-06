import pluginTester from "babel-plugin-tester/pure";
import disallowUnsafeGlobalReferencesAndModuleImportingPlugin from '../index';
import {
  fillTemplateString,
} from "../utils";
import { ERROR_MESSAGES } from "../constants";

pluginTester({
  plugin: disallowUnsafeGlobalReferencesAndModuleImportingPlugin,
  pluginName: "disallow unsafe global references and module importing",
  pluginOptions: {
    globalIndentifierBlacklist: ["setTimeout", '^invalid?identifier'],
    moduleSourceWhitelist: ["lodash", 'invalid.module'],
  },
  tests: [
    // Valid
    {
      title:
        "does nothing to code that only references to local variable defined in global scope",
      code: `
        const window = {};
        window.foo = 1;
      `,
    },
    {
      title:
        "does nothing to code that only references to local variable in nested function scope",
      code: `
        function foo() {
          let global = "This is a local-scoped variable named 'global'";\n
          function bar() {
            console.log(global.length);
          }
        }
      `,
    },
    {
      title:
        "does nothing to code that only references to local variable in nested block scope",
      code: `
        {
          let globalThis = {
            foo: "This is a local-scoped variable named 'globalThis'"
          };
          {
            delete globalThis.foo;
          }
        }
      `,
    },
    {
      title: "does nothing to code that only references to local parameter",
      code: `
        function foo(window) {
          console.log(window); // here, 'window' is a local variable
        }
      `,
    },
    {
      title:
        "does nothing to code that only references to non-blacklisted global identifier",
      code: `
        const map = new Map(); // Map is a non-blacklisted identifier referencing to a global-scoped class\n
        console.log('Hello world!'); // console is a non-blacklisted identifier referencing to a global-scoped object
      `,
    },
    {
      title:
        "does nothing to code that imports local modules (via relative paths) - ES Modules",
      code: `
        import foo from './foo';
        import('./bar').then();
      `,
    },
    {
      title:
        "does nothing to code that imports local modules (via relative paths) - CommonJS",
      code: `
        const foo = require('./foo');
      `,
    },
    {
      title:
        "does nothing to code that imports whitelisted modules (specified by default) - ES Modules",
      code: `
        import zalo from 'zalo';
        import zaloFoo from 'zalo/foo';
        import('zalo/bar').then();
      `,
    },
    {
      title:
        "does nothing to code that imports whitelisted modules (specified by default) - CommonJS",
      code: `
        const zalo = require('zalo');\n
        const zaloFoo = require('zalo/foo');
      `,
    },
    {
      title:
        "does nothing to code that imports whitelisted modules (specified via plugin options) - ES Modules",
      code: `
        import lodash from 'lodash';
        import lodashFoo from 'lodash/foo';
        import('lodash/bar').then();
      `,
    },
    {
      title:
        "does nothing to code that imports whitelisted modules (specified via plugin options) - CommonJS",
      code: `
        const lodash = require('lodash');\n
        const lodashFoo = require('lodash/foo');
      `,
    },
    // Invalid
    {
      title:
        "raises an error if 'window' are referenced which is a blacklisted global identifier",
      code: `
        const foo = window;
      `,
      error: (err) => {
        //console.log(err.message)
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "window",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'global' are referenced which is a blacklisted global identifier",
      code: `
        global.foo = '123';
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "global",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'globalThis' are referenced which is a blacklisted global identifier",
      code: `
        delete globalThis.setTimeout;
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "globalThis",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'eval' are referenced which is a blacklisted global identifier",
      code: `
        eval('window.foo = "Malicious string!"');
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "eval",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'Function' are referenced which is a blacklisted global identifier",
      code: `
        const foo = new Function('window.foo="Malicious string!";');
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "Function",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'localStorage' are referenced which is a blacklisted global identifier",
      code: `
        localStorage.clear();
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "localStorage",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'sessionStorage' are referenced which is a blacklisted global identifier",
      code: `
        sessionStorage.set('foo', 'bar');
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "sessionStorage",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'indexedDB' are referenced which is a blacklisted global identifier",
      code: `
        let openRequest = indexedDB.open('Illegal DB', 1);
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "indexedDB",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'document.cookie' are referenced which is a blacklisted global identifier",
      code: `
        document.cookie = "foo=bar";
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "document.cookie",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title:
        "raises an error if 'setTimeout' are referenced which is a blacklisted global identifier (specified via plugin options)",
      code: `
        setTimeout(function() { alert('Hacked!'); }, 1000);
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(
              ERROR_MESSAGES.noReferenceToBlacklistedGlobalIdentifiers,
              {
                name: "setTimeout",
              }
            )
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title: "raises an error if non-whitelisted modules are imported - Static import - ES Modules",
      code: `
        import foo from 'foo';
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(ERROR_MESSAGES.onlyImportWhitelistedModules, {
              name: "foo",
            })
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title: "raises an error if non-whitelisted modules are imported - Static import - CommonJS",
      code: `
        const foo = require('foo');
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(ERROR_MESSAGES.onlyImportWhitelistedModules, {
              name: "foo",
            })
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
    {
      title: "raises an error if non-whitelisted modules are imported - Dynamic import",
      code: `
        import('foo').then();
      `,
      error: (err) => {
        if (
          err instanceof SyntaxError &&
          err.message.includes(
            fillTemplateString(ERROR_MESSAGES.onlyImportWhitelistedModules, {
              name: "foo",
            })
          )
        ) {
          return true; // test will fail if function doesn't return `true`
        }
      },
    },
  ],
});
