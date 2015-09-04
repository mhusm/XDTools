function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if(container.isVideoPlaying()) {
        var curState = container.getPausedState();
        if(curState == true) { // video is paused
            container.setPausedState(false); // video is playing
        } else {
            container.setPausedState(true);
            
        }
    }
}

function updatePaused(container) {
    //TODO: Your task is to implement this function
    if(container.isPlayer()) {
        if(container.getPausedState() == false) {
            container.unpauseVideo();
        } else {
            container.pauseVideo();
        }
    } else {
        var pauseButton = document.getElementById('pauseButton');
        if (pauseButton.innerHTML === "PLAY") {
            pauseButton.innerHTML = "PAUSE";
        } else {
            pauseButton.innerHTML = "PLAY";
        }
    }
}
    
