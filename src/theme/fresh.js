define(function(require, exports, module) {
    var kity = require('../core/kity');
    var theme = require('../core/theme');

    function hsl(h, s, l) {
        return kity.Color.createHSL(h, s, l);
    }

    function generate(h, compat) {
        return {
            'background': '#fbfbfb',

            'root-color': '#3f51b5',
            'root-background': 'transparent',
            'root-stroke': '#3f51b5',
			'root-stroke-width': 1,
            'root-font-size': 16,
            'root-padding': compat ? [6, 12] : [12, 24],
            'root-margin': compat ? 10 : [30, 100],
            'root-radius': 5,
            'root-space': 10,

            'main-color': '#3f51b5',
            'main-background': 'transparent',
            'main-stroke': '#3f51b5',
            'main-stroke-width': 1,
            'main-font-size': 14,
            'main-padding': [2, 20],
            'main-margin': compat ? 8 : 20,
            'main-radius': 3,
            'main-space': 5,

			'sub-stroke': '#3f51b5',
            'sub-stroke-width': 1,
            'sub-color': '#3f51b5',
            'sub-background': 'transparent',
            'sub-font-size': 12,
			'sub-font-color': '#3f51b5',
            'sub-padding': compat ? [2, 5] : [2, 10],
            'sub-margin': compat ? [4, 8] : [15, 20],
            'sub-radius': 5,
            'sub-space': 5,

            'connect-color': '#3f51b5',//hsl(h, 37, 60),
            'connect-width': 1,
            'connect-radius': 1,
			'main-connect-radius' : 1,
			'main-connect-width': 3,
			
            'selected-stroke': hsl(h, 26, 30),
            'selected-stroke-width': '3',
            'blur-selected-stroke': hsl(h, 10, 60),

            'marquee-background': hsl(h, 100, 80).set('a', 0.1),
            'marquee-stroke': hsl(h, 37, 60),

            'drop-hint-color': hsl(h, 26, 35),
            'drop-hint-width': 5,

            'order-hint-area-color': hsl(h, 100, 30).set('a', 0.5),
            'order-hint-path-color': hsl(h, 100, 25),
            'order-hint-path-width': 1,

            'text-selection-color': hsl(h, 100, 20),
            'line-height':1.5
        };
    }

    var plans = {
        red: 0,
        soil: 25,
        green: 122,
        blue: 204,
        purple: 246,
        pink: 334
    };
    var name;
    for (name in plans) {
        theme.register('fresh-' + name, generate(plans[name]));
        theme.register('fresh-' + name + '-compat', generate(plans[name], true));
    }

});