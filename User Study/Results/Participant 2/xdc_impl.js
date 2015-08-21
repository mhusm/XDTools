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
        var elem = document.createElement("div");
        var price = getCinemaPrice(cinema,city);
        elem.innerHTML = cinema + ": " + price;
        div.appendChild(elem);
    });
}

function highlightPrice(cinema, city) {
    var div = document.querySelector("#prices");
    
    for (var i = 0; i < div.childNodes.length; i++) {
        var elem = div.childNodes[i];
        if (elem.innerHTML.indexOf(cinema) >= 0) {
            elem.classList.add("highlighted");
        } else {
            elem.classList.remove("highlighted");
        }
    }
}