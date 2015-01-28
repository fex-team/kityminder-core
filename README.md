KityMinder Core
==========

## 简介

KityMinder 是一款强大的脑图可视化/编辑工具，由百度 FEX 团队开发并维护。

本仓库是 KityMinder 的核心实现部分：

* 包括脑图数据的可视化展示（Json 格式）
* 包括简单的编辑功能（节点创建、编辑、删除）。更加强大编辑功能的 KityMinder 编辑器请移步 [kityminder-editor](https://github.com/fex-team/kityminder-editor)
* 不包含第三方格式（FreeMind、XMind、MindManager、纯文本、Markdown 等）的支持，可以加载 [kityminder-protocol](https://github.com/fex-team/kityminder-protocol) 来扩展第三方格式支持。
* 不包含文件存储的支持，需要自行实现存储。可参照[百度脑图](https://github.com/fex-team/naotu.baidu.com)中的开源的 fio + 百度网盘方案进行实现。

## 使用

可以参考 [example.html](example.html) 进行使用，代码类似：

```js
<div id="minder-container"></div>
<script type="text/javascript" src="kityminder.all.min.js"></script>
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

## 依赖说明

kityminder-core 依赖 Kity、库。需要二次开发 kityminder-core，需要初始化并更新子模块：

```bash
git submodule init
git submodule update
```

kityminder-core 的 example 使用 seajs 进行包加载，seajs 可以使用 bower 获取：

```bash
bower install
```

kityminder-core 使用 grunt 进行打包，安装 npm 组件后直接 grunt 即可打包：

```bash
npm install
grunt
```

想偷懒？可以用下面这个一行安装脚本：

```bash
https://gist.githubusercontent.com/techird/72b420c7ea05154ce821/raw/6416f2709ce82a3a0d86a50763de1ce3ca7f3ca2/setup-km-core
```

## 联系我们

问题和建议反馈：[Github Issues](https://github.com/fex-team/kityminder-core/issues)
邮件组: kity@baidu.com
QQ 讨论群: 374918234
