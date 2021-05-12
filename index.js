'use strict';

const ReplaceImportsPreprocessor = require('./lib/replace-imports-preprocessor');

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    if (type !== 'parent') {
      return;
    }

    registry.add('js', new ReplaceImportsPreprocessor());
  }
};
