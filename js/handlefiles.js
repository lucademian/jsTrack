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
						
						gtag('event', 'Import Video Existing Project', {
							'event_category' : 'Start',
							'event_label' : master.name
						});
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
				gtag('event', 'Load Project File', {
					'event_category' : 'Start',
					'event_label' : file.name
				});
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
                if(confirm("The only supported video type is mp4. Would you like to try the experimental video converter? (sometimes doesn't work, especially for longer videos)"))
                {
					gtag('event', 'Agreed to Try Convertor', {
						'event_category' : 'Start',
						'event_label' : file.type
					});
                    showLoader();
                    var filereader = new FileReader();
                    filereader.onload = function(result){
                        var fileData = result.target.result;

                        var stdout = "";
                        var stderr = "";
                        var worker = new Worker("src/ffmpeg-worker-mp4.js");
                        worker.onmessage = function(e) {
                            var msg = e.data;
                            switch (msg.type) {
                                case "ready":
                                    worker.postMessage({
                                        MEMFS: [{name: file.name, data: fileData}],
                                        type: "run", arguments: ["-i", file.name, "-vcodec", "copy", "-acodec", "copy", "out.mp4"]
                                    });
                                    break;
                                case "stdout":
                                    stdout += msg.data + "\n";
                                    break;
                                case "stderr":
                                    stderr += msg.data + "\n";
                                    break;
                                case "done":
                                    //console.log(msg);
                                    var result = msg.data.MEMFS[0];
                                    //console.log(JSON.stringify(result));
                                    let name = file.name.substring(0, file.name.indexOf('.') != -1 ? file.name.indexOf('.') : file.name.length)
                                    //console.log(result.data);
                                    var blob = new File([result.data], name + ".mp4", {
                                        type: 'video/mp4'
                                    });
                                    //console.log(blob);
                                    master.videoName = blob.name;
                                    loadVideo(blob, function(){
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
									
									gtag('event', 'Convertor Done', {
										'event_category' : 'Start',
										'event_label' : file.type
									});
                                    break;
                                // case "exit":
                                //     console.log("Process exited with code " + msg.data);
                                //     console.log(stdout);
                                //     worker.terminate();
                                //     break;
                            }
                        };
                    };
                    filereader.readAsArrayBuffer(file);
                }
                else if(confirm("Would you like to open a free online video converter in another tab?"))
                {
                    hideLoader();
                    window.open(VIDEO_CONVERTOR, "_blank");
                }
                else
                {
                    hideLoader();
                }
            }
            else
            {
                hideLoader();
                alert("This filetype is not supported. It must be .mp4 or ." + CUSTOM_EXTENSION);
            }
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