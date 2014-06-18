/*jshint debug:true*/

/**
@module ember
@submodule ember-htmlbars
*/
import Ember from "ember-metal/core"; // Ember.FEATURES,
import { inspect } from "ember-metal/utils";
import Logger from "ember-metal/logger";

/**
  `log` allows you to output the value of variables in the current rendering
  context. `log` also accepts primitive types such as strings or numbers.

  ```handlebars
  {{log "myVariable:" myVariable }}
  ```

  @method log
  @for Ember.Handlebars.helpers
  @param {String} property
*/
function logHelper(params, options, env) {
  var logger = Logger.log,
      values = [],
      allowPrimitives = true,
      param, value;

  for (var i = 0; i < params.length; i++) {
    param = value = params[i];

    if (param && param.isLazyValue) {
      value = param.value();
    }

    values.push(value);
  }

  logger.apply(logger, values);
}

export default logHelper;