$(document).ready(function() {
	$(window).on('scroll', function(e) {
		var content_height = $('body')[0].scrollHeight;
		var scroll_percentage = (content_mask.scrollTop() / (content_height - content_mask.height()));
		if(scroll_percentage > 0) {
			var y_offset = 80 * scroll_percentage;
			var position = "0% " + y_offset + "%";
			$('.masthead').css({
				'background-position': position
			});
		}
	})
});