function updateVideo(container, videoqueue) {
    //TODO: Your task is to fix the bug in that function
  
  if (videoqueue.length > 0) {
    var next = shift(videoqueue);
        container.set("synced.current.index", next.id);
        container.set("synced.current.title", next.title);
        container.set("synced.current.thumbnail.small", next.thumbnail.small);
        container.set("synced.current.thumbnail.medium", next.thumbnail.medium);
        container.set("synced.current.description", next.description);
  }
 
 
}
