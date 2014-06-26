import { merge } from "htmlbars-runtime/utils";
import LazyValue from "bound-templates/lazy-value";
import { get } from "ember-metal/property_get";
import { set } from "ember-metal/property_set";
import { addObserver, removeObserver } from "ember-metal/observer";

export function EmberObserverLazyValue(obj, path) {
  this.obj = obj;
  this.path = path;

  // intentionally not calling LazyValue's constructor
  // because valueFn is defined in our prototype

  addObserver(obj, path, this, 'notify');
}

EmberObserverLazyValue.prototype = Object.create(LazyValue.prototype); // TODO: polyfill

merge(EmberObserverLazyValue.prototype, {
  valueFn: function() {
    return get(this.obj, this.path);
  },

  setValue: function(value, sender) {
    set(this.obj, this.path, value);
    return value;
  },

  updateObject: function(newObj) {
    removeObserver(this.obj, this.path, this, 'notify');
    this.obj = newObj;
    this.notify();
    addObserver(newObj, this.path, this, 'notify');
  },

  dependentKeys: null,

  addDependentKeys: function(_dependentKeys) {
    var dependentKeys = this.dependentKeys = this.dependentKeys || [],
        dependentKey;

    for (var i = 0, l = _dependentKeys.length; i < l; i++) {
      dependentKey = _dependentKeys[i];
      addObserver(this.obj, this.path + '.' + dependentKey, this, 'notify');
      dependentKeys.push(dependentKey);
    }
  },

  destroy: function() {
    removeObserver(this.obj, this.path, this, 'notify');
    this.obj = this.path = null;
    LazyValue.prototype.destroy.call(this);
  }
});

export function makeBoundHelper(fn, dependentKeys) {
  return function(params, options, env) {
    var lazyValue = new LazyValue(function() {
      var originalHash = options.hash;
      var args = params.map(function(param) {
        if (param && param.isLazyValue) {
          return param.value();
        }
        return param;
      });
      var hash = {};
      var value;

      for (var key in originalHash) {
        value = originalHash[key];
        if (value && value.isLazyValue) {
          hash[key] = value.value();
        } else {
          hash[key] = value;
        }
      }
      args.push({hash: hash});

      return fn.apply(null, args);
    });

    for (var i = 0, l = params.length; i < l; i++) {
      lazyValue.addDependentValue(params[i]);
    }

    var hash = options.hash;
    for (var key in hash) {
      lazyValue.addDependentValue(hash[key]);
    }

    if (dependentKeys) {
      var firstParam = params[0];
      if (firstParam && firstParam.isLazyValue) {
        firstParam.addDependentKeys(dependentKeys);
      }
    }

    return lazyValue;
  };
}
