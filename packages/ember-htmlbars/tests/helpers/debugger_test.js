import { compile } from "htmlbars-compiler/compiler";
import { defaultEnv } from "ember-htmlbars";
import { appendView, destroyView } from "ember-htmlbars/tests/test_helpers";


QUnit.module('HTMLBars {{debugger}} helper', {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
  },

  teardown: function() {
    Ember.View.defaultTemplateEnv = null;
  }
});

// test("it works", function() {
//   var template = compile("{{debugger}}");

//   var view = Ember.View.create({template: template});
//   appendView(view);
//   ok(true, "The template successfully rendered");
//   destroyView(view);
// });

test("it exists", function() {
  ok(defaultEnv.helpers.debugger, "The debugger helper exists");
});