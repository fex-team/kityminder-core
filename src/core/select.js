
define(function(require, exports, module) {
    var kity = require('./kity');
    var utils = require('./utils');
    var Minder = require('./minder');
    var MinderNode = require('./node');
    var MinderRelation = require('./relation');

    Minder.registerInitHook(function() {
        this._initSelection();
        this._initRelationSelection();
    });

    // 选区管理
    kity.extendClass(Minder, {
        _initSelection: function() {
            this._selectedNodes = [];
        },
        renderChangedSelection: function(last) {
            var current = this.getSelectedNodes();
            var changed = [];

            current.forEach(function(node) {
                if (last.indexOf(node) == -1) {
                    changed.push(node);
                }
            });

            last.forEach(function(node) {
                if (current.indexOf(node) == -1) {
                    changed.push(node);
                }
            });

            if (changed.length) {
                this._interactChange();
                this.fire('selectionchange');
            }
            while (changed.length) {
                changed.shift().render();
            }
        },
        getSelectedNodes: function() {
            //不能克隆返回，会对当前选区操作，从而影响querycommand
            return this._selectedNodes;
        },
        getSelectedNode: function() {
            return this.getSelectedNodes()[0] || null;
        },
        removeAllSelectedNodes: function() {
            var me = this;
            var last = this._selectedNodes.splice(0);
            this._selectedNodes = [];
            this.renderChangedSelection(last);
            return this.fire('selectionclear');
        },
        removeSelectedNodes: function(nodes) {
            var me = this;
            var last = this._selectedNodes.slice(0);
            nodes = utils.isArray(nodes) ? nodes : [nodes];

            nodes.forEach(function(node) {
                var index;
                if ((index = me._selectedNodes.indexOf(node)) === -1) return;
                me._selectedNodes.splice(index, 1);
            });

            this.renderChangedSelection(last);
            return this;
        },
        select: function(nodes, isSingleSelect) {
            var lastSelect = this.getSelectedNodes().slice(0);
            if (isSingleSelect) {
                this._selectedNodes = [];
            }
            var me = this;
            nodes = utils.isArray(nodes) ? nodes : [nodes];
            nodes.forEach(function(node) {
                if (me._selectedNodes.indexOf(node) !== -1) return;
                me._selectedNodes.unshift(node);
            });
            this.renderChangedSelection(lastSelect);
            return this;
        },
        selectById: function(ids, isSingleSelect) {
            ids = utils.isArray(ids) ? ids : [ids];
            var nodes = this.getNodesById(ids);
            return this.select(nodes, isSingleSelect);
        },
        //当前选区中的节点在给定的节点范围内的保留选中状态，
        //没在给定范围的取消选中，给定范围中的但没在当前选中范围的也做选中效果
        toggleSelect: function(node) {
            if (utils.isArray(node)) {
                node.forEach(this.toggleSelect.bind(this));
            } else {
                if (node.isSelected()) this.removeSelectedNodes(node);
                else this.select(node);
            }
            return this;
        },

        isSingleSelect: function() {
            return this._selectedNodes.length == 1;
        },

        getSelectedAncestors: function(includeRoot) {
            var nodes = this.getSelectedNodes().slice(0),
                ancestors = [],
                judge;

            // 根节点不参与计算
            var rootIndex = nodes.indexOf(this.getRoot());
            if (~rootIndex && !includeRoot) {
                nodes.splice(rootIndex, 1);
            }

            // 判断 nodes 列表中是否存在 judge 的祖先
            function hasAncestor(nodes, judge) {
                for (var i = nodes.length - 1; i >= 0; --i) {
                    if (nodes[i].isAncestorOf(judge)) return true;
                }
                return false;
            }

            // 按照拓扑排序
            nodes.sort(function(node1, node2) {
                return node1.getLevel() - node2.getLevel();
            });

            // 因为是拓扑有序的，所以只需往上查找
            while ((judge = nodes.pop())) {
                if (!hasAncestor(nodes, judge)) {
                    ancestors.push(judge);
                }
            }

            return ancestors;
        }
    });

    kity.extendClass(MinderNode, {
        isSelected: function() {
            var minder = this.getMinder();
            return minder && minder.getSelectedNodes().indexOf(this) != -1;
        }
    });

    kity.extendClass(MinderRelation, {
        isSelected: function() {
            var minder = this.getMinder();
            return minder && minder.getSelectedRelations().indexOf(this) != -1
        }
    });

    // 关联线选择
    kity.extendClass(Minder, {
        _initRelationSelection: function() {
            this._selectedRelation = [];
        },

        renderChangedRelationSelection: function(last) {
            var current = this.getSelectedRelations();
            var changed = [];

            current.forEach(function(relation) {
                if (last.indexOf(relation) === -1) {
                    changed.push(relation);
                }
            });

            last.forEach(function(relation) {
                if (current.indexOf(relation) == -1) {
                    changed.push(relation);
                }
            });

            if (changed.length) {
                this._interactChange();
                this.fire('selectionchange');
            }

            while(changed.length) {
                changed.shift().render();
            }
        },

        removeAllRelationSelected: function() {
            var me = this;
            var last = this._selectedRelation.splice(0);
            this._selectedRelation = [];
            this.renderChangedRelationSelection(last);
            return this.fire('selectionclear');
        },

        removeSelectedRelations:function(relations){
            var me = this;
            var last = this._selectedRelation.slice(0);
            relations = utils.isArray(relations) ? relations : [relations];

            relations.forEach(function(relation) {
                var index;
                if ((index = me._selectedRelation.indexOf(relation)) === -1) return;
                me._selectedRelation.splice(index, 1);
            });

            this.renderChangedRelationSelection(last);
            return this;
        },

        selectRelation: function(relations, isSingleSelect) {
            var lastSelect = this.getSelectedRelations().slice(0);

            if (isSingleSelect) {
                this._selectedRelation = [];
            }

            var me = this;
            relations = utils.isArray(relations) ? relations : [relations];
            relations.forEach(function(relation) {
                if (me._selectedRelation.indexOf(relation) !== -1) return;
                me._selectedRelation.unshift(relation);
            });

            this.renderChangedRelationSelection(lastSelect);
            return this;
        },

        selectRelationById: function(ids, isSingleSelect) {
            ids = utils.isArray(ids) ? ids : [ids];
            var relations = this.getRelationsById(ids);
            return this.selectRelation(relations, isSingleSelect);
        },

        getSelectedRelations: function() {
            return this._selectedRelation;
        },

        getSelectedRelation:function(){
            return this.getSelectedRelations()[0] || null;
        },

        toggleRelationSelect: function(relation) {
            if (utils.isArray(relation)) {
                relation.forEach(this.toggleRelationSelect.bind(this));
            } else {
                if (relation.isSelected()) this.removeSelectedRelations(relation);
                else this.selectRelation(relation);
            }
            return this;
        },

        isRelationSingleSelect: function() {
            return this._selectedRelation.length == 1;
        },
    });

});