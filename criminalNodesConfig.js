Date.prototype.format = function (fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "H+": this.getHours(),
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
/*****************static context***********/
//BFD service
var togetherUrl = 'connectLD?';
//localcontext
var fzUrl = "";
//蓝灯请求时间间隔参数
var timeInternal = 3;
/******************************************/
/**
  * 实体数据模版配置；
  * key为实体类型；
  {
	  data : { //数据模版，在添加提示节点时，会被追加在实体数据上；
		  photoUrl ：string //如有该属性，则该节点将展示图片图标，且鼠标悬停时，会自动浮动详细图片；与image属性互斥；
		  ptotoPreviewSize : int 
		  photoRealSize : object /int
		  "image" : string //节点图标，与ptotoUrl互斥；
		  "imageTitle":"",
		  "imageSize":{
				"width":32,
				"height":32
		   },
		   subtree ： string //实体节点添加后，自动下挂子树；可选subTreesData中的key；
		   renderfix : object //{
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/mobilewhite.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			}
		   //节点渲染中个性化调整；
		   options ： [{ //节点操作；
				trigger : string //操作图标；可选；
				eventName : string //触发时机；可选；可选项：beforerender、noderender
				runType : string //触发次数：可选；可选项；everytime、firsttime
				handler : function//操作逻辑；必选，参数：当前节点；作用域：kmwraper对象；
		   }],
		   prepareLogics : [{ //数据准备链，对当前初始数据进行修复准备；
			   type: ,
			   excution : function 
		   }]
	  }
  }
 **/
var criminalUtil = {
	//导引图整体数据配置；
	__minderOptions : {
		layout : 'left',
		"template":"structure",
		"theme":"fresh-blue",
		"version":"1.4.33"
	},
	/**损失物品损失手机数据模版**/
	cellPhone : {
		data : {
			layout : 'right',
			// "image" : window.naobasepath+"criminalicons/111.png",
			// "imageTitle":"",
			// "imageSize":{
				// "width":32,
				// "height":32
			// },
			// photoUrl : window.naobasepath+"criminalicons/Koala.jpg",
			// ptotoPreviewSize : 32,
			// photoRealSize : {
				// width : 500,
				// height : 370
			// },
			"color" : "#34495E",
			//"subtree" : 'cellPhone',
			newInvest : true,
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/mobilewhite.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			},{
				trigger : window.naobasepath+'criminalicons/trashgreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}],
			prepareLogics : [{
				type : 'unextendable',
				execution : function(data){
					if(null == data.sjhm){
						data.text = "手机"
					}else{
						data.text = '手机号码：' + data.sjhm;
					}
					return data
				}
			}]
		}
	},
	/**损失手机线索**/
	lostingcellphoneinvest : {
		data : {
			type : 'entity',
			"color" : "#34495E",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/mobilewhite.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}],
			prepareLogics : [{
				type : 'unextendable',
				execution : function(data){
					data.text = data.id+""
					return data
				}
			}]
		},
		children:[{
			"data":{
				"text":"网综线索"
			},
			"children":[]
		},{
			"data":{
				"text":"电查线索"
			},
			"children":[]
		}]
	},
	/**可疑号码线索**/
	cellphoneinvest : {
		data : {
			"color" : "#34495E",
			"subtree" : 'cellphoneinvest',
			"expandState":"collapse",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/mobilewhite.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}],
		},
		"children":[{
			"data":{
				"text":"刑专线索"
			},
			"children":[{
				"data":{
					"text":"警综嫌疑人手机号码"
				},
				"children":[]
			},{
				"data":{
					"text":"新疆手机实名"
				},
				"children":[]
			}]
		},{
			"data":{
				"text":"网综线索"
			},
			"children":[{
				"data":{
					"text":"身份信息"
				},
				"children":[]
			},{
				"data":{
					"text":"网上轨迹"
				},
				"children":[]
			},{
				"data":{
					"text":"硬件特征"
				},
				"children":[]
			},{
				"data":{
					"text":"网络关系"
				},
				"children":[]
			}]
		},{
			"data":{
				"text":"电查线索"
			},
			"children":[{
				"data":{
					"text":"机主资料"
				},
				"children":[]
			},{
				"data":{
					"text":"话单"
				},
				"children":[]
			},{
				"data":{
					"text":"关联IMEI"
				},
				"children":[]
			},{
				"data":{
					"text":"快递信息"
				},
				"children":[]
			}]
		},{
			"data":{
				"text":"导入话单"
			},
			"children":[]
		}]
	},
	/**可疑IMEI**/
	IMEIinvest : {
		data : {
			"color" : "#34495E",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/IMEI.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){},
				callback : function(){}
			}]
		},
		"children":[{
			"data":{
				"text":"刑专线索"
			},
			"children":[{
				"data":{
					"text":"损失手机"
				},
				"children":[]
			},{
				"data":{
					"text":"扣押物品"
				},
				"children":[]
			},{
				"data":{
					"text":"一体化采集"
				},
				"children":[]
			}]
		},{
			"data":{
				"text":"网综线索",
				"options": [{
					trigger : window.naobasepath+'criminalicons/plusplus2.png',
					//eventName : 'noderender',
					handler : function(node){
						this.appendNodes([{
							"text":"关联手机"+new Date().getTime()
						}], 'relationPhone', node);
					}
				}]
			}
		},{
			"data":{
				"text":"技侦线索",
				"options": [{
					trigger : window.naobasepath+'criminalicons/plusplus2.png',
					//eventName : 'noderender',
					handler : function(node){
						this.appendNodes([{
							"text":"关联手机"+new Date().getTime()
						}], 'relationPhone', node);
					}
				}]
			}
		}]
	},
	/**可疑IMEI下，关联手机**/
	relationPhone : {
		data : {
			"color" : "#34495E",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/mobilewhite.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}]
		},
		"children":[{
			"data":{
				"text":"手机号码"
			},
			"children":[]
		},{
			"data":{
				"text":"机主"
			},
			"children":[]
		}]
	},
	/**中心现场基站**/
	zxxcjz : {
		data : {
			"color" : "#34495E",
			"text": "中心现场基站1",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/jz.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}],
		},
		"children": [{
            "data": {
                "text": "基站详情", 
                "layout": null
            }, 
            "children": [{
                "data": {
                    "text": "经纬度", 
                    "layout": null
                }, 
                "children": [ ]
            }, 
            {
                "data": {
                    "text": "发案时间段", 
                    "layout": null
                }, 
                "children": [ ]
            }]
		},{
            "data": {
                "text": "基站线索反馈信息", 
                "layout": null
            }, 
            "children": [ ]
        }]
	},
	/**关联现场基站**/
	glxcjz : {
		data : {
			"color" : "#34495E",
			"text": "中心现场基站1",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/jz.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}]
		},
		"children": [{
            "data": {
                "text": "基站详情", 
                "layout": null
            }, 
            "children": [{
                "data": {
                    "text": "经纬度", 
                    "layout": null
                }, 
                "children": [ ]
            }, 
            {
                "data": {
                    "text": "发案时间段", 
                    "layout": null
                }, 
                "children": [ ]
            }]
		},{
            "data": {
                "text": "基站线索反馈信息", 
                "layout": null
            }, 
            "children": [ ]
        }]
	},
	/**人员编号**/
	rybh : {
		data : {
			text : '人员编号',
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/jz.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}]
		}
	},
	/**车辆编号**/
	clbh : {
		data : {
			text : '车辆编号',
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/jz.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}]
		}
	},
	/**串并组**/
	cbz : {
		data : {
			text : '串并组',
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/sitemapwhite.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					
				},
				callback : function(){}
			}]
		},
		"children": [{
            "data": {
                "text": "基站碰撞信息"
            }, 
            "children": [{
                "data": {
                    "text": "共同号码"
                }, 
                "children": [ ]
            },{
                "data": {
                    "text": "机主信息"
                }, 
                "children": [ ]
            }]
		}]
	},
	/**嫌疑人身份证号码**/
	xyrsfzhm : {
		"data":{
			// photoUrl : window.naobasepath+"criminalicons/shr.png",
			// photoRealUrl : window.naobasepath+"criminalicons/Koala.jpg",
			// ptotoPreviewSize : 64,
			// photoRealSize : {
				// width : 500,
				// height : 370
			// },
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/sfz.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			"options" : [{
				trigger : window.naobasepath+'criminalicons/eyegreen.png',
				handler : function(node){
					var ids = node.getData('rybh');
					var third_menu = 'ythcj';
					var ymzt = '';
					var base_rybh = node.getData('rybh');
					var ifNewPage = 1;
					var asjbhstr = this.config.asjbh;
					var sfzh = node.getData('zjhm');
					window.open("http://www.baidu.com");
				},
				callback : function(){}
			}
			// ,{
				// eventName : "noderender",
				// runType : 'firsttime',
				// handler : function(node){
					// var _this = this;
					// _this.criminalTips.setTip('unused', node);
				// }
			// }
			],
			prepareLogics : [{
				type : 'unextendable',
				execution : function(data){
					if(data.rybh) data.id = data.rybh;
					data.text = [];
					data.text.push('姓名：'+data.xm);
					return data;
				}
			}],
			/**build image**/
			buildViewerImage : function(viewer){
				var _this = this;
				var div = document.createElement('div');
				var zjhm = this.getData('zjhm');
				if(!zjhm){
					var span = document.createElement('span');
					span.innerText = '证件号码为空,无法查询照片！';
					span.className = 'image-error';
					div.appendChild(span);
					viewer.bodyEl.appendChild(div);
					return;
				}
				$.ajax({
					url:"toZyryzb_xinjiang.action?",
					type:"POST",
					data:{"zjhm":zjhm},
					success : function(ryxx){
						if(_this !== viewer.node) return;
						if(ryxx.xm == null || ryxx.xm == "" || typeof ryxx.xm == undefined){
							var span = document.createElement('span');
							span.innerText = '未查询到照片';
							span.className = 'image-error';
							div.appendChild(span);
						}else{
							var img = document.createElement('img');
							img.src = 'data:image/gif;base64,'+ ryxx.edzzplj;
							img.className = "xyr-image";
							div.appendChild(img);
						}
						viewer.bodyEl.appendChild(div);
					},
					error : function(){
						var span = document.createElement('span');
						span.innerText = '未查询到照片';
						div.appendChild(span);
						viewer.bodyEl.appendChild(div);
					}
				});
			},
			getDetailContent : function(data){
				
				//return "<div>"+data+"<div>";
				
				//return ['id'];
				
				// return [{
					// dataName : 'id'
				// }]
				
				return [{
					dataName : 'rybh',
					dataCnName : '人员编号'
				},{
					dataName : 'zjhm',
					dataCnName : '身份证号'
				}]
				
				// return [{
					// groupName : 'group1',
					// groupContent : [{
						// dataName : 'id',
						// dataCnName : 'sljk'
					// },{
						// dataName : 'text',
						// dataCnName : '中文'
					// }]
				// }]
				
				// var div = document.createElement('div');
				// div.innerHTML = "I'm a div!";
				// return div;
				
				// var div1 = document.createElement('div');
				// div1.innerHTML = "I'm a div1!";
				// var div2 = document.createElement('div');
				// div2.innerHTML = "I'm a div2!";
				// var div3 = document.createElement('div');
				// div3.innerHTML = "I'm a div3!";
				// return [div1, div2, div3];
			}
		},
		"children":[{
			"data":{
				"text":"标准化采集",
				"expandState":"collapse",
				options : [{
					/**人员信息补充采集**/
					trigger : window.naobasepath+'criminalicons/eyegreen.png',
					handler : function(node){
						var asjbh = this.config.asjbh;
						var rybh = node.getParent().getData('rybh');
						cjsAlert(asjbh,rybh);
					}
				}]
			},
			"children":[{
				"data":{
					"text":"手机"
				}
			},{
				"data":{
					"text":"指纹"
				}
			},{
				"data":{
					"text":"DNA"
				}
			},{
				"data":{
					"text":"随身物品"
				}
			}]
		},{"data": {
      expandState: 'collapse',
      "text": "身份证号码",
      options: [{
        eventName: 'beforerender',
        runType: 'everytime',
        handler: function(node) {
          var children = node.getChildren();
          if(children && children.length > 0) {
            var count = 0;
            for(var i=0,l=children.length;i<l;i++) {
              count += (+(children[i].getData('messageCount')||0));
            }
            node.setData("messageCount", count);
          }
        }
      }]
    },
      children: [{
        data: {
          expandState: 'collapse',
          text: "高危背景",
          messageCount: 0,
          options: [{
            eventName: 'beforerender',
            runType: 'everytime',
            handler: function(node) {
              var children = node.getChildren();
              if(children && children.length > 0) {
                var count = 0;
                for(var i=0,l=children.length;i<l;i++) {
                  count += (+children[i].getData('messageCount'));
                }
                node.setData("messageCount", count);
                node.getParent().render();
              }
            }
          }]
        },
        children: [{
          data: {
            text: "网上在逃人员",
            messageCount: '0',
            expandState: 'collapse',
            options: [{
              eventName: 'beforerender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103579',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'gwry', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "在逃撤销人员",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this

                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103580',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'gwry', node);

                    }else{
                      _this.km.removeNode(node);
                      parentNode.render();
                    }
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "全国违法犯罪人员",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this

                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103582',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'gwry', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "吸毒人员",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                _this.km.removeNode(node);
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "艾滋病患者",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this
								_this.km.removeNode(node)
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
				 }, {
          data: {
            text: "职业犯罪人员",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103583',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'gwry', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "警综嫌疑人员",
            messageCount: '0',
            expandState: 'collapse',
            options: [{
              eventName: 'beforerender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103584',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'gwry', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "看守所收押人员",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this

                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103585',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'gwry', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "戒毒所强戒人员",
            messageCount: '0',
            expandState: 'collapse',
            options: [{
              eventName: 'beforerender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('sfzh');
                var _this = this
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103581',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'gwry', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "涉稳高危人员",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'beforerender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103586',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {

                      _this.appendNodes(successData.data, 'gwry', node);
                    }else{
                      _this.km.removeNode(node);
                      parentNode.render();
                    }
                  },
                  error: function (error) {
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "地域性高危人员",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'beforerender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103589',
                    '@zjhm@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'gwry', node);
                    }else {
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        } ]
      }, {
        data: {
          text: "身份证轨迹",
          messageCount: '0',
          options: [{
            trigger: window.naobasepath + 'criminalicons/eyegreen.png',
            handler: function(node) {
              var idNumber = node.parent.parent.parent.getData('zjhm');
              function iTapJK (obj){
                document.charset='utf-8';
                var f= document.createElement('form');
                f.action="http://10.20.47.120:8081/GAT_XZ/servlet/front/JKS";
                f.method = 'post';
                f.target="_blank";
                document.body.appendChild(f);
                obj['bbxz']= 'jk';
                for(var i in obj){
                  var zj=document.createElement('input');
                  zj.type= 'hidden';
                  zj.name=i;
                  zj.value=obj[i];
                  f.appendChild(zj);
                }
                f.submit();
                document.body.removeChild(f);
              }
              function csTJ(){
                var obj=new Object();
                obj['dlzh']='bfd';		//用户名
                obj['dlmm']='bfd';		//密码
                obj['ZFID']='ZF103588';	//对应的战法id
                obj['ZF103588_@sfzh@']= idNumber;//该战法的参数.若有多个也加入到obj中
                obj['STJQ']='{"11111":"#6A6A6A","33333":"#E1B600"}'; //实体加圈.格式:JsonObject格式的字符串.保存的是主键ID和对应颜色的映射
                obj['Layout']='';		//打开图形页面时的直接布局方式(默认为空,即默认布局)(可选项:Hierarchy,GroupLayout,CircleLayout)
                obj['KZ']='false';	//对应的战法id
                iTapJK (obj);
              }

              csTJ();
            }
          }]
        }
      }, {
        data: {
          expandState: 'collapse',
          messageCount: 0,
          text: "关系人员",
          options: [{
            eventName: 'beforerender',
            runType: 'everytime',
            handler: function(node) {
              var children = node.getChildren();
              if(children && children.length > 0) {
                var count = 0;
                for(var i=0,l=children.length;i<l;i++) {
                  count += (children[i].getData('messageCount'));
                }
                node.setData("messageCount", count);
                node.getParent().render();
              }
            }
          }]
        },
        children: [{
          data: {
            text: "全疆同时段同住",
            messageCount: 0,
            expandState: 'collapse',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103522',
                    '@证件号码@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd'),
                    '@时间间隔@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "全疆同时段同退",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {
                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103525',
                    '@证件号码@': idNumber,
                    '@查询时间起@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询时间止@': (new Date()).format('yyyy/MM/dd'),
                    '@间隔时间@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {

                  }
                })

              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "全疆同房间同住分析",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {
                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');

                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103521',
                    '@身份证@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd'),
                    '@时间间隔@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {

                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "兵团同时段同住",
            messageCount: '0',
            expandState: 'collapse',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');

                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103528',
                    '@身份证@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd'),
                    '@时间间隔@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {

                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "兵团同时段同退",
            messageCount: '0',
            expandState: 'collapse',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');

                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103530',
                    '@证件号码@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd'),
                    '@时间间隔@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  },
                  error: function (error) {

                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "兵团同房间同住分析",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');

                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103526',
                    '@身份证@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd'),
                    '@时间间隔@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "同暂住",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103578',
                    '@ZJHM@': idNumber,
                    '@KSSJ@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@JSSJ@': (new Date()).format('yyyy/MM/dd')
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "同天同航班订票",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103529',
                    '@身份证@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd'),
                    '@间隔时间@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })

              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "同天同航班同籍贯",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
                var idNumber = node.parent.parent.parent.getData('zjhm');

                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103527',
                    '@身份证@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd')
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "同窗口同时段取票",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {
                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103523',
                    '@身份证@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd'),
                    '@间隔时间@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "同窗口同籍贯取票",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6)
                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103524',
                    '@证件号码@': idNumber,
                    '@查询开始时间@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@查询结束时间@': (new Date()).format('yyyy/MM/dd'),
                    '@间隔时间@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }]
      }, {
        data: {
          expandState: 'collapse',
          text: "异动特征",
          options: [{
            eventName: 'beforerender',
            runType: 'everytime',
            handler: function(node) {
              var children = node.getChildren();
              if(children && children.length > 0) {
                var count = 0;
                for(var i=0,l=children.length;i<l;i++) {
                  count += (children[i].getData('messageCount'));
                }
                node.setData("messageCount", count);
                node.getParent().render();
              }
            }
          }]
        },
        children: [{
          data: {
            text: "凌晨入住",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var idNumber = node.parent.parent.parent.getData('zjhm');

                var _this = this

                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103591',
                    '@sfzh@': idNumber
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "频繁入住",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
                var idNumber = node.parent.parent.parent.getData('zjhm');

                var _this = this

                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103590',
                    '@KSSJ@': (sixMonthAgo).format('yyyy/MM/dd'),
                    '@JSSJ@': ((new Date())).format('yyyy/MM/dd'),
                    '@SFZH@': idNumber,
                    '@PC@': timeInternal,
                    '@XZQY@': idNumber.substring(0, 6)
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }, {
          data: {
            text: "异常异性同住",
            expandState: 'collapse',
            messageCount: '0',
            options: [{
              eventName: 'noderender',
              runType: 'firsttime',
              handler: function (node) {

                var sixMonthAgo = new Date();
                sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
                var idNumber = node.parent.parent.parent.getData('zjhm');
                var _this = this;
                this.ajax({
                  url: togetherUrl,
                  type: 'post',
                  data: {
                    'ZFID': 'ZF103013',
                    '@证件号码@': idNumber,
                    '@入住时间起@': sixMonthAgo.format('yyyy/MM/dd'),
                    '@入住时间止@': ((new Date()).format('yyyy/MM/dd')),
                    '@时间间隔@': timeInternal
                  },
                  success: function (successData) {
                  	var parentNode = node.getParent();
                    if (successData && successData.data && successData.data.length > 0) {
                      _this.appendNodes(successData.data, 'idNumber', node);
                    }else{
                      _this.km.removeNode(node);
                    }
                    parentNode.render();
                  }
                })
              }
            }, {
              eventName: 'beforerender',
              runType: 'everytime',
              handler: function (node) {
                node.setData('messageCount', node.children.length);
              }
            }]
          }
        }]
      }, {
        data: {
          text: "认定案件",
          messageCount: 0
        }
      }, {
        data: {
          text: "轨迹关联案件",
          messageCount: 0
        }
      }]
	},{
			"data":{
				"text":"手机号码",
				"expandState":"collapse",
				"options" : [{
					trigger : window.naobasepath+'criminalicons/plusplus2.png',
					handler : function(node){
//						this.refreshNode(node.data.id);
						var asjbh = this.config.asjbh;
						var rybh = node.getParent().getData('rybh');
						var freshNodeId = node.data.id;
						window.open("http://www.baidu.com");
					}
				},{
					eventName : "noderender",
					runType : 'firsttime',
					handler : function(node){
						var _this = this;
						_this.ajax({
							type : 'GET',
							url : "querySjhmForXyr.action",
							data:{"asjbh":this.config.asjbh,"rybh":node.getParent().getData("rybh")},
							success : function(a,b,c,d){
								var xyrs = a.data;
								if(xyrs && xyrs.length)
									_this.appendNodes(xyrs,'xyrsjhm',node);
							}
						});
					}
				},{
					eventName : "beforerender",
					runType : 'everytime',
					handler : function(node){
						node.setData('messageCount', node.getChildren().length);
					}
				}]
			}
		},{
			"data":{
				"text":"扣押物品",
				"expandState":"collapse"
			},
			children : [{
				data:{
					'text':'非本人证件',
					"expandState":"collapse",
					options: [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var asjbh = this.config.asjbh;
							var freshNodeId = node.data.id;
							window.open("http://www.baidu.com");
						}
					}]
				},
				children : [{
					data : {
						text : '损失物品信息'
					}
				},{
					data : {
						text : '身份证轨迹信息'
					}
				}]
			},{
				data:{
					'text':'手机',
					options: [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var asjbh = this.config.asjbh;
							var freshNodeId = node.data.id;
							window.open("http://www.baidu.com");
						}
						
					}]
				}
			},{
				data:{
					'text':'卡类',
					options: [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var asjbh = this.config.asjbh;
							var freshNodeId = node.data.id;
							window.open("http://www.baidu.com");
						}
					}]
				}
			},{
				data:{
					'text':'汽车牌照'
				}
			},{
				data:{
					'text':'电子产品'
				}
			},{
				data:{
					'text':'机动车'
				}
			},{
				data:{
					'text':'非机动车电动车',
					options: [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var asjbh = this.config.asjbh;
							var freshNodeId = node.data.id;
							window.open("http://www.baidu.com");
						}
					}]
				}
			}]
		}]
	},
	/**嫌疑人手机号码**/
	xyrsjhm : {
		data : {
			renderfix : {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/mobilewhite.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
			prepareLogics : [{
				type : 'unextendable',
				execution : function(data){
					if(data.xxzjbh) data.id = data.xxzjbh;
					if(data.ssydtxsb_yddh) data.text = data.ssydtxsb_yddh;
					else data.text = '无手机号码';
					return data;
				}
			}]
		},
		children :[{
			data : {
				text : '话单明细',
				options : [{
					trigger : window.naobasepath+'criminalicons/eyegreen.png',
					handler : function(node){
						var ownerEntity = node.getOwnerEntity();
						var phoneNum = ownerEntity.getData('ssydtxsb_yddh');
						if(!phoneNum){
							alert('无手机号码！');
							return;
						}
						window.open("http://www.baidu.com");
					}
				}]
			}
		},{
		  data: {
        text: '高危背景'
      },
      children: [{
		    data: {
		      text: '警综',
          messageCount: 0,
          expandState: 'collapse',
          options: [{
            eventName: 'noderender',
            runType: 'firsttime',
            handler: function (node) {

              var phoneNumber = node.getOwnerEntity().getData('ssydtxsb_yddh');
              var _this = this;
              this.ajax({
                url: togetherUrl,
                type: 'post',
                data: {
                  'ZFID': 'ZF103619',
                  '@手机号码@': phoneNumber,
                },
                success: function (successData) {
                  var parentNode = node.getParent();
                  if (successData && successData.data && successData.data.length > 0) {
                    _this.appendNodes(successData.data, 'jzsj', node);
                  }else{
                    _this.km.removeNode(node);
                  }
                  parentNode.render();
                }
              })
            }
          }, {
            eventName: 'beforerender',
            runType: 'everytime',
            handler: function (node) {
              node.setData('messageCount', node.children.length);
            }
          }]
        }
      }]
    }, {
		  data: {
        text: '串码',
        messageCount: 0,
        expandState: 'collapse',
        options: [{
          eventName: 'noderender',
          runType: 'firsttime',
          handler: function (node) {
            var phoneNumber = node.getOwnerEntity().getData('ssydtxsb_yddh');
            var _this = this;
            this.ajax({
              url: togetherUrl,
              type: 'post',
              data: {
                'ZFID': 'ZF103618',
                '@手机号码@': phoneNumber,
              },
              success: function (successData) {
                var parentNode = node.getParent();
                if (successData && successData.data && successData.data.length > 0) {
                  _this.appendNodes(successData.data, 'imei', node);
                }
                parentNode.render();
              }
            })
          }
        }, {
          eventName: 'beforerender',
          runType: 'everytime',
          handler: function (node) {
            node.setData('messageCount', node.children.length);
          }
        }]
      }
    }]
	},
	/** 人员关系 **/
  idNumber: {
    data: {
      text: '身份证号',
      renderfix: {
        type: 'entity',
        autoStroke: false,
        masked: true,
        maskIcon: window.naobasepath + 'criminalicons/anjian.png',
        maskTextBackColor: '#00bcd4',
        maskTextTriggerColor: '#b2ebf2'
      },
      "options": [{
        trigger: window.naobasepath + 'criminalicons/eyegreen.png',
        handler: function (node) {

        },
        callback: function () {
        }
      },  {
        eventName: 'beforerender',
        runType: 'everytime',
        handler: function (node) {
        	if(node.children.length > 0) {
            node.setData('messageCount', node.children.length);
            node.getParent().render();
					}

        }
      }],
      prepareLogics: [{
        type: 'unextendable',
        execution: function (data) {
          data.text = data['关系人证件号码'] || data['旅客编号']
          return data
        }
      }],
      getDetailContent: function (data) {
        var div1 = document.createElement('div');
        div1.innerHTML = '关系人姓名：' + (data['关系人姓名']);

        var div2 = document.createElement('div');
        div2.innerHTML = '关系人证件号码：' + (data['关系人证件号码'] || data['旅客编号']);

        var div3 = document.createElement('div');
        div3.innerHTML = '关系人入住时间：' + (data['关系人入住时间'] || data['入住时间']);

        var div4 = document.createElement('div');
        div4.innerHTML = '入住房号：' + (data['入住房号']);

        var div5 = document.createElement('div');
        div5.innerHTML = '旅馆名称：' + (data['旅馆名称']);

        return [div1, div2, div3, div4, div5]
      }
    }
  },
	/** 高危背景 **/
  gwry: {
    data: {
      text: '身份证号',
      renderfix: {
        type: 'entity',
        autoStroke: false,
        masked: true,
        maskIcon: window.naobasepath + 'criminalicons/anjian.png',
        maskTextBackColor: '#00bcd4',
        maskTextTriggerColor: '#b2ebf2'
      },
      "options": [{
        trigger: window.naobasepath + 'criminalicons/eyegreen.png',
        handler: function (node) {

        },
        callback: function () {
        }
      }],
      prepareLogics: [{
        type: 'unextendable',
        execution: function (data) {
          data.text = data['案件编号'] ||data['人员编号'] || data['人员编号RYBH'] || data['人员类型']
             || data['类案名称'] || data['抓获单位']
          return data
        }
      }],
      getDetailContent: function (data) {
      	var array = []

				for(var key in data) {
          var re = /[\u4E00-\u9FA5\uF900-\uFA2D]/g
					if(re.test(key)){
						array.push({
              dataName: key,
              dataCnName: key
						});
					}
				}
				return array;
			}
    }
  },
    /** 手机-高危背景-警综 **/
  jzsj: {
    data: {
		renderfix : {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/mobilewhite.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
      prepareLogics: [{
        type: 'unextendable',
        execution: function (data) {
          data['text'] = data['对方号码'];
          return data;
        }
      }],
      getDetailContent: function (data) {
        return [{
          dataName: '对方号码',
          dataCnName: '对方号码'
        }, {
          dataName: '身份证号',
          dataCnName: '身份证号'
        }]
      }
    }
  },
  /** 手机-串码 **/
  imei: {
    data: {
		renderfix : {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/IMEI.png',
				maskTextBackColor : '#00bcd4',
				maskTextTriggerColor : '#b2ebf2'
			},
      prepareLogics : [{
        type : 'unextendable',
        execution : function(data){
          data['text'] = data['IMEI']
          return data;
        }
      }],
      getDetailContent : function(data){
        return [{
          dataName : 'IMEI',
          dataCnName : 'IMEI'
        }, {
          dataName : '活动次数',
          dataCnName : '活动次数'
        }, {
          dataName : '是否损失手机串码',
          dataCnName : '是否损失手机串码'
        }]
      }
    }
  }
};
/**
  * 导引树主干配置；此处配置节点均为常规配置，直接下挂与root节点，不受远程数据制约；
  * {
	  children : [{
		  data ：photoUrl ：string //如有该属性，则该节点将展示图片图标，且鼠标悬停时，会自动浮动详细图片；与image属性互斥；
		  ptotoPreviewSize : int 
		  photoRealSize : object /int
		  "image" : string //节点图标，与ptotoUrl互斥；
		  "imageTitle":"",
		  "imageSize":{
				"width":32,
				"height":32
		   },
		   options ： [{ //节点操作；
				trigger : string //操作图标；可选；
				eventName : string //触发时机；可选；可选项：beforerender、noderender
				runType : string //触发次数：可选；可选项；everytime、firsttime
				handler : function//操作逻辑；必选，参数：当前节点；作用域：kmwraper对象；
		   }],
		   prepareLogics : [{ //数据准备链，对当前初始数据进行修复准备；
			   type: ,
			   excution : function 
		   }]
	  }]
  }
 **/
var navigateData = {
	/**损失物品**/
	losting : {
        "data": {
            "text": "损失物品",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				//maskIcon:window.naobasepath+'criminalicons/jz.png',
				maskTextBackColor : '#d5ecff',
				maskTextTriggerColor : '#42a5f5',
				fontColor : '#2196f3',
				logosize : {
					height : 55,
					width : 55
				},
				logoUrl : window.naobasepath+'criminalicons/sswp.png'
			}
        }, 
        "children": [{
            "data": {
                "text": "损失手机",
				newmessage : true,
				messageCount : '44',
				"options" : [{
					trigger : window.naobasepath+'criminalicons/plusplus2.png',
					handler : function(node){
						var _this = this;
						_this.appendNodes([{
							id : new Date().getTime(),
							newmessage : true,
							"messageCount" : parseInt(Math.random() * 100),
							"text":new Date().getTime()
						}], 'cellPhone', node);
					}
				}]
            }, 
            "children": [ ]
        }]
    },
	/**侦查线索**/
	investigative : {
        "data": {
            "text": "侦查线索",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				//maskIcon : window.naobasepath+'criminalicons/jz.png',
				maskTextBackColor : '#d5ecff',
				maskTextTriggerColor : '#42a5f5',
				fontColor : '#2196f3',
				logosize : {
					height : 55,
					width : 55
				},
				logoUrl : window.naobasepath+'criminalicons/zzxs.png'
			}
        }, 
        "children": [{
            "data": {
                "text": "损失物品线索"
            }, 
            "children": [{
                "data": {
                    "text": "损失手机线索",
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							_this.appendNodes([{
								id : new Date().getTime(),
								"text":new Date().getTime()
							}], 'lostingcellphoneinvest', node);
						}
					}]
                }, 
                "children": [ ]
            }]
        },{
            "data": {
                "text": "嫌疑号码线索",
				"options" : [{
					trigger : window.naobasepath+'criminalicons/plusplus2.png',
					handler : function(node){
						var _this = this;
						_this.appendNodes([{
							id : new Date().getTime(),
							"text":new Date().getTime()
						}], 'cellphoneinvest', node);
					}
				}]
            }, 
            "children": [ ]
        },{
            "data": {
                "text": "可疑IMEI线索",
				"options" : [{
					trigger : window.naobasepath+'criminalicons/plusplus2.png',
					handler : function(node){
						var _this = this;
						_this.appendNodes([{
							id : new Date().getTime(),
							"text":new Date().getTime()
						}], 'IMEIinvest', node);
					}
				}]
            }, 
            "children": [ ]
        },{
            "data": {
                "text": "基站信息"
            }, 
            "children": [{
                "data": {
                    "text": "中心现场基站",
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							_this.appendNodes([{
								id : new Date().getTime(),
								"text":"损失手机线索"
							}], 'zxxcjz', node);
						}
					}]
                }, 
                "children": [ ]
            },{
                "data": {
                    "text": "关联现场基站",
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							_this.appendNodes([{
								id : new Date().getTime(),
								"text":"损失手机线索"
							}], 'glxcjz', node);
						}
					}]
                }, 
                "children": [ ]
            },{
                "data": {
                    "text": "录比反"
                }, 
                "children": [{
                    "data": {
                        "text": "共同号码"
                    }, 
                    "children": [ ]
                },{
                    "data": {
                        "text": "身份信息"
                    }, 
                    "children": [ ]
                },{
                    "data": {
                        "text": "高危背景"
                    }, 
                    "children": [ ]
                }]
            }]
        },{
            "data": {
                "text": "涉案视频截图"       
            }, 
            "children": [{
                "data": {
                    "text": "犯罪嫌疑人",
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							_this.appendNodes([{
								id : new Date().getTime(),
								"text":"损失手机线索"
							}], 'rybh', node);
						}
					}]
				}, 
                "children": [ ]
            },{
                "data": {
                    "text": "交通工具",
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							_this.appendNodes([{
								id : new Date().getTime(),
								"text":"损失手机线索"
							}], 'clbh', node);
						}
					}]
                }, 
                "children": [ ]
            }]
        }, 
        {
            "data": {
                "text": "串并案"
            }, 
            "children": [{
                "data": {
                    "text": "串并线索"
                }, 
                "children": [{
                    "data": {
                        "text": "同类案件"
                    }, 
                    "children": [{
                        "data": {
                            "text": "案前同类案件"
                        }, 
                        "children": [{
                            "data": {
                                "text": "本地"
                            }, 
                            "children": [ ]
                        },{
                            "data": {
                                "text": "周边"
                            }, 
                            "children": [ ]
                        }, 
                        {
                            "data": {
                                "text": "全区"
                            }, 
                            "children": [ ]
                        }]
                    },{
                        "data": {
                            "text": "案后同类案件"
                        }, 
                        "children": [{
                            "data": {
                                "text": "本地"
                            }, 
                            "children": [ ]
                        }, {
                            "data": {
                                "text": "周边"
                            }, 
                            "children": [ ]
                        },{
                            "data": {
                                "text": "全区"
                            }, 
                            "children": [ ]
                        }]
                    }]
                },{
                    "data": {
                        "text": "技术串并"
                    }, 
                    "children": [ ]
                },{
                    "data": {
                        "text": "积分串并"
                    }, 
                    "children": [ ]
                },{
                    "data": {
                        "text": "视频串并"
                    }, 
                    "children": [ ]
                }]
            },{
                "data": {
                    "text": "串并线索组"
                }, 
                "children": [ ]
            },{
                "data": {
                    "text": "串并组线索",
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							_this.appendNodes([{
								id : new Date().getTime(),
								"text":"损失手机线索"
							}], 'cbz', node);
						}
					}]
                }, 
                "children": [ ]
            }]
        }]
    },
	/**嫌疑人**/
	xyr : {
        "data": {
            "text": "嫌疑人",
			color : 'red',
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				//maskIcon : window.naobasepath+'criminalicons/jz.png',
				maskTextBackColor : '#d5ecff',
				maskTextTriggerColor : '#42a5f5',
				fontColor : '#2196f3',
				logosize : {
					height : 55,
					width : 55
				},
				logoUrl : window.naobasepath+'criminalicons/xyr.png'
			},
			options : [{
				//trigger : window.naobasepath+'criminalicons/eyeblue.png',
				eventName : "noderender",
				runType : 'firsttime',
				handler : function(node){
					var _this = this;
					_this.ajax({
						type : "POST",
						url : "queryXyrxxByAsjbh.action",
						data:{"asjbh":this.config.asjbh},
						success : function(a,b,c,d){
							var xyrs = a.data;
							if(xyrs && xyrs.length)
								_this.appendNodes(xyrs,'xyrsfzhm',node);
							// this.criminalTips.setTip(['nonesuspect',{
								// tipContent : function(node){
									// var v = document.createElement('div');
									// v.innerText = JSON.stringify("随便什么内容都行");
									// return v;
								// }
							// }],node);
						}
					});
				}
			}]
        }
    },
	/**整体路径**/
    "thewhole": {
        "data": {
            "text" : "案件编号",
			renderfix :  {
				type : 'entity',
				autoStroke : false,
				masked : true,
				maskIcon : window.naobasepath+'criminalicons/anjian.png',
				maskTextBackColor : '#1565c0',
				maskTextTriggerColor : '#42a5f5'
			},
			options : [{
				trigger : window.naobasepath+'criminalicons/eyeblue.png'
			}]
        }, 
        "children": [{
            "data": {
                "text": "损失物品",
				renderfix :  {
					type : 'entity',
					autoStroke : false,
					masked : true,
					//maskIcon : window.naobasepath+'criminalicons/jz.png',
					maskTextBackColor : '#d5ecff',
					maskTextTriggerColor : '#42a5f5',
					fontColor : '#2196f3',
					logosize : {
						height : 55,
						width : 55
					},
					logoUrl : window.naobasepath+'criminalicons/sswp.png'
				}
            }, 
            "children": [{
                "data": {
                    "text": "损失手机",
					newmessage : true,
					messageCount : '请同步嫌疑人数据',
					//tip : 'unused',
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							setTimeout(function(){
								_this.appendNodes([{
								id : new Date().getTime(),
								newmessage : true,
								tip : 'unused',
								"messageCount" : parseInt(Math.random() * 100),
								"text":new Date().getTime()
							}], 'cellPhone', node);
							});
							
						}
					}]
                }, 
                "children": [ ]
            }]
        },{
            "data": {
                "text": "侦查线索",
				renderfix :  {
					type : 'entity',
					autoStroke : false,
					masked : true,
					//maskIcon : window.naobasepath+'criminalicons/jz.png',
					maskTextBackColor : '#d5ecff',
					maskTextTriggerColor : '#42a5f5',
					fontColor : '#2196f3',
					logosize : {
						height : 55,
						width : 55
					},
					logoUrl : window.naobasepath+'criminalicons/zzxs.png'
				}
            }, 
            "children": [{
                "data": {
                    "text": "损失物品线索"
                }, 
                "children": [{
                    "data": {
                        "text": "损失手机线索",
						"options" : [{
							trigger : window.naobasepath+'criminalicons/plusplus2.png',
							handler : function(node){
								var _this = this;
								_this.appendNodes([{
									id : new Date().getTime(),
									"text":new Date().getTime()
								}], 'lostingcellphoneinvest', node);
							}
						}]
                    }, 
                    "children": [ ]
                }]
            },{
                "data": {
                    "text": "嫌疑号码线索",
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							_this.appendNodes([{
								id : new Date().getTime(),
								"text":new Date().getTime()
							}], 'cellphoneinvest', node);
						}
					}]
                }, 
                "children": [ ]
            },{
                "data": {
                    "text": "可疑IMEI线索",
					"options" : [{
						trigger : window.naobasepath+'criminalicons/plusplus2.png',
						handler : function(node){
							var _this = this;
							_this.appendNodes([{
								id : new Date().getTime(),
								"text":new Date().getTime()
							}], 'IMEIinvest', node);
						}
					}]
                }, 
                "children": [ ]
            },{
                "data": {
                    "text": "基站信息"
                }, 
                "children": [{
                    "data": {
                        "text": "中心现场基站",
						"options" : [{
							trigger : window.naobasepath+'criminalicons/plusplus2.png',
							handler : function(node){
								var _this = this;
								_this.appendNodes([{
									id : new Date().getTime(),
									"text":"损失手机线索"
								}], 'zxxcjz', node);
							}
						}]
                    }, 
                    "children": [ ]
                },{
                    "data": {
                        "text": "关联现场基站",
						"options" : [{
							trigger : window.naobasepath+'criminalicons/plusplus2.png',
							handler : function(node){
								var _this = this;
								_this.appendNodes([{
									id : new Date().getTime(),
									"text":"损失手机线索"
								}], 'glxcjz', node);
							}
						}]
                    }, 
                    "children": [ ]
                },{
                    "data": {
                        "text": "录比反"
                    }, 
                    "children": [{
                        "data": {
                            "text": "共同号码"
                        }, 
                        "children": [ ]
                    },{
                        "data": {
                            "text": "身份信息"
                        }, 
                        "children": [ ]
                    },{
                        "data": {
                            "text": "高危背景"
                        }, 
                        "children": [ ]
                    }]
                }]
            },{
                "data": {
                    "text": "涉案视频截图"       
                }, 
                "children": [{
                    "data": {
                        "text": "犯罪嫌疑人",
						"options" : [{
							trigger : window.naobasepath+'criminalicons/plusplus2.png',
							handler : function(node){
								var _this = this;
								_this.appendNodes([{
									id : new Date().getTime(),
									"text":"损失手机线索"
								}], 'rybh', node);
							}
						}]
					}, 
                    "children": [ ]
                },{
                    "data": {
                        "text": "交通工具",
						"options" : [{
							trigger : window.naobasepath+'criminalicons/plusplus2.png',
							handler : function(node){
								var _this = this;
								_this.appendNodes([{
									id : new Date().getTime(),
									"text":"损失手机线索"
								}], 'clbh', node);
							}
						}]
                    }, 
                    "children": [ ]
                }]
            }, 
            {
                "data": {
                    "text": "串并案"
                }, 
                "children": [{
                    "data": {
                        "text": "串并线索"
                    }, 
                    "children": [{
                        "data": {
                            "text": "同类案件"
                        }, 
                        "children": [{
                            "data": {
                                "text": "案前同类案件"
                            }, 
                            "children": [{
                                "data": {
                                    "text": "本地"
                                }, 
                                "children": [ ]
                            },{
                                "data": {
                                    "text": "周边"
                                }, 
                                "children": [ ]
                            }, 
                            {
                                "data": {
                                    "text": "全区"
                                }, 
                                "children": [ ]
                            }]
                        },{
                            "data": {
                                "text": "案后同类案件"
                            }, 
                            "children": [{
                                "data": {
                                    "text": "本地"
                                }, 
                                "children": [ ]
                            }, {
                                "data": {
                                    "text": "周边"
                                }, 
                                "children": [ ]
                            },{
                                "data": {
                                    "text": "全区"
                                }, 
                                "children": [ ]
                            }]
                        }]
                    },{
                        "data": {
                            "text": "技术串并"
                        }, 
                        "children": [ ]
                    },{
                        "data": {
                            "text": "积分串并"
                        }, 
                        "children": [ ]
                    },{
                        "data": {
                            "text": "视频串并"
                        }, 
                        "children": [ ]
                    }]
                },{
                    "data": {
                        "text": "串并线索组"
                    }, 
                    "children": [ ]
                },{
                    "data": {
                        "text": "串并组线索",
						"options" : [{
							trigger : window.naobasepath+'criminalicons/plusplus2.png',
							handler : function(node){
								var _this = this;
								_this.appendNodes([{
									id : new Date().getTime(),
									"text":"损失手机线索"
								}], 'cbz', node);
							}
						}]
                    }, 
                    "children": [ ]
                }]
            }
                ]
        },{
            "data": {
                "text": "嫌疑人",
				renderfix :  {
					type : 'entity',
					autoStroke : false,
					masked : true,
					//maskIcon : window.naobasepath+'criminalicons/jz.png',
					maskTextBackColor : '#d5ecff',
					maskTextTriggerColor : '#42a5f5',
					fontColor : '#2196f3',
					logosize : {
						height : 55,
						width : 55
					},
					logoUrl : window.naobasepath+'criminalicons/xyr.png'
				},
				options : [{
					eventName : "noderender",
					runType : 'firsttime',
					handler : function(node){
						var _this = this;
						$.ajax({
							type : "POST",
							url : "queryXyrxxByAsjbh.action",
							data : {
								"asjbh":this.config.asjbh
							},
							success : function(a,b,c,d){
								var xyrs = a.data;
								if(xyrs && xyrs.length)
									_this.appendNodes(xyrs,'xyrsfzhm',node);
							}
						});
					}
				}]
            }, 
            "children": [ ]
        },{
            "data": {
                "text": "受害人",
				renderfix :  {
					type : 'entity',
					autoStroke : false,
					masked : true,
					//maskIcon : window.naobasepath+'criminalicons/jz.png',
					maskTextBackColor : '#d5ecff',
					maskTextTriggerColor : '#42a5f5',
					fontColor : '#2196f3',
					logosize : {
						height : 55,
						width : 55
					},
					logoUrl : window.naobasepath+'criminalicons/shr.png'
				}
            }, 
            "children": [ ]
        },{
            "data": {
                "text": "现场勘验信息",
				renderfix :  {
					type : 'entity',
					autoStroke : false,
					masked : true,
					//maskIcon : window.naobasepath+'criminalicons/jz.png',
					maskTextBackColor : '#d5ecff',
					maskTextTriggerColor : '#42a5f5',
					fontColor : '#2196f3',
					logosize : {
						height : 55,
						width : 55
					},
					logoUrl : window.naobasepath+'criminalicons/xckcxx.png'
				}
            }, 
            "children": [ ]
        },{
            "data": {
                "text": "案件信息",
				renderfix :  {
					type : 'entity',
					autoStroke : false,
					masked : true,
					//maskIcon : window.naobasepath+'criminalicons/jz.png',
					maskTextBackColor : '#d5ecff',
					maskTextTriggerColor : '#42a5f5',
					fontColor : '#2196f3',
					logosize : {
						height : 55,
						width : 55
					},
					logoUrl : window.naobasepath+'criminalicons/ajxx.png'
				}
            }, 
            "children": [ ]
        }]
    }
};