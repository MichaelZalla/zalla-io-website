$(function() {
		
	// Set up an event listener for menu screen transitions
	// Parent element wraps the hamburger menu's pseudo-elements
	$('.ss-header-navigation-toggle').parent().on('click', function(e) {
		$('.ss-header-navigation').toggleClass('expanded');
	});

	// ScrollIt

	$('header').addClass('mimimal');

	$.scrollIt({
		easing: 'linear',
		scrollTime: 500,
		activeClass: 'active',
		// topOffset: -1 * $('header').outerHeight()
		topOffset: -68
	});

	$('header').removeClass('mimimal');

	// Waypoints (dynamic fixed header)

	var headerWaypoint = new Waypoint({
		element: document.getElementsByTagName('header'),
		offset: -225,
		handler: function() {
			$('header').toggleClass('minimal');
		}
	});

	// Collapse all answers in the FAQ
	
	$('#faq .questions .question').on('mousedown', function(e) {
		$(e.currentTarget).siblings().slideToggle(185);
	});
	
	// Hide secondary FAQ questions (toggle with the 'more' button)
	
	var moreButton = $('#faq .more');
		moreButton.css('height', moreButton.outerHeight() + 'px');
	
	var moreQuestions = moreButton.nextAll().hide();
	
	moreButton.on('click', function(e) {
		$(this).animate({
			'padding-top': 0,
			'padding-bottom': 0,
			'height': 0,
			'opacity': 0
		}, {
			'duration': 185,
			'complete': function() {
				window.setTimeout(function() {
					moreButton.css('opacity', 0);
					moreButton.remove();
					moreQuestions.slideDown();
				}, 185);
			}
		});
	});

});