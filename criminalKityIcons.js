window.criminalBases = {};
/**
  * 提醒信息数量图标：
		setValue ：图标显示内容，两位数字或者'新'
 **/
criminalBases.MessageCountIcon = kity.createClass('MessageCountIcon',{
	base:kity.Group,
	constructor : function(){
		this.callBase();
		this.size = 5;
        this.create();
        this.setId(new Date().getTime());
		this.type = 'number';//or point
	},
	setSize : function(size){
		this.size = size;
		return this;
	},
	getSize : function(){
		return this.size;
	},
	create : function(){
		var _this = this;
		var back = new kity.Circle().pipe(function(){
			this.fill('red');
			this.setRadius(_this.size/2);
			this.setTranslate(_this.size/2,_this.size/2);
		});
		var number = new kity.Text()
					.setX(_this.size / 2 - 1.5)
					.setY(_this.size / 2)
                    .setTextAnchor('middle')
                    .setVerticalAlign('middle')
                    .setFontItalic(true)
                    .setFontSize(12)
                    .fill('white');
		this.addShapes([back]);
		this.number = number;
		this.back = back;
	},
	setValue : function(value){
		this.value = value;
		this.number.setContent(value);
		return this;
	},
	update : function(){
		this.back.setRadius(this.size/2).setTranslate(this.size/2,this.size/2);
		this.number.setContent(this.value);
		if(this.type==='point')this.number.setVisible(false);
		else if(this.type === 'number'){
			this.number.setVisible(true).setX(this.size / 2 - 1.5)
					.setY(this.size / 2)
                    .setTextAnchor('middle')
                    .setVerticalAlign('middle')
                    .setFontItalic(true)
                    .setFontSize(12)
                    .fill('white');
		}
		return this;
	},
	setType : function(type){
		this.type = type;
		if(type==='point')
		this.size = 5;
		else if (type === 'number')
		this.size = 20;
		this.update();
		return this;
	}
});

/**
  * 图片预览节点，鼠标悬停时，可以展示大图；
  * TODO 必要API及优化
 **/
criminalBases.PhotoShower = kity.createClass('PhotoShower',{
	base : kity.Group,
	constructor : function(){
		this.callBase();
		this.width = 40;
		this.height = 40;
		this.realWidth = 300;
		this.realHeight = 300;
		
		this.X = 0;
		this.Y = 0;
        this.create();
        this.setId(new Date().getTime());
	},
	setSize : function(size){
		if(typeof size === 'number'){
			this.width = size;
			this.height = size;
		}else if(size.hasOwnProperty('width') && size.hasOwnProperty('height')){
			this.width = size.width;
			this.height = size.height;
		}
		this.previewer.setWidth(this.width);
		this.previewer.setHeight(this.height);
		return this;
	},
	getSize : function(){
		return {
			width : this.width,
			height : this.height
		};
	},
	setRealSize : function(realSize){
		this.realSize = realSize;
		if(typeof realSize === 'number'){
			this.realWidth = realSize;
			this.realHeight = realSize;
		}else if(realSize.hasOwnProperty('width') && realSize.hasOwnProperty('height')){
			this.realWidth = realSize.width;
			this.realHeight = realSize.height;
		}
		return this;
	},
	getRealSize : function(){
		return {
			height : this.realHeight,
			width : this.realWidth
		}
	},
	setUrl : function(url){
		this.url = url;
		this.previewer.setUrl(this.url);
	},
	setRealUrl : function(realUrl){
		this.realUrl = realUrl;
		if(this.realImage){
			this.realImage.setUrl(this.realUrl);
		}
	},
	create : function(){
		var _this = this;
		var previewer = new kity.Image();
		previewer.setTranslate(this.X,this.Y);
		previewer.setWidth(this.width);
		previewer.setHeight(this.height);
		previewer.setUrl(this.url);

		_this.previewer = previewer;
		
		_this.previewer.node.onmouseover = function(){
			_this.showReal();
		};
		_this.previewer.node.onmouseout = function(){
			_this.hideReal();
		};
		_this.previewer.node.onmousedown = function(){
			_this.hideReal();
		}
		_this.previewer.node.onmouseup = function(){
			_this.showReal();
		}
		
		_this.addShape(previewer);
		return this;
	},
	fixPosition : function(){
		this.previewer.setTranslate(this.X,this.Y);
		if(this.realImage){
			if(this._paper){
				var x = 0;
				var y = 0;
				var container = this.container;
				while(container !== this._paper){
					var box = container.getRenderBox();
					x += box.x;
					y += box.y;
					container = container.container;
				}
				this.realImage.setTranslate(x + 150, y + 100);
			}else{
				this.realImage.setTranslate(this.X + 50,this.Y - 100);
			}
			this.realImage.update();
		}
	},
	setPaper : function(paper){
		this._paper = paper;
	},
	setX : function(number){
		if(typeof number === 'number'){
			this.X = number;
			this.fixPosition();
		}
		return this;
	},
	setY : function(number){
		if(typeof number === 'number'){
			this.Y = number;
			this.fixPosition();
		}
		return this;
	},
	showReal : function(){
		if(!this.realImage){
			var realImage = new kity.Image();
			realImage.setWidth(this.realWidth);
			realImage.setHeight(this.realHeight);
			realImage.setUrl(this.realUrl);
			realImage.setVisible(false);
			if(this._paper){
				var x = 0;
				var y = 0;
			
				var container = this.container;
				while(container !== this._paper){
					var box = container.getRenderBox();
					x += box.x;
					y += box.y;
					container = container.container;
				}
				realImage.setTranslate(x + 550, y + 500);
				this._paper.addShape(realImage);
			}else{
				realImage.setTranslate(this.X+50,this.Y - 100);
				this.addShape(realImage);
			}
			this.realImage = realImage;
		}
		this.realImage.setVisible(true);
	},
	hideReal : function(){
		if(this._paper){
			this._paper.removeItem(this._paper.indexOf(this.realImage));
			this.realImage = false;
			return this;
		}else{
			this.realImage.setVisible(false);
			return this;
		}
	}
});

criminalBases.HalfRect = kity.createClass('HalfRect',{
	base : kity.Rect,
	constructor : function(){
		this.callBase();
		this.anglesSize = false;
	},
	update: function() {
        var x = this.x,
            y = this.y,
            w = this.width,
            h = this.height,
            r = this.radius;
        var drawer = this.getDrawer().redraw();
        if (!r) {
            // 直角
            drawer.push('M', x, y);
            drawer.push('h', w);
            drawer.push('v', h);
            drawer.push('h', -w);
            drawer.push('z');
        } else {
            //圆角
            w -= 1 * r;
            h -= 2 * r;
			if(this.anglesSize === 'right'){
				this.updateRight(drawer, w, h, r, x, y);
			}else if(this.anglesSize === 'left'){
				this.updateLeft(drawer, w, h, r, x, y);
			}else{
				this.updateNone(drawer, w, h, r, x, y);
			}
        }
        drawer.done();
        return this;
    },
	updateRight : function(drawer, w, h, r, x, y){
		drawer.push('M', x + r, y + 2 * r);
		
        drawer.push('a', r, r, 0, 0, 1, -r, -r);
        drawer.push('v', -h);
        drawer.push('a', r, r, 0, 0, 1, r, -r);
		
		drawer.push('h', w);
		
		drawer.push('v', h + 2 * r);
		
		drawer.push('z');
	},
	updateLeft : function(drawer, w, h, r, x, y){
        drawer.push('M', x + r, y);
        drawer.push('h', w);
        drawer.push('a', r, r, 0, 0, 1, r, r);
        drawer.push('v', h);
        drawer.push('a', r, r, 0, 0, 1, -r, r);
        drawer.push('h', -w);
        drawer.push('z');
	},
	updateNone : function(drawer, w , h, r, x, y){
		drawer.push('M', x + r, y);
        drawer.push('h', w);
        drawer.push('a', r, r, 0, 0, 1, r, r);
        drawer.push('v', h);
        drawer.push('a', r, r, 0, 0, 1, -r, r);
        drawer.push('h', -w);
        drawer.push('a', r, r, 0, 0, 1, -r, -r);
        drawer.push('v', -h);
        drawer.push('a', r, r, 0, 0, 1, r, -r);
        drawer.push('z');
	},
	setAnglesSize : function(size){
		if(!size) this.anglesSize = false;
		this.anglesSize = size;
		this.update();
	}
});

criminalBases.HalfRect.RIGHT_ANGLES = "right";
criminalBases.HalfRect.LEFT_ANGLES = "left";
criminalBases.HalfRect.NONE_ANGLES = "none";

/**
  * 如节点文本需要背景是，采用此对象渲染节点文本。
 **/
criminalBases.EntityText =  kity.createClass('EntityText',{
	base : kity.Group,
	constructor : function(){
		this.callBase();
		this.messageCountable = false;
		//this.text = new kity.Text();
		this.textGroup = new kity.Group();
		this.mask = new criminalBases.HalfRect();
		this.backColor = '#00bcd4';
		this.fontColor = 'white';
		this.iconUrl = false;
		this.addShape(this.mask);
		if(this.iconUrl){
			this.iconImage = new kity.Image();
			this.addShape(this.iconImage);
			this.iconImage.setWidth(12);
			this.iconImage.setHeight(19);
			this.iconImage.setTranslate(-16,-16);
			this.iconImage.setUrl(this.iconUrl);
		}
		this.addShape(this.textGroup);
		var maskBox = this.textGroup.getBoundaryBox().expand(3, 6, 6, 30)
		this.mask.setBox(maskBox);
		this.mask.setAnglesSize('right');
		this.mask.fill(this.backColor);
		this.mask.setRadius(maskBox.height);
	},
	setContent : function(content){
		this.textGroup.clear();
		if(typeof content === 'string' || typeof content === 'number'){
			var thetext = new kity.Text();
			thetext.setContent(content);
			this.textGroup.addShape(thetext);
		}else if(kity.Utils.isArray(content)){
			for(var i=0,len = content.length; i<len; i++){
				var thetext = new kity.Text();
				thetext.setContent(content[i]);
				this.textGroup.addShape(thetext);
				if(i>0){
					var pretext = this.textGroup.getItem(i-1);
					var preBox = pretext.getBoundaryBox();
					thetext.setTranslate(
						preBox.x, 
						(preBox.height + preBox.cy + 5) * i
					);
				}
			}
		}
		this.update();
	},
	setRect : function(rect){
		this.rect = rect;
		this.update();
	},
	setBackColor : function(backColor){
		if(!backColor)return;
		this.backColor = backColor;
		this.update();
	},
	setIconUrl : function(url){
		if(!url) this.iconUrl = false;
		this.iconUrl = url;
		this.update();
	},
	setFontColor : function(fontColor){
		if(!fontColor) return;
		else this.fontColor = fontColor;
		this.update();
	},
	setMessageCountable : function(c){
		this.messageCountable = c;
		this.update();
	},
	update : function(){
		this.textGroup.fill(this.fontColor);
		var paddingright = this.messageCountable ? 30 : 6;
		var maskBox = this.textGroup.getBoundaryBox().expand(3, paddingright, 6, 30)
		this.mask.setBox(maskBox);
		if(this.rect)
			this.mask.setAnglesSize('none');
		else
			this.mask.setAnglesSize('right');
		this.mask.fill(this.backColor);
		this.mask.setRadius(maskBox.height);
		if(this.iconUrl){
			if(!this.iconImage){
				this.iconImage = new kity.Image();
				this.addShape(this.iconImage);
			}
			this.iconImage.setWidth(21);
			this.iconImage.setHeight(23);
			this.iconImage.setTranslate(-23,(this.mask.getBoundaryBox().height - 23 )/2 - 20);
			this.iconImage.setUrl(this.iconUrl);
			
		}else{
			if(this.iconImage){
				this.removeItem(this.indexOf(this.iconImage));
			}
		}
	}
});
