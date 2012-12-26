require('ember-metal/utils');

var guidFor = Ember.guidFor; // utils

/**
  @private

  Take a series of mixins and return a flattened list of
  primitive mixins. A primitive mixin has only properties
  and does not depend on any additional mixins.

  ```javascript
  A = Ember.Mixin.create({
    a: true
  });

  B = Ember.Mixin.create(A, {
    b: true
  });

  C = Ember.Mixin.create(A, B);

  flattenMixins([ A, B, C ]) // [ <primitive A>, <primitive B> ]
  flattenMixins([ C, B, A ]) // [ <primitive A>, <primitive B> ]
  ```

  The primitive mixins are always flattened in the order of
  dependencies, with the dependencies before the mixins that
  depend on them.
*/
function flattenMixins(mixins) {
  var flattened = [], seen = {};

  var processing = mixins.slice(), mixin;

  while (processing.length) {
    mixin = processing.shift();

    if (seen[guidFor(mixin)]) { continue; }
    seen[guidFor(mixin)] = true;

    if (mixin.mixins) {
      processing = mixin.mixins.concat(processing);
    } else if (mixin.properties) {
      flattened.push(mixin);
    }
  }

  return flattened;
}

Ember.flattenMixins = flattenMixins;
