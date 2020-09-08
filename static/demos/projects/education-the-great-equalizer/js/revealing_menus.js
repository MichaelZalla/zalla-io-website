var	vs_menu,
	vs_indicator,
	ps_menu,
	ps_indicator;

var vs_menu_statistic_map = {
	"vs_menu_trigger_growth_rate": "POPULATION_GROWTH_RATE",
	"vs_menu_trigger_young_mothers_percentage": "YOUNG_MOTHERS_PERCENTAGE",	
	"vs_menu_trigger_life_expectancy": "AVG_LIFE_EXPECTANCY"
};

var ps_menu_selection_map = {
	//Replace with correct values later
	"ps_menu_trigger_all": [578, 840, 554, 372, 392, 410, 192, 170, 682, 788, 356, 418, 400, 504, 854, 231, 450, 800],
	"ps_menu_trigger_developed": [578, 840, 554, 372, 392, 410],
	"ps_menu_trigger_developing": [192, 170, 682, 788, 356, 418],
	"ps_menu_trigger_underdeveloped": [400, 504, 854, 231, 450, 800]
};

//We can assume that this will only fire for non-current triggers
function on_menu_mouseover(menu, trigger, top_offset, height_offset) {
	
	//Parameter defaults
	var top_offset = top_offset || 0,
		height_offset = height_offset || 0;

	//Move the indicator back if the user moves their mouse off the trigger
	function moveToCurrentTrigger() {
		var indicator = menu.getItemContainer().find('.menu-indicator');
			indicator.clearQueue();
			indicator.animate({
				'top': menu.getCurrentItemTrigger().position().top + top_offset + 'px',
				'height': menu.getCurrentItemTrigger().height() + height_offset + 'px'
			}, 400);
	}

	//Move the indicator to the location of the trigger than the user is hovering over
	function moveToNewTrigger() {
		var indicator = menu.getItemContainer().find('.menu-indicator');
			indicator.clearQueue();
			indicator.animate({
				'top': trigger.position().top + top_offset + 'px',
				'height': trigger.height() + height_offset + 'px'
			}, 400);
	}

	//Add mouseout event listener
	var fire_once = function(e) {
		//We can still use 'trigger', which is in scope
		if(!trigger.hasClass('active')) {
			moveToCurrentTrigger();
		} else {
			//Must give time for the new active item to reposition itself
			setTimeout(moveToCurrentTrigger, 400);
		}
		removeEventListener('mouseout', fire_once, false);
	}

	moveToNewTrigger();
	trigger.on('mouseout', fire_once);

}

//We can assume that this will only fire for non-current triggers
function on_menu_mouseclick(menu, trigger, top_offset, height_offset) {	
	//Update the position of the indicator
	var indicator = menu.getItemContainer().find('.menu-indicator');
		indicator.animate({
			'top': trigger.position().top + top_offset + 'px',
			'height': trigger.height() + height_offset + 'px'
		}, 400);
}

function on_vs_menu_mouseover(menu, trigger) {
	on_menu_mouseover(menu, trigger, 0, 0);
}
function on_vs_menu_mouseclick(menu, trigger) {
	on_menu_mouseclick(menu, trigger, 0, 0);
	//Update USER_CONFIG with a new current statistic
	var id = trigger.attr('id');
	USER_CONFIG['current_statistic'] = vs_menu_statistic_map[id];
	//Update the vertical axis label
	$('.vertical-axis-wrapper').find('.axis-medium').text(trigger.text());
	/*
	//Move the new item to the 'top' of the menu
	var item = trigger.parent();
	 	item.prependTo(menu.getItemContainer());
	*/
}
function on_ps_menu_mouseover(menu, trigger) {
	on_menu_mouseover(menu, trigger, 4, 4);
}
function on_ps_menu_mouseclick(menu, trigger) {
	on_menu_mouseclick(menu, trigger, 4, 4);
	//Update USER_CONFIG with a new set of visible countries
	var id = trigger.attr('id');
	USER_CONFIG['visible_countries'] = ps_menu_selection_map[id];
	//Hide all country toggle items and associated plot nodes
	$('.country-selection-toggle').removeClass('visible');
	var nodes = d3.selectAll('g.node')
		.classed('visible', false);
	//Display the new set of country toggle items and associated plot nodes
	for(var i in USER_CONFIG['visible_countries']) {
		var cc = USER_CONFIG['visible_countries'][i];
		$('.country-selection-toggle[data-country-code="' + cc + '"]').addClass('visible');
		var node = d3.select('g[data-country-code="' + cc + '"]')
			.classed('visible', true);
	}
}

