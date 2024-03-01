/**
 * @fileOverview
 *
 * 圆角折线
 */

define(function(require, exports, module) {
    var kity = require('../core/kity');
    var connect = require('../core/connect');
    var utils = require('../core/utils');

    connect.register('bezier-line-underline', function(node, parent, connection) {
        var box = node.getLayoutBox(), pBox = parent.getLayoutBox();
        var parentRectGroup = {
            x: pBox.cx - pBox.width / 2,
            y: pBox.cy - pBox.height / 2,
            xMax: pBox.cx + pBox.width / 2,
            yMax: pBox.cy + pBox.height / 2
        };
        var side = box.x > pBox.x ? "right" : "left";
        var pathData = [];
        var end = new kity.Point(side == "right" ? box.left : box.right, box.y + box.height);
        var startY = pBox.y + pBox.height;
        // 根据规则获得根结点x的位置
        function getStart() {
            return start = new kity.Point(side == "right" ? pBox.right : pBox.left, startY);
        }
        // 起始点、终点
        var radius = box.cy == pBox.cy ? 0 : node.getStyle("connect-radius");
        var verSign = pBox.cy > box.cy ? 1 : -1;
        //上半部分还是下半部分
        var p1, p2, p3;
        var start = getStart();
        var startX = start.x;
        var cControl = new kity.Point(start.x, end.y);
        if (side == "right") {
            startX += parent.getStyle("margin")[1];
            cControl = new kity.Point(startX, end.y);
            p1 = new kity.Point(startX, startY);
            p2 = new kity.Point(startX, box.y + box.height + radius * verSign);
            p3 = new kity.Point(startX + radius, box.y + box.height);
        } else {
            startX -= parent.getStyle("margin")[1];
            cControl = new kity.Point(startX, end.y);
            p1 = new kity.Point(startX, startY);
            p2 = new kity.Point(startX, box.y + box.height + radius * verSign);
            p3 = new kity.Point(startX - radius, box.y + box.height);
        }
        pathData.push("M", start);
        pathData.push("L", p1);
        pathData.push("L", p2);
        pathData.push("C", cControl, cControl, p3);
        pathData.push("L", end);
        connection.setPathData(pathData);
    });
});