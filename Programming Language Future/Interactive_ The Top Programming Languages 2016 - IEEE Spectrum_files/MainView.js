// ---------------------------------------------------------------------------------------
// Main View is a backbone view that renders the app. 
// It will render itself into the component with the "#container" ID
// ---------------------------------------------------------------------------------------
MainView = Backbone.View.extend({
	el: "#container",
	events: {
		"click #filter_controls .selector_button": "clickFilter",
		"click #customization_controls .selector_button": "clickWeightingType",
		"click #customization_controls .buttonlink": "clickCustomize",
		"click #customization_controls_comparison .selector_button": "clickWeightingTypeComparison",
		"click #customization_controls_comparison .buttonlink": "clickComparisonEdit",
		"click .editor .button": "clickEditorButton",
		"click .editor .yearsource_button": "clickYearSourceButton",
	},
	initialize: function () {
		// Set the template
		this.template = _.template($("#mainTemplate").html());

		// App Data defines textual resources for the app
		this.appData = new AppData();
		this.appData.set("explainer", "<p>This app ranks the popularity of dozens of programming languages. You can filter them by listing only those most relevant to particular sectors, such as \“Web\” or \“embedded programming.\” Rankings are created by weighting and combining 12 metrics from 10 sources. We offer preset weightings—the default is our <em>IEEE Spectrum</em> ranking—but there are presets for those interested in what\'s trending or most looked for by employers. Don\'t like the defaults? Take complete control and create your own ranking by adjusting each metric\'s weighting yourself. To compare with previous year\'s data, add a comparison and then choose \“edit ranking,\” which will give you the option to compare with data from 2014 or 2015.<p>We take a pragmatic approach to how we classify languages into types like \“embedded\” or \“Web.\” Placement is based on typical use: For example, we are very impressed by those brave souls who have written Web servers completely in assembly code, but we don\'t categorize Assembly as a Web development language. (<a href='http://spectrum.ieee.org/ns/IEEE_TPL_2016/methods.html' target='_blank'>Read more about our method and sources</a>)<p>Once you\'ve had a chance to use the app, let us know your feedback using this <a href='https://docs.google.com/forms/d/1XxZRY5ZtwdMcg4jdqYytITmE46pk2s4JUy2sRYnhzqQ/viewform' target='_blank'>quick 2-minute survey</a>.");
	
		// Get the data for the app
		this.dataSources = new DataSources();
		this.languages_fetch = new Languages();
		this.languages = {};
		this.rankings_fetch = new Rankings();
		this.rankings = {};
		this.comparisonDataSources = new DataSources();

		this.filters = {"web": 1, "mobile": 1, "enterprise": 1, "embedded": 1};
		this.rowViews = new Array();
		this.dataSourceViews = new Array();

		this.editPanelType = "reweight";
		this.showComparison = false;
		this.weightingPreset = "ieee-spectrum";
		this.weightingPresetComparison = "ieee-spectrum";
		this.showFullRanking = true;
		this.dataYear = 2016;
		this.comparisonDataYear = 2016;

		// Here are the preset weightings
		// id 1 = Google (search)
		// id 2 = Google (trends)
		// id 3 = Github (active)
		// id 4 = Topsy
		// id 5 = Stack Overflow (?s)
		// id 6 = Reddit
		// id 7 = Career Builder
		// id 8 = Hacker News
		// id 10 = Dice
		// id 12 = Github (created)
		// id 12 = Stackoverflow (views)
		// id 14 = IEEE Xplore
		// TODO: edit the weight component for each of the preset rankings do whatever is deemed appropriate editorially
		this.ieeeSpectrumWeighting = [{"id": 1, "weight": 50, "isInIndex": 1}, {"id": 2, "weight": 50, "isInIndex": 1}, {"id": 3, "weight": 50, "isInIndex": 1}, {"id": 4, "weight": 20, "isInIndex": 1}, {"id": 5, "weight": 30, "isInIndex": 1}, {"id": 6, "weight": 20, "isInIndex": 1}, {"id": 7, "weight": 5, "isInIndex": 1}, {"id": 8, "weight": 20, "isInIndex": 1}, {"id": 10, "weight": 5, "isInIndex": 1}, {"id": 11, "weight": 30, "isInIndex": 1}, {"id": 12, "weight": 30, "isInIndex": 1}, {"id": 14, "weight": 100, "isInIndex": 1}];
		this.trendingWeighting = [{"id": 1, "weight": 5, "isInIndex": 1}, {"id": 2, "weight": 75, "isInIndex": 1}, {"id": 3, "weight": 50, "isInIndex": 1}, {"id": 4, "weight": 85, "isInIndex": 1}, {"id": 5, "weight": 50, "isInIndex": 1}, {"id": 6, "weight": 75, "isInIndex": 1}, {"id": 7, "weight": 20, "isInIndex": 1}, {"id": 8, "weight": 75, "isInIndex": 1}, {"id": 10, "weight": 20, "isInIndex": 1}, {"id": 11, "weight": 100, "isInIndex": 1}, {"id": 12, "weight": 75, "isInIndex": 1}, {"id": 14, "weight": 40, "isInIndex": 1}];
		this.jobsWeighting = [{"id": 1, "weight": 25, "isInIndex": 1}, {"id": 2, "weight": 25, "isInIndex": 1}, {"id": 3, "weight": 50, "isInIndex": 1}, {"id": 4, "weight": 25, "isInIndex": 1}, {"id": 5, "weight": 25, "isInIndex": 1}, {"id": 6, "weight": 25, "isInIndex": 1}, {"id": 7, "weight": 100, "isInIndex": 1}, {"id": 8, "weight": 25, "isInIndex": 1}, {"id": 10, "weight": 100, "isInIndex": 1}, {"id": 11, "weight": 25, "isInIndex": 1}, {"id": 12, "weight": 50, "isInIndex": 1}, {"id": 14, "weight": 40, "isInIndex": 1}];
		this.openWeighting = [{"id": 1, "weight": 30, "isInIndex": 1}, {"id": 2, "weight": 40, "isInIndex": 1}, {"id": 3, "weight": 100, "isInIndex": 1}, {"id": 4, "weight": 25, "isInIndex": 1}, {"id": 5, "weight": 75, "isInIndex": 1}, {"id": 6, "weight": 15, "isInIndex": 1}, {"id": 7, "weight": 15, "isInIndex": 1}, {"id": 8, "weight": 15, "isInIndex": 1}, {"id": 10, "weight": 15, "isInIndex": 1}, {"id": 11, "weight": 100, "isInIndex": 1}, {"id": 12, "weight": 75, "isInIndex": 1}, {"id": 14, "weight": 25, "isInIndex": 1}];
		this.customWeighting = [{"id": 1, "weight": 50, "isInIndex": 1}, {"id": 2, "weight": 50, "isInIndex": 1}, {"id": 3, "weight": 50, "isInIndex": 1}, {"id": 4, "weight": 50, "isInIndex": 1}, {"id": 5, "weight": 50, "isInIndex": 1}, {"id": 6, "weight": 50, "isInIndex": 1}, {"id": 7, "weight": 50, "isInIndex": 1}, {"id": 8, "weight": 50, "isInIndex": 1}, {"id": 10, "weight": 50, "isInIndex": 1}, {"id": 11, "weight": 50, "isInIndex": 1}, {"id": 12, "weight": 50, "isInIndex": 1}, {"id": 14, "weight": 50, "isInIndex": 1}];

		var this_ = this;
		
		// Get the data into the app
		this_.dataSources.fetch({
			success: function () {				
				// Set the default weighting to the ieee spectrum one
				this_.dataSources.add(this_.ieeeSpectrumWeighting, {merge: true});
				
				// Make a copy of the data sources to represent the comparison ranking
				this_.comparisonDataSources = new DataSources(this_.dataSources.toJSON());
				
				this_.languages_fetch.fetch({
					success: function () {
						// Basically give myself an array indexed by year to get a collection of languages for just that year
						this_.languages[2014] = new Languages(this_.languages_fetch.where({"included_2014": 1}));
						this_.languages[2015] = new Languages(this_.languages_fetch.where({"included_2015": 1}));
						this_.languages[2016] = new Languages(this_.languages_fetch.where({"included_2016": 1}));
						//console.log(this_.languages);
						this_.rankings_fetch.fetch({
							success: function (collection) {
								//console.log(collection)
								//console.log(this_.rankings_fetch.length)
								this_.rankings[2014] = new Rankings(this_.rankings_fetch.where({"year": 2014}));
								//console.log(this_.rankings[2014].length)
								this_.rankings[2015] = new Rankings(this_.rankings_fetch.where({"year": 2015}));
								//console.log(this_.rankings[2015].length)
								this_.rankings[2016] = new Rankings(this_.rankings_fetch.where({"year": 2016}));
								//console.log(this_.rankings[2016].length)

								// Start the history for the AppRouter
								Backbone.history.start(); 
								// Have all data, now render
								this_.render();
							}
						})
					}
				})
			}
		})
	},
	clickCustomize: function (e) {
		var type = $(e.currentTarget).data("type");
		// If you clicked comparison on a vertically oriented small screen then we tell you to rotate to see it
		if (type == "reweight")
		{
			this.editPanelType = type;
			this.renderEditPanel();
			this.uneditedDataSources = new DataSources(this.dataSources.toJSON());
			this.uneditedComparisonDataSources = new DataSources(this.comparisonDataSources.toJSON());
			this.uneditedDataYear = this.dataYear;
			this.uneditedComparisonDataYear = this.comparisonDataYear;
			this.$el.find(".editor").slideDown(500);
		}
		else if (type == "compare")
		{
		    var index = navigator.appVersion.indexOf("Mobile");   

			if (index>0){
				if (window.matchMedia("screen and (max-device-width: 568px) and (orientation: portrait)").matches) 
				{
					alert("Please rotate your device to see the comparison view.");
					return;
				}
			}
			this.showComparison = !this.showComparison;
			if (this.showComparison)
			{
				this.$el.find("#customization_controls_comparison").slideDown(200);
				this.$el.find("#customization_controls").find(".buttonlink[data-type='compare']").html("Remove Comparison");
				this.$el.find(".button[data-type='extend']").hide();
			}
			else
			{
				this.$el.find("#customization_controls_comparison").slideUp(200);
				this.$el.find("#customization_controls").find(".buttonlink[data-type='compare']").html("Add a Comparison");
				this.$el.find(".button[data-type='extend']").show();
			}
			this.updateRanking();
			window.appRouter.updateURL();
		}
	},
	clickComparisonEdit: function (e) {
		// The edit button for the comparison ranking was clicked
		this.editPanelType = "compare";
		this.renderEditPanel();
		this.uneditedDataSources = new DataSources(this.dataSources.toJSON());
		this.uneditedComparisonDataSources = new DataSources(this.comparisonDataSources.toJSON());
		this.uneditedDataYear = this.dataYear;
		this.uneditedComparisonDataYear = this.comparisonDataYear;
		this.$el.find(".editor").slideDown(500);
	},
	clickFilter: function (e) {
		// Sets a filter and updates the ranking
		var type = $(e.currentTarget).data("type");
		$(e.currentTarget).toggleClass("deselected");		
		//$(e.currentTarget).siblings().toggleClass("deselected");
		if($(e.currentTarget).hasClass("deselected"))
			this.filters[type] = 0;
		else
			this.filters[type] = 1;

		this.updateRanking();
		window.appRouter.updateURL();
	},
	clickWeightingType: function (e) {
		// Sets a filter and updates the ranking
		var type = $(e.currentTarget).data("type");
		$(e.currentTarget).toggleClass("deselected", false);
		$(e.currentTarget).siblings().toggleClass("deselected", true);
		this.weightingPreset = type;

		// Update the current data with the new weights
		if (type == "ieee-spectrum")
			this.dataSources.add(this.ieeeSpectrumWeighting, {merge: true});
		else if (type == "trending")
			this.dataSources.add(this.trendingWeighting, {merge: true});
		else if (type == "jobs")
			this.dataSources.add(this.jobsWeighting, {merge: true});
		else if (type == "open")
			this.dataSources.add(this.openWeighting, {merge: true});
		else if (type == "custom")
			this.dataSources.add(this.customWeighting, {merge: true});
		
		//console.log(this.dataSources.models)
		this.editPanelType = "reweight";
		this.renderEditPanel();

		// If they hit custom, then go directly to editing mode
		/*if (type == "custom")
		{
			this.uneditedDataSources = new DataSources(this.dataSources.toJSON());
			this.uneditedComparisonDataSources = new DataSources(this.comparisonDataSources.toJSON());
			this.$el.find(".editor").slideDown(500);
		}*/

		this.updateRanking();
		window.appRouter.updateURL();
	},
	clickWeightingTypeComparison: function (e) {
		// Sets a filter and updates the ranking
		var type = $(e.currentTarget).data("type");
		$(e.currentTarget).toggleClass("deselected", false);
		$(e.currentTarget).siblings().toggleClass("deselected", true);
		this.weightingPresetComparison = type;

		// Update the current data with the new weights
		if (type == "ieee-spectrum")
			this.comparisonDataSources.add(this.ieeeSpectrumWeighting, {merge: true});
		else if (type == "trending")
			this.comparisonDataSources.add(this.trendingWeighting, {merge: true});
		else if (type == "jobs")
			this.comparisonDataSources.add(this.jobsWeighting, {merge: true});
		else if (type == "open")
			this.comparisonDataSources.add(this.openWeighting, {merge: true});
		else if (type == "custom")
			this.comparisonDataSources.add(this.customWeighting, {merge: true});
		
		//console.log(this.dataSources.models)
		this.editPanelType = "compare";
		this.renderEditPanel();

		// If they hit custom, then go directly to editing mode
		/*if (type == "custom")
		{
			this.uneditedDataSources = new DataSources(this.dataSources.toJSON());
			this.uneditedComparisonDataSources = new DataSources(this.comparisonDataSources.toJSON());
			this.$el.find(".editor").slideDown(500);
		}*/

		this.updateRanking();
		window.appRouter.updateURL();
	},
	clickEditorButton: function (e) {
		// Switch on the type of button (which is stored as a data attribute)
		// Options: save, cancel, remove, or reset
		var type = $(e.currentTarget).data("type");
		if (type == "save")
		{
			var doSave = true;
			if (this.editPanelType == "reweight")
			{
				if (!_.contains(this.dataSources.pluck("isInIndex"), 1))
				{
					alert("You must have at least one data source selected.");
					doSave = false;
				}
			}
			else if (this.editPanelType == "compare")
			{
				if (!_.contains(this.comparisonDataSources.pluck("isInIndex"), 1))
				{
					alert("You must have at least one data source selected.");
					doSave = false;
				}
			}
			if (doSave)
			{				
				// Save as custom will set the preset to "custom"
				if (this.editPanelType == "reweight")
				{
					this.weightingPreset = "custom";
					this.customWeighting = this.dataSources.toJSON();
					$("#customization_controls").find(".selector_button").toggleClass("deselected", true);	
					$("#customization_controls").find(".selector_button[data-type='custom']").toggleClass("deselected", false);	
				}
				else if (this.editPanelType == "compare")
				{
					this.weightingPresetComparison = "custom";
					//this.customWeighting = this.dataSources.toJSON();
					$("#customization_controls_comparison").find(".selector_button").toggleClass("deselected", true);	
					$("#customization_controls_comparison").find(".selector_button[data-type='custom']").toggleClass("deselected", false);	
				}
				// recalculate the new ranking and update it			
				this.$el.find(".editor").slideUp(500);
				this.updateRanking();
				window.appRouter.updateURL();
			}
		}
		else if (type == "cancel")
		{
			// revert to our clone before editing
			if (this.editPanelType == "reweight")
			{
				this.dataSources = this.uneditedDataSources;	
				this.dataYear = this.uneditedDataYear;
			}
			else if (this.editPanelType == "compare")
			{
				this.comparisonDataSources = this.uneditedComparisonDataSources;
				this.comparisonDataYear = this.uneditedComparisonDataYear;
			}
			this.$el.find(".editor").slideUp(500);
		}
		/*else if (type == "reset")
		{
			// Set the weight and isInIndex fields to their defaults
			if (this.editPanelType == "reweight")
			{
				_.each(this.dataSources.models, function (m) {
					m.set("weight", 50);
					m.set("isInIndex", 1);
				}, this)
			}
			else if (this.editPanelType == "compare")
			{
				_.each(this.comparisonDataSources.models, function (m) {
					m.set("weight", 50);
					m.set("isInIndex", 1);
				}, this)
			}
			this.renderEditPanel();
		}*/
	},
	clickYearSourceButton: function (e) {
		var type = $(e.currentTarget).data("type");
		var year = $(e.currentTarget).data("year");
		this.$el.find(".yearsource_button").addClass("deselected");
		if (type == "dataYear")
		{
			this.dataYear = year;
			this.$el.find("[data-year='"+this.dataYear+"']").removeClass('deselected');
		}
		else if (type == "comparisonDataYear")
		{
			this.comparisonDataYear = year;
			this.$el.find("[data-year='"+this.comparisonDataYear+"']").removeClass('deselected');
		}
	},
	render: function () {
		
		// Empty it out and render the template
		this.$el.empty();
		this.$el.html(this.template(this.appData.toJSON()));

		// Add the link to the methods section
		// TODO: Change link to methods for final deploy
		//this.$el.find(".explainer").append("(<a href='methods.html' target='_blank'>Read about our method and sources</a>)")

		// Add in the controls from a template		
		this.$el.find("#customization_controls").append(_.template($("#customizationControls").html()));
		$("#customization_controls").find(".selector_button").toggleClass("deselected", true);	
		$("#customization_controls").find(".selector_button[data-type='"+this.weightingPreset+"']").toggleClass("deselected", false);	

		// Add in the controls from a template		
		this.$el.find("#customization_controls_comparison").append(_.template($("#customizationControlsComparison").html()));
		$("#customization_controls_comparison").find(".selector_button").toggleClass("deselected", true);	
		$("#customization_controls_comparison").find(".selector_button[data-type='"+this.weightingPresetComparison+"']").toggleClass("deselected", false);
		if (this.showComparison)
		{
			$("#customization_controls_comparison").show();
			this.$el.find("#customization_controls").find(".button[data-type='compare']").html("Remove Comparison");
			this.$el.find(".button[data-type='extend']").hide();

		}

		// Add in the controls from a template		
		this.$el.find("#filter_controls").append(_.template($("#languageFiltersTemplate").html()));
		$(".selector_button[data-type='web']").toggleClass("deselected", !this.filters["web"]);		
		$(".selector_button[data-type='mobile']").toggleClass("deselected", !this.filters["mobile"]);		
		$(".selector_button[data-type='enterprise']").toggleClass("deselected", !this.filters["enterprise"]);		
		$(".selector_button[data-type='embedded']").toggleClass("deselected", !this.filters["embedded"]);
		
		
		// No tool tips on mobile
		if (screen.width > 320)
			this.$el.find('.tip').tipr({'speed': 300, 'mode': 'top'});

		this.renderEditPanel();

		// Redraw the ranked list
		this.updateRanking();

		//console.log("rerender")
		// Set the default url from the tweet button
		$(".twitterbutton").attr("href", "https://twitter.com/intent/tweet?url="+document.URL + "&via=IEEESpectrum&text=Top Programming Languages")
		$(".facebookbutton").attr("href", "https://www.facebook.com/sharer/sharer.php?u="+document.URL);

		return this;
	},
	renderEditPanel: function() {
		this.$el.find(".editor").empty();
		if (this.editPanelType == "reweight")
		{
			// Text for edit panel
			this.$el.find(".editor").append("<div class='editor_text'>The ranking is calculated using 12 weighted data sources. Click a data source to toggle its inclusion in the ranking and drag its slider to reweight it.</div>");

			this.$el.find(".editor").append("<div class='year_buttons'><span class='year_text'>Use data from:</span><span class='yearsource_button deselected' style='margin-right: 5px;' data-year='2016' data-type='dataYear'>2016</span><span class='yearsource_button deselected' style='margin-right: 5px;' data-year='2015' data-type='dataYear'>2015</span><span class='yearsource_button deselected' data-year='2014' data-type='dataYear'>2014</span></div>");
			
			this.$el.find("[data-year='"+this.dataYear+"']").removeClass('deselected');

			// Add each of the sources
			_.each(this.dataSources.models, function (m) {
				var dsv = new DataSourceView({model: m})
				dsv.render();
				this.$el.find(".editor").append(dsv.$el);
			}, this);

			// And add the cancel save buttons
			this.$el.find(".editor").append("<div class='editor_buttons'><div class='button' style='float:right; margin-left: 5px; margin-left: 5px;' data-type='save'>Save as Custom</div><div class='button' style='float:right; ' data-type='cancel'>Cancel</div></div>"); //<div class='editor_button' data-type='reset'>Reset</div>
		}
		else
		{
			this.showComparison = true;

			// Text for compare panel
			this.$el.find(".editor").append("<div class='editor_text'>Compare a ranking. Click a data source to toggle its inclusion in the ranking and drag its slider to reweight it.</div>");

			this.$el.find(".editor").append("<div class='year_buttons'><span class='year_text'>Use data from:</span><span class='yearsource_button deselected' style='margin-right: 5px;' data-year='2016' data-type='comparisonDataYear'>2016</span><span class='yearsource_button deselected' style='margin-right: 5px;' data-year='2015' data-type='comparisonDataYear'>2015</span><span class='yearsource_button deselected' data-year='2014' data-type='comparisonDataYear'>2014</span></div>");
			this.$el.find("[data-year='"+this.comparisonDataYear+"']").removeClass('deselected');

			// Add each of the sources
			_.each(this.comparisonDataSources.models, function (m) {
				var dsv = new DataSourceView({model: m})
				dsv.render();
				this.$el.find(".editor").append(dsv.$el);
			}, this);

			// And add the cancel, remove, save buttons
			this.$el.find(".editor").append("<div class='editor_buttons'><div class='button' style='float:right; margin-left: 5px;' data-type='save'>Save as Custom</div><div class='button' style='float:right;' data-type='cancel'>Cancel</div></div>");
			
		}
	},
	updateRanking: function () {
		// Empty out the container for the rankings
		this.$el.find(".ranking").empty();
		    var index = navigator.appVersion.indexOf("Mobile");   
			if (index>0){
			if (window.matchMedia("screen and (max-device-width: 568px) and (orientation: portrait)").matches) {
			   this.showComparison = false;
			}
			}
		// Get a div reference of the ranking container
		var ranking_div = this.$el.find(".ranking");
		
		// get the label for the head rows
		var Label1 = "";
		var Label2 = "";
		if (this.weightingPreset == "ieee-spectrum") Label1 = "Spectrum Ranking";
		else if (this.weightingPreset == "trending") Label1 = "Trending Ranking";
		else if (this.weightingPreset == "jobs") Label1 = "Jobs Ranking";
		else if (this.weightingPreset == "open") Label1 = "Open Ranking";
		else if (this.weightingPreset == "custom") Label1 = "Custom Ranking";

		if (this.weightingPresetComparison == "ieee-spectrum") Label2 = "Spectrum Ranking";
		else if (this.weightingPresetComparison == "trending") Label2 = "Trending Ranking";
		else if (this.weightingPresetComparison == "jobs") Label2 = "Jobs Ranking";
		else if (this.weightingPresetComparison == "open") Label2 = "Open Ranking";
		else if (this.weightingPresetComparison == "custom") Label2 = "Custom Ranking";

		// Create the header row
		ranking_div.append("<div class='rank_row_header'><div class='rank_column section_label'>Language Rank</div><div class='type_column section_label'>Types</div><div class='score_index_column section_label'>"+Label1+"</div></div>");
		if (this.showComparison)
		{
			$(ranking_div).find(".score_index_column").addClass("narrow");
			$(ranking_div).find(".rank_row_header").append("<div class='score_graph'></div>");
			$(ranking_div).find(".rank_row_header").append("<div class='score_index_column section_label narrow'>"+Label2+"</div>")
		}

		// Compute the ranking
		var indexRanking = this.rankings[this.dataYear].computeIndexRank(this.languages[this.dataYear], this.dataSources);

		// An array to store each row as a view
		this.rowViews = new Array();
		// Add rows for each languaage
		var rank = 0;
		_.each(indexRanking, function (m, i) {
			var l = this.languages[this.dataYear].findWhere({id: m.get("language_id")});
			// Apply the filters
			if (l.get("web") && this.filters["web"] == 1 ||
				l.get("mobile") && this.filters["mobile"] == 1 || 
				l.get("enterprise") && this.filters["enterprise"] == 1 ||
				l.get("embedded") && this.filters["embedded"] == 1 )
			{
				
				var rv = new RowView({language_model: l, ranking_model: m, rank: rank, showComparison: this.showComparison, parentView: this});
				this.rowViews.push(rv);
				rv.render();
				ranking_div.append(rv.$el); 
				rv.$el.hide();
				rank++;
				

				// Hardcode filters to hide anything that's not a "data science language
				//if (["Python", "R", "SAS", "Julia", "Java", "Scala", "Matlab", "Go", "SQL"].indexOf(l.get("name")) == -1)
				//{
				//	rv.$el.addClass("row_fade")
				//}
			}

		}, this);




		// Only show they full list if in comparison mode
		if (this.showComparison)
		{
			// Animate in each row. On the last one call a callback to see if we need to then show the comparison column
			_.each(this.rowViews, function (rv, i) {
				if (i == this.rowViews.length-1)
					rv.$el.delay(10*i).fadeIn(100, showComparisonColumn);
				else
					rv.$el.delay(10*i).fadeIn(100);
			}, this)
		}
		else
		{
			_.each(this.rowViews, function (rv, i) {				
				if (this.showFullRanking)
					rv.$el.delay(10*i).fadeIn(100);
			}, this);
		}

		var this_ = this;
		// Function to draw the 2nd ranking column and draw the lines to compare to the 1st column
		function showComparisonColumn()
		{
			//console.log("show comp")
			//console.log(this_.showComparison)
			if (this_.showComparison)
			{
				// Compute a ranking for the comparison
				var comparisonRanking = this_.rankings[this_.comparisonDataYear].computeIndexRank(this_.languages[this_.comparisonDataYear], this_.comparisonDataSources);
				var rank = 0;
				_.each(comparisonRanking, function (m, i) {
					var l = this_.languages[this_.comparisonDataYear].findWhere({id: m.get("language_id")});	
					var l0 = this_.languages[this_.dataYear].findWhere({id: m.get("language_id")});	
					// variable to mark if a language is in the 2nd column but not the first, it should be grayed out
					var lang_excluded = 0;
					if (l0 == undefined)
						lang_excluded = 1;
					if (l.get("web") && this_.filters["web"] == 1 ||
						l.get("mobile") && this_.filters["mobile"] == 1 || 
						l.get("enterprise") && this_.filters["enterprise"] == 1 ||
						l.get("embedded") && this_.filters["embedded"] == 1 )
					{			
						// We cut it off based on the ranking in the 1st column
						//if (this_.rowViews[rank] != undefined)
						if (rank < this_.rowViews.length)	
						{	
							this_.rowViews[rank].addComparison(m, lang_excluded);
							rank++;
						}
					}

				}, this_);
				rank = this_.rowViews.length;
				
				//  compare_column_bar_gray

				// Create the linkages
				_.each(this_.rowViews, function (rv1, i1) {
					_.each(this_.rowViews, function (rv2, i2) {
						if (rv2.m2 != undefined)
						{
							var l2 = this_.languages[this_.comparisonDataYear].findWhere({id: rv2.m2.get("language_id")});	
											
							if(rv1.l.get("id") == l2.get("id"))
							{							
								rv1.rank2 = i2;
								rv1.view2 = rv2;							
							}
						}
					}, this_);
				}, this_);

				// Only render if we have more than 1 item in the ranking
				if (rank > 0)
				{
					// And add a floating div with an SVG
					var row_header_height = $(ranking_div).find(".rank_row_header").height();			
					var ranking_area_height = $(ranking_div).height();		
					
					$(ranking_div).append("<div class='comparison_column_div' style='top: "+(row_header_height+1)+"px; height: "+(ranking_area_height-row_header_height-2)+"px;'><svg></svg></div>")
					
					var row_height = $(ranking_div).find(".rank_row").height();
					
					var column_width = 50;
					var vscale = d3.scale.linear().domain([0,rank-1]).range([0, ranking_area_height - row_header_height - row_height - 1]);
					var hscale = d3.scale.linear().domain([0,1]).range([0, column_width]);
					
					var svg = d3.select(this_.el).select(".comparison_column_div svg");
					
					var line = d3.svg.line()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
						.interpolate("basis");

					var _this = this_;
					// Draw the connectors and connecting areas
					for (var i = 0; i < rank; i++)
					{
						if (this_.rowViews[i].rank2 != undefined)
						{

							//Draw a curved line connecting the rows
							svg.append("path")  
								.attr("d", line([{x: hscale(0), y: vscale(this_.rowViews[i].rank) + row_height / 2}, 
												 {x: hscale(.25), y: vscale(this_.rowViews[i].rank) + row_height / 2},
												 {x: hscale(.75), y: vscale(this_.rowViews[i].rank2) + row_height / 2},
												 {x: hscale(1), y: vscale(this_.rowViews[i].rank2) + row_height / 2},]))
								.attr("class", "comparison_line")

							//if (this_.rowViews[i].rank == 16)
							//	console.log(this_.rowViews[i])
							// A shaded area connecting the two rows.
							svg.append("path")  
								.attr("d", line([{x: hscale(0), y: vscale(this_.rowViews[i].rank) + .5 }, 
												 {x: hscale(.25), y: vscale(this_.rowViews[i].rank) + .5 },
												 {x: hscale(.75), y: vscale(this_.rowViews[i].rank2) + .5},
												 {x: hscale(1)+1, y: vscale(this_.rowViews[i].rank2) + .5},
												 {x: hscale(1)+1, y: vscale(this_.rowViews[i].rank2) + .5 },
												 {x: hscale(1)+1, y: vscale(this_.rowViews[i].rank2) + row_height - .5}, 
												 {x: hscale(1)+1, y: vscale(this_.rowViews[i].rank2) + row_height - .5}, 
												 {x: hscale(.75), y: vscale(this_.rowViews[i].rank2) + row_height - .5},
												 {x: hscale(.25), y: vscale(this_.rowViews[i].rank) + row_height - .5},
												 {x: hscale(0), y: vscale(this_.rowViews[i].rank) + row_height - .5}]))
								.attr("class", "comparison_area")

							// The text that says how much up or down the ranking went
							svg.append("text")
								.attr("x", hscale(0)+2)
								.attr("y", vscale(this_.rowViews[i].rank)+ row_height / 2 + 4)
								.text(function (d) { 
									if (_this.rowViews[i].rank - _this.rowViews[i].rank2 != 0)
										if (_this.rowViews[i].rank - _this.rowViews[i].rank2 > 0)
											return "(+"+(_this.rowViews[i].rank - _this.rowViews[i].rank2)+")"; 
										else
											return "("+(_this.rowViews[i].rank - _this.rowViews[i].rank2)+")"; 
									else 
										return "";
								})
								.attr("class", "rank_change_label")
						}
						else // This is just a placeholder, but it's empty
						{
							svg.append("path")  
								.attr("d", line([{x: hscale(0), y: vscale(0)}, {x: hscale(0), y: vscale(0)}]))								
								.attr("class", "comparison_line")

							// A shaded area connecting the two rows.
							svg.append("path")  
								.attr("d", line([{x: hscale(0), y: vscale(0)}, {x: hscale(0), y: vscale(0)}]))		
								.attr("class", "comparison_area")

							// The text that says how much up or down the ranking went
							svg.append("text")
								.attr("x", hscale(0))
								.attr("y", vscale(0))
								.text(function (d) { 									
										return "";
								})
								.attr("class", "rank_change_label")
						}
						
					}
				}
			}
		}
	},
	updateOrientation: function () {
		this.renderEditPanel();
		this.updateRanking();
	}
});


// ---------------------------------------------------------------------------------------
// Row view is a rendering of a single row of the ranking. 
// ---------------------------------------------------------------------------------------
RowView = Backbone.View.extend ({
	tagName: "div",
	className: "rank_row",
	events: {
		"click": "clickRow",
	},
	initialize: function (options) {
		this.l = options.language_model;
		this.m = options.ranking_model;
		this.rank = options.rank;
		this.showComparison = options.showComparison;
		this.isSelected = false;
		this.parentView = options.parentView;
	},
	clickRow: function (e) {
		if (!this.showComparison)
		{
			// Either show or hide the context text for the language
			$(e.currentTarget).find(".context_row").slideToggle(300);
		}
		else
		{
			// Go through all the rows (via the parent) and unhighlight them
			_.each(this.parentView.rowViews, function (rv) {				
				if (rv != this)
				{
					rv.isSelected = false;
					rv.highlightRow();
				}
			}, this)

			// Now deal with the current row
			this.isSelected = !this.isSelected;
			this.highlightRow();
		}
	},
	highlightRow: function () {
		// Highlight the row for a comparison
		if (this.view2 != undefined)
		{
			this.$el.find(".score_index_column:eq(0)").toggleClass("highlighted", this.isSelected);
			this.$el.find(".score_index_bar:eq(0)").toggleClass("highlighted", this.isSelected);
			this.$el.find(".type_column").toggleClass("highlighted", this.isSelected);
			this.$el.find(".rank_column").toggleClass("highlighted", this.isSelected);		
			this.view2.$el.find(".score_index_column:eq(1)").toggleClass("highlighted", this.isSelected);
			this.view2.$el.find(".score_index_bar:eq(1)").toggleClass("highlighted", this.isSelected);
			var _this = this;
			d3.select(".comparison_column_div svg").selectAll(".comparison_line").classed("demphasize", function (d, i) {
				if (i == _this.rank)
					return _this.isSelected;
				else
					if (_this.isSelected == false)
						return false;			
					else
						return true;
			});
			$(".comparison_column_div").find(".comparison_area:eq("+this.rank+")").toggle(this.isSelected);
			$(".comparison_column_div").find(".rank_change_label:eq("+this.rank+")").toggle(this.isSelected);
		}
	},
	addComparison: function (m2, lang_excluded)
	{
		// Add a comparison to another ranking
		this.m2 = m2;
		
		this.$el.find(".score_index_column").after("<div class='score_index_column narrow'></div>");
		this.$el.find(".score_index_column:eq(0)").after("<div class='score_graph'></div>");
		//if (!lang_excluded)
			this.$el.find(".score_index_column:eq(1)").append("<div class='score_index_bar compare_column_bar'><span class='score_index_bar_text'>"+this.m2.get("value").toFixed(1)+"</span></div>");
		//else
		//	this.$el.find(".score_index_column:eq(1)").append("<div class='score_index_bar compare_column_bar compare_column_bar_gray'><span class='score_index_bar_text score_index_bar_text_gray'>"+this.m2.get("value").toFixed(1)+"</span></div>");
		var hscale = d3.scale.linear().domain([0,100]).range([0, 100]);
		this.$el.find(".score_index_bar:eq(1)").innerWidth(hscale(this.m2.get("value"))+"%");
		//this.render();
	},
	render: function () {
		// Render the row
		this.$el.append("<div class='rank_column'><div class='rank'>"+(this.rank+1)+".</div><span class='language'>"+this.l.get("name")+"</span></div><div class='type_column'><div class='type_icon'></div><div class='type_icon'></div><div class='type_icon'></div><div class='type_icon'></div></div><div class='score_index_column'></div><div class='context_row' style='display: none;'>"+this.l.get("context")+"</div>")
		
		// Use higher res icons for the mobile version (these showed rescaling artifacts on desktop, which is why i scale to a native size)
		if (screen.width == 320)
		{
			// Add in the appropriate icons
			if(this.l.get("web"))
				this.$el.find(".type_icon:eq(0)").append("<img src='http://spectrum.ieee.org/ns/IEEE_TPL/img/web_lg.png'></img>")				
			if(this.l.get("mobile"))
				this.$el.find(".type_icon:eq(1)").append("<img src='http://spectrum.ieee.org/ns/IEEE_TPL/img/mobile_lg.png'></img>")
			if(this.l.get("enterprise"))
				this.$el.find(".type_icon:eq(2)").append("<img src='http://spectrum.ieee.org/ns/IEEE_TPL/img/enterprise_lg.png'></img>")
			if(this.l.get("embedded"))
				this.$el.find(".type_icon:eq(3)").append("<img src='http://spectrum.ieee.org/ns/IEEE_TPL/img/embedded_lg.png'></img>")
		}
		else
		{
			if(this.l.get("web"))
				this.$el.find(".type_icon:eq(0)").append("<img src='http://spectrum.ieee.org/ns/IEEE_TPL/img/web_mini.png'></img>")				
			if(this.l.get("mobile"))
				this.$el.find(".type_icon:eq(1)").append("<img src='http://spectrum.ieee.org/ns/IEEE_TPL/img/mobile_mini.png'></img>")
			if(this.l.get("enterprise"))
				this.$el.find(".type_icon:eq(2)").append("<img src='http://spectrum.ieee.org/ns/IEEE_TPL/img/enterprise_mini.png'></img>")
			if(this.l.get("embedded"))
				this.$el.find(".type_icon:eq(3)").append("<img src='http://spectrum.ieee.org/ns/IEEE_TPL/img/embedded_mini.png'></img>")
		}
				
		var hscale = d3.scale.linear().domain([0,100]).range([0, 100]);
		
		this.$el.find(".score_index_column:eq(0)").append("<div class='score_index_bar'><span class='score_index_bar_text'>"+this.m.get("value").toFixed(1)+"</span></div>");
		this.$el.find(".score_index_bar:eq(0)").innerWidth(hscale(this.m.get("value"))+"%");

		// Resize bar and add in 2nd bar if showing a comparison
		if (this.showComparison)
		{
			this.$el.find(".score_index_column").addClass("narrow");
		}

		return this;
	}
});

		
// ---------------------------------------------------------------------------------------
// DataSourceView renders one of the data sources in the edit panel, including the slider
// ---------------------------------------------------------------------------------------
DataSourceView = Backbone.View.extend ({
	tagName: "div",
	className: "datasource_row",
	events: {
		"click .datasource_button": "clickButton",
	},
	clickButton: function (e) {
		// Select or deselect data source for inclusion in index
		$(e.currentTarget).toggleClass("deselected");
		this.model.set("isInIndex", +!this.model.get("isInIndex"));
		
		// Update the deselected classes
		d3.select(this.el).select(".handle").classed("deselected", !this.model.get("isInIndex"))
		d3.select(this.el).select(".datasource_slider_axis").classed("deselected", !this.model.get("isInIndex"));
		d3.select(this.el).select(".weight_label").classed("deselected", !this.model.get("isInIndex"));
	},
	render: function () {
		var height = 25;
		var r = 7.5;
		var minX = 8;
		var maxX = 100;
		var textX = 109;
		var textYOffset = 4;

		// Resize things for mobile
		if (screen.width == 320)
		{
			height = 25;
			r = 10;
			minX = 10;
			maxX = 96;
			textX = 106;
			textYOffset = 4;
		}
		
		// Get the weighting for this data source. 
		var weight = this.model.get("weight");

		// Add the button and div with an SVG for the slider
		this.$el.append("<div class='datasource_button tip' data-tip='"+this.model.get("data_semantics")+"'>"+this.model.get("display_name")+"</div>");
		// Add the tooltip
		if (screen.width > 320)
			this.$el.find('.tip').tipr({'speed': 300, 'mode': 'top'});

		this.$el.append("<div class='datasource_slider_div'><svg></svg></div>");
		var svg = d3.select(this.el).select("svg");
		
		var x = d3.scale.linear().domain([0,100]).range([minX,maxX]).clamp(true);
		var line_offset = height / 2 + 1;
		svg.append("line")
			.attr("class", "datasource_slider_axis")
			.attr("transform", "translate(0," + line_offset + ")")
			.attr("x1", x(1))
			.attr("y1", 0)
			.attr("x2", x(maxX))
			.attr("y2", 0)

		// Weighting text
		var text = svg.append("text")
		 	.attr("x", textX)
		  	.attr("y", height / 2 + textYOffset)		
		  	.text(weight.toFixed(0))	  	
		  	.attr("class", "weight_label")

		var _this = this;
		// Create a brush that serves to handle the slider updates
		var brush = d3.svg.brush().x(x).extent([weight,weight]).on("brush", function () {
				var value = brush.extent()[0];

			    if (d3.event.sourceEvent) { // not a programmatic event
			        value = x.invert(d3.mouse(this)[0]);
			        brush.extent([value, value]);

			        // If the weight goes to zero then set it to deselected, or if it's above zero then re-enable the control
				    if (_this.model.get("weight") == 0)
				    	_this.model.set("isInIndex", 0);
				    else
				    	_this.model.set("isInIndex", 1);
			    }

			    handle.attr("cx", x(value));	

			    // update text label
			    text.text(Math.round(value));

			    // update model
			    _this.model.set("weight", Math.round(value));

			    

			    // Set the appropriate styles on the button and slider
			    $(_this.el).find(".datasource_button").toggleClass("deselected", !_this.model.get("isInIndex"));
				d3.select(_this.el).select(".handle").classed("deselected", !_this.model.get("isInIndex"))
				d3.select(_this.el).select(".datasource_slider_axis").classed("deselected", !_this.model.get("isInIndex"));
				d3.select(_this.el).select(".weight_label").classed("deselected", !_this.model.get("isInIndex"));

		});

		// Add the slider and handle, with the brush above. 
		var slider = svg.append("g").attr("class", "datasource_slider").call(brush);
		slider.selectAll(".extent,.resize").remove();
		slider.select(".background").attr("height", height);
		
		var handle = slider.append("circle")
		    .attr("class", "handle")
		    .attr("r", r)
		    .attr("cy", height / 2 + 1)
		slider.call(brush.event)
		
		// Update classes if button is deselected
		if (!this.model.get("isInIndex"))
		{
			this.$el.find(".datasource_button").addClass("deselected");
			d3.select(this.el).select(".handle").classed("deselected", !this.model.get("isInIndex"))
			d3.select(this.el).select(".datasource_slider_axis").classed("deselected", !this.model.get("isInIndex"));
			d3.select(this.el).select(".weight_label").classed("deselected", !this.model.get("isInIndex"));
		}

		return this;
	}
});		
			


				
