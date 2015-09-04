/*
    Your task is to implement the two functions in this file.
 */

function displayPrices(city, movie) {
    var div = document.querySelector("#prices");
    var html = "";
    div.innerHTML = "";
    //cinemas is an array containing the names of all cinemas in the city
    var cinemas = getCinemas(movie, city);
    cinemas.forEach(function(cinema){
        var price = getCinemaPrice(cinema, city);
        var id = cinema.replace(' ', '_');
        html += '<p id="'+id+'">' + cinema + ": " + price + " CHF</p>";
    });
    div.innerHTML = html;
}

function highlightPrice(cinema, city) {
    var ps = document.querySelectorAll("p");
    $(ps).each(function(){
        this.classList.remove("highlighted");
    });
    
    var id = cinema.replace(' ', '_');
    var cinema = document.querySelector("#"+id);
    cinema.classList.add("highlighted");
}