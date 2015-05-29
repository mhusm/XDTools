$(document).ready(function () {

    var socket = io("/remote");

    //Refresh device
    socket.on("refresh", function (){
        $("iframe").attr("src", $("iframe").attr("src"));
    });
    //Load URL on device
    socket.on("load", function (url) {
        $("iframe").attr("src", url);
        $("input").val(url);
    });

    //update URL of remote device
    $("input").blur(function () {
        $("iframe").attr("src", $("input").val());
    });
    $("input").keyup(function (ev) {
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
        $("iframe")[0].contentWindow.postMessage(JSON.stringify(command), $("iframe").attr("src"));
    });

    socket.on("continue", function () {
        var command = {
            "name": "continue"
        };
        $("iframe")[0].contentWindow.postMessage(JSON.stringify(command), $("iframe").attr("src"));
    });

});