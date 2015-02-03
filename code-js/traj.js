//TODO http://stackoverflow.com/questions/12506329/how-to-dynamically-change-header-based-on-angularjs-partial-view

//Angular module for votvot

//http://www.pluralsight.com/courses/angularjs-patterns-clean-code
//https://github.com/johnpapa/angularjs-styleguide

var eventSource;

var traj = angular.module('traj', ['ngRoute','ui.bootstrap','pascalprecht.translate','angularSpinner']);

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
	when('/main', {
		templateUrl: 'angular-templates/traj-main.html',
		controller: 'MainController'
	}).
	when('/list', {
		templateUrl: 'angular-templates/traj-list.html',
		controller: 'ListController'
	}).
	otherwise({
		redirectTo: '/welcome'
	});
}]);

traj.config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setDefaults({color: 'green'});
}]);

traj.config(function ($translateProvider) {
	$translateProvider.translations('en', {
		TITLE: 'Traj',
		YES : 'Yes',
		NO : 'No',
		CREATE : 'Create',
		LANGUAGE : 'Language',
		RESULTS : 'Results',
		SEARCH : 'Search',
		LIST : 'List',
		MAP : 'Map',
		ADD : 'Add',
    SAVE : 'Save',
    FLUSH : 'Flush'
	});
	$translateProvider.translations('fr', {
		TITLE: 'Traj',
		YES:'Oui',
		NO : 'Non',
		CREATE : 'Créer',
		LANGUAGE : 'Langue',
		RESULTS : 'Résultats',
		SEARCH : 'Rechercher',
		LIST : 'Liste',
		MAP : 'Carte',
		ADD : 'Ajouter',
    SAVE : 'Sauver',
    FLUSH : 'Vider'
	});
	$translateProvider.preferredLanguage('fr');
});

traj.controller('LocaleController', function ($scope, $translate) {
	$scope.changeLanguage = function (key) {
		$translate.use(key);
	};
});

traj.controller('NavbarController', function ($scope, $window,  $translate, $rootScope) {
	$scope.save = function(){
		console.log($window.localStorage.traj);
		var json = $window.localStorage.traj;
		var dataURI = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
		console.log(json);
		console.log(dataURI);
		console.log("root scope :");
		console.log($rootScope.traj);
		window.open(dataURI,'_blank');
	}

	$scope.empty = function(){
		delete $window.localStorage.traj;
		delete $rootScope.traj;
		console.log("Apres vidage");
		console.log($rootScope.traj);
	}
});

traj.controller('ListController', function ($scope, $window,  $translate, $rootScope) {
	console.log("In rootScope");
	console.log($rootScope.traj);
	console.log("In LocalStorage");
	console.log($window.localStorage.traj);
	if (typeof $rootScope.traj == 'undefined' && typeof $window.localStorage.traj != 'undefined'){
		console.log("parsing");
		$rootScope.traj = JSON.parse($window.localStorage.traj);
	}
	console.log("After In rootScope");
	console.log($rootScope.traj);
	console.log("After In LocalStorage");
	console.log($window.localStorage.traj);
	$scope.list = $rootScope.traj;

	$scope.remove = function(id){
		console.log("remove " + id );
		var index = 0;
		for (var i = 0 ; i < $rootScope.traj.length ; i++){
			var elt = $rootScope.traj[i];
			if (elt.id === id) index = i;
		}
		$rootScope.traj.splice(index, 1);
		console.log($rootScope.traj);
	}
});


traj.controller('AddEditController', function ($scope, $modal, $window, $location, $routeParams, $http,$rootScope, usSpinnerService) {
	if (typeof $routeParams.id != 'undefined' && typeof $rootScope.traj != 'undefined'){
		for (var i = 0 ; i < $rootScope.traj.length ; i++){
			var evt = $rootScope.traj[i];
			if (evt.id === $routeParams.id){
				console.log("Found it");
				$scope.event = angular.copy(evt);
			}
		}
	}
	console.log("id " + $routeParams.id);
	if ( typeof $rootScope.traj == 'undefined' ) $rootScope.traj = [];
	$scope.add = function(event) {
		if (typeof event.id == 'undefined'){
			event.id  = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
			$rootScope.traj.push(event);
		}
		else{
			for (var i = 0 ; i < $rootScope.traj.length ; i++){
				var evt = $rootScope.traj[i];
				if (evt.id === $routeParams.id){
					console.log("Found it and going to replace");
					$rootScope.traj[i] = event;
				}
			}
		}
		$location.path( "/list" );
		console.log(event);
		console.log($rootScope.traj);
		$window.localStorage.traj = JSON.stringify($rootScope.traj, undefined, 2);

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

traj.controller('MainController', function ($scope, $modal, $window, $rootScope ,$location, $http, usSpinnerService) {
  $scope.$on('$viewContentLoaded', function(){
    items.clear();
    console.log("map");
    console.log(map);
    if (typeof $rootScope.traj != 'undefined'){
      var marker;
      console.log("Main is starting " + $rootScope.traj);

      for	(index = 0; index < $rootScope.traj.length; index++) {
          var event = $rootScope.traj[index];
        console.log(" adding to timeline and map ");

        var myLatlng = new google.maps.LatLng(event.lat,event.lng);
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
        console.log(event);
        items.add([{id: event.id, content: event.title, start: event.date}]);
      }
      timeline.fit();
    }
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
  $scope.markersMap = {};
  var info = new google.maps.InfoWindow({content: ""});
	$scope.coucou = function() {

	}


});


traj.controller('WelcomeController', function ($scope, $modal, $window, $rootScope ,$location, $http, usSpinnerService) {

	$scope.load = function(){
		var file = document.getElementById("fileForUpload").files[0];
		if (file) {
		    var reader = new FileReader();
		    reader.readAsText(file, "UTF-8");
		    reader.onload = function (evt) {
		    	console.log(evt.target.result);
		    	// parse it as json
		    	var events = JSON.parse(evt.target.result);
		    	console.log(evt.target.result);
		    	console.log(events);
		    	$rootScope.traj = angular.copy(events);
		    	$window.localStorage.traj = JSON.stringify($rootScope.traj, undefined, 2);
		    }
		    reader.onerror = function (evt) {
		        console.log("error reading file");
		    }
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
