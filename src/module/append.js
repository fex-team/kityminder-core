/**
 * @file Appender
 * @author Gavin
 */
define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');
    var Module = require('../core/module');
    var Renderer = require('../core/render');

    var Appender = kity.createClass('Appender', {
        base: kity.Group,

        constructor: function(node) {
            var strokeColor = node.getStyle('selected-stroke');
            var gap = 2;
            var r = this.radius = 6;
            this.callBase();
            this.outline = new kity.Circle(r).stroke(strokeColor).fill('white');
            this.line = [
                new kity.Line(-r + gap, 0, r - gap, 0).stroke(strokeColor),
                new kity.Line(0, -r + gap, 0, r - gap).stroke(strokeColor)
            ];
            this.addShapes([this.outline].concat(this.line));
            this.setId(utils.uuid('node_appender'));
            this.setStyle('cursor', 'pointer');
            this.bind(node);
        },

        bind: function(node) {
            this.on('click', function (e) {
                node.getMinder().execCommand('AppendChildNode', '输入文字');
            });
        }
    });

    var AppenderRenderer = kity.createClass('AppenderRenderer', {
        base: Renderer,

        create: function(node) {
            if (node.isRoot()) return;
            this.appender = new Appender(node);
            node.getRenderContainer().prependShape(this.appender);
            node.appenderRenderer = this;
            this.node = node;
            return this.appender;
        },

        shouldRender: function(node) {
            return !node.isRoot() && node.isSelected() && !node.getMinder()._isMarqueeMode();
        },

        update: function(appender, node) {
            if (!node.parent) return;
            var x = node.getLayoutBox().width + 4;
            this.appender.setTranslate(x, 0);
        }
    });

    Module.register('Appender', function() {
        return {
            renderers: {
                outside: AppenderRenderer
            }
        };
    });
});
