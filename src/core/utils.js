define(function(require, exports) {
    var kity = require('./kity');
    var uuidMap = {};

    exports.extend = kity.Utils.extend.bind(kity.Utils);
    exports.each = kity.Utils.each.bind(kity.Utils);

    exports.uuid = function(group) {
        uuidMap[group] = uuidMap[group] ? uuidMap[group] + 1 : 1;
        return group + uuidMap[group];
    };

    exports.guid = function() {
        return (+new Date() * 1e6 + Math.floor(Math.random() * 1e6)).toString(36);
    };

    exports.trim = function(str) {
        return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
    };

    exports.keys = function(plain) {
        var keys = [];
        for (var key in plain) {
            if (plain.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    exports.clone = function(source) {
        return JSON.parse(JSON.stringify(source));
    };

    exports.comparePlainObject = function(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    };

    exports.encodeHtml = function(str, reg) {
        return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp);)?/g, function(a, b) {
            if (b) {
                return a;
            } else {
                return {
                    '<': '&lt;',
                    '&': '&amp;',
                    '"': '&quot;',
                    '>': '&gt;',
                    '\'': '&#39;'
                }[a];
            }
        }) : '';
    };

    exports.clearWhiteSpace = function(str) {
        return str.replace(/[\u200b\t\r\n]/g, '');
    };

    exports.each(['String', 'Function', 'Array', 'Number', 'RegExp', 'Object'], function(v) {
        var toString = Object.prototype.toString;
        exports['is' + v] = function(obj) {
            return toString.apply(obj) == '[object ' + v + ']';
        };
    });

    function countNodes (node) {
        var count = 0;
        // 如果节点存在子节点
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            // 递归调用函数，计算子节点的子节点数量
            count += countNodes(child);
        }

        // 返回节点数量（包括当前节点）
        return count + 1;
    }

    exports.countNodes = countNodes;

});
