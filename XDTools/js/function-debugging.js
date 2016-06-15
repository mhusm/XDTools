/*
 * XDTools -- A set of tools for cross-device development
 * Copyright (C) 2015 Maria Husmann. All rights reserved.
 *
 * XDTools is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * XDTools is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XDTools. If not, see <http://www.gnu.org/licenses/>.
 *
 * See the README and LICENSE files for further information.
 *
 */

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
        inspectFunction(functionName, selectedLayer);
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

function inspectFunction(functionName, layer) {
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