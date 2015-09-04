function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if(container.isVideoPlaying()) {
        var state = container.getPausedState();
        if (state) {
            // Paused
            container.setPausedState(false);
        } else {
            // Playing
            container.setPausedState(true);
        }
    }
    
}

function updatePaused(container) {
    //TODO: Your task is to implement this function
    var state = container.getPausedState();
    if(container.isController()) {
        var buttonElement = document.getElementById("pauseButton");
        if (state) {
            // Paused
            buttonElement.innerHTML = "PLAY";
        } else {
            // Playing
            buttonElement.innerHTML = "PAUSE";
        }
    }
    
    if(container.isPlayer()) {
        if (state) {
            // Paused
            container.pauseVideo();
        } else {
            // Playing
            container.unpauseVideo();
        }
    }
}
    
