var Cookie = {

	add: function(name, value, options){
		var cookie = "";
		cookie = cookie.concat(name,"=",value);
		if(options.date){
			cookie = cookie.concat("; expires=", options.date);
		}
		if(options.path){
			cookie = cookie.concat("; path=", options.path)
		}
		document.cookie = cookie;
	},

	getValue: function(name){
		var value = null;
		var cookies = document.cookie.split(";");
		for(var i = 0; i < cookies.length; i++){
			if(cookies[i].trim().indexOf(name)==0){
				value = cookies[i].split("=")[1];
			}
		}
		return value;
	}
};
