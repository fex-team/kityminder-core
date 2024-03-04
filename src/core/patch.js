/**
 * @fileOverview
 *
 * 打补丁
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {
    var kity = require('./kity');
    var Minder = require('./minder');

    function insertNode(minder, info, parent, index) {
        parent = minder.createNode(info.data, parent, index);
        info.children.forEach(function(childInfo, index) {
            insertNode(minder, childInfo, parent, index);
        });
        return parent;
    }

    function applyPatch(minder, patch) {
        // patch.op - 操作，包括 remove, add, replace
        // patch.path - 路径，如 '/root/children/1/data'
        // patch.value - 数据，如 { text: "思路" }
        var path = patch.path.split('/');
        path.shift();

        var changed = path.shift();
        var node;

        if (changed == 'root') {

            var dataIndex = path.indexOf('data');
            if (dataIndex > -1) {
                changed = 'data';
                var dataPath = path.splice(dataIndex + 1);
                patch.dataPath = dataPath;
            } else {
                changed = 'node';
            }

            node = minder.getRoot();
            var segment, index;
            while (segment = path.shift()) {
                if (segment == 'children') continue;
                if (typeof index != 'undefined') node = node.getChild(index);
                index = +segment;
            }
            patch.index = index;
            patch.node = node;
        }
        else if(changed === 'relations'){
            if (path.length < 2) {
                changed = 'relation';
            }

            var index;
            index = path.shift() || 0;
            node = minder._relationContainer.items[index];
            patch.index = index;
            patch.node = node;
        }

        var express = patch.express = [changed, patch.op].join('.');

        switch (express) {
            case 'theme.replace':
                minder.useTheme(patch.value);
                break;
            case 'template.replace':
                minder.useTemplate(patch.value);
                break;
            case 'node.add':
                insertNode(minder, patch.value, patch.node, patch.index).renderTree();
                minder.layout();
                break;
            case 'node.remove':
                minder.removeNode(patch.node.getChild(patch.index));
                minder.layout();
                break;
            case 'data.add':
            case 'data.replace':
            case 'data.remove':
                var data = patch.node.data;
                var field;
                path = patch.dataPath.slice();
                while (data && path.length > 1) {
                    field = path.shift();
                    if (field in data) {
                        data = data[field];
                    } else if (patch.op != 'remove') {
                        data = data[field] = {};
                    }
                }
                if (data) {
                    field = path.shift();
                    data[field] = patch.value;
                }
                if (field == 'expandState') {
                    node.renderTree();
                } else {
                    node.render();
                }
                minder.layout();
                break;
            case 'relations.add':
            case 'relations.remove':
            case 'relations.replace':
                var data = patch.node.relationNode.data;
                var field= data;
                var node = patch.node.relationNode;
                if (path.length > 0) {
                    while (field) {
                        var item = path.shift();
                        if (path.length > 0) {
                            field = field[item];
                        }
                        else {
                            if (item === 'from') {
                                patch.node.relationNode.data.from = patch.value;
                            }
                            else if (item =='to') {
                                if (!patch.value) {
                                    minder.removeRelationNode(node);
                                }
                                else {
                                    patch.node.relationNode.data.to = patch.value;
                                }
                            }
                            else{
                                field[item] = patch.value;
                            }
                            break;
                        }
                    }
                }
                break;
            case 'relation.remove':
                if (!patch.node) return;
                minder.removeRelationNode(patch.node.relationNode);
                break;
            case 'relation.add':
                var patchValue=[];
                if (utils.isArray(patch.value)) {
                    patchValue = patchValue.concat(patch.value);
                }
                else {
                    patchValue.push(patch.value);
                }
                patchValue.forEach(function(relation) {
                    if (minder.getRelationById(relation.id)) {
                        return;
                    }
                    else{
                        minder.importRelation(relation);
                    }
                });
                break;
        }

        minder.fire('patch', { 'patch' : patch } );
    }

    kity.extendClass(Minder, {
        applyPatches: function(patches) {
            this.fire('patchstarted');
            for (var i = 0; i < patches.length; i++) {
                applyPatch(this, patches[i]);
            }

            this.fire('patchfinshed');
            this.fire('contentchange');
            return this;
        }
    });

});