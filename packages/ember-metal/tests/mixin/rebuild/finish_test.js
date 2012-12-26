require("ember-metal/utils");
require("ember-metal/mixins/create");
require("ember-metal/mixins/apply");
require("ember-metal/mixins/finish");
require("ember-metal/accessors");

var PrimitiveMixin = Ember.PrimitiveMixin,              // mixins/create
    Mixin = Ember.NewMixin,                             // mixins/create
    applyPrimitiveMixins = Ember.applyPrimitiveMixins,  // mixins/apply
    applyMixins = Ember.applyMixins,                    // mixins/apply
    finishApplying = Ember.finishApplying,              // mixins/finish
    meta = Ember.meta,                                  // utils
    guidFor = Ember.guidFor,                            // utils
    addObserver = Ember.addObserver,                    // observer
    get = Ember.get, set = Ember.set;                   // accessors

module("ember-metal/mixins/apply");

test("finishApplying applies any outstanding bindings", function() {
  var M = new PrimitiveMixin({
    prop: 'value',
    otherBinding: 'prop'
  });

  var obj = {};

  Ember.applyPrimitiveMixins(obj, [ M ]);

  Ember.run(function() {
    finishApplying(obj);
  });

  equal(get(obj, 'prop'), 'value');
  equal(get(obj, 'other'), 'value');
});

test("Bindings can be added to a prototype and finished on instances", function() {
  var M = new PrimitiveMixin({
    otherBinding: 'prop'
  });

  function Class() {}

  Ember.applyPrimitiveMixins(Class.prototype, [ M ]);

  var instance1 = new Class();
  var instance2 = new Class();

  Ember.run(function() {
    finishApplying(instance1);
    finishApplying(instance2);
  });

  Ember.run(function() {
    set(instance1, 'prop', 'value1');
    set(instance2, 'prop', 'value2');
  });

  equal(get(instance1, 'other'), 'value1');
  equal(get(instance2, 'other'), 'value2');
});
