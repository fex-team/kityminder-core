/**
 * @fileOverview
 *
 * 默认模板 - 脑图模板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014c
 */
define(function(require, exports, module) {
    var template = require('../core/template');
    function getConnectType(node){
        return node.getParent() && (node.getParent().getData('connect') || node.getParent().getStyle('connect'));
    }
    template.register('normal', {

        getLayout: function(node) {

            if (node.getData('layout')) return node.getData('layout');

            var level = node.getLevel();

            // 根节点
            if (level === 0) {
                return 'mind';
            }

            // 一级节点
            if (level === 1) {
                return node.getLayoutPointPreview().x > 0 ? 'right': 'left';
            }

            return node.parent.getLayout();
        },

        getConnect: function(node) {
            if(getConnectType(node)){
                return getConnectType(node);
            }else{
                // if (node.getLevel() <=1 ) return 'arc-line';
                return 'bezier-line';
            }
        }
    });
});