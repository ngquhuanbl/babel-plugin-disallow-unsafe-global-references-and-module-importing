"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.fillTemplateString=fillTemplateString;exports.isMemberExpressionIdentifier=isMemberExpressionIdentifier;exports.isValidIdentifier=isValidIdentifier;exports.isValidModuleSource=isValidModuleSource;exports.isWhitelistedModuleSource=isWhitelistedModuleSource;exports.looksLike=looksLike;/**
 * Fill the template string with the given placeholder value.
 * Template string can contain placeholders. These are indicated by the two nested curly braces ({{placeholderValue}}).
 * @param {string} templateString The template string
 * @param {object} placeholderValuesObject The object containing placeholder values
 * @returns {string} The resulted string after embedding placeholder values into the template string
 */function fillTemplateString(templateString,placeholderValuesObject){let res=templateString;Object.entries(placeholderValuesObject).forEach(function([key,value]){res=res.replace(`{{${key}}}`,value);});return res;}/**
 * Check if an identifier is a member expression
 * @param {string} identifier The identifier
 * @returns {boolean} Whether or not the given identifier is a member expression
 */function isMemberExpressionIdentifier(identifier){return /^[\d\w]+(\.[\d\w]+)+$/u.test(identifier);}/**
 * Check if the given identifier is valid
 * @param {identifier} identifier The identifier
 * @returns {boolean} Whether or not the given identifier is valid
 */function isValidIdentifier(identifier){return /^[\d\w]+(\.[\d\w]+)*$/u.test(identifier);}/**
 * Check if the given source value is a relative path
 * @param {string} sourceValue The source value
 * @returns {boolean} Whether or not the given source value is a relative path
 */function isRelativePathSource(sourceValue){return /^(\.){1,2}(\/[\d\w]+)*$/u.test(sourceValue);}/**
 * Check if the given source value has valid format
 * @param {string} sourceValue The source value
 * @returns {boolean} Whether or not the given source value has valid format
 */function isValidModuleSource(sourceValue){return /^(?:(\.){1,2}|[\d\w]+)(\/[\d\w]+)*$/u.test(sourceValue);}/**
 * Check if the given source value is allowed according to the given list of allowed module sources
 * @param {string} sourceValue The source value
 * @param {Array.<string>} whitelistedModuleSourceList The list of allowed module sources
 * @returns {boolean} Whether or not the given source value is allowed according to the given list of allowed module sources
 */function isWhitelistedModuleSource(sourceValue,whitelistedModuleSourceList){if(isRelativePathSource(sourceValue))return true;let isValidImport=false;whitelistedModuleSourceList.forEach(function(whitelistedModule){const regexString=`^${whitelistedModule}(/[\\d\\w]+)*$`;if(new RegExp(regexString).test(sourceValue))isValidImport=true;});return isValidImport;}/**
 * Check if the two given objects are identical in properties of primitive or object type
 * @param {object} a
 * @param {object} b
 * @returns {boolean} Whether or not the two given objects are identical in properties of primitive or object type
 */function looksLike(a,b){return a&&b&&Object.keys(b).every(bKey=>{const bVal=b[bKey];const aVal=a[bKey];if(typeof bVal==="function"){return true;}return isPrimitive(bVal)?bVal===aVal:looksLike(aVal,bVal);});}/**
 * Check if the given value is of primive type
 * @param {any} val The value
 * @returns Whether or not the given value is of primive type
 */function isPrimitive(val){return val==null||/^[sbn]/.test(typeof val);}