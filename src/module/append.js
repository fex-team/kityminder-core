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
            var conf = this.conf = {
                gap: 6,
                left: 0, // 距离左侧节点距离
                radius: 10,
                lineWidth: 2,
            };
            var r = this.radius = conf.radius;
            var gap = conf.gap;
            var lineWidth = conf.lineWidth;
            this.callBase();
            this.outline = new kity.Circle(r).stroke(strokeColor, lineWidth).fill('white');
            this.line = [
                new kity.Line(-r + gap, 0, r - gap, 0).stroke(strokeColor, lineWidth).setStyle('stroke-linecap', 'round'),
                new kity.Line(0, -r + gap, 0, r - gap).stroke(strokeColor, lineWidth).setStyle('stroke-linecap', 'round')
            ];
            this.addShapes([this.outline].concat(this.line));
            this.setId(utils.uuid('node_appender'));
            this.setStyle('cursor', 'pointer');
            this.bind(node);
        },

        bind: function(node) {
            this.on('click', function (e) {
                node.getMinder().execCommand('AppendChildNode', '');
            });
        }
    });

    var AppenderRenderer = kity.createClass('AppenderRenderer', {
        base: Renderer,

        create: function(node) {
            this.appender = new Appender(node);
            node.getRenderContainer().prependShape(this.appender);
            node.appenderRenderer = this;
            this.node = node;
            return this.appender;
        },

        shouldRender: function(node) {
            return node.getMinder().getOption('enableAppenderUI') !== false
                && node.isSelected()
                && !node.getMinder()._isMarqueeMode();
        },

        update: function(appender, node) {
            var box = node.getContentBox();
            var r = appender.conf.radius,
                l = appender.conf.left,
                lw = appender.conf.lineWidth;
            this.appender.setTranslate(box.width + box.x + r + l + lw / 2 + .5, 0);
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
