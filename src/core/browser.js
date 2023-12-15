/**
 * @file browser
 * @author Gavin
 */

define(function(require, exports, module) {
    var agent = navigator.userAgent.toLowerCase();
    var mobileReg = /iPhone|iPad|iPod|Android/i;
    kity.Browser = kity.Browser || {};
    kity.Browser.isMobile = function () {
        return mobileReg.test(agent);
    }
});
