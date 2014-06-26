import { EmberObserverLazyValue } from "ember-htmlbars/utils";
import { get } from "ember-metal/property_get";
import LazyValue from "bound-templates/lazy-value";

var VIEW_KEYWORD_REGEX = /^view\./;
var FIRST_KEY = /^([^\.]+)/;

function streamFor(view, path) {
  var streams = view.streams;
  if (!streams) { streams = view.streams = {}; }
  var stream = streams[path];
  if (stream) { return stream; }

  // Ideally:
  // Ember.addObserver(view, 'context.' + path, this, 'streamPropertyDidChange');

  var keywords = view.templateData && view.templateData.keywords,
      matches = path.match(FIRST_KEY),
      firstKey = matches && matches[0];

  if (path === '') { // handle {{this}}
    // TODO: possible optimization: reuse the context observer that already exists.
    //       this would require us to return some other type of stream object.
    stream = new EmberObserverLazyValue(view, 'context');
  // } else if (VIEW_KEYWORD_REGEX.test(path)) {
    // stream = new EmberObserverLazyValue(view, path.slice(5));
  // } else if (view.context) {
  //   stream = new EmberObserverLazyValue(view.context, path);
  } else if (keywords && firstKey in keywords) {
    stream = new EmberObserverLazyValue(view, 'templateData.keywords.' + path);
  } else {
    stream = new EmberObserverLazyValue(view, 'context.'+path);
  }

  streams[path] = stream;
  return stream;
}

var CONST_REGEX = /(^[A-Z][^.]*)\.(.*)/;

export default function STREAM_FOR(context, path) {
  var ret;
  if (path === "this") { path = ""; }

  if (CONST_REGEX.test(path)) { // TODO: revisit
    var matches = path.match(CONST_REGEX);
    var rootPath = matches[1];
    var root = get(null, rootPath);
    ret = new EmberObserverLazyValue(root, matches[2]);
  } else if (context.isView) {
    ret = streamFor(context, path);
  } else {
    ret = new EmberObserverLazyValue(context, path);
  }

  // Stash original path to help handle deprecated unquoted helper usage
  ret._originalPath = path;

  return ret;
}