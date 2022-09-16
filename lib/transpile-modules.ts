'use strict';

import path from 'path';
import type * as Babel from '@babel/core';
import type { types as t } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import { ImportUtil } from 'babel-import-util';

interface State {
  importer: ImportUtil;
}

export default function (babel: typeof Babel) {
  const t = babel.types;

  const REAL_MODULE = '@glimmer/tracking';
  const IMPORT = 'cached';
  const POLYFILL_MODULE = 'ember-cached-decorator-polyfill';
  const AVAILABE_AT = '>= 4.1.0-alpha.0';

  // Notice that the only name we introduce into scope here is %%local%%, and we
  // know that name is safe to use because it's the name the user was already
  // using in the ImportSpecifier that we're replacing.
  let loader = babel.template(`
    let %%local%% = %%macroCondition%%(%%dependencySatisfies%%('ember-source', '${AVAILABE_AT}')) ? 
      %%importSync%%('${REAL_MODULE}').${IMPORT} : 
      %%importSync%%('${POLYFILL_MODULE}').${IMPORT};
  `);

  return {
    name: 'ember-cache-decorator-polyfill',
    visitor: {
      Program(path: NodePath<t.Program>, state: State) {
        state.importer = new ImportUtil(t, path);
      },
      ImportDeclaration(path: NodePath<t.ImportDeclaration>, state: State) {
        if (path.node.source.value !== REAL_MODULE) {
          return;
        }

        for (let specifierPath of path.get('specifiers')) {
          let names = getNames(specifierPath);
          if (names?.imported !== IMPORT) {
            continue;
          }

          // using babel-import-util to gain access to these functions ensures
          // that we will never smash any existing bindings (and we'll reuse
          // existing imports for these if they exist)
          let importSync = state.importer.import(
            path,
            '@embroider/macros',
            'importSync'
          );
          let macroCondition = state.importer.import(
            path,
            '@embroider/macros',
            'macroCondition'
          );
          let dependencySatisfies = state.importer.import(
            path,
            '@embroider/macros',
            'dependencySatisfies'
          );

          specifierPath.remove();

          path.insertAfter(
            loader({
              local: t.identifier(names.local),
              macroCondition,
              dependencySatisfies,
              importSync,
            })
          );
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
    let importedNode = specifierPath.node.imported;
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
