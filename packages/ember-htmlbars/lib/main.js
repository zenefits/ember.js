import { content, element, subexpr, lookupHelper } from "bound-templates/runtime";
import LazyValue from "bound-templates/lazy-value";
import { ifHelper, unlessHelper } from "ember-htmlbars/helpers/if_unless";
import streamFor from "ember-htmlbars/hooks/streamFor";
import locHelper from "ember-htmlbars/helpers/loc";
import debuggerHelper from "ember-htmlbars/helpers/debugger";
import logHelper from "ember-htmlbars/helpers/log";

export var defaultEnv = {
  hooks: {
    content: content,
    element: element,
    subexpr: subexpr,
    lookupHelper: lookupHelper,

    streamFor: streamFor
  },

  helpers: {
    loc: locHelper,
    debugger: debuggerHelper,
    log: logHelper,
    if: ifHelper,
    unless: unlessHelper
  }
};