/*
    This file is responsible for generating the colors that are assigned to devices in the Javascript console.
*/

var colors = [];

/*
    Calculates the next color (in the HSL color model) that should be used in the following way:
        1. Traverses the hues of all colors in ascending order and calculates the greatest difference between two hues.
        2. The hue in the middle of the two hues with the greatest distance is the hue of the new color.
 */
function getNextColor(deviceId) {
    if (colors.length === 0) {
        colors.push({"id": deviceId, "color": 0});
        return 0;
    }
    else {
        var maxDistance = 0;
        var minColor = colors[0].color;
        var minIndex = 1;
        for (var i = 1, j = colors.length; i < j; ++i) {
            if (colors[i].color - colors[i - 1].color > maxDistance) {
                maxDistance = colors[i].color - colors[i - 1].color;
                minColor = colors[i - 1].color;
                minIndex = i;
            }
        }
        if (360 - colors[colors.length - 1].color > maxDistance) {
            maxDistance = 360 - colors[colors.length - 1].color;
            minColor = colors[colors.length - 1].color;
            minIndex = colors.length;
        }
        colors.splice(minIndex, 0, {"id": deviceId, "color": minColor + maxDistance / 2});
        return minColor + maxDistance / 2;
    }
}