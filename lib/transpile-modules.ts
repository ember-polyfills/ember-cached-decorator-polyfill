'use strict';

import path from 'path';
import type * as Babel from '@babel/core';
import type { types as t } from '@babel/core';
import type { NodePath } from '@babel/traverse';

/**
 * Based on `babel-plugin-ember-modules-api-polyfill`.
 * @see https://github.com/ember-cli/babel-plugin-ember-modules-api-polyfill/blob/master/src/index.js
 */
export default function (babel: typeof Babel) {
  const t = babel.types;

  const MODULE = '@glimmer/tracking';
  const IMPORT = 'cached';
  const REPLACED_MODULE = 'ember-cached-decorator-polyfill';

  return {
    name: 'ember-cache-decorator-polyfill',
    visitor: {
      ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
        const node = path.node;
        const declarations: t.ImportDeclaration[] = [];
        const removals: NodePath<t.Node>[] = [];
        const specifiers = path.get('specifiers');
        const importPath = node.source.value;

        // Only walk specifiers if this is a module we have a mapping for
        if (importPath !== MODULE) {
          return;
        }

        // Iterate all the specifiers and attempt to locate their mapping
        for (const specifierPath of specifiers) {
          const names = getNames(specifierPath);
          if (!names) {
            continue;
          }
          if (names.imported !== IMPORT) {
            continue;
          }

          removals.push(specifierPath);

          declarations.push(
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier(names.local),
                  t.identifier(IMPORT)
                ),
              ],
              t.stringLiteral(REPLACED_MODULE)
            )
          );
        }

        if (removals.length > 0) {
          if (removals.length === node.specifiers.length) {
            path.replaceWithMultiple(declarations);
          } else {
            removals.forEach((specifierPath) => specifierPath.remove());
            path.insertAfter(declarations);
          }
        }
      },
    },
  };
}

// Provide the path to the package's base directory for caching with broccoli
// Ref: https://github.com/babel/broccoli-babel-transpiler#caching
module.exports.baseDir = () => path.resolve(__dirname, '..');

function getNames(
  specifierPath: NodePath<
    t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier
  >
): { imported: string; local: string } | undefined {
  if (specifierPath.isImportDefaultSpecifier()) {
    return { imported: 'default', local: specifierPath.node.local.name };
  } else if (specifierPath.isImportSpecifier()) {
    const importedNode = specifierPath.node.imported;
    if (importedNode.type === 'Identifier') {
      return {
        imported: importedNode.name,
        local: specifierPath.node.local.name,
      };
    } else {
      return {
        imported: importedNode.value,
        local: specifierPath.node.local.name,
      };
    }
  }
  return undefined;
}
