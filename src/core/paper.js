/**
 * @fileOverview
 *
 * 初始化渲染容器
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerInit(function() {
    this._initPaper();
});
kity.extendClass(KityMinder, {
    
    _initPaper: function() {

        this._paper = new kity.Paper();
        this._paper.getNode().setAttribute('contenteditable', true);
        this._paper.getNode().ondragstart = function(e) {
            e.preventDefault();
        };
        this._paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');

        this._addRenderContainer();

        this.setRoot(this.createNode());

        if (this._options.renderTo) {
            this.renderTo(this._options.renderTo);
        }
    },

    _addRenderContainer: function() {
        this._rc = new kity.Group().setId(KityMinder.uuid('minder'));
        this._paper.addShape(this._rc);
    },

    renderTo: function(target) {
        if (typeof(target) == 'string') {
            target = document.getElementById(target);
        }
        this._paper.renderTo(this._renderTarget = target);
        this._bindEvents();
    },

    getRenderContainer: function() {
        return this._rc;
    },

    getPaper: function() {
        return this._paper;
    },

    getRenderTarget: function() {
        return this._renderTarget;
    },
});