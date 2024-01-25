/**
 * node节点状态标记
 */
define(function(require, exports, module) {
    var kity = require('./kity');
    var MinderNode = require('./node');

    var STATE_INPUT_CLASS = 'state-input';
    var SSTATE_COLLAPSE_CLASS = 'state-collapse';

    kity.extendClass(MinderNode, (function() {
        return {
            toggleInput: function(isInput) {
                if (isInput) {
                    this._isInput = true;
                    this.rc.addClass(STATE_INPUT_CLASS);
                    return this;
                }
                this._isInput = false;
                this.rc.removeClass(STATE_INPUT_CLASS);
                return this;
            },

            toggleCollapse: function(isCollapse) {
                if (isCollapse) {
                    this._isCollapse = true;
                    this.rc.addClass(SSTATE_COLLAPSE_CLASS);
                    return this;
                }
                this._isCollapse = false;
                this.rc.removeClass(SSTATE_COLLAPSE_CLASS);
                return this;
            }
        };
    })());
});