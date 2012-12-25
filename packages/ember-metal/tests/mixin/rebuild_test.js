/*globals QUnit*/

require("ember-metal/rebuild");

function nameMixin(name, mixin) {
  mixin.toString = function() { return name; };
  return mixin;
}

module("ember-metal/rebuild");

function toString(obj) {
  if (obj && obj.toString) { return obj.toString(); }
  else { return {}.toString.call(obj); }
}

function mixinEqual(actualArray, expectedArray, message) {
  var expectedMessage = [],
      actualMessage = [],
      equal = true,
      expected, actual;

  for (var i=0, l=expectedArray.length; i<l; i++) {
    expected = expectedArray[i];
    actual = actualArray[i];

    expected = expected.mixins[expected.mixins.length - 1];

    expectedMessage.push(toString(expected));
    actualMessage.push(toString(actual));

    equal = equal && (expected === actual);
  }

  expectedMessage = "[\n  " + expectedMessage.join(",  \n  ") + "  \n]";
  actualMessage = "[\n  " + actualMessage.join(",  \n  ") + "  \n]";

  QUnit.push(equal, actualMessage, expectedMessage, message);
}

test("Mixins can be flattened", function() {
  var A = nameMixin('A', Ember.Mixin.create({
    a: true
  }));

  var B = nameMixin('B', Ember.Mixin.create(A, {
    b: true
  }));

  var C = nameMixin('C', Ember.Mixin.create(B, {
    c: true
  }));

  var D = nameMixin('D', Ember.Mixin.create(A, B, C, {
    d: true
  }));

  var E = nameMixin('E', Ember.Mixin.create(B, D, {
    e: true
  }));

  var F = nameMixin('F', Ember.Mixin.create(A, C, D, E));

  var G = nameMixin('G', Ember.Mixin.create(B, D, E, F));

  var flattened;

  flattened = Ember.flattenMixins([A, B, C, D, E, F, G]);
  mixinEqual(flattened, [A, B, C, D, E]);

  flattened = Ember.flattenMixins([G, F, E, D, B, C, A]);
  mixinEqual(flattened, [A, B, C, D, E]);
});

test("Regular values in mixins can be processed", function() {
  var M = Ember.Mixin.create({
    mixin: true
  });

  var state = Ember.processMixins([ M ]);

  deepEqual(state.values, { mixin: true });
  deepEqual(state.descriptors, { mixin: undefined });
});

test("Computed properties in mixins can be processed", function() {
  var computed = Ember.computed(Ember.K);

  var M = Ember.Mixin.create({
    property: computed
  });

  var state = Ember.processMixins([ M ]);

  deepEqual(state.values, { property: undefined });
  deepEqual(state.descriptors, { property: computed });
});

test("Methods in mixins can call super to previous methods", function() {
  var m1, m2;

  var M1 = Ember.Mixin.create({
    method: function() {
      m1 = true;
    }
  });

  var M2 = Ember.Mixin.create({
    method: function() {
      this._super();
      m2 = true;
    }
  });

  var state = Ember.processMixins([ M1, M2 ]);

  deepEqual(state.descriptors, { method: undefined });

  state.values.method();

  equal(m1, true);
  equal(m2, true);
});

test("Computed properties in mixins can call super to previous properties", function() {
  var m1, m2;

  var M1 = Ember.Mixin.create({
    computed: Ember.computed(function() {
      return 'computed';
    })
  });

  var M2 = Ember.Mixin.create({
    computed: Ember.computed(function() {
      return this._super() + '!';
    })
  });

  var state = Ember.processMixins([ M1, M2 ]);

  var object = {};
  Ember.defineProperty(object, 'computed', state.descriptors.computed);

  equal(Ember.get(object, 'computed'), 'computed!');
});

test("Methods do not call super if a computed property intervened", function() {
  expect(1);

  var m1, m2;

  var M1 = Ember.Mixin.create({
    method: Ember.K
  });

  var M2 = Ember.Mixin.create({
    method: Ember.computed(Ember.K)
  });

  var M3 = Ember.Mixin.create({
    method: function() {
      ok(!this._super, "super should not exist");
    }
  });

  var state = Ember.processMixins([ M1, M2, M3 ]);

  state.values.method();
});

test("Concatenated properties are concatenated", function() {
  var M1 = Ember.Mixin.create({
    concatenatedProperties: ['list']
  });

  var M2 = Ember.Mixin.create({
    list: 'one'
  });

  var M3 = Ember.Mixin.create({
    list: ['two']
  });

  var state = Ember.processMixins([ M1, M2, M3 ]);

  deepEqual(state.values.list, [ 'one', 'two' ]);
});
