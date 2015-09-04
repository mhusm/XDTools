function pauseClicked(container) {
    if (!container.isVideoPlaying()) {
        return;
    }
    
    var currentState = container.getPausedState();
    
    if (currentState) {
        container.setPausedState(false);
    } else {
        container.setPausedState(true);
    }   
}

function updatePaused(container) {
    var currentState = container.getPausedState();
    
    if (container.isPlayer()) {
        if (container.isVideoPlaying()) {
            if (currentState) {
                container.pauseVideo();
            } else {
                container.unpauseVideo();
            }
        }
    }
    
    if (container.isController()) {
        var button = document.getElementById("pauseButton");
        if (!currentState) {
            button.innerHTML = "PAUSE";
        } else {
            button.innerHTML = 'PLAY';
        }
    }
    
}
    
