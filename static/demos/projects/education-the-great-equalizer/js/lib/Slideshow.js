var Slideshow = function(slides, transition_time) {

	var slides = slides,
		current_slide_index = 0,
		transitioning = false,
		//Default parameter values
		transition_time = transition_time || 750;

	var slide_count = slides.length;

	if(slide_count == 0) {
		throw "Error: Attempt to instantiate new Slideshow object with empty slide list!";
		return null;
	}

	var msToSeconds = function(ms) {
			return (parseFloat(ms) / 1000) + 's';
		},

		getPrevIndex = function() {
			if(current_slide_index > 0) {
				return current_slide_index - 1;
			} else {
				//return slide_count - 1;
				//No 'infinite transitions'
				return 0;
			}
		},

		getNextIndex = function() {
			if(current_slide_index < slide_count - 1) {
				return current_slide_index + 1;
			} else {
				//return 0;
				//No 'infinite transitions'
				return slide_count - 1;
			}
		},

		getCurrentSlideElem = function() {
			return slides[current_slide_index];
		},

		getPrevSlidesCount = function() {
			//If current_slide_index = 4, then there are four slides before it
			return current_slide_index;
		},

		getNextSlidesCount = function() {
			return (slide_count - 1) - current_slide_index;
		},

		toggleCSSTransitions = function() {
			var current_transitions = slides.css('transition');
			if(current_transitions == '') {
				slides.css({
					'-webkit-transition': 'left ' + msToSeconds(transition_time),
			     	   '-moz-transition': 'left ' + msToSeconds(transition_time),
					        'transition': 'left ' + msToSeconds(transition_time),
				});
			} else {
				slides.css({
					'-webkit-transition': '',
			     	   '-moz-transition': '',
					        'transition': '',
				});
			}
		},

		prev = function(callback) {
			//NOP if a slide transition is currently happening already
			if(!transitioning) {
				//Allow optional callback argument for 'chaining' transitions
				var new_slide_index = getPrevIndex();
				//Check whether anything needs to happen
				if(new_slide_index != current_slide_index) {
					transitioning = true;
					//Move the 'old' slide off the screen to the right
					var current_slide = $(slides[current_slide_index]);
						current_slide.css({
							'left': '100%'
						});
					//Move the 'new' slide onto the screen from the left
					var new_slide = $(slides[new_slide_index]);
						new_slide.css({
							'left': '0px'
						});
					//After the appropriate amount of time, update the current_slide_index
					//as well as the transitioning boolean
					var callback = callback || function() { };
					window.setTimeout(function() {
						current_slide_index = new_slide_index;
						transitioning = false;
						callback();
					}, transition_time);
				}
			}
		},

		next = function(callback) {
			//NOP if a slide transition is currently happening already
			if(!transitioning) {
				//Allow optional callback argument for 'chaining' transitions
				var new_slide_index = getNextIndex();
				if(new_slide_index != current_slide_index) {
					transitioning = true;
					//Move the 'old' slide off the screen to the left
					var current_slide = $(slides[current_slide_index]);
						current_slide.css({
							'left': '-100%'
						});
					//Move the 'new' slide onto the screen from the right
					var new_slide = $(slides[new_slide_index]);
						new_slide.css({
							'left': '0px'
						});
					//After the appropriate amount of time, update the current_slide_index
					//as well as the transitioning boolean
					var callback = callback || function() { };
					window.setTimeout(function() {
						current_slide_index = new_slide_index;
						transitioning = false;
						callback();
					}, transition_time);
				}
			}
		};

	//Initial slide setup and styling
	slides.each(function(i, slide) {
		var width = $(slide).width();
		$(slide).css({
			'position': 'absolute',
			//This requires that the slides' parent element have an explicitly-defined width
			'left': '100%',
			//The left move should execute before applying the transition styles .. fix this?
			'-webkit-transition': 'left ' + msToSeconds(transition_time),
	     	   '-moz-transition': 'left ' + msToSeconds(transition_time),
			        'transition': 'left ' + msToSeconds(transition_time),
		});
		//Move the initial slide on-screen
		if(i == current_slide_index) {
			$(slide).css({
				'left': '0px'
			});
		}
	});

	//Public interface
	return {
		//We need to explore the slidesCount functions so that the callback
		//functions for Slideshow::prev and Slideshow::next can be parsed correctly
		getCurrentSlideElem: getCurrentSlideElem,
		getPrevSlidesCount: getPrevSlidesCount,
		getNextSlidesCount: getNextSlidesCount,
		prev: prev,
		next: next,
	}

}