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
    - All local modules
    - Additional modules defined in plugin options: `allowedModuleSources`
## Options
### `{ disallowedGlobalReferences: ['Map', 'WeakMap'] }`
- Data type: `Array<string>`
- Usage: Specify addition global subjects which should be prevented from referencing<br>(aka extend the disallowed references list in rule 1).
- Note: Subjects must be global-scoped objects.
### `{ allowedModuleSources: ['lodash', 'moment'] }`
- Data type: `Array<string>`
- Usage: Specify addition whitelisted modules <br>(aka extend the allowed modules list in rule 2)
- Note:
  - All local modules is whitelisted by default. So there's no need to specify them here.
  - Each module is treated as a module category, hence all sub-categories will be whitelisted as a result.<br>E.g. Category: `'lodash'` -> Sub-categories: `'lodash/foo'`, `'lodash/bar'`, etc.