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
        var selectedLayer = $("#layer").find("option:selected").val(),
            $functionInput = $("#function-input"),
            functionName = $functionInput.val();
        appendDebugFunction(functionName, selectedLayer);
        debugAllDevices(functionName, selectedLayer);
        $functionInput.val("");
    });
    $("#function-input").keypress(function (ev) {
        if (ev.which === 13) {
            $("#debug-button").click();
        }
    });

    $(document).on("click", ".remove-function", function () {
        var functionName = $(this).closest(".function").find(".name").text(),
            selectedLayer = $(this).closest(".function").data("layer");
        $(this).closest(".function").remove();
        undebugAllDevices(functionName, selectedLayer);
    });

    $(document).on("click", ".inspect-function", function () {
        var selectedLayer = $(this).closest(".function").data("layer"),
            functionName = $(this).closest(".function").find(".name").text();
        if (selectedLayer !== "document.body") {
            functionName = selectedLayer + "." + functionName;
        }
        inspectFunction(functionName);
    });

    $(document).on("click", ".inspect-js", function () {
        //TODO
    });

    $(document).on("click", ".debug-js-error", function () {
        var func = $(this).closest(".history-line").find(".error-function").text();
        debugJSError(func);
        $(".popover").popover("hide");
    });

});

function appendDebugFunction(functionName, selectedLayer) {
    $("<div class='function' data-layer='" + selectedLayer + "'>" + "" +
            "<span class='name'>" + functionName + "</span>" +
            "<span class='glyphicon glyphicon-remove remove-function'></span>" +
            "<button type='button' class='btn btn-sm btn-default inspect-function'>Inspect</button>" +
        "<hr /></div>"
    ).appendTo("#debugged-functions");
}

function debugAllDevices(functionName, selectedLayer) {
    if (selectedLayer !== "document.body") {
        functionName = selectedLayer + "." + functionName;
    }
    $(".js-device.active").each(function () {
        var deviceID = $(this).data("device-id"),
            deviceIndex = getDeviceIndex(deviceID),
            url = activeDevices[deviceIndex].url;
        socket.emit("debug", url, functionName);
    });
}

function undebugAllDevices(functionName, selectedLayer) {
    if (selectedLayer !== "document.body") {
        functionName = selectedLayer + "." + functionName;
    }
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
    $("#debugged-functions").find(".function").each(function () {
        var functionName = $(this).find(".name").text(),
            layer = $(this).data("layer");
        if (layer !== "document.body") {
            functionName = layer + "." + functionName;
        }
        socket.emit("debug", url, functionName);
    });
}

function undebugDevice(deviceID) {
    var deviceIndex = getDeviceIndex(deviceID),
        url = activeDevices[deviceIndex].url;
    $("#debugged-functions").find(".function").each(function () {
        var functionName = $(this).find(".name").text(),
            layer = $(this).data("layer");
        if (layer !== "document.body") {
            functionName = layer + "." + functionName;
        }
        socket.emit("undebug", url, functionName);
    });
}

function inspectFunction(functionName) {
    var deviceID = $(".js-device.active").data("device-id"),
        deviceIndex = getDeviceIndex(deviceID),
        url = activeDevices[deviceIndex].url;
    socket.emit("inspectFunction", url, functionName);
}

function debugJSError(total) {
    var layer = "",
        name = "";
    if (total.indexOf(".") !== -1) {
        name = total.substring(total.lastIndexOf(".") + 1);
        var tempLayer = total.substring(0, total.indexOf("."));
        for (var i = 0; i < layers.length; ++i) {
            if (layers[i].name.indexOf(tempLayer) === 0) {
                layer = layers[i].path.join(".");
            }
        }
    }
    else {
        name = total;
        layer = "";
    }
    appendDebugFunction(name, layer);
    debugAllDevices(name, layer);
}