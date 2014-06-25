import { content, element, subexpr, lookupHelper } from "bound-templates/runtime";
import LazyValue from "bound-templates/lazy-value";
import { ifHelper, unlessHelper } from "ember-htmlbars/helpers/if_unless";
import streamFor from "ember-htmlbars/hooks/streamFor";
import locHelper from "ember-htmlbars/helpers/loc";
import debuggerHelper from "ember-htmlbars/helpers/debugger";
import logHelper from "ember-htmlbars/helpers/log";
import { eachHelper } from "ember-htmlbars/helpers/each";
import collectionHelper from "ember-htmlbars/helpers/collection";
import viewHelper from "ember-htmlbars/helpers/view";
import { bindAttrHelper, bindAttrHelperDeprecated } from "ember-htmlbars/helpers/bind-attr";
import { inputHelper, textareaHelper } from "ember-htmlbars/controls";
import { actionHelper } from "ember-htmlbars/helpers/action";
import withHelper from "ember-htmlbars/helpers/with";

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
    view: viewHelper,
    collection: collectionHelper,
    each: eachHelper,
    input: inputHelper,
    textarea: textareaHelper,
    'bind-attr': bindAttrHelper,
    bindAttr: bindAttrHelperDeprecated,
    action: actionHelper,
    if: ifHelper,
    unless: unlessHelper,
    with: withHelper
  }
};

Ember.htmlbarsDefaultEnv = defaultEnv;
