var dataLoaded = false;
if(localStorage.getItem("backup") !== undefined && localStorage.getItem("backup") !== null && localStorage.getItem("backup") !== "")
{
    if(document.getElementById("launch").classList.contains("active"))
    {
        var backupInfo = JSON.parse(localStorage.getItem("backup"));
        var date = backupInfo.date || (new Date().toString());
        date = new Date(date).toLocaleString();
        if(confirm("You have a project backup from " + date + ". Would you like to recover this?"))
        {
            
            if(backupInfo.video !== undefined && backupInfo.video !== null && backupInfo.video !== "")
            {
                showLoader();
                var file = dataURLtoBlob(backupInfo.video);

                let fileUrl = URL.createObjectURL(file);
                JSZipUtils.getBinaryContent(fileUrl, function(err, data) {
                    if(err) {
                        throw err; // or handle err
                    }
                
                    JSZip.loadAsync(data).then(function (data) {
                        data.file("video.mp4").async("blob").then(function(videoBlob){
                            loadVideo(videoBlob, function(){
                                if(backupInfo.data !== undefined && backupInfo.data !== null && backupInfo.data !== "")
                                {
                                    var file = dataURLtoBlob(backupInfo.data);

                                    let fileUrl = URL.createObjectURL(file);
                                    JSZipUtils.getBinaryContent(fileUrl, function(err, data) {
                                        if(err) {
                                            throw err; // or handle err
                                        }
                                    
                                        JSZip.loadAsync(data).then(function (data) {
                                            data.file("meta.json").async("text").then(function(projectJson){
                                                master.load(JSON.parse(projectJson));
                                                
                                                hideLoader();
                                                hideLaunchModal();
                                                master.saved = true;
                                                master.trigger("created");
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            }
            else if(backupInfo.data !== undefined && backupInfo.data !== null && backupInfo.data !== "")
            {
                var file = dataURLtoBlob(backupInfo.data);

                let fileUrl = URL.createObjectURL(file);
                JSZipUtils.getBinaryContent(fileUrl, function(err, data) {
                    if(err) {
                        throw err; // or handle err
                    }
                
                    JSZip.loadAsync(data).then(function (data) {
                        data.file("meta.json").async("text").then(function(projectJson){
                            let videoName = "";
                            let rawVideoName = "";
                            if(backupInfo.videoName !== undefined && backupInfo.videoName !== null && backupInfo.videoName !== "")
                            {
                                videoName = "(" + backupInfo.videoName + ") ";
                                rawVideoName = backupInfo.videoName;
                            }
                            if(confirm("There is no video saved in this backup, you will need to be able to access the original video " + videoName + "to load it yourself. Would you like to continue?"))
                            {
                                document.getElementById("file-drop-area").querySelector(".text").innerText = "Drag the video here to recover your project, or"
                                dataLoaded = {
                                    name: rawVideoName,
                                    data: JSON.parse(projectJson)
                                };
                            }
                            else
                            {
                                if(confirm("Would you like to remove this backup from storage?"))
                                {
                                    localStorage.removeItem("backup");
                                }
                            }
                        });
                    });
                });
            }
            else
            {
                if(confirm("Error opening project. Would you like to remove it from storage?"))
                {
                    localStorage.removeItem("backup");
                }
            }
        }
        else
        {
            if(confirm("Would you like to delete this from storage?"))
            {
                localStorage.removeItem("backup");
            }
        }
    }
}