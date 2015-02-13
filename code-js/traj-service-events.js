var serv = angular.module('eventService', []);


serv.service('eventService', function ($window, $filter) {
  console.log("Building Service");
  //console.log("window local  " + $window.localStorage.traj);
  var traj = [];
  if (typeof $window.localStorage.traj != 'undefined'){
    console.log("Service parsing " + $window.localStorage.traj.length);
    this.traj = JSON.parse($window.localStorage.traj);
  }
  else {
    this.traj = [];
  }
  console.log("Service is loaded");

  this.add = function(event){
    console.log("Service add " + event.id);
    event.date = new Date(event.date);
    if (typeof event.id == 'undefined'){
      console.log("undefined");
      // new event
      event.id  = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
      this.traj.push(event);
    }
    else{
      // existing event modified
      var existing = this.get(event.id);
      if (existing != null) this.remove(existing.id);
      this.traj.push(event);
    }
    $window.localStorage.traj = JSON.stringify(this.traj, undefined, 2);
  }

  this.inRange = function(start, end){
    var result = [];
    for (var i = 0 ; i < this.traj.length ; i++){
      var evt = this.traj[i];
      var dd = new Date(evt.date);
      if (start.getTime() < dd.getTime() && dd.getTime() < end.getTime()){
        result.push(evt);
      }
    }
    var sorted = $filter('orderBy')(result, 'date');
    return sorted;
  }

  this.get = function(id){
    for (var i = 0 ; i < this.traj.length ; i++){
      var evt = this.traj[i];
      if (evt.id === id){
        //console.log("Found it");
        return evt;
      }
    }
    return null;
  }

  this.allAsJson = function(){
    return $window.localStorage.traj;
  }

  this.remove = function(id){
    console.log("Service remove " + id );
    var index = 0;
    for (var i = 0 ; i < this.traj.length ; i++){
      var elt = this.traj[i];
      if (elt.id === id) index = i;
    }
    this.traj.splice(index, 1);
    console.log("Service has removed " + this.traj);
    $window.localStorage.traj = JSON.stringify(this.traj, undefined, 2);
  }

  this.empty = function(){
    this.traj = [];
    delete $window.localStorage.traj;
  }

});

// else{
//   console.log("Existing traj , check conflicts ...");
//   for (var i = 0 ; i < events.length ; i++ ){
//     // see if there is a conflict with existing event
//     var event = events[i];
//     for(var j = 0 ; j < $rootScope.traj.length; j++){
//       if ($rootScope.traj[j].id === event.id){
//         //console.log("conflict " )
//         // conflict check if the rest is the same
//         if (JSON.stringify($rootScope.traj[j]) === JSON.stringify(event)){
//           console.log("the same after all");
//         }
//         else{
//           console.log("real conflict two different versions  TODO ");
//           $rootScope.traj[j] = event;
//         }
//       }
//       else{
//         $rootScope.traj.push(event);
//       }
//     }
//   }
// }
