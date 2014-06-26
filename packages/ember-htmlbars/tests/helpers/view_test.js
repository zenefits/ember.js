/*globals EmberDev */
import EmberView from "ember-views/views/view";
import run from "ember-metal/run_loop";
import jQuery from "ember-views/system/jquery";
import { compile } from "htmlbars-compiler/compiler";
import { defaultEnv } from "ember-htmlbars";
import { appendView, destroyView } from "ember-htmlbars/tests/test_helpers";

var view, originalLookup;

var container = {
  lookupFactory: function() { }
};

function viewClass(options) {
  options.container = options.container || container;
  return EmberView.extend(options);
}

QUnit.module("HTMLBars {{#view}} helper", {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
    originalLookup = Ember.lookup;
  },

  teardown: function() {
    Ember.lookup = originalLookup;

    if (view) {
      run(view, 'destroy');
    }

    Ember.View.defaultTemplateEnv = null;
  }
});

test("By default view:default is used", function() {
  var DefaultView = viewClass({
    elementId: 'default-view',
    template: compile('hello world')
  });

  var container = {
    lookupFactory: lookupFactory
  };

  view = EmberView.extend({
    template: compile('{{view}}'),
    container: container
  }).create();

  run(view, 'appendTo', '#qunit-fixture');

  equal(jQuery('#default-view').text(), 'hello world');

  function lookupFactory(fullName) {
    equal(fullName, 'view:default');

    return DefaultView;
  }
});

test("View lookup - App.FuView", function() {
  Ember.lookup = {
    App: {
      FuView: viewClass({
        elementId: "fu",
        template: compile("bro")
      })
    }
  };

  view = viewClass({
    template: compile("{{view App.FuView}}")
  }).create();

  run(view, 'appendTo', '#qunit-fixture');

  equal(jQuery('#fu').text(), 'bro');
});

test("View lookup - 'App.FuView'", function() {
  Ember.lookup = {
    App: {
      FuView: viewClass({
        elementId: "fu",
        template: compile("bro")
      })
    }
  };

  view = viewClass({
    template: compile("{{view 'App.FuView'}}")
  }).create();

  run(view, 'appendTo', '#qunit-fixture');

  equal(jQuery('#fu').text(), 'bro');
});

test("View lookup - 'fu'", function() {
  var FuView = viewClass({
    elementId: "fu",
    template: compile("bro")
  });

  var container = {
    lookupFactory: lookupFactory
  };

  view = EmberView.extend({
    template: compile("{{view 'fu'}}"),
    container: container
  }).create();

  run(view, 'appendTo', '#qunit-fixture');

  equal(jQuery('#fu').text(), 'bro');

  function lookupFactory(fullName) {
    equal(fullName, 'view:fu');

    return FuView;
  }
});

test("View lookup - view.computed", function() {
  var FuView = viewClass({
    elementId: "fu",
    template: compile("bro")
  });

  var container = {
    lookupFactory: lookupFactory
  };

  view = EmberView.extend({
    template: compile("{{view view.computed}}"),
    container: container,
    computed: 'fu'
  }).create();

  run(view, 'appendTo', '#qunit-fixture');

  equal(jQuery('#fu').text(), 'bro');

  function lookupFactory(fullName) {
    equal(fullName, 'view:fu');

    return FuView;
  }
});

// TODO: reenable before final merge
// test("id bindings downgrade to one-time property lookup", function() {
//   view = EmberView.extend({
//     template: compile("{{#view Ember.View id=view.meshuggah}}{{view.parentView.meshuggah}}{{/view}}"),
//     meshuggah: 'stengah'
//   }).create();

//   run(view, 'appendTo', '#qunit-fixture');

//   equal(jQuery('#stengah').text(), 'stengah', "id binding performed property lookup");
//   run(view, 'set', 'meshuggah', 'omg');
//   equal(jQuery('#stengah').text(), 'omg', "id didn't change");
// });

// TODO: reenable before final merge
// test("mixing old and new styles of property binding fires a warning, treats value as if it were quoted", function() {
//   if (EmberDev && EmberDev.runningProdBuild){
//     ok(true, 'Logging does not occur in production builds');
//     return;
//   }

//   expect(2);

//   var oldWarn = Ember.warn;

//   Ember.warn = function(msg) {
//     equal(msg, "You're attempting to render a view by passing borfBinding=view.snork to a view helper, but this syntax is ambiguous. You should either surround view.snork in quotes or remove `Binding` from borfBinding.");
//   };

//   view = EmberView.extend({
//     template: compile("{{#view Ember.View borfBinding=view.snork}}<p id='lol'>{{view.borf}}</p>{{/view}}"),
//     snork: "nerd"
//   }).create();

//   run(view, 'appendTo', '#qunit-fixture');

//   equal(jQuery('#lol').text(), "nerd", "awkward mixed syntax treated like binding");

//   Ember.warn = oldWarn;
// });
