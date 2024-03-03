/**
 * @file relation 关联线
 * @author Gavin
 */

define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');
    var Module = require('../core/module');
    var Command = require('../core/command');

    Module.register('Relation', function() {
        /**
         * @command Relation
         * @description 创建联系线
         * @param
         * @state
        */
        var relation = kity.createClass('RelationCommand', {
            base: Command,
            execute: function(km) {
                this.setContentChanged(false);
                if(km.relationDrawing) return;
                relationActivator.startRelation();
                var nodes = km.getSelectedNodes();
                if(nodes.length > 2) return;
                if(nodes.length > 0) {
                    km.fire('relationChange', {
                        node: nodes
                    });
                }
            },
        });

        var minder = this,
            relationMode = false,
            relationAry = [],
            minderRelation;
        var relationActivator = function() {
            return {
                relationKeyDown: function(e) {
                    var downNode = e.getTargetNode();
                    if (downNode && downNode !== relationAry[0]) {
                        minder.fire('relationChange', {
                            node: downNode
                        });
                    }
                    else {
                        minder.removeRelationNode(minderRelation);
                        relationActivator.endRelation();
                    }
                },

                relationKeyMove: function(e) {
                    minderRelation.updateLine(e.getPosition());
                },

                renderRelationAry: function(nodes) {
                    if (utils.isArray(nodes)) {
                        relationAry = relationAry.concat(nodes);
                    }
                    else {
                        relationAry.push(nodes);
                    }
                    if (relationAry.length > 0) {
                        if (relationAry.length > 0) {
                            if (!minderRelation) {
                                minderRelation = minder.createRelation({from: relationAry[0].getData('id')});
                                minderRelation.create();
                            }
                        }
                        if (relationAry.length > 1) {
                            minderRelation.setData('to', relationAry[1].getData('id'));
                            // 触发更新
                            minder.fire('contentchange');
                            // 选中当前联系线
                            minder.selectRelation(minderRelation, true);
                            relationActivator.endRelation();
                            minder.fire('relationFinish', {
                                node: minderRelation
                            });
                        }
                    }
                },
                startRelation: function() {
                    relationMode = true;
                    minder.relationDrawing = true;
                    minder.setStatus('draw', true);
                },
                endRelation: function() {
                    relationMode = false;
                    relationAry = [];
                    minderRelation = '';
                    minder.relationDrawing = false;
                    minder.rollbackStatus();
                }
            };
        }();

        return {
            init: function() {
                var minder = this;
                minder._relationArray = [];
                minder._relationContainer = new kity.Group().setId(utils.uuid('minder_relation_group'));
                minder.getRenderContainer().addShapeBefore(minder._relationContainer);
            },

            events: {
                'draw.mousedown': function(e) {
                    if (relationMode) {
                        relationActivator.relationKeyDown(e);
                    }
                },
                'mousemove': function(e) {
                    if(!relationMode || relationAry.length != 1) return;
                    relationActivator.relationKeyMove(e);
                },

                'mouseup': function() {
                    if (minder.getStatus() == 'dragBezier') {
                        minder.rollbackStatus();
                    }

                    if (this.getSelectedRelations().length <= 0) {
                        return;
                    }
                },

                'relationChange': function(nodes) {
                    relationActivator.renderRelationAry(nodes.node);
                },

                'layoutRelation contentchange': function(e) {
                    var minder = e.minder;
                    var relations = minder.getRelations();
                    relations.forEach(function(relation) {
                        relation.update();
                    });
                },

                'nodedetach': function(e) {
                    this.removeRelationByNode(e.node);
                },

                'nodeattach': function(e) {
                    var _this = this;
                    var  disableArr = [];
                    var nodeRelations = this.getRelationsByNodeId(e.node.getData('id'));
                    if (nodeRelations.length > 0) {
                        nodeRelations.forEach(function(relation) {
                            var fromNode = relation.getFromNode();
                            var toNode = relation.getToNode();
                            if (fromNode.parent && toNode.parent) {
                                _this.attachRelation(relation);
                            }
                            else {
                                disableArr.push(relation);
                            }
                        });
                    }

                    if (disableArr.length > 0) {
                        disableArr.forEach(function(item) {
                            _this.removeRelationNode(item);
                        });
                    }
                },
            },

            commands: {
                'relation': relation,
            },

            'commandShortcutKeys': {
                'relation': 'normal::Ctrl+L',
            },
        };
    });
});
