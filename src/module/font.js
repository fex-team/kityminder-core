define(function(require, exports, module) {
    var kity = require('core/kity');
    var utils = require('core/utils');

    var Minder = require('core/minder');
    var MinderNode = require('core/node');
    var Command = require('core/command');
    var Module = require('core/module');

    var TextRenderer = require('./text');

    function getNodeDataOrStyle(node, name) {
        return node.getData(name) || node.getStyle(name);
    }

    TextRenderer.registerStyleHook(function(node, textGroup) {
        var dataColor = node.getData('color');
        var selectedColor = node.getStyle('selected-color');
        var styleColor = node.getStyle('color');

        var foreColor = dataColor || (node.isSelected() && selectedColor ? selectedColor : styleColor);
        var fontFamily = getNodeDataOrStyle(node, 'font-family');
        var fontSize = getNodeDataOrStyle(node, 'font-size');

        textGroup.fill(foreColor);

        textGroup.eachItem(function(index, item) {
            item.setFont({
                'family': fontFamily,
                'size': fontSize
            });
        });
    });


    Module.register('fontmodule', {
        defaultOptions: {
            'commands': {
                'forecolor': kity.createClass('fontcolorCommand', {
                    base: Command,
                    execute: function(km, color) {
                        var nodes = km.getSelectedNodes();
                        nodes.forEach(function(n) {
                            n.setData('color', color);
                            n.render();
                        });
                    },
                    queryState: function(km) {
                        return km.getSelectedNodes().length === 0 ? -1 : 0;
                    },
                    queryValue: function(km) {
                        if (km.getSelectedNodes().length == 1) {
                            return km.getSelectedNodes()[0].getData('color');
                        }
                        return 'mixed';
                    }

                }),
                'background': kity.createClass('backgroudCommand', {
                    base: Command,

                    execute: function(km, color) {
                        var nodes = km.getSelectedNodes();
                        nodes.forEach(function(n) {
                            n.setData('background', color);
                            n.render();
                        });
                    },
                    queryState: function(km) {
                        return km.getSelectedNodes().length === 0 ? -1 : 0;
                    },
                    queryValue: function(km) {
                        if (km.getSelectedNodes().length == 1) {
                            return km.getSelectedNodes()[0].getData('background');
                        }
                        return 'mixed';
                    }
                }),
                'fontfamily': kity.createClass('fontfamilyCommand', {
                    base: Command,

                    execute: function(km, family) {
                        var nodes = km.getSelectedNodes();
                        nodes.forEach(function(n) {
                            n.setData('font-family', family);
                            n.render();
                            km.layout();
                        });
                    },
                    queryState: function(km) {
                        return km.getSelectedNodes().length === 0 ? -1 : 0;
                    },
                    queryValue: function(km) {
                        var node = km.getSelectedNode();
                        if (node) return node.getData('font-family');
                        return null;
                    }
                }),
                'fontsize': kity.createClass('fontsizeCommand', {
                    base: Command,

                    execute: function(km, size) {
                        var nodes = km.getSelectedNodes();
                        nodes.forEach(function(n) {
                            n.setData('font-size', size);
                            n.render();
                            km.layout(300);
                        });
                    },
                    queryState: function(km) {
                        return km.getSelectedNodes().length === 0 ? -1 : 0;
                    },
                    queryValue: function(km) {
                        var node = km.getSelectedNode();
                        if (node) return node.getData('font-size');
                        return null;
                    }
                })
            }
        }
    });
});