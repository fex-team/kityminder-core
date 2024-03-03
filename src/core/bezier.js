define(function(require, exports, module) {
    var kity = require('./kity');
    var utils = require("./utils");
    var Minder = require('./minder');
    var MinderRelation = require('./relation');
    var Module = require('./module');
    var Command = require('./command');

    var dashStyleMap = {
        solid: '0',
        sysDash: '2',
        sysDot: '2',
        dash: '4 2',
        dashDot: '4 2 2 2',
        dashDotDot: '4 2 2 2',
    };

    Module.register('relationBezier', function() {
        var UpdateRelationLine = kity.createClass('UpdateRelationLineCommand', {
            base: Command,
            execute: function(km, key, value) {
                var nodes = km.getSelectedRelations();
                nodes.forEach(function(n) {
                    n.setData(key, value);
                    n.render();
                });
            },
            queryState: function(km) {
                return km.getSelectedRelations().length === 0 ? -1 : 0;
            },
            queryValue: function(km, key) {
                if (km.getSelectedRelations().length === 1) {
                    return km.getSelectedRelation().getData(key);
                }
                return 'mixed';
            }
        });

        return {
            commands: {
                'updateRelationLine': UpdateRelationLine,
            },
            events: {
                'normal.mousemove': function(e) {
                    var relationNode = e.getTargetRelationNode();
                    if (!relationNode) return;
                    if (relationNode.isSelected()) return;
                    relationNode.preSelect();
                },
                'blur': function() {
                    if (!this.isFocused()) {
                        this._selectedRelation.forEach(function(relation){
                            relation.pointGroup.items.forEach(function(item){
                                item.stroke('rgba(99, 115, 130, 0.5)');
                            })
                        })
                    }
                },
                'focus': function() {
                    if (this.isFocused()) {
                        this._selectedRelation.forEach(function(relation){
                            relation.pointGroup.items.forEach(function(item){
                                item.stroke('#3F92FF');
                            })
                        })
                    }
                }
            }
        }
    });

    kity.extendClass(MinderRelation, {
        updateLine: function(pos) {
            var _this = this;
            var bezierData = this.getBezierData(pos);
            var points = bezierData.points;
            var controllers = bezierData.controller;
            this.getLine().setBezierPoints(points);
            this.getLine().getBezierPoints().forEach(function(item, index) {
                var controller = {
                    x: controllers[index].x,
                    y: controllers[index].y,
                }
                if (index === 0) {
                    _this.pointGroup.addPoint(points[index].clone(), index).setForward(controller.x, controller.y);
                    item.setForward(controller.x, controller.y).setForward(controller.x, controller.y);
                }
                else if(index === 1) {
                    _this.pointGroup.addPoint(points[index].clone(), index).setBackward(controller.x, controller.y);
                    item.setForward(controller.x, controller.y).setBackward(controller.x, controller.y);
                }
            });

            this.drawLineCopy(points);
            this.updateLineStyle();
        },

        updateLineStyle: function() {
            var line = this.getLine();
            var strokeWidth = this.getData('line-width') || 1.5;
            var strokeColor = this.getData('line-color') || '#000';
            var fromMarkerName = this.getData('from-marker') || 'dot';
            var toMarkerName = this.getData('to-marker');
            var strokeStyle = this.getData('line-style');
            var markerMap = {
                start: {
                    dot: '',
                    arrow: this.leftMarker,
                },
                end: {
                    dot: '',
                    arrow: this.rightMarker,
                },
            };

            line.stroke(strokeColor, strokeWidth)
                .setAttr('stroke-dasharray',  dashStyleMap[strokeStyle]);

            ['end', 'start'].forEach(function(pos) {
                var marker = markerMap[pos][pos === 'start' ? fromMarkerName : toMarkerName];
                line.setMarker(marker, pos);
                if (marker) {
                    marker.shape.fill(strokeColor);
                }
            });
        },

        getBezierData: function(pos) {
            var bezierData = utils.bezierPoint(this, pos);
            var fromPoint = bezierData.from,
                toPoint = bezierData.to;
            return {
                points: [
                    new kity.BezierPoint(fromPoint.x, fromPoint.y, true),
                    new kity.BezierPoint(toPoint.x, toPoint.y, true),
                ],
                controller: [
                    bezierData.fromController,
                    bezierData.toController,
                ]
            }
        },
    });
});
