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
        },
        "unit": {
            "label": "Unit",
            "type": "text",
            "required": true
        }
    },
    buttons: {
        "cancel": {
            "label": "Cancel"
        },
        "submit": {
            "label": "Submit"
        }
    }
}, true);


var unitAutocomplete;
newTrack.on("create", function(){
    console.log("created");
    unitAutocomplete = new autoComplete({
        'selector': "#" + newTrack.fields.unit.id,
        'minChars': 1,
        'menuClass': 'autoComplete',
        'source': function(term, response, units=distanceUnits){
            var matches = [];
            term = term.toLowerCase();
            // if it is a unit or abbreviation
            for(var i=0; i < units.fullUnits.length; i++)
            {
                if(~units.fullUnits[i].toLowerCase().indexOf(term))
                {
                    matches.push(units.unitNames[i]);
                }
            }
            let wordPre = units.wordPrefixBig.concat(units.wordPrefixSmall);
            let abbrPre = units.abbrPrefixBig.concat(units.abbrPrefixSmall);
            for(var i=0; i < wordPre.length; i++)
            {
                if(~wordPre[i].toLowerCase().indexOf(term))
                {
                    matches.push(wordPre[i] + "meters");
                }
            }
            response(matches);
        }
    });
})
.on("cancel", function(){
    this.hide().clear();
})
.on("submit", function(data){
    this.hide().clear();
    master.newTrack(data.name, data.color, stage, data.unit, true);
});

stage.enableMouseOver();

createjs.Ticker.addEventListener("tick", stage);
stage.addEventListener("tick", function(){
    master.timeline.update();
    updateScrubber(master.timeline.currentTime, master.timeline.duration);
});
var background = new createjs.Bitmap(document.getElementById("my-video"));
stage.addChild(background);

video = document.getElementById("my-video");
video.pause();

var tableContainer = document.getElementById('table');
var master = new Project("My Project", new Timeline(video.duration, canvas.width, canvas.height, video, new createjs.Shape()), new Handsontable(tableContainer));
master.newTrack("track1", "#f00", stage, "m", true);
master.newAxes(stage, 300, 200, "#ff69b4", true);
master.newScale(stage, "scale1", "3 m", 20, 20, 100, 100, "#FF3300");
master.newScale(stage, "scale1", "3 m", 200, 200, 300, 300, "#39ff14");

var posText = new createjs.Text("Frame: 0, X: 0, Y: 0", "13px Arial", "#FFF");
posText.x = 10;
posText.y = canvas.height - 20;
stage.addChild(posText);


stage.update();


var initialSize = {};

function drawGraphics(initialDraw=false)
{
    let width = window.innerWidth - sidebar.offsetWidth;
    let height = window.innerHeight - 50;
    
    if(initialDraw)
    {
        initialSize.width = video.videoWidth;
        initialSize.height = video.videoHeight;
    }

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

    let scale = Math.min((width / initialSize.width), (height / initialSize.height));
    stage.scale = scale;
    
    canvas.height = stage.scale * initialSize.height;
    canvas.width = stage.scale * initialSize.width;

    if(initialDraw)
    {
        background.scale = stage.scale;
        stage.scale = 1;
        initialSize.width = canvas.width;
        initialSize.height = canvas.height;
        initialSize.backgroundScale = background.scaleX;
    }
    else
    {
        background.scale = width / (stage.scale * video.videoWidth);
    }


    document.getElementById("main-container").style.left = ((width - canvas.width) / 2) + "px";
    document.getElementById("main-container").style.top = ((height - canvas.height) / 2) + "px";

    //scrubber.scaleX = stage.scaleX;
    
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
    posText.regY = 25;
    posText.y = stage.globalToLocal(0, canvas.height).y;

    scrubberLine.startMarker.x = (master.timeline.startFrame / master.timeline.frameCount * scrubberLine.rect.w) + scrubberLine.rect.x;
    scrubberLine.endMarker.x = (master.timeline.endFrame / master.timeline.frameCount * scrubberLine.rect.w) + scrubberLine.rect.x;
    scrubberLine.startMarker.y = scrubberLine.rect.y + scrubberLine.rect.h + 6;
    scrubberLine.endMarker.y = scrubberLine.rect.y + scrubberLine.rect.h + 6;

    master.handsOnTable.render();

    stage.update();
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
    drawGraphics();
});

dragula([document.getElementById("sidebar")], {
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
})
.on("drag", function(el){
    el.querySelector(".handle-bar").style.cursor = "grabbing";
})
.on("dragend", function(el){
    el.querySelector(".handle-bar").style.cursor = "grab";
});;


video.addEventListener("loadeddata", function(){
    // let lastTime = 0;
    // let frame = null;
    // let frameTime = 1/60;
    // let sirDifference = 0;
    // let newCanv = document.createElement("canvas");
    // let lilCanv = newCanv.getContext("2d");
    // lilCanv.width = video.videoWidth;
    // lilCanv.height = video.videoHeight;
    // lilCanv.drawImage(video, 0, 0, canvas.width, canvas.height);
    // let lastFrame = lilCanv.getImageData(0, 0, canvas.width, canvas.height).data;
    // for(var tempTime = 0; tempTime <= video.duration; tempTime += frameTime)
    // {
    //     video.currentTime = tempTime;
    //     lilCanv.drawImage(video, 0, 0, canvas.width, canvas.height);
    //     frame = lilCanv.getImageData(0, 0, canvas.width, canvas.height).data;
    //     ////console.log(lastFrame, frame);
    //     if(lastFrame !== frame)
    //     {
    //         sirDifference = tempTime - lastTime;
    //         lastTime = tempTime;
    //         //console.log(sirDifference);
    //         lastFrame = frame;
    //     }
    // }

    background.image = this;
    master.timeline.updateDuration(video.duration);
    master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
    master.timeline.video.currentTime = master.timeline.currentTime;
    drawGraphics(true);
});

window.addEventListener("resize", drawGraphics);

stage.on("stagemousemove", function(e){
    var coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
	posText.text = "Frame: " + (master.timeline.currentTime / master.timeline.frameTime).roundTo(2) + ", X: " + Math.round(coords.x) + ", Y: " + Math.round(coords.y);
    stage.update();
});

stage.on("click", function(e){
    if(master.track.state.mode == "add")
    {
        let frame = master.timeline.current();
        if(frame === false)
        {
            frame = master.timeline.addFrame(master.timeline.currentTime);
            frameMarkers.master.markers[frame.uid] = frameMarkers.master.shape.graphics.drawRect(((master.timeline.currentTime / master.timeline.duration) * scrubberLine.rect.w + scrubberLine.rect.x), scrubberLine.rect.y, 1, scrubberLine.rect.h).command;
            scrubber.update();
        }

        master.track.addPoint(frame, stage.mouseX/stage.scaleX, stage.mouseY/stage.scaleY);
        stage.update();


        let nextFrame = master.timeline.next();

        if(nextFrame !== false && nextFrame.distance <= master.timeline.frameTime)
        {
            master.timeline.setFrame(nextFrame.frame.time);
            master.track.points[nextFrame.frame.time].emphasize();
            stage.update();
        }
        else
        {
            let closestFrame = master.timeline.getClosestFrame();
            
            master.timeline.currentTime = ((closestFrame + 1) * master.timeline.frameTime).roundTo(3);
            master.timeline.video.currentTime = master.timeline.currentTime;
            master.track.unselectAll();
            master.track.unemphasizeAll();
            stage.update();
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

        if(frame !== false && frame.distance <= master.timeline.frameTime * master.timeline.frameSkip)
        {
            if(master.timeline.setFrame(frame.frame.time) !== false)
            {
                master.track.unselectAll();
                master.track.unemphasizeAll();
                if(master.track.points[frame.frame.time] !== undefined)
                {
                    master.track.points[frame.frame.time].emphasize();
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
        }
        else
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.endFrame);
            master.track.unselectAll();
            master.track.unemphasizeAll();
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
            closestFrame = master.startFrame + 1;
        
        if(frame !== false && frame.distance <= master.timeline.frameTime * master.timeline.frameSkip)
        {
            if(master.timeline.setFrame(frame.frame.time) !== false)
            {
                master.track.unselectAll();
                master.track.unemphasizeAll();
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
        }
        else
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.startFrame);
            master.track.unselectAll();
            master.track.unemphasizeAll();
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
            scrubber.update();
            
            time = (closestFrame * master.timeline.frameTime).roundTo(3);
            master.timeline.video.currentTime = time;
            master.timeline.currentTime = time;
            stage.update();
        }
        else if(closestFrame < master.timeline.startFrame)
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
        }
        else if(closestFrame > master.timeline.endFrame)
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
        }

    }
    else if(coords.x < (scrubberLine.rect.w / master.timeline.frameCount) * master.timeline.startFrame + scrubberLine.rect.x)
    {
        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
    }
    else if(coords.x > (scrubberLine.rect.w / master.timeline.frameCount) * master.timeline.endFrame + scrubberLine.rect.x)
    {
        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
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
scrubberLine.startMarker.on("pressmove", function(e){
    var coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
    let closestFrame = master.timeline.getClosestFrame(((coords.x - scrubberLine.rect.x) / scrubberLine.rect.w) * master.timeline.duration);
    console.log(closestFrame);
    if(closestFrame <= master.timeline.frameCount && closestFrame < master.timeline.endFrame && closestFrame >= 0)
    {
        scrubberLine.startMarker.x = closestFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.startFrame = closestFrame;
        if(master.timeline.currentTime < master.timeline.getFrameStart(master.timeline.startFrame))
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
        }
    }
    else if(closestFrame < 0)
    {
        scrubberLine.startMarker.x = scrubberLine.rect.x;
        master.timeline.startFrame = 0;
        if(master.timeline.currentTime < master.timeline.getFrameStart(master.timeline.startFrame))
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
        }
    }
    frameArrows.update();
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
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
        }
    }
    else if(closestFrame > master.timeline.frameCount)
    {
        scrubberLine.endMarker.x = master.timeline.frameCount * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.endFrame = master.timeline.frameCount;
        if(master.timeline.currentTime > master.timeline.getFrameStart(master.timeline.endFrame))
        {
            master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.endFrame);
        }
    }
    frameArrows.update();
});
document.onkeydown = function(e){
    switch(e.keyCode)
    {
        case 16:
            stage.cursor = "crosshair";
            master.track.state.mode = "add";
            parent.stage._testMouseOver(true);
            break;
    }
}
document.onkeyup = function(e){
    switch(e.keyCode)
    {
        case 16:
            stage.cursor = "default";
            master.track.state.mode = "default";
            parent.stage._testMouseOver(true);
            break;
    }
}