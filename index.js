'use strict';

const { resolve } = require('path');
const { hasPlugin, addPlugin } = require('ember-cli-babel-plugin-helpers');

module.exports = {
  name: require('./package').name,

  included(parent) {
    this._super.included.apply(this, arguments);

    // this adds our babel plugin to our parent package
    this.addBabelPlugin(parent);

    // this ensures our parent package can process macros, since our babel
    // plugin emits macros
    if (!this.parent.addons.find((a) => a.name === '@embroider/macros')) {
      this.addons
        .find((a) => a.name === '@embroider/macros')
        .installBabelPlugin(parent);
    }
  },

  addBabelPlugin(parent) {
    let pluginPath = resolve(__dirname, './lib/transpile-modules.js');

    if (!hasPlugin(parent, pluginPath)) {
      addPlugin(parent, pluginPath);
    }
  },
};
