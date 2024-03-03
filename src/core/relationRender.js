define(function(require, exports, module) {
    var kity = require('./kity');
    var utils = require('./utils');
    var MinderRelation = require('./relation');
    var PointGroup = require('./point');
    var Marker = {
        creatRightMarker: function() {
            return new kity.Marker().pipe(function() {
                var shape = new kity.Path('M0,0 L0,12 L12,6 z');
                this.addShape(shape);
                this.setRef(6, 6).setViewBox(0, 0, 12, 12).setWidth(12).setHeight(12);
                this.shape = shape;
                this.node.id = utils.uuid('marker');
            });
        },

        creatLeftMarker: function() {
            return new kity.Marker().pipe(function() {
                var shape = new kity.Path('M0,6 L12,12 L12,0 z');
                this.addShape(shape);
                this.setRef(6, 6).setViewBox(0, 0, 12, 12).setWidth(12).setHeight(12);
                this.shape = shape;
                this.node.id = utils.uuid('marker');
            });
        }
    };

    kity.extendClass(MinderRelation, {
        create:function(){
            this.line = new kity.Bezier();
            this.lineCopy = new kity.Bezier();
            this.pointGroup = new PointGroup().setVisible(false);
            this.textGroup = new kity.Group();
            this.rc.addShapes([this.lineCopy,this.line,this.textGroup,this.pointGroup]);
            this.creatMarker();
            initListener(this);
        },

        creatMarker: function() {
            var minder = this.getMinder();
            this.rightMarker = Marker.creatRightMarker();
            this.leftMarker = Marker.creatLeftMarker();
            minder.getPaper().addResource(this.rightMarker);
            minder.getPaper().addResource(this.leftMarker);
        },

        setControllerPoint: function(index, point) {
            var controller = 'controller' + index;
            this.setData(controller, {
                x:point.x,
                y:point.y
            });
            return this;
        },

        setTextPosition: function() {
            var _contentBox = this._contentBox;
            var pos = kity.g.pointAtPath(this.getLine().pathdata, 0.5)
                .offset(-_contentBox.width / 2 + 4, -_contentBox.height / 2 + 4);
            this.textGroup.setTranslate(pos);
        },

        drawLineCopy: function() {
            var points = this.line.getBezierPoints();
            var copyPoints =[];
            points.forEach(function(point) {
                copyPoints.push(point.clone());
            });
            this.lineCopy
                .setBezierPoints(copyPoints)
                .stroke('rgba(41, 122, 255, .2)', 10)
                .setStyle('opacity', 0)
                .setAttr('stroke-linejoin', 'round')
                .setAttr('stroke-linecap', 'round');
        },

        render: function() {
            var km = this.getMinder();
            this.pointGroup.setVisible(this.isSelected() && km.getStatus() !== 'readonly');
            this.textGroup.setVisible(this.data.text || (this.isSelected() && this.getMinder().getStatus() !== 'readonly'));
            this.lineCopy.setStyle('opacity', this.isSelected() ? 1 : 0);
            if (km.isFocused()) {
                this.pointGroup.items.forEach(function(item){
                    item.stroke('#3F92FF');
                });
            }
        },

        preSelect:function(){
            this.pointGroup.setVisible(true);
            this.textGroup.setVisible(true);
            this.lineCopy.setStyle('opacity', 1);
            var _this = this;
            this.rc.once('mouseleave', function() {
                if(_this.isSelected()) return;
                _this.pointGroup.setVisible(false);
                _this.textGroup.setVisible(_this.data.text);
                _this.lineCopy.setStyle('opacity', 0);
            });
        }
    });

    function initListener(relation) {
        var km = relation.getMinder();
        var _this = relation;
        km.on('mousemove', function(e) {
            var mousePoint = null,
                currentPoint = null,
                pointIndex = -1;
            e.preventDefault();

            // 不可编辑
            if (!relation.editable) {
                return;
            }

            mousePoint = e.getPosition();
            pointIndex = relation._modifyStatus.pointIndex;
            currentPoint = _this.pointGroup.getPointByIndex(pointIndex);
            switch (relation._modifyStatus.pointType) {

                case PointGroup.TYPE_FORWARD:
                    currentPoint.setForward(mousePoint.x, mousePoint.y);
                    _this.getLine().getPoint(pointIndex).setForward(mousePoint.x, mousePoint.y);
                    _this.setControllerPoint(pointIndex, currentPoint.getForward());
                    relation.update();
                    break;

                case PointGroup.TYPE_BACKWARD:
                    currentPoint.setBackward(mousePoint.x, mousePoint.y);
                    _this.getLine().getPoint(pointIndex).setBackward(mousePoint.x, mousePoint.y);
                    _this.setControllerPoint(pointIndex, currentPoint.getBackward());
                    relation.update();
                    break;

                case PointGroup.TYPE_VERTEX:
                    currentPoint.moveTo(mousePoint.x - 5, mousePoint.y + 5);
                    _this.getLine().getPoint(pointIndex).moveTo(mousePoint.x - 5, mousePoint.y + 5);
                    _this.setTextPosition();
                    var node = e.getTargetNode();
                    if (node) {
                        if (node !== relation.getFromNode() && node !== relation.getToNode()) {
                            if (pointIndex == 0) {
                                relation.setData('from', node.getData('id'));
                                _this.setControllerPoint(pointIndex, currentPoint.getBackward());
                            }
                            else {
                                relation.setData('to', node.getData('id'));
                                _this.setControllerPoint(pointIndex, currentPoint.getForward());
                            }
                        }
                    }
                    break;
            }
        });

        km.on('mouseup', function() {
            if(!relation.editable) {
                return;
            }

            relation.disableEdit();
            relation.update();
            km.fire('contentchange');
        });
    }
});
