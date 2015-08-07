var currentCity = {"name": ""};

$(document).ready(function () {
    //Initialize XDmvc
    XDmvc.init();
    XDmvc.reconnect = true;
    XDmvc.setClientServer();
    XDmvc.connectToServer();
    //XDmvc.removeRole("sync-all");

    var setCity = function (id, data) {
        if (data.name) {
            currentCity.name = data.name;
        }
    };

    //Synchronized data
    //TODO: comment out the following 2 lines for study
    var loc = {"lat": 0, "long": 0, "cinemaName": ""};
    XDmvc.synchronize(loc, setLocation, "loc");
    var currentMovie = {"title": ""};
    XDmvc.synchronize(currentMovie, setMovie, "currentmovie");
    var currentTrailer = {"href": ""};
    XDmvc.synchronize(currentTrailer, setTrailer, "currenttrailer");
    XDmvc.synchronize(currentCity, setCity, "currentcity");

    //Set up the connection to other devices
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
                document.addEventListener("XDServer", function () {
                    XDmvc.connectTo(getQueryParams(window.location.search).connect);
                });
            }
        }
        updateRoles();
        updateViews();
    }

    //Update roles and views when a device connects/disconnects
    var observer = new ObjectObserver(XDmvc.connectedDevices);
    observer.open(function(changes){
        updateRoles();
        updateViews();
    });

    //Set the default date to today
    $('#date')[0].valueAsDate = new Date();

    //Set up city autocomplete
    $("#city").autocomplete({
        source: cities
    });

    $(document).on("click", ".trailer", function (ev) {
        if (XDmvc.othersRoles.extra && XDmvc.othersRoles.extra > 0) {
            ev.preventDefault();
            currentTrailer.href = $(this).attr("href");
            XDmvc.forceUpdate("currenttrailer");
        }
    });

    //TODO: Comment out for study
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

    $(document).on("click", ".movie h3, .movie img", function () {
        currentMovie.title = $(this).closest(".movie").find("h3").text();
        updateMovie(currentMovie.title);
        if (XDmvc.connectedDevices.length === 0) {
            $("#movie").removeClass("hidden");
            $("#general").addClass("hidden");
            $("#back").removeClass("hidden");
        }
        XDmvc.forceUpdate("currentmovie");
    });

    $("#back").click(function () {
        $("#movie").addClass("hidden");
        $("#location").addClass("hidden").css("height", "100%");
        $("#general").removeClass("hidden");
        $("#back").addClass("hidden");
    });

    //Update search results when the user searches for a new city
    $("#search").click(function () {
        var city = $("#city").val();
        currentCity.name = city;
        XDmvc.forceUpdate("currentcity");
        updateSearchResults(city);
    });

    function setTrailer(id, data) {
        if (XDmvc.roles.indexOf("extra") !== -1 && data.href !== "") {
            $("#extra").removeClass("hidden");
            $("iframe").attr("src", data.href);
        }
    }

    //TODO: Comment out for study
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

    function setMovie(id, data) {
        if (data.title) {
            currentMovie.title = data.title;
            updateMovie(currentMovie.title);
            if (XDmvc.roles.indexOf("movie") !== -1) {
                $("#movie").removeClass("hidden");
                if (XDmvc.roles.indexOf("location") !== -1) {
                    $("#location").addClass("hidden");
                }
            }
        }
    }

});

function displayPrices(city, movie) {
    console.log("displayPrices called");
    $("#prices").html("");
    var cinemas = getCinemas(movie, city);
    for (var i = 0; i < cinemas.length; ++i) {
        var currentPrice = getCinemaPrice(cinemas[i], city);
        $("#prices").append(
          "<div data-city='" + city + "' data-cinema='" + cinemas[i] + "' >" + cinemas[i] + ": " + currentPrice + " CHF</div>"
        );
    }
}

function highlightPrice(cinema, city) {
    console.log("highlightPrice called");
    $("div.highlighted").removeClass("highlighted");
    $("div[data-city='" + city + "'][data-cinema='" + cinema + "']").addClass("highlighted");
}

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

function updateMovie(title) {
    var information = getMovieInformation(title),
        $movie = $("#movie");
    $movie.find(".movie-title").text(information.title);
    $movie.find("img").attr("src", information.img);
    $movie.find(".summary").text(information.summary);
    $movie.find(".genres").html("<span class='title'>Genres:</span> " + information.genres);
    $movie.find(".runtime").html("<span class='title'>Runtime:</span> " + information.runtime);
    $movie.find(".rating").html("<span class='title'>Average rating:</span> " + information.rating);
    $movie.find("a").attr("href", information.trailer);
    if (currentCity.name && title) {
        displayPrices(currentCity.name, title);
    }
}

function getCinemaPrice(cinemaName, city) {
    for (var i = 0; i < cinemaLocations.length; ++i) {
        if (cinemaLocations[i].city === city && cinemaLocations[i].name === cinemaName) {
            return cinemaLocations[i].price;
        }
    }
}

function getCinemas(movie, city) {
    var cityIndex = showtimes.map(function (e) { return e.city; }).indexOf(city),
        movies = showtimes[cityIndex].movies,
        movieIndex = movies.map(function (e) { return e.title; }).indexOf(movie),
        cinemas = movies[movieIndex].cinemas;
    var result = [];
    for (var i = 0; i < cinemas.length; ++i) {
        result.push(cinemas[i].name);
    }
    return result;
}

function updateSearchResults(city) {
    var index = showtimes.map(function (e) { return e.city; }).indexOf(city),
        movies = showtimes[index].movies,
        $searchResults = $("#search-results");
    $searchResults.html("");
    for (var i = 0, j = movies.length; i < j; ++i) {
        var movie = getMovieInformation(movies[i].title),
            movieHTML = "<section class='movie'>" +
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
    $("#search-results")[0].scrollTop = 0
}

function updateViews() {
    $("#general").addClass("hidden");
    $("#location").addClass("hidden");
    $("#movie").addClass("hidden");
    $("#back").addClass("hidden");
    if (XDmvc.roles.indexOf("general") !== -1) {
        $("#general").removeClass("hidden");
    }
}

function updateRoles() {
    var connect = getQueryParams(window.location.search).connect;
    XDmvc.removeRole("movie");
    XDmvc.removeRole("location");
    if (connect === XDmvc.deviceId || XDmvc.connectedDevices.length === 0) {
        XDmvc.addRole("general");
        XDmvc.removeRole("extra");
    }
    else {
        var lowestId = true;
        var highestId = true;
        XDmvc.removeRole("general");
        for (var i = 0; i < XDmvc.connectedDevices.length; ++i) {
            if (XDmvc.connectedDevices[i].id !== connect && parseInt(XDmvc.connectedDevices[i].id.substring(2)) < parseInt(XDmvc.deviceId.substring(2))) {
                lowestId = false;
            }
            if (XDmvc.connectedDevices[i].id !== connect && parseInt(XDmvc.connectedDevices[i].id.substring(2)) > parseInt(XDmvc.deviceId.substring(2))) {
                highestId = false;
            }
        }
        if (lowestId) {
            XDmvc.addRole("movie");
            XDmvc.removeRole("extra");
        }
        if (highestId) {
            XDmvc.addRole("location");
            XDmvc.removeRole("extra");
        }
        if (!lowestId && !highestId) {
            XDmvc.addRole("extra");
        }
    }
}

function getCinemaLocation(city, name) {
    var i = 0, j = 0;
    for (i; i < cinemaLocations.length; ++i) {
        if (cinemaLocations[i].city === city) {
            if (cinemaLocations[i].name === name) {
                return {"lat": cinemaLocations[i].lat, "long": cinemaLocations[i].long};
            }
        }
    }
}

function getMovieInformation(name) {
    var index = movies.map(function (e) { return e.title; }).indexOf(name);
    return movies[index];
}