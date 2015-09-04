var rewriteURL = rewriteURLWithDNS,
    layers = [{"name": "document.body", "id": "", "path": ["document.body"]}];

$(document).ready(function () {

    var $url = $("#url");

    socket.on("load", function (url) {
        $url.val(url);
        loadURLOnAllDevices(url);
    });

    //Refresh all devices
    $("#refresh-button").click(function () {
        refreshAllDevices();
    });

    //Remove all devices
    $("#clear-button").click(function () {
        clearConfiguration();
    });

    //Load URL on all device when the user hits enter or the input field loses focus
    $url.blur(function () {
        socket.emit("load", $url.val());
        loadURLOnAllDevices($url.val());
    }).keyup(function (ev) {
        if (ev.which === 13) {
            $url.blur();
        }
    });

    $(document).on("click", ".js-device", function () {
        var deviceID = this.dataset.deviceId,
            $history = $("#history"),
            index = colors.map(function (e) { return e.id; }).indexOf(this.dataset.deviceId);
        if ($(this).hasClass("active")) {
            $(this).css("background-color", "rgba(220, 220, 220, 0.5)");
            $(this).css("color", "hsla(" + colors[index].color + ", 60%, 50%, 1)");
            $(".history-line[data-device-id='" + deviceID + "']").each(function () {
                $(this).addClass("hidden");
            });
            removeCSSProperties(deviceID);
            $history.scrollTop($history[0].scrollHeight);
            undebugDevice(deviceID);
            unobserveDevice(deviceID);
        }
        else {
            $(this).css("background-color", "hsla(" + colors[index].color + ", 60%, 50%, 1)");
            $(this).css("color", "white");
            $(".history-line[data-device-id='" + deviceID + "']").each(function () {
                $(this).removeClass("hidden");
            });
            reactivateCSSProperties(deviceID);
            $history.scrollTop($history[0].scrollHeight);
            debugDevice(deviceID);
            observeDevice(deviceID);
        }
        $(this).toggleClass("active");
    });

    $("#devices").on("dragover", allowDrop).on("drop", dropDevice);

    $(document).on("dragstart", ".device-container", dragDevice);

    //show/hide device settings
    $(document).on("click", ".settings-button", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
        $(".device-container[data-device-id='" + deviceID + "']").find(".settings-panel").slideToggle();
    });

    //Highlight a device when the user hovers over its id in the session management
    $(document).on("mouseover", ".session-device", function () {
        var deviceID = $(this).text();
        $(".device-container[data-device-id='" + deviceID + "']").find(".overlay").removeClass("hidden");
    });
    $(document).on("mouseout", ".session-device", function () {
        var deviceID = $(this).text();
        $(".device-container[data-device-id='" + deviceID + "']").find(".overlay").addClass("hidden");
    });
    $(document).on("mouseover", ".main-device", function () {
        var deviceID = $(this).text();
        $(".device-container[data-device-id='" + deviceID + "']").find(".overlay").removeClass("hidden");
    });
    $(document).on("mouseout", ".main-device", function () {
        var deviceID = $(this).text();
        $(".device-container[data-device-id='" + deviceID + "']").find(".overlay").addClass("hidden");
    });

    $(document).on("change", ".main-devices", function () {
        var deviceID = $(this).closest(".device-container").data("device-id"),
            mainDeviceId = $(this).val();
        if (mainDeviceId) {
            connectDevice(deviceID, mainDeviceId);
        }
    });

    //Make the device draggable when clicked on the border
    $(document).on("mousedown", ".device-container", function (ev) {
        if (isDeviceHeader(ev)) {
            $(".device-container").attr('draggable', 'true');
        }
    });

    //Update the z-index of the device
    $(document).on("change", ".layer", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
        activeDevices[deviceID].setLayer($(this).val());
    });

    //Switch the orientation from landscape to portrait and vice versa
    $(document).on("click", ".rotate", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
        activeDevices[deviceID].switchOrientation();
    });

    //Set the device scaling to 1
    $(document).on("click", ".scale", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
        activeDevices[deviceID].setScaling(1);
    });

    //Update the URL of a specific device
    $(document).on("blur", ".url", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
        activeDevices[deviceID].loadURL($(this).val());
    });
    $(document).on("keyup", ".url", function (ev) {
        if (ev.which === 13) {
            $(this).blur();
        }
    });

    //Scale up/down the device
    $(document).on("change", ".range", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
        activeDevices[deviceID].setScaling($(this).val());
    });

    $(document).on("click", ".refresh", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
        activeDevices[deviceID].reloadURL();
    });

    $(document).on("click", ".device-container .dropdown-menu li", function () {
        var layer = $(this).data("value");
        socket.emit("inspect", layer, $(this).closest(".device-container").find(".url").val());
    });

    $(document).on("click", ".debug", function () {
        socket.emit("debug", $(this).closest(".device-container").find(".url").val(), $(this).closest(".device-container").find(".function").val());
    });

    //Refresh all devices that share a session
    $(document).on("click", ".session-refresh", function () {
        var parent = $(this).closest(".session");
        parent.find(".session-device").each(function () {
            var deviceID = $(this).text();
            activeDevices[deviceID].reloadURL();
        });
        parent.find(".main-device").each(function () {
            var deviceID = $(this).text();
            activeDevices[deviceID].reloadURL();
        });
    });

    //Reset a session --> assign a new id to the main device and re-connect the other devices
    $(document).on("click", "#sessions .reset", function () {
        var deviceID = $(this).closest(".session").data("device-id");
        activeDevices[deviceID].reset();
    });

    //Enable/disable auto-connect for a main device
    $(document).on("click", ".auto-connect input", function () {
        if ($(this).is(":checked")) {
            $(".auto-connect input").not("[data-device-id='" + this.dataset.deviceId + "']").each(function () {
                if ($(this).is(":checked")) {
                    $(this).click();
                }
            });
        }
    });
});

function isDeviceHeader(ev) {
    if (ev.target.classList && ev.target.classList.contains("device-top-container")) {
        return true;
    }
    for (var i = 0; i < ev.originalEvent.path.length; ++i) {
        if (ev.originalEvent.path[i].classList && ev.originalEvent.path[i].classList.contains("device-top-container")) {
            return true;
        }
    }
    return false;
}

function clearConfiguration() {
    $.each(activeDevices, function (key, device) {
        device.destroy();
    });
    activeDevices = {};
}

function updateLayers(newLayers) {
    var $layer = $("#layer");
    for (var i = 0; i < newLayers.length; ++i) {
        if ($layer.find("option[value='" + newLayers[i].path.join(".") + "']").length === 0) {
            var name = newLayers[i].id ? newLayers[i].name + "#" + newLayers[i].id : newLayers[i].name;
            layers.push(newLayers[i]);
            $layer.append("<option value='" + newLayers[i].path.join(".") + "'>" + name + "</option>");
        }
    }
}

//Connect a side device to a main device
function connectDevice(deviceID, mainDeviceId) {
    var command = new Command("requestConnectionURL", deviceID);
    activeDevices[mainDeviceId].sendCommand(command);
    if ($("#sessions").find("input[data-device-id='" + deviceID + "']").is(":checked")) {
        $("#sessions").find("input[data-device-id='" + mainDeviceId + "']").click();
    }
    $("#sessions").find("li[data-device-id='" + deviceID + "']").remove();
    $(".session[data-device-id='" + mainDeviceId + "'] ul").append(HTML.ConnectedDeviceRow(deviceID));
}

function refreshAllDevices() {
    $.each(activeDevices, function (key, device) {
        device.reloadURL();
    });
}

function loadURLOnAllDevices(url) {
    $.each(activeDevices, function (key, device) {
        device.loadURL(url);
    });
}

//Rewrite URL for emulated devices so no data is shared between devices
function rewriteURLWithDNS(url, deviceIndex) {
    var u = new URL(url);
    if (!u.hostname.match(/[a-z]/i)) {
        var d = {"name": deviceIndex, "A":[{"address":u.hostname}], "ttl":3000, "domain": "xdtest.com","time": Date.now()};
        $.ajax({
            type: "PUT",
            url: "http://localhost:8080/" + deviceIndex,
            contentType: "application/json",
            id: deviceIndex,
            data: JSON.stringify(d),
            async: false,
            complete: function () {
                u.hostname = deviceIndex + ".xdtest.com";
            }
        });
    }
    return u.href;
}

function rewriteURLWithoutDNS(url, deviceIndex) {
    return url;
}

//Move the device to the position where it was dropped
function dropDevice(ev) {
    ev.preventDefault();
    //update position of the element
    var id = ev.originalEvent.dataTransfer.getData("id");
    if (id) {
        activeDevices[id].move(ev.originalEvent.clientX + parseInt(ev.originalEvent.dataTransfer.getData("xOffset")), ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset")));
        $(".device-container[data-device-id='" + id + "']").css({
            "left": ev.originalEvent.clientX + parseInt(ev.originalEvent.dataTransfer.getData("xOffset")) + "px",
            "top": ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset")) + "px"
        });
        activeDevices[id].left = ev.originalEvent.clientX + parseInt(ev.originalEvent.dataTransfer.getData("xOffset"));
        activeDevices[id].top = ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset"));
    }
}

function dragDevice(ev) {
    $(".device-container iframe").css("pointer-events", "none");
    ev.originalEvent.dataTransfer.setData("id", ev.originalEvent.target.dataset.deviceId);
    ev.originalEvent.dataTransfer.setData("xOffset", parseInt(window.getComputedStyle(ev.originalEvent.target, null).getPropertyValue("left", 10)) - ev.originalEvent.clientX);
    ev.originalEvent.dataTransfer.setData("yOffset", parseInt(window.getComputedStyle(ev.originalEvent.target, null).getPropertyValue("top", 10)) - ev.originalEvent.clientY);
}