$(document).ready(function () {

    socket.on("devToolsConnected", function () {
        $("#function-debugging-overlay").addClass("hidden");
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
        var selectedLayer = $("#layer").find("option:selected").text(),
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
    $(HTML.DebugFunction(selectedLayer, functionName)).appendTo("#debugged-functions");
}

function debugAllDevices(functionName, selectedLayer) {
    $(".js-device.active").each(function () {
        var deviceID = $(this).data("device-id"),
            url = activeDevices[deviceID].url,
            layerIndex = activeDevices[deviceID].hasLayer(selectedLayer),
            deviceFunctionName = layerIndex ? activeDevices[deviceID].getLayer(selectedLayer) + "." + functionName : functionName;
        if (selectedLayer !== "document.body") {
            emitDebugCommand(url, deviceFunctionName, deviceID);
        }
        else {
            emitDebugCommand(url, functionName, deviceID);
        }
    });
}

function undebugAllDevices(functionName, selectedLayer) {
    $(".js-device.active").each(function () {
        var deviceID = $(this).data("device-id"),
            url = activeDevices[deviceID].url,
            layerIndex = activeDevices[deviceID].hasLayer(selectedLayer),
            deviceFunctionName = layerIndex ? activeDevices[deviceID].getLayer(selectedLayer) + "." + functionName : functionName;
        if (selectedLayer !== "document.body") {
            emitUndebugCommand(url, deviceFunctionName, deviceID);
        }
        else {
            emitUndebugCommand(url, functionName, deviceID);
        }
    });
}

function debugDevice(deviceID) {
    var url = activeDevices[deviceID].url;
    $("#debugged-functions").find(".function").each(function () {
        var functionName = $(this).find(".name").text(),
            layer = $(this).data("layer"),
            hasLayer = activeDevices[deviceID].hasLayer(layer),
            debugFunctionName = hasLayer ? activeDevices[deviceID].getLayer(layer) + "." + functionName : functionName;
        if (layer !== "document.body") {
            emitDebugCommand(url, debugFunctionName, deviceID);
        }
        else {
            emitDebugCommand(url, functionName, deviceID);
        }
    });
}

function undebugDevice(deviceID) {
    var url = activeDevices[deviceID].url;
    $("#debugged-functions").find(".function").each(function () {
        var functionName = $(this).find(".name").text(),
            layer = $(this).data("layer"),
            hasLayer = activeDevices[deviceID].hasLayer(layer),
            debugFunctionName = hasLayer ? activeDevices[deviceID].getLayer(layer) + "." + functionName : functionName;
        if (layer !== "document.body") {
            emitUndebugCommand(url, debugFunctionName, deviceID);
        }
        else {
            emitUndebugCommand(url, functionName, deviceID);
        }
    });
}

function emitDebugCommand(url, functionName, deviceID) {
    //socket.emit("debug", url, functionName, deviceID);
    activeDevices[deviceID].sendCommand(new DebugCommand("debug", deviceID, functionName));
}

function emitUndebugCommand(url, functionName, deviceID) {
    socket.emit("undebug", url, "XDTest.debuggedFunctions['" + functionName + "']", deviceID);
    //activeDevices[deviceID].sendCommand(new DebugCommand("undebug", deviceID, functionName));
}

function inspectFunction(functionName) {
    var found = false;
    $.each(activeDevices, function (key, device) {
        if (!device.isRemote && !found) {
            found = true;
            var url = device.url,
                hasLayer = device.hasLayer(layer),
                debugFunctionName = hasLayer ? device.getLayer(layer) + "." + functionName : functionName;
            if (layer !== "document.body") {
                socket.emit("inspectFunction", url, "XDTest.debuggedFunctions['" + debugFunctionName + "']");
            }
            else {
                socket.emit("inspectFunction", url, "XDTest.debuggedFunctions['" + functionName + "']");
            }
        }
    });
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