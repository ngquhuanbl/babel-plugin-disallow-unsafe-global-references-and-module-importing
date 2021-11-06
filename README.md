<div align="center">
<h1>babel-plugin-disallow-unsafe-global-references-and-module-importing 🧪</h1>
<p>Allows you to check if your code contains unsafe global references and unsafe module importing</p>
</div>

---

## Rule
1. **THE GLOBAL IDENTIFIER BLACKLIST**:<br>(All references to the below identifiers will be disallowed)
    - `window`, `global`, `globalThis`
    - `eval`, `Function`
    - `localStorage`, `sessionStorage`, `indexedDB`
    - `document.cookie`
    - Additional identifiers defined in plugin options: `globalIndentifierBlacklist`
2. **THE MODULE SOURCE WHITELIST**:<br>(Only the below module sources are allowed to be imported)
    - Modules of the `zalo` category<br>E.g. `import foo from 'zalo/foo'`
    - All local module sources
    - Additional module sources defined in plugin options: `moduleSourceWhitelist`
## Options
### `{ globalIndentifierBlacklist: ['foo'] }`
- Data type: `Array<string>`
- Usage: Specify additional items for the  **THE GLOBAL IDENTIFIER BLACKLIST**
- Note: Subjects must be global-scoped objects.
### `{ moduleSourceWhitelist: ['bar'] }`
- Data type: `Array<string>`
- Usage: Specify additional items for the **THE MODULE SOURCE WHITELIST**
- Note:
  - All local modules is whitelisted by default. So there's no need to specify them here.
  - Each module is treated as a module category, hence all sub-categories will be whitelisted as a result.<br>E.g. Category: `'lodash'` -> Sub-categories: `'lodash/foo'`, `'lodash/bar'`, etc.