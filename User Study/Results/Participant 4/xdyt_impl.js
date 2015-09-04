function pauseClicked(container) {
    if(container.getPausedState()&&container.isVideoPlaying()){
        container.setPausedState(false);
    } else if (container.isVideoPlaying()){
        container.setPausedState(true);
    }
    //TODO: Your task is to implement this function

}

function updatePaused(container) {
    if(container.getPausedState())
    {
             if(container.isPlayer()){container.pauseVideo();}


    }else {
            if(container.isPlayer()){container.unpauseVideo();}

}


    }//TODO: Your task is to implement this function
    
