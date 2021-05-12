'use strict';

const { resolve } = require('path');

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);

    this.patchEmberModulesAPIPolyfill();
  },

  patchEmberModulesAPIPolyfill() {
    const babel = this.parent.findOwnAddonByName
      ? this.parent.findOwnAddonByName('ember-cli-babel') // parent is an addon
      : this.parent.findAddonByName('ember-cli-babel'); // parent is an app

    if (babel.__CachedDecoratorPolyfillApplied) return;
    babel.__CachedDecoratorPolyfillApplied = true;

    const { _getEmberModulesAPIPolyfill } = babel;

    babel._getEmberModulesAPIPolyfill = function (...args) {
      const plugins = _getEmberModulesAPIPolyfill.apply(this, args);
      if (!plugins) return;

      return [[resolve(__dirname, './lib/transpile-modules.js')], ...plugins];
    };
  }
};
