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
  when('/shareAll', {
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

  $scope.allAsDataURL = function(){
		var json = eventService.allAsJson();
    //console.log(json);
		var dataURI = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
		//console.log(dataURI);
    return dataURI;
		//window.open(dataURI,"_blank");
	}

  // $scope.shareAll = function(){
  //   var compressed = LZString.compressToEncodedURIComponent(eventService.allAsJson());
  //   console.log("Size of compressed sample is: " + compressed.length);
  //   console.log(compressed);
  //   var recov = LZString.decompressFromEncodedURIComponent(compressed);
  //   console.log("Sample is: " + (recov === eventService.allAsJson()));
  //   var dataURI = '#import/' + compressed;
  //   window.open(dataURI,'_blank');
  // }

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
  else{
    $scope.event = {};
    $scope.event.type = 'Ponctual';
  }
	console.log("id " + $routeParams.id);
	$scope.add = function(event) {
    // TODO validation
    eventService.add(event);
    $location.path( "/list" );
	};

  $scope.change = function() {
    var address = document.getElementById('address').value;
    console.log("adress " + address);
  }
  var marker;
	$scope.codeAddress = function() {
		  var address = document.getElementById('address').value;
		  geocoder = new google.maps.Geocoder();
		  geocoder.geocode( { 'address': address}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
		      map.setCenter(results[0].geometry.location);
		      marker = new google.maps.Marker({
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

traj.controller('ImportController', function ($scope,filterFilter, eventService, $location, $routeParams) {
  var data = $routeParams.data;
  console.log("data " + data);
  var json = LZString.decompressFromEncodedURIComponent(data);
  $scope.events = JSON.parse(json);

  $scope.importAll = function(list){
    var toImport = filterFilter(list, $scope.query);
    console.log(toImport);
    for (var i = 0 ; i < toImport.length ; i++){
      var elt = toImport[i];
      eventService.add(elt);
      $location.path('/list');
    }
  }

  $scope.remove = function(event){
    console.log("removing " + event);
    var index = 0;
    for (var i = 0 ; i < $scope.events.length ; i++){
      var elt = $scope.events[i];
      if (elt.id === event.id) index = i;
    }
    $scope.events.splice(index, 1);
    // nothing more to import go to the list
    if ($scope.events.length == 0 ) {$location.path('/list');}
  }

  $scope.import = function(event){
    console.log("adding " + event);
    $scope.remove(event);
  }
  //console.log(events);
});

traj.controller('ShareController', function ($scope, eventService, $routeParams) {
  var id = $routeParams.id;
  if (typeof $routeParams.id == 'undefined'){
    console.log("Share all ");
    $scope.json = eventService.allAsJson();
    //console.log(json);
    $scope.link = LZString.compressToEncodedURIComponent($scope.json);
    //var dataURI = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
  }
  else{
    console.log("Share one " + id);
    var event = eventService.get(id);
    $scope.json = JSON.stringify([event]);
    $scope.link = LZString.compressToEncodedURIComponent($scope.json);
  }
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
