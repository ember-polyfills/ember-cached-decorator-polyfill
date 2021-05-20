'use strict';

const { resolve } = require('path');
const { hasPlugin, addPlugin } = require('ember-cli-babel-plugin-helpers');

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);

    this.addBabelPlugin();
  },

  addBabelPlugin() {
    let app = this._findHost();
    let pluginPath = resolve(__dirname, './lib/transpile-modules.js');

    if (!hasPlugin(app, pluginPath)) {
      addPlugin(app, pluginPath);
    }
  }
};
