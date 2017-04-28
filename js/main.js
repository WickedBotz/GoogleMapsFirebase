
// initMap();
var data = {
  sender: null,
  timestamp: null,
  lat: null,
  lng: null
};

var markers = [];

var map = new google.maps.Map(document.getElementById('map'), {
  zoom: 18,
  center: new google.maps.LatLng(-26.4672725,-49.117096,15),
  mapTypeId: google.maps.MapTypeId.HYBRID
});


// Listen for clicks and add the location of the click to firebase.
map.addListener('click', function(e) {
  console.log(`click => lat: ${e.latLng.lat()} lng: ${e.latLng.lng()}`);
  data.lat = e.latLng.lat();
  data.lng = e.latLng.lng();
  addMarker(data);
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
  snapshot.forEach(function (item) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(item.val().lat, item.val().lng),
      map: map
    });
    markers.push(marker);
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
}
