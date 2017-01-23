if($ && $.ajax){
	$.ajax = function(cfg){
		var url = cfg.url;
		if(!url) return;
		
		var datafilename= url.split("?")[0];
		var paths = datafilename.split("/");
		datafilename = paths[paths.length - 1];
		
		url = 'DEMODATAS/'+datafilename;
		var cscript = document.createElement('script');
		cscript.src = url;
		cscript.type = 'text/javascript';
		cscript.onload = function(){
			var cb = cfg.success || cfg.callback || function(){};
			setTimeout(function(){
				cb.call(this,window.__reponseText);
			});
		}
		document.body.appendChild(cscript);
	}
};