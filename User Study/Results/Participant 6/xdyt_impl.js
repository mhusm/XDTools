function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if (container.isVideoPlaying()) {
        container.setPausedState(!container.getPausedState());
    }
}

function updatePaused(container) {
    //TODO: Your task is to implement this function
    if (container.isController()) {
        if (container.getPausedState()) {
            document.getElementById("pauseButton").innerHTML = "PLAY";
        }
        else {
            document.getElementById("pauseButton").innerHTML = "PAUSE";
        }
    }
    if (container.isPlayer()) {
        if (container.getPausedState()) {
            container.pauseVideo();
        }
        else {
            container.unpauseVideo();
        }
    }
}
    
