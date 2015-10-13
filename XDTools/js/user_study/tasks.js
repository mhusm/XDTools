var timestamp = 0;

$(document).ready(function () {

    socket.on("start_study", function () {
        initStudy();
    });

    socket.on("end_study", function () {
        concludeStudy();
    });

});

function initStudy() {
    socket.on("start_task", function (task) {
        console.log("received start task command: " + task);
        startTask();
        if (task === "xdyt-impl") {
            initXDYTImplementing();
        }
        else if (task === "xdyt-bug") {
            initXDYTBugFixing();
        }
        else if (task === "xdc-impl") {
            initXDCImplementing();
        }
        else if (task === "xdc-bug") {
            initXDCBugFixing();
        }
    });

    socket.on("end_task", function (task) {
        console.log("task ended");
        var time = concludeTask();
        socket.emit("task_time", task, time);
    });
}

function concludeStudy() {
    $("#study").addClass("hidden");
    location.reload();
}

function startTask() {
    $("#study .dropdown").addClass("hidden");
    $("#conclude-button").removeClass("hidden");
}

function concludeTask() {
    var timeTaken = Date.now() - timestamp;
    $("#study .dropdown").removeClass("hidden");
    $("#conclude-button").addClass("hidden");
    clearConfiguration();
    return timeTaken / 1000;
}

function initXDCBugFixing() {
    timestamp = Date.now();
    $("#url").val("http://129.132.173.2:8084/index.html");
    loadURLOnAllDevices("http://129.132.173.2:8084/index.html");
}

function initXDYTBugFixing() {
    timestamp = Date.now();
    $("#url").val("http://129.132.173.2:8083/index.html");
    loadURLOnAllDevices("http://129.132.173.2:8083/index.html");
}

function initXDYTImplementing() {
    timestamp = Date.now();
    $("#url").val("http://129.132.173.2:8083/index.html");
    loadURLOnAllDevices("http://129.132.173.2:8083/index.html");
}

function initXDCImplementing() {
    timestamp = Date.now();
    $("#url").val("http://129.132.173.2:8084/index.html");
    loadURLOnAllDevices("http://129.132.173.2:8084/index.html");
}