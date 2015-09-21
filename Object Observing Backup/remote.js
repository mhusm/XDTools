function initialize() {

    var observedObjects = [];

    //Process all received messages
    window.addEventListener("message", function (ev) {
        if (isJson(ev.data)) {
            else if (command.name === "observeObject") {
                var object = eval(command.code),
                    objectName = command.code,
                    func = function (changes) {
                        var command = {
                            "name": "object",
                            "objectName": objectName,
                            "msg": JSON.stringify(JSON.decycle(object))
                        };
                        window.parent.postMessage(JSON.stringify(command), "*");
                    };
                observedObjects.push({"name": command.code, "callback": func});
                Object.observe(object, func);
            }
            else if (command.name === "unobserveObject") {
                var object = eval(command.code),
                    index = observedObjects.map(function (e) { return e.name; }).indexOf(command.code);
                Object.unobserve(object, observedObjects[index].callback);
                observedObjects.splice(index, 1);
            }
        }
    }, false);
}