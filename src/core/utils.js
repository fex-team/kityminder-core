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

    exports.camelCaseToKebabCase = function(str) {
        return str.replace(/([a-z\d])([A-Z]+)/g, function(match, lowerCase, upperCase) {
            return lowerCase + '-' + upperCase.toLowerCase();
        }).toLowerCase();
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

    // 节流函数 (Throttle)
    function throttle(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            if (!timeout) {
                timeout = setTimeout(function() {
                    timeout = null;
                }, wait);
                func.apply(context, args);
            }
        };
    }

    // 防抖函数 (Debounce)
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    exports.throttle = throttle;
    exports.debounce = debounce;

    /**
     * 生成向量。
     *
     * @param {number} [x=0]
     * @param {number} [y=0]
     */
    function Vec2(x, y) {
        if(x && typeof x === 'object') {
            y = x.y;
            x = x.x;
        }
        this.x = x || 0;
        this.y = y || 0;
    }

    var bezierLength = {
        p: function(x, y) {
            return new Vec2(x, y)
        },
        /**
         *  返回两个向量的差。
         * @method pSub
         * @param {Vec2} v1
         * @param {Vec2} v2
         * @return {Vec2}
         * @example
         */
        pSub: function(v1, v2) {
            return this.p(v1.x - v2.x, v1.y - v2.y);
        },
        /**
         *  两个向量之间进行点乘。
         * @method pDot
         * @param {Vec2} v1
         * @param {Vec2} v2
         * @return {Number}
         * @example
         */
        pDot: function(v1, v2) {
            return v1.x * v2.x + v1.y * v2.y;
        },
        /**
         *  返回指定向量长度的平方。
         * @method pLengthSQ
         * @param  {Vec2} v
         * @return {Number}
         * @example
         * cc.pLengthSQ(cc.v2(20, 20)); // 800;
         */
        pLengthSQ: function(v) {
            return this.pDot(v, v);
        },

        /**
         *  返回两个点之间距离的平方。
         * @method pDistanceSQ
         * @param {Vec2} point1
         * @param {Vec2} point2
         * @return {Number}
         * @example
         * var point1 = v2(20, 20);
         * var point2 = v2(5, 5);
         * pDistanceSQ(point1, point2); // 450;
         */
        pDistanceSQ: function(point1, point2) {
            return this.pLengthSQ(this.pSub(point1, point2));
        },
        /**
         * 
         *
         * @param {*} cp
         * @param {*} t
         * @returns
         */
        pointOnCubicBezier: function(cp, t) {
            var ax, bx, cx;
            var ay, by, cy;
            var tSquared, tCubed;
            var result = {}

            /*計算多項式係數*/

            cx = 3.0 * (cp[1].x - cp[0].x);
            bx = 3.0 * (cp[2].x - cp[1].x) - cx;
            ax = cp[3].x - cp[0].x - cx - bx;

            cy = 3.0 * (cp[1].y - cp[0].y);
            by = 3.0 * (cp[2].y - cp[1].y) - cy;
            ay = cp[3].y - cp[0].y - cy - by;

            /*計算位於參數值t的曲線點*/

            tSquared = t * t;
            tCubed = tSquared * t;

            result.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
            result.y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;

            return result
        },
        /**
         * !#en Test line and line
         * !#zh 线段与线段的交点
         * @method lineLine
         * @param {Vec2} a1 - The start point of the first line
         * @param {Vec2} a2 - The end point of the first line
         * @param {Vec2} b1 - The start point of the second line
         * @param {Vec2} b2 - The end point of the second line
         * @return {boolean}
         */
        lineLine: function(a1, a2, b1, b2) {
            var result;
            var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
            var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
            var u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
            if(u_b != 0) {
                var ua = ua_t / u_b;
                var ub = ub_t / u_b;
                if(0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                    result = (new Vec2(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
                } else {}
            } else {
                if(ua_t == 0 || ub_t == 0) {} else {}
            }
            return result;

        },

        /**
         * !#en Test line and rect
         * !#zh 矩形与线段的交点
         * @method lineRect
         * @param {Vec2} a1 - The start point of the line
         * @param {Vec2} a2 - The end point of the line
         * @param {Rect} b - The rect
         * @return {boolean}
         */
        lineRect: function(a1, a2, b) {
            var points = ''
            var r0 = new Vec2(b.x, b.y);
            var r1 = new Vec2(b.x, b.yMax);
            var r2 = new Vec2(b.xMax, b.yMax);
            var r3 = new Vec2(b.xMax, b.y);

            if(this.lineLine(a1, a2, r0, r1))
                points = this.lineLine(a1, a2, r0, r1)

            else if(this.lineLine(a1, a2, r1, r2))
                points = this.lineLine(a1, a2, r1, r2)

            else if(this.lineLine(a1, a2, r2, r3))
                points = this.lineLine(a1, a2, r2, r3)

            else if(this.lineLine(a1, a2, r3, r0))
                points = this.lineLine(a1, a2, r3, r0)


            if(!points) {
                var rn = kity.Vector.fromPoints(a1, a2);
                var points = bezierLength.lineRect(a1, {
                    x: a2.x + rn.x+1,
                    y: a2.y + rn.y+1
                }, b);
            }
            return points;
        }
    }

    exports.lineToRect = function(a1,a2,r){
        return bezierLength.lineRect(a1,a2,r);
    }
});
