function pauseClicked(container) {
    if (container.isVideoPlaying()) {
        container.setPausedState(!container.getPausedState());
    }
}

function updatePaused(container) {
    if (container.isController()) {
        if (container.getPausedState()) {
            $("#pauseButton").html("PLAY");
        } else {
            $("#pauseButton").html("PAUSE");
        }
    }
    if (container.isPlayer()) {
        if (container.getPausedState()) {
            container.pauseVideo();
        } else {
            container.unpauseVideo();
        }
    }
}
    
