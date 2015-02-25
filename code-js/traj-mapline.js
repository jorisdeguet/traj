traj.controller('MainController', function ($scope, eventService, $location) {


  // http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=A|FEFF69

  $scope.markersMap = {};
  $scope.itemsMap = {};
  $scope.selectedEvent = {};
  var info = new google.maps.InfoWindow({content: ""});

  $scope.isSelected = function(){
    return $scope.selectedEvent.title != undefined;
  }

  $scope.select = function(evt){
    // in the timeline
    timeline.moveTo(evt.date);
    timeline.focus(evt.id);
    timeline.setSelection(evt.id);
    // on the map
    var mark = $scope.markersMap[evt.id];
    //map.setZoom(8);
    map.panTo(mark.getPosition());
    info.close();//hide the infowindow
    info.setContent('<p>'+evt.title+'</p>');
    $scope.$apply(function(){
      $scope.selectedEvent = evt;
    });
    $('#title').html($scope.selectedEvent.title);
    info.open(map, mark);
  }

  $scope.$on('$viewContentLoaded', function(){
    items.clear();
    var marker;
    //console.log("Main is starting " + eventService.traj);
    var path = [];
    var markers = [];
    var bounds = new google.maps.LatLngBounds();
    for	(index = 0; index < eventService.traj.length; index++) {
      var event = eventService.traj[index];
      var myLatlng = new google.maps.LatLng(event.lat,event.lng);
      //path.push(myLatlng);
      marker = new google.maps.Marker({
            map: map,
            position: myLatlng
      });
      markers.push(marker);
      var idid = angular.copy(event.id);
      google.maps.event.addListener(marker, 'click', (function(marker, idid, event) {
          return function() { $scope.select(event);  }
        })(marker, idid, event));
      $scope.markersMap[idid] = marker;
      bounds.extend(myLatlng);
      var it = {};
      if (typeof event.end == 'undefined'){
        it = {id: event.id, content: event.title, start: event.date};
      }
      else{
        it = {id: event.id, content: event.title, start: event.date, end: event.end, type:'range'};
      }
      // add item and save it
      items.add([it]);
      $scope.itemsMap[event.id] = it;
    }
    /*var flightPath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#444444',
      strokeOpacity: 0.5,
      strokeWeight: 3
    });
    flightPath.setMap(map);*/
    //var mcOptions = {gridSize: 50, maxZoom: 15};
    //var mc = new MarkerClusterer(map, markers, mcOptions);

    map.fitBounds(bounds);
    timeline.fit();
    timeline.on('select', function (properties) {
        var id = properties.items[0];
        console.log('selected items: ' + id);
        $scope.select(eventService.get(id));

    });
    timeline.on('rangechanged', function (range) {
        items.clear();
        var a = new Date(range.start);
        var b = new Date(range.end);
        //console.log('range: ' + a+"   - " +b );
        var inRange = eventService.inRange(a,b);
        //console.log("in range " + inRange.length);
        for (var id in $scope.markersMap) {
          var marker = $scope.markersMap[id];
          marker.setOpacity(0.5)
          marker.setZIndex(1); // grey ones should be under
          marker.setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|CCCCCC");
        }
        for (var i = 0 ; i < inRange.length; i++) {
          var e = inRange[i];
          //console.log(e.date);
          var marker = $scope.markersMap[e.id];
          // make the first event appear on top
          var color = Math.floor( 1.0*i/inRange.length*254);
          var rcolor = 255 - color;
          var hexa = ("00" +color.toString(16)).substr(-2);
          var rhexa = ("00" +rcolor.toString(16)).substr(-2);
          if (typeof e.end == 'undefined'){
            it = {id: e.id, content: ""+(i+1)+" : "+e.title, start: e.date};
          }
          else{
            it = {id: e.id, content: ""+(i+1)+" : "+e.title, start: e.date, end: e.end, type:'range'};
          }
          // add item and save it
          items.add([it]);
          //console.log(hexa);
          marker.setOpacity(0.9);
          marker.setZIndex(1000-i);
          marker.setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld="
          +(i+1)+"|"+"FF"+rhexa+rhexa);
          //marker.setIcon("http://chart.apis.google.com/chart?chst=d_bubble_icon_text_small&chld=ski|bb|"
          //+(i+1)+"|"+hexa+"FF"+rhexa+"|FF00FF");
        }
        timeline.setSelection($scope.selectedEvent.id);
    });
  });
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
