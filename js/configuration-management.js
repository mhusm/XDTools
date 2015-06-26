/*
    This file covers everything related to managing configurations, i.e. saving new configurations, loading configurations.
*/

$(document).ready(function () {

    var savedSessions = JSON.parse(localStorage.getItem("session-names")) || [],
        $noConfigurations = $("#no-configurations"),
        $configurationSettings = $("#configuration-settings");

    $("#session-name").autocomplete({
        source: savedSessions
    });

    if (savedSessions.length > 0) {
        $noConfigurations.addClass("hidden");
    }
    //List all device configurations along with a button to remove them
    for (var i = 0, j = savedSessions.length; i < j; ++i) {
        $configurationSettings.append(
            "<li class='config-row'>" +
                savedSessions[i] +
                "<button type='button' data-config-name='" + savedSessions[i] + "' class='btn btn-primary btn-sm right config-remove'>" +
                    "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
            "</button><hr /></li>"
        );
    }
    //Remove a device configuration
    $(document).on("click", ".config-remove", function () {
        var index = savedSessions.indexOf($(this).data("config-name"));
        savedSessions.splice(index, 1);
        localStorage.setItem("session-names", JSON.stringify(savedSessions));
        localStorage.removeItem("stored-session-" + $(this).data("config-name"));
        $(this).parent("li").remove();
        if (savedSessions.length === 0) {
            $noConfigurations.removeClass("hidden");
        }
    });

    //Save a new configuration
    $("#save-button").click(function () {
        var sessionName = $("#session-name").val(),
            elementsToStore = [],
            i, j;
        for (i = 0, j = activeDevices.length; i < j; ++i) {
            if (!activeDevices[i].isRemote) {
                elementsToStore.push(activeDevices[i].getDevice());
            }
        }
        localStorage.setItem("stored-session-" + sessionName, JSON.stringify(elementsToStore));
        if (savedSessions.indexOf(sessionName) === -1) {
            savedSessions.push(sessionName);
            localStorage.setItem("session-names", JSON.stringify(savedSessions));
        }
        $configurationSettings.append(
            "<li class='config-row'>" +
                sessionName +
                "<button type='button' data-config-name='" + sessionName + "' class='btn btn-primary btn-sm right config-remove'>" +
                    "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
            "</button><hr /></li>"
        );
        $noConfigurations.addClass("hidden");
    });

    //Load an existing configuration
    $("#load-button").click(function () {
        var sessionName = $("#session-name").val(),
            devices = JSON.parse(localStorage.getItem("stored-session-" + sessionName)),
            i, j;
        $("#devices").empty();
        activeDevices = [];
        loadDevice(devices, 0);
    });
});

function loadDevice(devices, i) {
    socket.emit("requestID", i);
    socket.once("receiveID", function(id, index) {
        var url = new URL($("#url").val()),
            device = new LocalDevice(devices[index].name, id, devices[index].width, devices[index].height, devices[index].devicePixelRatio, $("#url").val(), url.hostname, devices[index].scaling, devices[index].scaling, devices[index].top, devices[index].left);
        activeDevices.push(device);
        device.create();
        if (index + 1 < devices.length) {
            loadDevice(devices, index + 1);
        }
    });
}