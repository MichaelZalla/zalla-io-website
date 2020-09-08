var tagApp = angular.module('tagApp', ['ngRoute','ngSanitize'])
	.config(function($routeProvider) {
		$routeProvider
			.when('/home', {
				templateUrl: './views/view.landing.html',
				controller: HomeCtrl
			})
			.when('/players/:id', {
				templateUrl: './views/view.player.html',
				controller: PlayerCtrl
			})
			.when('/teams', {
				templateUrl: './views/view.teams.html',
				controller: TeamsCtrl
			})
			.when('/teams/:id', {
				templateUrl: './views/view.team.html',
				controller: TeamCtrl
			})
			.when('/schedule', {
				templateUrl: './views/view.schedule.html',
				controller: ScheduleCtrl
			})
			.otherwise({ redirectTo: '/home' })
	})
	/*
	.config(function($rootScopeProvider) {
		$rootScopeProvider.digestTtl(1000);
	});
	*/

tagApp.directive('resizeToMatchHistory', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			/*
			angular.element('.match-history').ready(function() {
				var height = $('.match-history')[0].scrollHeight
				console.log(height);
			});

			elem.css({ 'height': $('.match-history')[0].scrollHeight + 'px' });
			*/
		}
	};
});
/*
tagApp.directive('backgroundImage', function(){
    return {
    	restrict: 'A',
    	scope: {
    		//isolatedBackgroundImage: '=backgroundImage',
    		backgroundImage: '@',
    	},
	    link: function(scope, element, attrs) {
	        //var url = attrs.backgroundImage;
	        //	var url = backgroundImage;
	        	
	        window.ds = scope;

	        element.css({
	            //'background-image': 'url(' + url +')',
	            'background-image': "url('" + scope.backgroundImage + "')",
	            'background-size' : 'cover'
	        });
	    }
	};
});
*/

tagApp.directive('animateBands', function() {
	return function(scope, element, attrs) {
		element.on('mousemove', function(e) {
			var position_str = e.offsetX + 'px 0px';
			element.css('background-position', position_str);
		});
	}
});

function AppCtrl($scope, $rootScope, $route, $http, $window, $timeout) {

	window.s = $scope;

	//Fetch application data
	$http.get('./models/players.json').success(function(data) {
		$scope.players = data;
	});
	$http.get('./models/teams.json').success(function(data) {
		$scope.teams = data;
	});
	$http.get('./models/titles.json').success(function(data) {
		$scope.titles = data;
	});
	$http.get('./models/generated_matches.json').success(function(data) {
		$scope.matches = data;
	});

	//Wrap child controller dependencies in an object
	$scope.state = { };
	$scope.state.activeSession = false;
	//$scope.state.session_id = null;
	$scope.user = { };

	$scope.filter = function(list, id) {
		for(var i in list) {
			var item = list[i];
			if(item.id == id) return item;
		}
	}

	$scope.weekdays = ['Sunday', 'Monday', 'Tuesday','Wednesday','Thursday','Friday','Saturday'];

	$scope.getHours = function(date) {
		return (date.getHours() > 9) ? '' + date.getHours() : '0' + date.getHours();
	};

	$scope.getMinutes = function(date) {
		return (date.getMinutes() > 9) ? '' + date.getMinutes() : '0' + date.getMinutes();
	};

	$scope.getMatchDate = function(match) {
		return moment(match.time).toDate();
	};

	$scope.getMatchDateLabel = function(match) {
		if(match != null) {
			var d = $scope.getMatchDate(match);
			return $scope.weekdays[d.getDay()] + " " + d.getDate() + ", " + d.getFullYear();
		} else { return ''; }
	};

	//Automatic redirect if the user is not 'logged in'
	window.location = '#/home';
	
	$scope.logout = function() {
		$timeout(function() {
			$scope.state.activeSession = false;
			$window.location = '#/home';
		}, 575);
	};

	//Masthead parallax
	$(window).on('scroll', function(e) {
		var content_mask = $(this);
		var content_height = $('body')[0].scrollHeight;
		var scroll_percentage = (content_mask.scrollTop() / (content_height - content_mask.height()));
		if(scroll_percentage > 0) {
			var y_offset = 80 * scroll_percentage;
			var position = '0% ' + y_offset + '%';
			$('.masthead').css({
				'background-position': position
			});
		}
	});

}

function HeaderCtrl($scope, $timeout) {

	$scope.login = function() {
		//$scope.state.activeSession = true;
		$timeout(function() {
			$('#login-email-field, #login-password-field').val('');
			//Skip validation and fake a user login
			$scope.$parent.user = $scope.filter($scope.players, 5);
			$scope.$parent.state.activeSession = true;
			//Redirect to player's own profile
			window.location = './#/players/' + $scope.$parent.user.id;
		}, 575);
	};
	
	$('.header').ready(function() {
		$('.header').on('enterKey', '#login-email-field', function(e) {
			$('#login-password-field').focus();
		});
		$('.header').on('enterKey', '#login-password-field', function(e) {
			$scope.login();
		});
		$('.header').keyup('.text-field', function(e) {
			if(e.keyCode == 13) { $(e.target).trigger('enterKey'); }
		});
	});

	//For testing
	//$scope.login();

}

function HomeCtrl($scope) {
	
	$(document).scrollTop(0);

	current_view = 'home';
	//Tag the view container with the view-specific class
	$('.view-content').addClass('landing-view');
	//Focus the email field when the user choses to login
	$('#login-button').on('click', function() {
		$('#login-email-field').focus();
	});
}

function PlayerCtrl($scope, $http, $routeParams) {
	
	$(document).scrollTop(0);

	current_view = 'player';
	//Store a reference to the appropriate team object, given the route parameter
	$scope.player = $scope.filter($scope.players, parseInt($routeParams.id));

	$scope.getMatchesByPlayer = function() {
		var matches = [ ];
		for(var i in $scope.matches) {
			var match = $scope.matches[i];
			if(match.hasOwnProperty('winner') && (
			   $scope.player.teams.indexOf(match.offered_by) > -1 ||
			   $scope.player.teams.indexOf(match.offered_to) > -1)) {
				matches.push(match);
			}
		}
		return matches;
	}

	$scope.getMatchResult = function (match) {
		if(match.hasOwnProperty('winner')) {
			if($scope.player.teams.indexOf(match.winner) > -1) {
				return 'win';
			}
		}
		return 'loss';
	}

	$scope.getMatchSummary = function(match) {
		var ret = "Team " + $scope.getTeamOrderByPlayer(match)[0].name;
		if($scope.getMatchResult(match) == 'win') {
			ret += " defeated team ";
		} else {
			ret += " was defeated by team ";
		}
		ret += $scope.getTeamOrderByPlayer(match)[1].name + " in a ";
		ret += $scope.filter($scope.titles, match.title).name + " match for ";
		ret += match.bounty + " Bounty.";
		return ret;
	}

	$scope.getTeamOrderByPlayer = function(match) {
		if($scope.player.teams.indexOf(match.offered_by) > -1) {
			return [$scope.teams[match.offered_by],
					$scope.teams[match.offered_to]];
		}
		return [$scope.teams[match.offered_to],
				$scope.teams[match.offered_by]];
	}

	$scope.getDateAgeByDays = function(time) {
		var today = new Date();
		var then = moment(time).toDate();
		var day_length = 24*60*60*1000;
		var ms_difference = Math.abs(then.getTime() - today.getTime());
		return Math.round(ms_difference/day_length);
	}

	//Tag the view container with the view-specific class
	$('.view-content').addClass('player-view');
	//Update the player masthead image
	$('.masthead').css({
		'background-image':
		'url(./common/images/players/' + $scope.player.id + '/player-masthead.png)'
	});
}

function TeamsCtrl($scope, $http) {
	
	$(document).scrollTop(0);

	current_view = 'teams';
	//Tag the view container with the view-specific class
	$('.view-content').addClass('player-view');
}

function TeamCtrl($scope, $http, $routeParams) {
	
	$(document).scrollTop(0);

	$scope.getMatchesByTeam = function() {
		var matches = [ ];
		for(var i in $scope.matches) {
			var match = $scope.matches[i];
			if(match.hasOwnProperty('winner') && (
			   match.offered_by == $scope.team.id ||
			   match.offered_to == $scope.team.id)) {
				matches.push(match);
			}
		}
		return matches;
	}

	$scope.getMatchResult = function (match) {
		if(match.hasOwnProperty('winner')) {
			if($scope.team.id == match.winner) {
				return 'win';
			}
		}
		return 'loss';
	}

	$scope.getMatchSummary = function(match) {
		var ret = "Team " + $scope.getTeamOrderByTeam(match)[0].name;
		if($scope.getMatchResult(match) == 'win') {
			ret += " defeated team ";
		} else {
			ret += " was defeated by team ";
		}
		ret += $scope.getTeamOrderByTeam(match)[1].name + " in a ";
		ret += $scope.filter($scope.titles, match.title).name + " match for ";
		ret += match.bounty + " Bounty.";
		return ret;
	}

	$scope.getTeamOrderByTeam = function(match) {
		if($scope.team.id == match.offered_by) {
			return [$scope.teams[match.offered_by],
					$scope.teams[match.offered_to]];
		}
		return [$scope.teams[match.offered_to],
				$scope.teams[match.offered_by]];
	}

	current_view = 'team';
	//Store a reference to the appropriate team object, given the route parameter
	$scope.team = $scope.filter($scope.teams, parseInt($routeParams.id));
	//Tag the view container with the view-specific class
	$('.view-content').addClass('team-view');
	//Update the team's masthead source
	$('.masthead').css({
		'background-image':
		'url(' + $scope.team.masthead + ')'
	});
	//Scale the height of the team roster div
	$scope.$on('$viewContentLoaded', function() {
		$('.team-roster, .match-history').css({
			'height': $('.match-history')[0].scrollHeight
		});
	});

}

function ScheduleCtrl($scope, $http) {
	
	window.ss = $scope;

	$(document).scrollTop(0);

	/* Team-related model data */

	//$scope.visibleTeams = $scope.user.teams;
	$scope.visibleTeams = [];

	$scope.toggleVisibility = function(team_id) {
		//console.log("Toggling!");
		var index = $scope.visibleTeams.indexOf(team_id);
		if(index > -1) {
			//Remove the team id from the list of visible teams
			$scope.visibleTeams.splice(index, 1);
		} else {
			$scope.visibleTeams.push(team_id);
		}
	}

	$scope.teamIsVisible = function(team_id) {
		var index = $scope.visibleTeams.indexOf(team_id);
		return (index > -1);
	}

	/* Match-related model data */

	$scope.week = ['2013-12-08', '2013-12-09', '2013-12-10', '2013-12-11', '2013-12-12'];

	$scope.getLabelByWeekday = function(weekday) {
		return $scope.weekdays[moment(weekday).toDate().getDay()];
	}

	$scope.getMatchesByDate = function(date) {
		var ret = [ ];
		for(var i in $scope.matches) {
			var match = $scope.matches[i];
			if(match.time.split('T')[0] == date) { ret.push(match); }
		}
		return ret;
	}

	$scope.filterMatchesByTime = function(matches) {
		var copy = matches.slice(0);
		return copy.sort(function(a,b) {
			if($scope.getMatchDate(a) > $scope.getMatchDate(b)) {
				return 1;
			}
			if($scope.getMatchDate(a) < $scope.getMatchDate(b)) {
				return -1;
			}
			return 0;
		});
	}

	$scope.matchIsVisible = function(match) {
		return ($scope.visibleTeams.indexOf(match.offered_by) > -1 ||
				$scope.visibleTeams.indexOf(match.offered_to) > -1);
	}

	$scope.selected_match = null;
	$scope.selected_match_background = null;
	$scope.select = function(match) {
		$scope.selected_match = match;
		$scope.selected_match_background = "url('./common/images/schedule/"
											+ $scope.selected_match.title
											+ ".png')";
	}

	//Tag the view container with the view-specific class
	$('.view-content').addClass('schedule-view');

}

