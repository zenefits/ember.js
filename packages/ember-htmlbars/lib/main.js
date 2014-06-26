import { content, element, subexpr, lookupHelper } from "bound-templates/runtime";
import LazyValue from "bound-templates/lazy-value";
import streamFor from "ember-htmlbars/hooks/streamFor";
import locHelper from "ember-htmlbars/helpers/loc";
import debuggerHelper from "ember-htmlbars/helpers/debugger";
import logHelper from "ember-htmlbars/helpers/log";
import { eachHelper } from "ember-htmlbars/helpers/each";
import collectionHelper from "ember-htmlbars/helpers/collection";
import viewHelper from "ember-htmlbars/helpers/view";
import emberLookupHelper from "ember-htmlbars/hooks/lookupHelper";

export var defaultEnv = {
  hooks: {
    content: content,
    element: element,
    subexpr: subexpr,
    lookupHelper: function(name, env) {
      var helper = emberLookupHelper(name, env);
      if (!helper) {
        helper = lookupHelper(name, env);
      }
      return helper;
    },

    streamFor: streamFor
  },

  helpers: {
    loc: locHelper,
    debugger: debuggerHelper,
    log: logHelper,
    view: viewHelper,
    collection: collectionHelper,
    each: eachHelper
  }
};