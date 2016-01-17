define(function(require, exports, module) {
    var data = require('../core/data');

    /**
     * 导出svg时删除全部svg元素中的transform
     * @auth Naixor
     * @method removeTransform
     * @param  {[type]}        svgDom [description]
     * @return {[type]}               [description]
     */
    function removeTransform(svgDom) {
        function getTransformToElement(target, source) {
            var matrix;
            try {
                matrix = source.getScreenCTM().inverse();
            } catch(e) {
                throw new Error('Can not inverse source element\' ctm.');
            }
            return matrix.multiply(target.getScreenCTM());
        }

        function dealWithPath(d, dealWithPattern) {
            if (!(dealWithPattern instanceof Function)) {
                dealWithPattern = function () {};
            }
            var strArr = [],
                pattern = [],
                cache = [];
            for (var i = 0, l = d.length; i < l; i++) {
                switch (d[i]) {
                    case 'M':
                    case 'L':
                    case 'T':
                    case 'S':
                    case 'A':
                    case 'C': {
                        if (cache.length) {
                            pattern.push(cache.join(''));
                            cache = [];
                        }
                        if (pattern.length) {
                            dealWithPattern(pattern);
                            strArr.push(pattern.join(''));
                            pattern = [];
                        }
                        pattern.push(d[i]);
                        break;
                    }
                    case 'Z':
                    case 'z': {
                        pattern.push(cache.join(''), d[i]);
                        dealWithPattern(pattern);
                        strArr.push(pattern.join(''));
                        cache = [];
                        pattern = [];
                        break;
                    }
                    case '.': {
                        cache.push('.');
                        break;
                    }
                    case '-': {
                        if (cache.length) {
                            pattern.push(cache.join(''), ',');
                        }
                        cache = [];
                        cache.push('-');
                        break;
                    }
                    case ' ':
                    case ',': {
                        pattern.push(cache.join(''), ',');
                        cache = [];
                        break;
                    }
                    default: {
                        if (/\d/.test(d[i])) {
                            cache.push(d[i]);
                        } else {
                            if (cache.length) {
                                pattern.push(cache.join(''), d[i]);
                                cache = [];
                            }
                        }
                        if (i+1 === l) {
                            if (cache.length) {
                                pattern.push(cache.join(''));
                            }
                            dealWithPattern(pattern);
                            strArr.push(pattern.join(''));
                            cache = null;
                            pattern = null;
                        }
                    }
                }
            }
            return strArr.join('');
        }

        function replaceWithNode(parent, svgNode, parentX, parentY) {
            if (!svgNode) {
                return;
            }
            parentX = parentX || 0;
            parentY = parentY || 0;
            if (svgNode.getAttribute('transform')) {
                var ctm = getTransformToElement(svgNode, parent);
                parentX -= ctm.e;
                parentY -= ctm.f;
                svgNode.removeAttribute('transform');
            }
            switch (svgNode.tagName.toLowerCase()) {
                case 'g': {
                    break;
                }
                case 'path': {
                    var d = svgNode.getAttribute('d');
                    if (d) {
                        d = dealWithPath(d, function(pattern) {
                            switch (pattern[0]) {
                                case 'M':
                                case 'L':
                                case 'T': {
                                    pattern[1] = +pattern[1] - parentX;
                                    pattern[3] = +pattern[3] - parentY;
                                    break;
                                }
                                case 'S': {
                                    pattern[1] = +pattern[1] - parentX;
                                    pattern[3] = +pattern[3] - parentY;
                                    pattern[5] = +pattern[5] - parentX;
                                    pattern[7] = +pattern[7] - parentY;
                                    break;
                                }
                                case 'A': {
                                    pattern[11] = +pattern[11] - parentX;
                                    pattern[13] = +pattern[13] - parentY;
                                    break;
                                }
                                case 'C': {
                                    pattern[1] = +pattern[1] - parentX;
                                    pattern[3] = +pattern[3] - parentY;
                                    pattern[5] = +pattern[5] - parentX;
                                    pattern[7] = +pattern[7] - parentY;
                                    pattern[9] = +pattern[9] - parentX;
                                    pattern[11] = +pattern[11] - parentY;
                                }
                            }
                        });
                        svgNode.setAttribute('d', d);
                        svgNode.removeAttribute('transform');
                    }
                    return;
                }
                case 'image':
                case 'text': {
                    if (parentX && parentY) {
                        var x = +svgNode.getAttribute('x') || 0,
                            y = +svgNode.getAttribute('y') || 0;
                        svgNode.setAttribute('x', x - parentX);
                        svgNode.setAttribute('y', y - parentY);
                    }
                    svgNode.removeAttribute('transform');
                    return;
                }
            }

            if (svgNode.children) {
                for (var i = 0, l = svgNode.children.length; i < l; i++){
                    replaceWithNode(svgNode, svgNode.children[i], parentX, parentY)
                };
            }
        }

        svgDom.style.display = 'none';
        replaceWithNode(null, svgDom, 0, 0);
        svgDom.style.display = 'inline';
    }

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
                'font-family: Arial, Microsoft Yahei, Heiti SC; ' +
                'background: ' + minder.getStyle('background'));
            svgDom.setAttribute('viewBox', [
                renderBox.x - padding | 0,
                renderBox.y - padding | 0,
                width + padding * 2 | 0,
                height + padding * 2 | 0
            ].join(' '));

            svgContainer = document.createElement('div');
            removeTransform(svgDom);
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
