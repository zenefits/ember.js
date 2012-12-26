require('ember-metal/mixins/flatten');
require('ember-metal/mixins/process');
require('ember-metal/mixins/apply');

var flattenMixins = Ember.flattenMixins,                // mixins/flatten
    processMixin = Ember.processMixin,                  // mixins/process
    applyPrimitiveMixins = Ember.applyPrimitiveMixins;  // mixins/apply

function processMixins(mixins) {
  var state = { descriptors: {}, values: {}, concat: {}, aliases: {} };
  mixins = flattenMixins(mixins);

  for (var i=0, l=mixins.length; i<l; i++) {
    processMixin(mixins[i].properties, state);
  }

  return state;
}

function applyMixins(obj, mixins) {
  mixins = flattenMixins(mixins);
  applyPrimitiveMixins(obj, mixins);
}

Ember.processMixins = processMixins;
Ember.applyMixins = applyMixins;
