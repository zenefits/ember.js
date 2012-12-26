/*globals QUnit*/

require("ember-metal/mixins/create");

var Mixin = Ember.NewMixin;

function nameMixin(name, mixin) {
  mixin.toString = function() { return name; };
  return mixin;
}

require("ember-metal/mixins/flatten");
module("ember-metal/mixins/flatten");

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
  var A = nameMixin('A', Mixin.create({
    a: true
  }));

  var B = nameMixin('B', Mixin.create(A, {
    b: true
  }));

  var C = nameMixin('C', Mixin.create(B, {
    c: true
  }));

  var D = nameMixin('D', Mixin.create(A, B, C, {
    d: true
  }));

  var E = nameMixin('E', Mixin.create(B, D, {
    e: true
  }));

  var F = nameMixin('F', Mixin.create(A, C, D, E));

  var G = nameMixin('G', Mixin.create(B, D, E, F));

  var flattened;

  flattened = Ember.flattenMixins([A, B, C, D, E, F, G]);
  mixinEqual(flattened, [A, B, C, D, E]);

  flattened = Ember.flattenMixins([G, F, E, D, B, C, A]);
  mixinEqual(flattened, [A, B, C, D, E]);
});

