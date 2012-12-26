module("ember-metal/mixins/create");
module("ember-metal/platform");

var objectCreate = Ember.create; // platform

function PrimitiveMixin(properties) {
  this.properties = properties;
}

function Mixin() {
  var mixins = [], mixin;

  for (var i=0, l=arguments.length; i<l; i++) {
    mixin = arguments[i];

    if (!(mixin instanceof PrimitiveMixin)) {
      mixin = new PrimitiveMixin(mixin);
    }

    mixins.push(mixin);
  }

  this.mixins = mixins;
}

Mixin.prototype = objectCreate(PrimitiveMixin.prototype);

Mixin.create = function() {
  var mixin = objectCreate(Mixin.prototype);
  Mixin.apply(mixin, arguments);
  return mixin;
};

Ember.NewMixin = Mixin;
Ember.PrimitiveMixin = PrimitiveMixin;
