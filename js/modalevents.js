newProject.on("submit", function(data){
    master.name = data.name;
    master.timeline.frameSkip = parseInt(data.frameskip);
    master.timeline.updateTiming(master.timeline.video.duration, data.framerate);
    master.timeline.createFrames();
    let axesPos = master.toScaled(canvas.width/2, canvas.height/2);
    master.newAxes(axesPos.x, axesPos.y, data.axesColor, true);
    this.hide().clear();
    master.viewPoints = {
        forward: parseInt(data.pointsForward),
        backward: parseInt(data.pointsBackward)
    };
    master.updateVisiblePoints();
    master.created = true;
    master.trigger("created");
});

saveProject.on("saveFile", function(modalData){
    showLoader();
    var fileUrl = URL.createObjectURL(master.videoFile);
    JSZipUtils.getBinaryContent(fileUrl, function (err, data) {
        if(err)
        {
            console.log(err);
        }

        var filename = modalData.filename || "";
        
        if(filename.length == 0)
        {
            filename = master.name.toLowerCase().replace(" ", "_") + "-" + new Date().getTime() + "." + CUSTOM_EXTENSION;
        }
        else if(filename.split(".").pop() !== CUSTOM_EXTENSION)
            filename += "." + CUSTOM_EXTENSION;

        var projectInfo = JSON.stringify(master.save());
        var zip = new JSZip();

        zip.file("video.mp4", data, {binary:true}).file("meta.json", projectInfo);

        zip.generateAsync({type:"blob", mimeType: "application/octet-stream"}).then(function (blob) {
            saveAs(blob, filename);
            master.saved = true;
            hideLoader();
        }, function (err) {
            console.log(err);
        });
    });

    this.hide().clear();
})
.on("create", function(){
    var button = document.getElementById(this.id + "_button-saveDrive");
    button.disabled = true;
    var modal = this;
    var checkLoaded = setInterval(function(){
        try
        {
            if(gapi !== undefined)
            {
                if(gapi.client !== undefined)
                {
                    var upload = new DriveUpload({
                        apiKey: GOOGLE_API_KEY,
                        clientId: GOOGLE_CLIENT_ID,
                        buttonEl: document.getElementById(modal.id + "_button-saveDrive"),
                        logoutEl: document.getElementById('logout-button'),
                        getFile: function(callback){
                            showLoader();
                            var fileUrl = URL.createObjectURL(master.videoFile);
                            JSZipUtils.getBinaryContent(fileUrl, function (err, data) {
                                if(err)
                                {
                                    console.log(err);
                                }
                        
                                var filename = modal.export().filename || "";
                                if(filename.length == 0)
                                {
                                    filename = master.name.toLowerCase().replace(" ", "_") + "-" + new Date().getTime() + "." + CUSTOM_EXTENSION;
                                }
                                else if(filename.split(".").pop() !== CUSTOM_EXTENSION)
                                    filename += "." + CUSTOM_EXTENSION;
                        
                                var projectInfo = JSON.stringify(master.save());
                                var zip = new JSZip();
                        
                                zip.file("video.mp4", data, {binary:true}).file("meta.json", projectInfo);
                        
                                zip.generateAsync({type:"arraybuffer", mimeType: "application/octet-stream"}).then(function (zipFile) {
                                    callback(zipFile, filename, function(success){
                                        hideLoader();
                                        if(success)
                                        {
                                            modal.hide();
                                        }
                                        else
                                        {
                                            modal.hide();
                                        }
                                    });
                                }, function (err) {
                                    console.log(err);
                                });
                            });
                        }
                    });
                    clearInterval(checkLoaded);
                }
            }
        }
        catch
        {
            console.log("Google could not be loaded.");
            clearInterval(checkLoaded);
        }
    }, 400);
})
.on("cancel", function(){
    this.hide().clear();
});

editProject.on("submit", function(data){
    master.name = data.name;
    master.timeline.frameSkip = parseInt(data.frameskip);
    master.axes.updateColor(data.axesColor);
    this.hide().clear();
    master.viewPoints = {
        forward: parseInt(data.pointsForward),
        backward: parseInt(data.pointsBackward)
    };
    master.updateVisiblePoints();
})
.on("cancel", function(){
    this.hide().clear();
});

exportData.on("submit", function(data){
    var workbook = XLSX.utils.book_new();

    for(var uid in master.trackList)
    {
        let track = master.trackList[uid];
        let ws = XLSX.utils.aoa_to_sheet(track.export().table.scaled);
        XLSX.utils.book_append_sheet(workbook, ws, track.name);
    }

    let filename = data.filename;

    if(filename.split(".").length <= 1)
        filename += ".xlsx";

    if(!EXPORT_FORMATS.includes(filename.split(".")[filename.split(".").length - 1]))
        filename += ".xlsx";
    
    XLSX.writeFile(workbook, filename);

    this.hide().clear();
})
.on("cancel", function(){
    this.hide().clear();
});

editScale.on("cancel", function(){
    this.hide().clear();
})
.on("submit", function(data){
    master.scale.updateInfo({
        "color": data.color
    });
    this.hide();
});

var counter = 3;
newScale.on("submit", function(data){
    master.state.mode = "newScale";
    counter = 1;
    var locations = {
        "point1": {},
        "point2": {}
    };
    posText.text = "Click for 1st end of scale";
    stage.on("click", function(e){
        let mouseCoords = master.toScaled(e.stageX, e.stageY);
        if(counter === 1)
        {
            locations.point1 = {"x": mouseCoords.x, "y": mouseCoords.y};
            posText.text = "Click for 2nd end of scale";
            counter++;
        }
        else if(counter === 2)
        {
            locations.point2 = {"x": mouseCoords.x, "y": mouseCoords.y};
            let scale = master.newScale(null, locations.point1.x, locations.point1.y, locations.point2.x, locations.point2.y, data.color);
            window.setTimeout(function(){
                scale.textElement.dispatchEvent(new Event("startEditing"));
                scale.textElement.value = "";
                scale.textElement.focus();
            }, 200);
            stage.cursor = "default";
            master.state.default();
            counter++;
        }
    });
    this.hide().clear();
})
.on("cancel", function(){
    this.hide().clear();
});

editTrack.on("cancel", function(){
    this.hide().clear();
})
.on("submit", function(data){
    if(master.trackList[data.uid] !== undefined)
    {
        master.trackList[data.uid].update({
            "name": data.name,
            "color": data.color
        });
    }
    this.hide();
});

newTrack.on("cancel", function(){
    this.hide().clear();
})
.on("submit", function(data){
    this.hide().clear();
    master.newTrack(data.name, data.color, true);
});