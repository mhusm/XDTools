function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if (container.isVideoPlaying()) {
        container.getPausedState() ? container.setPausedState(false) : container.setPausedState(true);
    }
}

function updatePaused(container) {
    //TODO: Your task is to implement this function
    if (container.isPlayer()) {
        if (container.getPausedState()) {
            container.pauseVideo();
        } else {
            container.unpauseVideo();
        }
    }
    
    if (container.isController()) {
        var elem = document.getElementById("pauseButton");
        if (container.getPausedState()) {
            elem.innerHTML = "PLAY";
        } else {
            elem.innerHTML = "PAUSE";
        }
        
    }
}