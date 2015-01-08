(function() {
    "use strict";
    function $$document$node$$Node(nodeType, nodeName, nodeValue) {
      this.nodeType = nodeType;
      this.nodeName = nodeName;
      this.nodeValue = nodeValue;

      this.parentNode = null;
      this.previousSibling = null;
      this.nextSibling = null;
      this.firstChild = null;
      this.lastChild = null;
    }

    $$document$node$$Node.prototype.appendChild = function(node) {
      if (node.nodeType === $$document$node$$Node.DOCUMENT_FRAGMENT_NODE) {
        /*jshint boss:true*/
        for (var frag = node; node = frag.firstChild;) {
          this.appendChild(node);
        }

        return;
      }

      if (node.parentNode) { node.parentNode.removeChild(node); }

      node.parentNode = this;
      var refNode = this.lastChild;
      if (refNode === null) {
        this.firstChild = node;
        this.lastChild = node;
      } else {
        node.previousSibling = refNode;
        refNode.nextSibling = node;
        this.lastChild = node;
      }
    };

    $$document$node$$Node.prototype.insertBefore = function(node, refNode) {
      if (refNode == null) {
        return this.appendChild(node);
      }
      node.parentNode = this;
      refNode.previousSibling = node;
      node.nextSibling = refNode;
      if (this.firstChild === refNode) {
        this.firstChild = node;
      }
    };

    $$document$node$$Node.prototype.removeChild = function(refNode) {
      if (this.firstChild === refNode) {
        this.firstChild = refNode.nextSibling;
      }
      if (this.lastChild === refNode) {
        this.lastChild = refNode.previousSibling;
      }
      if (refNode.previousSibling) {
        refNode.previousSibling.nextSibling = refNode.nextSibling;
      }
      if (refNode.nextSibling) {
        refNode.nextSibling.previousSibling = refNode.previousSibling;
      }
      refNode.parentNode = null;
      refNode.nextSibling = null;
      refNode.previousSibling = null;
    };

    $$document$node$$Node.ELEMENT_NODE = 1;
    $$document$node$$Node.ATTRIBUTE_NODE = 2;
    $$document$node$$Node.TEXT_NODE = 3;
    $$document$node$$Node.CDATA_SECTION_NODE = 4;
    $$document$node$$Node.ENTITY_REFERENCE_NODE = 5;
    $$document$node$$Node.ENTITY_NODE = 6;
    $$document$node$$Node.PROCESSING_INSTRUCTION_NODE = 7;
    $$document$node$$Node.COMMENT_NODE = 8;
    $$document$node$$Node.DOCUMENT_NODE = 9;
    $$document$node$$Node.DOCUMENT_TYPE_NODE = 10;
    $$document$node$$Node.DOCUMENT_FRAGMENT_NODE = 11;
    $$document$node$$Node.NOTATION_NODE = 12;

    var $$document$node$$default = $$document$node$$Node;

    function $$document$element$$Element(tagName) {
      tagName = tagName.toUpperCase();

      this.nodeConstructor(1, tagName, null);
      this.attributes = [];
      this.tagName = tagName;
    }

    $$document$element$$Element.prototype = Object.create($$document$node$$default.prototype);
    $$document$element$$Element.prototype.constructor = $$document$element$$Element;
    $$document$element$$Element.prototype.nodeConstructor = $$document$node$$default;

    $$document$element$$Element.prototype.getAttribute = function(_name) {
      var attributes = this.attributes;
      var name = _name.toLowerCase();
      var attr;
      for (var i=0, l=attributes.length; i<l; i++) {
        attr = attributes[i];
        if (attr.name === name) {
          return attr.value;
        }
      }
      return '';
    };

    $$document$element$$Element.prototype.setAttribute = function(_name, value) {
      var attributes = this.attributes;
      var name = _name.toLowerCase();
      var attr;
      for (var i=0, l=attributes.length; i<l; i++) {
        attr = attributes[i];
        if (attr.name === name) {
          attr.value = value;
          return;
        }
      }
      attributes.push({
        name: name,
        value: value,
        specified: true // serializer compat with old IE
      });
    };

    $$document$element$$Element.prototype.removeAttribute = function(name) {
      var attributes = this.attributes;
      for (var i=0, l=attributes.length; i<l; i++) {
        var attr = attributes[i];
        if (attr.name === name) {
          attributes.splice(i, 1);
          return;
        }
      }
    };

    var $$document$element$$default = $$document$element$$Element;

    function $$document$text$$Text(text) {
      this.nodeConstructor(3, '#text', text);
    }

    $$document$text$$Text.prototype = Object.create($$document$node$$default.prototype);
    $$document$text$$Text.prototype.constructor = $$document$text$$Text;
    $$document$text$$Text.prototype.nodeConstructor = $$document$node$$default;

    var $$document$text$$default = $$document$text$$Text;

    function $$document$comment$$Comment(text) {
      this.nodeConstructor(8, '#comment', text);
    }

    $$document$comment$$Comment.prototype = Object.create($$document$node$$default.prototype);
    $$document$comment$$Comment.prototype.constructor = $$document$comment$$Comment;
    $$document$comment$$Comment.prototype.nodeConstructor = $$document$node$$default;

    var $$document$comment$$default = $$document$comment$$Comment;

    function $$document$document$fragment$$DocumentFragment() {
      this.nodeConstructor(11, '#document-fragment', null);
    }

    $$document$document$fragment$$DocumentFragment.prototype = Object.create($$document$node$$default.prototype);
    $$document$document$fragment$$DocumentFragment.prototype.constructor = $$document$document$fragment$$DocumentFragment;
    $$document$document$fragment$$DocumentFragment.prototype.nodeConstructor = $$document$node$$default;

    var $$document$document$fragment$$default = $$document$document$fragment$$DocumentFragment;

    function simple$dom$document$$Document() {
      this.nodeConstructor(this, 9, '#document', null);
      this.documentElement = new $$document$element$$default('html');
      this.body = new $$document$element$$default('body');
      this.documentElement.appendChild(this.body);
      this.appendChild(this.documentElement);
    }

    simple$dom$document$$Document.prototype = Object.create($$document$node$$default.prototype);
    simple$dom$document$$Document.prototype.constructor = simple$dom$document$$Document;
    simple$dom$document$$Document.prototype.nodeConstructor = $$document$node$$default;

    simple$dom$document$$Document.prototype.createElement = function(tagName) {
      return new $$document$element$$default(tagName);
    };

    simple$dom$document$$Document.prototype.createTextNode = function(text) {
      return new $$document$text$$default(text);
    };

    simple$dom$document$$Document.prototype.createComment = function(text) {
      return new $$document$comment$$default(text);
    };

    simple$dom$document$$Document.prototype.createDocumentFragment = function() {
      return new $$document$document$fragment$$default();
    };

    var simple$dom$document$$default = simple$dom$document$$Document;
    function simple$dom$html$parser$$HTMLParser(tokenize, document, voidMap) {
      this.tokenize = tokenize;
      this.document = document;
      this.voidMap = voidMap;
      this.stack = [];
      this.nodes = null;
      this.element = null;
      this.input = null;
    }

    simple$dom$html$parser$$HTMLParser.prototype.isVoid = function(element) {
      return this.voidMap[element.nodeName] === true;
    };

    simple$dom$html$parser$$HTMLParser.prototype.pushElement = function(token) {
      var el = this.document.createElement(token.tagName);
      for (var i=0;i<token.attributes.length;i++) {
        var attr = token.attributes[i];
        el.setAttribute(attr[0],attr[1]);
      }

      if (this.isVoid(el)) {
        this.appendChild(el);
        return;
      }

      if (this.element) {
        this.stack.push(this.element);
      }
      this.element = el;
    };

    simple$dom$html$parser$$HTMLParser.prototype.popElement = function(token) {
      var el = this.element;
      if (el.nodeName !== token.tagName.toUpperCase()) {
        throw new Error('unbalanced tag');
      }

      if (this.stack.length) {
        this.element = this.stack.pop();
      } else {
        this.element = null;
      }
      this.appendChild(el);
    };

    simple$dom$html$parser$$HTMLParser.prototype.appendText = function(token) {
      var text = this.document.createTextNode(token.chars);
      this.appendChild(text);
    };

    simple$dom$html$parser$$HTMLParser.prototype.appendComment = function(token) {
      var comment = this.document.createComment(token.chars);
      this.appendChild(comment);
    };

    simple$dom$html$parser$$HTMLParser.prototype.appendChild = function(node) {
      if (this.element) {
        this.element.appendChild(node);
      } else {
        this.nodes.push(node);
      }
    };

    simple$dom$html$parser$$HTMLParser.prototype.parse = function(html/*, context*/) {
      // TODO use context for namespaceURI issues
      this.nodes = [];
      var tokens = this.tokenize(html);
      for (var i=0, l=tokens.length; i<l; i++) {
        var token = tokens[i];
        switch (token.type) {
          case 'StartTag':
            this.pushElement(token);
            break;
          case 'EndTag':
            this.popElement(token);
            break;
          case 'Chars':
            this.appendText(token);
            break;
          case 'Comment':
            this.appendComment(token);
            break;
        }
      }
      return this.nodes;
    };

    var simple$dom$html$parser$$default = simple$dom$html$parser$$HTMLParser;
    function simple$dom$html$serializer$$HTMLSerializer(voidMap) {
      this.voidMap = voidMap;
    }

    simple$dom$html$serializer$$HTMLSerializer.prototype.openTag = function(element) {
      return '<' + element.nodeName.toLowerCase() + this.attributes(element.attributes) + '>';
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.closeTag = function(element) {
      return '</' + element.nodeName.toLowerCase() + '>';
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.isVoid = function(element) {
      return this.voidMap[element.nodeName] === true;
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.attributes = function(namedNodeMap) {
      var buffer = '';
      for (var i=0, l=namedNodeMap.length; i<l; i++) {
        buffer += this.attr(namedNodeMap[i]);
      }
      return buffer;
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.escapeAttrValue = function(attrValue) {
      return attrValue.replace(/[&"]/g, function(match) {
        switch(match) {
          case '&':
            return '&amp;';
          case '\"':
            return '&quot;';
        }
      });
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.attr = function(attr) {
      if (!attr.specified) {
        return '';
      }
      if (attr.value) {
        return ' ' + attr.name + '="' + this.escapeAttrValue(attr.value) + '"';
      }
      return ' ' + attr.name;
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.escapeText = function(textNodeValue) {
      return textNodeValue.replace(/[&<>]/g, function(match) {
        switch(match) {
          case '&':
            return '&amp;';
          case '<':
            return '&lt;';
          case '>':
            return '&gt;';
        }
      });
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.text = function(text) {
      return this.escapeText(text.nodeValue);
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.comment = function(comment) {
      return '<!--'+comment.nodeValue+'-->';
    };

    simple$dom$html$serializer$$HTMLSerializer.prototype.serialize = function(node) {
      var buffer = '';
      var next;

      // open
      switch (node.nodeType) {
        case 1:
          buffer += this.openTag(node);
          break;
        case 3:
          buffer += this.text(node);
          break;
        case 8:
          buffer += this.comment(node);
          break;
        default:
          break;
      }

      next = node.firstChild;
      if (next) {
        buffer += this.serialize(next);
      }

      if (node.nodeType === 1 && !this.isVoid(node)) {
        buffer += this.closeTag(node);
      }

      next = node.nextSibling;
      if (next) {
        buffer += this.serialize(next);
      }

      return buffer;
    };

    var simple$dom$html$serializer$$default = simple$dom$html$serializer$$HTMLSerializer;

    var simple$dom$void$map$$default = {
      AREA: true,
      BASE: true,
      BR: true,
      COL: true,
      COMMAND: true,
      EMBED: true,
      HR: true,
      IMG: true,
      INPUT: true,
      KEYGEN: true,
      LINK: true,
      META: true,
      PARAM: true,
      SOURCE: true,
      TRACK: true,
      WBR: true
    };

    (function (root, factory) {
      if (typeof define === 'function' && define.amd) {
        define([], factory);
      } else if (typeof exports === 'object') {
        module.exports = factory();
      } else {
        root.SimpleDOM = factory();
      }
    }(this, function () {
      return {
        Document: simple$dom$document$$default,
        voidMap: simple$dom$void$map$$default,
        HTMLSerializer: simple$dom$html$serializer$$default,
        HTMLParser: simple$dom$html$parser$$default
      };
    }));
}).call(this);

//# sourceMappingURL=simple-dom.js.map