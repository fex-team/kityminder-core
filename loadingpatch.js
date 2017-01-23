/**
  * loading�ڼ乹������������kityminder.core.js�ļ�����֮���������á�
 **/

var patches = [
	/*5��minder����importJson�����ڣ������ڵ������ڵ���importNode����ʱ����node�����data������Ϊ��һ���ն��󣬵���minderNode������ ���캯�������ɵ�id��create����գ����ԣ����import��json�У�������id��create���ԵĻ�������Ľڵ��û��id�ʹ���ʱ�����ԡ���core/data.js��line194��*/
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
		  * Ϊ�ڵ�������������ʾ����API;
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
		  * ������ʱ����Ӷ�visible���жϣ����ڲ�����ʾ���߽������ء�
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
		  * ��ȡ��ǰ�ڵ��ϼ�ʵ�����ͽڵ㣻
		  * �����ǰ�ڵ�Ϊʵ�壬��Ȼ�����ϼ��ڵ㣻
		  * ���δ�ҵ����򷵻ظ��ڵ㣻
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
		  * �����ϼ����е�ʵ��ڵ㣻
		  * �����ǰ�ڵ�Ϊʵ��ڵ㣬���һ���ڵ㵱ǰ�ڵ㣻
		  * root�ڵ���Ϊ���һ��ʵ��ڵ㣬����ڽ�����С�
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
		  * �޸��߼�������css��ʽ���ȴ�data�л�ȡ��
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