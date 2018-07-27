document.getElementById("new-track-button").addEventListener("click", function(){
    newTrack.push({
        "color": newTrack.defaultColors[Math.floor(Math.random()*newTrack.defaultColors.length)]
    });
    newTrack.show();
});
document.getElementById("export-button").addEventListener("click", function(){
    exportData.show();
});
document.getElementById("save-button").addEventListener("click", function(){
    saveProject.show();
});
document.getElementById("scale-button").addEventListener("click", function(){
    if(master.scale !== undefined && master.scale !== null)
    {
        editScale.push({
            "name": master.scale.name,
            "color": master.scale.color
        }).show();
    }
    else
    {
        newScale.show();
    }
});
document.getElementById("edit-project-button").addEventListener("click", function(){
    editProject.push({
        "name": master.name,
        "framerate": master.timeline.fps,
        "axesColor": master.axes.color
    }).show();
});

document.getElementById("track-list").querySelector("ul").querySelectorAll("li").forEach(function(element){
    element.addEventListener("click", function(){
        let uid = this.getAttribute("data-uid");
        master.switchTrack(uid);
    });
    element.addEventListener("dblclick", function(){
        let uid = this.getAttribute("data-uid");
        if(master.trackList[uid] !== undefined)
        {
            editTrack.push({
                "name": master.trackList[uid].name,
                "color": master.trackList[uid].color,
                "unit": master.trackList[uid].unit.toString(),
                "uid": uid
            }).show();
        }
    });
});


function hideLaunchModal()
{
    document.getElementById("modal-container").classList.remove("active");
    document.getElementById("modal-container").classList.remove("launch");
    document.getElementById("launch").classList.remove("active");
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
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files);
}, false);

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function isQuotaExceeded(e) {
    var quotaExceeded = false;
    if (e) {
        if (e.code) {
            switch (e.code) {
                case 22:
                    quotaExceeded = true;
                    break;
                case 1014:
                    // Firefox
                    if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                        quotaExceeded = true;
                    }
                    break;
            }
        }
        else if (e.number === -2147024882) {
            // Internet Explorer 8
            quotaExceeded = true;
        }
    }
    return quotaExceeded;
}

document.getElementById("save-project-storage-button").addEventListener("click", function(){
    var saveable = false;
    if(localStorage.getItem("openFile") !== undefined && localStorage.getItem("openFile") !== null && localStorage.getItem("openFile") !== "")
    {
        var date = localStorage.getItem("fileSaveDate") || (new Date().toString());
        date = new Date(date).toLocaleString();
        if(confirm("You already have a project stored in your browser from " + date + " which will be overwritten. Would you like to continue?"))
        {
            saveable = true;
        }
    }
    else
    {
        saveable = true;
    }

    if(saveable)
    {
        var fileUrl = URL.createObjectURL(master.videoFile);
        JSZipUtils.getBinaryContent(fileUrl, function (err, data) {
            if(err)
            {
                console.log(err);
            }

            var projectInfo = JSON.stringify(master.save());
            var zip = new JSZip();

            zip.file("video.mp4", data, {binary:true}).file("meta.json", projectInfo);

            zip.generateAsync({type:"blob"}).then(function (blob) {
                var reader = new FileReader();
                reader.readAsDataURL(blob); 
                reader.onload = function() {
                    try {
                        localStorage.setItem("openFile", reader.result);
                        localStorage.setItem("fileSaveDate", new Date().toString());
                        alert("Project successfully saved to storage! Next time this page is loaded you will be asked if you want to open it.");
                    }
                    catch(e)
                    {
                        if(isQuotaExceeded(e))
                        {
                            if(confirm("Sorry, your project is too big to save in browser. You can still save it as a ." + CUSTOM_EXTENSION + " file, however."))
                            {
                                saveProject.show();
                            }
                        }
                    }
                }
            }, function (err) {
                console.log(err);
            });

        });
    }
});

if(localStorage.getItem("openFile") !== undefined && localStorage.getItem("openFile") !== null && localStorage.getItem("openFile") !== "")
{
    if(document.getElementById("launch").classList.contains("active"))
    {
        var date = localStorage.getItem("fileSaveDate") || (new Date().toString());
        date = new Date(date).toLocaleString();
        if(confirm("You have a project stored in your localstorage from " + date + ". Would you like to load this?"))
        {
            var file = dataURLtoBlob(localStorage.getItem("openFile"));
            console.log(file);
            if(file.type == "application/zip")
            {
                showLoader();
                loadProject(file);
                hideLaunchModal();
            }
            else
            {
                if(confirm("Error opening project. Would you like to remove it from storage?"))
                {
                    localStorage.setItem("openFile", "");
                    localStorage.setItem("fileSavedDate", "");
                }
            }
        }
        else
        {
            if(confirm("Would you like to delete this from storage?"))
            {
                localStorage.setItem("openFile", "");
                localStorage.setItem("fileSavedDate", "");
            }
        }
    }
}


document.body.addEventListener('drop', function(e){
    if(!document.getElementById("launch").classList.contains("active"))
    {
        let dt = e.dataTransfer
        let files = dt.files

        var fileArray = [...files];
        if(fileArray.length > 0)
        {
            var file = fileArray[0];
            if(file.type === "" && file.name.split(".").pop() == CUSTOM_EXTENSION)
            {
                if(confirm("This will replace the current project and open this file. Would you like to continue?"))
                {
                    showLoader();
                    stage.removeAllChildren();
                    master.destroy();

                    master = new Project("My Project", new Timeline(canvas.width, canvas.height, document.getElementById("my-video"), 29.21), new Handsontable(tableContainer), stage);
                    stage.addChild(background);
                    stage.addChild(posText);

                    frameMarkers.master.shape.graphics.clear();
                    frameMarkers.master.markers = {};
                    
                    loadProject(file);
                    hideLaunchModal();
                    drawGraphics();
                    
                    master.timeline.video.addEventListener("playing", function(){
                        master.saved = true;
                        for(var time in master.timeline.frames)
                        {
                            if(frameMarkers.master.markers[time] === undefined)
                                frameMarkers.master.markers[time] = frameMarkers.master.shape.graphics.drawRect(((parseFloat(time) / master.timeline.duration) * scrubberLine.rect.w + scrubberLine.rect.x), scrubberLine.rect.y, 1, scrubberLine.rect.h).command;
                        }
                        hideLoader();
                    });
                }
            }
            else if(file.type == "video/mp4")
            {
                if(confirm("This will create a new project with this video. Would you like to continue?"))
                {
                    showLoader();
                    master.destroy();
                    stage.removeAllChildren();

                    master = new Project("My Project", new Timeline(canvas.width, canvas.height, document.getElementById("my-video"), 29.21), new Handsontable(tableContainer), stage);
                    stage.addChild(background);
                    stage.addChild(posText);

                    frameMarkers.master.shape.graphics.clear();
                    frameMarkers.master.markers = {};

                    loadVideo(file);
                    hideLaunchModal();
                    newProject.show();
                    hideLoader();
                }
            }
            else
            {
                alert("This filetype is not supported. It must be .mp4 or ." + CUSTOM_EXTENSION);
            }
        }
    }
}, false);

document.getElementById("file-input").addEventListener("change", function(e){
    handleFiles(this.files);
    showLoader();
});

function handleFiles(files)
{
    var fileArray = [...files];
    if(fileArray.length > 0)
    {
        var file = fileArray[0];
        switch(file.type)
        {
            case "video/mp4":
                loadVideo(file);
                hideLaunchModal();
                newProject.show();
                hideLoader();
                break;
            case "":
                if(file.name.split(".").pop() == CUSTOM_EXTENSION)
                {
                    loadProject(file);
                    hideLaunchModal();
                }
                else
                {
                    alert("This filetype is not supported. It must be .mp4 or ." + CUSTOM_EXTENSION);
                }
                break;
            default:
                alert("This filetype is not supported. It must be .mp4 or ." + CUSTOM_EXTENSION);
        }
    }
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