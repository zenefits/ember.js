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

  var preserveContext = true;

  var viewOptions = {
    morph: options.morph,
    preserveContext: preserveContext,
    shouldDisplayFunc: shouldDisplayIfHelperContent,
    valueNormalizerFunc: shouldDisplayIfHelperContent,
    displayTemplate: options.render,
    inverseTemplate: options.inverse,
    lazyValue: params[0],
    previousLazyValue: params[0],
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

}