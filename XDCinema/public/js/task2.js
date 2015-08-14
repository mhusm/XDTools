function displayPrices(city, movie) {
    //TODO: Implement this function
  var div = document.querySelector("#prices");
  console.log(getCinemas(movie, city));
  div.innerHTML = "";
  var cinemas = getCinemas(movie, city);
  cinemas.forEach(function(cinema){
    var price = getCinemaPrice(cinema, city);
    var li = document.createElement("div");
    li.innerHTML = cinema +": " +price;
    div.appendChild(li);
  });
}

function highlightPrice(cinema, city) {
    //TODO: Implement this function
    var div = document.querySelector("#prices");
    var children = div.childNodes;
    for (var i = 0; i < children.length; i++) {
      children[i].classList.remove("highlighted");
        if (children[i].textContent.indexOf(cinema) > -1) {
          children[i].classList.add("highlighted");
      }
                  
                  
    }    

  
   // console.log(pricediv);
}