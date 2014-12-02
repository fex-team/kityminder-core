/**
 * @fileOverview
 *
 * 布局模块
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

define(function(require, exports, module) {
    var kity = require('../core/kity');
    var Command = require('../core/command');
    var Module = require('../core/module');

    var LayoutCommand = kity.createClass('LayoutCommand', {
        base: Command,

        execute: function(minder, name) {
            var nodes = minder.getSelectedNodes();
            nodes.forEach(function(node) {
                node.layout(name);
            });
        },

        queryValue: function(minder) {
            var node = minder.getSelectedNode();
            if (node) {
                return node.getData('layout');
            }
        },

        queryState: function(minder) {
            return minder.getSelectedNode() ? 0 : -1;
        }
    });

    var ResetLayoutCommand = kity.createClass('ResetLayoutCommand', {
        base: Command,

        execute: function(minder, name) {
            var nodes = minder.getSelectedNodes();

            if (!nodes.length) nodes = [minder.getRoot()];

            nodes.forEach(function(node) {
                node.traverse(function(child) {
                    child.resetLayoutOffset();
                    if (!child.isRoot()) {
                        child.setData('layout', null);
                    }
                });
            });
            minder.layout(300);
        },

        enableReadOnly: true
    });

    Module.register('LayoutModule', {
        commands: {
            'layout': LayoutCommand,
            'resetlayout': ResetLayoutCommand
        },
        contextmenu: [{
            command: 'resetlayout'
        }, {
            divider: true
        }],

        commandShortcutKeys: {
            'resetlayout': 'Ctrl+Shift+L'
        }
    });

});