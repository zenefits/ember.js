require("ember-metal/mixins");
require("ember-metal/mixins/create");
require("ember-metal/mixins/reopen");
require("ember-metal/utils");
require("ember-metal/accessors");

var Mixin = Ember.NewMixin,
    reopenMixin = Ember.reopenMixin,
    applyMixins = Ember.applyMixins,
    metaFor = Ember.meta,
    guidFor = Ember.guidFor,
    get = Ember.get, set = Ember.set;

module("ember-metal/mixins/reopen");

test("A mixin can be reopened", function() {
  var M = Mixin.create({
    prop: 'value'
  });

  reopenMixin(M, {
    prop2: 'value2'
  });

  var obj = {};

  applyMixins(obj, [ M ]);

  equal(obj.prop, 'value');
  equal(obj.prop2, 'value2');
});

test("An object keeps track of which mixins have already applied", function() {
  var M = Mixin.create({
    prop: 'value'
  });

  var obj = {};

  applyMixins(obj, [ M ]);

  var expectedMixins = {};
  expectedMixins[guidFor(M.mixins[0])] = true;

  deepEqual(metaFor(obj).mixins, expectedMixins);

  reopenMixin(M, {
    prop2: 'value2'
  });

  applyMixins(obj, [ M ]);

  equal(obj.prop, 'value');
  equal(obj.prop2, 'value2');

  expectedMixins[guidFor(M.mixins[1])] = true;

  deepEqual(metaFor(obj).mixins, expectedMixins);
});

test("A reopened mixin can be reapplied to a prototype", function() {
  var originalArray = [], array = [];

  var M = Mixin.create({
    propDidChange: Ember.observer(function() {
      originalArray.push(this);
    }, 'prop')
  });

  function Class() {}
  applyMixins(Class.prototype, [ M ]);

  reopenMixin(M, {
    propDidChange: Ember.observer(function() {
      array.push(this);
    }, 'prop')
  });

  applyMixins(Class.prototype, [ M ]);

  var instance1 = new Class();
  var instance2 = new Class();

  Ember.run(function() {
    set(instance1, 'prop', 'newValue');
    set(instance2, 'prop', 'newValue');
  });

  deepEqual(originalArray, []);
  deepEqual(array, [ instance1, instance2 ]);
});
