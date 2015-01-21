define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');
    var MinderNode = require('../core/node');
    var Command = require('../core/command');
    var Module = require('../core/module');

    Module.register('ClipboardModule', function() {
        var km = this,

            _clipboardNodes = [],

            _selectedNodes = [];

        function appendChildNode(parent, child) {
            _selectedNodes.push(child);
            km.appendNode(child, parent);
            child.render();
            child.setLayoutOffset(null);
            var children = child.children.map(function(node) {
                return node.clone();
            });
            for (var i = 0, ci;
                (ci = children[i]); i++) {
                appendChildNode(child, ci);
            }
        }

        function sendToClipboard(nodes) {
            if (!nodes.length) return;
            nodes.sort(function(a, b) {
                return b.getIndex() - a.getIndex();
            });
            _clipboardNodes = nodes.map(function(node) {
                return node.clone();
            });
        }

        /**
         * @command Copy
         * @description 复制当前选中的节点
         * @shortcut Ctrl + C
         * @state
         *   0: 当前有选中的节点
         *  -1: 当前没有选中的节点
         */
        var CopyCommand = kity.createClass('CopyCommand', {
            base: Command,

            execute: function(km) {
                sendToClipboard(km.getSelectedAncestors(true));
                this.setContentChanged(false);
            }
        });

        /**
         * @command Cut
         * @description 剪切当前选中的节点
         * @shortcut Ctrl + X
         * @state
         *   0: 当前有选中的节点
         *  -1: 当前没有选中的节点
         */
        var CutCommand = kity.createClass('CutCommand', {
            base: Command,

            execute: function(km) {
                var ancestors = km.getSelectedAncestors();

                if (ancestors.length === 0) return;

                sendToClipboard(ancestors);

                km.select(MinderNode.getCommonAncestor(ancestors), true);

                ancestors.slice().forEach(function(node) {
                    km.removeNode(node);
                });

                km.layout(300);
            }
        });

        /**
         * @command Paste
         * @description 粘贴已复制的节点到每一个当前选中的节点上
         * @shortcut Ctrl + V
         * @state
         *   0: 当前有选中的节点
         *  -1: 当前没有选中的节点
         */
        var PasteCommand = kity.createClass('PasteCommand', {
            base: Command,

            execute: function(km) {
                if (_clipboardNodes.length) {
                    var node = km.getSelectedNode();
                    if (!node) return;

                    for (var i = 0, ni;
                        (ni = _clipboardNodes[i]); i++) {
                        appendChildNode(node, ni.clone());
                    }

                    km.select(_selectedNodes, true);
                    _selectedNodes = [];

                    km.layout(300);
                }
            },

            queryState: function(km) {
                return km.getSelectedNode() ? 0 : -1;
            }
        });

        return {
            'commands': {
                'copy': CopyCommand,
                'cut': CutCommand,
                'paste': PasteCommand
            },
            'commandShortcutKeys': {
                'copy': 'normal::ctrl+c|',
                'cut': 'normal::ctrl+x',
                'paste': 'normal::ctrl+v'
            }
        };
    });
});