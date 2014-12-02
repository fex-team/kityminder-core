/**
 * @fileOverview
 *
 * 提供脑图选项支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {
    var kity = require('./kity');
    var Minder = require('./minder');

    kity.extendClass(Minder, {
        getOption: function(key) {
            if (key) {
                return this._options[key];
            } else {
                return this._options;
            }
        }
    });
});