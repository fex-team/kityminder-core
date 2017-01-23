不怎么会写MD文件。。。
==========
主要的几个文件：
	src/core/crimnalsop.js : 定了一个嵌入式的渲染器的入口，可在minder对象构建之后，动态嵌入相应的渲染插件；调用代码在criminalBriger.js第111行，initialPlugins方法内可见；
	criminalBriger.js：程序主文件，组织minder对象及其外围工作，提供数据API，载入插件、补丁等等；
	criminalKityIcons.js：几个自定义的基于kity的图标对象；
	criminalNodesConfig.js：节点配置数据；
	loadingpatch.js：代码加载时机的补丁文件，用于修改一些prototype框架下的对象逻辑API，或者扩展一些对象功能；
	runtimepatch.js：运行期间的内存逻辑补丁，用于修改一些现有的、局部调用链内的逻辑；主要包括一些现有渲染器的逻辑修改；初始化在：criminalBriger.js文件371行，buildRuntimePatches方法内；
	## xyr.html whole.html查看展现；主要程序文件内注释都比较明确。
	## [另：bower安装的kity包中的dist文件有问题，所以这里直接做了一个可用版本，放在kity文件夹下；另，bower中添加了jquery依赖。]
=========
KityMinder Core
==========

## 简介

KityMinder 是一款强大的脑图可视化/编辑工具，由百度 FEX 团队开发并维护。

本仓库是 KityMinder 的核心实现部分：

* 包括脑图数据的可视化展示（Json 格式）
* 包括简单的编辑功能（节点创建、编辑、删除）。更加强大编辑功能的 KityMinder 编辑器请移步 [kityminder-editor](https://github.com/fex-team/kityminder-editor)
* 不包含第三方格式（FreeMind、XMind、MindManager）的支持，可以加载 [kityminder-protocol](https://github.com/fex-team/kityminder-third-party-protocol) 来扩展第三方格式支持。
* 不包含文件存储的支持，需要自行实现存储。可参照[百度脑图](https://naotu.baidu.com)中的开源的 fio + 百度网盘方案进行实现。

## 使用

可以参考 [example.html](example.html) 进行使用。

```js
<div id="minder-container"></div>
<script type="text/javascript" src="kityminder.core.min.js"></script>
<script type="text/javascript">
var minder = new kityminder.Minder({
	renderTo: 'minder-container'
});
</script>
```

更多详细的开发资料可以参考 [wiki](https://github.com/fex-team/kityminder-core/wiki)

## 兼容性

KityMinder 基于 SVG 技术实现，支持绝大多数的 HTML5 浏览器，包括：

1. Chrome
2. Firefox
3. Safari
4. Internet Explorer 10 或以上

## 使用说明

kityminder-core 依赖于 [kity](https://github.com/fex-team/kity)，开发中用到 seajs 进行异步加载。
例子中 dev.html 使用 seajs 进行包加载，example.html 使用同步加载的方式。
使用步骤如下：

1. 安装 [bower](http://bower.io/#install-bower)
2. 切换到 kityminder-core 目录下，运行：

```bash
bower install
```

## 联系我们

问题和建议反馈：[Github Issues](https://github.com/fex-team/kityminder-core/issues)
邮件组: kity@baidu.com
QQ 讨论群: 374918234
