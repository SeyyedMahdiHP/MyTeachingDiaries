// ---------------------------------------------------------------------------------------
// The app router will read the URL fragment and set the app state
// ---------------------------------------------------------------------------------------
AppRouter = Backbone.Router.extend({
	routes: {
		"index/:y1/:f1/:f2/:f3/:f4/:s1/:w1/:s2/:w2/:s3/:w3/:s4/:w4/:s5/:w5/:s6/:w6/:s7/:w7/:s8/:w8/:s9/:w9/:s10/:w10/:s11/:w11/:s12/:w12/": "setIndex",
		"comparison/:y1/:y2/:f1/:f2/:f3/:f4/:s1/:w1/:s2/:w2/:s3/:w3/:s4/:w4/:s5/:w5/:s6/:w6/:s7/:w7/:s8/:w8/:s9/:w9/:s10/:w10/:s11/:w11/:s12/:w12/:comparing/:s2_1/:w2_1/:s2_2/:w2_2/:s2_3/:w2_3/:s2_4/:w2_4/:s2_5/:w2_5/:s2_6/:w2_6/:s2_7/:w2_7/:s2_8/:w2_8/:s2_9/:w2_9/:s2_10/:w2_10/:s2_11/:w2_11/:s2_12/:w2_12/": "setComparison"
	},

	// ---------------------------------------------------------------------------------------
	// setIndex - takes a set of parameters for the filters, data sources, and weights, and
	// 			  sets the index accordingly
	// ---------------------------------------------------------------------------------------
	setIndex: function (y1,f1,f2,f3,f4,s1,w1,s2,w2,s3,w3,s4,w4,s5,w5,s6,w6,s7,w7,s8,w8,s9,w9,s10,w10,s11,w11,s12,w12) {	
		var mv = window.mainView;		
		mv.dataYear = parseInt(y1);

		mv.filters["web"] = parseInt(f1);	
		mv.filters["mobile"] = parseInt(f2);	
		mv.filters["enterprise"] = parseInt(f3);	
		mv.filters["embedded"] = parseInt(f4);	

		// Set the data source models with the weights
		_.each(mv.dataSources.models, function (m,i) {			
			m.set("isInIndex", parseInt(eval('s'+(i+1))));
			m.set("weight", parseInt(eval('w'+(i+1))));
		}, this);

		mv.weightingPreset = "custom";

	},

	// ---------------------------------------------------------------------------------------
	// setComparison - takes a set of parameters for the filters, data sources, and weights, 
	// 				   for both the main index and a comparison index and sets them. 
	// ---------------------------------------------------------------------------------------
	setComparison: function (y1,y2,f1,f2,f3,f4,s1,w1,s2,w2,s3,w3,s4,w4,s5,w5,s6,w6,s7,w7,s8,w8,s9,w9,s10,w10,s11,w11,s12,w12,comparing,s2_1,w2_1,s2_2,w2_2,s2_3,w2_3,s2_4,w2_4,s2_5,w2_5,s2_6,w2_6,s2_7,w2_7,s2_8,w2_8,s2_9,w2_9,s2_10,w2_10,s2_11,w2_11,s2_12,w2_12)
	{
		var mv = window.mainView;
		mv.dataYear = parseInt(y1);
		mv.comparisonDataYear = parseInt(y2);

		mv.filters["web"] = parseInt(f1);	
		mv.filters["mobile"] = parseInt(f2);	
		mv.filters["enterprise"] = parseInt(f3);	
		mv.filters["embedded"] = parseInt(f4);	
		
		// Set the data source models with the weights
		_.each(mv.dataSources.models, function (m, i) {
			m.set("isInIndex", parseInt(eval('s'+(i+1))));
			m.set("weight", parseInt(eval('w'+(i+1))));
		}, this);
		
		// If comparing = true, then set and show the comparison
		console.log("comparing: " + comparing)
		if(comparing)
		{
			mv.showComparison = comparing;
			_.each(mv.comparisonDataSources.models, function (m, i) {
				m.set("isInIndex", parseInt(eval('s2_'+(i+1))));
				m.set("weight", parseInt(eval('w2_'+(i+1))));
			}, this);
		}

		mv.weightingPreset = "custom";
		mv.weightingPresetComparison = "custom";
	},

	// ---------------------------------------------------------------------------------------
	// updateURL - sets the URL of the app with the filter states, datasources and weights
	// ---------------------------------------------------------------------------------------
	updateURL: function () {
		var mv = window.mainView;
		if (!mv.showComparison)
			var nav_string = "index/";
		else
			var nav_string = "comparison/";

		nav_string += mv.dataYear + "/";
		if (mv.showComparison)		
		{
			nav_string += mv.comparisonDataYear + "/";
		}


		nav_string += mv.filters["web"] + "/";
		nav_string += mv.filters["mobile"] + "/";
		nav_string += mv.filters["enterprise"] + "/";
		nav_string += mv.filters["embedded"] + "/";

		_.each(mv.dataSources.models, function (m) {
			nav_string += +m.get("isInIndex") + "/" + m.get("weight") + "/";
		}, this);
		if (mv.showComparison)
		{
			nav_string += mv.showComparison + "/";
			_.each(mv.comparisonDataSources.models, function (m) {
				nav_string += +m.get("isInIndex") + "/" + m.get("weight") + "/";
			}, this);
		}

		//console.log($(".twitter-share-button").data("url"))
		//console.log(document.URL+ "%23" + nav_string)
		
		//$(".twitterbutton").attr("href", "https://twitter.com/intent/tweet?url=http://www.google.com&via=IEEESpectrum&text=Top Programming Languages")
		
		this.navigate(nav_string);

		//console.log(encodeURIComponent("#"))
		//console.log(encodeURIComponent(document.URL))
		// Update the url that gets shared on twitter
		$(".twitterbutton").attr("href", "https://twitter.com/intent/tweet?url="+encodeURIComponent(document.URL)+"&via=IEEESpectrum&text=Top Programming Languages")
		$(".facebookbutton").attr("href", "https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(document.URL));

	}

});