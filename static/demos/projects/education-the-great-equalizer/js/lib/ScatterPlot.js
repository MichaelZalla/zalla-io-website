	var ScatterPlot = function(container_elem, width, height, data) {

	//Default parameter values
	//D3 requires native DOM elements, not jQuery objects
	var container = container_elem.get(0) || $('.canvas-container').get(0);
	var width = width || 600;
	var height = height || 400;
	
	var data = data;
	var current_data;

	var canvas,
		plot,
		
		horizontal_axis_gen,
		horizontal_axis,
		
		vertical_axis_gen,
		vertical_axis,
		
		horizontal_scale_fn,
		vertical_scale_fn,
		
		horizontal_variable = '',
		vertical_variable = '';

		//Function factory for trail path
		getTrailFunction = d3.svg.line()
			.x(function(data) { return data.x })
			.y(function(data) { return data.y })
			.interpolate('linear');
			//.interpolate('basis');

		/**
		 * Returns the set of all values contained within a property set. Each element in
		 * the given data list is expected to contain the specified property, and have a value
		 * associated with it. This function can be used to retrieve domain and range sets to
		 * help set up a correct viewport for our plot.
		 */
	var getValueSet = function(property_name) {
			var ret = [ ];
			for(var i in current_data) {
				if(current_data[i].hasOwnProperty(property_name) &&
				   current_data[i][property_name] != null) {
					ret.push(current_data[i][property_name]);
				} else {
					console.log("Warning: Data list item has not value set for property '" + property_name + "'.");
					console.log(current_data[i]);
				}
			}
			return ret;
		},

		/**
		 * Return a new linear scale function determined by a given domain set and
		 * a horizontal padding coeffcient
		 */
		getHorizontalScaleFn = function(viewport_domain, horizontal_padding) {
			return d3.scale.linear()
				.domain([
					viewport_domain.min() - (horizontal_padding * 0.5),
					viewport_domain.max() + (horizontal_padding * 1.5)
				])
				.range([0, width]);
		},

		/**
		 * Return a new linear scale function determined by a given domain range and
		 * a vertical padding coefficient
		 */
		getVerticalScaleFn = function(viewport_range, vertical_padding) {
			return d3.scale.linear()
				.domain([
					viewport_range.min() - vertical_padding,
					viewport_range.max() + vertical_padding
				])
				//.range([0, canvas.attr('height')]);
				.range([height, 0]);
		},

		getTrueX = function(data, formatted) {
			formatted = formatted || false;
			if(formatted) {
				return parseFloat(data[horizontal_variable]).toFixed(2);	
			} else {
				return parseFloat(data[horizontal_variable]);
			}
		},

		getTrueY = function(data, formatted) {
			formatted = formatted || false;
			if(formatted) {
				return parseFloat(data[vertical_variable]).toFixed(2);
			} else {
				return parseFloat(data[vertical_variable]);
			}
		},

		getScaledX = function(data) {
			return horizontal_scale_fn(getTrueX(data, false));
		},

		getScaledY = function(data) {
			return vertical_scale_fn(getTrueY(data, false));
		},

		makeTrailData = function(node_data, to_year) {
			//Return a dataset describing the path that each country has traveled
			//since the first available year to the current year, given the current
			//vertical statistic. 'year' is local to ScatterPlot::update
			//Because 'data' exists outside the scope of this function (it contains
			//ALL data available in the set), we'll use 'node_data' to reference the
			//data object bound to a given node (which is rendered at the end of each path)
			var ret = [ ];
			//node_data['COUNTRY_CODE'];
			for(var year in data) {
				if(parseInt(year) <= parseInt(to_year)) {
					//Grab the coordinate data for the specific year
					var x_value = data[year][node_data['COUNTRY_CODE']][horizontal_variable],
						y_value = data[year][node_data['COUNTRY_CODE']][vertical_variable];
					//We'll use the scale functions to translate each value into the
					//viewport's domain and range
					ret.push({ "x": horizontal_scale_fn(x_value),
							   "y": vertical_scale_fn(y_value) });
				}
			}
			return ret;
		},

		update = function(config) {

			//console.log("Rendering the scatter plot!");

			var year = config['current_year'],
				stat = config['current_statistic'];

			//Update the year displayed at the top-right of the visualization
			//Give a little delay for better timing
			setTimeout(function() { $('#year-info-value').text(year); }, 300);

			//Update the current dataset according to the new config
			current_data = data[year].toArray();

			if(stat != vertical_variable) {
				
				//Update the variables represented by each axis
				horizontal_variable = 'FEMALE_TERTIARY_ENROLLMENT_PERCENTAGE';
				vertical_variable = config['current_statistic'];

				//If we're rendering with a new vertical variable, we'll need
				//to re-define the vertical axis. This will always fire when the first
				//call to ScatterPlot::update is made
				if(vertical_axis) {
					vertical_axis.remove();
				}
				vertical_axis = canvas.append('g')
					.classed('axis', true)
					.attr({
						//'transform': 'translate(' + height + ', 0)',
					});	

				//Populate a list of all 'horizontal' and 'vertical' values present in the dataset.
				//It is necessary to know all elements contained within these two sets in order
				//to determine an appropriate domain and range for our plot's viewport
				var viewport_domain = getValueSet(horizontal_variable),
					viewport_range = getValueSet(vertical_variable);

				//The horizontal and vertical scale of the plot (and its axes) should only change
				//when the plot is updated with a new vertical variable
				var horizontal_padding = (viewport_domain.max() - viewport_domain.min()) * 0.25,
					vertical_padding = (viewport_range.max() - viewport_range.min()) * 0.25;
				
				horizontal_scale_fn = getHorizontalScaleFn(viewport_domain, horizontal_padding);
				vertical_scale_fn = getVerticalScaleFn(viewport_range, vertical_padding);

			}

			//Recalculate the axis generator functions
			horizontal_axis_gen = d3.svg.axis()
				.scale(horizontal_scale_fn)
				.orient('top')
				.ticks(3);
			vertical_axis_gen = d3.svg.axis()
				.scale(vertical_scale_fn)
				.orient('right')
				.ticks(8);

			//Re-apply the axis generator functions to each SVG axis group
			horizontal_axis.transition()
				.duration(600)
					.call(horizontal_axis_gen)
					.each("start", function() {
						d3.select(this)
							.selectAll('text')
							.classed('label', true)
							.classed('small', true);
					});
			vertical_axis.transition()
				.duration(600)
					.call(vertical_axis_gen)
					.each("start", function() {
						d3.select(this)
							.selectAll('text')
							.classed('label', true)
							.classed('small', true);
					});

			/**
			 * Re-compute the data-join. If the new dataset is smaller than the old one, the surplus
			 * elements end up in the 'exit' seelction (and can easily be removed). If the new dataset
			 * is too large, the surplus data ends up in the 'enter' selection, and new associated
			 * nodes are added. If the new dataset is exactly the same size, then all the elements
			 * are simply UPDATED with new data items, and no elements are added or removed.
			 * 
			 * Thinking with joins means that your code is more declarative; you can handle each of
			 * the three 'states' with no branching or iteration; you simply describe how elements
			 * should correspond to data. You can also target animated transitions to specific states.
			 * 
			 * See 'Thinking with Joins', Mike Bostock (http://bost.ocks.org/mike/join/)
			 */

			/* Update */
			
			var nodes = plot.selectAll('g.node').data(current_data)
					.each(function(d, i) { updateNode(d3.select(this)); });

			function updateNode(node) {
				var circle = node.select('circle');
					circle.transition()
						.duration(600)
						.attr({
							'cx': getScaledX,
							'cy': getScaledY,
						});
				var path = node.select('path');
					path.attr('d', function(data) { return getTrailFunction(makeTrailData(data, year, stat)); } );
			}

			/* Enter */

			var enteringNodes = nodes.enter()
					.append('g').classed('node', true)
					.attr('data-country-code', function(data) { return data['COUNTRY_CODE']; })
					.classed('visible', function(data) {
						var cc = parseInt(data['COUNTRY_CODE']);
						return !!(config['visible_countries'].indexOf(cc) + 1);
					});

			var enteringCircles = enteringNodes.append('circle')
					.attr({
						'r': 5,
						//Center the circle, accounting for its
						'cx': function(data) { return getScaledX(data) - 2; },
						'cy': function(data) { return getScaledY(data) - 2; },
					})
					.on('mouseover', function() {
						var info_box = d3.select('.node-info');
						//Update the information displayed in the node info box
						var group = d3.select(d3.select(this).node().parentNode);
						var cc = group.attr('data-country-code');
						var name = C_INFO[cc]['name'];
						var data = d3.select(this).data()[0];
						var xval = getTrueX(data, true),
							yval = getTrueY(data, true);
						info_box.select('.node-info-name').text(name);
						info_box.select('#node-info-value-x').text(xval + '\u2009' + '%');
						info_box.select('#node-info-value-y').text(yval);
						//Update the position of the node info box
						var width = parseInt(info_box.style('width')),
							height = parseInt(info_box.style('height'));
						var top = Math.round(d3.select(this).attr('cy')),
							left = Math.round(d3.select(this).attr('cx'));
						info_box.style({
							'top': top + 'px',
							'left': left + 'px',
							})
							.classed('active', true);

						//Update the appearance of the axes
						d3.selectAll('.axis-medium')
							.classed('active', true)
							.transition()
								.delay(1200)
								.duration(0)
								.each("end", function() {
									d3.select(this).classed('active', false);
								});

					})
					.on('mouseout', function() {
						var info_box = d3.select('.node-info')
							.classed('active', false);
							/*
							.transition()
								.delay(350)
								.duration(0)
								.each("end", function() {
									d3.select(this).style('opacity', '0.0');
								});
							*/
					});

			//Append a trace or trail for each circle (traced back to the first available year)
			var enteringPaths = enteringNodes.append('path')
					.attr('data-country-code', function(data) { return data['COUNTRY_CODE']; })
					.attr('d', function(data) { return getTrailFunction(makeTrailData(data, year, stat)); });

			/* Exit */

			var exitingNodes = nodes.exit()
					.selectAll('circle')
					.classed('visible', false)
					.transition()
						.delay(600)
						.duration(0)
						.each("end", function() { d3.select(this).remove(); });

	};

	/* Initialization */

	//Create an SVG canvas on which we can draw the scatter plot
	canvas = d3.select(container)
		.append('svg')
		.classed('canvas', true)
		.attr({
			'width': width,
			'height': height,
		});

	//Create the horizontal axis element, which should never change
	horizontal_axis = canvas.append('g')
		.classed('axis', true)
		.attr({
			'transform': 'translate(0,' + canvas.attr('height') + ')',
		});

	//Create a new group to hold our plot's SVG elements, giving it a 'plot' class
	plot = canvas.append('g').classed('plot', true);

	return {
		update: update
	}

}