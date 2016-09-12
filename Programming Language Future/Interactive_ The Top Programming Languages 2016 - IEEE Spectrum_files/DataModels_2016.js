// ---------------------------------------------------------------------------------------
// Data Source Data structures
// ---------------------------------------------------------------------------------------
var DataSource = Backbone.Model.extend({
	defaults: {
		id: -1,
		name: "",				// Plain text name of data source
		display_name: "", 		// The name actually used to display the source in the UI
		data_semantics: "",		// What the data source measures
		context: "",			// The description used in the methods section
		weight: 50,				// Default weighting for the datasource
		isInIndex: 1,			// Default the datasource to being part of the index
	},
});

var DataSources = Backbone.Collection.extend({
	model: DataSource,
	url: function () { return window.DATA_ROOT + "/data_sources_2016.json"; },
	parse: function (data, options) {				
		data = data.results;		
		return data;
	},
});



// ---------------------------------------------------------------------------------------
// Language Data structures
// ---------------------------------------------------------------------------------------
var Language = Backbone.Model.extend({
	defaults: {
		id: -1,
		name: "",		// Plain text name of language
		context: "",	// The context used to describe the language on click
		web: 0,			// Booleans for if the language is web, mobile, enterprise, or embedded
		mobile: 0,
		enterprise: 0,
		embedded: 0,
		included_2014: 0,
		included_2015: 0,
		included_2016: 0,
	},
});

var Languages = Backbone.Collection.extend({
	model: Language,
	url: function () { return window.DATA_ROOT + "/languages_2016.json"; },
	parse: function (data, options) {				
		data = data.results;			
		return data;
	},
});



// ---------------------------------------------------------------------------------------
// Ranking Data structures
// ---------------------------------------------------------------------------------------
var Ranking = Backbone.Model.extend({
	defaults: {
		id: -1,
		source_id: -1,			// The data source ID
		language_id: -1,		// The language ID
		value: 1,				// Whatever the data source metric is for this language
		rank: -1,
		year: -1,
	},
});

var Rankings = Backbone.Collection.extend({
	model: Ranking,
	url: function () { return window.DATA_ROOT + "/rankings_2016.json"; },
	parse: function (data, options) {				
		data = data.results;	
		return data;
	},
	comparator: function (m1, m2) {
		if (m1.get("value") < m2.get("value"))
			return 1;
		else return -1;
	},
	computeRanks: function (data_sources) {
		_.each(data_sources.models, function (dsm) {
			// By creating a new ranking for each datasource, it will get sorted
			var new_rankings = new Rankings(this.where({source_id: dsm.get("id")}));
			new_rankings.sort();
			_.each(new_rankings.models, function (nr, i) {
				nr.set("rank", new_rankings.length - i);
			}, this);
			//console.log(new_rankings)
		}, this)
	},
	computeIndex: function(languages, data_sources) {

		var indexRanking = new Rankings();

		// Multiple out all the values for the data sources that are in the index, given their weights
		_.each(languages.models, function (lm, i) {
			//console.log(lm.get("name"))
			var new_ranking = new Ranking({id: i, source_id: 100, language_id: lm.get("id")});
			_.each(data_sources.models, function (dsm) {
				if (dsm.get("isInIndex"))
				{
					var value_model = this.findWhere({source_id: dsm.get("id"), language_id: lm.get("id")});
					var weight = dsm.get("weight");	
								
					// If the data source has a value for this language
					if (value_model != null)
					{
						// The value gets multiplied by the (1 + value) * weight for this data source
						new_ranking.set("value", new_ranking.get("value") * (1 + value_model.get("value") * weight));
						//if (lm.get("id") == 30)
						//	console.log(new_ranking.get("value"))
					}
				}				
			}, this);

			// Take the log of the final index value
			new_ranking.set("value", Math.log(new_ranking.get("value")));
		
			// Add the ranking to a list
			indexRanking.push(new_ranking);
			
		}, this)
		
		// var ranking = this.where({source_id: 1});
		// normalize to between 0 and 100 
		var max = Math.max.apply(null, indexRanking.pluck("value"));
		var min = Math.min.apply(null, indexRanking.pluck("value"));
		_.each(indexRanking.models, function (m) {			
			m.set("value", 100 * (m.get("value") - min) / (max - min));			
		}, this);

		// Resort it
		indexRanking.sort();

		return indexRanking.models;
	},
	computeIndexRank: function(languages, data_sources) {
		this.computeRanks(data_sources);

		var indexRanking = new Rankings();

		// Multiple out all the values for the data sources that are in the index, given their weights
		_.each(languages.models, function (lm, i) {
			//console.log(lm.get("name"))
			var new_ranking = new Ranking({id: i, source_id: 100, language_id: lm.get("id")});
			_.each(data_sources.models, function (dsm) {
				if (dsm.get("isInIndex"))
				{
					
					//console.log(lm.get("id"))
					var value_model = this.findWhere({source_id: dsm.get("id"), language_id: lm.get("id")});
					var weight = dsm.get("weight");	
					//console.log(this)
					console.log(value_model)
								
					// If the data source has a value for this language
					if (value_model != null)
					{

						// Instead here we use the rank * weight
						new_ranking.set("value", new_ranking.get("value") + (value_model.get("rank") * weight));
						//if (lm.get("id") == 30)
						//	console.log(new_ranking.get("value"))
					}
				}				
			}, this);

			// Take the log of the final index value
			//new_ranking.set("value", Math.log(new_ranking.get("value")));
		
			// Add the ranking to a list
			indexRanking.push(new_ranking);
			
		}, this)
		
		// var ranking = this.where({source_id: 1});
		// normalize to between 0 and 100 
		var max = Math.max.apply(null, indexRanking.pluck("value"));
		var min = Math.min.apply(null, indexRanking.pluck("value"));
		_.each(indexRanking.models, function (m) {			
			m.set("value", 100 * (m.get("value") - min) / (max - min));			
		}, this);

		// Resort it
		indexRanking.sort();

		return indexRanking.models;
	}
});


// ---------------------------------------------------------------------------------------
// App Data structures
// ---------------------------------------------------------------------------------------
var AppData = Backbone.Model.extend({
	defaults: {
		headline: "",
		explainer: "",
		methods: ""
	},
});