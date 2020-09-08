function resolveJSONRequest(request, callback) {
	/**
	 * The most versatile way of loading data into the browser is using an XMLHttpRequest,
	 * or XHR. This allows the data to be loaded asynchronously. D3's xhr module simplifies
	 * loading and parsing data. Code that depends on the loaded data should generally
	 * exist within the callback function. You may find it convenient to save the loaded
	 * data to the global namespace, so that you can still access it after the initial
	 * render. You can do this using closures, or by simply assigning it to a global variable.
	 */
	d3.json(request, function(error, response) {
		if(!error) {
			callback(response);
		} else {
			console.warn(error);
			console.warn("Error: Failed attempt to retrieve JSON data through an asynchronous XMLHttpRequest.");
		}
	});
}

var C_DATA,
	C_INFO;

var USER_CONFIG = { };
	USER_CONFIG['current_year'] = '';
	USER_CONFIG['current_statistic'] = '';
	USER_CONFIG['visible_countries'] = [ ];

function initializeTimeline() {
	//Collect a list of all years present in the data
	var years = [ ];
	for(var year in C_DATA) {
		years.push(year);
	}
	//Set up the timeline behavior
	var timeline_year_list = $('.timeline-year-list'),
		timeline_prev = $('.timeline-arrow.prev'),
		timeline_next = $('.timeline-arrow.next');
	//Populate the years in the timeline using the data
	for(var i in years) {
		var year_elem = $('<li class="timeline-year">');
		var year_span = $('<span>').text(years[i]);
			year_span.appendTo(year_elem);
		year_elem.appendTo(timeline_year_list);
	}
	//Set up the initial state of the timeline (appearance and config value)
	$('.timeline-year').first().addClass('active');
	USER_CONFIG['current_year'] = years[0];
	//Create a new Timeline object to control the timeline's behavior
	var timeline = new Timeline(timeline_year_list, timeline_prev, timeline_next);
		//Give the timeline a function to call with each change in current year
		timeline.addOnYearChangeCallback(function(year) {
			//Update the config with the newly selected year
			USER_CONFIG['current_year'] = year;
			//Update the timeline's visual appearance (update the 'active' item)
			$('.timeline-year').removeClass('active');
			$('.timeline-year').each(function(i, elem) {
				var year_value = parseInt($(elem).find('span').text());
				$(elem).addClass((year_value == year) ? 'active' : '');
			});
		});
}

function onCountryToggleMouseover(e) {
	var item = $(e.currentTarget);
	var hoverLabel = $('.country-current-hover');
	var cc = parseInt(item.attr('data-country-code'));
	//Determine whether the label should appear 'visible'
	var visible = false;
	for(var i in USER_CONFIG['visible_countries']) {
		if(USER_CONFIG['visible_countries'][i] == cc) {
			visible = true;
		}
	}
	//Update the current hover label
	var name = C_INFO[cc]['name'];
	hoverLabel.find('span').text(name);
	if(visible) {
		hoverLabel.addClass('visible');
		//Update the associated plot node
		var node = d3.select('g[data-country-code="' + cc + '"]');
			node.classed('active', true);
	}
	else {
		hoverLabel.removeClass('visible');
	}
}

function onCountryToggleMouseout(e) {
	var item = $(e.currentTarget);
	var cc = parseInt(item.attr('data-country-code'));
	var node = d3.select('g[data-country-code="' + cc + '"]');
		node.classed('active', false);
}

function onCountryToggleClick(e) {
	var item = $(e.currentTarget);
	var cc = parseInt(item.attr('data-country-code'));
	//Select the corresponding data point using d3.select
	var node = d3.select('g[data-country-code="' + cc + '"]');
	var i = USER_CONFIG['visible_countries'].indexOf(cc);
	//If the country was previously visible
	if(i > -1) {
		//Remove the country from list of 'visible' countries
		USER_CONFIG['visible_countries'].splice(i, 1);
		item.removeClass('visible');
		//Fade out the associated plot node (point and path)
		node.classed('visible', false)
			.transition()
				.delay(600)
				.duration(0)
				.each("end", function() {
					d3.select(this).style('display', 'none');
				});
	} else {
		//Add the country to the list of 'visible' countries
		USER_CONFIG['visible_countries'].push(cc);
		item.addClass('visible');
		//Fade in the associated plot node (point and path)
		node.style('display', 'inline')
			.classed('visible', true)
	}
	//Simulate a mouseover to update the label's opacity
	item.mouseover();
}

function initializeCountryToggles() {
	var country_selection_list = $('.country-selection-list');
	for(var cc in C_INFO) {
		//Add this country (code) to USER_CONFIG['visible_countries']
		//Create a toggle item for the country and add it to the toggle list
		var country_toggle = $('<li class="country-selection-toggle">');
			//country_toggle.addClass('circle-grey-2');
			//Override background with flag source
			country_toggle.css({
				'background-color': '',
				'background-image': 'url(' + C_INFO[cc]['flag-src'] + ')',
			})
	 		country_toggle.attr('data-country-code', cc);
			//Set up a click listener for each toggle item
			country_toggle.on('click', onCountryToggleClick);
			country_toggle.on('mouseover', onCountryToggleMouseover);
			country_toggle.on('mouseout', onCountryToggleMouseout);
			country_toggle.appendTo(country_selection_list);
	}
}

function onDataLoaded() {

	initializeTimeline();
	initializeCountryToggles();

	//Inject visual bar indicators into menus
	vs_indicator = $('<div class="menu-indicator">');
	vs_indicator.css('left', '-40px');
	vs_indicator.prependTo($('.visualizations-selector-menu'));
	ps_indicator = $('<div class="menu-indicator">');
	ps_indicator.css('left', '-20px');
	ps_indicator.prependTo($('.provided-selections-menu'));

	//Instantiate menus (these will cause the visualization to render)
	vs_menu = new RevealingMenu($('.visualizations-selector-menu'),
								on_vs_menu_mouseover,
								on_vs_menu_mouseclick,
								true);

	ps_menu = new RevealingMenu($('.provided-selections-menu'),
								on_ps_menu_mouseover,
								on_ps_menu_mouseclick,
								false);

	//Iterate over the country data and add in a few necessary fields
	for(var year in C_DATA) {
		for(var cc in C_DATA[year]) {
			var item = C_DATA[year][cc];
				//Add the year and country code
				item['YEAR'] = year;
				item['COUNTRY_CODE'] = cc;
				//Calculate the female tertiary enrollment percentage
				item['FEMALE_TERTIARY_ENROLLMENT_PERCENTAGE'] =
					(parseFloat(item['FEMALE_TERTIARY_ENROLLMENT'] /
							    item['FEMALE_POPULATION']) * 100).toFixed(3).toString();
				//Calculate the percentage of young (15-24) mothers
				item['YOUNG_MOTHERS_PERCENTAGE'] =
					(parseFloat(item['BIRTHS_BY_YOUNG_MOTHERS'] /
								item['FEMALE_POPULATION']) * 100).toFixed(3).toString();
				//Remove unnecessary fields
				delete item['FEMALE_TERTIARY_ENROLLMENT'];
				delete item['BIRTHS_BY_YOUNG_MOTHERS'];
				delete item['FEMALE_POPULATION'];
		}
	}

	//Instantiate the scatter plot inside of the canvas container
	//The document will be 'ready' by the time we do this
	
	//We'll pass ALL of our data to the ScatterPlot, but it will only use
	//a subset of this data for each render
	//vis = new ScatterPlot($('.canvas-container'), 810, 298, C_DATA);
	vis = new ScatterPlot($('.canvas-container'), 810, 308, C_DATA);

	//Initial rendering of the scatter plot
	vis.update(USER_CONFIG);

	//Store a copy of the USER_CONFIG between ticks. Here's the initial cache.
	var cache = $.extend({ }, USER_CONFIG);

	var updateIntervalId = null;

	function tick() {
		//Check for new config values. Because USER_CONFIG is a simple object, we
		// can skip deep comparison by comparing two JSON strings (for small-scale objects,
		// this is an acceptable solution)
		var cache_json = JSON.stringify(cache),
			config_json = JSON.stringify(USER_CONFIG),
			//Timeline years increment by 5
			year_interval = 5;
		//Compare the cache with the current config object		
		if(cache_json != config_json) {
			var old_year = parseInt(cache['current_year']),
				new_year = parseInt(USER_CONFIG['current_year']);
			//Reset old_year if the statistic being viewed has changed
			if(cache['current_statistic'] != USER_CONFIG['current_statistic']) {
				old_year = 1980;
			}
			//Calculate the time difference
			var delta = (new_year - old_year) / year_interval;
			if(!delta) {
				//The year hasn't changed in the config, so just call
				//ScatterPlot::update once
				vis.update(USER_CONFIG);
			} else {
				//Re-render the scatter plot, incrementing or decrementing the year
				//until the final (updated) year has been reached
				//Clear any existing interval to prevent conflicting render updates
				window.clearInterval(updateIntervalId);
				var step = delta / Math.abs(delta); //(+1) or (-1)
				updateIntervalId = window.setInterval(function() {
					delta -= step;
					//Create an intermediary config whose 'current_year' will update over time
					var temp_config = $.extend({ }, USER_CONFIG);
						temp_config['current_year'] = new_year - (delta * year_interval);
					//Call ScatterPlot::update
					vis.update(temp_config);
					if(!Math.abs(delta)) { window.clearInterval(updateIntervalId); }
				}, 600); //Should be at least as long as each render update takes (600ms)
			}
			//Update the cache
			cache = $.extend({ }, USER_CONFIG);
		}
	}

	//Our application's 'tick' method. This is pretty poor in practice.
	//An event-driven solution would be much more elegant
	window.setInterval(tick, 50);

}

/*** Chained data requests (application entry point) ***/

$(document).ready(function() {
	var res = { };
	resolveJSONRequest("data/country_info.json", function(response) {
		C_INFO = response;
		resolveJSONRequest("data/country_data.json", function(response) {
			C_DATA = response;
			onDataLoaded();
		});
	});
});
