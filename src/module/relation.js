/**
 * @file relation 关联线
 * @author Gavin
 */

define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');
    var Minder = require('../core/minder');
    var Module = require('../core/module');
    var Command = require('../core/command');
    var MinderRelation = require('../core/relation');

    Minder.registerInitHook(function() {
        this._relations = [];
    });

    function calculateBezierPoint(t, p0, p1, p2, p3) {
        var u = 1 - t;
        var tt = t * t;
        var uu = u * u;
        var uuu = uu * u;
        var ttt = tt * t;

        var x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
        var y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

        return { x: x, y: y };
    }

    kity.extendClass(MinderRelation, {
        create: function() {
            this.rc = new kity.Group().setId(utils.uuid('node_relation_group'));
            this.rc.relationNode = this;
            this.line = new kity.Bezier();
            this.lineCopy = new kity.Bezier();
            this.textGroup = new kity.Group();
            this.textShape = new kity.Text();
            this.rc.addShapes([this.line, this.lineCopy, this.textGroup]);
            this.textGroup.addShape(this.textShape);
            this.createMarker();
            this.bindEvent();
        },

        createMarker: function() {
            // dot
            this.marker.dot = new kity.Marker().pipe(function() {
                var r = 7;
                var shape = new kity.Circle(r - 1);
                this.addShape(shape);
                this.setRef(r - 1, 0).setViewBox(-r, -r, r + r, r + r).setWidth(r).setHeight(r);
                this.shape = shape;
            });

            // upArrow
            this.marker.upArrow = new kity.Marker().pipe(function() {
                var w = 8, h = w / 2;
                var shape = new kity.Path().setPathData('M 0 ' + h + ' L ' + w + ' ' + w + ' L ' + w + ' 0');
                this.addShape(shape);
                this.setRef(h, h).setViewBox(0, 0, w, w).setWidth(w).setHeight(w);
                this.shape = shape;
            });

            // downArrow
            this.marker.downArrow = new kity.Marker().pipe(function() {
                var w = 8, h = w / 2;
                var shape = new kity.Path().setPathData('M 0 0 L ' + w + ' ' + h + ' L 0 ' + w + ' z');
                this.addShape(shape);
                this.setRef(h, h).setViewBox(0, 0, w, w).setWidth(w).setHeight(w);
                this.shape = shape;
            });

            this.getMinder().getPaper().addResource(this.marker.dot);
            this.getMinder().getPaper().addResource(this.marker.upArrow);
            this.getMinder().getPaper().addResource(this.marker.downArrow);
        },

        bindEvent: function() {
            var me = this;

            this.rc.on('mousedown', function(e) {
                if (me.data.from && me.data.to) {
                    e.stopPropagation();
                    var controls = me.data.controls || [];
                    if (controls.length === 0 && me._tmpControls.length === 4) {
                        me.setData('controls', me._tmpControls);
                    }
                    if (!me.selectMode) {
                        me.select();
                    }
                }
            });

            this.rc.on('dblclick', function() {
                console.log('编辑文本');
            });

            this.rc.on('mouseover', function(e) {
                me.hover();
                me.update();
            });

            this.rc.on('mouseleave', function(e) {
                me.unHover();
                me.update();
            });
        },

        // 根据两个端点以及控制线的关系，计算控制点的位置
        calculateControl: function(A, B, dirX, dirY, config) {
            var angle = config.angle;
            var distancePercent = config.distancePercent;

            // 将角度从度转换为弧度
            var radians = angle * (Math.PI / 180);

            // 计算AB向量
            var ABx = B.x - A.x;
            var ABy = B.y - A.y;

            // 计算AB连线长度
            var lengthAB = Math.sqrt(ABx * ABx + ABy * ABy);

            // 计算控制点的距离
            var distance = lengthAB * distancePercent;

            // 计算控制点A的坐标
            var controlAx = A.x + distance * Math.cos(radians) * dirX;
            var controlAy = A.y + distance * Math.sin(radians) * dirY;

            // 计算控制点B的坐标
            var controlBx = B.x - distance * Math.cos(radians) * dirX;
            var controlBy = B.y - distance * Math.sin(radians) * dirY;

            // 返回控制点坐标
            return {
              controlA: { x: controlAx, y: controlAy },
              controlB: { x: controlBx, y: controlBy }
            };
        },

        getControl: function(fromBox, toBox) {
            var dx = (toBox.cx || toBox.x) - fromBox.cx;
            var dy = (toBox.cy || toBox.y) - fromBox.cy;
            var linLen = Math.sqrt(dx * dx + dy * dy);
            var angle = Math.abs(180 * Math.atan(dy / dx) / Math.PI);
            var config = {
                angle: 15,
                distancePercent: 0.3
            };

            var p1, p2, c1, c2;

            if (angle >= 45) {
                if (Math.abs(dy) >= 150) {
                    if (dy > 0) {
                        p1 = {x: fromBox.cx, y: fromBox.bottom};
                        p2 = {x: toBox.cx || toBox.x, y: toBox.top || toBox.y};
                    }
                    else {
                        p1 = {x: fromBox.cx, y: fromBox.top};
                        p2 = {x: toBox.cx || toBox.x, y: toBox.bottom || toBox.y};
                    }
                }
                else {
                    p1 = {x: fromBox.right, y: fromBox.cy};
                    p2 = {x: toBox.right || toBox.x, y: toBox.cy || toBox.y};
                    c1 = {x: p1.x + linLen * 0.5, y: p1.y};
                    c2 = {x: p2.x + linLen * 0.5, y: p2.y};
                }
            }
            else {
                if (Math.abs(dx) >= 150) {
                    if (dx > 0) {
                        p1 = {x: fromBox.right, y: fromBox.cy};
                        p2 = {x: toBox.left || toBox.x, y: toBox.cy || toBox.y};
                    }
                    else {
                        p1 = {x: fromBox.left, y: fromBox.cy};
                        p2 = {x: toBox.right || toBox.x, y: toBox.cy || toBox.y};
                    }
                }
                else {
                    p1 = {x: fromBox.cx, y: fromBox.top};
                    p2 = {x: toBox.cx || toBox.x, y: toBox.top || toBox.y};
                    c1 = {x: p1.x, y: p1.y - linLen * 0.5};
                    c2 = {x: p2.x, y: p2.y - linLen * 0.5};
                }
            }

            if (!c1 && !c2) {
                var controls = this.calculateControl(p1, p2, dx >= 0 ? 1 : -1, dy >= 0 ? 1 : -1, config);
                c1 = controls.controlA;
                c2 = controls.controlB;
            }

            return {p1: p1, p2: p2, c1: c1, c2: c2};
        },

        update: function(endPos) {
            var minder = this.getMinder();
            var controls = this._tmpControls = this.data.controls || [];
            var fromNode = minder.getNodeById(this.data.from);
            var toNode = minder.getNodeById(this.data.to);
            var p1, p2, c1, c2;
            endPos = endPos || toNode && toNode.getLayoutBox();

            if (controls.length != 4) {
                if (!endPos) return;
                var fromBox = fromNode.getLayoutBox();
                var controls = this.getControl(fromBox, endPos);
                this._tmpControls = [controls.p1, controls.c1, controls.c2, controls.p2];
                c1 = controls.c1;
                c2 = controls.c2;
                p1 = new kity.BezierPoint(controls.p1.x, controls.p1.y, true).setForward(c1.x, c1.y);
                p2 = new kity.BezierPoint(controls.p2.x, controls.p2.y, true).setBackward(c2.x, c2.y);
            }
            else {
                c1 = controls[1],
                c2 = controls[2];
                p1 = new kity.BezierPoint(controls[0].x, controls[0].y, true).setForward(c1.x, c1.y);
                p2 = new kity.BezierPoint(controls[3].x, controls[3].y, true).setBackward(c2.x, c2.y);
            }

            this.line.setBezierPoints([p1, p2]);
            this.lineCopy.setBezierPoints([p1, p2]);
            this.updateText();
            this.updateStyle();
        },

        updateText: function() {
            var text = this.getData('text') || '';
            var controls = this._tmpControls;
            if (this.isActive() && !text) {
                text = '联系';
            }

            if (controls && controls.length === 4) {
                this.textShape.setContent(text);
                var xy = calculateBezierPoint(0.5, controls[0], controls[1], controls[2], controls[3]);
                var width = this.textShape.getWidth();
                this.textGroup.setTranslate(xy.x - width / 2, xy.y);
            }
        },

        updateStyle: function() {
            var me = this;
            var data = this.data;

            // 箭头类型
            var markerPosMap = {
                start: {
                    dot: this.marker.dot,
                    arrow: this.marker.upArrow
                },
                end: {
                    dot: this.marker.dot,
                    arrow: this.marker.downArrow
                }
            };

            // 线型
            var lineDashMap = {
                solid: '0',
                sysDot: '2',
                sysDash: '2',
                dash: '4 2',
                dashDot: '4 2 2 2',
                dashDotDot: '4 2 2 2 2 2'
            };

            ['start', 'end'].forEach(function(pos) {
                var markerName = pos === 'start' ? data['line-from-arrow'] : data['line-to-arrow'];
                var marker = markerPosMap[pos][markerName];
                me.line.setMarker(marker, pos);
                if (marker) {
                    marker.shape.fill(data['line-color']);
                }
            });

            this.line.stroke(data['line-color'], data['line-width'])
                .setAttr('stroke-dasharray', lineDashMap[data['line-style']] || '0');

            this.lineCopy.stroke('#2970FF', 6)
                .setAttr('stroke-opacity', this.selectMode || this.hoverMode ? 0.4 : 0)
                .setAttr('stroke-linejoin', 'round')
                .setAttr('stroke-linecap', 'round');
        },
    });

    kity.extendClass(Minder, {

        setRelations: function(relations) {
            var me = this;
            if (relations && relations.length) {
                utils.each(relations, function(relation) {
                    var newRela = utils.clone(relation);
                    me.createRelation(newRela);
                });
            }
        },

        getRelationContainer: function() {
            return this._relationContainer;
        },

        getSelectedRelation: function() {
            var relation;
            utils.each(this._relations, function(r) {
                if (r.selectMode) {
                    relation = r;
                }
            });
            return relation;
        },

        createRelation: function(data) {
            var relation = new MinderRelation(this, data);
            this._relations = this._relations || [];
            this._relations.push(relation);
            this.getRelationContainer().addShape(relation.rc);
            this.getRelationContainer().bringTop();
            this.updateRelation(relation);
        },

        removeRelation: function(relation) {
            relation && relation.remove();
        },

        // 单条关系线更新
        updateRelation: function(relation) {
            if (!relation || !relation.data) return;

            var fromNode = this.getNodeById(relation.data.from);
            var toNode = this.getNodeById(relation.data.to);

            if (
                fromNode && fromNode.parent && fromNode.parent.isExpanded()
                && toNode && toNode.parent && toNode.parent.isExpanded()
            ) {
                relation.update();
            }
        },

        // 更新全部关系线
        updateRelations: function() {
            var me = this;
            (this._relations || []).forEach(function (relation) {
                me.updateRelation(relation);
            });
        }
    });

    var maetchingRelation = {
        getRelation: function() {
            const relation = this._relations[this._relations.length - 1];
            if (!relation.getData('to')) {
                return relation;
            }
        },

        // 查找节点时更新关系线
        updateRelation: function(relation, e) {
            var node = e.getTargetNode();
            var pos = node ? node.getLayoutBox() : e.getPosition();
            relation.update(pos);
        }
    };

    /**
     * 引导创建关系线命令
     */
    var CreateRelationGuideCommand = kity.createClass({
        base: Command,
        execute: function(minder) {
            var node = minder.getSelectedNode();
            if (node) {
                minder.setStatus('relation');
                minder.createRelation({
                    from: node.getData('id'),
                });
            }
        },
    });

    /**
     * 删除关系线命令
     */
    var RemoveRelationCommand = kity.createClass({
        base: Command,
        execute: function(minder, relation) {
            relation.remove();
        },
    });

    /**
     * 更新关系线样式命令
     */
    var UpdateRelationLineCommand = kity.createClass({
        base: Command,
        execute: function(minder, prop, value) {
            var relation = minder.getSelectedRelation();
            if (relation) {
                relation.setData('line-' + prop, value);
                relation.updateStyle();
            }
        },

        queryValue: function(minder, key) {
            var relation = minder.getSelectedRelation();
            if (relation) {
                var value = relation.getData('line-' + key);
                var themeValue = minder.getStyle('relation-line-' + key);
                return value || themeValue;
            }
        }
    });

    /**
     * 更新关系线文本命令
     */
    var UpdateRelationTextCommand = kity.createClass({
        base: Command,
        execute: function(minder, text) {
            var relation = minder.getSelectedRelation();
            if (relation) {
                relation.setData('text', text);
                relation.updateText();
            }
        },

        queryValue: function(minder) {
            var relation = minder.getSelectedRelation();
            if (relation) {
                return relation.getData('text');
            }
        }
    });

    Module.register('Relation', function() {
        return {
            init: function() {
                this._relationContainer = new kity.Group().setId(utils.uuid('minder_relation_group'));
                this.getRenderContainer().addShape(this._relationContainer);
            },

            commands: {
                removeRelation: RemoveRelationCommand,
                createRelationGuide: CreateRelationGuideCommand,
                updateRelationLine: UpdateRelationLineCommand,
                updateRelationText: UpdateRelationTextCommand,
            },

            events: {
                // 创建关系线
                // 寻找目标节点
                'relation.beforemousemove': function(e) {
                    var relation = maetchingRelation.getRelation.call(this);
                    if (relation) {
                        relation.line.addClass('relation-matching');
                        relation.lineCopy.addClass('relation-matching');
                        maetchingRelation.updateRelation(relation, e);
                    }
                },

                // 选中目标节点
                'relation.beforemousedown': function(e) {
                    e.stopPropagation();
                    this.setStatus('normal');
                    var node = e.getTargetNode();
                    var relation = maetchingRelation.getRelation.call(this);
                    if (node) {
                        relation.submit(node.getData('id'), relation._tmpControls);
                        relation.select();
                        relation.line.removeClass('relation-matching');
                        relation.lineCopy.removeClass('relation-matching');
                        this.fire('contentchange');
                    }
                    else {
                        this.removeRelation(relation);
                    }
                },

                // 取消全部关系线选中态
                'normal.beforemousedown': function(e) {
                    console.log('cacel all');
                    utils.each(this._relations, function(relation) {
                        relation.unSelect();
                    });
                },

                // 取消创建关系线
                'relation.keydown': function(e) {
                    if (e.isShortcutKey('esc')) {
                        this.setStatus('normal');
                        var relation = this._relations[this._relations.length - 1];
                        relation && this.removeRelation(relation);
                    }
                },

                'selectrelation': function(relation) {
                    this.updateRelation(relation);
                    this.fire('showRelationControl', relation);
                },

                'unselectrelation': function(relation) {
                    relation.updateStyle();
                    this.fire('hideRelationControl', relation);
                },

                'selectrelationchange': function(relation) {
                    this.updateRelation(relation);
                },

                'contentchange': function() {
                    this.updateRelations();
                }
            }
        }
    });
});
