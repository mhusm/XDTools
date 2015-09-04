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
        var price = getCinemaPrice(cinema, city);
        
        var divElement = document.createElement("div");
        divElement.innerHTML = cinema + ": " + price;
        
        div.appendChild(divElement);
    });
}

function highlightPrice(cinema, city) {
    
    var div = document.querySelector("#prices");
    var divAsArray = div.childNodes;
    for(var i = 0; i < divAsArray.length; i++) {
        var actualCinemaElement = divAsArray[i];
        actualCinemaElement.classList.remove("highlighted");
        var string = actualCinemaElement.innerHTML;
        var index = string.indexOf(cinema);
        if(index != -1) {
            actualCinemaElement.classList.add("highlighted");
        }
    }

}