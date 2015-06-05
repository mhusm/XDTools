/*
    This file covers everything related to managing configurations, i.e. saving new configurations, loading configurations.
 */

$(document).ready(function () {
    var savedSessions = JSON.parse(localStorage.getItem("session-names")) || [];

    $("#session-name").autocomplete({
        source: savedSessions
    });

    if (savedSessions.length > 0) {
        $("#no-configurations").addClass("hidden");
    }
    //List all device configurations along with a button to remove them
    for (var i = 0, j = savedSessions.length; i < j; ++i) {
        $("#settings-configurations").append(
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
            $("#no-configurations").removeClass("hidden");
        }
    });

    //Save a new configuration
    $("#save-button").click(function () {
        var sessionName = $("#session-name").val(),
            elementsToStore = [],
            i, j;
        for (i = 0, j = activeDevices.length; i < j; ++i) {
            elementsToStore.push(activeDevices[i]);
        }
        localStorage.setItem("stored-session-" + sessionName, JSON.stringify(elementsToStore));
        if (savedSessions.indexOf(sessionName) === -1) {
            savedSessions.push(sessionName);
            localStorage.setItem("session-names", JSON.stringify(savedSessions));
        }
        $("#settings-configurations").append(
            "<li class='config-row'>" +
            sessionName +
            "<button type='button' data-config-name='" + sessionName + "' class='btn btn-primary btn-sm right config-remove'>" +
            "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>" +
            "</button><hr /></li>"
        );
        $("#no-configurations").addClass("hidden");
    });

    //Load an existing configuration
    $("#load-button").click(function () {
        var sessionName = $("#session-name").val(),
            devices = JSON.parse(localStorage.getItem("stored-session-" + sessionName)),
            i, j;
        $("#devices").empty();
        activeDevices = [];
        for (i = 0, j = devices.length; i < j; ++i) {
            var device = new Device(devices[i].name, devices[i].id, devices[i].width, devices[i].height, devices[i].devicePixelRatio, devices[i].url, devices[i].scaling, devices[i].layer, devices[i].top, devices[i].left);
            activeDevices.push(device);
            device.create();
        }
    });
});