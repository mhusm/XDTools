$(document).ready(function () {

    var url = new URL(window.location.href),
        socket = io(":" + (url.port || 80) + "/remote"),
        $iframe = $("iframe");

    window.addEventListener("message", function (ev) {
        socket.emit("command", ev.data);
    }, false);

    //Refresh device
    socket.on("refresh", function (){
        $iframe.attr("src", $iframe.attr("src"));
    });
    //Load URL on device
    socket.on("load", function (url) {
        $iframe.attr("src", url);
        $("input").val(url);
    });

    socket.on("command", function (command) {
        $iframe[0].contentWindow.postMessage(command, $iframe.attr("src"));
    });

    //update URL of remote device
    $("input").blur(function () {
        $iframe.attr("src", $("input").val());
    }).keyup(function (ev) {
        if (ev.which === 13) {
            $("input").blur();
        }
    });

    socket.on("replay", function (sequence, delay, deviceID, breakpoints) {
        var command = {
            "name": "startReplaying",
            "eventSequence": JSON.parse(sequence),
            "delay": delay,
            "breakpoints": JSON.parse(breakpoints)
        };
        $iframe[0].contentWindow.postMessage(JSON.stringify(command), $iframe.attr("src"));
    });

});