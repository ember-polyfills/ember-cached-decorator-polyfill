'use strict';

const { resolve } = require('path');

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);
    this._ensureThisImport();

    this.import('vendor/ember-cached-decorator-polyfill/index.js');
    this.patchEmberModulesAPIPolyfill();
  },

  treeForVendor(tree) {
    const babel = this.addons.find(a => a.name === 'ember-cli-babel');

    return babel.transpileTree(tree, {
      babel: this.options.babel,

      'ember-cli-babel': {
        compileModules: false
      }
    });
  },

  _ensureThisImport() {
    if (!this.import) {
      this._findHost = function findHostShim() {
        let current = this;
        let app;
        do {
          app = current.app || app;
          // eslint-disable-next-line no-cond-assign
        } while (current.parent.parent && (current = current.parent));
        return app;
      };
      this.import = function importShim(asset, options) {
        const app = this._findHost();
        app.import(asset, options);
      };
    }
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
