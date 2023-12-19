/**
 * @file browser
 * @author Gavin
 */

define(function(require, exports, module) {
    var agent = navigator.userAgent.toLowerCase();
    var mobileReg = /iPhone|iPad|iPod|Android/i;
    var iosReg = /\(i[^;]+;( U;)? CPU.+Mac OS X/i;
    kity.Browser = kity.Browser || {};
    kity.Browser.isMobile = function () {
        return mobileReg.test(agent);
    }
    kity.Browser.isIOS = function () {
        return iosReg.test(agent);
    }
    // 原safari是在kity中判断的，它会判断存在safari以及没有chrome标记
    // 但是在特定的UA中，可能没有safari以及chrome
    // 因此此处标记为满足iOS即为safari
    if (kity.Browser.isIOS()) {
        kity.Browser.safari = true;
    }
});
