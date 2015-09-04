/*
    Your task is to implement the two functions in this file.
 */

function displayPrices(city, movie) {
    var div = document.querySelector("#prices");
    div.innerHTML = "";
    //cinemas is an array containing the names of all cinemas in the city
    var cinemas = getCinemas(movie, city);
    cinemas.forEach(function(cinema){
        div.innerHTML += "<div>" + cinema +": "+ getCinemaPrice(cinema, city)+" CHF"+"</div>";
        //TODO: Implement the rest of the function
    });
}

function highlightPrice(cinema, city) {
    var div = document.querySelector("#prices");
    for (var i = 0; i < div.childNodes.length; ++i) {
        div.childNodes[i].classList.remove("highlighted");
        if (div.childNodes[i].innerHTML.indexOf(cinema) !== -1) {
            div.childNodes[i].classList.add("highlighted");
        }
    }

}