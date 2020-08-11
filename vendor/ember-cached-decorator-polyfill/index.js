import Ember from "ember";
import { assert } from "@ember/debug";

(() => {
  "use strict";

  const { _createCache: createCache, _cacheGetValue: getValue } = Ember;

  function cached(...args) {
    const [target, key, descriptor] = args;

    // Error on `@cached()`, `@cached(...args)`, and `@cached propName = value;`
    assert(
      "You attempted to use @cached(), which is not necessary nor supported. Remove the parentheses and you will be good to go!",
      target !== undefined
    );
    assert(
      `You attempted to use @cached on with ${
        args.length > 1 ? "arguments" : "an argument"
      } ( @cached(${args
        .map((d) => `'${d}'`)
        .join(
          ", "
        )}), which is not supported. Dependencies are automatically tracked, so you can just use ${"`@cached`"}`,
      typeof target === "object" &&
        typeof key === "string" &&
        typeof descriptor === "object" &&
        args.length === 3
    );
    assert(
      `The @cached decorator must be applied to getters. '${key}' is not a getter.`,
      typeof descriptor.get == "function"
    );

    const getter = descriptor.get;
    let cache;
    descriptor.get = function () {
      if (!cache) cache = createCache(getter.bind(this));
      return getValue(cache);
    };
  }

  Ember._cached = cached;
})();
