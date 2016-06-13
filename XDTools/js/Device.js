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

function Device(id, url, layer, top, left, isRemote) {
    this.id = id;
    this.url = url;
    this.layer = layer;
    this.top = top;
    this.left = left;
    this.isRemote = isRemote;
    this.$device = null;
    this.firstConnect = true;
    this.oldURL = url;
    this.connected = false;
    this.layers = [{"name": "document.body", "id": "", "path": ["document.body"]}];
    events[this.id] = [];
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
            var path = this.layers[i].path.join(".");
            if (this.layers[i].type === "shadow") {
                path = path + ".shadowRoot";
            }
            this.$device.find(".dropdown-menu").append("<li data-value='" + path + "'><a href='#'>" + name + "</a></li>");
        }
    };
    this.hasLayer = function (name) {
        return this.layers.map(function (e) { return e.name + (e.id ? "#" + e.id : "") }).indexOf(name) !== -1;
    };
    this.getLayer = function (name) {
        var index = this.layers.map(function (e) { return e.name + (e.id ? "#" + e.id : "") }).indexOf(name);
        return this.layers[index].path.join(".");
    };
    this.connect = function (url) {
        if (this.firstConnect) {
            this.oldURL = this.url;
            this.firstConnect = false;
        }
        this.loadURL(url);
        var mainDeviceIndex = mainDevices.indexOf(this.id);
        if (mainDeviceIndex !== -1) {
            mainDevices.splice(mainDeviceIndex, 1);
        }
        $(".main-devices option[data-device-id='" + this.id + "']").remove();
        var $session = $(".session[data-device-id='" + this.id + "']");
        $session.find("ul").find(".session-device").each(function () {
            var deviceID = $(this).text();
            activeDevices[deviceID].disconnect();
        });
        $session.remove();
    };
    this.connectWithParam = function (param) {
        var command = new Command("connectWithParam", this.id);
        command.param = param;
        this.sendCommand(command);
        if (this.firstConnect) {
            this.oldURL = this.url;
            this.firstConnect = false;
        }
        var mainDeviceIndex = mainDevices.indexOf(this.id);
        if (mainDeviceIndex !== -1) {
            mainDevices.splice(mainDeviceIndex, 1);
        }
        $(".main-devices option[data-device-id='" + this.id + "']").remove();
        var $session = $(".session[data-device-id='" + this.id + "']");
        $session.find("ul").find(".session-device").each(function () {
            var deviceID = $(this).text();
            activeDevices[deviceID].disconnect();
        });
        $session.remove();
    };
    //Disconnect the device from another device and load the URL that was loaded before
    this.disconnect = function () {
        if (this.oldURL) {
            this.loadURL(this.oldURL);
            this.firstConnect = true;
        }
        $("#sessions").find("li[data-device-id='" + this.id + "']").remove();
        mainDevices.push(this.id);
        if ($(".session[data-device-id='" + this.id + "']").length === 0) {
            $(".main-devices").not("[data-device-id='" + this.id + "']").append(
                "<option data-device-id='" + this.id + "' value='" + this.id + "'>" + this.id + "</option>"
            );
            $(HTML.Session(this.id)).appendTo("#sessions .content");
            $(".device-container[data-device-id='" + this.id + "']").find("select").val("none");
        }
    };
    //Remove everything related to the device
    this.destroy = function () {
        this.$device.remove();
        $("#timeline-" + this.id).remove();
        $(".js-device[data-device-id='" + this.id + "']").remove();
        if (mainDevices.indexOf(this.id) !== -1) {
            var $session = $(".session[data-device-id='" + this.id + "']");
            $session.find("ul").find(".session-device").each(function () {
                var deviceID = $(this).text();
                activeDevices[deviceID].disconnect();
            });
            $session.remove();
            mainDevices.splice(mainDevices.indexOf(this.id), 1);
        }
        $("#sessions").find("li[data-device-id='" + this.id + "']").remove();
        $(".main-devices option[data-device-id='" + this.id + "']").remove();
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
            activeDevices[id] = activeDevices[oldId];
            delete activeDevices[oldId];
            var device = activeDevices[id];
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
                    for (var i = 0, j = connectedDevices.length; i < j; ++i) {
                        $(".history-line[data-device-id='" + connectedDevices[i] + "']").remove();
                        connectDevice(connectedDevices[i], device.id);
                    }
                }
            });
        });
    };
    this.move = function (x, y) {
        this.$device.css({
            "left": x + "px",
            "top": y + "px"
        });
        this.left = x;
        this.top = y;
    };
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
    $("#function-debugging-overlay").removeClass("hidden");
    this.toString = function () {
        return JSON.stringify(this.getDevice());
    };
    this.setUrl = function (url) {
        if (url.indexOf(this.id) === -1) {
            this.originalUrl = url;
            this.oldURL = url;
            this.originalHost = "http://" + new URL(url).hostname;
        }
        if (url !== this.url) {
            this.url = url;
            var mainDevice = this.id;
            $("#function-debugging-overlay").removeClass("hidden");
            $(".session[data-device-id='" + this.id + "'] ul").find(".session-device").each(function () {
                connectDevice($(this).text(), mainDevice);
            });
            if (!this.isRemote) {
                debugDevice(this.id);
            }
        }
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
        this.$device.find(".resizable").css({
            "margin-right": -parseInt(this.width) * (1 - scale) + "px",
            "margin-bottom": -parseInt(this.height) * (1 - scale) + "px",
            "transform": "scale(" + scale + ")"
        });
        this.$device.find("h4").css("max-width", "calc(" + (this.width * scale) + "px - 100px)");
    };
    //Update the layer of the device
    this.setLayer = function (layer) {
        this.layer = layer;
        this.$device.css("z-index", this.$device.find(".layer").val());
    };
    //Load an URL on the device
    this.loadURL = function (url) {
        if (url.indexOf(this.id) === -1) {
            this.originalUrl = url;
            this.originalHost = "http://" + new URL(url).hostname;
            this.oldURL = url;
        }
        var rewrittenURL = rewriteURL(url, this.id);
        if (rewrittenURL !== this.url) {
            $("#function-debugging-overlay").removeClass("hidden");
            this.url = rewrittenURL;
            this.$device.find("iframe").attr("src", this.url);
            this.$device.find(".url").val(this.url);
            addCSSProperties(this.id);
            if (!this.isRemote) {
                debugDevice(this.id);
            }
        }
    };
    //Reload the current URL
    this.reloadURL = function () {
        this.$device.find("iframe").attr("src", "");
        setTimeout(
        function () {
            this.$device.find("iframe").attr("src", this.url);
            var connect = function(){
                var mainDevice = this.id;
                $(".session[data-device-id='" + this.id + "'] ul").find(".session-device").each(function () {
                    connectDevice($(this).text(), mainDevice);
                })
            }.bind(this);
            // make sure to unregister event handlers
            this.$device.find("iframe").off("load", undefined, connect );
            this.$device.find("iframe").on("load", undefined, connect );
            addCSSProperties(this.id);
            if (!this.isRemote) {
                debugDevice(this.id);
            }
        }.bind(this));
    };
    //Switch the orientation from landscape to portrait mode or vice versa
    this.switchOrientation = function () {
        this.$device.find(".resizable").css({
            "width": this.height,
            "margin-right": -parseInt(this.height) * (1 - this.scaling) + "px",
            "height": this.width,
            "margin-bottom": -parseInt(this.width) * (1 - this.scaling) + "px"
        });
        var oldWidth = this.width;
        this.width = this.height;
        this.height = oldWidth;
        this.$device.find(".device-resolution").html("<b>Resolution: </b>" + this.width + " x " + this.height);
    };
    //Create the HTML etc. for the device
    this.create = function () {
        appendDevice(this);
        this.$device = $(".device-container[data-device-id='" + this.id + "']");
        addDeviceTimeline(this.id, this.name);
        this.disconnect(this.id);
        addCSSProperties(this.id);
        var that = this;
        this.$device.find(".resizable").resizable({
            handles: 'se',
            resize: function (event, ui) {
                that.width = ui.size.width;
                that.height = ui.size.height;
                that.$device.find(".device-resolution").html("<b>Resolution: </b>" + that.width + " x " + that.height);
            },
            start: function (event, ui) {
                that.$device.find("iframe").css("pointer-events", 'none');
            },
            stop: function (event, ui) {
                that.$device.find("iframe").css("pointer-events", 'auto');
            }
        });
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
        this.$device.css("z-index", this.$device.find(".layer").val());
    };
    //Load an URL on the device
    this.loadURL = function (url) {
        if (url.indexOf(this.id) === -1) {
            this.originalUrl = url;
            this.originalHost = "http://" + new URL(url).hostname;
        }
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
        this.$device = $(".device-container[data-device-id='" + this.id + "']");
        addDeviceTimeline(this.id, this.name);
        this.disconnect();
        addCSSProperties(this.id);
    };
    //Send a command to the iframe of the device
    this.sendCommand = function (command) {
        socket.emit("command", command.toString(), this.id);
    };
}