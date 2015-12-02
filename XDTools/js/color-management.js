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

/*
    This file is responsible for generating the colors that are assigned to devices in the Javascript console.
*/

var colors = [];

/*
    Calculates the next color (in the HSL color model) that should be used in the following way:
        1. Traverses the hues of all colors in ascending order and calculates the greatest difference between two hues.
        2. The hue in the middle of the two hues with the greatest distance is the hue of the new color.
 */
function getNextColor(deviceID) {
    if (colors.length === 0) {
        colors.push({"id": deviceID, "color": 0});
        return 0;
    }
    else {
        var maxDistance = 0,
            minColor = colors[0].color,
            minIndex = 1;
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
        //Insert the color such that the list of colors is still ordered by value
        colors.splice(minIndex, 0, {"id": deviceID, "color": minColor + maxDistance / 2});
        return minColor + maxDistance / 2;
    }
}