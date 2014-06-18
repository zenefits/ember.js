import run from "ember-metal/run_loop";

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

export { appendView, destroyView };