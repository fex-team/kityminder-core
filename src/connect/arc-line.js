/**
 * @fileOverview
 *
 * 圆弧连线
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

define(function(require, exports, module) {
    var kity = require('../core/kity');
    var connect = require('../core/connect');
    var utils = require('../core/utils');

    connect.register('arc-line', function(node, parent, connection, width, color) {
        var box = node.getLayoutBox(),
            pBox = parent.getLayoutBox();
        var start, end, vector;
            var abs = Math.abs;
            var pathData = [];
            var side = box.x > pBox.x ? 'right' : 'left';
            var isPreUnder = parent.getConnect()=='under';
            // var isPreUnder = false;
        start = new kity.Point(pBox.cx, pBox.cy);
        end = side == 'left' ?
            new kity.Point(box.right, box.cy) :
            new kity.Point(box.left, box.cy);
        var rectGroup = {
            x: pBox.cx - pBox.width / 2,
            y: pBox.cy - pBox.height / 2,
            xMax: pBox.cx + pBox.width / 2,
            yMax: pBox.cy + pBox.height / 2,
        }
        if(parent.getType() == 'root'){
            var startPoint = utils.lineToRect({
                x: start.x,
                y: start.y
            }, {
                x: end.x,
                y: end.y
            }, rectGroup);
            pathData.push('M', startPoint.x, startPoint.y);
            vector = kity.Vector.fromPoints(start, end);
        }else{
            var startPoint = side=='left'? 
                new kity.Point(pBox.left, (isPreUnder&&!parent.getIsSpecial())?(pBox.bottom + 3):pBox.cy) :
                new kity.Point(pBox.right, (isPreUnder&&!parent.getIsSpecial())?(pBox.bottom + 3):pBox.cy);
            var start ={
                x:side=='left'?startPoint.x-10:startPoint.x+10,
                y:startPoint.y,
            } 
            pathData.push('M', startPoint.x, startPoint.y);
            pathData.push('L', start.x, startPoint.y);
            vector = kity.Vector.fromPoints(start, end);
        }
        pathData.push('A', abs(vector.x), abs(vector.y), 0, 0, (vector.x * vector.y > 0 ? 0 : 1), end);
        connection.setPathData(pathData);
    });
});