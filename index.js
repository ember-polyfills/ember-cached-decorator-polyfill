'use strict';

const { resolve } = require('path');
const { hasPlugin, addPlugin } = require('ember-cli-babel-plugin-helpers');

module.exports = {
  name: require('./package').name,

  included(parent) {
    this._super.included.apply(this, arguments);

    this.addBabelPlugin(parent);
  },

  addBabelPlugin(parent) {
    let pluginPath = resolve(__dirname, './lib/transpile-modules.js');

    if (!hasPlugin(parent, pluginPath)) {
      addPlugin(parent, pluginPath);
    }
  }
};
