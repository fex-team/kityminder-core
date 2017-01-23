/**
  * runtime patches should be imported before kmwraper's constructor be called.
  * and it will be called after kityminder object constructed.
  
  * And there is also another logic to do things like this, e.g. we can bind a logic to event:beforerender, and rebuild the logic before node is rendered.
  *
 **/
var runtimeRendererPatches = [
{
	/**
	  * 节点展开收起图标位置调整；
	 **/
	params : ['Expand', 'ExpanderRenderer', 'outside', 'update'],
	excution : function(
			moduleType, 
			renderName, 
			renderType, 
			renderMethod){
				
		// static scopes.
		var EXPAND_STATE_DATA = 'expandState',
			STATE_EXPAND = 'expand',
			STATE_COLLAPSE = 'collapse';
			
		//target logic.
		var update = function(expander, node, box) {
			if (!node.parent) return;
			var visible = node.parent.isExpanded();

			expander.setState(visible && node.children.length ? node.getData(EXPAND_STATE_DATA) : 'hide');

			var vector = node.getLayoutVectorIn().normalize(expander.radius + node.getStyle('stroke-width'));
			var position = node.getVertexIn().offset(vector.reverse());
			//edit by willjoe 2016/12/23 move expand icon to right;
			position.x += node._contentBox.width + expander.radius * 2 + 3 + node.getStyle('stroke-width');
			this.expander.setTranslate(position);
		};
		
		//origin module renderer.
		this._modules[moduleType].renderers[renderType][renderMethod] = update;
		//after node constructor.
		var allNodes = this.getAllNode();
		for(var i=0, len = allNodes.length; i<len; i++){
			var theNode = allNodes[i];
			theNode.getRenderer(renderName)[renderMethod] = update;
		}
		//after registry.
		this._rendererClasses[renderType].map(function(render, index){
			if(render.name === renderName){
				render.prototype[renderMethod] = update;
			}
		});
	}
},
{
	/**
	  * 节点展开收起图标形状调整；
	 **/
	params : ['Expand', 'ExpanderRenderer', 'outside', 'create'],
	excution : function(
			moduleType, 
			renderName, 
			renderType, 
			renderMethod){
		var _this = this;
		// static scopes.
		var EXPAND_STATE_DATA = 'expandState',
			STATE_EXPAND = 'expand',
			STATE_COLLAPSE = 'collapse';
		
		var Expander = kity.createClass('Expander', {
            base: kity.Group,
            constructor: function(node) {
                this.callBase();
                this.radius = 6;
                this.outline = new kity.Rect(this.radius * 2,this.radius * 2, -this.radius,-this.radius).stroke('gray').fill('white');
                this.sign = new kity.Path().stroke('gray');
                this.addShapes([this.outline, this.sign]);
                this.initEvent(node);
                this.setId(new Date().getTime());
                this.setStyle('cursor', 'pointer');
            },
            initEvent: function(node) {
                this.on('mousedown', function(e) {
                    _this.select([node], true);
                    if (node.isExpanded()) {
                        node.collapse();
                    } else {
                        node.expand();
                    }
                    node.renderTree().getMinder().layout(100);
                    node.getMinder().fire('contentchange');
                    e.stopPropagation();
                    e.preventDefault();
                });
                this.on('dblclick click mouseup', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                });
            },

            setState: function(state) {
                if (state == 'hide') {
                    this.setVisible(false);
                    return;
                }
                this.setVisible(true);
                var pathData = ['M', 1.5 - this.radius, 0, 'L', this.radius - 1.5, 0];
                if (state == STATE_COLLAPSE) {
                    pathData.push(['M', 0, 1.5 - this.radius, 'L', 0, this.radius - 1.5]);
                }
                this.sign.setPathData(pathData);
            }
        });
		
		
		//target logic.
		var create = function(node) {
            if (node.isRoot()) return;
            this.expander = new Expander(node);
            node.getRenderContainer().addShape(this.expander);
            node.expanderRenderer = this;
            this.node = node;
			this.update(this.expander, node, node._contentBox);
            return this.expander;
        }
		
		//origin module renderer.
		this._modules[moduleType].renderers[renderType][renderMethod] = create;
		//after node constructor.
		var allNodes = this.getAllNode();
		for(var i=0, len = allNodes.length; i<len; i++){
			var theNode = allNodes[i];
			theNode.getRenderer(renderName)[renderMethod] = create;
		}
		//after registry.
		this._rendererClasses[renderType].map(function(render, index){
			if(render.name === renderName){
				render.prototype[renderMethod] = create;
			}
		});
	}
},
{
	/**
	  * 节点边框逻辑调整，如果节点数据中，renderfix下，masked为真，则不产生默认的边框；
	  * 调整节点左右padding属性。
	 **/
	params : ['OutlineModule', 'OutlineRenderer', 'outline', 'update'],
	excution : function(
			moduleType, 
			renderName, 
			renderType, 
			renderMethod){
		//target logic.
		var update = function(outline, node, box) {
			var shape = node.getStyle('shape');
            var paddingLeft = node.getStyle('padding-left'),
                paddingRight = node.getStyle('padding-right'),
                paddingTop = node.getStyle('padding-top'),
                paddingBottom = node.getStyle('padding-bottom');
			//FIXING!!!
			var renderfix = node.getData('renderfix');
			var masked = renderfix && renderfix.masked;
			var nodetype = node.getType();
			if(masked){
				paddingRight =0;
				if(!renderfix.logoUrl){
					paddingLeft = 0;
				}
			}
			
            var outlineBox = {
                x: box.x - paddingLeft,
                y: box.y - paddingTop,
                width: box.width + paddingLeft + paddingRight,
                height: box.height + paddingTop + paddingBottom
            };

            var radius = node.getStyle('radius');
            // 天盘图圆形的情况
            if (shape && shape == 'circle') {
                var p = Math.pow;
                var r = Math.round;

                radius = r(Math.sqrt(p(outlineBox.width, 2) + p(outlineBox.height, 2)) / 2);

                outlineBox.x = box.cx - radius;
                outlineBox.y = box.cy - radius;
                outlineBox.width = 2 * radius;
                outlineBox.height = 2 * radius;
            }
            var prefix = node.isSelected() ? (node.getMinder().isFocused() ? 'selected-' : 'blur-selected-') : '';
			// FIXING!!!
			var renderFix = node.getData('renderfix');
			var autoStroke = !renderFix || renderFix.autoStroke;
            outline
                .setPosition(outlineBox.x, outlineBox.y)
                .setSize(outlineBox.width, outlineBox.height)
                .setRadius(radius)
                .fill(node.getData('background') || node.getStyle(prefix + 'background') || node.getStyle('background'))
                .stroke(//edit by willjoe 2016/12/27
					(!autoStroke && !node.isSelected()) ? 'none' : node.getStyle(prefix + 'stroke' || node.getStyle('stroke')),
					node.getStyle(prefix + 'stroke-width')
				);

            return new kity.Box(outlineBox);
		};
		
		//origin module renderer.
		this._modules[moduleType].renderers[renderType][renderMethod] = update;
		//after node constructor.
		var allNodes = this.getAllNode();
		for(var i=0, len = allNodes.length; i<len; i++){
			var theNode = allNodes[i];
			theNode.getRenderer(renderName)[renderMethod] = update;
		}
		//after registry.
		this._rendererClasses[renderType].map(function(render, index){
			if(render.name === renderName){
				render.prototype[renderMethod] = update;
			}
		});
	}
},
{
	/**
	  * 节点文本渲染逻辑调整，如果masked，则不渲染默认文本对象；
		如，节点数据有messageCount值，则添加一个红色消息数量文本。
	 **/
	params : ['text', 'TextRenderer', 'center', 'update'],
	excution : function(
			moduleType, 
			renderName, 
			renderType, 
			renderMethod){
		
		var FONT_ADJUST = {
			'safari': {
				'微软雅黑,Microsoft YaHei': -0.17,
				'楷体,楷体_GB2312,SimKai': -0.1,
				'隶书, SimLi': -0.1,
				'comic sans ms': -0.23,
				'impact,chicago': -0.15,
				'times new roman': -0.1,
				'arial black,avant garde': -0.17,
				'default': 0
			},
			'ie': {
				10: {
					'微软雅黑,Microsoft YaHei': -0.17,
					'comic sans ms': -0.17,
					'impact,chicago': -0.08,
					'times new roman': 0.04,
					'arial black,avant garde': -0.17,
					'default': -0.15
				},
				11: {
					'微软雅黑,Microsoft YaHei': -0.17,
					'arial,helvetica,sans-serif': -0.17,
					'comic sans ms': -0.17,
					'impact,chicago': -0.08,
					'times new roman': 0.04,
					'sans-serif': -0.16,
					'arial black,avant garde': -0.17,
					'default': -0.15
				}
			},
			'edge': {
				'微软雅黑,Microsoft YaHei': -0.15,
				'arial,helvetica,sans-serif': -0.17,
				'comic sans ms': -0.17,
				'impact,chicago': -0.08,
				'sans-serif': -0.16,
				'arial black,avant garde': -0.17,
				'default': -0.15
			},
			'sg': {
				'微软雅黑,Microsoft YaHei': -0.15,
				'arial,helvetica,sans-serif': -0.05,
				'comic sans ms': -0.22,
				'impact,chicago': -0.16,
				'times new roman': -0.03,
				'arial black,avant garde': -0.22,
				'default': -0.15
			},
			'chrome': {
				'Mac': {
					'andale mono': -0.05,
					'comic sans ms': -0.3,
					'impact,chicago': -0.13,
					'times new roman': -0.1,
					'arial black,avant garde': -0.17,
					'default': 0
				},
				'Win': {
					'微软雅黑,Microsoft YaHei': -0.15,
					'arial,helvetica,sans-serif': -0.02,
					'arial black,avant garde': -0.2,
					'comic sans ms': -0.2,
					'impact,chicago': -0.12,
					'times new roman': -0.02,
					'default': -0.15
				},
				'Lux': {
					'andale mono': -0.05,
					'comic sans ms': -0.3,
					'impact,chicago': -0.13,
					'times new roman': -0.1,
					'arial black,avant garde': -0.17,
					'default': 0
				}
			},
			'firefox': {
				'Mac': {
					'微软雅黑,Microsoft YaHei': -0.2,
					'宋体,SimSun': 0.05,
					'comic sans ms': -0.2,
					'impact,chicago': -0.15,
					'arial black,avant garde': -0.17,
					'times new roman': -0.1,
					'default': 0.05
				},
				'Win': {
					'微软雅黑,Microsoft YaHei': -0.16,
					'andale mono': -0.17,
					'arial,helvetica,sans-serif': -0.17,
					'comic sans ms': -0.22,
					'impact,chicago': -0.23,
					'times new roman': -0.22,
					'sans-serif': -0.22,
					'arial black,avant garde': -0.17,
					'default': -0.16
				},
				'Lux': {
					"宋体,SimSun": -0.2,
					"微软雅黑,Microsoft YaHei": -0.2,
					"黑体, SimHei": -0.2,
					"隶书, SimLi": -0.2,
					"楷体,楷体_GB2312,SimKai": -0.2,
					"andale mono": -0.2,
					"arial,helvetica,sans-serif": -0.2,
					"comic sans ms": -0.2,
					"impact,chicago": -0.2,
					"times new roman": -0.2,
					"sans-serif": -0.2,
					"arial black,avant garde": -0.2,
					"default": -0.16
				}
			},
		};
		
		var update = function(textGroup, node) {
            function getDataOrStyle(name) {
                return node.getData(name) || node.getStyle(name);
            }
            var nodeText = node.getText() + '';
            var textArr = nodeText ? nodeText.split('\n') : [' '];
            var lineHeight = node.getStyle('line-height');
            var fontSize = getDataOrStyle('font-size');
            var fontFamily = getDataOrStyle('font-family') || 'default';
            var height = (lineHeight * fontSize) * textArr.length - (lineHeight - 1) * fontSize;
            var yStart = -height / 2;
            var Browser = kity.Browser;
            var adjust;
            if (Browser.chrome || Browser.opera || Browser.bd ||Browser.lb === "chrome") {
                adjust = FONT_ADJUST['chrome'][Browser.platform][fontFamily];
            } else if (Browser.gecko) {
                adjust = FONT_ADJUST['firefox'][Browser.platform][fontFamily];
            } else if (Browser.sg) {
                adjust = FONT_ADJUST['sg'][fontFamily];
            } else if (Browser.safari) {
                adjust = FONT_ADJUST['safari'][fontFamily];
            } else if (Browser.ie) {
                adjust = FONT_ADJUST['ie'][Browser.version][fontFamily];
            } else if (Browser.edge) {
                adjust = FONT_ADJUST['edge'][fontFamily];
            } else if (Browser.lb) {
                // 猎豹浏览器的ie内核兼容性模式下
                adjust = 0.9;
            }
            textGroup.setTranslate(0, (adjust || 0) * fontSize);
            var rBox = new kity.Box(),
                r = Math.round;
            this.setTextStyle(node, textGroup);
            var textLength = textArr.length;
            var textGroupLength = textGroup.getItems().length;
            var i, ci, textShape, text;
            if (textLength < textGroupLength) {
                for (i = textLength, ci; ci = textGroup.getItem(i);) {
                    textGroup.removeItem(i);
                }
            } else if (textLength > textGroupLength) {
                var growth = textLength - textGroupLength;
                while (growth--) {
                    textShape = new kity.Text()
                        .setAttr('text-rendering', 'inherit');
                    if (kity.Browser.ie || kity.Browser.edge) {
                        textShape.setVerticalAlign('top');
                    } else {
                        textShape.setAttr('dominant-baseline', 'text-before-edge');
                    }
                    textGroup.addItem(textShape);
                }
            }
            for (i = 0, text, textShape;
                (text = textArr[i], textShape = textGroup.getItem(i)); i++) {
				//if(textShape.setContent)
				textShape.setContent(text);
                if (kity.Browser.ie || kity.Browser.edge) {
                    textShape.fixPosition();
                }
            }
            this.setTextStyle(node, textGroup);
            var textHash = node.getText() +
                ['font-size', 'font-name', 'font-weight', 'font-style'].map(getDataOrStyle).join('/');
            if (node._currentTextHash == textHash && node._currentTextGroupBox) 	return node._currentTextGroupBox;
            node._currentTextHash = textHash;
            return function() {
                textGroup.eachItem(function(i, textShape) {
                    var y = yStart + i * fontSize * lineHeight;
					var renderfix = node.getData('renderfix');
					if(renderfix){
						var fontColor = renderfix.fontColor || 'white';
						textShape.fill(fontColor);
					}
                    textShape.setY(y);
                    var bbox = textShape.getBoundaryBox();
                    rBox = rBox.merge(new kity.Box(0, y, bbox.height && bbox.width || 1, fontSize));
                });
                var nBox = new kity.Box(r(rBox.x), r(rBox.y), r(rBox.width), r(rBox.height));
                node._currentTextGroupBox = nBox;
                return nBox;
            };
        };
		
		//origin module renderer.
		this._modules[moduleType].renderers[renderType][renderMethod] = update;
		//after node constructor.
		var allNodes = this.getAllNode();
		for(var i=0, len = allNodes.length; i<len; i++){
			var theNode = allNodes[i];
			theNode.getRenderer(renderName)[renderMethod] = update;
		}
		//after registry.
		this._rendererClasses[renderType].map(function(render, index){
			if(render.name === renderName){
				render.prototype[renderMethod] = update;
			}
		});
	}
},
{
	/**
	  * 调整节点文本渲染，只在masked为假的时候渲染。
	 **/
	params : ['text', 'TextRenderer', 'center', 'shouldRender'],
	excution : function(
			moduleType, 
			renderName, 
			renderType, 
			renderMethod){
		
		var shouldRender = function(node) {
			//FIXING!!!
		   var renderfix = node.getData('renderfix');
		   var masked = !renderfix || !renderfix.masked;
		   return masked;
        };
		
		//origin module renderer.
		this._modules[moduleType].renderers[renderType][renderMethod] = shouldRender;
		//after node constructor.
		var allNodes = this.getAllNode();
		for(var i=0, len = allNodes.length; i<len; i++){
			var theNode = allNodes[i];
			theNode.getRenderer(renderName)[renderMethod] = shouldRender;
		}
		//after registry.
		this._rendererClasses[renderType].map(function(render, index){
			if(render.name === renderName){
				render.prototype[renderMethod] = shouldRender;
			}
		});
	}
}
];
var runtimeCommandPatches = [{
	/**
	  * 修改camera命令，使默认中心节点位置在靠右。
	 **/
	params : ['camera','execute'],
	excution : function(name, property){
		var targetMehtod = function(km, focusNode) {
            focusNode = focusNode || km.getRoot();
            var viewport = km.getPaper().getViewPort();
            var offset = focusNode.getRenderContainer().getRenderBox('view');
            var dx = viewport.center.x - offset.x - offset.width / 2,
                dy = viewport.center.y - offset.y;
            var dragger = km._viewDragger;
            var duration = km.getOption('viewAnimationDuration');
            dragger.move(new kity.Point(150, dy), duration);
            this.setContentChanged(false);
		};
		this._commands[name][property] = targetMehtod;
	}
}]