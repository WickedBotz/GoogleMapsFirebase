
        var map;
        var mapOptions;
        var geocoder;
        var info_Window;
        var markers = [];


        var http_request = false;
        var lat = 0;
        var lng = 0;

        var startingLat = 58.859223547066584;
        var startingLng = -99.84375;
        var startingZoom = 3;
        mapLoad();
        function mapLoad() {
            geocoder = new google.maps.Geocoder();
            mapOptions = {
                center: new google.maps.LatLng(startingLat, startingLng),
                zoom: startingZoom,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = new google.maps.Map(document.getElementById('map'), mapOptions);
        }

        //clear markers before starting new search
        function clearLocations() {
            info_Window = new google.maps.InfoWindow();
            info_Window.close();
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers.length = 0;
        }

        function searchLocations() {

            var address = document.getElementById('postalCode').value;
            var searchString = address;

            geocoder.geocode({ address: searchString }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    searchLocationsNear(results[0].geometry.location);
                }
                else
                    map = new google.maps.Map(document.getElementById('map'), mapOptions); var sbar = document.getElementById('sidebar');
                    sbar.innerHTML = 'address ( ' + searchString + ' ) not found on Google!';
            });

        }

        function searchLocationsNear(center) {
           clearLocations();
            var radius = document.getElementById('ddlRadius').value;
            var searchUrl = 'Results.aspx?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius;


            downloadUrl(searchUrl, function (data) {


                //clear side bar entries
                var sbar = document.getElementById('sidebar');
                sbar.innerHTML = '';

                if (data.documentElement == null) {
                    sbar.innerHTML = 'No results found.  Please try widening your search area.';
                    map = new google.maps.Map(document.getElementById('map'), mapOptions);
                    return;
                }

                var locations = data.documentElement.getElementsByTagName('marker');

                if (locations.length == 0) {
                    sbar.innerHTML = 'No results found.  Please try widening your search area.';
                    map = new google.maps.Map(document.getElementById('map'), mapOptions);
                    return;
                }

                var bounds = new google.maps.LatLngBounds();
                var mapmarker;
                for (var i = 0; i < locations.length; i++) {
                    var addName = locations[i].getAttribute('LocationDescription');
                    var address1 = locations[i].getAttribute('Address1');
                    var Phone = locations[i].getAttribute('Phone');
                    var town = locations[i].getAttribute('Town');
                    var postcode = locations[i].getAttribute('Postcode');
                    var distance = parseFloat(locations[i].getAttribute('distance'));
                    var direction = "hello";
                    var add = "type your address";
                    var Customeraddress = document.getElementById('postalCode').value;
                    direction = "<a href='http://maps.google.com/maps?saddr=" + Customeraddress + "&daddr=" + address1 + "&hl=en' style='text-decoration: none;color:rgb(40,149,221);font-weight:bold;font-size:14px;' target='_blank'>get directions</a>";

                    var point = new google.maps.LatLng(parseFloat(locations[i].getAttribute('Latitude')), parseFloat(locations[i].getAttribute('Longitude')));
                    bounds.extend(point);

                    //to make name bold.
                    addName='' + addName+''
                    var mapmarker = createMarker(point, addName, address1, town, postcode, Phone, direction);
                    var sidebarEntry = createSidebarEntry(mapmarker, addName, address1, town, Phone, distance);
                    sbar.appendChild(sidebarEntry);
                }

                var pointCenter = bounds.getCenter();
                var iZoomLevel = map.fitBounds(bounds);
                map.setCenter(pointCenter, iZoomLevel);
            });
        }

        // Create the marker with address info.
        function createMarker(point, addName, address1, Phone, town, postcode, direction) {
            var image = 'img/letter_A1.png';
            var marker;
            marker = 0;
            marker = new google.maps.Marker({
                map: map,
                icon: image,
                position: point,
                title: address1,
                animation: google.maps.Animation.DROP

            });

            var html;
            if (Phone == null) {
                html = '<div class="test">' + addName + '<br />' + address1 + '<br />' + town + '<br />' + postcode + '<br />' + direction + addName + '</div>';
            }
            else {
                html = '<div class="test">' + addName + '<br />' + address1 + ', ' + town + '<br />' + postcode + '<br />' + Phone + '<br />' + direction + '</div>';
            }
            info_Window = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, "click", function () {
                info_Window.setContent(html);
                info_Window.open(map, marker);
            });

            markers.push(marker);
            return marker; //here i return only marker for the side bar.
        }
        // Create the side bar entry as a menu item
        function createSidebarEntry(marker, addName, address1, Phone, town, distance) {
            var div = document.createElement('div');
            var address;
            if (Phone == '' || Phone == null) {
                address =addName +'</br>' + address1 + '</br>' + town;
            }
            else {
                address = addName + '</br>' + address1 + '</br>' + Phone + '</br>' + town;
            }
            var html = '<div class="title">' + distance.toFixed(2) + ' miles: <br/></div>' + address;
            div.innerHTML = html;
            div.style.cursor = 'pointer';
            div.style.marginBottom = '10px';
            //div.style.cssFloat = 'left';
            div.className = 'span3';
            google.maps.event.addDomListener(div, "click", function () {
                google.maps.event.trigger(marker, "click");
            });
            google.maps.event.addDomListener(div, "mouseover", function () {
                div.style.backgroundColor = '#eee';
            });
            google.maps.event.addDomListener(div, "mouseout", function () {
                div.style.backgroundColor = '#fff';
            });
            return div;
        }
