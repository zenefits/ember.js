require("ember-metal/mixins/create");

var PrimitiveMixin = Ember.PrimitiveMixin; // mixins/create

function reopenMixin(mixin, properties) {
  var primitive = new PrimitiveMixin(properties);
  mixin.mixins.push(primitive);
}

Ember.reopenMixin = reopenMixin;
