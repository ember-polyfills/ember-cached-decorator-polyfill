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
  const GLOBAL = 'Ember._cached';
  const MEMBER_EXPRESSION = t.MemberExpression(
    t.identifier('Ember'),
    t.identifier('_cached')
  );

  const TSTypesRequiringModification = [
    'TSAsExpression',
    'TSTypeAssertion',
    'TSNonNullExpression'
  ];
  const isTypescriptNode = node =>
    node.type.startsWith('TS') &&
    !TSTypesRequiringModification.includes(node.type);

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

            if (
              path.scope.bindings[local.name].referencePaths.find(
                rp => rp.parent.type === 'ExportSpecifier'
              )
            ) {
              // not safe to use path.scope.rename directly
              declarations.push(
                t.variableDeclaration('var', [
                  t.variableDeclarator(
                    t.identifier(local.name),
                    t.identifier(GLOBAL)
                  )
                ])
              );
            } else {
              // Replace the occurences of the imported name with the global name.
              let binding = path.scope.getBinding(local.name);

              binding.referencePaths.forEach(referencePath => {
                if (!isTypescriptNode(referencePath.parentPath)) {
                  referencePath.replaceWith(MEMBER_EXPRESSION);
                }
              });
            }
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
      },

      ExportNamedDeclaration(path) {
        let node = path.node;
        if (!node.source) {
          return;
        }

        let replacements = [];
        let removals = [];
        let specifiers = path.get('specifiers');
        let importPath = node.source.value;

        // Only walk specifiers if this is a module we have a mapping for
        if (importPath === MODULE) {
          // Iterate all the specifiers and attempt to locate their mapping
          specifiers.forEach(specifierPath => {
            let specifier = specifierPath.node;

            // exported is the name of the module being export,
            // e.g. `foo` in `export { computed as foo } from '@ember/object';`
            const exported = specifier.exported;

            // local is the original name of the module, this is usually the same
            // as the exported value, unless the module is aliased
            const local = specifier.local;

            // We only care about the ExportSpecifier
            if (specifier.type !== 'ExportSpecifier') {
              return;
            }

            // Determine the import name, either default or named
            let importName = local.name;

            if (importName !== IMPORT) return;

            removals.push(specifierPath);

            let declaration;
            const globalAsIdentifier = t.identifier(GLOBAL);
            if (exported.name === 'default') {
              declaration = t.exportDefaultDeclaration(globalAsIdentifier);
            } else {
              // Replace the node with a new `var name = Ember.something`
              declaration = t.exportNamedDeclaration(
                t.variableDeclaration('var', [
                  t.variableDeclarator(exported, globalAsIdentifier)
                ]),
                [],
                null
              );
            }
            replacements.push(declaration);
          });
        }

        if (removals.length > 0 && removals.length === node.specifiers.length) {
          path.replaceWithMultiple(replacements);
        } else if (replacements.length > 0) {
          removals.forEach(specifierPath => specifierPath.remove());
          path.insertAfter(replacements);
        }
      }
    }
  };
};

// Provide the path to the package's base directory for caching with broccoli
// Ref: https://github.com/babel/broccoli-babel-transpiler#caching
module.exports.baseDir = () => path.resolve(__dirname, '..');
