function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if(container.isVideoPlaying()) {
        if(container.getPausedState())
            container.setPausedState(false);
        else   
            container.setPausedState(true);
    }
}

function updatePaused(container) {
    //TODO: Your task is to implement this function
    if(container.isController()) {
        var toAppend="";
        if(container.getPausedState()) {
            toAppend="PLAY";
        } else {
            toAppend="PAUSE";
        }
        
        $('#pauseButton').get(0).innerHTML=toAppend;
    } else if (container.isPlayer()) {
        if(container.getPausedState()) {
            container.pauseVideo();
        } else {
            container.unpauseVideo();
        }
    }
    
}
    
