var RevealingMenu = function(item_container, mouseover_fn, mouseclick_fn, has_content) {

	//Default parameter values
	var has_content = (typeof has_content == 'boolean') ? has_content : true;

	var item_triggers = item_container.find('.rev-menu-trigger'),
		item_contents = item_container.find('.rev-menu-content'),
		mouseover_fn = mouseover_fn || function(e) { },
		mouseclick_fn = mouseclick_fn || function(e) { };

	var current_item_trigger = item_triggers.first(),
		new_item_trigger = null,
		current_item_content = item_contents.first(),
		new_item_content = null;

	var getItemContainer = function() {
			return item_container;
		},
	
		getCurrentItemTrigger = function() {
			return current_item_trigger;
		};

	//Because we are returning an object, we can reference a functionally
	//identicaly object as 'self'
	var self = {
		getItemContainer: getItemContainer,
		getCurrentItemTrigger: getCurrentItemTrigger
	};


	//Set up event listeners
	item_triggers.on('mouseover', function(e) {
		new_item_trigger = $(e.currentTarget);
		if(new_item_trigger.get(0) != current_item_trigger.get(0)) {
			mouseover_fn(self, new_item_trigger);
		}
	});

	item_triggers.on('click', function(e) {
		new_item_trigger = $(e.currentTarget);
		if(new_item_trigger.get(0) != current_item_trigger.get(0)) {
			new_item_content = new_item_trigger.siblings('.rev-menu-content');
			//Update 'active' item
			item_triggers.removeClass('active');
			new_item_trigger.addClass('active');
			//Update item visibility
			if(has_content) {
				current_item_content.slideToggle();
				new_item_content.slideToggle();
			}
			current_item_trigger = new_item_trigger;
			current_item_content = new_item_content;
			//Call the mouseclick behavior function
			mouseclick_fn(self, new_item_trigger);
		}
	});

	//Set container to position:relative, allowing the indicator to move freely
	item_container.css('position', 'relative');
	//Initialize (hide subsequent content sections)
	if(has_content) {
		item_contents.each(function(i, elem) {
			if(i != 0) {
				$(elem).slideToggle();
			}
		});
	}
	
	//Set the first item as active (simulated click)
	new_item_trigger = item_triggers.first();
	new_item_trigger.addClass('active');
	mouseclick_fn(self, new_item_trigger);

	return {
		getItemContainer: getItemContainer,
		getCurrentItemTrigger: getCurrentItemTrigger
	}

};

