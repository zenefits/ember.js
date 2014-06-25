import { get } from "ember-metal/property_get";
import { appendChild } from "ember-metal-views";
import { computed } from "ember-metal/computed";

// FIXME: duplicated in STREAM_FOR
var CONST_REGEX = /^[A-Z][^.]*\./;
var VIEW_KEYWORD_REGEX = /^view\./;

function bindingify(hash) {
  var ret = {}, key, value;
  for (key in hash) {
    value = hash[key];
    if (value && value.isLazyValue) {
      ret[key+'Binding'] = value;
    } else {
      ret[key] = value;
    }
  }
  return ret;
}

function viewHelper(params, options, env) {
  var hash = bindingify(options.hash);
  if (hash.class) { hash.classNames = hash.class.split(' '); }
  if (hash.id) { hash.elementId = hash.id; }

  if (options.render) { hash.template = options.render; }
  hash._morph = options.morph;
  // hash.templateOptions = {data: options.data, helpers: options.helpers};

  var viewClassOrName = params[0] || Ember.View,
      parentView = env.data.view,
      childView;

  hash.templateData = env.data;

  if (typeof viewClassOrName === 'string') {
    if (CONST_REGEX.test(viewClassOrName)) {
      viewClassOrName = get(null, viewClassOrName);
    } else if (VIEW_KEYWORD_REGEX.test(viewClassOrName)) {
      viewClassOrName = get(parentView, viewClassOrName.slice(5));
    } else {
      viewClassOrName = parentView.container.lookupFactory('view:' + viewClassOrName);
    }
  } else if (viewClassOrName.isLazyValue) {
    viewClassOrName = viewClassOrName.value();
  }

  var newViewProto = viewClassOrName.proto ? viewClassOrName.proto() : viewClassOrName;

  // We only want to override the `_context` computed property if there is
  // no specified controller. See View#_context for more information.
  if (!newViewProto.controller && !newViewProto.controllerBinding && !hash.controller && !hash.controllerBinding) {
    hash._context = parentView.get('context');
  }

  childView = parentView.appendChild(viewClassOrName, hash);
}

export default viewHelper;