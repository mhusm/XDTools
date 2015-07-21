/*
    Google Maps Initialization
 */

function initialize() {
    var loc = new google.maps.LatLng(0, 0);
    var mapOptions = {
        center: loc,
        zoom: 17
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    var marker = new google.maps.Marker({
        position: loc,
        map: map,
        title: "Cinema"
    });
}
google.maps.event.addDomListener(window, 'load', initialize);

/*
    General
 */

var currentCity = "";

$(document).ready(function () {
    XDmvc.init();
    XDmvc.reconnect = true;
    XDmvc.setClientServer();
    XDmvc.connectToServer();

    $('#date')[0].valueAsDate = new Date();
    $("#city").autocomplete({
        source: cities
    });

    var connect = getQueryParams(window.location.search).connect;
    if (!connect) {
        var connectString = 'connect=' + XDmvc.deviceId;
        window.history.pushState('', '', window.location.search.length > 0 ? window.location.search + "&" + connectString : '?' + connectString);
        XDmvc.addRole("general");
        XDmvc.addRole("movie");
        XDmvc.addRole("location");
        connect = XDmvc.deviceId;
    } else {
        if (connect !== XDmvc.deviceId) {
            if (XDmvc.server) {
                XDmvc.connectTo(getQueryParams(window.location.search).connect);
            } else { // not yet connected to server, wait for the connection event
                document.addEventListener("XDServer", function(){
                    XDmvc.connectTo(getQueryParams(window.location.search).connect);
                });
            }
            if (XDmvc.connectedDevices.length > 1) {
                for (var i = 0; i < XDmvc.connectedDevices.length; ++i) {
                    var lowestId = true;
                    if (XDmvc.connectedDevices[i].id !== connect && parseInt(XDmvc.connectedDevices[i].id.substring(2)) < parseInt(XDmvc.deviceId.substring(2))) {
                        lowestId = false;
                    }
                    if (lowestId) {
                        XDmvc.addRole("location");
                    }
                    else {
                        XDmvc.addRole("movie");
                    }
                }
            }
            else {
                XDmvc.addRole("movie");
                XDmvc.addRole("location");
            }
        }
        else {
            XDmvc.addRole("general");
            XDmvc.addRole("movie");
            XDmvc.addRole("location");
        }
        updateViews();
    }

    var loc = {"lat": 0, "long": 0};
    var setLocation = function (id, data) {
        if (data.lat !== 0 && data.long !== 0) {
            loc.lat = data.lat;
            loc.long = data.long;
            var location = new google.maps.LatLng(loc.lat, loc.long);
            var mapOptions = {
                center: location,
                zoom: 16
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                title: $(this).text()
            });
            if (XDmvc.roles.indexOf("location") !== -1) {
                $("#location").removeClass("hidden");
                if (XDmvc.roles.indexOf("movie") !== -1) {
                    $("#movie").addClass("hidden");
                }
            }
        }
    };

    var setMovie = function (id, data) {
        if (data.title) {
            currentMovie.title = data.title;
            var information = getMovieInformation(currentMovie.title);
            $movie = $("#movie");
            $movie.find(".movie-title").text(information.title);
            $movie.find("img").attr("src", information.img);
            $movie.find(".summary").text(information.summary);
            $movie.find(".genres").html("<span class='title'>Genres:</span> " + information.genres);
            $movie.find(".runtime").html("<span class='title'>Runtime:</span> " + information.runtime);
            $movie.find(".rating").html("<span class='title'>Average rating:</span> " + information.rating);
            $movie.find("a").attr("href", information.trailer);
            if (XDmvc.roles.indexOf("movie") !== -1) {
                $("#movie").removeClass("hidden");
                if (XDmvc.roles.indexOf("location") !== -1) {
                    $("#location").addClass("hidden");
                }
            }
        }
    };

    var currentMovie = {"title": ""};
    XDmvc.synchronize(currentMovie, setMovie, "currentmovie");

    XDmvc.synchronize(loc, setLocation, "loc");

    var observer = new ObjectObserver(XDmvc.connectedDevices);
    observer.open(function(changes){
        if (connect === XDmvc.deviceId) {
            //Device is the main device
            XDmvc.removeRole("movie");
            XDmvc.removeRole("location");
            XDmvc.addRole("general");
        }
        else {
            XDmvc.removeRole("general");
            if (XDmvc.connectedDevices.length > 1) {
                for (var i = 0; i < XDmvc.connectedDevices.length; ++i) {
                    var lowestId = true;
                    if (XDmvc.connectedDevices[i].id !== connect && parseInt(XDmvc.connectedDevices[i].id.substring(2)) < parseInt(XDmvc.deviceId.substring(2))) {
                        lowestId = false;
                    }
                    if (lowestId) {
                        XDmvc.addRole("location");
                        XDmvc.removeRole("movie");
                    }
                    else {
                        XDmvc.addRole("movie");
                        XDmvc.removeRole("location");
                    }
                }
            }
            else {
                XDmvc.addRole("movie");
                XDmvc.addRole("location");
            }
        }
        updateViews();
    });

    $(document).on("click", ".cinema .name", function () {
        var newLoc = getCinemaLocation(currentCity, $(this).text());
        loc.lat = newLoc.lat;
        loc.long = newLoc.long;
        XDmvc.forceUpdate("loc");
    });

    $(document).on("click", ".movie h3, .movie img", function () {
        currentMovie.title = $(this).closest(".movie").find("h3").text();
        XDmvc.forceUpdate("currentmovie");
    });

    $("#search").click(function () {
        var city = $("#city").val();
        currentCity = city;
        updateSearchResults(city);
    });

});

function updateSearchResults(city) {
    var index = showtimes.map(function (e) { return e.city; }).indexOf(city);
    var movies = showtimes[index].movies;
    var $searchResults = $("#search-results");
    $searchResults.html("");
    for (var i = 0, j = movies.length; i < j; ++i) {
        var movie = getMovieInformation(movies[i].title);
        var movieHTML = "<section class='movie'>" +
            "<img src='" + movie.img + "' alt='' />" +
            "<h3>" + movie.title + "</h3>" +
            "<section class='cinemas'>";
        for (var k = 0, l = movies[i].cinemas.length; k < l; ++k) {
            movieHTML = movieHTML + "<div class='cinema'><span class='name'>" + movies[i].cinemas[k].name + "</span>";
            for (var m = 0; m < movies[i].cinemas[k].showtimes.length; ++m) {
                movieHTML = movieHTML + "<span class='time'>" + movies[i].cinemas[k].showtimes[m] + "</span>";
            }
            movieHTML = movieHTML + "</div>";
        }
        movieHTML = movieHTML + "</section></section>";
        $searchResults.append(movieHTML);
        $searchResults.append("<hr class='clear' />")
    }
}

function updateViews() {
    $("#general").addClass("hidden");
    $("#location").addClass("hidden");
    $("#movie").addClass("hidden");
    if (XDmvc.roles.indexOf("general") !== -1) {
        $("#general").removeClass("hidden");
    }
}

function getCinemaLocation(city, name) {
    for (var i = 0; i < cinemaLocations.length; ++i) {
        if (cinemaLocations[i].city === city && cinemaLocations[i].name === name) {
            return {"lat": cinemaLocations[i].lat, "long": cinemaLocations[i].long};
        }
    }
}

function getMovieInformation(name) {
    var index = movies.map(function (e) { return e.title; }).indexOf(name);
    return movies[index];
}