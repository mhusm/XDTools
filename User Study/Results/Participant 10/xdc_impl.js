/*
    Your task is to implement the two functions in this file.
 */

function displayPrices(city, movie) {
    var div = document.querySelector("#prices");
    div.innerHTML = "";
    //cinemas is an array containing the names of all cinemas in the city
    var cinemas = getCinemas(movie, city);
    cinemas.forEach(function(cinema){
        //TODO: Implement the rest of the function
        var curCinemaInfo = document.createElement("p");
        curCinemaInfo.id = city+"_"+cinema.replace(" ", "");
        curCinemaInfo.innerHTML = cinema+": "+getCinemaPrice(cinema, city);
        div.appendChild(curCinemaInfo);
    });
}

function highlightPrice(cinema, city) {
    $('.highlighted').removeClass('highlighted');
    var id = "#"+city+"_"+cinema.replace(" ", "");
    document.querySelector(id).classList.add("highlighted");
    
}