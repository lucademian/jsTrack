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

function hideLaunchModal()
{
    document.getElementById("modal-container").classList.remove("active");
    document.getElementById("modal-container").classList.remove("launch");
    document.getElementById("launch").classList.remove("active");
    document.getElementById("help-fab").remove();
    document.getElementById("github-fab").remove();
    document.getElementById("paypal-fab").remove();
    
    keyboardJS.resume();
}

var dropArea = document.getElementById("file-drop-area");

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
    dropArea.addEventListener(eventName, function preventDefaults (e) {
        e.preventDefault()
        e.stopPropagation()
    }, false);
    document.body.addEventListener(eventName, function preventDefaults (e) {
        e.preventDefault()
        e.stopPropagation()
    }, false);
});



['dragenter', 'dragover'].forEach(function(eventName) {
    dropArea.addEventListener(eventName, function(e){
        dropArea.classList.add('highlight');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, function(){
        dropArea.classList.remove('highlight');
    }, false);
});

dropArea.addEventListener('drop', function(e){
    showLoader();
    console.log(e);
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files);
}, false);

document.getElementById("file-input").addEventListener("change", function(e){
    handleFiles(this.files);
    showLoader();
});