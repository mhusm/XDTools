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
        div.innerHTML = div.innerHTML + "<div id='chosen'>" + cinema+ ': ' +price + 'CHF' + '<br>' + "</div>";
    });
}

function highlightPrice(cinema, city) {
    $(.highlighted).removeClass('highlighted');
    var id = document.getElementById('chosen');
    id.classList.add('highlighted');
}