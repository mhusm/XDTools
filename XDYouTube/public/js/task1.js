function pauseClicked(that) {
    //TODO: Your task is to implement this function
  if (that.isVideoPlaying()){
    var paused = that.getPausedState();
    that.setPausedState(!paused);
    
  }
}

function updatePaused(that) {
    //TODO: Your task is to implement this function
  var paused = that.getPausedState();
  if (that.isPlayer()){
    if (paused) {
      that.pauseVideo(); 
    } else {
      that.unpauseVideo(); 
    }
  }
  if (that.isController()){ 
    
    var button = document.querySelector("#pauseButton");
    if (paused) {
      button.innerHTML = "PAUSE"
    } else {
      button.innerHTML = "PLAY"
    }
  }
  
}