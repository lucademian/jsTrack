var sidebar = document.getElementById("sidebar");
var videoContainer = document.getElementById("video-container");
var canvas = document.getElementById("main");
var stage = new createjs.Stage("main");
var distanceUnits = {
    "fullUnits": ["meter (m)", "inch (in)", "foot (ft)", "yard (yd)", "mile (mi)", "link (li)", "rod (rd)", "chain (ch)", "angstrom", "mil"],
    "abbreviations": ["m", "in", "ft", "yd", "mi", "li", "rd", "ch", "angstrom", "mil"],
    "unitNames": ["meter", "inch", "foot", "yard", "mile", "link", "rod", "chain", "angstrom", "mil"],
    "wordPrefixBig": ["deca", "hecto", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"],
    "abbrPrefixBig": ["da", "h", "k", "M", "G", "T", "P", "E", "Z", "Y"],
    "wordPrefixSmall": ["deci", "centi", "milli", "micro", "nano", "pico", "femto", "atto", "zepto", "yocto"],
    "abbrPrefixSmall": ["d", "c", "m", "u", "n", "p", "f", "a", "z", "y"]
};
const EXPORT_FORMATS = ["xlsx", "xlsm", "xlsb", "xls", "ods", "fods", "csv", "txt", "sylk", "html", "dif", "dbf", "rtf", "prn", "eth"];
const CUSTOM_EXTENSION = "jstrack";


var background = new createjs.Bitmap(document.getElementById("video"));
var background2 = new createjs.Bitmap(document.getElementById("video-clone"));
stage.addChild(background2);
stage.addChild(background);

var tableContainer = document.getElementById('table');
var master = new Project("My Project", new Timeline(canvas.width, canvas.height, document.getElementById("video"), 29.21), new Handsontable(tableContainer), stage, background);


master.timeline.video.addEventListener("loadstart", function(){
    document.getElementById("video-clone").src = this.src;
    document.getElementById("video-clone").style.display = "none";
});

tableContainer.querySelectorAll("table").forEach(function(el){
    el.id = "data-table-master";
});

var video = master.timeline.video;

var posTextBackground = new createjs.Shape();
var posTextBackgroundCommand = posTextBackground.graphics.beginFill("#000000").drawRect(0, 0, 200, 30).command;
var posText = new createjs.Text("Frame: 0, X: 0, Y: 0", "13px Arial", "#FFF");
posText.x = 10;
posText.y = canvas.height - 15;
stage.addChild(posTextBackground);
stage.addChild(posText);


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
            console.log(data);
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

var helpText = new modal({
    name: "Directions",
    id: "help-modal",
    text: [
        "Welcome to JSTrack, an open source online version of <a href='https://physlets.org/tracker/'>Tracker</a>",
        "JSTrack makes it easy to create a new project. Simply drag your video file onto the box when the page opens. If you want to open an existing ." + CUSTOM_EXTENSION + " file, just drag that on instead of a video.",
        "<b>Tracking:</b> Once you have opened or created your project, the steps to begin tracking are very short. In the top of the sidebar to the right, you will see some buttons. The first button, which is three dots connected by diagonal lines, is what you click to create a new data track.",
        "After you click that and create your first track, you simply hold the <code>shift</code> button and click on the video using the new point tool.",
        "When you've finished your tracking, you can move the indicator arrows under the timeline to change the starting and ending frames of the movement",
        "<b>Scales:</b> You can add a scale at any time, before or after tracking, by clicking the button directly after the track button, which is three dots in a straight line.",
        "After creating this scale, you will be directed to click for the starting and ending points of the scale, and then enter the value. The default is 1m. To convert units within the scale value, use the <code>></code> key, like this: <code>4.3 in > m</code>.",
        "You can create as many tracks as you need, but only one scale.",
        "Seeking around a video is done by using the frame arrows to the right of the timeline, dragging the black line along the timeline, or by clicking a point while holding the CTRL or CMD keys, which will also select said point.",
        "Undo/Redo is done by clicking the buttons with arrows in the toolbox at the top of the sidebar, or with <code>CTRL/CMD + z</code> for undo or <code>CTRL/CMD + y</code> for redo"
    ],
    buttons: {
        "close": {
            label: "Close"
        }
    }
});
helpText.on("close", function(){
    this.hide();
});

var newProject = new modal({
    name: "New Project",
    id: "new-project-modal",
    fields: {
        "name": {
            "label": "Name",
            "type": "text",
            "required": true
        },
        "framerate": {
            "label": "Framerate",
            "type": "number",
            "required": true,
            "initVal": "30"
        },
        "axesColor": {
            "label": "Axes Color",
            "type": "color",
            "defaultValue": "#ff69b4",
            "required": true
        },
        "pointsBackward": {
            "label": "Points Before Current Time",
            "type": "number",
            "defaultValue": "7",
            "required": true
        },
        "pointsForward": {
            "label": "Points Ahead of Current Time",
            "type": "number",
            "defaultValue": "0",
            "required": true
        }
    },
    buttons: {
        "submit": {
            "label": "Create"
        }
    }
});


newProject.on("submit", function(data){
    master.name = data.name;
    master.timeline.updateFps(data.framerate);
    master.newAxes(300, 200, data.axesColor, true);
    this.hide().clear();
    master.viewPoints = {
        forward: data.pointsForward,
        backward: data.pointsBackward
    };
    master.updateVisiblePoints();
    master.created = true;
    master.trigger("created");
});


var saveProject = new modal({
    name: "Save Project",
    id: "save-project-modal",
    fields: {
        "filename": {
            "label": "Filename",
            "type": "text",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "saveFile": {
            "label": "Save as File",
            "image": "icons/save_file_white.svg"
        },
        "saveDrive": {
            "label": "Save to Drive",
            "image": "icons/drive_white.svg"
        }
    }
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
        if(gapi.client !== undefined)
        {
            var upload = new DriveUpload({
                apiKey: 'AIzaSyBNvbE95WObsTDKxj8Eo7x2jfCmP99oxNA',
                clientId: '44440188363-5vnafandpsrppr9189u7sc8q755oar9d',
                buttonEl: document.getElementById(modal.id + "_button-saveDrive"),
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
    }, 400);
})
.on("cancel", function(){
    this.hide().clear();
});

var editProject = new modal({
    name: "Edit Project",
    id: "edit-project-modal",
    fields: {
        "name": {
            "label": "Name",
            "type": "text",
            "required": true
        },
        "framerate": {
            "label": "Framerate",
            "type": "text",
            "required": true
        },
        "axesColor": {
            "label": "Axes Color",
            "type": "color",
            "defaultValue": "#ff69b4",
            "required": true
        },
        "pointsBackward": {
            "label": "Points Before Current Time",
            "type": "number",
            "defaultValue": "7",
            "required": true
        },
        "pointsForward": {
            "label": "Points Ahead of Current Time",
            "type": "number",
            "defaultValue": "0",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Save"
        }
    }
});

editProject.on("submit", function(data){
    master.name = data.name;
    master.timeline.updateFps(data.framerate);
    master.axes.updateColor(data.axesColor);
    this.hide().clear();
    master.viewPoints = {
        forward: data.pointsForward,
        backward: data.pointsBackward
    };
    master.updateVisiblePoints();
})
.on("cancel", function(){
    this.hide().clear();
});


var exportData = new modal({
    name: "Export Data",
    id: "export-modal",
    fields: {
        "filename": {
            "label": "Filename",
            "type": "text",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Export"
        }
    }
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

var newScale = new modal({
    name: "New Scale",
    id: "new-scale",
    fields: {
        "color": {
            "label": "Color",
            "type": "color",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Create"
        }
    }
});

var editScale = new modal({
    name: "Edit Scale",
    id: "edit-scale",
    fields: {
        "color": {
            "label": "Color",
            "type": "color",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Save"
        }
    }
});
editScale.on("cancel", function(){
    this.hide().clear();
})
.on("submit", function(data){
    console.log(data);
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
            scale.textElement.dispatchEvent(new Event("startEditing"));
            scale.textElement.value = "";
            scale.textElement.focus();
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

master.on("deleteTrack", function(){
    if(Object.keys(master.trackList).length == 0)
        document.getElementById("tracks").classList.add("hidden");
});

master.on("undeleteTrack", function(){
    if(Object.keys(master.trackList).length > 0)
        document.getElementById("tracks").classList.remove("hidden");
});
master.on("newScale", function(){
    document.getElementById("scale-button").title = "Edit Scale";
});

var newTrack = new modal({
    name: "New Track",
    id: "new-track",
    fields: {
        "name": {
            "label": "Name",
            "type": "text",
            "required": true
        },
        "color": {
            "label": "Color",
            "type": "color",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Create"
        }
    }
});



var editTrack = new modal({
    name: "Edit Track",
    id: "edit-track",
    fields: {
        "name": {
            "label": "Name",
            "type": "text",
            "required": true
        },
        "color": {
            "label": "Color",
            "type": "color",
            "required": true
        },
        "uid": {
            "type": "hidden"
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Save"
        }
    }
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

var unitAutocomplete;
newTrack.on("create", function(){
    console.log("created");
})
.on("cancel", function(){
    this.hide().clear();
})
.on("submit", function(data){
    this.hide().clear();
    master.newTrack(data.name, data.color, true);
});

master.on("newTrack", function(){
    document.getElementById("tracks").classList.remove("hidden");
    document.getElementById("graphs").classList.remove("hidden");
});

stage.enableMouseOver();

createjs.Ticker.addEventListener("tick", stage);
stage.addEventListener("tick", function(){
    master.timeline.update();
    updateScrubber(master.timeline.currentTime, master.timeline.duration);
});


function drawGraphics(initialDraw=false)
{
    let width = window.innerWidth - sidebar.offsetWidth;
    let height = window.innerHeight - 50;

    if(window.innerWidth < 1000)
    {
        width = window.innerWidth;
        sidebar.classList.remove("normal");
        sidebar.classList.add("hidden");
    }
    else
    {
        sidebar.classList.add("normal");
        sidebar.classList.remove("hidden");
    }

    videoContainer.style.width = width + "px";
    videoContainer.style.height = height + "px";

    let scale = Math.min((width / master.timeline.video.videoWidth), (height / master.timeline.video.videoHeight));
    master.backgroundScale = scale;
    
    canvas.height = height;
    canvas.width = width;
    background.scale = master.backgroundScale * master.positioning.zoom;
    master.positioning.x = (canvas.width - (background.scale * master.timeline.video.videoWidth)) / 2;
    master.positioning.y = (canvas.height - (background.scale * master.timeline.video.videoHeight)) / 2;

    background2.scale = background.scale;
    background2.x = background.x;
    background2.y = background.y;
    
    scrubberCanv.width = canvas.width;
    scrubberCanv.height = 50;
    scrubberLine.rect.w = scrubberCanv.width / stage.scaleX - 100;
    scrubberLine.rect.h = 10;
    scrubberLine.rect.y = (scrubberCanv.height - 10) / 2;
    scrubberLine.rect.x = 15;

    scrubberLine.thumb.y = scrubberLine.rect.y;
    scrubberLine.thumb.x = scrubberLine.rect.x;
    scrubberLine.thumb.rect.h = (scrubberLine.rect.h + 10);
    
    frameArrows.forward.sprite.x = scrubberCanv.width - 30;
    frameArrows.forward.sprite.y = (scrubberCanv.height - 20) / 2;

    frameArrows.back.sprite.x = scrubberCanv.width - 60;
    frameArrows.back.sprite.y = (scrubberCanv.height - 20) / 2;
    
    posText.x = 10;
    posText.regY = 20;
    posText.y = stage.globalToLocal(0, canvas.height).y;

    posTextBackground.regY = posTextBackgroundCommand.h;
    posTextBackground.y = stage.globalToLocal(0, canvas.height).y;

    scrubberLine.startMarker.x = (master.timeline.startFrame / master.timeline.frameCount * scrubberLine.rect.w) + scrubberLine.rect.x;
    scrubberLine.endMarker.x = (master.timeline.endFrame / master.timeline.frameCount * scrubberLine.rect.w) + scrubberLine.rect.x;
    scrubberLine.startMarker.y = scrubberLine.rect.y + scrubberLine.rect.h + 6;
    scrubberLine.endMarker.y = scrubberLine.rect.y + scrubberLine.rect.h + 6;

    for(var time in frameMarkers.master.markers)
    {
        let marker = frameMarkers.master.markers[time];
        marker.x = ((time / master.timeline.duration) * scrubberLine.rect.w + scrubberLine.rect.x);
    }

    master.handsOnTable.render();

    stage.update();
    master.updateScale();
    scrubber.update();
    frameArrows.update();
    console.log("drawn");
}

interact("#sidebar").resizable({
    edges: { left: true },
    restrictEdges: {
        outer: 'parent',
        endOnly: true,
    },

    // minimum size
    restrictSize: {
        min: { width: 400},
        max: {width: window.innerWidth - 300}
    },

    inertia: true,
})
.on('resizemove', function (event) {
    var target = event.target;

    // update the element's style
    target.style.width  = event.rect.width + 'px';
})
.on('resizeend', drawGraphics);

var panelMove = dragula([document.getElementById("sidebar")], {
    direction: "vertical",
    moves: function(el, source, handle, sibling){
        if(!handle.classList.contains("handle-bar"))
        {
            return false;
        }
        else
        {
            handle.style.cursor = "grabbing";
            return true;
        }
    }
});

var scroll = 0;
var interval = false;
panelMove.on("drag", function(el){
    el.querySelector(".handle-bar").style.cursor = "grabbing";
    interval = window.setInterval(function(){
        let position = document.querySelector(".gu-mirror").getBoundingClientRect();

        if(panelMove.dragging)
        {
            if(position.top < 100)
            {
                scroll = -1;
            }
            else if(position.top > window.innerHeight - 100)
            {
                scroll = 1;
            }
            else
            {
                scroll = 0;
            }
        }
        else
        {
            scroll = 0;
        }
        document.getElementById("sidebar").scrollTop += scroll * 20;
    }, 100);
})
.on("dragend", function(el){
    el.querySelector(".handle-bar").style.cursor = "grab";
    if(interval !== false)
    {
        clearInterval(interval);
        interval = false;
    }
});

video.onplaying = (function(){
    console.log("loaded");
    video.pause();
    video.currentTime = 0;
    background.image = this;
    master.timeline.updateDuration(video.duration);
    master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
    master.timeline.video.currentTime = master.timeline.currentTime;
    drawGraphics(true);
    video.style.display = "none";
});

var resizeTimer;
window.addEventListener("resize", function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawGraphics, 250);
});

stage.on("stagemousemove", function(e){
    var coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
    
    if(master.state.mode == "newScale")
    {

    }
    else
    {
        posText.text = "Frame: " + (master.timeline.currentTime / master.timeline.frameTime).roundTo(2) + ", X: " + Math.round(coords.x) + ", Y: " + Math.round(coords.y);
    }
    
    
    stage.update();
});

stage.on("click", function(e){
    if(master.track !== null && master.track !== undefined)
    {
        if(master.track.state.mode == "add")
        {
            var frame = master.timeline.current();
            if(frame === false)
            {
                frame = master.timeline.addFrame(master.timeline.currentTime);
                if(frameMarkers.master.markers[frame.time] == undefined)
                    frameMarkers.master.markers[frame.time] = frameMarkers.master.shape.graphics.drawRect(((master.timeline.currentTime / master.timeline.duration) * scrubberLine.rect.w + scrubberLine.rect.x), scrubberLine.rect.y, 1, scrubberLine.rect.h).command;
            }
            let scaled = master.toScaled(stage.mouseX, stage.mouseY);
            master.track.addPoint(frame, scaled.x, scaled.y);

            var nextFrame = master.timeline.next();

            if(nextFrame !== false && nextFrame.distance <= master.timeline.frameTime)
            {
                master.timeline.setFrame(nextFrame.frame.time);
                // master.updateVisiblePoints();

                if(master.track.points[nextFrame.frame.time] !== undefined)
                    master.track.points[nextFrame.frame.time].show().emphasize();
            }
            else
            {
                var closestFrame = master.timeline.getClosestFrame();
                
                master.timeline.currentTime = ((closestFrame + 1) * master.timeline.frameTime).roundTo(3);
                master.timeline.video.currentTime = master.timeline.currentTime;
                master.track.unselectAll();
                master.track.unemphasizeAll();
                // master.updateVisiblePoints();
            }
        }
    }
    frameArrows.update();
});

frameArrows.forward.sprite.on("click", function(e){
    if(frameArrows.forward.enabled === true)
    {
        let time = master.timeline.currentTime;
        let frame = master.timeline.next();
        let closestFrame = master.timeline.getClosestFrame();
        if(closestFrame >= master.timeline.endFrame)
            closestFrame = master.timeline.endFrame - 1;

        if(frame !== false && frame.distance <= master.timeline.frameTime * master.timeline.frameSkip && frame.time <= master.timeline.getFrameStart(master.timeline.endFrame))
        {
            if(master.timeline.setFrame(frame.frame.time) !== false)
            {
                // master.updateVisiblePoints();
                master.track.unselectAll();
                master.track.unemphasizeAll();
                if(master.track.points[frame.frame.time] !== undefined)
                {
                    master.track.points[frame.frame.time].show().emphasize();
                }
            }
            else
            {
            }
        }
        else if(closestFrame <= master.timeline.endFrame - master.timeline.frameSkip && closestFrame >= master.timeline.startFrame)
        {
            master.timeline.currentTime = master.timeline.getFrameStart(closestFrame + master.timeline.frameSkip);
            master.track.unselectAll();
            master.track.unemphasizeAll();
            // master.updateVisiblePoints();
            if(master.track.points[master.timeline.currentTime] !== undefined)
            {
                master.track.points[master.timeline.currentTime].emphasize();
            }
        }
        else
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
            master.track.unselectAll();
            master.track.unemphasizeAll();
            // master.updateVisiblePoints();
            if(master.track.points[master.timeline.currentTime] !== undefined)
            {
                master.track.points[master.timeline.currentTime].emphasize();
            }
        }

        posText.text = "Frame: " + (master.timeline.currentTime / master.timeline.frameTime).roundTo(2) + ", X: "+stage.mouseX+", Y: "+stage.mouseY;
        frameArrows.update();
    }
});

frameArrows.back.sprite.on("click", function(e){
    if(frameArrows.back.enabled === true)
    {
        let time = master.timeline.currentTime;
        let frame = master.timeline.prev();
        let closestFrame = master.timeline.getClosestFrame();
        if(closestFrame <= master.startFrame)
            closestFrame = master.startFrame + master.timeline.frameSkip;
        
        if(frame !== false && frame.distance <= master.timeline.frameTime * master.timeline.frameSkip && frame.time >= master.timeline.getFrameStart(master.timeline.startFrame))
        {
            if(master.timeline.setFrame(frame.frame.time) !== false)
            {
                master.track.unselectAll();
                master.track.unemphasizeAll();
                // master.updateVisiblePoints();
                if(master.track.points[frame.frame.time] !== undefined)
                {
                    master.track.points[frame.frame.time].emphasize();
                }
            }
        }
        else if(closestFrame <= master.timeline.endFrame && closestFrame >= master.timeline.startFrame + master.timeline.frameSkip)
        {
            master.timeline.currentTime = master.timeline.getFrameStart(closestFrame - master.timeline.frameSkip);
            master.timeline.video.currentTime = master.timeline.currentTime;
            master.track.unselectAll();
            master.track.unemphasizeAll();
            // master.updateVisiblePoints();
            if(master.track.points[master.timeline.currentTime] !== undefined)
            {
                master.track.points[master.timeline.currentTime].emphasize();
            }
        }
        else
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
            master.track.unselectAll();
            master.track.unemphasizeAll();
            // master.updateVisiblePoints();
            if(master.track.points[master.timeline.currentTime] !== undefined)
            {
                master.track.points[master.timeline.currentTime].emphasize();
            }
        }
        posText.text = "Frame: " + (master.timeline.currentTime / master.timeline.frameTime).roundTo(2) + ", X: "+stage.mouseX+", Y: "+stage.mouseY;
        frameArrows.update();
    }
});

scrubberLine.thumb.on("pressmove", function(e){
    var coords = e.target.stage.globalToLocal(e.stageX, e.stageY);

    if(coords.x >= scrubberLine.rect.x && coords.x <= scrubberLine.rect.w + scrubberLine.rect.x)
    {
        let closestFrame = Math.round((((coords.x - scrubberLine.rect.x) / scrubberLine.rect.w) * master.timeline.duration) / (master.timeline.frameTime / 4)) / 4;
        if(closestFrame <= master.timeline.endFrame && closestFrame >= master.timeline.startFrame)
        {
            
            //console.log(closestFrame);
            scrubberLine.thumb.x = closestFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
            
            time = (closestFrame * master.timeline.frameTime).roundTo(3);
            master.timeline.video.currentTime = time;
            master.timeline.currentTime = time;
            // master.updateVisiblePoints();
        }
        else if(closestFrame < master.timeline.startFrame)
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
            // master.updateVisiblePoints();
        }
        else if(closestFrame > master.timeline.endFrame)
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
            // master.updateVisiblePoints();
        }

    }
    else if(coords.x < (scrubberLine.rect.w / master.timeline.frameCount) * master.timeline.startFrame + scrubberLine.rect.x)
    {
        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
        // master.updateVisiblePoints();
    }
    else if(coords.x > (scrubberLine.rect.w / master.timeline.frameCount) * master.timeline.endFrame + scrubberLine.rect.x)
    {
        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
        // master.updateVisiblePoints();
    }
    
    let current = master.timeline.current();
    if(current !== false)
    {
        master.track.unselectAll();
        master.track.unemphasizeAll();
        if(master.track.points[current.time] !== undefined)
        {
            master.track.points[current.time].emphasize();
        }
    }
    else
    {
        master.track.unselectAll();
        master.track.unemphasizeAll();
    }

    posText.text = "Frame: " + (master.timeline.currentTime / master.timeline.frameTime).roundTo(2) + ", X: 0, Y: 0";
    frameArrows.update();
});

var startMarkerStuck = false;
var startFrames = [];

scrubberLine.startMarker.on("mousedown", function(e){
    if(startFrames.length == 0)
    {
        startFrames.push(master.timeline.startFrame);
    }
});
scrubberLine.startMarker.on("pressmove", function(e){
    var coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
    let closestFrame = master.timeline.getClosestFrame(((coords.x - scrubberLine.rect.x) / scrubberLine.rect.w) * master.timeline.duration);
    if(closestFrame <= master.timeline.frameCount && closestFrame < master.timeline.endFrame && closestFrame >= 0)
    {
        scrubberLine.startMarker.x = closestFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.startFrame = closestFrame;
        if(master.timeline.currentTime < master.timeline.getFrameStart(master.timeline.startFrame))
        {
            startMarkerStuck = true;
        }
        master.update();
        // master.updateVisiblePoints();
    }
    else if(closestFrame < 0)
    {
        scrubberLine.startMarker.x = scrubberLine.rect.x;
        master.timeline.startFrame = 0;
        if(master.timeline.currentTime < master.timeline.getFrameStart(master.timeline.startFrame))
        {
            startMarkerStuck = true;
        }
        master.update();
        // master.updateVisiblePoints();
    }

    if(startMarkerStuck)
    {
        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
        master.track.unemphasizeAll();
        if(master.track.points[master.timeline.currentTime] !== undefined)
        {
            master.track.points[master.timeline.currentTime].emphasize();
        }
    }

    frameArrows.update();
});
scrubberLine.startMarker.on("pressup", function(){
    if(master.timeline.startFrame !== startFrames.last())
    {
        let last = startFrames.last();
        let current = master.timeline.startFrame;
        let stuck = startMarkerStuck;
        let index = startFrames.length;
        if(startFrames.length >= 1)
        {
            master.change({
                undo: function(){
                    startFrames.splice(index, 1);
                    scrubberLine.startMarker.x = last * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
                    master.timeline.startFrame = last;
                    if(stuck)
                    {
                        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
                        master.track.unemphasizeAll();
                        if(master.track.points[master.timeline.currentTime] !== undefined)
                        {
                            master.track.points[master.timeline.currentTime].emphasize();
                        }
                    }
                    master.update();
                    // master.updateVisiblePoints();
                },
                redo: function(){
                    startFrames.push(current);
                    scrubberLine.startMarker.x = current * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
                    master.timeline.startFrame = current;
                    if(stuck)
                    {
                        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
                        master.track.unemphasizeAll();
                        if(master.track.points[master.timeline.currentTime] !== undefined)
                        {
                            master.track.points[master.timeline.currentTime].emphasize();
                        }
                    }
                    master.update();
                    // master.updateVisiblePoints();
                }
            });
        }
    }
    
    startFrames.push(master.timeline.startFrame);
    startMarkerStuck = false;
});

var endMarkerStuck = false;
var endFrames = [];

scrubberLine.endMarker.on("mousedown", function(e){
    if(endFrames.length == 0)
    {
        endFrames.push(master.timeline.endFrame);
    }
});
scrubberLine.endMarker.on("pressmove", function(e){
    var coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
    let closestFrame = master.timeline.getClosestFrame(((coords.x - scrubberLine.rect.x) / scrubberLine.rect.w) * master.timeline.duration);
    if(closestFrame <= master.timeline.frameCount && closestFrame > master.timeline.startFrame)
    {
        scrubberLine.endMarker.x = closestFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.endFrame = closestFrame;
        if(master.timeline.currentTime > master.timeline.getFrameStart(master.timeline.endFrame))
        {
            endMarkerStuck = true;
        }
        master.update();
        // master.updateVisiblePoints();
    }
    else if(closestFrame > master.timeline.frameCount)
    {
        scrubberLine.endMarker.x = master.timeline.frameCount * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.endFrame = master.timeline.frameCount;
        if(master.timeline.currentTime > master.timeline.getFrameStart(master.timeline.endFrame))
        {
            endMarkerStuck = true;
        }
        master.update();
        // master.updateVisiblePoints();
    }

    if(endMarkerStuck)
    {
        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
        master.track.unemphasizeAll();
        if(master.track.points[master.timeline.currentTime] !== undefined)
        {
            master.track.points[master.timeline.currentTime].emphasize();
        }
    }
    frameArrows.update();
});

scrubberLine.endMarker.on("pressup", function(){
    if(master.timeline.endFrame !== endFrames.last())
    {
        let last = endFrames.last();
        let current = master.timeline.endFrame;
        let stuck = endMarkerStuck;
        let index = endFrames.length;
        if(endFrames.length >= 1)
        {
            master.change({
                undo: function(){
                    endFrames.splice(index, 1);
                    scrubberLine.endMarker.x = last * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
                    master.timeline.endFrame = last;
                    if(stuck)
                    {
                        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
                        master.track.unemphasizeAll();
                        if(master.track.points[master.timeline.currentTime] !== undefined)
                        {
                            master.track.points[master.timeline.currentTime].emphasize();
                        }
                    }
                    master.update();
                    // master.updateVisiblePoints();
                },
                redo: function(){
                    endFrames.push(current);
                    scrubberLine.endMarker.x = current * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
                    master.timeline.endFrame = current;
                    if(stuck)
                    {
                        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
                        master.track.unemphasizeAll();
                        if(master.track.points[master.timeline.currentTime] !== undefined)
                        {
                            master.track.points[master.timeline.currentTime].emphasize();
                        }
                    }
                    master.update();
                    // master.updateVisiblePoints();
                }
            });
        }
    }
    
    endFrames.push(master.timeline.endFrame);
    endMarkerStuck = false;
});

master.timeline.on("seek", function(){
    this.project.updateVisiblePoints();
    document.getElementById("video-clone").currentTime = master.timeline.currentTime;
});

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

master.on("created", function(){
    scrubberLine.startMarker.x = this.timeline.startFrame * (scrubberLine.rect.w / this.timeline.frameCount) + scrubberLine.rect.x;
    scrubberLine.endMarker.x = this.timeline.endFrame * (scrubberLine.rect.w / this.timeline.frameCount) + scrubberLine.rect.x;

    for(var time in master.timeline.frames)
    {
        if(frameMarkers.master.markers[time] === undefined)
            frameMarkers.master.markers[time] = frameMarkers.master.shape.graphics.drawRect(((parseFloat(time) / master.timeline.duration) * scrubberLine.rect.w + scrubberLine.rect.x), scrubberLine.rect.y, 1, scrubberLine.rect.h).command;
    }

    this.updateVisiblePoints();
});

keyboardJS.pause();
keyboardJS.on("shift", function(e){
    e.preventRepeat();
    if(master.track !== null && master.track !== undefined)
    {
        master.state.mode = "add";
        for(var uid in master.trackList)
        {
            master.trackList[uid].state.mode = "add";
        }
    }
},
function(){
    if(master.track !== null && master.track !== undefined)
    {
        master.state.reset();
        for(var uid in master.trackList)
        {
            master.trackList[uid].state.resetMode();
        }
    }
});

keyboardJS.on("ctrl", function(e){
    e.preventRepeat();
    master.state.mode = "seek";
},
function(){
    master.state.reset();
});

keyboardJS.on(["ctrl+z", "cmd+z"], function(){
    master.undo();
});
keyboardJS.on(["ctrl+y", "cmd+z"], function(){
    master.redo();
});
keyboardJS.on(["ctrl+s", "cmd+s"], function(e){
    e.preventRepeat();
    e.preventDefault();
    saveProject.show();
});