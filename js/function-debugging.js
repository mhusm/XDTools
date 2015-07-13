$(document).ready(function () {

    socket.on("devToolsConnected", function () {
        var $debugList = $("#debug-list");
        $debugList.removeClass("dev-tools-closed");
        $debugList.find(".name").each(function () {
            debugAllDevices($(this).text());
        });
    });
    socket.on("devToolsDisconnected", function () {
        $("#debug-list").addClass("dev-tools-closed");
    });

    $("#debug-button").click(function () {
        var functionName = $("#function-input").val();
        appendDebugFunction(functionName);
        debugAllDevices(functionName);
        $("#function-input").val("");
    });
    $("#function-input").keypress(function (ev) {
        if (ev.which === 13) {
            $("#debug-button").click();
        }
    });

    $(document).on("click", ".remove-function", function () {
        var functionName = $(this).closest(".function").find(".name").text();
        $(this).closest(".function").remove();
        undebugAllDevices(functionName);
    });

    $(document).on("click", ".inspect-function", function () {
        var functionName = $(this).closest(".function").find(".name").text();
        inspectFunction(functionName);
    });

    $(document).on("click", ".inspect-js", function () {
        //TODO
    });

});

function appendDebugFunction(functionName) {
    $("#debugged-functions").append(
        "<div class='function'>" + "" +
            "<span class='name'>" + functionName + "</span>" +
            "<span class='glyphicon glyphicon-remove remove-function'></span>" +
            "<button type='button' class='btn btn-sm btn-default inspect-function'>Inspect</button>" +
        "<hr /></div>"
    );
}

function debugAllDevices(functionName) {
    $(".js-device.active").each(function () {
        var deviceID = $(this).data("device-id"),
            deviceIndex = getDeviceIndex(deviceID),
            url = activeDevices[deviceIndex].url;
        socket.emit("debug", url, functionName);
    });
}

function undebugAllDevices(functionName) {
    $(".js-device.active").each(function () {
        var deviceID = $(this).data("device-id"),
            deviceIndex = getDeviceIndex(deviceID),
            url = activeDevices[deviceIndex].url;
        socket.emit("undebug", url, functionName);
    });
}

function debugDevice(deviceID) {
    var deviceIndex = getDeviceIndex(deviceID),
        url = activeDevices[deviceIndex].url;
    $("#debugged-functions").find(".function .name").each(function () {
        socket.emit("debug", url, $(this).text());
    });
}

function undebugDevice(deviceID) {
    var deviceIndex = getDeviceIndex(deviceID),
        url = activeDevices[deviceIndex].url;
    $("#debugged-functions").find(".function .name").each(function () {
        socket.emit("undebug", url, $(this).text());
    });
}

function inspectFunction(functionName) {
    var deviceID = $(".js-device.active").data("device-id"),
        deviceIndex = getDeviceIndex(deviceID),
        url = activeDevices[deviceIndex].url;
    socket.emit("inspectFunction", url, functionName);
}