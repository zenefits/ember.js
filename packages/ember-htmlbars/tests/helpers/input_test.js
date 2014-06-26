import Ember from "ember-metal/core";

import run from "ember-metal/run_loop";
import { set as o_set } from "ember-metal/property_set";
import EmberView from "ember-views/views/view";
import { compile } from "htmlbars-compiler/compiler";
import { defaultEnv } from "ember-htmlbars";

var textField, checkboxView, controller;

function set(object, key, value) {
  run(function() { o_set(object, key, value); });
}

function append(view) {
  run(function() {
    view.appendTo('#qunit-fixture');
  });
}

function destroy(view) {
  run(function() {
    view.destroy();
  });
}

QUnit.module("HTMLBars {{input type='text'}}", {
  setup: function() {
    EmberView.defaultTemplateEnv = defaultEnv;
    controller = {
      val: "hello",
      place: "Enter some text",
      name: "some-name",
      max: 30,
      size: 30,
      tab: 5
    };

    textField = EmberView.extend({
      controller: controller,
      template: compile('{{input type="text" disabled=disabled value=val placeholder=place name=name maxlength=max size=size tabindex=tab}}')
    }).create();

    append(textField);
  },

  teardown: function() {
    destroy(textField);
    EmberView.defaultTemplateEnv = null;
  }
});

test("should insert a text field into DOM", function() {
  equal(textField.$('input').length, 1, "A single text field was inserted");
});

test("should become disabled if the disabled attribute is true", function() {
  ok(textField.$('input').is(':not(:disabled)'), "There are no disabled text fields");

  set(controller, 'disabled', true);
  ok(textField.$('input').is(':disabled'), "The text field is disabled");

  set(controller, 'disabled', false);
  ok(textField.$('input').is(':not(:disabled)'), "There are no disabled text fields");
});

test("input value is updated when setting value property of view", function() {
  equal(textField.$('input').val(), "hello", "renders text field with value");
  set(controller, 'val', 'bye!');
  equal(textField.$('input').val(), "bye!", "updates text field after value changes");
});

test("input placeholder is updated when setting placeholder property of view", function() {
  equal(textField.$('input').attr('placeholder'), "Enter some text", "renders text field with placeholder");
  set(controller, 'place', 'Text, please enter it');
  equal(textField.$('input').attr('placeholder'), "Text, please enter it", "updates text field after placeholder changes");
});

test("input name is updated when setting name property of view", function() {
  equal(textField.$('input').attr('name'), "some-name", "renders text field with name");
  set(controller, 'name', 'other-name');
  equal(textField.$('input').attr('name'), "other-name", "updates text field after name changes");
});

test("input maxlength is updated when setting maxlength property of view", function() {
  equal(textField.$('input').attr('maxlength'), "30", "renders text field with maxlength");
  set(controller, 'max', 40);
  equal(textField.$('input').attr('maxlength'), "40", "updates text field after maxlength changes");
});

test("input size is updated when setting size property of view", function() {
  equal(textField.$('input').attr('size'), "30", "renders text field with size");
  set(controller, 'size', 40);
  equal(textField.$('input').attr('size'), "40", "updates text field after size changes");
});

test("input tabindex is updated when setting tabindex property of view", function() {
  equal(textField.$('input').attr('tabindex'), "5", "renders text field with the tabindex");
  set(controller, 'tab', 3);
  equal(textField.$('input').attr('tabindex'), "3", "updates text field after tabindex changes");
});

QUnit.module("HTMLBars {{input type='text'}} - static values", {
  setup: function() {
    EmberView.defaultTemplateEnv = defaultEnv;
    controller = {};

    textField = EmberView.extend({
      controller: controller,
      template: compile('{{input type="text" disabled=true value="hello" placeholder="Enter some text" name="some-name" maxlength=30 size=30 tabindex=5}}')
    }).create();

    append(textField);
  },

  teardown: function() {
    destroy(textField);
    EmberView.defaultTemplateEnv = null;
  }
});

test("should insert a text field into DOM", function() {
  equal(textField.$('input').length, 1, "A single text field was inserted");
});

test("should become disabled if the disabled attribute is true", function() {
  ok(textField.$('input').is(':disabled'), "The text field is disabled");
});

test("input value is updated when setting value property of view", function() {
  equal(textField.$('input').val(), "hello", "renders text field with value");
});

test("input placeholder is updated when setting placeholder property of view", function() {
  equal(textField.$('input').attr('placeholder'), "Enter some text", "renders text field with placeholder");
});

test("input name is updated when setting name property of view", function() {
  equal(textField.$('input').attr('name'), "some-name", "renders text field with name");
});

test("input maxlength is updated when setting maxlength property of view", function() {
  equal(textField.$('input').attr('maxlength'), "30", "renders text field with maxlength");
});

test("input size is updated when setting size property of view", function() {
  equal(textField.$('input').attr('size'), "30", "renders text field with size");
});

test("input tabindex is updated when setting tabindex property of view", function() {
  equal(textField.$('input').attr('tabindex'), "5", "renders text field with the tabindex");
});

QUnit.module("HTMLBars {{input}} - default type", {
  setup: function() {
    EmberView.defaultTemplateEnv = defaultEnv;
    controller = {};

    textField = EmberView.extend({
      controller: controller,
      template: compile('{{input}}')
    }).create();

    append(textField);
  },

  teardown: function() {
    destroy(textField);
    EmberView.defaultTemplateEnv = null;
  }
});

test("should have the default type", function() {
  equal(textField.$('input').attr('type'), 'text', "Has a default text type");
});

QUnit.module("HTMLBars {{input type='checkbox'}}", {
  setup: function() {
    EmberView.defaultTemplateEnv = defaultEnv;
    controller = {
      tab: 6,
      name: 'hello',
      val: false
    };

    checkboxView = EmberView.extend({
      controller: controller,
      template: compile('{{input type="checkbox" disabled=disabled tabindex=tab name=name checked=val}}')
    }).create();

    append(checkboxView);
  },

  teardown: function() {
    destroy(checkboxView);
    EmberView.defaultTemplateEnv = null;
  }
});

test("should append a checkbox", function() {
  equal(checkboxView.$('input[type=checkbox]').length, 1, "A single checkbox is added");
});

test("should begin disabled if the disabled attribute is true", function() {
  ok(checkboxView.$('input').is(':not(:disabled)'), "The checkbox isn't disabled");
  set(controller, 'disabled', true);
  ok(checkboxView.$('input').is(':disabled'), "The checkbox is now disabled");
});

test("should support the tabindex property", function() {
  equal(checkboxView.$('input').prop('tabindex'), '6', 'the initial checkbox tabindex is set in the DOM');
  set(controller, 'tab', 3);
  equal(checkboxView.$('input').prop('tabindex'), '3', 'the checkbox tabindex changes when it is changed in the view');
});

test("checkbox name is updated", function() {
  equal(checkboxView.$('input').attr('name'), "hello", "renders checkbox with the name");
  set(controller, 'name', 'bye');
  equal(checkboxView.$('input').attr('name'), "bye", "updates checkbox after name changes");
});

test("checkbox checked property is updated", function() {
  equal(checkboxView.$('input').prop('checked'), false, "the checkbox isn't checked yet");
  set(controller, 'val', true);
  equal(checkboxView.$('input').prop('checked'), true, "the checkbox is checked now");
});

QUnit.module("HTMLBars {{input type='checkbox'}} - prevent value= usage", {
  setup: function() {
    EmberView.defaultTemplateEnv = defaultEnv;
    checkboxView = EmberView.extend({
      controller: controller,
      template: compile('{{input type="checkbox" disabled=disabled tabindex=tab name=name value=val}}')
    }).create();
  },

  teardown: function() {
    destroy(checkboxView);
    EmberView.defaultTemplateEnv = null;
  }
});

test("It works", function() {
  expectAssertion(function() {
    append(checkboxView);
  }, /you must use `checked=/);
});

QUnit.module("HTMLBars {{input type='checkbox'}} - static values", {
  setup: function() {
    EmberView.defaultTemplateEnv = defaultEnv;
    controller = {
      tab: 6,
      name: 'hello',
      val: false
    };

    checkboxView = EmberView.extend({
      controller: controller,
      template: compile('{{input type="checkbox" disabled=true tabindex=6 name="hello" checked=false}}')
    }).create();

    append(checkboxView);
  },

  teardown: function() {
    destroy(checkboxView);
    EmberView.defaultTemplateEnv = null;
  }
});

test("should begin disabled if the disabled attribute is true", function() {
  ok(checkboxView.$().is(':not(:disabled)'), "The checkbox isn't disabled");
});

test("should support the tabindex property", function() {
  equal(checkboxView.$('input').prop('tabindex'), '6', 'the initial checkbox tabindex is set in the DOM');
});

test("checkbox name is updated", function() {
  equal(checkboxView.$('input').attr('name'), "hello", "renders checkbox with the name");
});

test("checkbox checked property is updated", function() {
  equal(checkboxView.$('input').prop('checked'), false, "the checkbox isn't checked yet");
});