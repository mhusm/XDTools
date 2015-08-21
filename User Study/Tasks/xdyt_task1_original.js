/*
	Your task is to fix the bug in this file.
*/

function updateVideo(container, videoqueue) {
    var next = shift(videoqueue);
    container.set("synced.current.index", next.id);
    container.set("synced.current.title", next.title);
    container.set("synced.current.thumbnail.small", next.thumbnail.small);
    container.set("synced.current.thumbnail.medium", next.thumbnail.medium);
    container.set("synced.current.description", next.description);
}

function addToQueue(container, ev) {
    var id = $(ev.target).closest(".video")[0].dataId,
        index = container.searchResult.map(function (e) { return e.id; }).indexOf(id);
    if (container.synced.videoQueue.length === 0 && container.synced.current.index === "") {
        this.set("synced.current.index", container.searchResult[index].id);
        this.set("synced.current.title", container.searchResult[index].title);
        this.set("synced.current.thumbnail.small", container.searchResult[index].thumbnail.small);
        this.set("synced.current.thumbnail.medium", container.searchResult[index].thumbnail.medium);
        this.set("synced.current.description", container.searchResult[index].description);
    }
    else {
        container.push("synced.videoQueue", {"id": id, "title": this.searchResult[index].title, "thumbnail": this.searchResult[index].thumbnail, "description": this.searchResult[index].description});
    }
}
