/**
 * @file relation control module
 * @author Gavin
 */

define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');
    var Minder = require('../core/minder');
    var keymap = require('../core/keymap');
    var Module = require('../core/module');
    var Command = require('../core/command');
    var MinderRelation = require('../core/relation');

    var relationControl;

    var RelationControl = kity.createClass('RelationControl', {
        constructor: function(minder) {
            this.minder = minder;
        },

        create: function() {
            // 起点
            var p0 = this.p0 = new kity.Circle(5).fill('#2970FF');
            // 起点控制点
            var p1 = this.p1 = new kity.Rect(12, 12).fill('#2970FF');
            // 终点控制点
            var p2 = this.p2 = new kity.Rect(12, 12).fill('#2970FF');
            // 终点
            var p3 = this.p3 = new kity.Circle(5).fill('#2970FF');
            var l1 = this.l1 = new kity.Line().stroke('#2970FF', 1.5);
            var l2 = this.l2 = new kity.Line().stroke('#2970FF', 1.5);
            this.bindEvent();
            return [p0, p1, p2, p3, l1, l2];
        },

        setRelation: function(relation) {
            this.relation = relation;
        },

        getRelation: function() {
            return this.relation;
        },

        onMousedown: function(e, i) {
            e.stopPropagation();
            e.preventDefault();
            this.startPosition = e.getPosition('view');
            this.isTempDrag = true;
            this.pointIndex = i;
        },

        onMousemove: function(e) {
            var relation = this.getRelation();
            var controls = relation && relation.getData('controls');
            if (this.isTempDrag && this.pointIndex >= 0 && controls.length > 0) {
                e.stopPropagation();
                e.preventDefault();

                var curPos = e.getPosition(this.minder.getRenderContainer());
                var i = this.pointIndex;
                controls[i].x = curPos.x;
                controls[i].y = curPos.y;
                this.relation.setData('controls', controls);
                this.update();
                this.minder.fire('selectrelationchange', relation);
            }
        },

        onMouseup: function() {
            if (this.isTempDrag) {
                this.isTempDrag = false;
            }
            if (this.pointIndex >= 0) {
                this.pointIndex = -1;
            }
        },

        bindEvent: function() {
            var me = this;
            utils.each([this.p1, this.p2], function(p, index) {
                p.on('mousedown', function(e) {
                    me.onMousedown(e, index + 1);
                });
            });

            this.minder.on('beforemousemove', function (e) {
                me.onMousemove(e);
            });

            this.minder.on('beforemouseup', function (e) {
                me.onMouseup(e);
            });
        },

        update: function() {
            var relation = this.getRelation();
            var c = relation && relation.getData('controls');
            if (c && c.length) {
                this.p0.setTranslate(c[0].x, c[0].y);
                this.p1.setTranslate(c[1].x, c[1].y - this.p1.width / 2);
                this.p2.setTranslate(c[2].x, c[2].y - this.p1.width / 2);
                this.p3.setTranslate(c[3].x, c[3].y);
                this.l1.setPathData(['M', c[0].x, c[0].y, 'L', c[1].x, c[1].y]);
                this.l2.setPathData(['M', c[2].x, c[2].y, 'L', c[3].x, c[3].y]);
            }
        }
    });

    Module.register('RelationControl', function() {
        return {
            init: function() {
                this._relationControlContainer = new kity.Group().setId(utils.uuid('minder_relation_control_group'));
                this.getRenderContainer().addShape(this._relationControlContainer);
            },

            events: {
                showRelationControl: function(relation) {
                    if (!relationControl) {
                        relationControl = new RelationControl(this);
                        this._relationControlContainer.addShapes(relationControl.create());
                        this._relationControlContainer.bringTop();
                    }

                    this._relationControlContainer.setVisible(true);
                    relationControl.setRelation(relation);
                    relationControl.update();
                },

                hideRelationControl: function() {
                    this._relationControlContainer.setVisible(false);
                },
            }
        };
    });
});
