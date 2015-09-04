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
        var el = document.createElement("span");
        el.innerHTML = cinema + ": " + getCinemaPrice(cinema,city) + " CHF";
        el.id = cinema.replace(" ","");
        div.appendChild(el);
        div.appendChild(document.createElement("br"));
    });
}

function highlightPrice(cinema, city) {
    var highlighted_elements = document.getElementsByClassName("highlighted");
    for (var i = 0; i < highlighted_elements.length; i++) {
        highlighted_elements[i].classList.remove("highlighted");
    }
    document.getElementById(cinema.replace(" ","")).classList.add("highlighted");
}