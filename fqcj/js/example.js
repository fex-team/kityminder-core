/*��ЩJS��ΪDemoҳ�棬ʹ�ô˲��ʱ������Ҫ�벻Ҫ���롣*/
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
			content : "�ޱ���Ի���ʵ��"
		});
	});
	$(".deftype").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "Ĭ�϶Ի���",
			type : 0
		});
	});
	$(".yesno").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "���ȷ����ȡ��",
			type : 1
		});
	});
	$(".delno").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "ȷ��Ҫɾ��������Ϣ��",
			type : 2
		});
	});
	$(".soundd").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "������������ʾ��\n\n�˹��ܲ�֧��IE8�����Ͱ汾�������",
			sound : "sounds/Complete.mp3"
		});
	});
	$(".autoc").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "�˶Ի�����3����Զ��ر�",
			autoClose : 3000
		});
	});
	$(".nokey").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "�˲��Ĭ��֧�ֵļ��̲�����\n\n��Ĭ�����͵ĶԻ����°���Esc��Y���ո�Enter�������˳�\n\n�ڡ�ȷ��/ȡ�������͵ĶԻ����°���Y���ո�Enter���൱��Yes������Esc��N���൱��No",
			pressKeys : false
		});
	});
	$(".buttontxt1").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "�Զ��尴ť����ʵ��1",
			buttonText : {
				Yes : "Continue"
			}
		});
	});
	$(".buttontxt2").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "�Զ��尴ť����ʵ��2",
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
			content : "�����ȷ������ȡ�����󣬲����ִ�в�ͬ�Ľű���",
			type : 1,
			onClickYes : function(){
				alert("����ˡ�ȷ����");
			},
			onClickNo : function(){
				alert("����ˡ�ȡ����");
			}
		});
	});
	$(".delnocall").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "�����ɾ������ȡ�����󣬲����ִ�в�ͬ�Ľű���\n\n��ɾ������ť�൱�ڡ�ȷ������",
			type : 2,
			onClickYes : function(){
				alert("����ˡ�ɾ����");
			},
			onClickNo : function(){
				alert("����ˡ�ȡ����");
			}
		});
	});
	$(".onclose").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "ֻҪ�Ի��򱻹رգ��¼��ͻᱻִ�С�",
			type : 1,
			onClose : function(){
				alert("�ر��¼�����");
			}
		});
	});
	$(".threedemo").click(function(){
		for(i = 1; i <= 5; i ++){
			$("body").ios6alert({
				title : "jq22.com",
				content : "��" + i + "����Ϣ"
			});
		}
	});
	$(".mystyle1").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "�Ի����Զ�����ʽ��ʾ1",
			addClass : "myalertstyle1"
		});
	});
	$(".mystyle2").click(function(){
		$("body").ios6alert({
			title : "jq22.com",
			content : "�Ի����Զ�����ʽ��ʾ2",
			type : 1,
			addClass : "myalertstyle2"
		});
	});
	$(".htmldemo").click(function(){
		$("body").ios6alert({
			title : "�������ڶԻ�����ʹ��<i>HTML</i>",
			content : "HTML�Ի�����ʾ<input value='�ı���'><select><option>����ѡ���</option></select>\n<input type='button' value='��ť'>\n<font color='#FF0000'>��ɫ</font>",
			html : true
		});
	});
	$(".nohtmldemo").click(function(){
		$("body").ios6alert({
			title : "�������ڶԻ�����ʹ��<i>HTML</i>",
			content : "HTML�Ի�����ʾ<input value='�ı���'><select><option>����ѡ���</option></select>\n<input type='button' value='��ť'>\n<font color='#FF0000'>��ɫ</font>"
		});
	});
	$(".icondemo").click(function(){
		$("body").ios6alert({
			title : "<img class=\"alt_icon\" src=\"images/htmldemo_icon.png\">jq22.com",
			content : "��ʾ������HTML�ڱ���������һ��ͼ�꣬ͼ������Զ���CSS��ʽ��",
			html : true
		});
	});
});