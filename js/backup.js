function updateBackup(state)
{
    var backupStatus = document.getElementById("backup-status");
    switch(state)
    {
        case 1:
            backupStatus.style.opacity = 1;
            backupStatus.style.backgroundColor = "yellow";
            backupStatus.title = "Partially backed up on " + master.backUpDate.toLocaleDateString() + " at " + master.backUpDate.toLocaleTimeString();
            break;
        case 2:
            backupStatus.style.opacity = 1;
            backupStatus.style.backgroundColor = "#07ff07";
            backupStatus.title = "Backed up on " + master.backUpDate.toLocaleDateString() + " at " + master.backUpDate.toLocaleTimeString();
            break;
        case "loading":
            backupStatus.style.opacity = 0.5;
            backupStatus.style.backgroundColor = "grey";
            backupStatus.title = "Backing up...";
            break;
        default:
            backupStatus.style.opacity = 1;
            backupStatus.style.backgroundColor = "red";
            backupStatus.title = "Unable to backup changes";
            break;
    }
}

function projectBackup()
{
    var success = false;
    var fileUrl = URL.createObjectURL(master.videoFile);
    JSZipUtils.getBinaryContent(fileUrl, function (err, videoFile) {
        if(err)
        {
            console.log(err);
            success = false;
            updateBackup(success);
        }

        var projectInfo = JSON.stringify(master.save());
        var lastBackupRaw = localStorage.getItem("backup");
        var lastBackup = JSON.parse(lastBackupRaw);

        if(lastBackup === null)
        {
            lastBackup = {
                uid: "",
                video: null,
                date: null
            };
        }


        var toBackup = {};
        toBackup.uid = master.uid;
        toBackup.date = new Date().toString();
        toBackup.videoName = master.videoName;

        var sameProject = (lastBackup.uid === master.uid);

        localStorage.removeItem("backup");

        
        var dataZip = new JSZip();
        dataZip.file("meta.json", projectInfo);
        dataZip.generateAsync({type:"blob"}).then(function (blob) {
            var reader = new FileReader();
            reader.readAsDataURL(blob); 
            reader.onload = function() {
                try {
                    toBackup.data = reader.result;
                    localStorage.setItem("backup", JSON.stringify(toBackup));

                    if(lastBackup.video === null || lastBackup.video === "" || lastBackup.video === undefined || !sameProject)
                    {
                        var videoZip = new JSZip();
                        videoZip.file("video.mp4", videoFile, {binary:true});
                        videoZip.generateAsync({type:"blob"}).then(function (blob) {
                            var reader = new FileReader();
                            reader.readAsDataURL(blob); 
                            reader.onload = function() {
                                try {
                                    localStorage.setItem("video", reader.result);
                                    localStorage.removeItem("video");
                                    toBackup.video = reader.result;
                                    localStorage.setItem("backup", JSON.stringify(toBackup));
                                    master.backup();
                                    success = 2;
                                    updateBackup(success);
                                }
                                catch(e)
                                {
                                    toBackup.video = undefined;
                                    localStorage.setItem("backup", JSON.stringify(toBackup));
                                    master.backup();
                                    success = 1;
                                    updateBackup(success);
                                }
                            }
                        }, function (err) {
                            console.log(err);
                            success = false;
                            updateBackup(success);
                        });
                    }
                    else if(sameProject)
                    {
                        if(lastBackup.video !== null && lastBackup.video !== "" && lastBackup.video !== undefined)
                        {
                            try {
                                localStorage.setItem("video", lastBackup.video);
                                localStorage.removeItem("video");
                                toBackup.video = lastBackup.video;
                                localStorage.setItem("backup", JSON.stringify(toBackup));
                                master.backup();
                                success = 2;
                                updateBackup(success);
                            }
                            catch(e)
                            {
                                toBackup.video = undefined;
                                localStorage.setItem("backup", JSON.stringify(toBackup));
                                master.backup();
                                success = 1;
                                updateBackup(success);
                            }
                        }
                        else
                        {
                            success = 1;
                            updateBackup(success);
                        }
                    }
                    else
                    {
                        success = 1;
                        updateBackup(success);
                    }
                }
                catch(e)
                {
                    localStorage.setItem("backup", JSON.stringify(lastBackupRaw));
                    master.backup();
                    success = false;
                    updateBackup(success);
                }
            }
        }, function (err) {
            console.log(err);
            success = false;
            updateBackup(success);
        });
    });
}
master.on("change", function(){
    if(!this.saved && this.created && !this.backedUp)
    {
        updateBackup("loading");
        projectBackup();
    }
    else if(this.saved)
    {
        localStorage.removeItem("backup");
    }
});


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