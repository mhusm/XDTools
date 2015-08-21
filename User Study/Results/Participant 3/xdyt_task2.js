function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if (container.isVideoPlaying()) {
        var playing = container.getPausedState();
        container.setPausedState(!playing);
    }
    
}

function updatePaused(container) {
    //TODO: Your task is to implement this function
    
    if (container.isController()) {
        if (container.getPausedState()) {
            $('#pauseButton').html('PLAY');
        } else {
            $('#pauseButton').html('PAUSE');
        }
        
    }
    
    if (!container.isController()) {
        
        if (!container.getPausedState()) {
            container.unpauseVideo();
        } else {
            container.pauseVideo();
        }
        
    }
    
}