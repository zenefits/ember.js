import { get } from "ember-metal/property_get";
import { set as o_set } from "ember-metal/property_set";
import run from "ember-metal/run_loop";
import EmberView from "ember-views/views/view";
import EventDispatcher from "ember-views/system/event_dispatcher";
import EmberCheckbox from "ember-htmlbars/controls/checkbox";
import { defaultEnv } from "ember-htmlbars";

// import {expectAssertion} from "ember-metal/tests/debug_helpers";

function set(obj, key, value) {
  run(function() { o_set(obj, key, value); });
}

var checkboxView, dispatcher, controller;

function destroy(view) {
  run(function() {
    view.destroy();
  });
}

QUnit.module("HTMLBars Ember.Checkbox",  {
  setup: function() {
    EmberView.defaultTemplateEnv = defaultEnv;
    dispatcher = EventDispatcher.create();
    dispatcher.setup();
  },

  teardown: function() {
    run(function() {
      dispatcher.destroy();
      checkboxView.destroy();
    });
    EmberView.defaultTemplateEnv = null;
  }
});

function append() {
  run(function() {
    checkboxView.appendTo('#qunit-fixture');
  });
}

test("should begin disabled if the disabled attribute is true", function() {
  checkboxView = EmberCheckbox.create({});

  checkboxView.set('disabled', true);
  append();

  ok(checkboxView.$().is(":disabled"));
});

test("should become disabled if the disabled attribute is changed", function() {
  checkboxView = EmberCheckbox.create({});

  append();
  ok(checkboxView.$().is(":not(:disabled)"));

  run(function() { checkboxView.set('disabled', true); });
  ok(checkboxView.$().is(":disabled"));

  run(function() { checkboxView.set('disabled', false); });
  ok(checkboxView.$().is(":not(:disabled)"));
});

test("should begin indeterminate if the indeterminate attribute is true", function() {
  checkboxView = EmberCheckbox.create({});

  checkboxView.set('indeterminate', true);
  append();

  equal(checkboxView.$().prop('indeterminate'), true, "Checkbox should be indeterminate");
});

test("should become indeterminate if the indeterminate attribute is changed", function() {
  checkboxView = EmberCheckbox.create({});

  append();

  equal(checkboxView.$().prop('indeterminate'), false, "Checkbox should not be indeterminate");

  run(function() { checkboxView.set('indeterminate', true); });
  equal(checkboxView.$().prop('indeterminate'), true, "Checkbox should be indeterminate");

  run(function() { checkboxView.set('indeterminate', false); });
  equal(checkboxView.$().prop('indeterminate'), false, "Checkbox should not be indeterminate");
});

test("should support the tabindex property", function() {
  checkboxView = EmberCheckbox.create({});

  run(function() { checkboxView.set('tabindex', 6); });
  append();

  equal(checkboxView.$().prop('tabindex'), '6', 'the initial checkbox tabindex is set in the DOM');

  run(function() { checkboxView.set('tabindex', 3); });
  equal(checkboxView.$().prop('tabindex'), '3', 'the checkbox tabindex changes when it is changed in the view');
});

test("checkbox name is updated when setting name property of view", function() {
  checkboxView = EmberCheckbox.create({});

  run(function() { checkboxView.set('name', 'foo'); });
  append();

  equal(checkboxView.$().attr('name'), "foo", "renders checkbox with the name");

  run(function() { checkboxView.set('name', 'bar'); });

  equal(checkboxView.$().attr('name'), "bar", "updates checkbox after name changes");
});

test("checked property mirrors input value", function() {
  checkboxView = EmberCheckbox.create({});
  run(function() { checkboxView.append(); });

  equal(get(checkboxView, 'checked'), false, "initially starts with a false value");
  equal(!!checkboxView.$().prop('checked'), false, "the initial checked property is false");

  set(checkboxView, 'checked', true);

  equal(checkboxView.$().prop('checked'), true, "changing the value property changes the DOM");

  run(function() { checkboxView.remove(); });
  run(function() { checkboxView.append(); });

  equal(checkboxView.$().prop('checked'), true, "changing the value property changes the DOM");

  run(function() { checkboxView.remove(); });
  run(function() { set(checkboxView, 'checked', false); });
  run(function() { checkboxView.append(); });

  equal(checkboxView.$().prop('checked'), false, "changing the value property changes the DOM");
});

test("checking the checkbox updates the value", function() {
  checkboxView = EmberCheckbox.create({ checked: true });
  append();

  equal(get(checkboxView, 'checked'), true, "precond - initially starts with a true value");
  equal(!!checkboxView.$().prop('checked'), true, "precond - the initial checked property is true");

  // IE fires 'change' event on blur.
  checkboxView.$()[0].focus();
  checkboxView.$()[0].click();
  checkboxView.$()[0].blur();

  equal(!!checkboxView.$().prop('checked'), false, "after clicking a checkbox, the checked property changed");
  equal(get(checkboxView, 'checked'), false, "changing the checkbox causes the view's value to get updated");
});
