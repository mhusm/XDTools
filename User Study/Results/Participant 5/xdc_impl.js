/*
    Your task is to implement the two functions in this file.
 */

function displayPrices(city, movie) {
    var div = document.querySelector("#prices");
    div.innerHTML = "";
    //cinemas is an array containing the names of all cinemas in the city
    var cinemas = getCinemas(movie, city);
    cinemas.forEach(function(cinema){
        $("#prices").append("<div id='price-"+cinema.replace(" ", "-")+"' class='price'><b>"+cinema+":</b> "+getCinemaPrice(cinema, city)+"</div>");
    });
}

function highlightPrice(cinema, city) {
    cinema = cinema.replace(" ", "-");
    $(".price").removeClass("highlighted");
    $("#price-"+cinema).addClass("highlighted");
}