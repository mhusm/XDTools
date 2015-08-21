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
        var p = getCinemaPrice(cinema, city)
        div.innerHTML += '<span data-cinema="' + cinema + '">' + cinema + ': ' + p + ' CHF</span><br>';
    });
}

function highlightPrice(cinema, city) {
    $('#prices .highlighted').removeClass('highlighted');
    $('#prices [data-cinema=\"' + cinema + '\"]').addClass('highlighted');
}