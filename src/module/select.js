define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');

    var Minder = require('../core/minder');
    var MinderNode = require('../core/node');
    var Command = require('../core/command');
    var Module = require('../core/module');
    var Renderer = require('../core/render');

    Module.register('Select', function() {
        var minder = this;
        var rc = minder.getRenderContainer();

        // 在实例上渲染框选矩形、计算框选范围的对象
        var marqueeActivator = (function() {

            // 记录选区的开始位置（mousedown的位置）
            var startPosition = null;

            // 选区的图形
            var marqueeShape = new kity.Path();

            // 标记是否已经启动框选状态
            //    并不是 mousedown 发生之后就启动框选状态，而是检测到移动了一定的距离（MARQUEE_MODE_THRESHOLD）之后
            var marqueeMode = false;
            var MARQUEE_MODE_THRESHOLD = 10;

            // 在其他场景可以根据是否处于框选状态来控制某些操作
            kity.extendClass(Minder, {
                _isMarqueeMode: function() {
                    return marqueeMode;
                }
            });

            return {
                selectStart: function(e) {
                    // 只接受左键
                    if (e.originEvent.button || e.originEvent.altKey) return;

                    // 清理不正确状态
                    if (startPosition) {
                        return this.selectEnd();
                    }

                    startPosition = e.getPosition(rc).round();
                },
                selectMove: function(e) {
                    if (minder.getStatus() == 'textedit') {
                        return;
                    }
                    if (!startPosition) return;

                    var p1 = startPosition,
                        p2 = e.getPosition(rc);

                    // 检测是否要进入选区模式
                    if (!marqueeMode) {
                        // 距离没达到阈值，退出
                        if (kity.Vector.fromPoints(p1, p2).length() < MARQUEE_MODE_THRESHOLD) {
                            return;
                        }
                        // 已经达到阈值，记录下来并且重置选区形状
                        marqueeMode = true;
                        rc.addShape(marqueeShape);
                        marqueeShape
                            .fill(minder.getStyle('marquee-background'))
                            .stroke(minder.getStyle('marquee-stroke')).setOpacity(0.8).getDrawer().clear();
                    }

                    var marquee = new kity.Box(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y),
                        selectedNodes = [];

                    // 使其犀利
                    marquee.left = Math.round(marquee.left);
                    marquee.top = Math.round(marquee.top);
                    marquee.right = Math.round(marquee.right);
                    marquee.bottom = Math.round(marquee.bottom);

                    // 选区形状更新
                    marqueeShape.getDrawer().pipe(function() {
                        this.clear();
                        this.moveTo(marquee.left, marquee.top);
                        this.lineTo(marquee.right, marquee.top);
                        this.lineTo(marquee.right, marquee.bottom);
                        this.lineTo(marquee.left, marquee.bottom);
                        this.close();
                    });

                    // 计算选中范围
                    minder.getRoot().traverse(function(node) {
                        var renderBox = node.getLayoutBox();
                        if (!renderBox.intersect(marquee).isEmpty()) {
                            selectedNodes.push(node);
                        }
                    });

                    // 应用选中范围
                    minder.select(selectedNodes, true);

                    // 清除多余的东西
                    window.getSelection().removeAllRanges();
                },
                selectEnd: function(e) {
                    if (startPosition) {
                        startPosition = null;
                    }
                    if (marqueeMode) {
                        marqueeShape.fadeOut(200, 'ease', 0, function() {
                            if (marqueeShape.remove) marqueeShape.remove();
                        });
                        marqueeMode = false;
                    }
                }
            };
        })();

        var lastDownNode = null,
            lastDownPosition = null;
        return {
            'init': function() {
                window.addEventListener('mouseup', function() {
                    marqueeActivator.selectEnd();
                });
            },
            'events': {
                'mousedown': function(e) {
                    // 事件触发点是否选中节点
                    var downNode = e.getTargetNode();
                    // 事件触发点是否选中联系线
                    var relationDownNode = e.getTargetRelationNode();

                    // 没有点中节点：
                    //     清除选中状态，并且标记选区开始位置
                    if (!downNode) {
                        this.removeAllSelectedNodes();
                        if (!relationDownNode) {
                            marqueeActivator.selectStart(e);
                        }
                    }

                    // 点中了节点，并且按了 shift 键：
                    //     被点中的节点切换选中状态
                    else if (e.isShortcutKey('Ctrl')) {
                        this.toggleSelect(downNode);
                    }

                    // 点中的节点没有被选择：
                    //     单选点中的节点
                    else if (!downNode.isSelected()) {
                        this.select(downNode, true);
                    }

                    // 点中的节点被选中了，并且不是单选：
                    //     完成整个点击之后需要使其变为单选。
                    //     不能马上变为单选，因为可能是需要拖动选中的多个节点
                    else if (!this.isSingleSelect()) {
                        lastDownNode = downNode;
                        lastDownPosition = e.getPosition();
                    }

                    if (!relationDownNode){
                        this.removeAllRelationSelected();
                    }
                    else if (e.isShortcutKey('Ctrl')) {
                        this.toggleRelationSelect(relationDownNode);
                    }
                    else if (!relationDownNode.isSelected()) {
                        this.selectRelation(relationDownNode, true);
                    }
                    else if (!this.isRelationSingleSelect()) {
                        this.selectRelation(relationDownNode, true);
                    }
                },
                'mousemove': marqueeActivator.selectMove,
                'mouseup': function(e) {
                    var upNode = e.getTargetNode();

                    // 如果 mouseup 发生在 lastDownNode 外，是无需理会的
                    if (upNode && upNode == lastDownNode) {
                        var upPosition = e.getPosition();
                        var movement = kity.Vector.fromPoints(lastDownPosition, upPosition);
                        if (movement.length() < 1) this.select(lastDownNode, true);
                        lastDownNode = null;
                    }

                    // 清理一下选择状态
                    marqueeActivator.selectEnd(e);
                },

                // 双击进入编辑状态
                'normal.dblclick': function dblclick(e) {
                    if (e.kityEvent.targetShape instanceof kity.Text || e.kityEvent.targetShape instanceof kity.Rect) {
                        if (e.getTargetRelationNode()) {
                            e.getTargetRelationNode().turnEdit();
                        }
                    }
                },

                //全选操作
                'normal.keydown': function(e) {

                    if (e.isShortcutKey('ctrl+a')) {
                        var selectedNodes = [];

                        this.getRoot().traverse(function(node) {
                            selectedNodes.push(node);
                        });
                        this.select(selectedNodes, true);
                        e.preventDefault();
                    }
                }
            }
        };
    });
});