import { _HtmlbarsBoundView } from "ember-htmlbars/views/htmlbars_bound_view";
import { apply } from "ember-metal/utils";
import jQuery from "ember-views/system/jquery";
import { guidFor } from "ember-metal/utils";
import { bind as emberBind } from "ember-metal/binding";
import { create as o_create } from "ember-metal/platform";
import { isGlobalPath } from "ember-metal/binding";
import { get } from "ember-metal/property_get";
import isNone from 'ember-metal/is_none';
import { EmberObserverLazyValue } from 'ember-htmlbars/utils';

function exists(value) {
  return !isNone(value);
}

var WithView = _HtmlbarsBoundView.extend({
  init: function() {
    var controller;

    apply(this, this._super, arguments);

    var keywords        = this.templateData.keywords;
    var keywordName     = this.templateHash.keywordName;
    var keywordPath     = this.templateHash.keywordPath;
    var controllerName  = this.templateHash.controller;
    var preserveContext = this.preserveContext;

    if (controllerName) {
      var previousContext = this.parentContext;
      controller = this.container.lookupFactory('controller:'+controllerName).create({
        parentController: previousContext,
        target: previousContext
      });

      this._generatedController = controller;

      if (!preserveContext) {
        this.set('controller', controller);

        this.valueNormalizerFunc = function(result) {
            controller.set('model', result);
            return controller;
        };
      } else {
        var controllerPath = jQuery.expando + guidFor(controller);
        keywords[controllerPath] = controller;

        // emberBind(keywords, controllerPath + '.model', keywordPath);

        // FIXME: Revisit this. Should we support binding lazyValues at runtime?
        Ember.set(keywords, controllerPath + '.model', keywordPath.value());
        keywordPath.onNotify(function() {
          Ember.set(keywords, controllerPath + '.model', keywordPath.value());
        });

        // FIXME: meh
        keywordPath = new EmberObserverLazyValue(keywords, controllerPath);
      }
    }

    if (preserveContext) {
      // emberBind(keywords, keywordName, keywordPath);

      // FIXME: Revisit this. Should we support binding lazyValues at runtime?
      Ember.set(keywords, keywordName, keywordPath.value());
      keywordPath.onNotify(function() {
        Ember.set(keywords, keywordName, keywordPath.value());
      });
    }

  },
  willDestroy: function() {
    this._super();

    if (this._generatedController) {
      this._generatedController.destroy();
    }
  }
});

/**
  Use the `{{with}}` helper when you want to scope context. Take the following code as an example:

  ```handlebars
  <h5>{{user.name}}</h5>

  <div class="role">
    <h6>{{user.role.label}}</h6>
    <span class="role-id">{{user.role.id}}</span>

    <p class="role-desc">{{user.role.description}}</p>
  </div>
  ```

  `{{with}}` can be our best friend in these cases,
  instead of writing `user.role.*` over and over, we use `{{#with user.role}}`.
  Now the context within the `{{#with}} .. {{/with}}` block is `user.role` so you can do the following:

  ```handlebars
  <h5>{{user.name}}</h5>

  <div class="role">
    {{#with user.role}}
      <h6>{{label}}</h6>
      <span class="role-id">{{id}}</span>

      <p class="role-desc">{{description}}</p>
    {{/with}}
  </div>
  ```

  ### `as` operator

  This operator aliases the scope to a new name. It's helpful for semantic clarity and to retain
  default scope or to reference from another `{{with}}` block.

  ```handlebars
  // posts might not be
  {{#with user.posts as blogPosts}}
    <div class="notice">
      There are {{blogPosts.length}} blog posts written by {{user.name}}.
    </div>

    {{#each post in blogPosts}}
      <li>{{post.title}}</li>
    {{/each}}
  {{/with}}
  ```

  Without the `as` operator, it would be impossible to reference `user.name` in the example above.

  NOTE: The alias should not reuse a name from the bound property path.
  For example: `{{#with foo.bar as foo}}` is not supported because it attempts to alias using
  the first part of the property path, `foo`. Instead, use `{{#with foo.bar as baz}}`.

  ### `controller` option

  Adding `controller='something'` instructs the `{{with}}` helper to create and use an instance of
  the specified controller with the new context as its content.

  This is very similar to using an `itemController` option with the `{{each}}` helper.

  ```handlebars
  {{#with users.posts controller='userBlogPosts'}}
    {{!- The current context is wrapped in our controller instance }}
  {{/with}}
  ```

  In the above example, the template provided to the `{{with}}` block is now wrapped in the
  `userBlogPost` controller, which provides a very elegant way to decorate the context with custom
  functions/properties.

  @method with
  @for Ember.Handlebars.helpers
  @param {Function} context
  @param {Hash} options
  @return {String} HTML string
*/
// function withHelper(context, options) {
function withHelper(params, options, env) {
  var controller, helperName = 'with';

  // if (arguments.length === 4) {
  //   var keywordName, path, rootPath, normalized, contextPath;

  //   Ember.assert("If you pass more than one argument to the with helper, it must be in the form #with foo as bar", arguments[1] === "as");
  //   options = arguments[3];
  //   keywordName = arguments[2];
  //   path = arguments[0];

  //   if (path) {
  //     helperName += ' ' + path + ' as ' + keywordName;
  //   }

  //   Ember.assert("You must pass a block to the with helper", options.fn && options.fn !== Handlebars.VM.noop);

  //   var localizedOptions = o_create(options);
  //   localizedOptions.data = o_create(options.data);
  //   localizedOptions.data.keywords = o_create(options.data.keywords || {});

  //   if (isGlobalPath(path)) {
  //     contextPath = path;
  //   } else {
  //     normalized = normalizePath(this, path, options.data);
  //     path = normalized.path;
  //     rootPath = normalized.root;

  //     // This is a workaround for the fact that you cannot bind separate objects
  //     // together. When we implement that functionality, we should use it here.
  //     var contextKey = jQuery.expando + guidFor(rootPath);
  //     localizedOptions.data.keywords[contextKey] = rootPath;
  //     // if the path is '' ("this"), just bind directly to the current context
  //     contextPath = path ? contextKey + '.' + path : contextKey;
  //   }

  //   localizedOptions.hash.keywordName = keywordName;
  //   localizedOptions.hash.keywordPath = contextPath;

  //   bindContext = this;
  //   context = path;
  //   options = localizedOptions;
  //   preserveContext = true;
  // } else {
  //   Ember.assert("You must pass exactly one argument to the with helper", arguments.length === 2);
  //   Ember.assert("You must pass a block to the with helper", options.fn && options.fn !== Handlebars.VM.noop);

  //   helperName += ' ' + context;
  //   bindContext = options.contexts[0];
  //   preserveContext = false;
  // }

  // options.helperName = helperName;
  // options.isWithHelper = true;

  // return bind.call(bindContext, context, options, preserveContext, exists);

  // return bind.call(context, property, fn, true, shouldDisplayIfHelperContent, shouldDisplayIfHelperContent, ['isTruthy', 'length']);

  var context = params[0],
      bindContext = context,
      lazyValue;
  var preserveContext = false;

  var localizedData = env.data;

  if (context && context.isKeyword) {
    preserveContext = true;

    localizedData = o_create(env.data);
    localizedData.keywords = o_create(env.data.keywords || {});

    // if (isGlobalPath(path)) {
    //   contextPath = path;
    // } else {
    //   normalized = normalizePath(this, path, env.data);
    //   path = normalized.path;
    //   rootPath = normalized.root;

    //   // This is a workaround for the fact that you cannot bind separate objects
    //   // together. When we implement that functionality, we should use it here.
    //   var contextKey = jQuery.expando + guidFor(rootPath);
    //   localizedOptions.data.keywords[contextKey] = rootPath;
    //   // if the path is '' ("this"), just bind directly to the current context
    //   contextPath = path ? contextKey + '.' + path : contextKey;
    // }

    options.hash.keywordName = context.to;
    options.hash.keywordPath = context.lazyValue;
    lazyValue = context.lazyValue;

    context = get(options.context, 'context'); // FIXME: revisit this
  } else {
    lazyValue = context;
  }

  var viewOptions = {
    _morph: options.morph,
    preserveContext: preserveContext,
    parentContext: get(options.context, 'context'), // FIXME: revisit this
    shouldDisplayFunc: exists,
    valueNormalizerFunc: null,
    displayTemplate: options.render,
    inverseTemplate: options.inverse,
    lazyValue: lazyValue,
    previousLazyValue: lazyValue,
    isEscaped: !options.hash.unescaped,
    templateData: localizedData,
    templateHash: options.hash,
    helperName: options.helperName
  };

  var view = env.data.view;
  var bindView = view.createChildView(WithView, viewOptions);
  view.appendChild(bindView);
}

export default withHelper;