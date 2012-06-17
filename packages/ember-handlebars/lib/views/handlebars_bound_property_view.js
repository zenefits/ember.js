require('ember-handlebars/views/metamorph_view');

var getPath = Ember.Handlebars.getPath, escapeExpression = Handlebars.Utils.escapeExpression;

Ember._HandlebarsBoundPropertyView = Ember.Object.extend(Ember._Metamorph, {
  isView: true,

  path: null,
  pathRoot: null,
  templateData: null,
  isEscaped: true,

  // CoreView?
  renderToBuffer: function (buffer) {
    var result = getPath(this.pathRoot, this.path, { data: this.templateData });
    if (this.isEscaped) { result = escapeExpression(result); }

    this.beforeRender(buffer);
    buffer.push(result);
    this.afterRender(buffer);

    this.lastResult = result;
  },

  rerenderIfNeeded: function () {
    if (this.isDestroyed) { return; }

    var result = getPath(this.pathRoot, this.path, { data: this.templateData });
    if (result !== this.lastResult) {
      if (this.isEscaped) { result = escapeExpression(result); }

      // TODO add a CoreView that supports this rerender path and core states
      this.morph.html(result);

      this.lastResult = result;
    }
  },

  invokeRecursively: function (fn) { fn.call(this, this); },
  transitionTo: Ember.K,
  fire: Ember.K
});
