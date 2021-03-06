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
.controller( 'Demo1Ctrl', function HomeController( $scope ) {
	var actionId = null;

	eventArray =  [
		{
			id: 'id1',
			divId: 'id1',
			title: 'The event',
			start: '2015-11-07T10:00:00',
			end: '2015-11-07T12:00:00',
			resourceId: 'A1'
		},
		{
			id: 'id2',
			divId: 'id2',
			title: 'The event',
			start: '2015-11-07T06:00:00',
			end: '2015-11-07T08:00:00',
			resourceId: 'A2'
		}
	];

		var calendar = document.getElementById('theCalendar');
		var h = new Hammer.Manager(calendar,null);
		h.add(new Hammer.Pinch());
		h.add(new Hammer.Tap());
		var origScale = 1;
		var origSize = 0;
		var currentSize = 0;
		var pinchInProgress = false;

		var skipUnwantedElements = function(q) {
			var cl = q.attr('class');
			if (cl !== 'fc-title' && cl !== 'fc-content') {
				return false;
			}
			return true;
		};

		var findElement = function(ev) {
			//Go up the hierarchy toward the <a> element which will contain the
			//calendar event's id
			var el = $(ev.target);
			while(!el.is('a')) {
				el = el.parent();
			}
			return el;
		};

		h.on('pinchstart', function(ev) {
			if(pinchInProgress) {
				return;
			}
			if(!skipUnwantedElements($(ev.target))) {
				return;
			}
			origScale = 1;
			pinchInProgress = true;
			var el = findElement(ev);
			currentSize = $(el).css('width');
			currentSize = Number(currentSize.match(/[0-9]*/)[0]);
			origSize = currentSize;
			var rect = el.get(0).getBoundingClientRect();
			var left = rect.left;
			var top = rect.top + window.scrollY;
			var length = rect.width;
			$('#overlayDiv').css('display', 'block');
			$('#overlayDiv').css('left', left);
			$('#overlayDiv').css('top', top);
			$('#overlayDiv').css('width', length);
			origScale = ev.scale;
		});

		h.on('pinchmove', function(ev) {
			if(!pinchInProgress) {
				return;
			}
			if(!skipUnwantedElements($(ev.target))) {
				return;
			}
			currentSize = $('#overlayDiv').css('width');
			currentSize = Number(currentSize.match(/[0-9]*/)[0]);
			var scale = origScale - ev.scale;
			scale = -scale;
			origScale = ev.scale;
			var size = currentSize + 100 * scale;
			currentSize = size;
			$('#overlayDiv').css('width', size);
		});
		var endHandler = function(ev) {
			if(!pinchInProgress) {
				return;
			}
			if(!skipUnwantedElements($(ev.target))) {
				return;
			}
			$('#overlayDiv').css('left', -100); //barbaric, but works for now
			$('#overlayDiv').css('display', 'none');
			//Compute how much we increased the width
			var increase = currentSize / origSize;
			var el = findElement(ev); //finds the <a> element corresponding to the
			//calendar event in the DOM hierarchy
			var id = el.attr('id');
			//We will now find this event in the source array
			var found = null;
			for(var i = 0; i < eventArray.length; ++i) {
				var candidate = eventArray[i];
				if(candidate.id === id) {
					found = candidate;
					break;
				}
			}
			if(found) {
				//Get a proportion of minutes per pixels so we know how to adjust the width
				var minutes = moment.duration(moment(found.end).diff(moment(found.start))).asMinutes();
				var mpp = (1.0 * minutes / currentSize);
				var newDuration = minutes * increase;
				//Round down to half-hours:
				newDuration = Math.floor(newDuration / 30.0) * 30;
				//Compute the new ending time and update the calendar event
				var newEnd = moment(found.start).add(newDuration, 'm');
				found.end = newEnd;
				refresh();
			}

			pinchInProgress = false;
		};

		h.on('pinchend', endHandler);
		h.on('pinchcancel', endHandler);

		var refresh = function() {
			$scope.$apply();
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
				editable: false,
				resources: resourceArray,
				dayClick: function(date, jsEvent, view, resource) {
					var eventId = ('kuter' + nextId++);
					var newEvent = {
						id: eventId,
						divId: (function() { return eventId; })(),
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
