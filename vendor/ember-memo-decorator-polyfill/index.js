import Ember from "ember";
import { assert } from "@ember/debug";

(() => {
  "use strict";

  const { _createCache: createCache, _cacheGetValue: getValue } = Ember;

  function memo(...args) {
    const [target, key, descriptor] = args;

    // Error on `@memo()`, `@memo(...args)`, and `@memo propName = value;`
    assert(
      "You attempted to use @memo(), which is not necessary nor supported. Remove the parentheses and you will be good to go!",
      target !== undefined
    );
    assert(
      `You attempted to use @memo on with ${
        args.length > 1 ? "arguments" : "an argument"
      } ( @memo(${args
        .map((d) => `'${d}'`)
        .join(
          ", "
        )}), which is not supported. Dependencies are automatically tracked, so you can just use ${"`@memo`"}`,
      typeof target === "object" &&
        typeof key === "string" &&
        typeof descriptor === "object" &&
        args.length === 3
    );
    assert(
      `The @memo decorator must be applied to getters. '${key}' is not a getter.`,
      typeof descriptor.get == "function"
    );

    const getter = descriptor.get;
    let cache;
    descriptor.get = function () {
      if (!cache) cache = createCache(getter.bind(this));
      return getValue(cache);
    };
  }

  Ember._memo = memo;
})();
