define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');

    var Minder = require('../core/minder');
    var MinderNode = require('../core/node');
    var Command = require('../core/command');
    var Module = require('../core/module');
    var Renderer = require('../core/render');

    /**
     * @command AppendChildNode
     * @description 添加子节点到选中的节点中
     * @param {string|object} textOrData 要插入的节点的文本或数据
     * @state
     *    0: 当前有选中的节点
     *   -1: 当前没有选中的节点
     */
    var AppendChildCommand = kity.createClass('AppendChildCommand', {
        base: Command,
        execute: function(km, text) {
            var parent = km.getSelectedNode();
            if (!parent) {
                return null;
            }
            parent.expand();
            var node = km.createNode(text, parent);
            km.select(node, true);
            node.render();
            km.layout(600);
        },
        queryState: function(km) {
            var selectedNode = km.getSelectedNode();
            return selectedNode ? 0 : -1;
        }
    });

    /**
     * @command AppendSiblingNode
     * @description 添加选中的节点的兄弟节点
     * @param {string|object} textOrData 要添加的节点的文本或数据
     * @state
     *    0: 当前有选中的节点
     *   -1: 当前没有选中的节点
     */
    var AppendSiblingCommand = kity.createClass('AppendSiblingCommand', {
        base: Command,
        execute: function(km, text) {
            var sibling = km.getSelectedNode();
            var parent = sibling.parent;
            if (!parent) {
                return km.execCommand('AppendChildNode', text);
            }
            var node = km.createNode(text, parent, sibling.getIndex() + 1);
            km.select(node, true);
            node.render();
            km.layout(600);
        },
        queryState: function(km) {
            var selectedNode = km.getSelectedNode();
            return selectedNode ? 0 : -1;
        }
    });

    /**
     * @command RemoveNode
     * @description 移除选中的节点
     * @state
     *    0: 当前有选中的节点
     *   -1: 当前没有选中的节点
     */
    var RemoveNodeCommand = kity.createClass('RemoverNodeCommand', {
        base: Command,
        execute: function(km) {
            var nodes = km.getSelectedNodes();
            var ancestor = MinderNode.getCommonAncestor.apply(null, nodes);

            nodes.forEach(function(node) {
                if (!node.isRoot()) km.removeNode(node);
            });

            km.select(ancestor || km.getRoot(), true);
            km.layout(600);
        },
        queryState: function(km) {
            var selectedNode = km.getSelectedNode();
            return selectedNode ? 0 : -1;
        }
    });

    /**
     * @command EditNode
     * @description 编辑选中的节点
     * @state
     *    0: 当前有选中的节点
     *   -1: 当前没有选中的节点
     */
    var EditNodeCommand = kity.createClass('EditNodeCommand', {
        base: Command,
        execute: function(km) {
            var selectedNode = km.getSelectedNode();
            if (!selectedNode) {
                return null;
            }
            km.select(selectedNode, true);
            km.textEditNode(selectedNode);
        },
        queryState: function(km) {
            var selectedNode = km.getSelectedNode();
            if (!selectedNode) {
                return -1;
            } else {
                return 0;
            }
        },
        isNeedUndo: function() {
            return false;
        }
    });

    Module.register('NodeModule', function() {
        return {

            commands: {
                'AppendChildNode': AppendChildCommand,
                'AppendSiblingNode': AppendSiblingCommand,
                'RemoveNode': RemoveNodeCommand,
                'EditNode': EditNodeCommand
            },

            'contextmenu': [{
                command: 'appendsiblingnode'
            }, {
                command: 'appendchildnode'
            }, {
                command: 'editnode'
            }, {
                command: 'removenode'
            }, {
                divider: 1
            }],

            'commandShortcutKeys': {
                'appendsiblingnode': 'normal::Enter',
                'appendchildnode': 'normal::Insert|Tab',
                'editnode': 'normal::F2',
                'removenode': 'normal::Del|Backspace'
            }
        };
    });
});