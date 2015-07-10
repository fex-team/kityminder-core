define(function(require, exports, module) {
    var data = require('../core/data');

    data.registerProtocol('svg', module.exports = {
        fileDescription: 'SVG 矢量图',
        fileExtension: '.svg',
        mineType: 'image/svg+xml',
        dataType: 'text',

        encode: function(json, minder) {

            var paper = minder.getPaper(),
                paperTransform = paper.shapeNode.getAttribute('transform'),
                svgXml,
                svgContainer,
                svgDom,

                renderContainer = minder.getRenderContainer(),
                renderBox = renderContainer.getRenderBox(),
                transform = renderContainer.getTransform(),
                width = renderBox.width,
                height = renderBox.height,
                padding = 20;

            paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');
            svgXml = paper.container.innerHTML;
            paper.shapeNode.setAttribute('transform', paperTransform);

            svgContainer = document.createElement('div');
            svgContainer.innerHTML = svgXml;

            svgDom = svgContainer.querySelector('svg');
            svgDom.setAttribute('width', width + padding * 2 | 0);
            svgDom.setAttribute('height', height + padding * 2 | 0);
            svgDom.setAttribute('style',
                'font-family: Arial, "Microsoft Yahei",  "Heiti SC"; ' +
                'background: ' + minder.getStyle('background'));
            svgDom.setAttribute('viewBox', [
                renderBox.x - padding | 0,
                renderBox.y - padding | 0,
                width + padding * 2 | 0,
                height + padding * 2 | 0
            ].join(' '));

            svgContainer = document.createElement('div');
            svgContainer.appendChild(svgDom);

            // need a xml with width and height
            svgXml = svgContainer.innerHTML;

            // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
            svgXml = svgXml.replace(/&nbsp;/g, '&#xa0;');

            // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
            return svgXml;
        }
    });
});