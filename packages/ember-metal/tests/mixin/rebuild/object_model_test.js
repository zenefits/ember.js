require("ember-metal/mixins");
require("ember-metal/mixins/create");
require("ember-metal/mixins/finish");
require("ember-metal/mixins/reopen");

module("ember-metal/mixins synthetic object model");

var Mixin = Ember.NewMixin,
    applyMixins = Ember.applyMixins,
    finishApplying = Ember.finishApplying,
    reopenMixin = Ember.reopenMixin;

function constructor() {
  return function Object() {
    finishApplying(this);
  };
}

var ClassMixin = Mixin.create({
  extend: function() {
    var args = [].slice.call(arguments);
    args = [ this.PrototypeMixin ].concat(args);

    var SubClass = constructor();

    SubClass.ClassMixin = Mixin.create(this.ClassMixin);
    SubClass.PrototypeMixin = Mixin.create.apply(Mixin, args);

    applyMixins(SubClass, [ SubClass.ClassMixin ]);

    return SubClass;
  },

  create: function(properties) {
    applyMixins(this.prototype, [ this.PrototypeMixin ]);
    var Class = this, instance = new Class();

    if (instance.init) { instance.init(); }
    return instance;
  },

  reopen: function(properties) {
    reopenMixin(this.PrototypeMixin, properties);
  },

  reopenClass: function(properties) {
    reopenMixin(this.ClassMixin, properties);
    applyMixins(this, [ this.ClassMixin ]);
  }
});

// bootstrap
var CoreObject = function() {};
CoreObject.PrototypeMixin = Mixin.create();
CoreObject.ClassMixin = Mixin.create(ClassMixin);
applyMixins(CoreObject, [ CoreObject.ClassMixin ]);

test("Creating a new class", function() {
  var Class = CoreObject.extend({
    foo: 1
  });

  var instance = Class.create();

  equal(instance.foo, 1);
});

test("Creating a subclass", function() {
  var instance;

  var Class = CoreObject.extend({
    foo: 1,
    bar: 2
  });

  instance = Class.create();

  equal(instance.foo, 1);
  equal(instance.bar, 2);

  var SubClass = Class.extend({
    bar: 3,
    baz: 4
  });

  instance = SubClass.create();

  equal(instance.foo, 1);
  equal(instance.bar, 3);
  equal(instance.baz, 4);
});

test("Reopening a class", function() {
  var Class = CoreObject.extend({
    foo: 1
  });

  var instance;

  instance = Class.create();
  equal(instance.foo, 1);

  Class.reopen({
    bar: 2
  });

  instance = Class.create();
  equal(instance.foo, 1);
  equal(instance.bar, 2);
});

test("Reopening a superclass", function() {
  var Class = CoreObject.extend({
    foo: 1
  });

  var instance;

  instance = Class.create();
  equal(instance.foo, 1);

  var SubClass = Class.extend({
    bar: 2
  });

  instance = SubClass.create();
  equal(instance.foo, 1);
  equal(instance.bar, 2);

  Class.reopen({
    baz: 3
  });

  instance = SubClass.create();
  equal(instance.foo, 1);
  equal(instance.bar, 2);
  equal(instance.baz, 3);
});

test("The class mixin can be reopened", function() {
  var Class = CoreObject.extend();

  Class.reopenClass({
    foo: 1
  });

  equal(Class.foo, 1);
});
