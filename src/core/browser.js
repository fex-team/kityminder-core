/**
 * @file browser
 * @author Gavin
 */

define(function(require, exports, module) {
    var agent = navigator.userAgent.toLowerCase();
    var mobileReg = /iPhone|iPad|iPod|Android/i;
    module.exports = {
        isMobile: function () {
            return mobileReg.test(agent);
        }
    };
});
