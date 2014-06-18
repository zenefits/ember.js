import run from "ember-metal/run_loop";
import EmberView from "ember-views/views/view";
import { compile } from "htmlbars-compiler/compiler";
import { defaultEnv } from "ember-htmlbars";
import { appendView, destroyView } from "ember-htmlbars/tests/test_helpers";

function buildView(template, context) {
  return EmberView.create({
    template: compile(template),
    context: (context || {})
  });
}

var oldString;

QUnit.module('HTMLBars {{loc valueToLocalize}} helper', {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
    oldString = Ember.STRINGS;
    Ember.STRINGS = {
      '_Howdy Friend': 'Hallo Freund'
    };
  },

  teardown: function() {
    Ember.STRINGS = oldString;
    Ember.View.defaultTemplateEnv = null;
  }
});

test("let the original value through by default", function() {
  var view = buildView('{{loc "Hiya buddy!"}}');
  appendView(view);

  equal(view.$().text(), "Hiya buddy!");

  destroyView(view);
});

test("localize a simple string", function() {
  var view = buildView('{{loc "_Howdy Friend"}}');
  appendView(view);

  equal(view.$().text(), "Hallo Freund");

  destroyView(view);
});
