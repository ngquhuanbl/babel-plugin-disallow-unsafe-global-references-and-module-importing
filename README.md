<div align="center">
<h1>babel-plugin-disallow-unsafe-global-references-and-module-importing 🧪</h1>
<p>Allows you to check if your code contains unsafe global references and unsafe module importing</p>
</div>

---

## Rule
1. Disallow references to the below subjects:
    - `window`
    - `global`
    - `globalThis`
    - `eval`
    - `Function`
    - Additional subjects defined in plugin options: `disallowedGlobalReferences`
2. Only allow to import whitelisted modules.<br>The whitelisted module list:
    - Modules of the `zalo` category<br>E.g. `import foo from 'zalo/foo'`
    - Local modules
    - Additional modules defined in plugin options: `allowedModuleSources`
## Options
### `{ disallowedGlobalReferences: ['foo'] }`
- Data type: `Array<string>`
- Usage: Specify addition global subjects which should be prevented from referencing<br>(aka extend the disallowed references list in rule 1).
- Note: Subjects must be defined in global scope.
### `{ allowedModuleSources: ['foo/*', 'lodash'] }`
- Data type: `Array<string>`
- Usage: Specify addition whitelisted modules <br>(aka extend the allowed modules list in rule 2)
- Note: Use wildcard syntax to specify a module category.