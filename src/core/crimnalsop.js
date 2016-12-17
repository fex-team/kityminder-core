/**
 * 扩展了一个插件化渲染器加载的入口；
 * 可在minder实例创建之后，添加该添加一个扩展渲染器；
 * 基于模块插件化、基于数据插件化会是一个比较有趣的方向。
 **/ 
define(function(require, exports, module) {
    var kity = require('./kity');
    var Minder = require('./minder');
	var Renderer = require('./render');
		
	function buildRendererClass(config){
		var name = config.name || 'render'+new Date().getTime()
		var targetConfig = kity.Utils.clone(config);
		targetConfig.base = Renderer
		var renderClazz = kity.createClass('ocRender',targetConfig)
		return renderClazz;
	}
	
	function createRendererForNode(node, registered) {
            var renderers = [];

            ['center', 'left', 'right', 'top', 'bottom', 'outline', 'outside'].forEach(function(section) {
                var before = 'before' + section;
                var after = 'after' + section;

                if (registered[before]) {
                    renderers = renderers.concat(registered[before]);
                }
                if (registered[section]) {
                    renderers = renderers.concat(registered[section]);
                }
                if (registered[after]) {
                    renderers = renderers.concat(registered[after]);
                }
            });

            node._renderers = renderers.map(function(Renderer) {
                return new Renderer(node);
            });
        }
	
    kity.extendClass(Minder, {
		pluginRenderer : function(rendererConfig){
			var _this = this;
			var type = rendererConfig.type || 'center';
			var clazz = buildRendererClass(rendererConfig);
			this._rendererClasses[type] = this._rendererClasses[type] || [];
			this._rendererClasses[type].push(clazz);
			//TODO 
			//由于画布创建出来之后，默认增加了一个root节点，
			//该节点的创建时机在渲染器插件加载之前，所以，该节点的渲染器并没有插件渲染器；
			//而IMPORT逻辑在调用批量的渲染的时候，渲染器是按照该root节点的渲染器个数来决定，所以，在这里会有一些布局问题；
			//（也许批量逻辑和单个节点逻辑并没有太大的分开的必要，这可能也限制了节点动画布局上限；）
			//这里应该采用事件触发节点渲染器的刷新，但暂时还没有kity事件装载、卸载、触发的用法；
			//每个节点都要new一个渲染器实例的做法，可能会在不同的js引擎上的资源消耗不同，也许可以换一个做法。
			
			this.getAllNode().map(function(node){
				createRendererForNode(node, _this._rendererClasses);
			});
			//root节点需要重新渲染，貌似存在一些图形没有销毁的情况。			
      this._root.rc.remove();
			this.setRoot(this.createNode(''));
		}
    });
});
