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
        $('#prices').append('<span class=cinemaPrice><span class=cinemaName>'+cinema+'</span> : '+getCinemaPrice(cinema,city)+'CHF'+'<br></span>');
    });
}

function highlightPrice(cinema, city) {
    var cinemaPrices = $('.cinemaPrice')
    var cinemas = getCinemas(movie, city);
    cinemaPrices.each(function(cinemaPrice){
        var cinemaName=$(this)
        
        if (cinemaName.find('.cinemaName').text()==cinema){
            $(this).addClass('highlighted')
        }
        
    });

}