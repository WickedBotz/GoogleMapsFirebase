
// initMap();
var data = {
  sender: null,
  timestamp: null,
  lat: null,
  lng: null
};

var markers = [];
var wickedBotzLocation = {lat: -26.4665992733309, lng: -49.11446034908295};


var map = new google.maps.Map(document.getElementById('map'), {
  zoom: 18,
  center: new google.maps.LatLng(-26.4665992733309,-49.11446034908295),
  mapTypeId: google.maps.MapTypeId.HYBRID
});


// Listen for clicks and add the location of the click to firebase.
map.addListener('click', function(e) {
  console.log(`click => lat,lng->: ${e.latLng.lat()}f,    ${e.latLng.lng()}f`);
  data.lat = e.latLng.lat();
  data.lng = e.latLng.lng();
  addMarker(data);
});

// Resize stuff...
google.maps.event.addDomListener(window, "resize", function() {
   var center = map.getCenter();
   console.log("screen size changed");
   google.maps.event.trigger(map, "resize");
   map.setCenter(center);
});

var icon = {
    url: "img/wickedBotzP.png", // url
    scaledSize: new google.maps.Size(40, 40), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
};
var markerWickedBotz= new google.maps.Marker({
            position: wickedBotzLocation,
            icon: icon,
            map: map,
            title: 'WickedBotz'
});
var contentString = "";
$.get( "partials/infoWickedBotz.html", function( data ) {
   contentString = data;
}).done(function() {
  let infoWickedBotzMarker = new google.maps.InfoWindow({
    content: contentString
  });

  markerWickedBotz.addListener('click', function() {
     infoWickedBotzMarker.open(map, markerWickedBotz);
   });
});


function getTimestamp(addClick) {
  // Reference to location for saving the last click time.
  var ref = firebase.child('last_message/' + data.sender);

  ref.onDisconnect().remove();  // Delete reference from firebase on disconnect.

  // Set value to timestamp.
  ref.set(Firebase.ServerValue.TIMESTAMP, function(err) {
    if (err) {  // Write to last message was unsuccessful.
      console.log(err);
    } else {  // Write to last message was successful.
      ref.once('value', function(snap) {
        addClick(snap.val());  // Add click with same timestamp.
      }, function(err) {
        console.warn(err);
      });
    }
  });
}

//Add marker in database
function addMarker(data) {
  return firebase.database().ref().child('clicks').push(data);
}

//Listen database changes
firebase.database().ref('clicks').on('value', function (snapshot) {
  console.log("banco mudou");
  clearMarkers();
  var i = 0;
  snapshot.forEach(function (item) {
    setTimeout(function() {
        addMarkerManual(item.val().lat, item.val().lng);
    }, i * 200);
    i++;
  });
});



// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
  return firebase.database().ref().child('clicks').remove();
}

function addMarkerManual(lat,lng){
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat,lng),
    map: map,
    draggable: true,
    animation:google.maps.Animation.DROP
  });
  marker.addListener('click', toggleBounce);
  markers.push(marker);
}
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

function drop() {
  for (var i =0; i < markerArray.length; i++) {
    setTimeout(function() {
      addMarkerMethod();
    }, i * 200);
  }
}
