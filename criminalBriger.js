/**
  * 通用导入数据准备逻辑；
 **/
var criminalNormalLogics = [function(data){
	return kity.Utils.extend(data, {
		layout : 'right',
		'font-size' : 14
	});
}];

/**
  * minder对象；由于minder-core底层事件中，部分事件绑定在window对象上，所以，暂时不支持同一个页面多个实例。
  * @param：target：容器对象；可选：DOM, string（dom.id）
  * @param: cfg； 初始配置，目前包括：	
		navigatorable : boolean；是否打开缩略图模块
		trunkType  : string；构建主干树类型，可选：navigateData中的key。
 **/
var kmwraper = function(target, cfg){
	if(typeof target == 'string'){
		this.container = document.getElementById(target);
	}else if(typeof target == 'object'){
		this.container = target;
	}
	if(!this.container) this.container = document.body;
	this.config = cfg || {};
	this.requestPool = [];
	this.buildKm();
	this.initialNodeOptions();
	if(this.config.navigatorable){
		this.buildThumber();
		this.buildPreview();
	}
	this.initialPlugins();
	this.buildTrunk();
	this.detailViewer = new detailViewer(this);
	this.criminalTips = new criminalTip(this);
};
/**
  * 构建主干
 **/
kmwraper.prototype.buildTrunk = function(){
	var trunkType = this.config.trunkType || 'losting';
	var mt = navigateData[trunkType];
	mt = this.prepareJsonData(mt);
	this.minderTrunk = kity.Utils.deepExtend({}, criminalUtil.__minderOptions);
	this.minderTrunk.root = mt;
	this.km.importJson(this.minderTrunk);
	this.fresh();
	return this.minderTrunk;
};
/**
  * 隐藏其他节点，展示从根节点起的路径和节点子树；
 **/
kmwraper.prototype.showSub = function(id){
	var theNode = this.km.getNodeById(id);
	theNode.setVisible(true);
	this.km.execCommand('camera', theNode, 100);
	while(theNode != this.km._root){
		var siblings = theNode.getSiblings();
		for(var i=0,len = siblings.length; i < len; i++){
			siblings[i].setVisible(false);
		}
		theNode = theNode.getParent();
	}
};
/**
  * 构建操作标签，如节点数据中options属性下的操作具有trigger属性，则渲染该图标；
  * 私有方法，在渲染器的构建函数中调用；
 **/
kmwraper.prototype.createIconedOption = function(node){
	var icons = [];
	var type = 'cellPhone'; // type= node.nodeType;
	var theOptions = node.data.options || criminalUtil[type].options;
	var _this = this;
	var renderfix = node.getData('renderfix');
	var y=0;
	if(renderfix && renderfix.masked){
		y = (node._contentBox.height -  16)/2;
	}
	theOptions.map(function(op, index){
		if(typeof op.trigger === 'string'){
			var icon =new kity.Image();
			icon.setUrl(op.trigger || 'criminalicons/xzsj.png');
			icon.setWidth(16);
			icon.setHeight(16);
			icon.on('click', function(e){
				if(op.handler){
					var node_usable = node.getData('node_usable');
					if(node_usable === false){
						//TODO 节点过期处理
						alert('该节点采集已过期！');
					}else{
						op.handler.call(_this, node);
					}
				}
			});
			icon.translate(5 + 16 * icons.length, y);
			if(op.handler){
				icon.setStyle('cursor','pointer');
			}
			icons.push(icon);
		}
	});
	return icons;
};
/**
  * 调用渲染器插件，构建必要的嵌入式节点渲染器；
  * 目前包括：操作图标渲染器、消息提示渲染器、照片预览框渲染器；
  * 私有方法，构造函数调用
 **/
kmwraper.prototype.initialPlugins = function(){
	var _this = this;
	/**构建操作图标**/
	var prcfg = {
		type : 'center',
		name : 'extentionRender',
		create : function(node) {
			if(!node.data.options || node.data.options.length == 0 ){
				return 
			}
			var icons = _this.createIconedOption(node);
			var group = new kity.Group();
			icons.map(function(icon){
				group.addShape(icon)
			});
			var renderfix = node.getData('renderfix');
			if(renderfix && renderfix.masked){
				var mask = new criminalBases.HalfRect ();
				mask.setAnglesSize('left');
				group.mask = mask;
				group.addShape(group.mask);
				group.mask.bringRear();
			}
			node.setData('showcop', true);
			this.update(group, node, node._contentBox);
			return group;
		},
		shouldRender : function(node) {
			if(!node.data.options || node.data.options.length == 0 ){
				return false
			}
			return true
		},
		update : function(icon, node, box) {
			if(!node.data.options || node.data.options.length == 0 ){
				return false
			}
			icon.setVisible(!!node.getData('showcop'));
			var spaceLeft = node.getStyle('space-left'),
                            x, y;
			var iconBox = icon.getBoundaryBox();				

			x = box.right;//+ icon.getSize().width 
			y = box.top;
			var renderfix = node.getData('renderfix');
			if(icon.mask){
				var mx = iconBox.x ;
				var my = box.y + box.height/2 + 5;
				var width = icon.getSize().width;
				var height = box.height;
				var maskBox = null;
				if(kity.Utils.isArray(node.getText()) && node.getText().length > 1){
					maskBox = new kity.Box( -20, my - 8 - (node.getText().length-2) * 10, width, height);
				}else{
					maskBox = new kity.Box( -15, my, width, height);
				}
					
				icon.mask.setBox(maskBox);
				icon.mask.setRadius(height);
				icon.mask.fill(renderfix.maskTextTriggerColor || '#b2ebf2');
			}
			icon.setTranslate(x, y);
					
			return new kity.Box({
				x: x,
				y: y,
				width: icon.getSize().width ,
				height: icon.getSize().height
			});
		}
	};	
	/**构建新消息提示**/
	var messagetipCfg  = {
		type : 'top',
		name : 'messagetip',
		create : function(node){
			var mci = new criminalBases.MessageCountIcon().setValue(2);
			return mci;
		},
		shouldRender : function(node) {
			return !!node.getData('newmessage');
		},
		update : function(icon, node, box){
			var spaceLeft = node.getStyle('space-left'),
                            x, y;
			var renderfix = node.getData('renderfix');
			x = box.left - icon.getSize()/2 ;
			y = box.top - icon.getSize();
			if(!renderfix || !renderfix.masked){
				x -= 10;
			}else{
				x += 10;
			}
			
			
			icon.setTranslate(x, y);
		}
	};
	/**构建图片预览框**/
	var photoRenderCfg = {
		type : 'top',
		name : 'photorenderer',
		create : function(node){
			if(node.data.photoUrl){
				var minder = _this.km;
				var ii = new criminalBases.PhotoShower();
				ii.setPaper(minder.getPaper());
				ii.setUrl(node.data.photoUrl);
				ii.setRealUrl(node.data.photoRealUrl || node.data.photoUrl);
				ii.setSize(node.data.ptotoPreviewSize || 32);
				ii.setRealSize(node.data.photoRealSize || 300);
				return ii;
			}
		},
		shouldRender : function(node) {
			return node.data.hasOwnProperty('photoUrl');
		},
		update : function(icon, node, box){
			var spaceTop = node.getStyle('space-top');
			var size = icon.getSize();
			var x = box.x - size.width / 2;
            var y = box.y - size.height - spaceTop;
            icon
                .setX(0 - 70)
                .setY(0 - 30);
            //return new kity.Box(x | 0, y | 0, size.width | 0, size.height | 0);
		}
	};
	/**构建有背景文本区域**/
	var entityTextCfg = {
		type : 'center',
		name : 'entityText',
		create : function(node){
			return new criminalBases.EntityText();
		},
		shouldRender : function(node){
			var renderfix = node.getData('renderfix');
			return renderfix && renderfix.masked;
		},
		update : function(etext, node, box){
			etext.setContent(node.getText());
			var etextrect = true;
			if(node.data.options && node.data.options.length){
				var i=0,len = node.data.options.length;
				while(i<len){
					if(node.data.options[i].trigger){
						etextrect = false;
						break;
					}else{
						i++;
					}
				}
			}
			
			etext.setRect(etextrect);
			
			var renderfix = node.getData('renderfix');
			var messageCount = parseInt(node.getData('messageCount'));
			etext.setMessageCountable(messageCount>0);
			if(renderfix && renderfix.masked){
				if(renderfix.masked){
					var url = renderfix.maskIcon;
					etext.setIconUrl(url || false);
					var backColor = renderfix.maskTextBackColor || '#00bcd4';
					etext.setBackColor(backColor);
				}
				var fontColor = renderfix.fontColor || 'white';
				etext.setFontColor(fontColor);
			}
			return etext.getBoundaryBox();
		}
	};
	/**构建左侧logo区域**/
	var logoRenderCfg = {
		type : 'center',
		name : 'logoRenderer',
		create : function(node){
			return new kity.Image();
		},
		shouldRender : function(node){
			var renderfix = node.getData('renderfix');
			return renderfix && renderfix.logoUrl;
		},
		update : function(logo, node, box){
			var renderfix = node.getData('renderfix');
			var size = kity.Utils.extend({
				width:50, height : 50
				},renderfix.logosize);
			var url = renderfix.logoUrl || 'criminalicons/shr.png';
			logo.setUrl(url);
			var x = box.x - size.width / 2;
			var y = box.y - (size.height - box.height)/2;
			logo.setX(x);
			logo.setY(y);
			logo.setWidth(size.width);
			logo.setHeight(size.height);
		}
	};
	/**构建消息数量文本区域**/
	var messagecountCfg = {
		type : 'center',
		name : 'messagecount',
		create : function(node){
			return new kity.Text();
		},
		update : function(thetext, node, box){
			var spaceLeft = node.getStyle('space-left');
			var spaceTop = node.getStyle('space-top');
			var renderfix = node.getData('renderfix');
			var masked = renderfix && renderfix.masked;
			var messageCount = parseInt(node.getData('messageCount'));
			var visiblable = messageCount>0;
			thetext.setVisible(visiblable);
			if(!visiblable){
				return;
			}
			var fontSize = node.getData('font-size') || node.getStyle('font-size');
			thetext.fill('red');
			thetext.setContent(messageCount);
			thetext.setSize(fontSize);
			if(!masked){
				thetext.setX(box.right + spaceLeft);
				thetext.setY( - box.top);
				return thetext.getBoundaryBox();
			}else{
				thetext.setX(box.right - 24);
				thetext.setY( -thetext.getBoundaryBox().height -box.top);
			}
		}
	};
	
	this.km.pluginRenderer(entityTextCfg);
	this.km.pluginRenderer(messagecountCfg);
	this.km.pluginRenderer(logoRenderCfg);
	this.km.pluginRenderer(photoRenderCfg);
	this.km.pluginRenderer(messagetipCfg);
	this.km.pluginRenderer(prcfg);
};
/**
  * 构建minder对象；句柄为this.km。
  * 私有方法，构造函数调用
 **/
kmwraper.prototype.buildKm = function(){
	if(this.km){
		// do something
	}else{
		this.km = new kityminder.Minder();
		this.buildRuntimePatches();
		this.km.renderTo(this.container);
		
		this.km.enable();
		//	this.km.useTheme("classic");
		
		this.km.__wraper__= this;
		this.initialOptions();
	}
};
/**
  * build all patches after kityminder object constructed.
 **/
kmwraper.prototype.buildRuntimePatches = function(){
	var _this = this;
	if(window.runtimeRendererPatches){
		runtimeRendererPatches.map(function(patch){
			patch.excution.apply(_this.km, patch.params);
		});
	}
	if(window.runtimeCommandPatches){
		runtimeCommandPatches.map(function(patch){
			patch.excution.apply(_this.km, patch.params);
		});
	}
};
/**
  * minder对象配置，
  * 私有方法，构造函数调用，在minder对象构建之后调用；
 **/
kmwraper.prototype.initialOptions = function(){
	
	var options = {
		// 放大缩小比例
		zoom: [10, 20, 30, 50, 80, 100, 120, 150, 200]
	};
	
	for(var key in options){
		this.km.setOption(key, options[key]);
	}
};
/**
  * 节点操熬作触发器，主要用于自动触发与更新的节点操作。
  * 目前主要包括节点渲染前，和节点渲染后的一些自动操作支持，如查询实体数据等。
  * 数据配置：options : [{
		eventName : 'noderender',//触发时机，可选：beforerender、noderender
		runType : 'firsttime',   //触发次数，可选：firsttime、everytime
		handler : function(node) //操作逻辑方法句柄，接收当前节点参数，作用域为kmwraper。
	}],
  * 私有方法，构造函数调用
 **/
kmwraper.prototype.initialNodeOptions = function(){
	var _this = this;
	_this.km.on('noderender', function(node){
		var fired = node.node.getData('_noderenderFired');
		if(node.node.data && node.node.data.options){
			for(var i = 0, len = node.node.data.options.length; i< len; i++){
				try{
					var op = node.node.data.options[i];
					if(op.eventName == 'noderender' && op.handler)
						if(op.runType === 'everytime' || !fired)
							op.handler.call(_this, node.node);
					else
						continue;
				}catch(error){
					console.error(error);
					continue;
				}
			}
			node.node.setData('_noderenderFired', true);
		}
		if(node.node.getData('visible') === false){
			node.node.setVisible(false);
		}
	});
	
	_this.km.on('beforerender', function(node){
		var fired = node.node.getData('_beforerenderFired');
		if(node.node.data && node.node.data.options){
			for(var i = 0, len = node.node.data.options.length; i< len; i++){
				try{
					var op = node.node.data.options[i];
					if(op.eventName == 'beforerender' && op.handler)
						if(op.runType === 'everytime' || !fired)
							op.handler.call(_this, node.node);
					else
						continue;
				}catch(error){
					console.error(error);
					continue;
				}
			}
			node.node.setData('_beforerenderFired', true);
		}
		if(node.node.getData('tip')){
			_this.criminalTips.updateNode('unused', node.node);
		}
	});
	/**
	  * 为节点添加双击事件，双击节点为显示该节点路径及子树；隐藏其他节点。
	  * 
	 **/
	_this.km.on('dblclick', function(kme){
		var node =  this.getSelectedNode();
		// if(!node) node = this._root;
		// if(node.getData('visible')===false){
			// _this.showSub(node.getParent().data.id);
			// _this.fresh();
		// }else{
			// _this.showSub(node.data.id);
			// _this.fresh();
		// }
		if(!node) return;
		else {
			if(this.queryCommandState('expand') ===0){
				this.execCommand('expand');
			}else{
				this.execCommand('collapse');
			}
		}
	});
	//layoutallfinish
	this.km.on('layoutfinish', function(){
		_this.layouting = false;
		if(_this.appended === true){
			_this.fresh();
		}
	});
};
/**
  * TODO 脚本化DOM构建逻辑；自动构建缩略操作域，避免XML编写。
  * 构建minder操作模块，取自editor逻辑；
  * 私有方法，构造函数调用
  */
kmwraper.prototype.buildThumber = function(){
	var _this = this;
	var navigatorWhole = document.getElementById('navigatorWhole');
	navigatorWhole.style.display = '';
	var handerCon = document.getElementById('handerCon');
	handerCon.onclick = function(){
		if(handerCon.className.indexOf('active')>=0){
			handerCon.className = 'nav-btn hand'
		}else{
			handerCon.className = 'nav-btn hand active'
		}
		_this.km.execCommand('hand');
	};
	var cameraCon = document.getElementById('cameraCon');
	cameraCon.onclick = function(){
		var cameraNode = _this.km.getSelectedNode() || _this.km.getRoot();
		_this.km.execCommand('camera', cameraNode, 100);
	};
	var navigaCon = document.getElementById('navigaCon');
	navigaCon.onclick = function(){
		var naviEl = document.getElementById('navigaEl');
		if(navigaCon.className.indexOf('active') >= 0){
			naviEl.style.display = 'none';
			navigaCon.className = 'nav-btn nav-trigger';
		}else{
			naviEl.style.display = '';
			navigaCon.className = 'nav-btn nav-trigger active';
		}
	}
	var compactCon = document.getElementById('compactCon');
	compactCon.onclick = function(){
		if(_this.km.getTheme().indexOf('compat')>0){
			_this.km.execCommand('theme', "fresh-blue");
			compactCon.className = 'nav-btn nocompact';
		}else{
			_this.km.execCommand('theme', "fresh-blue-compat");
			compactCon.className = 'nav-btn compact';
		}
	};
	
	_this.km.on('zoom',function(e){
		if(_this.km.queryCommandValue('zoom')===200){
			zoominCon.className = "nav-btn zoom-in active";
			zoomoutCon.className = "nav-btn zoom-out";
		}else if(_this.km.queryCommandValue('zoom')===10){
			zoominCon.className = "nav-btn zoom-in";
			zoomoutCon.className = "nav-btn zoom-out active";
		}else{
			zoomoutCon.className = "nav-btn zoom-out";
			zoominCon.className = "nav-btn zoom-in";
		}
		var targetZoom = _this.km.queryCommandValue('zoom');
		var originZoom = 100;
		var targetHeight = getHeightByZoom(targetZoom);
		var originHeight = getHeightByZoom(originZoom);
		var zoomOrigin = document.getElementById('zoomOrigin');
		zoomOrigin.style.transform = 'translate(0, ' + originHeight + 'px)',
		zoomOrigin.style.transition = 'transform 200ms';
		var zoomIndica = document.getElementById('zoomIndica');
		zoomIndica.style.transform = 'translate(0, ' + targetHeight + 'px)',
		zoomIndica.style.transition = 'transform 200ms';
		
	});
	
	function getHeightByZoom(value){
		var totalHieght = document.getElementById('zoomradioCon').clientHeight;
		if(!value) value = 100;
		var zoomStack = _this.km.getOption('zoom');
        var minValue = zoomStack[0];
        var maxValue = zoomStack[zoomStack.length - 1];
        var valueRange = maxValue - minValue;
		return (1 - (value - minValue) / valueRange) * totalHieght;
	}
	
	var zoominCon = document.getElementById('zoominCon');
	zoominCon.onclick =  function(){
		_this.km.getOption('zoom');
		_this.km.execCommand('zoomIn');
	};
	var zoomoutCon = document.getElementById('zoomoutCon');
	zoomoutCon.onclick = function(){
		_this.km.execCommand('zoomOut');
	};
	
	var zoomradioCon = document.getElementById('zoomradioCon');
	zoomradioCon.onclick = function(){
		//_this.km.execCommand('zoom', 100);
	};
	var zoomOrigin = document.getElementById('zoomOrigin');
	zoomOrigin.onclick = function(){
		_this.km.execCommand('zoom', 100);
	}
	var zoomIndica = document.getElementById('zoomIndica');
	_this.km.execCommand('zoom', 100);
};
/**
  * 构建缩略图操作模块，取自editor逻辑；
  * 私有方法，构造函数调用
  */
kmwraper.prototype.buildPreview = function(){

	var naviEl = document.getElementById('navigaEl');
	
	// 画布，渲染缩略图
    var paper = new kity.Paper(naviEl);

    // 用两个路径来挥之节点和连线的缩略图
    var nodeThumb = paper.put(new kity.Path());
    var connectionThumb = paper.put(new kity.Path());

    // 表示可视区域的矩形
    var visibleRect = paper.put(new kity.Rect(100, 100).stroke('red', '1%'));
	var contentView = new kity.Box(), visibleView = new kity.Box();
	
	var minder = this.km;
	
	var pathHandler = getPathHandler(minder.getTheme());

    // 主题切换事件
	minder.on('themechange', function(e) {
		pathHandler = getPathHandler(e.theme);
	});

	function getPathHandler(theme) {
		switch (theme) {
			case "tianpan":
			case "tianpan-compact":
				return function(nodePathData, x, y, width, height) {
					var r = width >> 1;
					nodePathData.push('M', x, y + r,
						'a', r, r, 0, 1, 1, 0, 0.01,'z');
				}
			default: {
				return function(nodePathData, x, y, width, height) {
					nodePathData.push('M', x, y,'h', width, 'v', height,
						'h', -width, 'z');
                }
            }
        }
    }
	
	function updateContentView() {

        var view = minder.getRenderContainer().getBoundaryBox();

        contentView = view;

		var padding = 30;

		paper.setViewBox(
			view.x - padding - 0.5,
			view.y - padding - 0.5,
			view.width + padding * 2 + 1,
			view.height + padding * 2 + 1);

		var nodePathData = [];
		var connectionThumbData = [];

		minder.getRoot().traverse(function(node) {
			if(node.getData('visible') === false) return;
			
			var box = node.getLayoutBox();
			pathHandler(nodePathData, box.x, box.y, box.width, box.height);
			if (node.getConnection() && node.parent && node.parent.isExpanded()) {
				connectionThumbData.push(node.getConnection().getPathData());
			}
		});

		paper.setStyle('background', minder.getStyle('background'));

		if (nodePathData.length) {
			//nodeThumb.fill(minder.getStyle('root-background')).setPathData(nodePathData);
			nodeThumb.fill("#34495E").setPathData(nodePathData);
		} else {
			nodeThumb.setPathData(null);
		}

		if (connectionThumbData.length) {
			connectionThumb.stroke(minder.getStyle('connect-color'), '0.5%').setPathData(connectionThumbData);
        } else {
			connectionThumb.setPathData(null);
		}
		updateVisibleView();
	}

	function updateVisibleView() {
		visibleView = minder.getViewDragger().getView();
		visibleRect.setBox(visibleView.intersect(contentView));
	}
	
	function bind() {
		minder.on('layout layoutallfinish', updateContentView);
		minder.on('viewchange', updateVisibleView);
	}

	function unbind() {
		minder.off('layout layoutallfinish', updateContentView);
		minder.off('viewchange', updateVisibleView);
	}
	
	bind();
	updateContentView();
	updateVisibleView();
	
	navigate();

	function navigate() {

		function moveView(center, duration) {
			var box = visibleView;
			center.x = -center.x;
			center.y = -center.y;

			var viewMatrix = minder.getPaper().getViewPortMatrix();
			box = viewMatrix.transformBox(box);

			var targetPosition = center.offset(box.width / 2, box.height / 2);

			minder.getViewDragger().moveTo(targetPosition, duration);
		}

		var dragging = false;

		paper.on('mousedown', function(e) {
			dragging = true;
			moveView(e.getPosition('top'), 200);
			naviEl.className = "nav-previewer grab";
		});

		paper.on('mousemove', function(e) {
			if (dragging) {
				moveView(e.getPosition('top'));
			}
		});

		$(window).on('mouseup', function() {
			dragging = false;
			naviEl.className = "nav-previewer";
		});
	}
};
/**========================API========================**/
/**
  * 刷新节点下挂数据，适用于自动请求下挂数据的节点，供外部页面回调。
  * 普通主干分支节点不可用。
 **/
kmwraper.prototype.refreshNode = function(nodeId){
	var _this = this;
	var pNode = this.km.getNodeById(nodeId);
	if(pNode){
		while(pNode.getChildren().length){
			this.km.removeNode(pNode.getChildren()[0]);
		}
	}
	pNode.setData('_noderenderFired', false);
	pNode.setData('_beforerenderFired', false);
	pNode.render();
	this.fresh();
}
/**
  * json structure : {
	  data : {},
	  childre : [{
		  
	  },{
		  
	  }]
  }
 **/
kmwraper.prototype.prepareJsonData = function(json){
	var _this = this;

	var logics = criminalNormalLogics;
	
	if(!logics || !logics.length){
		return json;
	}
	function buildData(data){
		var builtData = data;
		for(var i=0,len=logics.length;i<len;i++){
			//some description : 
			//	The functions in logics need a scope with wraper or not?
			//	That's the differences between application and framework!
			builtData = logics[i].call(_this || null, builtData);
		}
		return builtData;
	}
	
	function jsonstacked(json){
		if(!json.data){
			json.data = {};
		}
		json.data = buildData(json.data);
		if(!json.children || !kity.Utils.isArray(json.children)){
			return json;
		}else{
			var builtChildren = [];
			for(var i=0,len = json.children.length; i<len; i++){
				builtChildren.push(jsonstacked(json.children[i]));
			}
			json.children = builtChildren;
		}
		return json;
	}
	json = jsonstacked(json);
	if(kity.Utils.isArray(json.data.prepareLogics)){
		for( var i=0, len=json.data.prepareLogics.length;i<len;i++){
			json.data = json.data.prepareLogics[i].execution.call(this || null, json.data);
		}
	}
	return json;
};
/**
  * 添加节点；
  * @param childrenData：数据数组；
  * @param nodeType：实体类型；可选criminalUtil中的key。如未定义，则直接返回data参数；
  * @param parentNode：父节点对象；
 **/
kmwraper.prototype.appendNodes = function(childrenData, nodeType, parentNode){
	/**
    * 添加单个实体节点；
    * @param childData : 原始实体数据；
    * @param nodeType ： 实体类型；可选criminalUtil中的key。如未定义，则直接返回data参数；
    * @param parentNode：父节点对象；
    **/
	function appendNode(childData, nodeType, parentNode){
		var data = {
			data : childData
		};
		//biz type;
		data.data.bizType = 'entity';
		var typeOption = criminalUtil[nodeType];
		data = kity.Utils.deepExtend(data, typeOption);
	
		childData = this.prepareJsonData(data);
		var child = this.km.createNode({}, parentNode);
		this.km.importNode(child, childData);
	}
	
	for( var i= 0; i<childrenData.length; i++){
		appendNode.call(this, childrenData[i], nodeType, parentNode);
	}
	parentNode.renderTree();
	this.fresh();
};
/**
  * 刷新布局，一般在添加节点后调用；
 **/
kmwraper.prototype.fresh = function(){
	if(this.layouting){ 
		this.appended = true; 
		return;
	}
	this.layouting = true;
	this.appended = false;
	this.km.layout();
};
/**
  * 打开缩略模块。
 **/
kmwraper.prototype.openNavigator = function(){
	this.config.navigatorable = true;
	this.buildThumber();
	this.buildPreview();
};
/**
  * 请求队列
  *
 **/
kmwraper.prototype.ajax = function(ajaxCfg){
	var _this = this;
	_this.requestPool.push(ajaxCfg);
	function request(){
		if(_this.requestPool.length){
			_this.requesting = true;
			var cfg = _this.requestPool.shift();
			if(typeof cfg.success === 'function'){
				var shandler = cfg.success;
				var error = cfg.error;
				cfg.success = function(a,b,c){
					try{
						if(kity.Utils.isFunction(shandler)){
							shandler.call(_this, a,b,c);
						}
					}catch(error){
						
					}finally{
						request();
					}
				}
				cfg.error = function(a,b,c,d){
					try{
						if(kity.Utils.isFunction(error)){
							error.call(_this, a,b,c,d);
						}
					}catch(error){
						
					}finally{
						request();
					}
				}
				//any callback else ? 
				$.ajax(cfg);
			}
		}else{
			_this.requesting = false;
			_this.fresh();
		}
	}
	if(!this.requesting){
		request();
	}
};

/**
  * 状态TIP插件；
 **/
window.criminalTip = function(wraper){
	this.wraper = wraper;
	this.buildLengend();
};
/**
  * 节点状态配置；
  * 此处配置必须有key属性；
  * 动态tip或者此处的静态tip必须包含cfgBuilder或者tipContent方法。
 **/
criminalTip.NODE_STATES = [{
	key : 'nonesuspect',
	name : '无嫌疑人',//图例中显示的名称
	tip : '该案件尚未同步嫌疑人信息！',//默认悬浮内容，可在tipContent方法中调用
	//返回该状态下，所有节点状态数据（包括样式修改）
	cfgBuilder : function(node){
		return {
			color : 'red',
			renderfix : {
				fontColor : 'white',
				maskTextBackColor : 'red'
			}
		}
	},
	//构建悬浮内容。鼠标悬浮于节点时，会显示该内容。
	tipContent : function(node){
		var content = document.createElement('div');
		content.innerText = this.tip ;
		return content;
	}
},{
	key : 'unused',
	name : '无效采集',
	cfgBuilder : function(node){
		if(node)
			node.setData('node_usable', false);
		return {
			color  : '#ccc',
			renderfix : {
				fontColor : 'white',
				maskTextBackColor : '#ccc',
				maskTextTriggerColor : '#ccc'
			}
		}
	}
}];

criminalTip.NODE_TIPS = [{
	name : ''
},{
	name : ''
},{
	name : ''
}];
/**
  * 构建图例，图例中的样式，只包含NODE_STATES中的配置，个性化配置无法提前构建
 **/
criminalTip.prototype.buildLengend = function(){
	var legend = document.createElement('div');
	legend.className = "legend";
	var st = criminalTip.NODE_STATES;
	for(var i=0,len=st.length;i<len;i++){
		var state = st[i];
		var cfg = state.cfgBuilder();
		var colori = document.createElement('div');
		colori.style= {};
		colori.style.background = cfg.color;
		colori.className = "legend-color";
		var span = document.createElement('span');
		span.style = {};
		span.style.color = cfg.color;
		span.className = "legend-span";
		span.innerText = state.name;
		var sti = document.createElement('div');
		sti.appendChild(colori);
		sti.appendChild(span);
		legend.appendChild(sti);
		sti.className = 'legend-i';
	}
	this.wraper.container.appendChild(legend);
}
/**
  * 获取tip对象；
  * @param keys : 
 **/
criminalTip.prototype.getTips = function(keys){
	var result = [];
	for(var ki=0, klen = keys.length; ki<klen; ki ++){
		if(typeof keys[ki] === 'object'){
			var tip = keys[ki];
			if(kity.Utils.isFunction(tip.cfgBuilder) || 
				kity.Utils.isFunction(tip.tipContent))
				result.push(keys[ki]);
			continue;
		}
		var i = 0, len = criminalTip.NODE_STATES.length;
		while(i < len){
			if(criminalTip.NODE_STATES[i].key === keys[ki]){
				result.push(criminalTip.NODE_STATES[i]);
			}
			i++;
		}
	}
	return result;
};
/**
  * 为节点设置tip,可在tip接口方法中设置节点数据、构建浮动界面等；
  * 可以选择NODE_STATES中的项，或者多个项；也可以根据TIP接口，构建个性化提示对象。
  * 多个tip的时候，根据参数传递顺序进行优先覆盖，靠后者优先级高。
  * @param tipkey : string/array/object
  * @param node : minderNode
 **/
criminalTip.prototype.setTip = function(tipkey, node){
	if(typeof tipkey === 'string'){
		tipkey = [tipkey];
	}else if(kity.Utils.isArray(tipkey)){
		
	}else if(typeof tipkey === 'object'){
		tipkey = [tipkey];
	}
	node.setData('tipkey', tipkey);
	var tips = this.getTips(tipkey);

	if(!tips || tips.length === 0) return ;
	this.updateNode(tips, node);
	this.buildExtensionTip(tips, node);
	setTimeout(function(){
		node.render();
	});
};
/**
  * 更新节点对象UI状态；
 **/
criminalTip.prototype.updateNode = function(tips, node){
	node._originalData = kity.Utils.deepExtend({}, node.data);
	var tipsdata = {};
	for(var i = 0,len = tips.length;  i < len; i++){
		if(tips[i].cfgBuilder)
			kity.Utils.deepExtend(tipsdata, tips[i].cfgBuilder(node));
	}
	node.data = kity.Utils.deepExtend(node.data , tipsdata);
};
/**
  * 回滚节点UI状态
 **/
criminalTip.prototype.upbackNode = function(node){
	if(!node._originalData) return;
	else for(var key in node._originalData)
		node.setData(key, node._originalData[key]);
};
/**
  * 根据tips长度，如果为零，则移除浮动信息以及浮动事件；
  * 如果长度大于零，则构建浮动信息以及浮动事件。
 **/
criminalTip.prototype.buildExtensionTip = function(tips, node){
	
	if(!tips || tips.length === 0){
		if(node._extendEl){
			node._extendEl.parentNode.removeChild(node._extendEl)
		}
		node.rc.off('mouseenter',node._showEl);
		node.rc.off('mouseleave', node._hideEl);
		return ;
	}

	var extendEl = document.createElement('div');
	extendEl.style = {};
		
	extendEl.style.position = 'absolute';
	extendEl.style.display = 'none';
	
	for( var i = 0, len = tips.length; i<len; i++){
		if(tips[i].tipContent){
			extendEl.appendChild(tips[i].tipContent(node));
		}
	}
	
	this.wraper.container.appendChild(extendEl);
	node._extendEl = extendEl;
	node._showEl = function(){
		var renderBox = node.rc.getRenderBox('paper');
		var topPx = Math.floor( renderBox.y + renderBox.height + 10);
		var leftPx = Math.floor( renderBox.x);
		extendEl.style.top = topPx + 'px';
		extendEl.style.left = leftPx + 'px';
		extendEl.style.display = 'block';
	}
	node._hideEl = function(){
		extendEl.style.display = 'none';
	}
	node.rc.on('mouseenter',node._showEl);
	node.rc.on('mouseleave', node._hideEl);
};

/**
  * 明细信息展示域
 **/
window.detailViewer = function(wraper){
	this.wraper = wraper;
	this.init();
	this.buildEvents();
	this.hide();
};
/**
  * 构建明细信息展示容器
 **/
detailViewer.prototype.init = function(){
	this.DOM = document.createElement('div');
	this.DOM.className = "detailviewer";
	
	/***********************************************/
	this.titleEl =  document.createElement('div');
	this.titleEl.className = 'detailviewer-head';
	this.h3 = document.createElement('h3');
	this.closer = document.createElement('i');
	this.closer.className = '';
	this.closer.innerText = 'X';
	this.titleEl.appendChild(this.h3);
	this.titleEl.appendChild(this.closer);
	this.bodyEl = document.createElement('div');
	this.bodyEl.className = 'detailviewer-body';
	
	this.DOM.appendChild(this.titleEl);
	this.DOM.appendChild(this.bodyEl);
	this.wraper.container.appendChild(this.DOM);
	if(!this.DOM.style) this.DOM.style = {};
};
/**
  * 影藏明细信息展示区
 **/
detailViewer.prototype.hide = function(){
	if(!this.DOM.style) this.DOM.style = {};
	this.DOM.style.display = 'none';
};
/**
  * 展示明细信息区域
 **/
detailViewer.prototype.show = function(){
	if(!this.DOM.style) this.DOM.style = {};
	this.DOM.style.display = 'block';
};
/**
  * 判断节点是否可以展示明细区域
 **/
detailViewer.prototype.adjusticeNode = function(node){
	if(!node.data.hasOwnProperty('getDetailContent') && (!node.getChildren() || 
	!node.getChildren().length)){
		return false;
	}
	return true;
};
/**
  * 构建事件
 **/
detailViewer.prototype.buildEvents = function(){
	var _this = this;

	this.DOM.onmouserdown = function(eve){
		eve.cancelBubble = true;
	};
	this.DOM.onselectstart=function(eve){
		eve.cancelBubble = true;
		return true;
	};

	this.DOM.onclick = function(eve){
		eve.cancelBubble = true;
	};

	/**
	  * TODO add select event on the kityminder object.
	 **/
	 this.closer.onclick = function(eve){
		 _this.hide();
	 };
	 this.wraper.km.on('selectionchange', function(minderEvent){
		 var targetNodes = minderEvent.minder.getSelectedNodes();
		 if(targetNodes.length<1) return;
		 var showedNode=  targetNodes[0];
		 _this.setNode(showedNode);
	 });
};
/**
  * 调用入口，设置节点，并展示节点明细信息
 **/
detailViewer.prototype.setNode = function(node){
	if(!this.adjusticeNode(node)) return;
	
	this.node = node;
	
	var nodeTitle = node.getText();
	if(kity.Utils.isArray(nodeTitle)){
		this.h3.innerText = nodeTitle[0];
	}else{
		this.h3.innerText = nodeTitle;
	}
	
	var maxheight = $(this.wraper.container).height();
	var maxheadHeight=  $(this.titleEl).height();
	this.bodyEl.style.maxHeight = (maxheight - maxheadHeight - 100	) + 'px';
	this.buildContent();
	if(this.node.data.hasOwnProperty('buildViewerImage')){
		this.node.data.buildViewerImage.call(this.node, this);
	}
};
/**
  * 构建主题内容区域
 **/
detailViewer.prototype.buildContent = function(){
	var _this = this;
	var km = this.wraper.km;
	this.bodyEl.innerHTML = '';
	if(!this.node.data.hasOwnProperty('getDetailContent')){
		// var children = this.node.getChildren();
		// for(var i = 0,len = children.length;i<len;i++){
			// var childi = document.createElement('a');
			// childi.innerText=children[i].getText();
			// childi.setAttribute('nodeId',children[i].data.id);
			// var theChild = children[i];
			// childi.href = "#";
			// childi.onclick = function(eve){
				// eve.cancelBubble = true;
				// km.selectById(this.getAttribute('nodeId'), true);
			// }
			// _this.bodyEl.appendChild(childi);
			// _this.bodyEl.appendChild(document.createElement('br'));
		// }
		_this.hide();
	}else{
		var nodeinfo = this.node.data.getDetailContent.call(this.node, this.node.data);
		var htmls = this.buildHtmls(nodeinfo);
		if(typeof htmls === 'string'){
			this.bodyEl.innerHTML = htmls;
		}else if(htmls instanceof HTMLElement){
			this.bodyEl.appendChild(htmls);
		}else if(htmls instanceof Array){
			for(var i=0, len = htmls.length; i< len; i++){
				this.bodyEl.appendChild(htmls[i]);
			}
		}
		_this.show();
	}
};
/**
  * 根据节点配置情况，生成节点明细内容；
 **/
detailViewer.prototype.buildHtmls = function(nodeinfos){
	var contents = []
	if(typeof nodeinfos == 'string'){
		return nodeinfos;
	}else if(nodeinfos instanceof Array){
		for (var i=0,len = nodeinfos.length; i< len; i++){
			contents.push(this.buildHtml(nodeinfos[i]));
		}
		return contents;
	}else if(nodeinfos instanceof HTMLElement){
		return nodeinfos;
	}
};
/**
  * 构建单条明细内容。
 **/
detailViewer.prototype.buildHtml = function(nodeinfo){
	var node = this.node;
	if(typeof nodeinfo === 'string'){
		var value = node.getData(nodeinfo) || '';
		var div = document.createElement('div');
		div.className = "content-line";
		var span = document.createElement('span');
		span.innerText = nodeinfo + " : "+value;
		div.appendChild(span);
		return div;
	}else{
		if(nodeinfo.hasOwnProperty('dataName')){
			var value = node.getData(nodeinfo.dataName);
			var name = nodeinfo.dataCnName || nodeinfo.dataName;
			var div = document.createElement('div');
			div.className = "content-line";
			var span = document.createElement('span');
			span.innerText = name + " : "+value;
			div.appendChild(span);
			return div;
		}else if(nodeinfo.hasOwnProperty('groupName')){
			var div = document.createElement('div');
			div.className = "group-title";
			var span = document.createElement('span');
			span.innerText = nodeinfo.groupName;
			div.appendChild(span);
			var groupContent = nodeinfo.groupContent;
			if(groupContent && groupContent.length) {
				var divContent = document.createElement('div');
				divContent.className = 'group-body';
				for(var i=0,len=groupContent.length; i<len; i++){
					var sub = this.buildHtml(groupContent[i]);
					divContent.appendChild(sub);
				}
				div.appendChild(divContent);
				return div;
			}else return false;
		}else if(nodeinfo instanceof HTMLElement){
			return nodeinfo;
		}
	}
};
