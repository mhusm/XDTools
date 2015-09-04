function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if(container.getPausedState() == false){
        container.setPausedState(true);
    }
    else container.setPausedState(false)
}

function updatePaused(container) {
    //TODO: Your task is to implement this function
    if(container.isPlayer){
        if(container.getPausedState()==false){
        container.unpauseVideo();}
            else
                container.pauseVideo();
        
}
    if(container.isController){
        var name = document.getElementById("pauseButton");
        if(container.getPausedState()==false){
        name.innerHTML = "PLAY"}
            else
                 name.innerHTML = "PAUSE";
        }
}
    
