define(function(require, exports, module) {
    var kity = require('core/kity');
    var utils = require('core/utils');

    var Minder = require('core/minder');
    var MinderNode = require('core/node');
    var Command = require('core/command');
    var Module = require('core/module');

    function compareObject(source, target) {
        var tmp;
        if (isEmptyObject(source) !== isEmptyObject(target)) {
            return false;
        }
        if (getObjectLength(source) != getObjectLength(target)) {
            return false;
        }
        for (var p in source) {
            if (source.hasOwnProperty(p)) {
                tmp = source[p];
                if (target[p] === undefined) {
                    return false;
                }
                if (this.isObject(tmp) || this.isArray(tmp)) {
                    if (this.isObject(target[p]) !== this.isObject(tmp)) {
                        return false;
                    }
                    if (this.isArray(tmp) !== this.isArray(target[p])) {
                        return false;
                    }
                    if (this.compareObject(tmp, target[p]) === false) {
                        return false;
                    }
                } else {
                    if (tmp != target[p]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function getObjectLength(obj) {
        if (utils.isArray(obj) || utils.isString(obj)) return obj.length;
        var count = 0;
        for (var key in obj)
            if (obj.hasOwnProperty(key)) count++;
        return count;
    }

    function isEmptyObject(obj) {
        if (obj === null || obj === undefined) return true;
        if (utils.isArray(obj) || utils.isString(obj)) return obj.length === 0;
        for (var key in obj)
            if (obj.hasOwnProperty(key)) return false;
        return true;
    }

    function getValueByIndex(data, index) {

        var initIndex = 0,
            result = 0;

        data.forEach(function(arr, i) {
            if (initIndex + arr.length >= index) {

                if (index - initIndex == arr.length) {
                    if (arr.length == 1 && arr[0].width === 0) {
                        initIndex++;
                        return;
                    }
                    result = {
                        x: arr[arr.length - 1].x + arr[arr.length - 1].width,
                        y: arr[arr.length - 1].y
                    };
                } else {
                    result = arr[index - initIndex];
                }

                return false;
            } else {
                initIndex += arr.length + (arr.length == 1 && arr[0].width === 0 ? 0 : 1);
            }
        });
        return result;
    }

    function getNodeIndex(node, ignoreTextNode) {
        var preNode = node,
            i = 0;
        while (preNode = preNode.previousSibling) {
            if (ignoreTextNode && preNode.nodeType == 3) {
                if (preNode.nodeType != preNode.nextSibling.nodeType) {
                    i++;
                }
                continue;
            }
            i++;
        }
        return i;
    }

    var km = this;

    var Scene = kity.createClass('Scene', {
        constructor: function(root, inputStatus) {
            this.data = root.clone();
            this.inputStatus = inputStatus;
        },
        getData: function() {
            return this.data;
        },
        cloneData: function() {
            return this.getData().clone();
        },
        equals: function(scene) {
            return this.getData().compareTo(scene.getData());
        },
        isInputStatus: function() {
            return this.inputStatus;
        },
        setInputStatus: function(status) {
            this.inputStatus = status;
        }
    });
    var HistoryManager = kity.createClass('HistoryManager', {
        constructor: function(km) {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
            this.km = km;
        },
        undo: function() {
            if (this.hasUndo) {
                var currentScene = this.list[this.index];
                //如果是输入文字时的保存，直接回复当前场景
                if (currentScene && currentScene.isInputStatus()) {
                    this.saveScene();
                    this.restore(--this.index);
                    currentScene.setInputStatus(false);
                    return;
                }
                if (this.list.length == 1) {
                    this.restore(0);
                    return;
                }
                if (!this.list[this.index - 1] && this.list.length == 1) {
                    this.reset();
                    return;
                }
                while (this.list[this.index].equals(this.list[this.index - 1])) {
                    this.index--;
                    if (this.index === 0) {
                        return this.restore(0);
                    }
                }
                this.restore(--this.index);
            }
        },
        redo: function() {
            if (this.hasRedo) {
                while (this.list[this.index].equals(this.list[this.index + 1])) {
                    this.index++;
                    if (this.index == this.list.length - 1) {
                        return this.restore(this.index);
                    }
                }
                this.restore(++this.index);
            }
        },
        partialRenewal: function(target) {
            var selectedNodes = [];

            function compareNode(source, target) {
                if (source.getText() != target.getText()) {
                    return false;
                }
                if (compareObject(source.getData(), target.getData()) === false) {
                    return false;
                }
                return true;
            }

            function appendChildNode(parent, child) {
                if (child.isSelected()) {
                    selectedNodes.push(child);
                }
                km.appendNode(child, parent);
                child.render();

                var children = child.children.slice();
                for (var i = 0, ci; ci = children[i++];) {
                    appendChildNode(child, ci);
                }
            }

            function traverseNode(srcNode, tagNode) {

                if (compareNode(srcNode, tagNode) === false) {
                    srcNode.setValue(tagNode);
                }
                //todo，这里有性能问题，变成全部render了
                srcNode.render();
                if (srcNode.isSelected()) {
                    selectedNodes.push(srcNode);
                }
                for (var i = 0, j = 0, si, tj;
                    (si = srcNode.children[i], tj = tagNode.children[j], si || tj); i++, j++) {
                    if (si && !tj) {
                        i--;
                        km.removeNode(si);
                    } else if (!si && tj) {
                        j--;
                        appendChildNode(srcNode, tj);
                    } else {
                        traverseNode(si, tj);
                    }
                }
            }

            var km = this.km;
            traverseNode(km.getRoot(), target);
            km.layout(200);

            km.select(selectedNodes, true);

            selectedNodes = [];

        },
        restore: function(index) {
            index = index === undefined ? this.index : index;
            var scene = this.list[index];
            this.partialRenewal(scene.cloneData());
            this.update();
            this.km.fire('restoreScene');
            this.km.fire('contentChange');
        },
        getScene: function(inputStatus) {
            return new Scene(this.km.getRoot(), inputStatus);
        },
        saveScene: function(inputStatus) {
            var currentScene = this.getScene(inputStatus);
            var lastScene = this.list[this.index];
            if (lastScene && lastScene.equals(currentScene)) {
                if (inputStatus) {
                    lastScene.setInputStatus(true);
                    this.update();
                }
                return;
            }
            this.list = this.list.slice(0, this.index + 1);
            this.list.push(currentScene);
            //如果大于最大数量了，就把最前的剔除
            if (this.list.length > this.km.getOption('maxUndoCount')) {
                this.list.shift();
            }
            this.index = this.list.length - 1;
            //跟新undo/redo状态
            this.update();
        },
        update: function() {

            this.hasRedo = !!this.list[this.index + 1];
            this.hasUndo = !!this.list[this.index - 1];
            var currentScene = this.list[this.index];
            if (currentScene && currentScene.isInputStatus()) {
                this.hasUndo = true;
            }

        },
        reset: function() {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
        }
    });

    Module.register('HistoryModule', function() {

        //为km实例添加history管理
        this.historyManager = new HistoryManager(this);

        return {
            defaultOptions: {
                maxUndoCount: 20,
                maxInputCount: 20
            },
            'commands': {

                /**
                 * @command Undo
                 * @description 回退上一步操作
                 * @state
                 *   0: 当前有可回退的内容
                 *  -1: 当前没有可回退的内容
                 */
                'undo': kity.createClass('UndoCommand', {
                    base: Command,

                    execute: function(km) {
                        km.historyManager.undo();
                    },

                    queryState: function(km) {
                        return km.historyManager.hasUndo ? 0 : -1;
                    },

                    isNeedUndo: function() {
                        return false;
                    }
                }),
                /**
                 * @command Redo
                 * @description 重做下一步已回退的操作
                 * @state
                 *   0: 当前有可重做的内容
                 *  -1: 当前没有可重做的内容
                 */
                'redo': kity.createClass('RedoCommand', {
                    base: Command,

                    execute: function(km) {
                        km.historyManager.redo();
                    },

                    queryState: function(km) {
                        return km.historyManager.hasRedo ? 0 : -1;
                    },
                    isNeedUndo: function() {
                        return false;
                    }
                })
            },
            commandShortcutKeys: {
                'undo': 'ctrl+z', //undo
                'redo': 'ctrl+y' //redo
            },
            'events': {
                'saveScene': function(e) {
                    this.historyManager.saveScene(e.inputStatus);
                },
                'import': function() {
                    this.historyManager.reset();
                }
            }
        };
    });

});