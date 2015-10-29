angular.module( 'ngBoilerplate.demo1', [
  'ui.router',
  'ui.calendar'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'demo1', {
    url: '/demo1',
    views: {
      "main": {
        controller: 'Demo1Ctrl',
        templateUrl: 'demo1/demo1.tpl.html'
      }
    },
    data:{ pageTitle: 'The demo' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'Demo1Ctrl', function HomeController( $scope )
{
	var refresh = function() {
		//Change the view back and forth to force an update
		var viewName = uiCalendarConfig.calendars.theCalendar.fullCalendar('getView').name;
		uiCalendarConfig.calendars.theCalendar.fullCalendar('changeView',
			'month');
		uiCalendarConfig.calendars.theCalendar.fullCalendar('changeView',
			viewName);
		$scope.selectedEvent = undefined;
	};

	var updateEvent = function(source, value) {
		//Update the event information in the original database
		for(var i = 0; i < source.length; ++i) {
			if(source[i].id === value.id) {
				for(var x in value) {
					if(value.hasOwnProperty(x)) {
						source[i][x] = value[x];
					}
				}
			}
		}

		console.log(eventArray);
	};

	$scope.selectedEvent = undefined;

	$scope.commitChange = function() {
		$scope.selectedEvent.title = $scope.editorTitle;
		updateEvent(eventArray,$scope.selectedEvent);
		$scope.selectedEvent = undefined;
	};

	$scope.deleteEvent = function() {
		var se = $scope.selectedEvent;
		for(var i = 0; i < eventArray.length; ++i) {
			if(eventArray[i].id === se.id) {
				eventArray.splice(i,1);
				break;
			}
		}
		$scope.selectedEvent = undefined;
	};

	eventArray =  [
		{
			id: 'id1',
			title: 'The event',
			start: '2015-10-18T10:00:00',
			end: '2015-10-18T12:00:00',
			resourceId: 'A1'
		}
	];

	resourceArray = [
		{
			id: 'A1',
			title: 'Resource #1'
		},
		{
			id: 'A2',
			title: 'Resource #2'
		}
	];

	$scope.resourceArray = resourceArray;

	var nextId = 1;

	$scope.eventSources = [ eventArray ];
	$scope.uiConfig = {
		calendar: {
			defaultView: 'timelineCustom',
			editable: true,
			resources: resourceArray,
			dayClick: function(date, jsEvent, view, resource) {
				var newEvent = {
					id: ('kuter' + nextId++),
					title: 'New event',
					start: date.format(),
					end: date.add(3,'hour').format(),
					resourceId: resource.id
				};

				eventArray.push(newEvent);
			},
			eventClick: function(event, jsEvent, view) {
				$scope.selectedEvent = event;
				$scope.editorTitle = event.title;
			},
			eventDrop: function(event, delta, revertFunc, jsEvent, ui, view) {
				updateEvent(eventArray, event);
			},
			eventResize: function(event, delta, revertFunc, jsEvent, ui, view) {
				updateEvent(eventArray, event);
			},
			header: {
				left: 'timelineCustom month',
				center: 'title',
				right: 'today prev,next'
			},
			views: {
				timelineCustom: {
					type: 'timeline',
					duration: {
						days: 5
					}
				}
			}
		}
	};

	var nextResourceId = 3;

	$scope.addResource = function() {
		resourceArray.push({
			id: 'Resource' + nextResourceId,
			title: 'Resource #' + nextResourceId++
		});
	};

	$scope.removeResource = function() {
		resourceArray.pop();
	};

	$scope.addDay = function() {
		if($scope.uiConfig.calendar.views.timelineCustom.duration.days < 10) {
			++$scope.uiConfig.calendar.views.timelineCustom.duration.days;
		}
	};

	$scope.removeDay = function() {
		if($scope.uiConfig.calendar.views.timelineCustom.duration.days > 1) {
			--$scope.uiConfig.calendar.views.timelineCustom.duration.days;
		}
	};
});
