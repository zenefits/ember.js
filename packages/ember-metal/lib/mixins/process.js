require('ember-metal/utils');
require('ember-metal/platform');

var wrap = Ember.wrap,           // utils
    makeArray = Ember.makeArray, // utils
    objectCreate = Ember.create; // platform

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
  var list = makeArray(properties),
      concat = state.concat;

  for (var i=0, l=list.length; i<l; i++) {
    concat[list[i]] = true;
  }
}

function applyConcat(name, value, state) {
  var previousValue;

  if (state.concat.hasOwnProperty(name)) {
    previousValue = makeArray(state.values[name]);
    value = makeArray(value);

    return previousValue.concat(value);
  }

  return value;
}

var REQUIRED = Ember.required();

function addProperty(name, value, state) {
  var values = state.values,
      descriptors = state.descriptors,
      aliases = state.aliases;

  if (value instanceof Ember.Descriptor) {
    if (value === REQUIRED) { return; }

    if (value instanceof Ember.Alias) {
      aliases[name] = value.methodName;
      descriptors[name] = values[name] = undefined;
      return;
    }

    value = wrapSuperProperty(value, descriptors[name]);

    descriptors[name] = value;
    values[name] = aliases[name] = undefined;
  } else {
    value = applyConcat(name, value, state);
    value = wrapSuper(value, values[name]);

    descriptors[name] = aliases[name] = undefined;
    values[name] = value;
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

Ember.processMixin = processMixin;
Ember.resolveAliases = resolveAliases;
