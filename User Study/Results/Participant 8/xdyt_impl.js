function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if (container.isVideoPlaying()){
        container.setPausedState(!container.getPausedState());
    }
    
    
}

function updatePaused(container) {
    if(container.isPlayer()){
        if(container.getPausedState()==true){
            container.pauseVideo();
        }else{
            container.unpauseVideo();
        }
    }
    if(container.isController()){
        if(container.getPausedState()==true){
            $('#pauseButton').text('PLAY')
        }else{
            $('#pauseButton').text('PAUSE')
        }
    }

    
}
    
