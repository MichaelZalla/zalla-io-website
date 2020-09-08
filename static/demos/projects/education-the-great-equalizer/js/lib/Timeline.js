var Timeline = function(timeline_year_list, timeline_prev, timeline_next) {

	var current_year = null,
		years = [ ],
		callbacks = [ ];

	var executeCallbacks = function(year) {
			for(var i in callbacks) {
				callbacks[i](year);
			}
		},

		addOnYearChangeCallback = function(callback_fn) {
			callbacks.push(callback_fn);
		},

		onPrevClick = function(e) {
			if(current_year != years[0]) {
				//Roll the 'current' year back by one item and execute any callbacks
				current_year = years[years.indexOf(current_year) - 1];
				executeCallbacks(current_year);
			}
		},

		onNextClick = function(e) {
			if(current_year != years[years.length - 1]) {
				//Move the 'current' year forward by one item and execute any callbacks
				current_year = years[years.indexOf(current_year) + 1];
				executeCallbacks(current_year);
			}
		};

	//Populate the years list with the numerical years contained within the DOM list
	timeline_year_list.find('.timeline-year').each(function(i, elem) {
		var year_value = parseInt($(elem).find('span').text());
		years.push(year_value);
	});
	//Set the initial current_year to the first available year
	current_year = years[0];

	//Set up event listeners for timeline navigation
	timeline_prev.on("click", onPrevClick);
	timeline_next.on("click", onNextClick);
	$('.timeline-year').each(function(i, elem) {
		$(elem).on("click", function(e) {
			//Move the 'current year' to the year that was clicked on
			var targeted_year = parseInt($(elem).find('span').text());
			current_year = years[years.indexOf(targeted_year)];
			executeCallbacks(current_year);
		})
	});


	return {
		addOnYearChangeCallback: addOnYearChangeCallback
	}

};