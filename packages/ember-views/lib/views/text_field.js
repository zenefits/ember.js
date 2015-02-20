/**
@module ember
@submodule ember-views
*/
import { get } from "ember-metal/property_get";
import Component from "ember-views/views/component";
import TextSupport from "ember-views/mixins/text_support";
import { observer } from "ember-metal/mixin";

/**

  The internal class used to create text inputs when the `{{input}}`
  helper is used with `type` of `text`.

  See [Handlebars.helpers.input](/api/classes/Ember.Handlebars.helpers.html#method_input)  for usage details.

  ## Layout and LayoutName properties

  Because HTML `input` elements are self closing `layout` and `layoutName`
  properties will not be applied. See [Ember.View](/api/classes/Ember.View.html)'s
  layout section for more information.

  @class TextField
  @namespace Ember
  @extends Ember.Component
  @uses Ember.TextSupport
*/
export default Component.extend(TextSupport, {
  instrumentDisplay: '{{input type="text"}}',

  classNames: ['ember-text-field'],
  tagName: "input",
  attributeBindings: [
    'accept',
    'autocomplete',
    'autosave',
    'dir',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'height',
    'inputmode',
    'lang',
    'list',
    'max',
    'min',
    'multiple',
    'name',
    'pattern',
    'size',
    'step',
    'type',
    'width'
  ],

  defaultLayout: null,

  /**
    The `value` attribute of the input element. As the user inputs text, this
    property is updated live.

    @property value
    @type String
    @default ""
  */
  value: "",

  /**
    The `type` attribute of the input element.

    @property type
    @type String
    @default "text"
  */
  type: "text",

  /**
    The `size` of the text field in characters.

    @property size
    @type String
    @default null
  */
  size: null,

  /**
    The `pattern` attribute of input element.

    @property pattern
    @type String
    @default null
  */
  pattern: null,

  /**
    The `min` attribute of input element used with `type="number"` or `type="range"`.

    @property min
    @type String
    @default null
    @since 1.4.0
  */
  min: null,

  /**
    The `max` attribute of input element used with `type="number"` or `type="range"`.

    @property max
    @type String
    @default null
    @since 1.4.0
  */
  max: null,

  _updateElementValue: observer('value', function() {
    // ZN: HACKHACK copied from the text area component, because the cursor is getting
    // reset as of ember 1.11.0-beta.1 - https://github.com/emberjs/ember.js/issues/10449
    // We do this check so cursor position doesn't get affected in IE
    var value = get(this, 'value');
    var $el = this.$();
    if ($el && value !== $el.val()) {
      $el.val(value);
    }
  }),

  init: function() {
    this._super.apply(this, arguments);
    this.on("didInsertElement", this, this._updateElementValue);
  }
});
