/**
 * @fileOverview
 *
 * 提供脑图选项支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
kity.extendClass(KityMinder, {

    getOptions: function(key) {
        if (key) {
            return this._options[key];
        } else {
            return this._options;
        }
    }

});