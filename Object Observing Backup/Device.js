function Device(id, url, layer, top, left, isRemote) {
    this.setUrl = function (url) {
        observeDevice(this.id);
    };
}

//Represents an emulated (local) device
function LocalDevice(name, id, width, height, devicePixelRatio, url, originalHost, scaling, layer, top, left, isRemote) {
    this.setUrl = function (url) {
            observeDevice(this.id);
    };
}