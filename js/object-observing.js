$(document).ready(function () {

    $("#object-button").click(function () {
        var selectedLayer = $("#layer").find("option:selected").val(),
            $objectInput = $("#object-input"),
            objectName = $objectInput.val();
        $(HTML.ObservedObject(selectedLayer, objectName)).appendTo("#inspected-objects");
        observeObject(objectName, selectedLayer);
        $objectInput.val("");
    });
    $("#object-input").keypress(function (ev) {
        if (ev.which === 13) {
            $("#object-button").click();
        }
    });

    $(document).on("click", ".remove-object", function () {
        var objectName = $(this).closest(".object").find(".name").text(),
            selectedLayer = $(this).closest(".object").data("layer");
        $(this).closest(".object").remove();
        unobserveObject(objectName, selectedLayer);
    });

});

function observeObject(objectName, layer) {
    if (layer !== "document.body") {
        objectName = layer + "." + objectName;
    }
    $(".js-device.active").each(function () {
        var deviceId = $(this).data("device-id"),
            deviceIndex = getDeviceIndex(deviceId),
            command = new ObserveCommand("observeObject", deviceId, objectName);
        activeDevices[deviceIndex].sendCommand(command);
    });
}

function unobserveObject(objectName, layer) {
    if (layer !== "document.body") {
        objectName = layer + "." + objectName;
    }
    $(".js-device.active").each(function () {
        var deviceId = $(this).data("device-id"),
            deviceIndex = getDeviceIndex(deviceId),
            command = new ObserveCommand("unobserveObject", deviceId, objectName);
        activeDevices[deviceIndex].sendCommand(command);
    });
}

function observeDevice(deviceId) {
    var index = getDeviceIndex(deviceId);
    $("#inspected-objects").find(".object").each(function () {
        var objectName = $(this).find(".name").text(),
            layer = $(this).data("layer");
        if (layer !== "document.body") {
            objectName = layer + "." + objectName;
        }
        var command = new ObserveCommand("observeObject", deviceId, objectName);
        activeDevices[index].sendCommand(command);
    });
}

function unobserveDevice(deviceId) {
    var index = getDeviceIndex(deviceId);
    $("#inspected-objects").find(".object").each(function () {
        var objectName = $(this).find(".name").text(),
            layer = $(this).data("layer");
        if (layer !== "document.body") {
            objectName = layer + "." + objectName;
        }
        var command = new ObserveCommand("unobserveObject", deviceId, objectName);
        activeDevices[index].sendCommand(command);
    });
}