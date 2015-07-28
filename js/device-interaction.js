var rewriteURL = rewriteURLwithDNS,
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
        for (var i = 0; i < activeDevices.length; ++i) {
            activeDevices[i].destroy();
        }
        activeDevices = [];
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
            $history = $("#history");
        if ($(this).hasClass("active")) {
            $(this).css("background-color", "rgba(220, 220, 220, 0.5)");
            $(".history-line[data-device-id='" + deviceID + "']").each(function () {
                $(this).addClass("hidden");
            });
            removeCSSProperties(deviceID);
            $history.scrollTop($history[0].scrollHeight);
            undebugDevice(deviceID);
        }
        else {
            var index = colors.map(function (e) { return e.id; }).indexOf(this.dataset.deviceId);
            $(this).css("background-color", "hsla(" + colors[index].color + ", 60%, 50%, 0.3)");
            $(".history-line[data-device-id='" + deviceID + "']").each(function () {
                $(this).removeClass("hidden");
            });
            reactivateCSSProperties(deviceID);
            $history.scrollTop($history[0].scrollHeight);
            debugDevice(deviceID);
        }
        $(this).toggleClass("active");
    });

    $("#devices").on("dragover", allowDrop).on("drop", dropDevice);

    $(document).on("dragstart", ".device-container", dragDevice);

    //show/hide device settings
    $(document).on("click", ".settings-button", function () {
        var deviceID = $(this).closest(".device-container").data("device-id");
        $("#device-" + deviceID + " .settings-panel").slideToggle();
    });

    $(document).on("click", ".toggle-main", function () {
        var parent = $(this).closest(".device-container");
        parent.find(".main-devices").toggleClass("hidden");
        var deviceID = parent.data("device-id");
        if ($(this).is(":checked")) {
            makeMainDevice(deviceID);
        }
        else {
            removeMainDevice(deviceID);
        }
    });

    //Highlight a device when the user hovers over its id in the session management
    $(document).on("mouseover", ".session-device", function () {
        var deviceID = $(this).text();
        $("#device-" + deviceID).find(".overlay").removeClass("hidden");
    });
    $(document).on("mouseout", ".session-device", function () {
        var deviceID = $(this).text();
        $("#device-" + deviceID).find(".overlay").addClass("hidden");
    });

    $(document).on("change", ".main-devices", function () {
        var deviceID = $(this).closest(".device-container").data("device-id"),
            mainDeviceId = $(this).val();
        connectDevice(deviceID, mainDeviceId);
    });

    //Make the device draggable when clicked on the border
    $(document).on("mousedown", ".device-container", function (ev) {
        if ((ev.offsetY > $(this).outerHeight() - 10 || ev.offsetY < 10 || ev.offsetX < 10 || ev.offsetX > $(this).outerWidth() - 10 || (ev.offsetY < 60 && ev.offsetX < $(this).outerWidth() - 95)) && (ev.target.nodeName === "SECTION" || ev.target.nodeName === "H4")) {
            $(".device-container").attr('draggable', 'true');
        }
    });

    //Update the z-index of the device
    $(document).on("change", ".layer", function () {
        var deviceID = $(this).closest(".device-container").data("device-id"),
            index = getDeviceIndex(deviceID);
        activeDevices[index].setLayer($(this).val());
    });

    //Switch the orientation from landscape to portrait and vice versa
    $(document).on("click", ".rotate", function () {
        var deviceID = $(this).closest(".device-container").data("device-id"),
            index = getDeviceIndex(deviceID);
        activeDevices[index].switchOrientation();
    });

    //Set the device scaling to 1
    $(document).on("click", ".scale", function () {
        var deviceID = $(this).closest(".device-container").data("device-id"),
            index = getDeviceIndex(deviceID);
        activeDevices[index].setScaling(1);
    });

    //Update the URL of a specific device
    $(document).on("blur", ".url", function () {
        var deviceID = $(this).closest(".device-container").data("device-id"),
            index = getDeviceIndex(deviceID);
        activeDevices[index].loadURL($(this).val());
    });
    $(document).on("keyup", ".url", function (ev) {
        if (ev.which === 13) {
            $(this).blur();
        }
    });

    //Scale up/down the device
    $(document).on("change", ".range", function () {
        var deviceID = $(this).closest(".device-container").data("device-id"),
            index = getDeviceIndex(deviceID);
        activeDevices[index].setScaling($(this).val());
    });

    $(document).on("click", ".refresh", function () {
        var deviceID = $(this).closest(".device-container").data("device-id"),
            index = getDeviceIndex(deviceID);
        activeDevices[index].reloadURL();
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
            var deviceID = $(this).text(),
                index = getDeviceIndex(deviceID);
            activeDevices[index].reloadURL();
        });
    });

    //Reset a session --> assign a new id to the main device and re-connect the other devices
    $(document).on("click", "#sessions .reset", function () {
        var deviceID = $(this).closest(".session").data("device-id"),
            index = getDeviceIndex(deviceID);
        activeDevices[index].reset();
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

function updateLayers(newLayers) {
    var $layer = $("#layer");
    for (var i = 0; i < newLayers.length; ++i) {
        if ($("#layer option[value='" + newLayers[i].path.join(".") + "']").length === 0) {
            var name = newLayers[i].name;
            if (newLayers[i].id) {
                name = name + "#" + newLayers[i].id;
            }
            layers.push(newLayers[i]);
            $layer.append("<option value='" + newLayers[i].path.join(".") + "'>" + name + "</option>");
        }
    }
}

//Connect a side device to a main device
function connectDevice(deviceID, mainDeviceId) {
    var deviceIndex = getDeviceIndex(deviceID),
        mainDeviceIndex = getDeviceIndex(mainDeviceId);
    var command = new Command("requestConnectionURL", deviceID);
    activeDevices[mainDeviceIndex].sendCommand(command);
    /*
    if (mainDevices.indexOf(deviceID) !== -1) {
        removeMainDevice(deviceID);
    }
    if (activeDevices[mainDeviceIndex].isRemote) {
        //Connect to remote device
        var url = $("#device-" + mainDeviceId + " .url").val();
        activeDevices[deviceIndex].connect(url);
    }
    else {
        //Connect to local device
        var url = activeDevices[mainDeviceIndex].url.replace(activeDevices[mainDeviceIndex].host, activeDevices[mainDeviceIndex].originalHost);
        activeDevices[deviceIndex].connect(url);
    }
    $("#sessions").find("li[data-device-id='" + deviceID + "']").remove();
    $(".session[data-device-id='" + mainDeviceId + "'] ul").append("<li data-device-id='" + deviceID + "'><span class='session-device'>" + deviceID + "</span></li>");
    */
}

function makeMainDevice(deviceID) {
    var index = getDeviceIndex(deviceID);
    activeDevices[index].disconnect();
    $("#sessions").find("li[data-device-id='" + deviceID + "']").remove();
    mainDevices.push(deviceID);
    $(".main-devices").append(
        "<option data-device-id='" + deviceID + "' value='" + deviceID + "'>" + deviceID + "</option>"
    );
    $("<div class='session' data-device-id='" + deviceID + "'>" +
        "<button type='button' class='btn btn-sm btn-default reset'>Reset Session</button><br />" +
        "<button type='button' class='btn btn-sm btn-default session-refresh'><span class='glyphicon glyphicon-refresh'></span></button>" +
        "<span class='auto-connect'><input data-device-id='" + deviceID + "' type='checkbox' /> Auto-Connect</span>" +
        "<span class='title'>Main device: </span><span class='session-device'>" + deviceID + "</span>" +
        "<br /><span class='title'>Connected devices:</span><br />" +
        "<ul></ul></div>"
    ).appendTo("#sessions .content");
    $("#device-" + deviceID).find("select").val("none");
}

function removeMainDevice(deviceID) {
    mainDevices.splice(mainDevices.indexOf(deviceID), 1);
    $(".main-devices option[data-device-id='" + deviceID + "']").remove();
    var $session = $(".session[data-device-id='" + deviceID + "']");
    $session.find("ul").find(".session-device").each(function () {
       var deviceID = $(this).text(),
           index = getDeviceIndex(deviceID);
        activeDevices[index].disconnect();
    });
    $session.remove();
}

function refreshAllDevices() {
    for (var i = 0, j = activeDevices.length; i < j; ++i) {
        activeDevices[i].reloadURL();
    }
}

function loadURLOnAllDevices(url) {
    for (var i = 0, j = activeDevices.length; i < j; ++i) {
        activeDevices[i].loadURL(url);
    }
}

//Rewrite URL for emulated devices so no data is shared between devices
function rewriteURLwithDNS(url, deviceIndex) {
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
    var id = ev.originalEvent.dataTransfer.getData("id"),
        index = getDeviceIndex(id);
    $("#device-" + id).css({
        "left": ev.originalEvent.clientX + parseInt(ev.originalEvent.dataTransfer.getData("xOffset")) + "px",
        "top": ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset")) + "px"
    });
    activeDevices[index].left = ev.originalEvent.clientX + parseInt(ev.originalEvent.dataTransfer.getData("xOffset"));
    activeDevices[index].top = ev.originalEvent.clientY + parseInt(ev.originalEvent.dataTransfer.getData("yOffset"));
}

function dragDevice(ev) {
    $(".device-container iframe").css("pointer-events", "none");
    ev.originalEvent.dataTransfer.setData("id", ev.originalEvent.target.id.substring(7));
    ev.originalEvent.dataTransfer.setData("xOffset", parseInt(window.getComputedStyle(ev.originalEvent.target, null).getPropertyValue("left", 10)) - ev.originalEvent.clientX);
    ev.originalEvent.dataTransfer.setData("yOffset", parseInt(window.getComputedStyle(ev.originalEvent.target, null).getPropertyValue("top", 10)) - ev.originalEvent.clientY);
}