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

function handleFile(file, callback=null)
{
    switch(file.type)
    {
        case "video/mp4":
            if(dataLoaded !== false)
            {
                let canLoad = false;

                if(file.name !== dataLoaded.name)
                {
                    if(confirm("This file doesn't match what the original video was named. Continue?"))
                        canLoad = true;
                    else
                        canLoad = false;
                }
                else
                    canLoad = true;
                
                if(canLoad)
                {
                    loadVideo(file, function(){
                        if(callback !== null)
                            callback();
                        
                        master.load(dataLoaded.data);
                        hideLoader();
                        hideLaunchModal();
                        master.saved = true;
                        master.trigger("created");
                    });
                }
            }
            else
            {
                master.videoName = file.name;
                loadVideo(file, function(){
                    if(callback !== null)
                        callback();
                    master.timeline.detectFrameRate(function(framerate){
                        hideLaunchModal();
                        newProject.push({
                            "framerate": framerate
                        });
                        newProject.show();
                        hideLoader();
                    });
                });
            }
            break;
        case "":
        case "application/x-zip":
            if(file.name.split(".").pop() == CUSTOM_EXTENSION)
            {
                loadProject(file, callback);
                hideLaunchModal();
            }
            else
            {
                alert("This filetype is not supported. It must be .mp4 or ." + CUSTOM_EXTENSION);
                hideLoader();
            }
            break;
        default:
            if(file.type.split("/")[0] == "video")
            {
                if(confirm("The only supported video type is mp4. Would you like to open a free video converter?"))
                {
                    window.open(VIDEO_CONVERTOR, "_blank");
                    // var urlPrompt = prompt("Paste output link here to load video.");
                    // if(urlPrompt !== null && urlPrompt !== "")
                    // {
                    //     fetch(urlPrompt)
                    //     .then(res => res.blob()) // Gets the response and returns it as a blob
                    //     .then(blob => {
                    //         console.log(blob);
                    //         master.videoName = file.name;
                    //         loadVideo(file, function(){
                    //             if(callback !== null)
                    //                 callback();
                    //             master.timeline.detectFrameRate(function(framerate){
                    //                 hideLaunchModal();
                    //                 newProject.push({
                    //                     "framerate": framerate
                    //                 });
                    //                 newProject.show();
                    //                 hideLoader();
                    //             });
                    //         });
                    //     });
                    // }
                }
            }
            else
            {
                alert("This filetype is not supported. It must be .mp4 or ." + CUSTOM_EXTENSION);
            }
            hideLoader();
            break;
    }
}
function handleFiles(files)
{
    var fileArray = [...files];
    if(fileArray.length > 0)
    {
        var file = fileArray[0];
        handleFile(file);
    }
}