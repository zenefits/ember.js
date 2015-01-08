/*globals __dirname*/

var path = require('path');
var distPath = path.join(__dirname, '../../dist');
var Ember = require(path.join(distPath, 'ember.debug.cjs'));
Ember.testing = true;
var DOMHelper = Ember.View.DOMHelper;

QUnit.config.notrycatch = true;

QUnit.module("App boot");

QUnit.test("App is created without throwing an exception", function() {
  var App;

  Ember.run(function() {
    App = Ember.Application.create();

    App.Router = Ember.Router.extend({
      location: 'none'
    });

    App.advanceReadiness();
  });

  QUnit.ok(App);
});

QUnit.test("It is possible to render a view in Node", function() {
  var SimpleDOM = require('./simple-dom');
  var View = Ember.View.extend({
    renderer: new Ember.View._Renderer(new DOMHelper(new SimpleDOM.Document())),
    template: Ember.Handlebars.compile("<h1>Hello</h1>")
  });

  var morph = {
    contextualElement: {},
    setContent: function(element) {
      this.element = element;
    }
  };

  var view = View.create({
    _domHelper: new DOMHelper(new SimpleDOM.Document()),
    _morph: morph
  });

  var renderer = view.renderer;

  Ember.run(function() {
    renderer.renderTree(view);
  });

  var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

  ok(serializer.serialize(morph.element).match(/<h1>Hello<\/h1>/));
});

QUnit.test("It is possible to render a view with curlies in Node", function() {
  var SimpleDOM = require('./simple-dom');
  var View = Ember.Component.extend({
    renderer: new Ember.View._Renderer(new DOMHelper(new SimpleDOM.Document())),
    layout: Ember.Handlebars.compile("<h1>Hello {{location}}</h1>"),
    location: "World"
  });

  var morph = {
    contextualElement: {},
    setContent: function(element) {
      this.element = element;
    }
  };

  var view = View.create({
    _domHelper: new DOMHelper(new SimpleDOM.Document()),
    _morph: morph
  });

  var renderer = view.renderer;

  Ember.run(function() {
    renderer.renderTree(view);
  });

  var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

  ok(serializer.serialize(morph.element).match(/<h1>Hello World<\/h1>/));
});

QUnit.test("It is possible to render a view with an {{#if}} helper in Node", function() {
  var SimpleDOM = require('./simple-dom');
  var View = Ember.Component.extend({
    renderer: new Ember.View._Renderer(new DOMHelper(new SimpleDOM.Document())),
    layout: Ember.Handlebars.compile("<h1>Hello {{#if hasExistence}}{{location}}{{/if}}</h1>"),
    location: "World",
    hasExistence: true
  });

  var morph = {
    contextualElement: {},
    setContent: function(element) {
      this.element = element;
    }
  };

  var view = View.create({
    _domHelper: new DOMHelper(new SimpleDOM.Document()),
    _morph: morph
  });

  var renderer = view.renderer;

  Ember.run(function() {
    renderer.renderTree(view);
  });

  var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

  console.log(morph.element);
  //console.log(serializer.serialize(morph.element));

  ok(serializer.serialize(morph.element).match(/<h1>Hello World<\/h1>/));
});
