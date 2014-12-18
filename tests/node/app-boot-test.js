/*globals __dirname*/

(function() {
  var path = require('path');
  var distPath = path.join(__dirname, '../../dist');
  var module = QUnit.module;
  var test = QUnit.test;
  var strictEqual = QUnit.strictEqual;
  var ok = QUnit.ok;
  var start = QUnit.start;
  var stop = QUnit.stop;

  module("App boot");

  test("App is created without throwing an exception", function() {
    var Ember = require(path.join(distPath, 'ember.debug.cjs'));
    var App = Ember.Application.create();

    App.Router.reopen({
      location: 'none'
    });

    App.advanceReadiness();

    ok(App);
  });

  test("App can be booted and routed to a URL", function() {
    var Ember = require(path.join(distPath, 'ember.debug.cjs'));
    var App = Ember.Application.create();

    App.Router.reopen({
      location: 'none'
    });

    App.Router.map(function() {
      this.resource('user', { path: '/users/:user_id' });
    });

    App.UserRoute = Ember.Route.extend({
      model: function(params) {
        start();
        strictEqual(params.user_id, "wycats", "route params are passed to model hook");
      }
    });

    stop();

    App.boot().then(function(app) {
      app.visit("/users/wycats");
    });
  });
})();
