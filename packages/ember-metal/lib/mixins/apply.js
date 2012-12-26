require("ember-metal/mixins/process");
require("ember-metal/platform");
require("ember-metal/utils");
require("ember-metal/properties");

var processMixin = Ember.processMixin,      // mixins/process
    resolveAliases = Ember.resolveAliases,  // mixins/process
    objectCreate = Ember.create,            // platform
    defineProperty = Ember.defineProperty,  // properties
    guidFor = Ember.guidFor,                // utils
    metaFor = Ember.meta,                   // utils
    SETUP_KEY = Ember.SETUP_KEY,            // utils
    TEARDOWN_KEY = Ember.TEARDOWN_KEY,      // utils
    IS_BINDING = Ember.IS_BINDING;          // utils

function processPrimitiveMixin(obj, mixin, state) {
  var meta = mixinsMeta(obj),
      mixinGuid = guidFor(mixin);

  if (mixinGuid in meta) { return; }

  meta[guidFor(mixin)] = true;
  processMixin(mixin.properties, state);
}

function applyPrimitiveMixins(obj, mixins) {
  var state = { descriptors: {}, values: {}, concat: {}, aliases: {} };

  for (var i=0, l=mixins.length; i<l; i++) {
    processPrimitiveMixin(obj, mixins[i], state);
  }

  resolveAliases(state);
  applyState(obj, state);
}

function mixinsMeta(obj) {
  var meta = Ember.meta(obj), mixins;

  if (meta.hasOwnProperty('mixins')) {
    return meta.mixins;
  } else if (mixins = meta.mixins) {
    return meta.mixins = objectCreate(mixins);
  } else {
    return meta.mixins = {};
  }
}

function applyState(obj, state) {
  var descriptors = state.descriptors,
      values = state.values;

  for (var key in values) {
    applyEmberSetup(obj, key, obj[key], values[key]);
    applyBindings(obj, key, values[key]);
    defineProperty(obj, key, descriptors[key], values[key]);
  }
}

var setup = Ember.SETUP_KEY,
    teardown = Ember.TEARDOWN_KEY;

function applyEmberSetup(obj, key, previousValue, value) {
  if (previousValue && previousValue[teardown]) {
    previousValue[teardown](obj, key);
  }

  if (value && value[setup]) {
    value[setup](obj, key);
  }
}

function applyBindings(obj, key, value) {
  var match = IS_BINDING.exec(key);
  if(!match) { return; }

  var meta = metaFor(obj), bindings = meta.bindings;

  if (bindings && !meta.hasOwnProperty('bindings')) {
    bindings = meta.bindings = objectCreate(bindings);
  } else if (!bindings) {
    bindings = meta.bindings = {};
  }

  bindings[match[1]] = value;
}

Ember.applyPrimitiveMixins = applyPrimitiveMixins;
