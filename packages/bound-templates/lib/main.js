define("bound-templates",
  ["htmlbars-compiler/compiler","bound-templates/lazy-value","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var htmlbarsCompile = __dependency1__.compile;
    var LazyValue = __dependency2__.LazyValue;

    function compile(string, options) {
      return htmlbarsCompile(string, options);
    }

    __exports__.compile = compile;__exports__.LazyValue = LazyValue;
  });

define("bound-templates/lazy-value",
  ["exports"],
  function(__exports__) {
    "use strict";
    var NIL = function NIL(){}, // TODO: microoptimize... object literal or fn? :P
        EMPTY_ARRAY = [];

    function LazyValue(fn) {
      this.valueFn = fn;
    }

    // TODO: Function.prototype.makeLazy helper?

    LazyValue.prototype = {
      isLazyValue: true,
      parents: null, // TODO: is parent even needed? could be modeled as a subscriber
      children: null,
      cache: NIL,
      valueFn: null,
      subscribers: null, // TODO: do we need multiple subscribers?
      _childValues: null, // just for reusing the array, might not work well if children.length changes after computation

      value: function() {
        var cache = this.cache;
        if (cache !== NIL) { return cache; }

        var children = this.children;
        if (children) {
          var child,
              values = this._childValues || new Array(children.length);

          for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            values[i] = (child && child.isLazyValue) ? child.value() : child;
          }

          return this.cache = this.valueFn(values);
        } else {
          return this.cache = this.valueFn(EMPTY_ARRAY);
        }
      },

      addDependentValue: function(value) {
        var children = this.children;
        if (!children) {
          children = this.children = [value];
        } else {
          children.push(value);
        }

        if (value && value.isLazyValue) {
          value.addParent(this);
        }

        return this;
      },

      addParent: function(parent) {
        var parents = this.parents;

        if (parents) {
          parents.push(parent);
        } else {
          parents = this.parents = [parent];
        }

        return this;
      },

      notify: function(sender) {
        var cache = this.cache,
            parents,
            subscribers;

        if (cache !== NIL) {
          parents = this.parents;
          subscribers = this.subscribers;
          cache = this.cache = NIL;

          if (parents) {
            for (var i = 0, l = parents.length; i < l; i++) {
              parents[i].notify(this);
            }
          }
          if (!subscribers) { return; }
          for (var i = 0, l = subscribers.length; i < l; i++) {
            subscribers[i](this); // TODO: should we worry about exception handling?
          }
        }
      },

      onNotify: function(callback) {
        var subscribers = this.subscribers;
        if (!subscribers) {
          subscribers = this.subscribers = [callback];
        } else {
          subscribers.push(callback);
        }
        return this;
      },

      destroy: function() {
        // TODO: we need ref counting to properly destroy since we're sharing LVs
        this.parents = this.children = this.cache = this.valueFn = this.subscribers = this._childValues = null;
      }
    };

    __exports__["default"] = LazyValue;
  });

define("bound-templates/runtime",
  ["bound-templates/lazy-value","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var LazyValue = __dependency1__["default"];
    var IS_BINDING = /^.+Binding$/;

    function streamifyArgs(context, params, options, env) {
      var hooks = env.hooks;

      // TODO: Revisit keyword rewriting approach
      if (params.length === 3 && params[1] === "in") {
        params.splice(0, 3, {isKeyword: true, from: params[2], to: params[0]});
        options.types.splice(0, 3, 'keyword');
      }

      // Convert ID params to streams
      for (var i = 0, l = params.length; i < l; i++) {
        if (options.types[i] === 'id') {
          params[i] = hooks.streamFor(context, params[i]);
        } else if (options.types[i] === 'keyword') {
          params[i].lazyValue = hooks.streamFor(context, params[i].from);
        }
      }

      // Convert hash ID values to streams
      var hash = options.hash,
          hashTypes = options.hashTypes;
      for (var key in hash) {
        if (hashTypes[key] === 'id') {
          hash[key] = hooks.streamFor(context, hash[key]);
        } else if (hashTypes[key] === 'string' && key !== 'classBinding' && key !== 'itemClassBinding' && IS_BINDING.test(key)) {
          hash[key.slice(0, -7)] = hooks.streamFor(context, hash[key]);
          delete hash[key];
        }
      }
    }

    function content(morph, path, context, params, options, env) {
      var hooks = env.hooks, isUnbound = false;

      // TODO: just set escaped on the morph in HTMLBars
      morph.escaped = options.escaped;

      if (path === 'unbound') {
        isUnbound = true;
        path = params.shift();
        options.types.shift();
      }
      var lazyValue;
      var helper = hooks.lookupHelper(path, env);
      if (helper) {
        streamifyArgs(context, params, options, env);
        options.morph = morph; // FIXME: this kinda sucks
        options.context = context; // FIXME: this kinda sucks
        lazyValue = helper(params, options, env);
      } else {
        if (isUnbound && params.length > 0) {
          throw new Error('Could not find helper named: ' + path);
        }
        lazyValue = hooks.streamFor(context, path);
      }

      if (lazyValue) {
        morph.update(lazyValue.value());

        if (isUnbound) {
          // TODO: lazyValues need ref counting
          // lazyValue.destroy();
        } else {
          lazyValue.onNotify(function(sender) {
            morph.update(sender.value());
          });
        }
      }
    }

    __exports__.content = content;function element(element, path, context, params, options, env) {
      var hooks = env.hooks;
      var helper = hooks.lookupHelper(path, env);

      if (helper) {
        streamifyArgs(context, params, options, env);
        return helper(element, params, options, env);
      } else {
        return hooks.streamFor(context, path);
      }
    }

    __exports__.element = element;function subexpr(path, context, params, options, env) {
      var hooks = env.hooks;
      var helper = hooks.lookupHelper(path, env);

      if (helper) {
        streamifyArgs(context, params, options, env);
        return helper(params, options, env);
      } else {
        return hooks.streamFor(context, path);
      }
    }

    __exports__.subexpr = subexpr;function lookupHelper(name, env) {
      var helper = env.helpers[name];
      if (helper) { return helper; }

      if (name === 'concat') { return concat; }
      if (name === 'attribute') { return attribute; }
    }

    __exports__.lookupHelper = lookupHelper;function attribute(element, params, options) {
      var name = params[0],
          value = params[1];

      value.onNotify(function(lazyValue) {
        element.setAttribute(name, lazyValue.value());
      });

      element.setAttribute(name, value.value());
    }

    function concat(params, options) {
      var builder = new LazyValue(function(values) {
        return values.join('');
      });

      params.forEach(function(node) {
        builder.addDependentValue(node);
      });

      return builder;
    }
  });