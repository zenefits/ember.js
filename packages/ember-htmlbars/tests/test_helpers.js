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
  run(function() {
    view.appendTo('#qunit-fixture');
  });
}

function destroyView(view) {
  run(function() {
    view.destroy();
  });
}

function set(obj, key, value) {
  run(function() {
    Ember.set(obj, key, value);
  });
}

export { fragmentHTML, appendView, destroyView, set };
