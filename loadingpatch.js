/**
  * loading期间构建补丁程序；在kityminder.core.js文件引用之后立刻引用。
 **/

var patches = [
	/*5、minder对象importJson函数内，创建节点对象后，在调用importNode方法时，将node对象的data属性置为了一个空对象，导致minderNode对象在 构造函数内生成的id和create被清空；所以，如果import的json中，不包含id和create属性的话，导入的节点就没有id和创建时间属性。见core/data.js中line194。*/
	{
		classname : 'Minder.prototype',
		propertyname : 'importNode',
		propertytype : 'function',
		buildType : 'apply',
		content : function(node, json){
			var data = json.data;
			if(!node.data){
				node.data = {};
			}
			//different in modular
			kity.Utils.deepExtend(node.data, data);

			var childrenTreeData = json.children || [];
			for (var i = 0; i < childrenTreeData.length; i++) {
				var childNode = this.createNode(null, node);
				this.importNode(childNode, childrenTreeData[i]);
			}
			return node;
		}
	},{
		/**
		  * 为节点对象添加隐藏显示功能API;
		  *
		 **/
		classname : 'Node.prototype',
		propertyname : 'setVisible',
		propertytype : 'function',
		buildType : 'apply',
		content : function(visible){
			var theVisible = !!visible;
			this.expand();
			this.traverse(function(theChild){
				theChild.expand();
				theChild._connection.setVisible(theVisible);
				theChild.getRenderContainer().setVisible(theVisible);
				theChild.data.visible = theVisible;
			},true);
			if(this._connection)
				this._connection.setVisible(theVisible);
			this.getRenderContainer().setVisible(theVisible);
			this.data.visible = theVisible;
		}
	},{
		/**
		  * 在连线时，添加对visible的判断；对于不可显示的线进行隐藏。
		 **/
		classname : 'Minder.prototype',
		propertyname : 'updateConnect',
		propertytype : 'function',
		buildType : 'apply',
		content : function(node){
			var connection = node._connection;
            var parent = node.parent;

            if (!parent || !connection) return;

            if (parent.isCollapsed()) {
                connection.setVisible(false);
                return;
            }
            connection.setVisible(true);

            var provider = node.getConnectProvider();

            var strokeColor = node.getStyle('connect-color') || 'white',
                strokeWidth = node.getStyle('connect-width') || 2;

            connection.stroke(strokeColor, strokeWidth);

            provider(node, parent, connection, strokeWidth, strokeColor);

            if (strokeWidth % 2 === 0) {
                connection.setTranslate(0.5, 0.5);
            } else {
                connection.setTranslate(0, 0);
            }
			if(node.getData('visible')===false){
				connection.setVisible(false);
			}else{
				connection.setVisible(true);
			}
		}
	},{
		/**
		  * 获取当前节点上级实体类型节点；
		  * 如果当前节点为实体，依然返回上级节点；
		  * 如果未找到，则返回根节点；
		 **/
		classname : 'Node.prototype',
		propertyname : 'getOwnerEntity',
		propertytype : 'function',
		buildType : 'apply',
		content : function(){
			var result = false;
			if(this === this.getMinder()._root) return this;
			var parentNode = this.getParent();
			while(parentNode !== this.getMinder()._root){
				if(parentNode.getData('bizType')=== 'entity'){
					result = parentNode;
					break;
				}else{
					parentNode = parentNode.getParent();
				}
			}
			if(!result){
				result = this.getMinder()._root;
			}
			return result;
		}
	},{
		/**
		  * 返回上级所有的实体节点；
		  * 如果当前节点为实体节点，则第一个节点当前节点；
		  * root节点作为最后一个实体节点，添加在结果集中。
		 **/
		classname : 'Node.prototype',
		propertyname : 'getAllOwnerEntity',
		propertytype : 'function',
		buildType : 'apply',
		content : function(){
			var result = [];
			if(this === this.getMinder()._root){
				result.push(this);
				return result;
			}
			if(this.getData('bizType') === 'entity'){
				result.push(this);
			}
			var parentNode = this.getParent();
			while(parentNode !== this.getMinder()._root){
				if(parentNode.getData('bizType')=== 'entity'){
					result.push(parentNode);
				}
				parentNode = parentNode.getParent();
			}
			result.push(this.getMinder()._root);
			return result;
		}
	},{
		/**
		  * 修复逻辑，所有css样式优先从data中获取；
		 **/
		classname : 'Node.prototype',
		propertyname : 'getStyle',
		propertytype : 'function',
		buildType : 'apply',
		content : function(name){
			if(this.getData && this.getData(name)){
				return this.getData(name);
			}
			return this.getMinder().getNodeStyle(this, name);
		}
	}
];

var buildPatches = function(){
	if(kityminder){
		patches.map(function(patch, index){
			var originProperties = eval("kityminder."+patch.classname);
			originProperties[patch.propertyname] = patch.content;
		});
	}
}

buildPatches();