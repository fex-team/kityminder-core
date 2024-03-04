define(function(require, exports, module) {
    var kity = require('./kity');
    var utils = require('./utils');
    var Module = require('./module');
    var Minder = require('./minder');
    var MinderNode = require('./node');
    var config = require('./config');
    var rainbowColors = config.rainbowColors;
    var mainRainbowColors = config.mainRainbowColors;
    // 连线提供方
    var _connectProviders = {};

    function register(name, provider) {
        _connectProviders[name] = provider;
    }

    register('default', function(node, parent, connection) {
        connection.setPathData([
            'M', parent.getLayoutVertexOut(),
            'L', node.getLayoutVertexIn()
        ]);
    });

    kity.extendClass(MinderNode, {
        /**
         * @private
         * @method getConnect()
         * @for MinderNode
         * @description 获取当前节点的连线类型
         *
         * @grammar getConnect() => {string}
         */
        getConnect: function() {
            return this.data.connect || 'default';
        },

        getConnectProvider: function() {
            return _connectProviders[this.getConnect()] || _connectProviders['default'];
        },

        /**
         * @private
         * @method getConnection()
         * @for MinderNode
         * @description 获取当前节点的连线对象
         *
         * @grammar getConnection() => {kity.Path}
         */
        getConnection: function() {
            return this._connection || null;
        }
    });

    var gradientCache = {}; // 用于缓存生成的渐变

    function createGradient(id, colors, paper, c1) {
        // 如果缓存中已经有了，直接返回
        if (gradientCache[id]) {
            return gradientCache[id];
        }
        // 创建新的渐变
        var gradient = new kity.LinearGradient().pipe(function(g) {
            g.setStartPosition(0, 0);
            g.setEndPosition(1, 0);
            colors.forEach(function(color, index) {
                // g.addStop(index / (colors.length - 1), color);
                g.addStop(index === 0 ? c1 : '1', color);
            });
        });
        paper.addResource(gradient); // 添加到画布资源中
        gradientCache[id] = gradient; // 加入缓存
        return gradient;
    }

    kity.extendClass(Minder, {

        getConnectContainer: function() {
            return this._connectContainer;
        },

        createConnect: function(node) {
            if (node.isRoot()) return;

            var connection = new kity.Path();

            node._connection = connection;

            this._connectContainer.addShape(connection);

            this.updateConnect(node);
        },

        removeConnect: function(node) {
            var me = this;
            node.traverse(function(node) {
                me._connectContainer.removeShape(node._connection);
                node._connection = null;
            });
        },

        updateConnect: function(node) {

            var connection = node._connection;
            var parent = node.parent;

            if (!parent || !connection) return;

            if (parent.isCollapsed()) {
                connection.setVisible(false);
                return;
            }
            connection.setVisible(true);
            
            var provider = node.getConnectProvider();
            var connectType = node.getConnect();

            // 默认纯色
            var strokeColor = node.getStyle('connect-color') || 'white';

            // 创建渐变色引用
            var isRoot = parent.isRoot();

            // TODO: 方法拆一下 单个函数代码太多了
            // 获取颜色
            var isRainbow = node.getStyle('rainbow-branch');
            var gradientColors = isRoot ? node.getStyle('connect-gradients') : node.getStyle('sub-connect-gradients');
            if (isRainbow) {
                var idx = node.getMainIndex();
                var i = idx % rainbowColors.length;
                gradientColors = node.getType() ==='main'
                    ? [
                        node.getStyle('connect-color') || 'white',
                        rainbowColors[i]
                    ]
                    : [
                        rainbowColors[i],
                        mainRainbowColors[i]
                    ]
            }

            if (gradientColors && gradientColors.length === 2) {
                // 生成渐变ID，确保唯一性
                var gradientId = gradientColors.join('-');
                var reverseGradientId = gradientColors.slice().reverse().join('-');
                var paper = this.getPaper();
                var c1 = isRainbow ? '0' : '80%';
                // 生成渐变，考虑正反两种情况
                strokeColor = createGradient(gradientId, gradientColors, paper, c1);
                var reverseStrokeColor = createGradient(reverseGradientId, gradientColors.slice().reverse(), paper);
            }

            var strokeWidth = isRoot
                ? node.getStyle('connect-width') || 2
                : node.getStyle('sub-connect-width') || 1;
            connection.stroke(node.getLayoutPointPreview().x > 0 ? strokeColor : reverseStrokeColor, strokeWidth);
            provider(node, parent, connection, strokeWidth, strokeColor);
            if (strokeWidth % 2 === 0) {
                connection.setTranslate(0.5, 0.5);
            } else {
                connection.setTranslate(0, 0);
            }
        }
    });

    Module.register('Connect', {
        init: function() {
            this._connectContainer = new kity.Group().setId(utils.uuid('minder_connect_group'));
            this._strokeGradient = FRAME_GRAD = new kity.LinearGradient().pipe(function(g) {
                g.setStartPosition(0, 0);
                g.setEndPosition(1, 0);
                g.addStop(0, '#C2CFE9');
                g.addStop(1, '#F4F5F8');
            });
            this.getPaper().addResource(FRAME_GRAD);
            this.getRenderContainer().prependShape(this._connectContainer);
        },
        events: {
            'nodeattach': function(e) {
                this.createConnect(e.node);
            },
            'nodedetach': function(e) {
                this.removeConnect(e.node);
            },
            'layoutapply layoutfinish noderender': function(e) {
                this.updateConnect(e.node);
            }
        }
    });

    exports.register = register;
});