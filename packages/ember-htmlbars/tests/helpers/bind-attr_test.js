/*globals TemplateTests:true,Ember:true */

import { A } from "ember-runtime/system/native_array";
import EmberView from "ember-views/views/view";
import EmberObject from "ember-runtime/system/object";
import Namespace from "ember-runtime/system/namespace";
import { compile } from "htmlbars-compiler/compiler";
import { defaultEnv } from "ember-htmlbars";
import run from "ember-metal/run_loop";
import { computed } from "ember-metal/computed";
import { get } from "ember-metal/property_get";
import { set } from "ember-metal/property_set";

var view, TemplateTests;

var appendView = function() {
  run(function() { view.appendTo('#qunit-fixture'); });
};

QUnit.module("HTMLBars {{bind-attr}} helper", {
  setup: function() {
    Ember.View.defaultTemplateEnv = defaultEnv;
    window.TemplateTests = TemplateTests = Namespace.create();
  },

  teardown: function() {
    Ember.View.defaultTemplateEnv = null;
    run(function() {
      if (view) {
        view.destroy();
      }
      view = null;
    });
    window.TemplateTests = TemplateTests = undefined;
  }
});

test("should be able to bind element attributes using {{bind-attr}}", function() {
  var template = compile('<img {{bind-attr src="view.content.url" alt="view.content.title"}}>');

  view = EmberView.create({
    template: template,
    content: EmberObject.create({
      url: "http://www.emberjs.com/assets/images/logo.png",
      title: "The SproutCore Logo"
    })
  });

  appendView();

  equal(view.$('img').attr('src'), "http://www.emberjs.com/assets/images/logo.png", "sets src attribute");
  equal(view.$('img').attr('alt'), "The SproutCore Logo", "sets alt attribute");

  run(function() {
    set(view, 'content.title', "El logo de Eember");
  });

  equal(view.$('img').attr('alt'), "El logo de Eember", "updates alt attribute when content's title attribute changes");

  run(function() {
    set(view, 'content', EmberObject.create({
      url: "http://www.thegooglez.com/theydonnothing",
      title: "I CAN HAZ SEARCH"
    }));
  });

  equal(view.$('img').attr('alt'), "I CAN HAZ SEARCH", "updates alt attribute when content object changes");

  run(function() {
    set(view, 'content', {
      url: "http://www.emberjs.com/assets/images/logo.png",
      title: "The SproutCore Logo"
    });
  });

  equal(view.$('img').attr('alt'), "The SproutCore Logo", "updates alt attribute when content object is a hash");

  run(function() {
    set(view, 'content', EmberObject.createWithMixins({
      url: "http://www.emberjs.com/assets/images/logo.png",
      title: computed(function() {
        return "Nanananana Ember!";
      })
    }));
  });

  equal(view.$('img').attr('alt'), "Nanananana Ember!", "updates alt attribute when title property is computed");
});

test("should be able to bind to view attributes with {{bind-attr}}", function() {
  view = EmberView.create({
    value: 'Test',
    template: compile('<img src="test.jpg" {{bind-attr alt="view.value"}}>')
  });

  appendView();

  equal(view.$('img').attr('alt'), "Test", "renders initial value");

  run(function() {
    view.set('value', 'Updated');
  });

  equal(view.$('img').attr('alt'), "Updated", "updates value");
});

// test("should be able to bind to globals with {{bind-attr}}", function() {
//   TemplateTests.set('value', 'Test');
//
//   view = EmberView.create({
//     template: compile('<img src="test.jpg" {{bind-attr alt="TemplateTests.value"}}>')
//   });
//
//   appendView();
//
//   equal(view.$('img').attr('alt'), "Test", "renders initial value");
//
//   run(function() {
//     TemplateTests.set('value', 'Updated');
//   });
//
//   equal(view.$('img').attr('alt'), "Updated", "updates value");
// });

test("should not allow XSS injection via {{bind-attr}}", function() {
  view = EmberView.create({
    template: compile('<img src="test.jpg" {{bind-attr alt="view.content.value"}}>'),
    content: {
      value: 'Trololol" onmouseover="alert(\'HAX!\');'
    }
  });

  appendView();

  equal(view.$('img').attr('onmouseover'), undefined);
  // If the whole string is here, then it means we got properly escaped
  equal(view.$('img').attr('alt'), 'Trololol" onmouseover="alert(\'HAX!\');');
});

test("should be able to bind use {{bind-attr}} more than once on an element", function() {
  var template = compile('<img {{bind-attr src="view.content.url"}} {{bind-attr alt="view.content.title"}}>');

  view = EmberView.create({
    template: template,
    content: EmberObject.create({
      url: "http://www.emberjs.com/assets/images/logo.png",
      title: "The SproutCore Logo"
    })
  });

  appendView();

  equal(view.$('img').attr('src'), "http://www.emberjs.com/assets/images/logo.png", "sets src attribute");
  equal(view.$('img').attr('alt'), "The SproutCore Logo", "sets alt attribute");

  run(function() {
    set(view, 'content.title', "El logo de Eember");
  });

  equal(view.$('img').attr('alt'), "El logo de Eember", "updates alt attribute when content's title attribute changes");

  run(function() {
    set(view, 'content', EmberObject.create({
      url: "http://www.thegooglez.com/theydonnothing",
      title: "I CAN HAZ SEARCH"
    }));
  });

  equal(view.$('img').attr('alt'), "I CAN HAZ SEARCH", "updates alt attribute when content object changes");

  run(function() {
    set(view, 'content', {
      url: "http://www.emberjs.com/assets/images/logo.png",
      title: "The SproutCore Logo"
    });
  });

  equal(view.$('img').attr('alt'), "The SproutCore Logo", "updates alt attribute when content object is a hash");

  run(function() {
    set(view, 'content', EmberObject.createWithMixins({
      url: "http://www.emberjs.com/assets/images/logo.png",
      title: computed(function() {
        return "Nanananana Ember!";
      })
    }));
  });

  equal(view.$('img').attr('alt'), "Nanananana Ember!", "updates alt attribute when title property is computed");

});

test("{{bindAttr}} is aliased to {{bind-attr}}", function() {

  var originalBindAttr = defaultEnv.helpers['bind-attr'],
    originalWarn = Ember.warn;

  Ember.warn = function(msg) {
    equal(msg, "The 'bindAttr' view helper is deprecated in favor of 'bind-attr'", 'Warning called');
  };

  defaultEnv.helpers['bind-attr'] = function(context, params) {
    equal(params[0], 'foo', 'First arg match');
    equal(params[1], 'bar', 'Second arg match');
    return 'result';
  };
  var result = defaultEnv.helpers.bindAttr({}, ['foo', 'bar'], {}, defaultEnv);
  equal(result, 'result', 'Result match');

  defaultEnv.helpers['bind-attr'] = originalBindAttr;
  Ember.warn = originalWarn;
});

test("should be able to bind class attribute with {{bind-attr}}", function() {
  var template = compile('<img {{bind-attr class="view.foo"}}>');

  view = EmberView.create({
    template: template,
    foo: 'bar'
  });

  appendView();

  equal(view.$('img').attr('class'), 'bar', "renders class");

  run(function() {
    set(view, 'foo', 'baz');
  });

  equal(view.$('img').attr('class'), 'baz', "updates class");
});

test("should be able to bind class attribute via a truthy property with {{bind-attr}}", function() {
  var template = compile('<img {{bind-attr class="view.isNumber:is-truthy"}}>');

  view = EmberView.create({
    template: template,
    isNumber: 5
  });

  appendView();

  equal(view.$('.is-truthy').length, 1, "sets class name");

  run(function() {
    set(view, 'isNumber', 0);
  });

  equal(view.$('.is-truthy').length, 0, "removes class name if bound property is set to something non-truthy");
});

test("should be able to bind class to view attribute with {{bind-attr}}", function() {
  var template = compile('<img {{bind-attr class="view.foo"}}>');

  view = EmberView.create({
    template: template,
    foo: 'bar'
  });

  appendView();

  equal(view.$('img').attr('class'), 'bar', "renders class");

  run(function() {
    set(view, 'foo', 'baz');
  });

  equal(view.$('img').attr('class'), 'baz', "updates class");
});

test("should not allow XSS injection via {{bind-attr}} with class", function() {
  view = EmberView.create({
    template: compile('<img {{bind-attr class="view.foo"}}>'),
    foo: '" onmouseover="alert(\'I am in your classes hacking your app\');'
  });

  appendView();

  equal(view.$('img').attr('onmouseover'), undefined);
  // If the whole string is here, then it means we got properly escaped
  equal(view.$('img').attr('class'), '" onmouseover="alert(\'I am in your classes hacking your app\');');
});

test("should be able to bind class attribute using ternary operator in {{bind-attr}}", function() {
  var template = compile('<img {{bind-attr class="view.content.isDisabled:disabled:enabled"}} />');
  var content = EmberObject.create({
    isDisabled: true
  });

  view = EmberView.create({
    template: template,
    content: content
  });

  appendView();

  ok(view.$('img').hasClass('disabled'), 'disabled class is rendered');
  ok(!view.$('img').hasClass('enabled'), 'enabled class is not rendered');

  run(function() {
    set(content, 'isDisabled', false);
  });

  ok(!view.$('img').hasClass('disabled'), 'disabled class is not rendered');
  ok(view.$('img').hasClass('enabled'), 'enabled class is rendered');
});

test("should be able to add multiple classes using {{bind-attr class}}", function() {
  var template = compile('<div {{bind-attr class="view.content.isAwesomeSauce view.content.isAlsoCool view.content.isAmazing:amazing :is-super-duper view.content.isEnabled:enabled:disabled"}}></div>');
  var content = EmberObject.create({
    isAwesomeSauce: true,
    isAlsoCool: true,
    isAmazing: true,
    isEnabled: true
  });

  view = EmberView.create({
    template: template,
    content: content
  });

  appendView();

  ok(view.$('div').hasClass('is-awesome-sauce'), "dasherizes first property and sets classname");
  ok(view.$('div').hasClass('is-also-cool'), "dasherizes second property and sets classname");
  ok(view.$('div').hasClass('amazing'), "uses alias for third property and sets classname");
  ok(view.$('div').hasClass('is-super-duper'), "static class is present");
  ok(view.$('div').hasClass('enabled'), "truthy class in ternary classname definition is rendered");
  ok(!view.$('div').hasClass('disabled'), "falsy class in ternary classname definition is not rendered");

  run(function() {
    set(content, 'isAwesomeSauce', false);
    set(content, 'isAmazing', false);
    set(content, 'isEnabled', false);
  });

  ok(!view.$('div').hasClass('is-awesome-sauce'), "removes dasherized class when property is set to false");
  ok(!view.$('div').hasClass('amazing'), "removes aliased class when property is set to false");
  ok(view.$('div').hasClass('is-super-duper'), "static class is still present");
  ok(!view.$('div').hasClass('enabled'), "truthy class in ternary classname definition is not rendered");
  ok(view.$('div').hasClass('disabled'), "falsy class in ternary classname definition is rendered");
});

// test("should be able to bind classes to globals with {{bind-attr class}}", function() {
//   TemplateTests.set('isOpen', true);
// 
//   view = EmberView.create({
//     template: compile('<img src="test.jpg" {{bind-attr class="TemplateTests.isOpen"}}>')
//   });
// 
//   appendView();
// 
//   ok(view.$('img').hasClass('is-open'), "sets classname to the dasherized value of the global property");
// 
//   run(function() {
//     TemplateTests.set('isOpen', false);
//   });
// 
//   ok(!view.$('img').hasClass('is-open'), "removes the classname when the global property has changed");
// });

/*

NOTE: These tests require the {{with}} helper.

test("should be able to bind element attributes using {{bind-attr}} inside a block", function() {
  var template = compile('{{#with view.content}}<img {{bind-attr src="url" alt="title"}}>{{/with}}');

  view = EmberView.create({
    template: template,
    content: EmberObject.create({
      url: "http://www.emberjs.com/assets/images/logo.png",
      title: "The SproutCore Logo"
    })
  });

  appendView();

  equal(view.$('img').attr('src'), "http://www.emberjs.com/assets/images/logo.png", "sets src attribute");
  equal(view.$('img').attr('alt'), "The SproutCore Logo", "sets alt attribute");

  run(function() {
    set(view, 'content.title', "El logo de Eember");
  });

  equal(view.$('img').attr('alt'), "El logo de Eember", "updates alt attribute when content's title attribute changes");
});

*/

/*

NOTE: These tests require the {{each}} helper.

test("should be able to bind-attr to 'this' in an {{#each}} block", function() {
  view = EmberView.create({
    template: compile('{{#each view.images}}<img {{bind-attr src="this"}}>{{/each}}'),
    images: A(['one.png', 'two.jpg', 'three.gif'])
  });

  appendView();

  var images = view.$('img');
  ok(/one\.png$/.test(images[0].src));
  ok(/two\.jpg$/.test(images[1].src));
  ok(/three\.gif$/.test(images[2].src));
});

test("should be able to bind classes to 'this' in an {{#each}} block with {{bind-attr class}}", function() {
  view = EmberView.create({
    template: compile('{{#each view.items}}<li {{bind-attr class="this"}}>Item</li>{{/each}}'),
    items: A(['a', 'b', 'c'])
  });

  appendView();

  ok(view.$('li').eq(0).hasClass('a'), "sets classname to the value of the first item");
  ok(view.$('li').eq(1).hasClass('b'), "sets classname to the value of the second item");
  ok(view.$('li').eq(2).hasClass('c'), "sets classname to the value of the third item");
});

test("should be able to bind-attr to var in {{#each var in list}} block", function() {
  view = EmberView.create({
    template: compile('{{#each image in view.images}}<img {{bind-attr src="image"}}>{{/each}}'),
    images: A(['one.png', 'two.jpg', 'three.gif'])
  });

  appendView();

  var images = view.$('img');
  ok(/one\.png$/.test(images[0].src));
  ok(/two\.jpg$/.test(images[1].src));
  ok(/three\.gif$/.test(images[2].src));

  run(function() {
    var imagesArray = view.get('images');
    imagesArray.removeAt(0);
  });

  images = view.$('img');
  ok(images.length === 2, "");
  ok(/two\.jpg$/.test(images[0].src));
  ok(/three\.gif$/.test(images[1].src));
});

*/