define(function(require, exports, module) {
    var kity = require('./kity');
    var utils = require('./utils');
    var Minder = require('./minder');
    var MinderNode = require('./node');
    var MinderEvent = require('./event');
    var compatibility = require('./compatibility');
    var Promise = require('./promise');

    var protocols = {};

    function registerProtocol(name, protocol) {
        protocols[name] = protocol;

        for (var pname in protocols) {
            if (protocols.hasOwnProperty(pname)) {
                protocols[pname] = protocols[pname];
                protocols[pname].name = pname;
            }
        }
    }

    function getRegisterProtocol(name) {
        return name === undefined ? protocols : (protocols[name] || null);
    }

    exports.registerProtocol = registerProtocol;
    exports.getRegisterProtocol = getRegisterProtocol;

    // 导入导出
    kity.extendClass(Minder, {

        // 自动导入
        setup: function(target) {
            if (typeof target == 'string') {
                target = document.querySelector(target);
            }
            if (!target) return;
            var protocol = target.getAttribute('minder-data-type');
            if (protocol in protocols) {
                var data = target.textContent;
                target.textContent = null;
                this.renderTo(target);
                this.importData(protocol, data);
            }
            return this;
        },

        /**
         * @method exportJson()
         * @for Minder
         * @description
         *     导出当前脑图数据为 JSON 对象，导出的数据格式请参考 [Data](data) 章节。
         * @grammar exportJson() => {plain}
         */
        exportJson: function() {
            /* 导出 node 上整棵树的数据为 JSON */
            function exportNode(node) {
                var exported = {};
                exported.data = node.getData();
                var childNodes = node.getChildren();
                exported.children = [];
                for (var i = 0; i < childNodes.length; i++) {
                    exported.children.push(exportNode(childNodes[i]));
                }
                return exported;
            }

            var json = {
                root: exportNode(this.getRoot())
            };

            json.template = this.getTemplate();
            json.theme = this.getTheme();
            json.version = Minder.version;

            return JSON.parse(JSON.stringify(json));
        },

        /**
         * @method importNode()
         * @description 根据纯json {data, children}数据转换成为脑图节点
         * @Editor: Naixor
         * @Date: 2015.9.20
         */
        importNode: function(node, json) {
            var data = json.data;
            node.data = {};

            for (var field in data) {
                node.setData(field, data[field]);
            }

            var childrenTreeData = json.children || [];
            for (var i = 0; i < childrenTreeData.length; i++) {
                var childNode = this.createNode(null, node);
                this.importNode(childNode, childrenTreeData[i]);
            }
            return node;
        },

        /**
         * @method importJson()
         * @for Minder
         * @description 导入脑图数据，数据为 JSON 对象，具体的数据字段形式请参考 [Data](data) 章节。
         *
         * @grammar importJson(json) => {this}
         *
         * @param {plain} json 要导入的数据
         */
        importJson: function(json) {
            if (!json) return;

            /**
             * @event preimport
             * @for Minder
             * @when 导入数据之前
             */
            this._fire(new MinderEvent('preimport', null, false));

            // 删除当前所有节点
            while (this._root.getChildren().length) {
                this.removeNode(this._root.getChildren()[0]);
            }

            json = compatibility(json);

            this.importNode(this._root, json.root);

            this.setTemplate(json.template || 'default');
            this.setTheme(json.theme || null);
            this.refresh();

            /**
             * @event import,contentchange,interactchange
             * @for Minder
             * @when 导入数据之后
             */
            this.fire('import');

            this._firePharse({
                type: 'contentchange'
            });

            this._interactChange();

            return this;
        },

        /**
         * @method exportData()
         * @for Minder
         * @description 使用指定使用的数据协议，导入脑图数据
         *
         * @grammar exportData(protocol) => Promise<data>
         *
         * @param {string} protocol 指定的数据协议（默认内置五种数据协议 `json`、`text`、`markdown`、`svg` 和 `png`）
         */
        exportData: function(protocolName, option) {
            var json, protocol;

            json = this.exportJson();

            // 指定了协议进行导出，需要检测协议是否支持
            if (protocolName) {
                protocol = protocols[protocolName];

                if (!protocol || !protocol.encode) {
                    return Promise.reject(new Error('Not supported protocol:' + protocolName));
                }
            }

            // 导出前抛个事件
            this._fire(new MinderEvent('beforeexport', {
                json: json,
                protocolName: protocolName,
                protocol: protocol
            }));

            return Promise.resolve(protocol.encode(json, this, option));
        },

        /**
         * @method importData()
         * @for Minder
         * @description 使用指定的数据协议，导入脑图数据，覆盖当前实例的脑图
         *
         * @grammar importData(protocol, callback) => Promise<json>
         *
         * @param {string} protocol 指定的用于解析数据的数据协议（默认内置三种数据协议 `json`、`text` 和 `markdown` 的支持）
         * @param {any} data 要导入的数据
         */
        importData: function(protocolName, data, option) {
            var json, protocol;
            var minder = this;

            // 指定了协议进行导入，需要检测协议是否支持
            if (protocolName) {
                protocol = protocols[protocolName];

                if (!protocol || !protocol.decode) {
                    return Promise.reject(new Error('Not supported protocol:' + protocolName));
                }
            }

            var params = {
                local: data,
                protocolName: protocolName,
                protocol: protocol
            };

            // 导入前抛事件
            this._fire(new MinderEvent('beforeimport', params));

            return Promise.resolve(protocol.decode(data, this, option)).then(function(json) {
                minder.importJson(json);
                return json;
            });
        },

        /**
         * @method decodeData()
         * @for Minder
         * @description 使用指定的数据协议，解析为脑图数据，与 importData 的区别在于：不覆盖当前实例的脑图
         *
         * @grammar decodeData(protocol, callback) => Promise<json>
         *
         * @param {string} protocol 指定的用于解析数据的数据协议（默认内置三种数据协议 `json`、`text` 和 `markdown` 的支持）
         * @param {any} data 要导入的数据
         */
        decodeData: function(protocolName, data, option) {
            var json, protocol;
            var minder = this;

            // 指定了协议进行导入，需要检测协议是否支持
            if (protocolName) {
                protocol = protocols[protocolName];

                if (!protocol || !protocol.decode) {
                    return Promise.reject(new Error('Not supported protocol:' + protocolName));
                }
            }

            var params = {
                local: data,
                protocolName: protocolName,
                protocol: protocol
            };

            // 导入前抛事件
            this._fire(new MinderEvent('beforeimport', params));

            return Promise.resolve(protocol.decode(data, this, option))
        }
    });
});