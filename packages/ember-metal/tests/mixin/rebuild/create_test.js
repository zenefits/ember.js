require("ember-metal/mixins/create");
require("ember-metal/mixins/flatten");

module("ember-metal/mixins/create");

var Mixin = Ember.NewMixin;

test("Creating a new mixin creates a mixin containing a primitive mixin", function() {
  var M = Mixin.create({
    prop: 1
  });

  ok(!M.hasOwnProperty('properties'));

  equal(M.mixins.length, 1);

  deepEqual(M.mixins[0].properties, {
    prop: 1
  });
});

test("Creating a mixin that depends on another mixin works", function() {
  var M1 = Mixin.create({
    propA: 1
  });

  var M2 = Mixin.create(M1, {
    propB: 2
  });

  equal(M1.mixins.length, 1);
  equal(M2.mixins.length, 2);

  deepEqual(M1.mixins[0].properties, {
    propA: 1
  });

  equal(M2.mixins[0], M1);

  deepEqual(M2.mixins[1].properties, {
    propB: 2
  });
});
