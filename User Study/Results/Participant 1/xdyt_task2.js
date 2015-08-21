function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if (container.isVideoPlaying()){
        if (container.getPausedState() == true)
        {
            container.setPausedState(false);
        } else{
            container.setPausedState(true);
        }
    }
}

function updatePaused(container) {
    if (container.isController()){
        if (container.getPausedState()){
            $("#pauseButton").html("Pause");
        } else{
             $("#pauseButton").html("Play");
        }
    }
    
    
    if (container.isPlayer()){

        if (container.getPausedState()){
            container.pauseVideo();
        } else{
            container.unpauseVideo(); 
        }        
        
    }
    //TODO: Your task is to implement this function
}