//TODO http://stackoverflow.com/questions/12506329/how-to-dynamically-change-header-based-on-angularjs-partial-view

//Angular module for votvot

//http://www.pluralsight.com/courses/angularjs-patterns-clean-code
//https://github.com/johnpapa/angularjs-styleguide

var eventSource;

var traj = angular.module('traj', ['traj.i18n','eventService','ngRoute','ui.bootstrap','angularSpinner']);

//Define Routing for app
//Uri /AddNewOrder -> template add_order.html and Controller AddOrderController
traj.config(['$routeProvider',
               function($routeProvider) {
	$routeProvider.
	when('/add', {
		templateUrl: 'angular-templates/traj-add.html',
		controller: 'AddEditController'
	}).
	when('/edit/:id', {
		templateUrl: 'angular-templates/traj-add.html',
		controller: 'AddEditController'
	}).
	when('/welcome', {
		templateUrl: 'angular-templates/traj-welcome.html',
		controller: 'WelcomeController'
	}).
  when('/import/:data', {
    templateUrl: 'angular-templates/traj-import.html',
    controller: 'ImportController'
  }).
	when('/main', {
		templateUrl: 'angular-templates/traj-main.html',
		controller: 'MainController'
	}).
  when('/share/:id', {
    templateUrl: 'angular-templates/traj-share.html',
    controller: 'ShareController'
  }).
	when('/list', {
		templateUrl: 'angular-templates/traj-list.html',
		controller: 'ListController'
	}).
	otherwise({
		redirectTo: '/welcome'
	});
}]);

traj.filter('urlencode', function() {
  return window.encodeURIComponent;
});

traj.config( [
    '$compileProvider',
    function( $compileProvider )
    {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
    }
]);

traj.controller('LocaleController', function ($scope, $translate) {
	$scope.changeLanguage = function (key) {
		$translate.use(key);
	};
});

traj.controller('NavbarController', function ($scope, $location, eventService, $route) {
  $scope.numberOfEvents = function(){
    return eventService.traj.length;
  }

  $scope.allAsJson = function(){
		var json = eventService.allAsJson();
    //console.log(json);
		var dataURI = 'data:application/traj;charset=utf-8,' + encodeURIComponent(json);
		//console.log(dataURI);
    return dataURI;
		//window.open(dataURI,"_blank");
	}

  $scope.shareAll = function(){
    var compressed = LZString.compressToEncodedURIComponent(eventService.allAsJson());
    console.log("Size of compressed sample is: " + compressed.length);
    console.log(compressed);
    var recov = LZString.decompressFromEncodedURIComponent(compressed);
    console.log("Sample is: " + (recov === eventService.allAsJson()));
    var dataURI = '#import/' + compressed;
    window.open(dataURI,'_blank');
  }

	$scope.empty = function(){
    eventService.empty();
    $route.reload();
	}
});

traj.controller('ListController', function ($scope, eventService) {
	$scope.list = eventService.traj;

	$scope.remove = function(id){
    eventService.remove(id);
	}
});


traj.controller('AddEditController', function ($scope,  $location, $routeParams, eventService) {
	if (typeof $routeParams.id != 'undefined' ){
    $scope.event = eventService.get($routeParams.id);

	}
	console.log("id " + $routeParams.id);
	$scope.add = function(event) {
    eventService.add(event);

    $location.path( "/list" );
	};

	$scope.codeAddress = function() {
		  var address = document.getElementById('address').value;
		  geocoder = new google.maps.Geocoder();
		  geocoder.geocode( { 'address': address}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
		      map.setCenter(results[0].geometry.location);
		      var marker = new google.maps.Marker({
		          map: map,
		          position: results[0].geometry.location
		      });
		      console.log(results[0].geometry.location);
		      $scope.event.lng = results[0].geometry.location.D;
		      $scope.event.lat = results[0].geometry.location.k;
		      console.log($scope.event);
		    } else {
		      alert('Geocode was not successful for the following reason: ' + status);
		    }
		 });
	}
});

traj.controller('ImportController', function ($scope,eventService, $location, $routeParams) {
  var data = $routeParams.data;
  console.log("data " + data);
  var json = LZString.decompressFromEncodedURIComponent(data);
  $scope.events = JSON.parse(json);

  $scope.import = function(event){
    console.log("adding " + event);
    eventService.add(event);
    var index = 0;
    for (var i = 0 ; i < $scope.events.length ; i++){
      var elt = $scope.events[i];
      if (elt.id === event.id) index = i;
    }
    $scope.events.splice(index, 1);
    // nothing more to import go to the list
    if ($scope.events.length == 0 ) {$location.path('/list');}
  }
  //console.log(events);
});

traj.controller('ShareController', function ($scope, eventService, $routeParams) {
  var id = $routeParams.id;
  $scope.event = eventService.get(id);
  $scope.json = JSON.stringify([$scope.event]);
  $scope.link = LZString.compressToEncodedURIComponent($scope.json);

});

traj.controller('MainController', function ($scope, eventService, $location) {
  $scope.markersMap = {};
  var info = new google.maps.InfoWindow({content: ""});
  $scope.$on('$viewContentLoaded', function(){
    items.clear();
    console.log("map");
    console.log(map);

    var marker;
    console.log("Main is starting " + eventService.traj);
    var path = [];
    var bounds = new google.maps.LatLngBounds();
    for	(index = 0; index < eventService.traj.length; index++) {
      var event = eventService.traj[index];
      console.log(" adding to timeline and map ");

      var myLatlng = new google.maps.LatLng(event.lat,event.lng);
      path.push(myLatlng);
      map.setCenter(myLatlng);
        marker = new google.maps.Marker({
              map: map,
              position: myLatlng,
              title:event.title
        });
        var idid = angular.copy(event.id);
        google.maps.event.addListener(marker, 'click', (function(marker, idid) {
            return function() {
              map.setZoom(8);
            map.panTo(marker.getPosition());
            console.log("Click on " + idid);
            info.close();//hide the infowindow
            info.setContent('<p>'+idid+'</p>');
            info.open(map, marker);//"move" the info window to the clicked marker and open it
            }
          })(marker, idid));
      $scope.markersMap[idid] = marker;
      bounds.extend(myLatlng);
      console.log(event);
      items.add([{id: event.id, content: event.title, start: event.date}]);
    }
    var flightPath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#444444',
      strokeOpacity: 0.5,
      strokeWeight: 3
    });

    flightPath.setMap(map);
    map.fitBounds(bounds);
    timeline.fit();
    timeline.on('select', function (properties) {
        var id = properties.items[0];
        console.log('selected items: ' + id);
        console.log( properties);
        timeline.focus(id);
        var marker = $scope.markersMap[id];
        // get the good marker in the maps
        map.panTo(marker.getPosition());
        info.close();//hide the infowindow
        info.setContent('<p>'+idid+'</p>');
        info.open(map, marker);//"move" the info window to the clicked marker and open it
    });

  });

});


traj.controller('WelcomeController', function ($scope, $http, eventService, $route, $location) {
  $scope.loadFromURL = function(){
    var url = document.getElementById("urlToLoad").value;
    console.log("From URL "  +url);
    $http.get(url).
    success(function(data, status, headers, config) {
      console.log("Success for results " + data.length  );
    }).
    error(function(data, status, headers, config) {
      console.log("Error " + data );
    });
  }

	$scope.load = function(){
		var file = document.getElementById("fileForUpload").files[0];
		if (file) {
		    var reader = new FileReader();
		    reader.readAsText(file, "UTF-8");
		    reader.onload = function (evt) {
		    	// parse it as json
		    	var events = JSON.parse(evt.target.result);
		    	//console.log(evt.target.result);
		    	console.log(events);
          for (var i = 0 ; i < events.length ; i++ ){
            var event = events[i];
            eventService.add(event);
          }
          $location.path('/list');
          $route.reload();
		    }
		    reader.onerror = function (evt) {
		        console.log("error reading file");
		    }
        $location.path('/list');
        $route.reload();
		}
	}
});

traj.directive('mapCanvas2', function() {
	  return {
		    link: function(scope, element) {

		    	  var latlng = new google.maps.LatLng(-34.397, 150.644);
		    	  var mapOptions = {
		    	    zoom: 10,
		    	    center: latlng
		    	  }
		    	  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		    }
	 };
});

traj.directive('mapCanvas', function() {
	  return {
		  scope: {},
		  link: function(scope, element) {
			      var mapOptions = {
			        center: { lat: 45.0, lng: -75.0},
			        zoom: 3
			      };
			      map = new google.maps.Map(element[0], mapOptions);
	 }
	 };
});
