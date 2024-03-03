define(function(require, exports, module) {
    var kity = require('./kity');
    var utils = require("./utils");
    var GroupUtils = {
        listenVertex: function(point, group, index) {
            GroupUtils.listen(PointGroup.TYPE_VERTEX, point, group, index);
        },
        listenForward: function(point, group, index) {
            GroupUtils.listen(PointGroup.TYPE_FORWARD, point, group, index);
        },
        listenBackward: function(point, group, index) {
            GroupUtils.listen(PointGroup.TYPE_BACKWARD, point, group, index);
        },
        listen: function(pointType, point, group, index) {
            point.on('mousedown', function(e) {
                group.trigger('pointmousedown', {
                    targetPointType: pointType,
                    targetPointIndex: index
                });
            });
        }
    };

    var PointGroup = kity.createClass('pointGroup', {
        base: kity.Group,
        constructor: function() {

            this.callBase();

            this.points = [];
            this.pointShapes = [];

            this.exterior = {

                vertex: {
                    width: 10 * 1,
                    height: 10 * 1
                },

                control: {

                    radius: 4 * 1

                },

                pen: {
                    width: 2 * 1
                }

            };

            this.handler = {
                'mousedown': [],
                'mouseup': []
            };
            this.initGroup();
        },
        initGroup: function() {
            this.vertextRect0 = new kity.Rect();
            this.forwardPoint0 = new kity.Circle();
            this.backwardPoint0 = new kity.Circle();
            this.line0 = new kity.Line();

            this.vertextRect1 = new kity.Rect();
            this.forwardPoint1 = new kity.Circle();
            this.backwardPoint1 = new kity.Circle();
            this.line1 = new kity.Line();

            this.addShapes([this.line0, this.vertextRect0, this.forwardPoint0, this.line1, this.vertextRect1, this.backwardPoint1]);
            this.initEvent(this);
        },
        indexOf: function(bezierPoint) {

            var index = -1;

            if(this.points.indexOf) {
                return this.points.indexOf(bezierPoint);
            } else {

                Utils.each(this.points, function(point, i) {

                    if(point === bezierPoint) {
                        index = i;
                        return false;
                    }

                });

                return index;

            }

        },

        // 获取顶点宽度
        getVertexWidth: function() {
            return this.exterior.vertex.width;
        },

        getPoints: function() {
            return this.points.slice(0);
        },

        getPointByIndex: function(index) {
            return this.points[index] || null;
        },
        getLastPoint: function() {
            return this.points[this.points.length - 1] || null;
        },

        addPoint: function(point, index) {

            point.container = this;
            this.points[index] = point;

            this.onChanged();

            return this.points[index];

        },

        onChanged: function() {

            this._draw();

        },

        update: function(sourcePoint) {

            // 数据发生改变， 重绘当前点
            this._redraw(sourcePoint);

        },
        // 选中给定索引的点，该操作会引起其他点的连锁反应
        selectPoint: function(index) {
            var shapeGroup = this.pointShapes[index];
            // 重绘当前点
            this._redraw(this.getPointByIndex(index));
            // 清空其他点的
            Utils.each(this.pointShapes, function(shape, i) {
                if(i !== index) {
                    this._clearShapePoint(i);
                }

            }, this);
            // 更新辅助点
            if(index > 0) {
                this._drawAssistPoint(index - 1);
            }

        },
        _draw: function() {

            var point = this.getLastPoint(),
                currentIndex = this.pointShapes.length >= 2 ? 1 : this.pointShapes.length;
            // currentIndex  = this.pointShapes.length;
            this._drawPoint(point, currentIndex);
            // 绘制辅助点
            if(currentIndex > 0) {
                this._drawAssistPoint(currentIndex - 1);
            }

        },

        _redraw: function(point) {

            //寻找源所对应的图形
            var index = this.indexOf(point),
                shape = this.pointShapes[index];

            var vertex = point.getVertex(),
                forward = point.getForward(),
                backward = point.getBackward();

            // 更新图形
            shape.forward.setCenter(forward.x, forward.y);
            shape.backward.setCenter(backward.x, backward.y);
            if(index == 0) {
                shape.line.setPoint1(forward.x, forward.y).setPoint2(vertex.x, vertex.y);
            } else if(index == 1) {
                shape.line.setPoint1(vertex.x, vertex.y).setPoint2(backward.x, backward.y);
            }
            shape.vertex.setPosition(vertex.x - this.exterior.vertex.width / 2, vertex.y - this.exterior.vertex.height / 2);

            this._stroke(shape.vertex);

        },
        _drawPoint: function(point, index) {

            var forward = point.getForward(),
                backward = point.getBackward(),
                shape = null;

            shape = {};
            this.pointShapes[index] = shape;

            //控制线
            shape.line = this._drawLine(forward, backward, index);
            //前置控制点
            shape.forward = this._drawForward(forward, index);
            //后置控制点
            shape.backward = this._drawBackward(backward, index);
            //vertex
            shape.vertex = this._drawVertex(point.getVertex(), index);

        },

        // 清理指定索引的图形点, 使得该点仅显示一个顶点
        _clearShapePoint: function(index) {

            var shape = this.pointShapes[index],
                // 当前的包含的数据点
                vertex = this.points[index].getVertex();

            shape.line.setPoint1(vertex.x, vertex.y).setPoint2(vertex.x, vertex.y);
            shape.forward.setCenter(vertex.x, vertex.y);
            shape.backward.setCenter(vertex.x, vertex.y);

            this._stroke(shape.vertex, "white");

        },
        // 根据指定的索引， 把该索引所对应的点更新成辅助点
        // 一个辅助点是当前曲线区间的起点， 它显示出该辅助点的forward控制点和连线
        _drawAssistPoint: function(index) {

            var shape = this.pointShapes[index],
                // 当前的包含的数据点
                bezierPoint = this.points[index],
                forward = bezierPoint.getForward(),
                vertex = bezierPoint.getVertex();

            shape.line.setPoint1(vertex.x, vertex.y).setPoint2(forward.x, forward.y);
            shape.forward.setCenter(forward.x, forward.y);
            shape.backward.setCenter(vertex.x, vertex.y);

            this._stroke(shape.vertex, "white");

            // 清理前一次的辅助点
            if(index > 1) {

                this._clearShapePoint(index - 1);

            }

        },
        _drawVertex: function(vertex, index) {

            var width = this.exterior.vertex.width,
                height = this.exterior.vertex.height,
                // vertextRect = new kity.Rect(width, height, vertex.x - width / 2, vertex.y - height / 2);
                vertextRect = this['vertextRect' + index].setSize(width, height).setPosition(vertex.x - width / 2, vertex.y - height / 2).setRadius(width / 2);
            //记录下图形
            this._stroke(vertextRect);

            // this.addShape(vertextRect);
            GroupUtils.listenVertex(vertextRect, this, index);

            return vertextRect;

        },

        _drawForward: function(point, index) {

            var forwardPoint = this._drawControl(this['forwardPoint' + index], point);

            GroupUtils.listenForward(forwardPoint, this, index);

            return forwardPoint;

        },
        _drawBackward: function(point, index) {

            var backwardPoint = this._drawControl(this['backwardPoint' + index], point);

            GroupUtils.listenBackward(backwardPoint, this, index);

            return backwardPoint;

        },

        _drawControl: function(pointType, point) {

            var styles = this.exterior.control,
                radius = styles.radius,
                // controlPoint = new kity.Circle(radius, point.x, point.y);
                controlPoint = pointType.setRadius(radius).setCenter(point.x, point.y);

            this._stroke(controlPoint);

            // this.addShape(controlPoint);

            return controlPoint;

        },

        _drawLine: function(forward, backward, index) {

            var line = this['line' + index].setPoint1(forward.x, forward.y).setPoint2(backward.x, backward.y);

            line.stroke(new kity.Pen(new kity.Color("#3F92FF")).setWidth(this.exterior.pen.width));


            return line;

        },
        _stroke: function(shape, fillColor) {

            shape.stroke(new kity.Pen(new kity.Color("#3F92FF")).setWidth(this.exterior.pen.width));
            shape.fill(new kity.Color(fillColor || "#fff"));

        },
        initEvent: function(pointGroup) {
            pointGroup.on('pointmousedown', function(e) {
                var currentPoint = null,
                    currentType = null,
                    index = -1,
                    vertexWidth = 0;
                index = e.targetPointIndex;
                currentType = e.targetPointType;
                currentPoint = pointGroup.getPointByIndex(index);

                var controller = pointGroup.container.relationNode;
                // 获取到当前顶点的宽度
                vertexWidth = pointGroup.getVertexWidth();

                // 检查当前点击的点的控制点是否和顶点重叠
                // 如果重叠了， 则认为点击是发生在forward的控制点上的
                if(currentType === PointGroup.TYPE_VERTEX) {
                    //更新点类型
                    switch (utils.checkOverlapping(currentPoint, vertexWidth)) {
                        case 1:
                            currentType = PointGroup.TYPE_FORWARD;
                            break;
                        case 2:
                            currentType = PointGroup.TYPE_BACKWARD
                            break;
                    }
                }
                // // 运行更新
                controller.enableEdit();
                controller.setModifyStatus({
                    pointType: currentType,
                    pointIndex: index
                });
            });
        }
    })

    utils.extend(PointGroup, {
        // 顶点类型常量
        TYPE_VERTEX: "vertex",
        TYPE_FORWARD: "forward",
        TYPE_BACKWARD: "backward"

    });

    module.exports = PointGroup;
});
