require("ember-metal/utils");
require("ember-metal/binding");

var Binding = Ember.Binding,    // binding
    metaFor = Ember.meta,       // utils
    META_KEY = Ember.META_KEY;  // utils

function finishApplying(obj) {
  connectBindings(obj);
  return obj;
}

function connectBindings(obj) {
  var meta = metaFor(obj),
      bindings = meta.bindings;

  if (!bindings) { return obj; }

  for (var key in bindings) {
    var binding = bindings[key];

    if (binding instanceof Binding) {
      binding = binding.copy();
      binding.to(key);
    } else {
      binding = new Binding(key, binding);
    }

    binding.connect(obj);
  }

  meta.bindings = {};
}

Ember.finishApplying = finishApplying;
