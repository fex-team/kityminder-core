/**
 * @fileOverview
 *
 * KityMinder 类，暴露在 window 上的唯一变量
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

/* jshint -W079 */

var _initFnQueue = [];
var _uuidMap = {};

var KityMinder = kity.createClass('KityMinder', {
    constructor: function(options) {
        this._options = Utils.extend({}, options);

        var initQueue = _initFnQueue.slice();

        // @see option.js
        // @see event.js
        // @see status.js
        // @see paper.js
        // @see select.js
        // @see key.js
        // @see contextmenu.js
        // @see module.js
        // @see data.js         
        // @see readonly.js
        // @see layout.js
        // @see theme.js
        while (initQueue.length) initQueue.shift().call(this, options);
        
        this.fire('ready');
    }
});

KityMinder.version = '1.3.2';

KityMinder.registerInit = function(fn) {
    _initFnQueue.push(fn);
};

KityMinder.uuid = function(name) {
    name = name || 'unknown';
    _uuidMap[name] = _uuidMap[name] || 0;
    ++_uuidMap[name];
    return name + '_' + _uuidMap[name];
};

// expose
if (typeof(module) != 'undefined') {
    module.exports = KityMinder;
} else {
    window.KityMinder = KityMinder;
}

/* jshint +W079 */