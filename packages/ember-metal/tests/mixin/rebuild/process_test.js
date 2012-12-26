require("ember-metal/mixins/create");
var Mixin = Ember.NewMixin;

require("ember-metal/mixins/process");
module("ember-metal/mixins/process");

var processMixin = Ember.processMixin;
var resolveAliases = Ember.resolveAliases;

// This helper assumes that all mixins have a single primitive
// mixin inside. The flatten tests confirm that more exotic
// scenarios can be converted into the simpler scenario tested
// here.
function processMixins(mixins) {
  var state = { descriptors: {}, values: {}, concat: {}, aliases: {} };

  for (var i=0, l=mixins.length; i<l; i++) {
    processMixin(mixins[i].mixins[0].properties, state);
  }

  return state;
}

test("Regular values in mixins can be processed", function() {
  var M = Mixin.create({
    mixin: true
  });

  var state = processMixins([ M ]);

  deepEqual(state.values, { mixin: true });
  deepEqual(state.descriptors, { mixin: undefined });
});

test("Computed properties in mixins can be processed", function() {
  var computed = Ember.computed(Ember.K);

  var M = Mixin.create({
    property: computed
  });

  var state = processMixins([ M ]);

  deepEqual(state.values, { property: undefined });
  deepEqual(state.descriptors, { property: computed });
});

test("Methods in mixins can call super to previous methods", function() {
  var m1, m2;

  var M1 = Mixin.create({
    method: function() {
      m1 = true;
    }
  });

  var M2 = Mixin.create({
    method: function() {
      this._super();
      m2 = true;
    }
  });

  var state = processMixins([ M1, M2 ]);

  deepEqual(state.descriptors, { method: undefined });

  state.values.method();

  equal(m1, true);
  equal(m2, true);
});

test("Computed properties in mixins can call super to previous properties", function() {
  var m1, m2;

  var M1 = Mixin.create({
    computed: Ember.computed(function() {
      return 'computed';
    })
  });

  var M2 = Mixin.create({
    computed: Ember.computed(function() {
      return this._super() + '!';
    })
  });

  var state = processMixins([ M1, M2 ]);

  var object = {};
  Ember.defineProperty(object, 'computed', state.descriptors.computed);

  equal(Ember.get(object, 'computed'), 'computed!');
});

test("Methods do not call super if a computed property intervened", function() {
  expect(1);

  var m1, m2;

  var M1 = Mixin.create({
    method: Ember.K
  });

  var M2 = Mixin.create({
    method: Ember.computed(Ember.K)
  });

  var M3 = Mixin.create({
    method: function() {
      ok(!this._super, "super should not exist");
    }
  });

  var state = processMixins([ M1, M2, M3 ]);

  state.values.method();
});

test("Concatenated properties are concatenated", function() {
  var M1 = Mixin.create({
    concatenatedProperties: ['list']
  });

  var M2 = Mixin.create({
    list: 'one'
  });

  var M3 = Mixin.create({
    list: ['two']
  });

  var state = processMixins([ M1, M2, M3 ]);

  deepEqual(state.values.list, [ 'one', 'two' ]);
});

test("processMixin can be used for anonymous property lists", function() {
  var M1 = Mixin.create({
    method: function() {
      return 'method';
    }
  });

  var M2 = {
    method: function() {
      return this._super() + '!';
    }
  };

  var state = processMixins([ M1 ]);
  Ember.processMixin(M2, state);

  equal(state.values.method(), 'method!');
});

test("resolveAliases resolve aliases in the processed mixins", function() {
  var M1 = Mixin.create({
    first: Ember.alias('second'),
    second: Ember.alias('third'),
    third: 3
  });

  var state = processMixins([ M1 ]);
  resolveAliases(state);

  equal(state.values.first, 3);
  equal(state.values.second, 3);
  equal(state.values.third, 3);
});

test("resolveAliases resolves computed property aliases", function() {
  var computed = Ember.computed();

  var M1 = Mixin.create({
    first: Ember.alias('second'),
    second: Ember.alias('third'),
    third: computed
  });

  var state = processMixins([ M1 ]);
  resolveAliases(state);

  equal(state.descriptors.first, computed);
  equal(state.descriptors.second, computed);
  equal(state.descriptors.third, computed);
});

test("Aliases can reference future mixins", function() {
  var M1 = Mixin.create({
    first: Ember.alias('second')
  });

  var M2 = Mixin.create({
    second: Ember.alias('third')
  });

  var M3 = Mixin.create({
    third: 3
  });

  var state = processMixins([ M1, M2, M3 ]);
  resolveAliases(state);

  equal(state.values.first, 3);
  equal(state.values.second, 3);
  equal(state.values.third, 3);
});

