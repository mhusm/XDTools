/*
    This file covers everything related to managing configurations, i.e. saving new configurations, loading configurations.
 */

$(document).ready(function () {
    var savedSessions = savedSessions = JSON.parse(localStorage.getItem("session-names")) || [];

    $("#session-name").autocomplete({
        source: savedSessions
    });

    //List all device configurations along with a button to remove them
    for (i = 0, j = savedSessions.length; i < j; ++i) {
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
        $(this).parent("div").remove();
    });

    //Save a new configuration
    $("#save-button").click(function () {
        var sessionName = $("#session-name").val(),
            elements = $("#devices").find(" > .device-container"),
            elementsToStore = [],
            i = 0;
        for (i = 0, j = elements.length; i < j; ++i) {
            var curElement = elements[i].outerHTML,
                id = elements[i].id.match(/^device-(.*)$/i)[1],
                url = $("#device" + id + " .url").val(),
                scale = $("#deviceinput" + id).val(),
                layer = $("#device" + id).css("z-index");
            elementsToStore.push({"deviceIndex": id, "html": curElement, "layer": layer, "url": url, "scale": scale});
        }
        localStorage.setItem("stored-session-" + sessionName, JSON.stringify(elementsToStore));
        if (savedSessions.indexOf(sessionName) === -1) {
            savedSessions.push(sessionName);
            localStorage.setItem("session-names", JSON.stringify(savedSessions));
        }
    });

    //Load an existing configuration
    $("#load-button").click(function () {
        var sessionName = $("#session-name").val(),
            elements = JSON.parse(localStorage.getItem("stored-session-" + sessionName)),
            i = 0;
        $("#devices").empty();
        activeDevices = [];
        for (i = 0, j = elements.length; i < j; ++i) {
            activeDevices.push(elements[i].deviceIndex)
            $("#devices").append(elements[i].html);
            $("#device-" + elements[i].deviceIndex + ".url").val(elements[i].url);
            $("#deviceinput" + elements[i].deviceIndex).val(elements[i].scale);
            $("#device-" + elements[i].deviceIndex + " .layer").val(elements[i].layer);
        }
    });
});