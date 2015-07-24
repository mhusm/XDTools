function Device(id, url, layer, top, left, isRemote) {
    this.id = id;
    this.url = url;
    this.layer = layer;
    this.top = top;
    this.left = left;
    this.isRemote = isRemote;
    this.$device = null;
    this.firstConnect = true;
    this.oldURL = "";
    this.connected = false;
    this.layers = [{"name": "document.body", "id": "", "path": ["document.body"]}];
    this.setLayers = function (layers) {
        this.layers = [{"name": "document.body", "id": "", "path": ["document.body"]}];
        this.layers = this.layers.concat(layers);
        this.$device.find(".dropdown-menu").html("");
        this.$device.find(".dropdown-menu").append("<li data-value='document.body'><a href='#'>body</a></li>");
        for (var i = 1, j = this.layers.length; i < j; ++i) {
            var name = this.layers[i].name;
            if (this.layers[i].id) {
                name = name + "#" + this.layers[i].id;
            }
            this.$device.find(".dropdown-menu").append("<li data-value='" + this.layers[i].path.join(".") + ".shadowRoot'><a href='#'>" + name + "</a></li>");
        }
    };
    this.hasLayer = function (name) {
        return this.layers.map(function (e) { return e.path.join(".")}).indexOf(name) !== -1;
    };
    this.connect = function (url) {
        if (this.firstConnect) {
            this.oldURL = this.url;
            this.firstConnect = false;
        }
        this.loadURL(url);
    };
    //Disconnect the device from another device and load the URL that was loaded before
    this.disconnect = function () {
        if (this.oldURL) {
            this.loadURL(this.oldURL);
            this.firstConnect = true;
            if (!this.$device.find(".toggle-main").is(":checked")) {
                this.$device.find(".toggle-main").click();
            }
        }
    };
    //Remove everything related to the device
    this.destroy = function () {
        this.$device.remove();
        $("#timeline-" + this.id).remove();
        $(".js-device[data-device-id='" + this.id + "']").remove();
        if (mainDevices.indexOf(this.id) !== -1) {
            removeMainDevice(this.id);
        }
        else {
            $("#sessions").find("li[data-device-id='" + this.id + "']").remove();
        }
        var index = colors.map(function (e) { return e.id; }).indexOf(this.id);
        colors.splice(index, 1);
        $.ajax({
            type: "DELETE",
            url: "http://localhost:8080/" + this.id,
            contentType: "application/json"
        });
        $(".history-line[data-device-id='" + this.id + "']").each(function () {
            $(this).remove();
        });
    };
    //When a new URL is set, reconnect all devices that are connected to the device
    this.setUrl = function (url) {
        this.url = url;
        var mainDevice = this.id;
        $(".session[data-device-id='" + this.id + "'] ul").find(".session-device").each(function () {
            connectDevice($(this).text(), mainDevice);
        });
        if (!this.isRemote) {
            debugDevice(this.id);
        }
    };
    /*
        Reset the session of a device:
            - Request new ID for the device
            - Adjust URL etc.
            - Reconnect all devices that are connected to the device
     */
    this.reset = function () {
        var oldId = this.id;
        $(".history-line[data-device-id='" + oldId + "']").remove();
        socket.emit("requestID", oldId);
        socket.once("receiveID", function (id, oldId) {
            var connectedDevices = [];
            $(".session[data-device-id='" + oldId + "'] ul").find(".session-device").each(function () {
                connectedDevices.push($(this).text());
            });
            var index = getDeviceIndex(oldId),
                device = activeDevices[index];
            device.destroy();

            device.id = id;
            device.url = rewriteURL(device.originalUrl, device.id);
            device.host = device.host.replace(oldId, device.id);
            device.name = device.name.replace(oldId, device.id);
            var u = new URL(device.originalHost),
                d = {"name": device.id, "A":[{"address":u.hostname}], "ttl":3000, "domain": "xdtest.com","time": Date.now()};
            $.ajax({
                type: "PUT",
                url: "http://localhost:8080/" + device.id,
                contentType: "application/json",
                id: device.id,
                data: JSON.stringify(d),
                async: false,
                complete: function () {
                    device.create();
                    //TODO: fix this, connect when url has loaded
                    for (var i = 0, j = connectedDevices.length; i < j; ++i) {
                        $(".history-line[data-device-id='" + connectedDevices[i] + "']").remove();
                        connectDevice(connectedDevices[i], device.id);
                    }
                }
            });
        });
    }
}

//Represents an emulated (local) device
function LocalDevice(name, id, width, height, devicePixelRatio, url, originalHost, scaling, layer, top, left, isRemote) {
    Device.call(this, id, url, layer, top, left, isRemote);
    this.name = name;
    this.width = width;
    this.height = height;
    this.devicePixelRatio = devicePixelRatio;
    this.url = rewriteURL(url, this.id);
    this.originalHost = "http://" + originalHost;
    this.host = "http://" + id + ".xdtest.com";
    this.scaling = scaling;
    this.$device = null;
    this.originalUrl = url;
    this.toString = function () {
        return JSON.stringify(this.getDevice());
    };
    //Return all properties that are needed for storing the device
    this.getDevice = function () {
        return {
            "name": this.name,
            "id": this.id,
            "width": this.width,
            "height": this.height,
            "devicePixelRatio": this.devicePixelRatio,
            "url": this.url,
            "scaling": this.scaling,
            "layer": this.layer,
            "top": this.top,
            "left": this.left
        };
    };
    //Update the scaling factor of the device and adjust margins, etc.
    this.setScaling = function (scale) {
        this.scaling = scale;
        this.$device.find(".range").get(0).value = scale;
        this.$device.find(".scale-factor").text(scale);
        this.$device.find("iframe").css({
            "margin-right": -parseInt(this.width) * (1 - scale) + "px",
            "margin-bottom": -parseInt(this.height) * (1 - scale) + "px",
            "transform": "scale(" + scale + ")"
        });
        this.$device.find("h4").css("max-width", "calc(" + (this.width * scale) + "px - 100px)");
    };
    //Update the layer of the device
    this.setLayer = function (layer) {
        this.layer = layer;
        this.$device.css("z-index", $("#device-" + this.id + " .layer").val());
    };
    //Load an URL on the device
    this.loadURL = function (url) {
        this.url = rewriteURL(url, this.id);
        this.$device.find("iframe").attr("src", this.url);
        this.$device.find(".url").val(this.url);
        addCSSProperties(this.id);
        if (!this.isRemote) {
            debugDevice(this.id);
        }
    };
    //Reload the current URL
    this.reloadURL = function () {
        this.$device.find("iframe").attr("src", this.url);
        addCSSProperties(this.id);
        if (!this.isRemote) {
            debugDevice(this.id);
        }
    };
    //Switch the orientation from landscape to portrait mode or vice versa
    this.switchOrientation = function () {
        this.$device.find("iframe").css({
            "width": this.height,
            "margin-right": -parseInt(this.height) * (1 - this.scaling) + "px",
            "height": this.width,
            "margin-bottom": -parseInt(this.width) * (1 - this.scaling) + "px"
        });
        var oldWidth = this.width;
        this.width = this.height;
        this.height = oldWidth;
    };
    //Create the HTML etc. for the device
    this.create = function () {
        appendDevice(this);
        this.$device = $("#device-" + this.id);
        addDeviceTimeline(this.id, this.name);
        makeMainDevice(this.id);
        addCSSProperties(this.id);
    };
    //Send a command to the iframe of the device
    this.sendCommand = function (command) {
        this.$device.find("iframe")[0].contentWindow.postMessage(command.toString(), this.url);
    };
}

//Represents an actual (remote) device
function RemoteDevice(id, url, layer, top, left, isRemote) {
    Device.call(this, id, url, layer, top, left, isRemote);
    this.name = this.id;
    //Update the layer of the device
    this.setLayer = function (layer) {
        this.layer = layer;
        this.$device.css("z-index", $("#device-" + this.id + " .layer").val());
    };
    //Load an URL on the device
    this.loadURL = function (url) {
        this.url = url;
        this.$device.find(".url").val(url);
        socket.emit("load", url, this.id);
    };
    //Reload the current URL
    this.reloadURL = function () {
        socket.emit("refresh", this.id);
    };
    //Create the HTML etc. for the device
    this.create = function () {
        appendRemoteDevice(this);
        this.$device = $("#device-" + this.id);
        addDeviceTimeline(this.id, this.name);
        makeMainDevice(this.id);
        addCSSProperties(this.id);
    };
    //Send a command to the iframe of the device
    this.sendCommand = function (command) {
        socket.emit("command", command.toString(), this.id);
    };
}
