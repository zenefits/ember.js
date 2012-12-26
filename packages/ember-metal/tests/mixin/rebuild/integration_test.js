require("ember-metal/mixins/create");
require("ember-metal/mixins");

var Mixin = Ember.NewMixin,               // mixins/create
    processMixins = Ember.processMixins,  // mixins/main
    applyMixins = Ember.applyMixins;      // mixins/main

module("ember-metal/mixins integration");

test("Non-primitive mixins can be processed", function() {
  var M1 = Mixin.create({
    propA: 1
  });

  var M2 = Mixin.create(M1, {
    propB: 2
  });

  var state = processMixins([ M2 ]);

  deepEqual(state, {
    aliases: { propA: undefined, propB: undefined },
    descriptors: { propA: undefined, propB: undefined },
    values: { propA: 1, propB: 2 },
    concat: {}
  });
});

test("Applying a mixin works", function() {
  var M1 = Mixin.create({
    prop1: 'prop1'
  });

  var M2 = Mixin.create(M1, {
    prop2: 'prop2'
  });

  var obj = {};

  applyMixins(obj, [ M2 ]);

  equal(obj.prop1, 'prop1');
  equal(obj.prop2, 'prop2');
});
