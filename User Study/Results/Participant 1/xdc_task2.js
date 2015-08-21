/*
    Your task is to implement the two functions in this file.
 */

function displayPrices(city, movie) {
    var div = document.querySelector("#prices");
    div.innerHTML = "";
    //cinemas is an array containing the names of all cinemas in the city
    var cinemas = getCinemas(movie, city);
    cinemas.forEach(function(cinema){
       var cinemaId =  cinema.replace(" ","_");
        //TODO: Implement the rest of the function
        
        $("#prices").append("<div id=" + cinemaId+ ">"+cinema +" : "+ getCinemaPrice(cinema, city) + "CHF </div><br>");
    });
}

function highlightPrice(cinema, city) {
    var cinemaId =  cinema.replace(" ","_");
    $("div").removeClass("highlighted");
    $("#"+cinemaId).addClass("highlighted");
}