require("ember-metal/utils");
require("ember-metal/mixins/create");
require("ember-metal/mixins/apply");
require("ember-metal/observer");
require("ember-metal/accessors");

var PrimitiveMixin = Ember.PrimitiveMixin,              // mixins/create
    Mixin = Ember.NewMixin,                             // mixins/create
    applyPrimitiveMixins = Ember.applyPrimitiveMixins,  // mixins/apply
    applyMixins = Ember.applyMixins,                    // mixins/apply
    meta = Ember.meta,                                  // utils
    guidFor = Ember.guidFor,                            // utils
    addObserver = Ember.addObserver,                    // observer
    get = Ember.get, set = Ember.set;                   // accessors

module("ember-metal/mixins/apply");

test("Applying a primitive mixin to an empty object works", function() {
  var M = new PrimitiveMixin({
    prop1: 1
  });

  var obj = {};

  applyPrimitiveMixins(obj, [ M ]);

  equal(obj.prop1, 1);
  var objMeta = meta(obj, false);

  var mixins = objMeta.mixins;

  var guid = guidFor(M), expectedMeta = {};
  expectedMeta[guid] = true;

  deepEqual(mixins, expectedMeta);
});

test("Applying a primitive mixin with aliases to an empty object works", function() {
  var M = new PrimitiveMixin({
    prop1: Ember.alias('prop2'),
    prop2: 'prop2'
  });

  var obj = {};

  applyPrimitiveMixins(obj, [ M ]);

  equal(obj.prop1, 'prop2');
  equal(obj.prop2, 'prop2');
});

test("Applying a primitive mixin with observers to an empty object", function() {
  var oldCount = 0, newCount = 0;

  var M1 = new PrimitiveMixin({
    prop: 'value',
    propDidChange: Ember.observer(function() {
      oldCount++;
    }, 'prop')
  });

  var M2 = new PrimitiveMixin({
    propDidChange: Ember.observer(function() {
      newCount++;
    }, 'prop')
  });

  var obj = {};
  applyPrimitiveMixins(obj, [ M1 ]);
  applyPrimitiveMixins(obj, [ M2 ]);

  set(obj, 'prop', 'newValue');

  equal(newCount, 1);
  equal(oldCount, 0);
});

test("Applying a primitive mixin with observers to a prototype works", function() {
  var array = [];

  var M = new PrimitiveMixin({
    prop: 'value',
    propDidChange: Ember.observer(function() {
      array.push(this);
    }, 'prop')
  });

  function Class() {}
  applyPrimitiveMixins(Class.prototype, [ M ]);

  var instance1 = new Class();
  var instance2 = new Class();

  set(instance1, 'prop', 'newValue1');
  set(instance2, 'prop', 'newValue2');

  deepEqual(array, [ instance1, instance2 ]);
});
