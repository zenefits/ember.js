require('ember-metal/utils');
require('ember-metal/platform');

var guidFor = Ember.guidFor,     // utils
    wrap = Ember.wrap,           // utils
    makeArray = Ember.makeArray, // utils
    objectCreate = Ember.create; // platform

/**
  @private

  Take a series of mixins and return a flattened list of
  primitive mixins. A primitive mixin has only properties
  and does not depend on any additional mixins.

  ```javascript
  A = Ember.Mixin.create({
    a: true
  });

  B = Ember.Mixin.create(A, {
    b: true
  });

  C = Ember.Mixin.create(A, B);

  flattenMixins([ A, B, C ]) // [ <primitive A>, <primitive B> ]
  flattenMixins([ C, B, A ]) // [ <primitive A>, <primitive B> ]
  ```

  The primitive mixins are always flattened in the order of
  dependencies, with the dependencies before the mixins that
  depend on them.
*/
function flattenMixins(mixins) {
  var flattened = [], seen = {};

  var processing = mixins.slice(), mixin;

  while (processing.length) {
    mixin = processing.shift();

    if (seen[guidFor(mixin)]) { continue; }
    seen[guidFor(mixin)] = true;

    if (mixin.mixins) {
      processing = mixin.mixins.concat(processing);
    } else if (mixin.properties) {
      flattened.push(mixin);
    }
  }

  return flattened;
}

function processMixins(mixins) {
  var state = { descriptors: {}, values: {}, concat: {}, aliases: {} };
  mixins = flattenMixins(mixins);

  for (var i=0, l=mixins.length; i<l; i++) {
    processMixin(mixins[i].properties, state);
  }

  return state;
}

Ember.processMixins = processMixins;

function processMixin(properties, state) {
  for (var name in properties) {
    if (!properties.hasOwnProperty(name)) { continue; }

    if (name === 'concatenatedProperties') {
      addToConcat(properties[name], state);
    }

    addProperty(name, properties[name], state);
  }
}

function addToConcat(properties, state) {
  var list = Ember.makeArray(properties),
      concat = state.concat;

  for (var i=0, l=list.length; i<l; i++) {
    concat[list[i]] = true;
  }
}

function applyConcat(name, value, state) {
  var previousValue;

  if (state.concat.hasOwnProperty(name)) {
    previousValue = Ember.makeArray(state.values[name]);
    value = Ember.makeArray(value);

    return previousValue.concat(value);
  }

  return value;
}

var REQUIRED = Ember.required();

function addProperty(name, value, state) {
  if (value instanceof Ember.Descriptor) {
    if (value === REQUIRED) { return; }

    if (value instanceof Ember.Alias) {
      state.aliases[name] = value.methodName;
      return;
    }

    value = wrapSuperProperty(value, state.descriptors[name]);

    state.descriptors[name] = value;
    state.values[name] = undefined;
  } else {
    value = applyConcat(name, value, state);
    value = wrapSuper(value, state.values[name]);

    state.descriptors[name] = undefined;
    state.values[name] = value;
  }
}

function resolveAliases(state) {
  var aliases = state.aliases, alias;

  for (var name in aliases) {
    alias = aliases[name];
    while (alias = resolveAlias(name, alias, state));
  }
}

function resolveAlias(key, alias, state) {
  delete state.aliases[key];

  var descriptors = state.descriptors,
      values = state.values,
      descriptor, value, nextAlias;

  if (nextAlias = state.aliases[alias]) {
    return nextAlias;
  } else if (descriptor = descriptors[alias]) {
    descriptors[key] = descriptor;
  } else if (value = values[alias]) {
    values[key] = value;
  }
}

function wrapSuper(value, superValue) {
  if (isMethod(value) && isMethod(superValue)) {
    return wrap(value, superValue);
  } else {
    return value;
  }
}

var Computed = Ember.ComputedProperty;

function wrapSuperProperty(property, superProperty) {
  if (property instanceof Computed && superProperty instanceof Computed) {
    property = objectCreate(property);
    property.func = wrap(property.func, superProperty.func);
  }

  return property;
}

function isMethod(obj) {
  return 'function' === typeof obj &&
         obj.isMethod !== false &&
         obj !== Boolean && obj !== Object && obj !== Number && obj !== Array && obj !== Date && obj !== String;
}

Ember.flattenMixins = flattenMixins;
Ember.processMixin = processMixin;
Ember.resolveAliases = resolveAliases;
