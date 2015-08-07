function updateVideo(that) {
    var next = that.shift("synced.videoQueue");
    that.set("synced.current.index", next.id);
    that.set("synced.current.title", next.title);
    that.set("synced.current.thumbnail.small", next.thumbnail.small);
    that.set("synced.current.thumbnail.medium", next.thumbnail.medium);
    that.set("synced.current.description", next.description);
}
