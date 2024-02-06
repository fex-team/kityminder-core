/**
 * @file 节点关系线
 */

define(function(require, exports, module) {
    var kity = require('./kity');
    var utils = require('./utils');
    var Minder = require('./minder');
    var MinderNode = require('./node');

    var MinderRelation = kity.createClass('MinderRelation', {
        constructor: function(minder, data) {
            this.minder = minder;
            this.marker = {};
            this.data = {
                id: utils.guid(),
                cid: utils.guid(),
                created: +new Date(),
                controls: [],
                text: '',
                from: '',
                to: '',
                'line-width': 1.5,
                'line-color': '#000',
                'line-style': 'sysDot',
                'line-from-arrow': '',
                'line-to-arrow': 'arrow',
            };

            if (utils.isObject(data)) {
                utils.extend(this.data, data);
            }

            this.create();
        },

        getMinder: function() {
            return this.minder;
        },

        hide: function() {
            this.rc.setVisible(false);
        },

        show: function() {
            this.rc.setVisible(true);
        },

        select: function() {
            this.selectMode = true;
            this.getMinder().fire('selectrelation', this);
        },

        unSelect: function() {
            this.selectMode = false;
            this.getMinder().fire('unselectrelation', this);
        },

        hover: function() {
            this.hoverMode = true;
        },

        unHover: function() {
            this.hoverMode = false;
        },

        setText: function(text) {
            return this.data.text = text;
        },

        getText: function() {
            return this.data.text || '联系';
        },

        getData: function(key) {
            return key ? this.data[key] : this.data;
        },

        setData: function(key, value) {
            if (typeof key == 'object') {
                var data = key;
                for (key in data)
                    if (data.hasOwnProperty(key)) {
                        this.data[key] = data[key];
                    }
            }
            else {
                this.data[key] = value;
            }

            return this;
        },

        submit: function(toId, controls) {
            this.setData('to', toId);
            this.setData('controls', controls);
        },

        remove: function() {
            this.rc && this.rc.remove();
            this.getMinder().fire('removerelation', this);
        }
    });

    module.exports = MinderRelation;
});