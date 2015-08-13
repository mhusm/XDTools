$(docuemnt).ready(function () {

    //Stores the location of the currently selected cinema
    var loc = {"lat": 0, "long": 0, "cinemaName": ""};
    //loc is synchronized between all devices, setLocation is called when loc is updated on any device
    XDmvc.synchronize(loc, setLocation, "loc");

    $(document).on("click", ".cinema .name", function () {
        var newLoc = getCinemaLocation(currentCity.name, $(this).text());
        loc.lat = newLoc.lat;
        loc.long = newLoc.long;
        loc.cinemaName = $(this).text();
        updateMap(loc.lat, loc.long);
        if (XDmvc.connectedDevices.length === 0) {
            $("#location").removeClass("hidden").css("height", "calc(100% - 44px)");
            $("#general").addClass("hidden");
            $("#back").removeClass("hidden");
            updateMap(loc.lat, loc.long);
        }
        XDmvc.forceUpdate("loc");
    });

    function setLocation(id, data) {
        if (data.lat !== 0 && data.long !== 0) {
            loc.lat = data.lat;
            loc.long = data.long;
            loc.cinemaName = data.cinemaName;
            if (loc.cinemaName && currentCity.name) {
                var cinemas = getCinemas(currentMovie.title, currentCity.name);
                if (cinemas.indexOf(loc.cinemaName) !== -1) {
                    highlightPrice(loc.cinemaName, currentCity.name);
                }
            }
            updateMap(loc.lat, loc.long);
            if (XDmvc.roles.indexOf("location") !== -1) {
                $("#location").removeClass("hidden");
                if (XDmvc.roles.indexOf("movie") !== -1) {
                    $("#movie").addClass("hidden");
                }
            }
        }
    }
});

function updateMap(lat, long) {
    var location = new google.maps.LatLng(lat, long),
        mapOptions = {
            center: location,
            zoom: 16
        },
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions),
        marker = new google.maps.Marker({
            position: location,
            map: map
        });
}

function getCinemaLocation(city, name) {
    var i = 0, j = 0;
    for (i; i < cinemaLocations.length; ++i) {
        if (cinemaLocations[i].city === city) {
            if (cinemaLocations[i].name === name) {
                return {"lat": cinemaLocations[i].lat, "long": cinemaLocations[j].long};
            }
        }
    }
}