/*这些JS仅为Demo页面，使用此插件时如无需要请不要引入。*/
$(document).ready(function(){
	document.title = $("h1").html();
	$(".dtoggle").slideToggle(0);
	$("body").ios6alert({
		title : "jq22.com",
		content : "Hello, world"
	});
	$(".basicdemo").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vel eros sit amet nunc molestie varius id in lacus. Praesent at tincidunt dolor. In ac odio tincidunt, ultrices arcu et, consectetur ligula."
		});
	});
	$(".notitle").click(function(){
		$("body").ios6alert({
			content : "无标题对话框实例"
		});
	});
	$(".deftype").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "默认对话框",
			type : 0
		});
	});
	$(".yesno").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "点击确定或取消",
			type : 1
		});
	});
	$(".delno").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "确定要删除这条消息吗？",
			type : 2
		});
	});
	$(".soundd").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "带有声音的提示框\n\n此功能不支持IE8及更低版本的浏览器",
			sound : "sounds/Complete.mp3"
		});
	});
	$(".autoc").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "此对话框将在3秒后自动关闭",
			autoClose : 3000
		});
	});
	$(".nokey").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "此插件默认支持的键盘操作：\n\n在默认类型的对话框下按“Esc、Y、空格、Enter”均可退出\n\n在“确定/取消”类型的对话框下按“Y、空格、Enter”相当于Yes，按“Esc、N”相当于No",
			pressKeys : false
		});
	});
	$(".buttontxt1").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "自定义按钮文字实例1",
			buttonText : {
				Yes : "Continue"
			}
		});
	});
	$(".buttontxt2").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "自定义按钮文字实例2",
			type : 1,
			buttonText : {
				Yes : "All Right",
				No : "No, Thanks"
			}
		});
	});
	$(".buttontxt3").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "Are you sure to uninstall this application?",
			type : 2,
			buttonText : {
				Delete : "Uninstall",
				No : "Not now"
			}
		});
	});
	$(".yesnocall").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "点击“确定”或“取消”后，插件将执行不同的脚本。",
			type : 1,
			onClickYes : function(){
				alert("点击了“确定”");
			},
			onClickNo : function(){
				alert("点击了“取消”");
			}
		});
	});
	$(".delnocall").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "点击“删除”或“取消”后，插件将执行不同的脚本。\n\n“删除”按钮相当于“确定”。",
			type : 2,
			onClickYes : function(){
				alert("点击了“删除”");
			},
			onClickNo : function(){
				alert("点击了“取消”");
			}
		});
	});
	$(".onclose").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "只要对话框被关闭，事件就会被执行。",
			type : 1,
			onClose : function(){
				alert("关闭事件测试");
			}
		});
	});
	$(".threedemo").click(function(){
		for(i = 1; i <= 5; i ++){
			$("body").ios6alert({
				title : "jq22.com",
				content : "第" + i + "条消息"
			});
		}
	});
	$(".mystyle1").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "对话框自定义样式演示1",
			addClass : "myalertstyle1"
		});
	});
	$(".mystyle2").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "对话框自定义样式演示2",
			type : 1,
			addClass : "myalertstyle2"
		});
	});
	$(".htmldemo").click(function(){
		$("body").ios6alert({
			title : "还可以在对话框上使用<i>HTML</i>",
			content : "HTML对话框演示<input value='文本框'><select><option>下拉选择框</option></select>\n<input type='button' value='按钮'>\n<font color='#FF0000'>颜色</font>",
			html : true
		});
	});
	$(".nohtmldemo").click(function(){
		$("body").ios6alert({
			title : "还可以在对话框上使用<i>HTML</i>",
			content : "HTML对话框演示<input value='文本框'><select><option>下拉选择框</option></select>\n<input type='button' value='按钮'>\n<font color='#FF0000'>颜色</font>"
		});
	});
	$(".icondemo").click(function(){
		$("body").ios6alert({
			title : "<img class=\"alt_icon\" src=\"images/htmldemo_icon.png\">jq22.com",
			content : "此示例运用HTML在标题上增加一个图标，图标可以自定义CSS样式。",
			html : true
		});
	});
});