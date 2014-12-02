define(function(require, exports, module) {
    var kity = require('./kity');
    var utils = require('./utils');
    var Minder = require('./minder');
    var MinderNode = require('./node');
    var MinderEvent = require('./event');
    var compatibility = require('./compatibility');

    // 导入导出
    kity.extendClass(Minder, {

        exportJson: function() {
            /* 导出 node 上整棵树的数据为 JSON */
            function exportNode(node) {
                var exported = {};
                exported.data = node.getData();
                var childNodes = node.getChildren();
                if (childNodes.length) {
                    exported.children = [];
                    for (var i = 0; i < childNodes.length; i++) {
                        exported.children.push(exportNode(childNodes[i]));
                    }
                }
                return exported;
            }

            var json = exportNode(this.getRoot());

            json.template = this.getTemplate();
            json.theme = this.getTheme();
            json.version = Minder.version;

            return json;
        },

        importJson: function(json, params) {

            function importNode(node, json, km) {
                var data = json.data;
                node.data = {};
                for (var field in data) {
                    node.setData(field, data[field]);
                }

                node.setData('text', data.text);

                var childrenTreeData = json.children || [];
                for (var i = 0; i < childrenTreeData.length; i++) {
                    var childNode = km.createNode(null, node);
                    importNode(childNode, childrenTreeData[i], km);
                }
                return node;
            }

            if (!json) return;

            this._fire(new MinderEvent('preimport', params, false));

            // 删除当前所有节点
            while (this._root.getChildren().length) {
                this.removeNode(this._root.getChildren()[0]);
            }

            json = Minder.compatibility(json);

            importNode(this._root, json, this);

            this.setTemplate(json.template || 'default');
            this.setTheme(json.theme || null);
            this.refresh();

            this.fire('import', params);

            this._firePharse({
                type: 'contentchange'
            });
            this._interactChange();
        }
    });
});