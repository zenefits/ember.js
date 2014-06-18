import Ember from "ember-metal/core"; // Ember.lookup
import EmberLogger from "ember-metal/logger";
import run from "ember-metal/run_loop";
import EmberView from "ember-views/views/view";
import EmberHandlebars from "ember-handlebars-compiler";
import logHelper from "ember-htmlbars/helpers/log";
import { compile } from "htmlbars-compiler/compiler";
import { defaultEnv } from "ember-htmlbars";
import { appendView, destroyView } from "ember-htmlbars/tests/test_helpers";

var originalLookup = Ember.lookup, lookup;
var originalLog, logCalls;
var originalLogHelper;
var view;

QUnit.module("Handlebars {{log}} helper", {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
    Ember.lookup = lookup = { Ember: Ember };

    originalLogHelper = defaultEnv.helpers.log;
    defaultEnv.helpers.log = logHelper;

    originalLog = EmberLogger.log;
    logCalls = [];
    EmberLogger.log = function() { logCalls.push.apply(logCalls, arguments); };
  },

  teardown: function() {
    if (view) {
      destroyView(view);
      view = null;
    }

    EmberLogger.log = originalLog;
    defaultEnv.helpers.log = originalLogHelper;
    Ember.lookup = originalLookup;
    Ember.View.defaultTemplateEnv = null;
  }
});

test("should be able to log multiple properties", function() {
  var context = {
    value: 'one',
    valueTwo: 'two'
  };

  view = EmberView.create({
    context: context,
    template: compile('{{log value valueTwo}}')
  });

  appendView(view);

  equal(view.$().text(), "", "shouldn't render any text");
  equal(logCalls[0], 'one');
  equal(logCalls[1], 'two');
});

test("should be able to log primitives", function() {
  var context = {
    value: 'one',
    valueTwo: 'two'
  };

  view = EmberView.create({
    context: context,
    template: compile('{{log value "foo" 0 valueTwo true}}')
  });

  appendView(view);

  equal(view.$().text(), "", "shouldn't render any text");
  strictEqual(logCalls[0], 'one');
  strictEqual(logCalls[1], 'foo');
  strictEqual(logCalls[2], 0);
  strictEqual(logCalls[3], 'two');
  strictEqual(logCalls[4], true);
});
