'use strict';

const path = require('path');

/**
 * Based on `babel-plugin-ember-modules-api-polyfill`.
 * @see https://github.com/ember-cli/babel-plugin-ember-modules-api-polyfill/blob/master/src/index.js
 */
module.exports = function (babel) {
  const t = babel.types;

  const MODULE = '@glimmer/tracking';
  const IMPORT = 'cached';
  const REPLACED_MODULE = 'ember-cached-decorator-polyfill';

  return {
    name: 'ember-cache-decorator-polyfill',
    visitor: {
      ImportDeclaration(path) {
        let node = path.node;
        let declarations = [];
        let removals = [];
        let specifiers = path.get('specifiers');
        let importPath = node.source.value;

        // Only walk specifiers if this is a module we have a mapping for
        if (importPath === MODULE) {
          // Iterate all the specifiers and attempt to locate their mapping
          specifiers.forEach(specifierPath => {
            let specifier = specifierPath.node;
            let importName;

            // imported is the name of the module being imported, e.g. import foo from bar
            const imported = specifier.imported;

            // local is the name of the module in the current scope, this is usually the same
            // as the imported value, unless the module is aliased
            const local = specifier.local;

            // We only care about these 2 specifiers
            if (
              specifier.type !== 'ImportDefaultSpecifier' &&
              specifier.type !== 'ImportSpecifier'
            ) {
              if (specifier.type === 'ImportNamespaceSpecifier') {
                throw new Error(
                  `Using \`import * as ${specifier.local.name} from '${importPath}'\` is not supported.`
                );
              }
              return;
            }

            // Determine the import name, either default or named
            if (specifier.type === 'ImportDefaultSpecifier') {
              importName = 'default';
            } else {
              importName = imported.name;
            }

            if (importName !== IMPORT) return;

            removals.push(specifierPath);

            declarations.push(
              t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier(local.name),
                    t.identifier(IMPORT)
                  )
                ],
                t.stringLiteral(REPLACED_MODULE)
              )
            );
          });
        }

        if (removals.length > 0) {
          if (removals.length === node.specifiers.length) {
            path.replaceWithMultiple(declarations);
          } else {
            removals.forEach(specifierPath => specifierPath.remove());
            path.insertAfter(declarations);
          }
        }
      }
    }
  };
};

// Provide the path to the package's base directory for caching with broccoli
// Ref: https://github.com/babel/broccoli-babel-transpiler#caching
module.exports.baseDir = () => path.resolve(__dirname, '..');
