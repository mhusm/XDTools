function pauseClicked(container) {
    //TODO: Your task is to implement this function
    if(container.isVideoPlaying())
    {
        if(container.getPausedState())
        {
           
            container.setPausedState(false);
        }
        else
        {
            container.setPausedState(true);
        }
    }
    
}

function updatePaused(container) {
    //TODO: Your task is to implement this function
    if(container.isController())
    {
        if(container.getPausedState())
        {
             $("#pauseButton").text("PLAY");  
        }
        else
        {
            $("#pauseButton").text("PAUSE");  
        }
    }
    else
    {
        if(container.isVideoPlaying())
            {
                if(container.getPausedState())
                {
                    container.pauseVideo();
                    

                }
                else
                {
                    container.unpauseVideo();

                }
            }
    }
}
    
