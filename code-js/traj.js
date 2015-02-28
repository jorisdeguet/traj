//Angular module for votvot

//http://www.pluralsight.com/courses/angularjs-patterns-clean-code
//https://github.com/johnpapa/angularjs-styleguide
// https://github.com/MrRio/jsPDF
// to consider http://eonasdan.github.io/bootstrap-datetimepicker/

var eventSource;

var traj = angular.module('traj', ['traj.i18n','eventService','ngRoute','ui.bootstrap','angularSpinner','angulartics', 'angulartics.google.analytics']);

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
  when('/url/:url*', {
    templateUrl: 'angular-templates/traj-welcome.html',
    controller: 'ImportURLController'
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
    return dataURI;
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


traj.controller('AddEditController', function ($scope, $q,$filter,  $location, $routeParams, eventService) {
	if (typeof $routeParams.id != 'undefined' ){
    $scope.event = eventService.get($routeParams.id);
	}
  else{
    $scope.event = {};
    $scope.event.type = 'Ponctual';
  }
	console.log("id " + $routeParams.id);

  $scope.openStart = function($event) {
    console.log("Open");
    $event.preventDefault();
    $event.stopPropagation();

    $scope.openedStart = true;
  };

  $scope.openEnd = function($event) {
    console.log("Open");
    $event.preventDefault();
    $event.stopPropagation();

    $scope.openedEnd = true;
  };

	$scope.add = function(event) {
    // validation
    if (typeof $scope.event.title == 'undefined'){
      toastr.error($filter('translate')('ERROR_TITLE'));return;
    }
    if (typeof $scope.event.place == 'undefined'){
      toastr.error($filter('translate')('ERROR_PLACE'));return;
    }
    if (typeof $scope.event.lng == 'undefined'){
      var promise = geocodee($scope.event.place);
      promise.then(
        function(latlng) {
          console.log(latlng);
          console.log(latlng.lat());
          $scope.event.lng = latlng.lng();
          $scope.event.lat = latlng.lat();
          $scope.add($scope.event);
        },
        function(status) {
          toastr.error('Geocoder was not successful for the following reason: ' + status);
        }
      );
      return;
    }
    if (typeof $scope.event.date == 'undefined'){
      toastr.error($filter('translate')('ERROR_DATE'));return;
    }
    if (typeof $scope.event.type != 'undefined' &&
              $scope.event.type === 'Period'  &&
              typeof $scope.event.end == 'undefined'){
      toastr.error($filter('translate')('ERROR_DATE_END'));return;
    }
    if (typeof $scope.event.type != 'undefined' &&
              $scope.event.type === 'Period'  &&
              $scope.event.date >= $scope.event.end){
      toastr.error($filter('translate')('ERROR_DATE_SWAP'));return;
    }
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
    var promise = geocodee(address);
    promise.then(
      function(latlng) {
        map.setCenter(latlng);
        marker = new google.maps.Marker({
            map: map,
            position: latlng
        });
        $scope.event.lng = latlng.lng();
        $scope.event.lat = latlng.lat();
      },
      function(status) {
        toastr.error($filter('translate')('ERROR_GEOCODER') +" : " +status);
      }
    );
	}

  function geocodee(address) {
    var deferred = $q.defer();
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latlng = results[0].geometry.location;
        deferred.resolve(latlng);
      } else {
        deferred.reject(status);
      }
    });
    return deferred.promise;
  }

});

traj.controller('ImportURLController', function ($sce, $http, $window, eventService, $location, $routeParams) {
  var u = $routeParams.url;
  var url = $sce.trustAsResourceUrl(u);
  console.log("url " + url);
  $http.get(url).
  success(function(data, status, headers, config) {
    console.log("Success for results " + data.length  );
    var json = JSON.stringify(data);
    var link = LZString.compressToEncodedURIComponent(json);
    $location.path('/import/'+link);
  }).
  error(function(data, status, headers, config) {
    toastr.error("Error on this");
    console.log("Error " + data );
  });

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
      $location.path('/main');
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
    if ($scope.events.length == 0 ) {$location.path('/main');}
  }

  $scope.import = function(event){
    console.log("adding " + event);
    $scope.remove(event);
    eventService.add(event);
  }
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
          $location.path('/main');
          $route.reload();
		    }
		    reader.onerror = function (evt) {
		        console.log("error reading file");
		    }
        $location.path('/main');
        $route.reload();
		}
	}
});
