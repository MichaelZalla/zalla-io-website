(function(window, angular, undefined) {

	var services = angular.module('services', []);

})(window, window.angular);

(function(window, angular, undefined) {

	angular.module('services').factory('Filtering', ['$http', function($http) {

		function getFilterData(type) {
			return $http.get('./js/data/' + type + '.json');
		}

		return {
			'getFilterData': getFilterData
		};

	}]);

})(window, window.angular);

(function(window, angular, undefined) {

	angular.module('services').factory('Search', ['Works', function(Works) {

		var works_promise = Works.getAll();

		var query_string = "";

		function filter(results, criteria) {

			var filters = {

				query: function(result) {

					// Only certain work properties will be considered in the search
					var searchable = ["title", "media", "district", "location", "location_description", "artist", "artist_biography", "subject_description", "origin_description", "associations"];

					// Generate an easily searchable corpus of text
					var corpus = "";
					searchable.forEach(function(prop) {
						corpus += result[prop].toLowerCase();
					});

					// Split the query into individual terms, and run a search
					var terms = criteria.query.toLowerCase().split(/[ ,]+/);
					for(var i = 0; i < terms.length; i++) {
						// if(corpus.indexOf(' ' + terms[i] + ' ') > -1){
						if(corpus.indexOf(terms[i]) > -1) {
							// Returns true on the first term match
							return true;
						}
					}

					return false;

				},

				districts: function(result) {
					return !!(criteria.districts.indexOf(result.district) > -1);
				},

				media: function(result) {
					return !!(criteria.media.indexOf(result.media) > -1);
				},

				years: function(result) {
					return !!(criteria.years.indexOf(result.year) > -1);
				}

			};

			// For each property of the criteria, apply any
			// associated filtering logic if possible...

			Object.keys(criteria).forEach(function(prop) {
				// Reduce filter criteria descriptions to lists of keys
				if(prop !== 'query') {
					criteria[prop] = criteria[prop].map(function(item) { return item.key; });
				}
				if(criteria[prop].length && prop in filters) {
					results = results.filter(filters[prop]);
				}
			});

			return results;

		}

		function query(criteria, callback) {
			return works_promise.then(function(res) {
				if('query' in criteria) {
					//@TODO This is confusing
					query_string = criteria['query'];
				}
				callback(filter(res.data, criteria));
			});
		}

		//@TODO Use this method on the SearchbarController after redirects
		function getQueryString() { return query_string; }

		return {
			'query': query,
			'getQueryString': getQueryString
		};

	}]);

})(window, window.angular);

(function(window, angular, undefined) {

	angular.module('services').factory('Session', [function() {

		var current_work = null;

		function getCurrentWork() {
			return current_work;
		}

		function setCurrentWork(work) {
			// 'work' can still be assigned a null value
			if(typeof work === "object") {
				current_work = work;
			}
		}

		return {
			'getCurrentWork': getCurrentWork,
			'setCurrentWork': setCurrentWork
		};

	}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('services')

.factory('Waypoints', ['$window', function($window) {

	var waypoints = [];

	function addWaypoint(config) {
		var wp = new $window.Waypoint(config);
		waypoints.push(wp);
	}

	function clearAllWaypoints() {
		angular.forEach(waypoints, function(wp) {
			wp.destroy();
		});
	}

	return {
		'add': addWaypoint,
		'clearAll': clearAllWaypoints
	};

}]);

})(window, window.angular);
(function(window, angular, undefined) {

	angular.module('services').factory('Works', ['$http', function($http) {

		var path = 'js/data/works.json';

		function getAll() {
			return $http.get(path);
		}

		// Other general-use methods here...

		return {
			'getAll': getAll
		};

	}]);

})(window, window.angular);

(function(window, angular, undefined) {

var app = angular.module('app', ['ngRoute', 'services', 'uiGmapgoogle-maps'])

.config(function(uiGmapGoogleMapApiProvider) {
	uiGmapGoogleMapApiProvider.configure({
		// key: 'AIzaSyCOBlb-lnVi4jyW3_FtcSAXsEagb1nrQ60',
		// key: 'AIzaSyB3Mrhksypw82253r2-r2_j2Fc3MZOM874',
		key: 'AIzaSyC9hejr3E3xWA7Y8L6Kzb19KR_p5scvmY4',
		// v: '3.17',
		libraries: 'geometry'
	});
})

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('AppController', ['$scope', function($scope) {

	console.log("App loaded!");

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('ExhibitViewController', ['$scope', '$location', '$routeParams', '$timeout', 'Session', 'Search', 'Waypoints',
	function($scope, $location, $routeParams, $timeout, Session, Search, Waypoints) {

	function init() {

		// Check if the current work has already been stored in session data
		$scope.work = Session.getCurrentWork();

		// Otherwise, try to extract the work's key from the URL
		if($scope.work == null) {
			Search.query({
				query: $routeParams['key'].replace('-', ' ')
			}, function(results) {
				angular.forEach(results, function(result) {
					if(result.key === $routeParams['key']) {
						$scope.work = result;
					}
				});
				// If no match was found, redirect to home
				if($scope.work == null) {
					$location.path('/home');
				}
			});
		}

		// View-specific template configuration
		$scope.$on('$viewContentLoaded', function() {

			$('body').attr('id', 'exhibit');

			$timeout(function() {

				// Initialize ScrollIt

				$.scrollIt();

				// De-register existing waypoints

				Waypoints.clearAll();

				// Hide the header, and set up a waypoint to show it

				// var header = $('header');
				// 	header.addClass('hidden');

				// Waypoints.add({
				// 	element: $('#info').get(0),
				// 	offset: 244,
				// 	handler: function() {
				// 		header.toggleClass('hidden');
				// 	}
				// });

				// Hide the info bar, and set up a waypoint to show it

				var infoBar = $('#hero .info-wrapper');
					infoBar.addClass('fixed');

				Waypoints.add({
					element: $('#info').get(0),
					offset: 798,
					handler: function() {
						infoBar.toggleClass('fixed');
					}
				});

			}, 150);

		});

	}

	function redirectToSearch(qs) {
		$timeout(function() {
			$location.path('/search/' + qs.trim());
		});
	}

	function redirectToGoogleMaps() {
		//@TODO Error checking
		var	location = "https://www.google.com/maps/dir//" + $scope.work.location.replace(/\s/g, '+');
		window.open(location, '_blank');
	}

	$scope.redirectToSearch = redirectToSearch;
	$scope.redirectToGoogleMaps = redirectToGoogleMaps;

	// Initialize the controller

	init();

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('ExploreViewController', ['$scope', '$location', '$routeParams', '$timeout', 'Filtering', 'Search', 'Session', 'uiGmapGoogleMapApi',
	function($scope, $location, $routeParams, $timeout, Filtering, Search, Session, uiGmapGoogleMapApi) {

	function toggleFilters() {
		$scope.filtersVisible = !$scope.filtersVisible;
	}

	function populateFilter(type) {
		Filtering.getFilterData(type).then(function(res) {
			$scope.filterOptions[type] = res.data;
		});
	}

	function setEditableFilter(key) {

		$scope.editableFilter = { };
		$scope.editableFilter.key = key;
		$scope.editableFilter.options = $scope.filterOptions[key];
		$scope.editableFilter.selected = $scope.filterStates[key];

	}

	function updateFilterDrawer(e) {

		var key = $(e.currentTarget).find('.label').text();

		if(!angular.isDefined($scope.editableFilter)) {
			setEditableFilter(key);
		}

		if(key !== $scope.editableFilter.key) {
			setEditableFilter(key);
			$scope.filterDrawerVisible = true;
		} else {
			$scope.filterDrawerVisible = !$scope.filterDrawerVisible;
		}

	}

	function updateResults(qs) {

		// Read query from $routeParams if update wasn't triggered by the searchbar
		if(typeof qs !== "string" && 'query' in $routeParams) {
			qs = $routeParams['query'];
		}

		var criteria = $.extend({}, $scope.filterStates,
			(typeof qs === "string" && qs.length) ? { 'query': qs } : { });

		// Run a search and display the results
		Search.query(criteria, function(results) {

			$scope.results = results;

			// Trigger a preview update using the first result
			if($scope.results.length > 0) {
				$scope.preview = $scope.results[0];
			}

		});

	}

	function reset() {

		$scope.filterStates.districts 	= [];
		$scope.filterStates.media  		= [];
		$scope.filterStates.years  		= [];

		$scope.filtersVisible = false;
		$scope.filterDrawerVisible = false;

	}

	function setPreview(result) {
		$scope.preview = result;
	}

	function redirectToExhibit(result) {
		if(!result.disabled) {
			Session.setCurrentWork(result);
			$location.path('/exhibit/' + result.key);
		}
	}

	function init() {

		// Pull all works into the collection list
		$scope.results_promise = Search.query({ }, function(results) { $scope.results = results; });

		// Check location for an existing query string (i.e. - redirect)
		if('query' in $routeParams) {
			updateResults($routeParams['query']);
		}

		$scope.$watch('filterStates', updateResults, true);

		// View-specific template configuration
		$scope.$on('$viewContentLoaded', function() {

			// Fetch possible filter options (only once per page-load)
			populateFilter('districts');
			populateFilter('media');
			populateFilter('years');

			reset();

			$('body').attr('id', 'explore');

			// Close the filter drawer when the user clicks elsewhere
			$('body').on('click', function(e) {

				var drawer = $('filter-drawer').get(0),
					filterItems = $('.filter-items').get(0);

			});

		});

	}

	$scope.results = [ ];

	$scope.filterOptions = { };
	$scope.filterStates = { };

	$scope.filterOptions.districts 	= [];
	$scope.filterOptions.media 		= [];
	$scope.filterOptions.years 		= [];

	$scope.filtersVisible = false;
	$scope.filterDrawerVisible = false;
	$scope.reset = reset;

	$scope.updateResults = updateResults;

	$scope.toggleFilters = toggleFilters;
	$scope.onFilterItemClick = updateFilterDrawer;

	$scope.setPreview = setPreview;
	$scope.redirectToExhibit = redirectToExhibit;

	// Initialize the controller

	init();

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('HomeViewController', ['$scope', '$window', '$timeout', '$location', 'Search',
	function($scope, $window, $timeout, $location, Search) {

	function redirectToSearch(qs) {
		$timeout(function() {
			$location.path('/search/' + qs.trim());
		});
	}

	function redirectToExplore(qs) {
		$timeout(function() {
			$location.path('/explore/' + qs.trim());
		});
	}

	function redirectToExhibit(key) {
		$timeout(function() {
			$location.path('/exhibit/' + key);
		});
	}

	function init() {

		// View-specific template configuration
		$scope.$on('$viewContentLoaded', function() {

			// Decorate the 'body' with an appropriate ID for styling
			$('body').attr('id', 'home');

			// Initialize Skrollr

			var skrollr = $window.skrollr.init({});

			$timeout(function() {

				// Initialize ScrollIt

				$.scrollIt();

				// Set up theater typing on 'talking' searchbar

				var theater = new TheaterJS();

				var searchbar = $('#hero searchbar input');
					searchbar.attr('placeholder', '');
					searchbar.on('mousedown input propertychange paste', function(e) {
						theater.stop();
					});

				theater
				.describe('search', {
					experience: 0.7,
					speed: 0.8,
					accuracy: 0.7
				}
				, function(newVal) {
					searchbar.val(newVal);
				})
				.write("search:find street art in cincy", 3500)
				.write(-19, 3500)
				.write("search:find art in clifton heights", 3500)
				.write(-22, 3500)
				.write("search:find new meaning", 3500)
				.write(-11, 3500)
				.write("search:find murals in otr", 3500)
				.write(-13, 3500)
				.write("search:find the singing mural", 3500)
				.write(-17, 3500)
				.write("search:find a revival", 3500)
				.write(-9, 3500)
				.write("search:find a campy washington", 3500)
				.write(-18, 3500)
				.write(function() { this.play(true); });

			}, 500);

		});
	}

	init();

	$scope.redirectToSearch = redirectToSearch;
	$scope.redirectToExplore = redirectToExplore;
	$scope.redirectToExhibit = redirectToExhibit;

}]);

})(window, window.angular);
(function(window, angular, undefined) {

angular.module('app')

.controller('ResultCardController', ['$scope', '$location', '$timeout', 'Session',
	function($scope, $location, $timeout, Session) {

	// Tracks the result information currently in-view
	$scope.currentView = 'info';

	function toggleView() {
		$scope.currentView = { "info": "map", "map": "info" }[$scope.currentView];
		if($scope.currentView == 'map') {
			$timeout(toggleView, 3000);
		}
	}

	function redirectToExhibit(result) {
		//@TODO Error-checking
		Session.setCurrentWork(result);
		$location.path('/exhibit/' + result.key);
	}

	$scope.toggleView = toggleView;
	$scope.redirectToExhibit = redirectToExhibit;

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('SearchViewController', ['$scope', '$routeParams', '$location', '$timeout', 'Filtering', 'Search',
	function($scope, $routeParams, $location, $timeout, Filtering, Search) {

	function toggleFilters() {
		$scope.filtersVisible = !$scope.filtersVisible;
	}

	function populateFilter(type) {
		Filtering.getFilterData(type).then(function(res) {
			$scope.filterOptions[type] = res.data;
			$timeout(function() { $('.filter-' + type + ' filter-options ul').slideUp(0); });
		});
	}

	function updateResults() {

		var q = $routeParams['query'];

		var criteria = $.extend({}, $scope.filterStates,
			(typeof q === "string" && q.length) ? { 'query': q.trim() } : { });

		// Run a search and display the results
		Search.query(criteria, function(results) { $scope.results = results; });
	}

	function reset() {

		$scope.filterStates.districts 	= [];
		$scope.filterStates.media  		= [];
		$scope.filterStates.years  		= [];

	}

	function pluralize() {
		return {
			'0': 'No works matched your search…',
			'1': 'We found one work matching your search…',
			'other': 'We found {} works matching your search…'
		};
	}

	function redirectToSearch(qs) {
		$timeout(function() {
			$location.path('/search/' + qs.trim());
		});
	}

	function init() {

		// Alias $routeParams so we can reference it in the template
		$scope.$routeParams = $routeParams;

		reset();

		populateFilter('districts');
		populateFilter('media');
		populateFilter('years');

		updateResults();

		$scope.$watch('filterStates', updateResults, true);

		// View-specific template configuration
		$scope.$on('$viewContentLoaded', function() {

			$('body').attr('id', 'search');

			function toggleFilterOptions(preview) {
				preview.toggleClass('expanded');
				var options = preview.siblings('filter-options').find('ul');
					options.slideToggle(100 * options.children.length);
			}

			function hideFilterOptions(preview) {
				preview.removeClass('expanded');
				var options = preview.siblings('filter-options').find('ul');
					options.slideUp(100 * options.children.length);
			}

			$('filter-preview').on('click', function(e) {
				var toggle = $(e.currentTarget);
				toggleFilterOptions(toggle);
				$.each($('filter-preview').not(toggle), function(i, preview) {
					hideFilterOptions($(preview));
				});
			});

			$('header, #results, footer').on('click', function(e) {
				$.each($('filter-preview.expanded'), function(i, preview) {
					hideFilterOptions($(preview));
				});
			});

		});

	}

	$scope.results = [ ];

	$scope.filterOptions = { };
	$scope.filterStates = { };

	$scope.filterOptions.districts 	= [];
	$scope.filterOptions.media 		= [];
	$scope.filterOptions.years 		= [];

	$scope.pluralize = pluralize;

	$scope.filtersVisible = false;
	$scope.toggleFilters = toggleFilters;
	$scope.reset = reset;

	$scope.redirectToSearch = redirectToSearch;

	// Initialize the controller

	init();

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('SearchbarController', ['$scope', '$location',  '$timeout', function($scope, $location, $timeout) {

	$scope.query = "";

	function submit() {
		// See: http://stackoverflow.com/questions/17763941
		$timeout(function() {
			$location.path('/search/' + $scope.query.trim());
		}, 15);
	}

	function reset() {
		$scope.query = "";
	}

	function init() {

		reset();

	}

	$scope.submit = submit;
	$scope.reset = reset;

	// Initialize the controller

	init();

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('anchoredTo', ['$timeout', function($timeout) {

	return {

		restrict: 'A',

		scope: true,

		link: function(scope, elem, attrs) {

			var anchor = elem.siblings(attrs.anchoredTo);

			if(anchor.length) {

				var offsetX = parseInt(attrs.anchorOffsetX) || 0,
					offsetY = parseInt(attrs.anchorOffsetY) || 0;

				elem.css('display', 'none');

				$timeout(function() {

	                var p = anchor.offset(),
	                	h = anchor.height(),
	                    w = anchor.innerWidth();

	                // Position dropdown lists above their respective wrappers
	                elem.css({
	                	'position': 'absolute',
	                    'top': (p.top + h + offsetY) + parseInt(anchor.css('margin-top')) + 'px',
	                    'left': p.left + offsetX,// + parseInt(anchor.css('margin-left')) + 'px',
	                    'width': w + 'px'
	                });

	                elem.css('display', 'inline-block');

            	}, 50);

			}

		}

	};

}]);

})(window, window.angular);
(function(window, angular, undefined) {

angular.module('app')

.directive('background', [function() {

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, elem, attrs) {

            var transitionSpeed = 300,
                opacity = elem.css('opacity'); // store original opacity

            scope.$watch(function(scope) {

                return scope.$eval(attrs['background']);

            }, function(compiled) {

                if(compiled !== undefined) {
                    // Double backslash in url may indicate a missing data binding
                    if(compiled.indexOf('//') == -1) {

                        if('transition' in attrs && attrs['transition'] === 'false') {
                            elem.css({
                                'background-image': 'url(\'' + compiled + '\')'
                            });
                        } else {
                            // Transition to a new background image
                            elem.animate({'opacity': 0 },
                                    transitionSpeed,
                                    function() {

                                        var bgImage = new Image();

                                        $(bgImage).on('load', function(e) {

                                            elem.css({
                                                'opacity': '0',
                                                'background-image': 'url(\'' + compiled + '\')'
                                            })
                                            .animate(
                                                { 'opacity': opacity },
                                                transitionSpeed,
                                                function() {
                                                    // Remove style rule after reaching original opacity
                                                    elem.css('opacity', '');
                                                }
                                            );
                                        });

                                        bgImage.src = compiled;

                                    }
                            );
                        }

                    }
                }

            });

        }
    };

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('filterDrawer', ['$window', function($window) {

	return {

		restrict: 'E',

		scope: {
			filter: '=',
			visibility: '='
		},

		templateUrl: './js/templates/filter-drawer.tpl.html',

		link: function(scope, elem, attrs) {

			var carouselInterval = null;

			function filterHasThumbnails() {
				if(typeof scope.filter === "undefined") return false;
				return !!(scope.filter.selected.length && 'thumbnail' in scope.filter.selected[0]);
			}

			function startCarousel() {
				carouselInterval = $window.setInterval(advanceCarousel, scope.transitionTime);
			}

			function advanceCarousel() {

				scope.$apply(function() {

					scope.activePreviewIndex++;

					if(scope.activePreviewIndex >= scope.filter.selected.length) {
						scope.activePreviewIndex = 0;
					}

				});

			}

			function stopCarousel() {
				$window.clearInterval(carouselInterval);
			}

			function init() {

				scope.$watch('visibility', function(value) {
					elem.toggleClass('expanded', value);
				}, true);

				// Carousel rotation
				scope.$watch('filter.selected.length', function(len) {

					stopCarousel();

					if(len == 1) { scope.activePreviewIndex = 0; }
					else if(len > 1) { startCarousel(); }

				});

				// Close button listener
				elem.find('.close').on('click', function() {
					scope.visibility = false;
					scope.$apply();
				});

			}

			scope.activePreviewIndex = 0;
			scope.transitionTime = 3600;

			scope.filterHasThumbnails = filterHasThumbnails;

			// Initialize the directive

			init();

		}

	}

}]);


})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('filterOptions', [function() {
	return {
		restrict: 'E',
		scope: {
			options: '=',
			selected: '='
		},
		templateUrl: "./js/templates/filter-options.tpl.html",
		link: function(scope, elem, attrs) {

			function toggleOption(option) {
				var index = scope.selected.indexOf(option);
				if(index > -1) {
					scope.selected.splice(index, 1);
				} else {
					scope.selected.push(option);
				}
			}

			function clear() {
				scope.selected.length = 0;
			}

			scope.toggleOption = toggleOption;
			scope.clear = clear;

			scope.$watch('options', function() {
				elem.css({
					'height': elem.find('ul').outerHeight() + 'px'
				});
			});

		}
	}
}]);

})(window, window.angular);
(function(window, angular, undefined) {

angular.module('app')

.directive('filterPreview', [function() {
	return {
		restrict: 'E',
		scope: { selected: '=' },
		templateUrl: "./js/templates/filter-preview.tpl.html",
		link: function(scope, elem, attrs) {

			scope.preview = "";

			function updateFilterPreview() {
				scope.preview = (scope.selected.length == 0) ? 'All' :
					scope.selected.map(function(option) { return option.value; })
						.sort().join(', ');
			}

			scope.$watch('selected', updateFilterPreview, true);

		}
	}
}]);

})(window, window.angular);
(function(window, angular, undefined) {

angular.module('app')

.directive('heroSlideshow', ['$timeout', function($timeout) {

    return {
        restrict: 'A',
        scope: { 'states': '=heroSlideshowStates' },
        link: function(scope, elem, attrs) {

            scope.states = parseInt(scope.states);

            var currentState = 1;

            var transitions = { };
                transitions.FORWARD = 1;
                transitions.BACKWARD = -1;

            var transitioning = false,
                transitionTime = 500;

            function transition(dir) {

                if(transitioning == true) return;

                transitioning = true;

                dir = (typeof dir === "number") ? dir : transitions.FORWARD;

                currentState += dir;

                // If the user scrolls down past the final state, or scrolls up
                // to the final state, toggle 'noscroll' on the page to enable /
                // disable scrolling

                if((dir === transitions.FORWARD && currentState === scope.states + 1) ||
                   (dir === transitions.BACKWARD && currentState === scope.states)) {
                    $('body').toggleClass('noscroll');
                }

                // Restrict the value of 'currentState' to a valid range
                if(currentState > scope.states) {
                    currentState = scope.states + 1;
                } else if(currentState === 0) {
                    currentState = 1;
                }

                // console.log(currentState, "of", scope.states);

                if(currentState <= scope.states) {
                    // Update the slideshow's current state class to trigger state transitions
                    elem.removeClass(function(i, classes) {
                            return (classes.match(/state-[0-9]/g) || [ ]).join(' ');
                        }).addClass('state-' + currentState.toString());
                }

                window.setTimeout(function() {

                    transitioning = false;

                }, transitionTime);

            }

            // Set up a scroll listener on the window

            $(window).on('mousewheel', function(e) {
                // Ignore if the slideshow isn't completely in-view
                if(window.pageYOffset == 0) {
                    var delta = e.originalEvent.deltaY;
                    var dir = parseInt(delta / Math.abs(delta));
                    transition(dir);
                }
            });

            // Set up keyboard listener for arrow-key navigation
            $(window).on('keydown keypress', function(e) {

                // Ignore if transitioning, or if the slideshow isn't in-view
                if(transitioning || currentState > scope.states) return;

                switch(e.which) {
                    case 38:
                        transition(transitions.BACKWARD);
                        break;
                    case 40:
                        transition(transitions.FORWARD);
                        break;
                    default:
                        break;
                }

            });

            // Initial slideshow state class
            // $timeout(function() {
                elem.addClass('state-1');
            // }, 0);

        }
    };

}]);

})(window, window.angular);


(function(window, angular, undefined) {

angular.module('app')

.directive('includeReplace', [function() {

    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('interactiveMapView', ['$window', 'uiGmapGoogleMapApi', function($window, uiGmapGoogleMapApi) {

	return {

		restrict: 'E',

		scope: true,

		link: function(scope, elem, attrs) {

			var options = {
				"mapWidth": 512,
				"mapHeight": 512,
				"mapType": "roadmap",
				"mapZoom": 18,
				"mapLink": 0,
				"mapScale": 2
			};

			var locationCache = {};

			// Merge any attribute options assigned to the directive with 'options'
			for(var key in options) {
				if(options.hasOwnProperty(key)) {
					if(key in attrs) { options[key] = attrs[key].toString(); }
				}
			}

			function getLocationByAddress(address, done) {

				if(address in locationCache) {
					console.log("Was cached!");
					done(locationCache[address]);
					return;
				}

				var geocoder = new scope.maps.Geocoder(),
					opts = { 'address': address },
					errorMsg;

				function onGetResults(results, status) {

					if(status == scope.maps.GeocoderStatus.OK) {

						locationCache[address] = results[0].geometry.location;

						done(locationCache[address]);

					} else {

						errorMsg = "Couldn't fetch coordinate data for location '" + address + "'.";

						console.log(errorMsg);

					}

				}

				geocoder.geocode(opts, onGetResults);

			}

			function setCenter(address) {

				scope.settings.address = address;

				getLocationByAddress(address, function(location) {

					// Update the directive's center-point
					scope.settings.center = {
						latitude: location.lat(),
						longitude: location.lng()
					};

				});

			}

			function init() {

				scope.settings.center = { latitude: 0, longitude: 0 };

				scope.settings.zooms = {
					IDLE: 15,
					PANNING: 13
				};

				scope.settings.zoom = scope.settings.zooms.IDLE;

				scope.settings.options = {
					draggable: false,
					disableDefaultUI: true
				};

				uiGmapGoogleMapApi.then(function(maps) {

					scope.maps = maps;

					setCenter(attrs.mapAddress);

					// Watch the value of 'work' and update the element's background
					attrs.$observe('mapAddress', function(address) {
						if(typeof address === "string" && address.length > 0) {
							setCenter(address);
						}
					});

				});

			}

			scope.maps = null;

			scope.settings = {};

			// Initialize the directive

			init();

		},

		template: "<ui-gmap-google-map center='settings.center' pan='true' zoom='settings.zoom'></ui-gmap-google-map><span class='label'>{{ settings.address }}</span>"

	};

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('mapView', [function() {

	return {

		restrict: 'A',

		scope: { work: '=' },

		link: function(scope, elem, attrs) {

			var options = {
				"mapWidth": 512,
				"mapHeight": 512,
				"mapType": "roadmap",
				"mapZoom": 18,
				"mapLink": 0,
				"mapScale": 2
			};

			// Set the element's background styles
			function updateBackground() {
				elem.css({
					// 'background-size': options['mapSize'],
					'background-size': 'cover',
					'background-image': 'url(\'' + getGoogleMapsStaticUrl() + '\')'
				});
				// optionally link the element to a Google Maps page
				if(parseInt(options['mapLink'])) {
					elem.on('click', redirectToGoogleMaps);
				}
			}

			function getGoogleMapsStaticUrl() {

				var url = "https://maps.googleapis.com/maps/api/staticmap";

				var params = [];

				// Compile a parameters string for the url
				for(var param in options) {
					if(options.hasOwnProperty(param)) {
						// Remove 'map' prefix from option key
						params.push(param.replace('map', '').toLowerCase() + '=' + options[param]);
					}
				}

				// Add a 'center' value for the request
				params.push("center=" + scope.work.location.replace(/(\s)/g, '+'));

				// Add API key
				params.push('key=AIzaSyC9hejr3E3xWA7Y8L6Kzb19KR_p5scvmY4');

				return url += '?' + params.join('&');

			}

			function redirectToGoogleMaps() {
				//@TODO Error checking
				var location = "https://www.google.com/maps/dir//" + scope.work.location.replace(/\s/g, '+');
				window.open(location, '_blank');
			}

			// Merge any attribute options assigned to the directive with 'options'
			for(var key in options) {
				if(options.hasOwnProperty(key)) {
					if(key in attrs) { options[key] = attrs[key].toString(); }
				}
			}

			// Translate 'width' and 'height' to a single 'size' key
			options['mapSize'] = options['mapWidth'] + 'x' + options['mapHeight'];

			delete options['mapWidth'];
			delete options['mapHeight'];

			// Watch the value of 'work' and update the element's background
			scope.$watch('work', function(work) {
				if(typeof work === "object" && work !== null) {
					updateBackground();
				}
			});

		}

	};

}]);

})(window, window.angular);

(function(window, angular, undefined) {

	angular.module('app')

	.directive('map', ['uiGmapGoogleMapApi', function(uiGmapGoogleMapApi) {
		return {
			restrict: 'E',
			replace: true,
			template: '<div></div>',
			link: function (scope, element, attrs) {
				var map_options = {
					center: new google.maps.LatLng(40.294163, -3.7581804000000147),
					zoom: 8
				};
				var map = new google.maps.Map(element[0], map_options);
				scope.map = map;
			}
		};
	}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('resultCard', [function() {

    return {
        restrict: 'E',
        scope: { result: '=' },
        templateUrl: './js/templates/result-card.tpl.html',
        controller: 'ResultCardController',
        controllerAs: 'card'
    };

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('searchbar', ['$location', function($location) {

	return {
		restrict: 'E',
		scope: {
			'onChange': '&',
			'onSubmit': '&'
		},
		templateUrl: './js/templates/searchbar.tpl.html',
		link: function(scope, elem, attrs) {

			function getQueryString() {
				return elem.find('input').val().trim();
			}

			if(typeof attrs.onChange === "undefined") {
				scope.onChange = $.noop;
			}

			if(typeof attrs.onSubmit === "undefined") {
				scope.onSubmit = $.noop;
			}

			// Watch for route changes so we can pre-populate the searchbar

			scope.$location = $location;

			scope.$watch('$location.path()', function(path) {
				var query = path.replace(/(^\/(home|search|explore|exhibit))[\/]?/g, '');
				if(query.length) {
					scope.query = query.replace(/\-/g, ' ');
				}
			});

			// Assign searchbar listeners

			elem.find('button').on('click', function(e) {
				scope.onSubmit({ 'qs': getQueryString() });
			});

			elem.find('input').on('input propertychange paste', function(e) {
				scope.onChange({ 'qs': getQueryString() });
			});

			elem.find('input').on('keydown keypress', function(e) {
				if(e.which === 13) {
					scope.onSubmit({ 'qs': getQueryString() });
				}
			});

		}
	};

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider.when('/search/:query?', {
		controller: 'SearchViewController',
		controllerAs: 'view',
		templateUrl: './js/templates/view-search.tpl.html'
	});

	$routeProvider.when('/home', {
		controller: 'HomeViewController',
	 	controllerAs: 'view',
		templateUrl: './js/templates/view-home.tpl.html'
	});

	$routeProvider.when('/explore/:query?', {
		controller: 'ExploreViewController',
	 	controllerAs: 'view',
		templateUrl: './js/templates/view-explore.tpl.html'
	});

	$routeProvider.when('/exhibit/:key', {
		controller: 'ExhibitViewController',
	 	controllerAs: 'view',
		templateUrl: './js/templates/view-exhibit.tpl.html'
	});

}]);

})(window, window.angular);

'use strict';

(function(window, angular, undefined) {

angular.module('app')

.config(['$routeProvider', function($routeProvider) {

	$routeProvider.otherwise({
		redirectTo: '/home'
	});

}]);

})(window, window.angular);

// function ChildController($injector, $scope) {
// 	$injector.invoke(ParentController, this, { $scope: $scope });
// 	// Child-specific code here ...
// }
//   ChildController.prototype = Object.create(ParentController);
