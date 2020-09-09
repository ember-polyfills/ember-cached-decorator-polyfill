# ember-cached-decorator-polyfill

[![CI](https://github.com/ember-polyfills/ember-cached-decorator-polyfill/workflows/CI/badge.svg)](https://github.com/ember-polyfills/ember-cached-decorator-polyfill/actions)
[![npm version](https://badge.fury.io/js/ember-cached-decorator-polyfill.svg)](http://badge.fury.io/js/ember-cached-decorator-polyfill)
[![Download Total](https://img.shields.io/npm/dt/ember-cached-decorator-polyfill.svg)](http://badge.fury.io/js/ember-cached-decorator-polyfill)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cached-decorator-polyfill.svg)](https://emberobserver.com/addons/ember-cached-decorator-polyfill)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)  
[![Dependabot enabled](https://img.shields.io/badge/dependabot-enabled-blue.svg?logo=dependabot)](https://dependabot.com/)
[![dependencies Status](https://david-dm.org/ember-polyfills/ember-cached-decorator-polyfill/status.svg)](https://david-dm.org/ember-polyfills/ember-cached-decorator-polyfill)
[![devDependencies Status](https://david-dm.org/ember-polyfills/ember-cached-decorator-polyfill/dev-status.svg)](https://david-dm.org/ember-polyfills/ember-cached-decorator-polyfill?type=dev)

Polyfill for [RFC 566 "@cached decorator"][rfc-566].

[rfc-566]: https://github.com/emberjs/rfcs/pull/566

## Installation

```bash
ember install ember-cached-decorator-polyfill
```

For addons, pass the `-S` flag.

## Compatibility

- Ember.js v3.13 or above
- Ember CLI v2.13 or above
- Node.js v10 or above

## Summary

Add a `@cached` decorator for memoizing the result of a getter based on
autotracking. In the following example, `fullName` would only recalculate if
`firstName` or `lastName` is updated.

```js
import { tracked, cached } from '@glimmer/tracking';

class Person {
  @tracked firstName = 'Jen';
  @tracked lastName = 'Weber';

  @cached
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

For detailed usage instructions, refer to the
[RFC 566 "@cached decorator"][rfc-566].

## TypeScript Usage

TypeScript's normal type resolution for an import from `@glimmer/tracking`
will **not** find the types provided by this package (since TypeScript
would attempt to resolve it as `node_modules/@glimmer/tracking` or under
the Definitely Typed location for `@glimmer/tracking`).

Once the addition to the `@glimmer/tracking` API is a documented part of Ember's
API, the types will be available upstream, but in the meantime users will need
to modify their `tsconfig.json` to tell TypeScript where these types are.

Add the following to your `tsconfig.json`:

```js
{
  // ...snip...
  "paths": {
    // ...snip...
    "@glimmer/tracking": [
      "node_modules/ember-cached-decorator-polyfill",
      "node_modules/@glimmer/tracking/dist/types"
    ],
  }
}
```
