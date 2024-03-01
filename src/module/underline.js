/**
 * 模块：下划线 主要用于修饰节点 一般用于主题
 */
define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');
    var rainbowColors = require('../core/config').rainbowColors;
    var Minder = require('../core/minder');
    var MinderNode = require('../core/node');
    var Command = require('../core/command');
    var Module = require('../core/module');
    var Renderer = require('../core/render');

    var UnderLineRender = kity.createClass('UnderLineRender', {
        base: Renderer,

        create: function(node) {

            var underline = new kity.Path()
                .setId(utils.uuid('node_underline'));

            this.bringToBack = true;

            return underline;
        },

         shouldRender: function(node) {
            return node.getStyle('underline-width');
        },

        update: function(underline, node, box) {

            var shape = node.getStyle('shape');

            var paddingLeft = node.getStyle('padding-left'),
                paddingRight = node.getStyle('padding-right'),
                paddingTop = node.getStyle('padding-top'),
                paddingBottom = node.getStyle('padding-bottom');

            var offsetHeight = box.height + paddingTop;
            var underlineHeight = node.getData('underline-height') || node.getStyle('underline-height');
            var underWidth = node.getStyle('underline-width');
            var underColor = node.getStyle('underline-color') || '#2970FF';
            var idx = 0;
            var nodeType = node.getType();
            switch (nodeType) {
                case 'root':
                    idx = 0;
                    break;
                case 'main':
                    idx = 1;
                    break;
                default:
                    idx = 2;
                    break;
            }
            var outlineBox = {
                x: box.x - paddingLeft,
                y: box.y - paddingTop + offsetHeight,
                width: box.width + paddingLeft + paddingRight,
                height: underWidth[idx]
            };


            var radius = node.getStyle('radius');
            // 天盘图圆形的情况
            // if (shape && shape == 'circle') {
            //     var p = Math.pow;
            //     var r = Math.round;

            //     radius = r(Math.sqrt(p(outlineBox.width, 2) + p(outlineBox.height, 2)) / 2);

            //     outlineBox.x = box.cx - radius;
            //     outlineBox.y = box.cy - radius;
            //     outlineBox.width = 2 * radius;
            //     outlineBox.height = 2 * radius;
            // }

            var fillColor = node.getData('background') || node.getStyle('underline-color');
            if (node.getType() === 'main' && node.getStyle('rainbow-branch')) {
                var idx = node.getIndex();
                fillColor = rainbowColors[idx % rainbowColors.length];
            }
            underline
                .setPathData([
                    'M', outlineBox.x, outlineBox.y + outlineBox.height,
                    'H', outlineBox.x + outlineBox.width
                ])
                .stroke(
                    underColor,
                    underWidth[idx]
                )

            underline.node.setAttribute('stroke-linecap', 'round');

            return new kity.Box(outlineBox);
        }
    });

   var wireframeOption = /wire/.test(window.location.href);

    Module.register('UnderlineModule', function() {
        return {
            events: (!wireframeOption ? null : {
                'ready': function() {
                },
                'layoutallfinish': function() {
                    // this.getRoot().traverse(function(node) {
                    //     node.getRenderer('WireframeRenderer').update(null, node, node.getContentBox());
                    // });
                }
            }),
            renderers: {
                outline: UnderLineRender
            }
        };
    });
});