var ss,
	trigger_prev_slide,
	trigger_next_slide;

/*
function updateWrapperHeight() {
	console.log($(ss.getCurrentSlideElem()));
	var slide_height = $(ss.getCurrentSlideElem()).outerHeight() + 'px';
	console.log(slide_height);
	$('.slides-wrapper').css({
		'height': slide_height
	});
}
*/

var onTriggerClick = function(e) {
	//Determine what the user asked to do
	if(e.currentTarget == trigger_prev_slide[0]) {
		ss.prev(function() {
			//Handle 'locking' of navigation buttons
			if(ss.getPrevSlidesCount() == 0) {
				trigger_prev_slide.addClass('locked');
			}
			trigger_next_slide.removeClass('locked');
			//Update the wrapper's height to match the height of the new slide
			//updateWrapperHeight();
		});
	} else {
		//We can safely assume that the 'next' button was clicked
		ss.next(function() {
			//Handle 'locking' of navigation buttons
			if(ss.getNextSlidesCount() == 0) {
				trigger_next_slide.addClass('locked');
			}
			trigger_prev_slide.removeClass('locked');
			//Update the wrapper's height to match the height of the new slide
			//updateWrapperHeight();
		});
	}
};

$(document).ready(function(){
	//Transition time must match transition time values in stylesheets
	ss = new Slideshow($('.slide'), 750);
	//Update the slide wrapper's height to accomodate for the first slide
	//updateWrapperHeight();
	//Set up event listeners for slideshow triggers
	trigger_prev_slide = $('#nav_trigger_prev');
	trigger_prev_slide.addClass('locked');
	trigger_prev_slide.on('click', onTriggerClick);
	trigger_next_slide = $('#nav_trigger_next');
	trigger_next_slide.on('click', onTriggerClick)
});
