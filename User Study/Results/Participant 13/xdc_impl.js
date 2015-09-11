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
        var obj_cinema = getCinemaPrice(cinema, city);
        var llt = removeSpaces (cinema+city);
        var prices_labels = "<p id="+llt+">"+cinema+": " +obj_cinema+"CHF"+"</p><br>"; 
        $("#prices").append(prices_labels);
        
    });
}

function removeSpaces (lab){
 
var labs = lab.replace (" ","_");
    return labs;
}

function highlightPrice(cinema, city) {
    
    var lab = removeSpaces (cinema+city);
    console.log(lab);
    $(".highlighted").removeClass("highlighted");
    $("#"+lab).addClass("highlighted");
    
}