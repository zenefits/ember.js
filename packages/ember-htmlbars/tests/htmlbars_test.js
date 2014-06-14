import { compile } from "htmlbars-compiler/compiler";
import { defaultEnv } from "ember-htmlbars";
import run from "ember-metal/run_loop";

function fragmentHTML(fragment) {
  var html = '', node;
  for (var i = 0, l = fragment.childNodes.length; i < l; i++) {
    node = fragment.childNodes[i];
    if (node.nodeType === 3) {
      html += node.nodeValue;
    } else {
      html += node.outerHTML;
    }
  }
  return html;
}

function appendView(view) {
  run(function() { view.appendTo('#qunit-fixture'); });
}

function destroyView(view) {
  run(function() { view.destroy(); });
}


QUnit.module("ember-htmlbars", {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
  },
  teardown: function() {
    Ember.View.defaultTemplateEnv = null;
  }
});

test("hello world", function() {
  var template = compile("ohai {{name}}");
  var output = template({name: 'erik'}, defaultEnv);
  equal(fragmentHTML(output), "ohai erik");
});

test("Basic Ember.View integration", function() {
  var template = compile("ohai {{name}}");
  var view = Ember.View.create({
    template: template,
    context: {name: 'erik'}
  });
  appendView(view);
  equal(view.$().text(), "ohai erik");
  destroyView(view);
});