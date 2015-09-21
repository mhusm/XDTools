/*
    Your task is to find the bug in this file.
    
*/

$(document).ready(function () {

    $(document).on("click", ".cinema .name", function () {
        updateCinema($(this).text())
    });

});

function updateCinema(cinemaName) {
    var newLoc = getCinemaLocation(currentCity.name, cinemaName);
    loc.lat = newLoc.lat;
    loc.long = newLoc.long;
    loc.cinemaName = cinemaName;
    updateMap(loc.lat, loc.long);
    if (XDmvc.connectedDevices.length === 0) {
        $("#location").removeClass("hidden").css("height", "calc(100% - 44px)");
        $("#general").addClass("hidden");
        $("#back").removeClass("hidden");
       
        updateMap(loc.lat, loc.long);
    }
    XDmvc.forceUpdate("loc");
}

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

function getCinemaLocation(city, name) {
    var i = 0, j = 0;
    for (i; i < cinemaLocations.length; i++) {
        if (cinemaLocations[i].city === city) {
            if (cinemaLocations[i].name === name) {
                return {"lat": cinemaLocations[i].lat, "long": cinemaLocations[j].long};
            }
        }
    }
}