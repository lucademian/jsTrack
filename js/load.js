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
 * lucademian1@gmail.com
 * 
 */

function loadVideo(file, callback=null)
{
    master.videoFile = file;
    master.timeline.video.src = URL.createObjectURL(file);
    if(callback !== null)
    {
        master.timeline.video.addEventListener("playing", callback);
    }
}

function loadProject(file, callback=null)
{
    let fileUrl = URL.createObjectURL(file);
    JSZipUtils.getBinaryContent(fileUrl, function(err, data) {
        if(err) {
            throw err; // or handle err
        }
    
        JSZip.loadAsync(data).then(function (data) {
            if(data.files["video.mp4"] !== undefined){
                data.file("video.mp4").async("blob").then(function(videoBlob){
                    loadVideo(videoBlob, function(){
                        if(data.files["meta.json"] !== undefined)
                        {
                            data.file("meta.json").async("text").then(function(projectJson){
                                master.load(JSON.parse(projectJson));
                                hideLoader();
                                master.saved = true;
                                master.trigger("created");
                                if(callback !== null)
                                    callback();
                            });
                        }
                    });
                });
            }
        });
    });
}