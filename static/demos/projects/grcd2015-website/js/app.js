(function(window, angular, undefined) {

	var services = angular.module('services', []);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('services')

.factory('Filters', ['$http', function($http) {

	var path = 'js/data/filters.json';

	function getAll() {
		return $http.get(path);
	}

	return {
		'getAll': getAll
	};

}]);
	
})(window, window.angular);

(function(window, angular, undefined) {

angular.module('services')

.factory('Inputs', ['$window', function($window) {

	var _isScrolling = false,
		_timeoutListener = null;

	var _onScrollStartCallbacks = [],
		_onScrollEndCallbacks = [];

	function onScrollStart(fn) {
		_onScrollStartCallbacks.push(fn);
	}

	function onScrollEnd(fn) {
		_onScrollStartCallbacks.push(fn);
	}

	// Set up a recursive timeout to reset _isScrolling periodically	

	function onWindowScroll(e) {
		
		if(_isScrolling !== true) {

			_isScrolling = true;

			angular.forEach(_onScrollStartCallbacks, function(callback) {
				callback();
			});

		}

		if(_timeoutListener !== null) {
			$window.clearTimeout(_timeoutListener);
		}

		_timeoutListener = $window.setTimeout(function() {
		
			_isScrolling = false;

			angular.forEach(_onScrollEndCallbacks, function(callback) {
				callback();
			});

		}, 150);

	}

	function isScrolling() { return _isScrolling; }

	// Set up a $window listener for scroll events

	$($window).on('scroll', onWindowScroll);

	return {
		'isScrolling': isScrolling,
		'onScrollStart': onScrollStart,
		'onScrollEnd': onScrollEnd
	};

}]);

})(window, window.angular);
(function(window, angular, undefined) {

angular.module('services')

.factory('Projects', ['$http', function($http) {

	var path = 'js/data/projects.json';

	function makeCircularLinkedList(collection) {
		angular.forEach(collection, function(node, index, list) {
			if(index > 0) {
				node.prev = list[index - 1];
			}
			if(index < collection.length - 1) {
				node.next = list[index + 1];
			}
		});
	}

	function getAll() {

		var promise = $http.get(path);

			promise.then(function(res) {
			
				var projects = res.data;
				
				makeCircularLinkedList(projects);

			});

		return promise;
	}

	return {
		'getAll': getAll
	};

}]);
	
})(window, window.angular);

(function(window, angular, undefined) {

angular.module('services')

.factory('Search', ['Projects', 'Students', function(Projects, Students) {

	var projects_promise = Projects.getAll(),
		hasStudentDataInjected = false;

	function filter(results, criteria) {

		var filters = {

			key: function(result) {
				return !!(result.key == criteria.key);
			},

			categories: function(result) {
				
				var matching = false;

				angular.forEach(result.categories, function(category) {
					if(!matching && criteria.categories.indexOf(category) > -1) {
						matching = true;
					}
				});
				
				return matching;

			},

			focus_tracks: function(result) {

				var matching = false;

				angular.forEach(criteria.focus_tracks, function(track) {
					angular.forEach(result.students, function(student) {
						if(!matching && student.focus_tracks.indexOf(track) > -1) {
							matching = true;
						}
					});
				});

				return matching;

			}

		};

		// For each property of the criteria, apply any associated filtering
		// logic if possible ...
		Object.keys(criteria).forEach(function(prop) {
			if(criteria[prop].length && prop in filters) {
				results = results.filter(filters[prop]);
			}
		});

		return results;

	}

	function query(criteria, callback) {
		return projects_promise.then(function(projects_res) {

			if(!hasStudentDataInjected) {

				hasStudentDataInjected = true;

				// Inject student data into each project using sixplustwo values

				var students_promise = Students.getAll();
					students_promise.then(function(students_res) {

						var students = students_res.data;

						angular.forEach(projects_res.data, function(project) {
							angular.forEach(project.students, function(sixplustwo, i) {
								students[sixplustwo].sixplustwo = sixplustwo; // stash key
								project.students[i] = students[sixplustwo];
							});
						});

						callback(filter(projects_res.data, criteria));
						
					});

			} else {

				callback(filter(projects_res.data, criteria));

			}

		});
	}

	// Public API

	return {
		'query': query
	};

}]);

})(window, window.angular);
(function(window, angular, undefined) {

angular.module('services')

.factory('Students', ['$http', function($http) {

	var path = 'js/data/students.json';

	function getAll() {
		return $http.get(path);
	}

	return {
		'getAll': getAll
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

	var app = angular.module('app', ['services', 'ngRoute', 'ngSanitize']);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('AppController', ['$scope', function($scope) {

	// console.log("App loaded!");

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('FilterMenuController', ['$scope', '$location', 'Filters', 'Search',
	function($scope, $location, Filters, Search) {

	function getFiltersByFocus(focus) {

		var filters = [];

		angular.forEach($scope.filters, function(filter) {
			if(filter.focus == focus) {
				filters.push(filter);
			}
		});

		return filters;

	}

	function getSelectedFilters() {
		return $scope.filters.filter(function(filter) {
			return filter.selected;
		});
	}

	function isSelected(filter) {
		return (getSelectedFilters().indexOf(filter) > -1);
	}
	
	function selectFilter(filter) {
		var i = $scope.filters.indexOf(filter);
		if(i > -1) {
			$scope.filters[i].selected = true;
		}
	}

	function removeFilter(filter) {
		var i = $scope.filters.indexOf(filter);
		if(i > -1) {
			$scope.filters[i].selected = false;
		}
	}
	
	function resetFilters() {
		angular.forEach($scope.filters, removeFilter);
	}

	function applyFilters(filters, done) {

		function byLastName(a, b) {
			
			var lname_a = a.students[0].last_name.toLowerCase(),
				lname_b = b.students[0].last_name.toLowerCase();

			if(lname_a < lname_b) {
				return -1;
			}

			if(lname_a > lname_b) {
				return 1;
			}

			return 0;

		}

		// Pass the selected filtering options as criteria to the Search
		// service, retrieving all projects matching the criteria; finally,
		// place each associated student into his or her focus track(s),
		// and sort the resulting collections by last name

		Search.query(filters, function(results) {
			
			$scope.projects = [];

			angular.forEach(results, function(result) {
				angular.forEach(result.students, function(student) {

					var clone = Object.create(result);
						clone.students = [student];
					
					$scope.projects.push(clone);

				});
			});

			$scope.projects.sort(byLastName);

			if(typeof done === "function") {
				done();
			}

		});

	}

	function toggleFilterMenu() {
		$('filter-menu').toggleClass('expanded');
	}

	function onClickFilterItem(filter) {
		resetFilters();
		selectFilter(filter);
	}

	function redirectToProject(project) {
		$('filter-menu').removeClass('expanded');
		$location.path('/project/' + project.key);
	}

	function init() {

		Filters.getAll().then(function(res) {
			
			angular.forEach(res.data, function(filter) {

				filter.selected = false;

				$scope.filters.push(filter);

			});

			$scope.$watch('filters', function(filters) {

				if(angular.isDefined(filters) && filters.length) {
					
					var criteria = {};

					angular.forEach(filters, function(filter) {
						if(filter.selected) {

							if(!(filter.type in criteria)) {
								criteria[filter.type] = [];
							}

							criteria[filter.type].push(filter.value);

						}
					});

					applyFilters(criteria);

					$scope.onChangeFilterSelection({
						'selection': criteria,
						'done': null
					});

				}

			}, true);

		});

	}

	$scope.projects = [];

	$scope.filters = [];

	$scope.getFiltersByFocus = getFiltersByFocus;
	$scope.getSelectedFilters = getSelectedFilters;
	$scope.isSelected = isSelected;

	$scope.selectFilter = selectFilter;
	$scope.removeFilter = removeFilter;
	$scope.resetFilters = resetFilters;

	$scope.toggleFilterMenu = toggleFilterMenu;
	$scope.onClickFilterItem = onClickFilterItem;
	$scope.redirectToProject = redirectToProject;

	// Initialize the controller

	init();

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('HeaderViewController', ['$scope', '$window', '$location', 'Waypoints',
	function($scope, $window, $location, Waypoints) {

	function redirectToLandingSection(section_id) {
		
		// Redirect to landing view
		$location.path('/');

		// Triggers scroll navigation to section
		$window.setTimeout(function() {
			$('.ss-header-navigation .' + section_id).trigger('click');
		}, 500);

	}

	function toggleFilterMenu() {
		$('filter-menu').toggleClass('expanded');
	}

	function init() {

		// Remove any Waypoints registered for the previous application view
		Waypoints.clearAll();

	}

	$scope.redirectToLandingSection = redirectToLandingSection;
	$scope.toggleFilterMenu = toggleFilterMenu;

	// Initialize the controller

	init();

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('LandingViewController', ['$scope', '$window', '$timeout', 'Inputs', 'Search', 'Students', 'Waypoints',
	function($scope, $window, $timeout, Inputs, Search, Students, Waypoints) {

	function preloadImage(source) {
		
		var img = new Image();
			img.src = source;
		
		$scope.storedImages.push(img);

	}
	
	function preloadBrandingImages() {

		var priorityAssets = [
			'images/blank.png',
			'images/icons/arrow-down.svg',
			'images/branding/grcd-2015-title.png',
			'images/branding/letter-grid-title_2x.png',
			'images/branding/letter-grid-flat.svg',
			'images/controls/control-play.svg',
			'images/controls/control-pause.svg',
			'images/controls/control-replay.svg',
			'media/motion-promo-desktop-v2.jpg'
		];

		angular.forEach(priorityAssets, preloadImage);

	}

	function preloadTeaserImages() {
		
		var tracks = ['print','motion','interaction'];
		
		angular.forEach(tracks, function(track) {
			angular.forEach($scope.projects[track], function(project) {
				preloadImage('images/teasers/' + project.students[0].sixplustwo + '_teaser.jpg');
			});
		});

	}

	function applyFilters(filters, done) {

		function byLastName(a, b) {
			
			var lname_a = a.students[0].last_name.toLowerCase(),
				lname_b = b.students[0].last_name.toLowerCase();

			if(lname_a < lname_b) {
				return -1;
			}

			if(lname_a > lname_b) {
				return 1;
			}

			return 0;

		}

		// Pass the selected filtering options as criteria to the Search
		// service, retrieving all projects matching the criteria; finally,
		// place each associated student into his or her focus track(s),
		// and sort the resulting collections by last name

		Search.query(filters, function(results) {
			
			if(typeof $scope.TOTAL_PROJECT_COUNT === "undefined") {
				$scope.TOTAL_PROJECT_COUNT = results.length;
			}

			$scope.currentProjectCount = results.length;

			$scope.projects = {
				print: [],
				motion: [],
				interaction: []
			};

			angular.forEach(results, function(result) {
				angular.forEach(result.students, function(student) {

					var clone = Object.create(result);
						clone.students = [student];
					
					angular.forEach(student.focus_tracks, function(track) {
						$scope.projects[track].push(clone);
					});

				});
			});

			angular.forEach($scope.projects, function(projects) {
				projects.sort(byLastName);
			});

			if(typeof done === "function") {
				done();
			}

		});

	}

	function onProjectHover(project) {

		$scope.prevProject = project;

		if(!Inputs.isScrolling()) {
			$scope.currentProject = project;
		}

	}

	function init() {

		$scope.applyFilters({ }, function() {

			// Preload high-priority images before requesting any teasers
			preloadBrandingImages();

			if($window.outerWidth > 640) {
				
				preloadTeaserImages();

			}

		});

		// Add a listener to update the current teaser when scrolling ends

		Inputs.onScrollEnd(function() {
			$timeout(function() {
				onProjectHover($scope.prevProject);
			}, 500);
		});

		// View-specific template configuration

		$scope.$on('$viewContentLoaded', function() {

			// Decorate the 'body' with an appropriate ID for styling
			
			$('body').attr('id', 'landing');

			// Re-initialize scrollIt
		  	
		  	$.scrollIt({
		  		topOffset: ($window.outerWidth <= 640) ? 14 : -50
		  	});

		  	// Initialize waypoints

			function toggleHeader(dir) {
				$('#header').toggleClass('hidden', dir == 'up');
			}

			function toggleFilterBar(dir) {
				if(!$('#previews').hasClass('filtered')) {
					$('.filter-bar').toggleClass('hidden', dir == 'up');
				}
			}

		  	Waypoints.add({
				element: document.getElementById('info'),
				handler: toggleHeader,
				offset: 92
		  	});

		  	Waypoints.add({
				element: document.getElementById('previews'),
				handler: toggleFilterBar
		  	});

			// Promo video waypoint

			function toggleVideo(dir) {
				$('#promo').toggleClass('hidden', dir == 'down');
			}

			var togglePoint = null,
				scrollPos = null,
				lastScrollPos = 0;

			$($window).on('scroll', function(e) {

				togglePoint = togglePoint || parseInt($('#previews').offset().top) - 220;//440;

				scrollPos = $($window).scrollTop();
				
				if(lastScrollPos <= togglePoint && togglePoint < scrollPos) {
					toggleVideo('down');
				} else if(lastScrollPos > togglePoint && togglePoint >= scrollPos) {
					toggleVideo('up');
				}

				lastScrollPos = scrollPos;

			});

			// Letter-grid (dynamic position)

			var logo = $('#branding').find('.logo'),
				grid = $('#branding').find('.letter-grid'),
				offset = { 'top': -240, 'left': -245 };

			function onResizeWindow(e) {

				var lo = logo.offset();

				grid.css({
					'top': 32, //lo.top + offset.top,
					'left': lo.left + offset.left
				});

			}

			$($window).on('resize', onResizeWindow);
			
			// Initial re-positioning

			$timeout(onResizeWindow, 500);

		});

	}

	$scope.applyFilters = applyFilters;

	$scope.prevProject = null;
	$scope.currentProject = null;
	
	$scope.onProjectHover = onProjectHover;

	// Store Image object references so that garbage collector doesn't drop it
	
	$scope.storedImages = [];

	// Initialize the controller

	init();

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.controller('ProjectViewController', ['$scope', '$window', '$location', '$routeParams', '$timeout', '$sce', 'Search', 'Waypoints',
	function($scope, $window, $location, $routeParams, $timeout, $sce, Search, Waypoints) {

	var PROJECT_IMAGE_COUNT = 3,
		PROJECT_IMAGE_EXTENSION = 'jpg';

	function scrollToTop() {
		$('html, body').animate({ 'scrollTop': 0 }, 650);
	}

	function getProjectFromRoute(success, error) {

		var key = $routeParams['key'].trim();

		Search.query({ 'key': key }, function(results) {
			if(results.length == 0) {
				error();
			} else {
				success(results[0]);
			}
		});

	}

	function getProjectBannerUrl(project) {

		if(project == null) return '#';

		var sixplustwo = project.students[0].sixplustwo;
		
		return 'images/projects/' + sixplustwo + '/'
			+ sixplustwo + '_banner.' + PROJECT_IMAGE_EXTENSION;

	}

	function getProjectImageUrls(project) {
		
		var urls = [],
			sixplustwo = project.students[0].sixplustwo;
		
		var base = 'images/projects/' + sixplustwo + '/' + sixplustwo + '_0';

		for(var i = 1; i <= PROJECT_IMAGE_COUNT; i++) {
			if(project.has_gifs) {
				urls.push(base + i.toString() + '.gif');
			} else {
				urls.push(base + i.toString() + '.' + PROJECT_IMAGE_EXTENSION);
			}
		}

		return urls;

	}

	function hasVimeoEmbed(project) {
		return !!(typeof project['vimeo_id'] !== "undefined");
	}

	function getSecureVimeoEmbedUrl(project) {
		var url = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + project.vimeo_id);
		return url;
	}

	function getVideoPaddingPercentage(project) {
		
		var width = project.vimeo_dimensions.width,
			height = project.vimeo_dimensions.height;

		return (parseFloat(height / width) * 100);

	}

	function getStudentFullName(student) {
		return student.first_name + ' ' + student.last_name;
	}

	function getStudentPortraitLocation(student) {
		return 'images/projects/' + student.sixplustwo + '/' + student.sixplustwo + '_portrait.jpg';
	}

	function redirectToProject(project) {
		$location.path('/project/' + project.key);
	}

	function init() {

		getProjectFromRoute(function(project) {
			
			$scope.project = project;
			
		}, function() {
			
			$location.path('/');
			$scope.apply();
			
		});

		// View-specific template configuration
		$scope.$on('$viewContentLoaded', function() {
			
			// Decorate the 'body' with an appropriate ID for styling
			$('body').attr('id', 'project');

			$timeout(function() {

				var header = $('header'),
					filterBar = $('.filter-bar');

				if(header.length) {
					header.removeClass('hidden');
				}

				if(filterBar.length) {
					filterBar.removeClass('hidden');
				}
				
			}, 500);

		});

	}

	$scope.project = null;

	$scope.scrollToTop = scrollToTop;
	$scope.getProjectBannerUrl = getProjectBannerUrl;
	$scope.getProjectImageUrls = getProjectImageUrls;
	
	$scope.hasVimeoEmbed = hasVimeoEmbed;
	$scope.getSecureVimeoEmbedUrl = getSecureVimeoEmbedUrl;
	$scope.getVideoPaddingPercentage = getVideoPaddingPercentage;
	
	$scope.getStudentFullName = getStudentFullName;
	$scope.getStudentPortraitLocation = getStudentPortraitLocation;
	$scope.redirectToProject = redirectToProject;

	// Initialize the controller

	init();

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('background', [function() {

    return {
        
        restrict: 'A',
        
        scope: true,
        
        link: function(scope, elem, attrs) {
            
            var transitionSpeed = 950,
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
                                                transitionSpeed
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

.directive('filterBar', [function() {

    return {
                
        restrict: 'E',

        scope: {
        	'onChangeFilterSelection': '&'
       	},

        controller: 'FilterBarController',

        link: function (scope, elem, attrs) {

        },

        templateUrl: 'js/templates/filter-bar.tpl.html'

    };

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module("app")

.directive("filterMenu", [function() {

	return {
		
		restrict: 'E',
		
		scope: {
			'onChangeFilterSelection': '&'
		},

		controller: 'FilterMenuController',
		
		link: function(scope, elem, attrs) {

			function toggleFilterMenu() {
				elem.toggleClass('expanded');
			}

			scope.toggleFilterMenu = toggleFilterMenu;
			
		},

		templateUrl: 'js/templates/filter-menu.tpl.html'

	}

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

angular.module("app")

.directive("motionPromo", [function() {

	return {
		
		restrict: 'E',
		
		scope: true,
		
		link: function(scope, elem, attrs) {

			scope.video = elem.find('video').get(0);
			
		},

		templateUrl: 'js/templates/motion-promo.tpl.html'

	}

}]);

})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('projectGallery', ['$location', function($location) {

	return {
		
		restrict: 'E',
		
		scope: {
			projects: '=',
			mouseenter: '&',
			mouseleave: '&'
		},
		
		templateUrl: 'js/templates/project-gallery.tpl.html',

		link: function(scope, elem, attrs) {	
			
			function setCurrentProject(project) {
				scope.currentProject = project;
				// Fire external callback
				scope.mouseenter({ 'project': project });
			}

			function redirectToProject(project) {
				$location.path('/project/' + project.key);
			}

			scope.focus = attrs['focus'];
			scope.currentProject = null;
			scope.setCurrentProject = setCurrentProject;
			scope.redirectToProject = redirectToProject;

		}

	};

}]);


})(window, window.angular);

(function(window, angular, undefined) {

angular.module('app')

.directive('removeOnError', [function() {

	return {

		restrict: 'A',
		
		scope: true,

		link: function(scope, elem, attrs) {

			elem.bind('error', function(e) {
				e.preventDefault();
				elem.remove();
			});

		}

	};

}]);

})(window, window.angular);
(function(window, angular, undefined) {

angular.module('app')

.directive('slidingPreview', [function() {

	return {

		restrict: 'E',
		
		scope: { 'currentPreview': '=preview' },
		
		link: function(scope, elem, attrs) {

			/*
			function updatePreview(preview) {

				var prev = buffer.find('.preview.active'),
					next = buffer.find('.preview:not(.active)'),
					source = (preview !== null) ?
						'images/teasers/' + preview.students[0].sixplustwo + '_teaser.jpg'
						: 'images/blank.png';
				
				next.css({ 'background-image': 'url(\'' + source + '\')' });
				
				prev.add(next).toggleClass('active');

				lastPreview = preview;

			}

			var lastPreview = null;

			var buffer = elem.find('.preview-buffer');

			// Update the current preview image when appropriate
			scope.$watch('currentPreview', function(preview) {
				if(angular.isDefined(preview) && preview !== lastPreview) {
					updatePreview(preview);
				}
			});
			*/

			function updatePreview(preview) {

				var prev = buffer.find('.preview.active'),
					next = buffer.find('.preview:not(.active)');

				next.css({ 'background-image': 'url(\'images/teasers/' + preview.students[0].sixplustwo + '_teaser.jpg\')' });
				
				prev.add(next).toggleClass('active');

				lastPreview = preview;

			}

			var lastPreview = null;

			var buffer = elem.find('.preview-buffer');

			// Update the current preview image when appropriate
			scope.$watch('currentPreview', function(preview) {
				if(angular.isDefined(preview) && preview !== null && preview !== lastPreview) {
					updatePreview(preview);
				}
			});

		},

		templateUrl: 'js/templates/sliding-preview.tpl.html'

	};

}]);


})(window, window.angular);

(function(window, angular, undefined) {

angular.module("app")

.directive("videoControls", [function() {

	return {
		
		restrict: 'E',
		
		scope: {
			'video': '='
		},
				
		link: function(scope, elem, attrs) {

			function play(e) {
				scope.video.play();
			}

			function pause(e) {
				scope.video.pause();
			}			

			function replay(e) {
				scope.pause();
				scope.video.currentTime = 0;
				scope.play();
			}

			function init() {

				scope.playbackStatus = 'paused';

				// Video listeners

				scope.video.addEventListener('play', function(e) {
					scope.$apply(function() {
						scope.playbackStatus = 'playing';
					});
				});

				scope.video.addEventListener('pause', function(e) {
					scope.$apply(function() {
						scope.playbackStatus = 'paused';
					});
				});

				scope.video.addEventListener('ended', function(e) {
					scope.$apply(function() {
						scope.playbackStatus = 'ended';
					});
				});

				// Update appearance of <video-controls>

				scope.$watch('playbackStatus', function(status) {				
					elem.removeClass('playing paused ended')
						.addClass(status);
				});

				// Attach a listener to the <video> element itself

				$(scope.video).on('click', play);

			}

			scope.play = play;
			scope.pause = pause;
			scope.replay = replay;

			init();

		},

		templateUrl: 'js/templates/video-controls.tpl.html'

	};

}]);

})(window, window.angular);
(function(window, angular, undefined) {

angular.module('app')

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider.when('/project/:key', {
		controller: 'ProjectViewController',
		controllerAs: 'view',
		templateUrl: 'js/templates/view-project.tpl.html'
	});

	$routeProvider.when('/', {
		controller: 'LandingViewController',
	 	controllerAs: 'view',
		templateUrl: 'js/templates/view-landing.tpl.html'
	});

}]);

})(window, window.angular);

'use strict';

(function(window, angular, undefined) {

angular.module('app')

.config(['$routeProvider', function($routeProvider) {

	$routeProvider.otherwise({
		redirectTo: '/'
	});

}])

.run(['$rootScope', '$window', function($rootScope, $window) {

	$rootScope.$on('$routeChangeSuccess', function(e) {
		$window.scrollTo(0, 0);
	});

}]);

})(window, window.angular);
