import { _HtmlbarsBoundView } from "ember-htmlbars/views/htmlbars_bound_view";
import { get } from "ember-metal/property_get";
import { isArray } from "ember-metal/utils";

function shouldDisplayIfHelperContent(result) {
  var truthy = result && get(result, 'isTruthy');
  if (typeof truthy === 'boolean') { return truthy; }

  if (isArray(result)) {
    return get(result, 'length') !== 0;
  } else {
    return !!result;
  }
}

// TODO: handle childProperties: isTruthy/length?
export function ifHelper(params, options, env) {
  Ember.assert("You must pass exactly one argument to the if helper", arguments.length === 3);
  Ember.assert("You must pass a block to the if helper", options.render && options.render !== Handlebars.VM.noop);

  options.helperName = options.helperName || ('if ' + options.context);

  // return bind.call(context, property, fn, true, shouldDisplayIfHelperContent, shouldDisplayIfHelperContent, ['isTruthy', 'length']);
  var lazyValue = params[0];

  lazyValue.addDependentKeys(['isTruthy', 'length']);

  var preserveContext = true;

  var viewOptions = {
    _morph: options.morph,
    preserveContext: preserveContext,
    parentContext: get(options.context, 'context'), // FIXME: revisit this
    shouldDisplayFunc: shouldDisplayIfHelperContent,
    valueNormalizerFunc: shouldDisplayIfHelperContent,
    displayTemplate: options.render,
    inverseTemplate: options.inverse,
    lazyValue: lazyValue,
    previousLazyValue: lazyValue,
    isEscaped: !options.hash.unescaped,
    templateData: env.data,
    templateHash: options.hash,
    helperName: options.helperName
  };

  var view = env.data.view;
  var bindView = view.createChildView(_HtmlbarsBoundView, viewOptions);
  view.appendChild(bindView);
}

export function unlessHelper(params, options, env) {
  Ember.assert("You must pass exactly one argument to the unless helper", arguments.length === 3);
  Ember.assert("You must pass a block to the unless helper", options.render && options.render !== Handlebars.VM.noop);

  options.helperName = options.helperName || ('unless ' + options.context);

  // return bind.call(context, property, fn, true, shouldDisplayIfHelperContent, shouldDisplayIfHelperContent, ['isTruthy', 'length']);
  var lazyValue = params[0];

  lazyValue.addDependentKeys(['isTruthy', 'length']);

  var preserveContext = true;

  var viewOptions = {
    _morph: options.morph,
    preserveContext: preserveContext,
    parentContext: get(options.context, 'context'), // FIXME: revisit this
    shouldDisplayFunc: shouldDisplayIfHelperContent,
    valueNormalizerFunc: shouldDisplayIfHelperContent,
    displayTemplate: options.inverse,
    inverseTemplate: options.render,
    lazyValue: lazyValue,
    previousLazyValue: lazyValue,
    isEscaped: !options.hash.unescaped,
    templateData: env.data,
    templateHash: options.hash,
    helperName: options.helperName
  };

  var view = env.data.view;
  var bindView = view.createChildView(_HtmlbarsBoundView, viewOptions);
  view.appendChild(bindView);
}