const BroccoliReplace = require('broccoli-replace');

module.exports = class ReplaceImportsPreprocessor {
  name = 'ember-cached-decorator-polyfill-preprocessor';

  toTree(tree) {
    return new BroccoliReplace(tree, {
      files: ['**/*.js', '**/*.ts'],
      patterns: [
        {
          match: /import\s+{[\s(tracked,)]*cached[\s(,tracked)]*}\s*from\s*['"]@glimmer\/tracking['"]/m,
          replacement: str => {
            return str.includes('tracked')
              ? `import { tracked } from '@glimmer/tracking';
import { cached } from 'ember-cached-decorator-polyfill';`
              : `import { cached } from 'ember-cached-decorator-polyfill';`;
          }
        }
      ]
    });
  }
};
