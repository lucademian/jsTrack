/**
 * jsTrack: web-based Tracker (https://physlets.org/tracker/). Get position data from objects in a video.
 * Copyright (C) 2018 Luca Demian
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * Contact:
 * 
 * Luca Demian
 * jstrack.luca@gmail.com
 * 
 */

function setStorage(key, value)
{
    localStorage.setItem(key, value);
}

function getStorage(key)
{
    return localStorage.getItem(key);
}

function deleteStorage(key)
{
    localStorage.removeItem(key);
}


window.addEventListener("beforeunload", function (e) {
    if(master.saved)
        return null;
    else
    {
        var confirmationMessage = "You have made unsaved changes. If you leave without saving these changes will be lost.";

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    }
});