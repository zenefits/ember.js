/*globals Foo */
import EmberView from "ember-views/views/view";
import EmberObject from "ember-runtime/system/object";

import Ember from "ember-metal/core";
import { get } from "ember-metal/property_get";
import { set } from "ember-metal/property_set";
import run from "ember-metal/run_loop";
import EmberError from "ember-metal/error";

import Container from "ember-runtime/system/container";
import { makeBoundHelper } from "ember-htmlbars/utils";

import { compile } from "htmlbars-compiler/compiler";
import { defaultEnv } from "ember-htmlbars";
import { appendView, destroyView } from "ember-htmlbars/tests/test_helpers";

var view;
var originalLookup = Ember.lookup, lookup;
var container;

QUnit.module("HTMLBars {{#unbound}} helper -- classic single-property usage", {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
    Ember.lookup = lookup = { Ember: Ember };

    view = EmberView.create({
      template: compile("{{unbound foo}} {{unbound bar}}"),
      context: EmberObject.create({
        foo: "BORK",
        barBinding: 'foo'
      })
    });

    appendView(view);
  },

  teardown: function() {
    run(function() {
      view.destroy();
    });
    Ember.lookup = originalLookup;
    Ember.View.defaultTemplateEnv = null;
  }
});

test("it should render the current value of a property on the context", function() {
  equal(view.$().text(), "BORK BORK", "should render the current value of a property");
});

test("it should not re-render if the property changes", function() {
  run(function() {
    view.set('context.foo', 'OOF');
  });
  equal(view.$().text(), "BORK BORK", "should not re-render if the property changes");
});

test("it should throw the helper missing error if multiple properties are provided", function() {
  throws(function() {
      appendView(EmberView.create({
        template: compile('{{unbound foo bar}}'),
        context: EmberObject.create({
          foo: "BORK",
          bar: 'foo'
        })
      }));
    }, Error);
});

function registerBoundHelper(name, fn) {
  var dependentKeys = [].slice.call(arguments, 2);
  defaultEnv.helpers[name] = makeBoundHelper(fn, dependentKeys);
}

QUnit.module("HTMLBars {{#unbound boundHelper arg1 arg2... argN}} form: render unbound helper invocations", {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
    Ember.lookup = lookup = { Ember: Ember };

    registerBoundHelper('surround', function(prefix, value, suffix) {
      return prefix + '-' + value + '-' + suffix;
    });

    registerBoundHelper('capitalize', function(value) {
      return value.toUpperCase();
    });

    registerBoundHelper('capitalizeName', function(value) {
      return get(value, 'firstName').toUpperCase();
    }, 'firstName');

    registerBoundHelper('concat', function(value) {
      return [].slice.call(arguments, 0, -1).join('');
    });

    registerBoundHelper('concatNames', function(value) {
      return get(value, 'firstName') + get(value, 'lastName');
    }, 'firstName', 'lastName');
  },

  teardown: function() {
    delete defaultEnv.helpers['surround'];
    delete defaultEnv.helpers['capitalize'];
    delete defaultEnv.helpers['capitalizeName'];
    delete defaultEnv.helpers['concat'];
    delete defaultEnv.helpers['concatNames'];

    run(function() {
      view.destroy();
    });
    Ember.lookup = originalLookup;
    Ember.View.defaultTemplateEnv = null;
  }
});


test("should be able to render an unbound helper invocation", function() {
  try {
    registerBoundHelper('repeat', function(value, options) {
      var count = options.hash.count;
      var a = [];
      while(a.length < count) {
          a.push(value);
      }
      return a.join('');
    });

    view = EmberView.create({
      template: compile('{{unbound repeat foo countBinding="bar"}} {{repeat foo countBinding="bar"}} {{unbound repeat foo count=2}} {{repeat foo count=4}}'),
      context: EmberObject.create({
        foo: "X",
        numRepeatsBinding: "bar",
        bar: 5
      })
    });
    appendView(view);

    equal(view.$().text(), "XXXXX XXXXX XX XXXX", "first render is correct");

    run(function() {
      set(view, 'context.bar', 1);
    });

    equal(view.$().text(), "XXXXX X XX XXXX", "only unbound bound options changed");
  } finally {
    delete defaultEnv.helpers['repeat'];
  }
});

test("should be able to render an bound helper invocation mixed with static values", function() {
  view = EmberView.create({
      template: compile('{{unbound surround prefix value "bar"}} {{surround prefix value "bar"}} {{unbound surround "bar" value suffix}} {{surround "bar" value suffix}}'),
      context: EmberObject.create({
        prefix: "before",
        value: "core",
        suffix: "after"
      })
    });
  appendView(view);

  equal(view.$().text(), "before-core-bar before-core-bar bar-core-after bar-core-after", "first render is correct");
  run(function() {
    set(view, 'context.prefix', 'beforeChanged');
    set(view, 'context.value', 'coreChanged');
    set(view, 'context.suffix', 'afterChanged');
  });
  equal(view.$().text(), "before-core-bar beforeChanged-coreChanged-bar bar-core-after bar-coreChanged-afterChanged", "only bound values change");
});

test("should be able to render unbound forms of multi-arg helpers", function() {
  view = EmberView.create({
    template: compile("{{concat foo bar bing}} {{unbound concat foo bar bing}}"),
    context: EmberObject.create({
      foo: "a",
      bar: "b",
      bing: "c"
    })
  });
  appendView(view);

  equal(view.$().text(), "abc abc", "first render is correct");

  run(function() {
    set(view, 'context.bar', 'X');
  });

  equal(view.$().text(), "aXc abc", "unbound helpers/properties stayed the same");
});


test("should be able to render an unbound helper invocation for helpers with dependent keys", function() {
  view = EmberView.create({
    template: compile("{{capitalizeName person}} {{unbound capitalizeName person}} {{concatNames person}} {{unbound concatNames person}}"),
    context: EmberObject.create({
      person: EmberObject.create({
        firstName: 'shooby',
        lastName:  'taylor'
      })
    })
  });
  appendView(view);

  equal(view.$().text(), "SHOOBY SHOOBY shoobytaylor shoobytaylor", "first render is correct");

  run(function() {
    set(view, 'context.person.firstName', 'sally');
  });

  equal(view.$().text(), "SALLY SHOOBY sallytaylor shoobytaylor", "only bound values change");
});


test("should be able to render an unbound helper invocation in #each helper", function() {
  view = EmberView.create({
    template: compile(
      [ "{{#each person in people}}",
        "{{capitalize person.firstName}} {{unbound capitalize person.firstName}}",
        "{{/each}}"].join("")),
    context: {
      people: Ember.A([
        {
          firstName: 'shooby',
          lastName:  'taylor'
        },
        {
          firstName: 'cindy',
          lastName:  'taylor'
        }
    ])}
  });
  appendView(view);

  equal(view.$().text(), "SHOOBY SHOOBYCINDY CINDY", "unbound rendered correctly");
});


test("should be able to render an unbound helper invocation with bound hash options", function() {
  try {
    registerBoundHelper('repeat', function(value) {
      return [].slice.call(arguments, 0, -1).join('');
    });


    view = EmberView.create({
      template: compile("{{capitalizeName person}} {{unbound capitalizeName person}} {{concatNames person}} {{unbound concatNames person}}"),
      context: EmberObject.create({
        person: EmberObject.create({
          firstName: 'shooby',
          lastName:  'taylor'
        })
      })
    });
    appendView(view);

    equal(view.$().text(), "SHOOBY SHOOBY shoobytaylor shoobytaylor", "first render is correct");

    run(function() {
      set(view, 'context.person.firstName', 'sally');
    });

    equal(view.$().text(), "SALLY SHOOBY sallytaylor shoobytaylor", "only bound values change");
  } finally {
    delete defaultEnv.helpers.repeat;
  }
});

QUnit.module("HTMLBars {{#unbound}} helper -- Container Lookup", {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
    Ember.lookup = lookup = { Ember: Ember };
    container = new Container();
    container.optionsForType('helper', { instantiate: false });
  },

  teardown: function() {
    if (view) {
      run(view, 'destroy');
    }
    Ember.lookup = originalLookup;
    Ember.View.defaultTemplateEnv = null;
  }
});

test("should lookup helpers in the container", function() {
  container.register('helper:up-case', makeBoundHelper(function(value) {
    return value.toUpperCase();
  }));

  view = EmberView.create({
    template: compile("{{unbound up-case displayText}}"),
    container: container,
    context: {
      displayText: 'such awesome'
    }
  });

  appendView(view);

  equal(view.$().text(), "SUCH AWESOME", "proper values were rendered");

  run(function() {
    set(view, 'context.displayText', 'no changes');
  });

  equal(view.$().text(), "SUCH AWESOME", "only bound values change");
});
