var timestamp = 0,
    currentTask = "";

$(document).ready(function () {

    socket.on("study", function () {
        initStudy();
    });

});

function initStudy() {
    $("#study").removeClass("hidden");

    //socket.emit("study", participantNr);

    $(document).on("click", "#study-dropdown li", function () {
        currentTask = $(this).data("value");
        startTask();
        if (currentTask === "xdyt-impl") {
            initXDYTImplementing();
        }
        else if (currentTask === "xdyt-bug") {
            initXDYTBugFixing();
        }
        else if (currentTask === "xdc-impl") {
            initXDCImplementing();
        }
        else if (currentTask === "xdc-bug") {
            initXDCBugFixing();
        }
    });

    $("#conclude-button").click(function () {
        concludeTask();
        if (currentTask === "xdyt-impl") {
            concludeXDYTImplementing();
        }
        else if (currentTask === "xdyt-bug") {
            concludeXDYTBugFixing();
        }
        else if (currentTask === "xdc-impl") {
            concludeXDCImplementing();
        }
        else if (currentTask === "xdc-bug") {
            concludeXDCBugFixing();
        }
    });
}

function startTask() {
    $("#study .dropdown").addClass("hidden");
    $("#conclude-button").removeClass("hidden");
}

function concludeTask() {
    $("#study .dropdown").removeClass("hidden");
    $("#conclude-button").addClass("hidden");
}

function initXDCBugFixing() {
    timestamp = Date.now();
    $("#url").val("http://129.132.173.2:8084/index.html");
    loadURLOnAllDevices("http://129.132.173.2:8084/index.html");
}

function concludeXDCBugFixing() {
    var timeTaken = Date.now() - timestamp;
    timeTaken = timeTaken / 1000;
    socket.emit("time", "xdc-bug", timeTaken);
    clearConfiguration();
}

function initXDYTBugFixing() {
    timestamp = Date.now();
    $("#url").val("http://129.132.173.2:8083/index.html");
    loadURLOnAllDevices("http://129.132.173.2:8083/index.html");
}

function concludeXDYTBugFixing() {
    var timeTaken = Date.now() - timestamp;
    timeTaken = timeTaken / 1000;
    socket.emit("time", "xdyt-bug", timeTaken);
    clearConfiguration();
}

function initXDYTImplementing() {
    timestamp = Date.now();
    $("#url").val("http://129.132.173.2:8083/index.html");
    loadURLOnAllDevices("http://129.132.173.2:8083/index.html");
}

function concludeXDYTImplementing() {
    var timeTaken = Date.now() - timestamp;
    timeTaken = timeTaken / 1000;
    socket.emit("time", "xdyt-impl", timeTaken);
    clearConfiguration();
}

function initXDCImplementing() {
    timestamp = Date.now();
    $("#url").val("http://129.132.173.2:8084/index.html");
    loadURLOnAllDevices("http://129.132.173.2:8084/index.html");
}

function concludeXDCImplementing() {
    var timeTaken = Date.now() - timestamp;
    timeTaken = timeTaken / 1000;
    socket.emit("time", "xdc-impl", timeTaken);
    clearConfiguration();
}
