var sidebar = document.getElementById("sidebar");
var videoContainer = document.getElementById("video-container");
var canvas = document.getElementById("main");
var stage = new createjs.Stage("main");

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

var master = new Project("My Project", new Timeline(video.duration, canvas.width, canvas.height, video, new createjs.Shape()));
master.newTrack("track1", "#f00", stage, "m", true);
master.newAxes(stage, 300, 200, "#ff69b4", true);
master.newScale(stage, "scale1", "3 m", 20, 20, 100, 100);


var posText = new createjs.Text("Frame: 0, X: 0, Y: 0", "13px Arial", "#FFF");
posText.x = 10;
posText.y = canvas.height - 20;
stage.addChild(posText);


stage.update();




function drawGraphics()
{
    let width = window.innerWidth - 500;
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

    background.scaleY = width / video.videoWidth;
    background.scaleX = width / video.videoWidth;
    
    if(background.scaleY > height / video.videoHeight)
    {
        background.scaleY = height / video.videoHeight;
        background.scaleX = height / video.videoHeight;
    }
    
    canvas.height = background.scaleY * video.videoHeight;
    canvas.width = background.scaleX * video.videoWidth;

    document.getElementById("main-container").style.left = ((width - canvas.width) / 2) + "px";
    document.getElementById("main-container").style.top = ((height - canvas.height) / 2) + "px";

    scrubberCanv.width = width;
    scrubberCanv.height = 50;
    scrubberLine.rect.w = scrubberCanv.width - 100;
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
    posText.y = canvas.height - 25;

    scrubberLine.startMarker.x = (master.timeline.startFrame / master.timeline.frameCount * scrubberLine.rect.w) + scrubberLine.rect.x;
    scrubberLine.endMarker.x = (master.timeline.endFrame / master.timeline.frameCount * scrubberLine.rect.w) + scrubberLine.rect.x;
    scrubberLine.startMarker.y = scrubberLine.rect.y + scrubberLine.rect.h + 6;
    scrubberLine.endMarker.y = scrubberLine.rect.y + scrubberLine.rect.h + 6;

    stage.update();
    scrubber.update();
    frameArrows.update();
    console.log("drawn");
}
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
    drawGraphics();
});

window.addEventListener("resize", drawGraphics);

stage.on("stagemousemove", function(e){
	posText.text = "Frame: " + (master.timeline.currentTime / master.timeline.frameTime).roundTo(2) + ", X: " + Math.round(e.stageX) + ", Y: " + Math.round(e.stageY);
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

        master.track.addPoint(frame, e.stageX, e.stageY);
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
            
            console.log(closestFrame);
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
    if(e.stageX >= scrubberLine.rect.x && e.stageX <= scrubberLine.rect.w + scrubberLine.rect.x)
    {
        let closestFrame = Math.round((((e.stageX - scrubberLine.rect.x) / scrubberLine.rect.w) * master.timeline.duration) / (master.timeline.frameTime / 4)) / 4;
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
    else if(e.stageX < (scrubberLine.rect.w / master.timeline.frameCount) * master.timeline.startFrame + scrubberLine.rect.x)
    {
        master.timeline.currentTime = master.timeline.getFrameStart(master.timeline.startFrame);
    }
    else if(e.stageX > (scrubberLine.rect.w / master.timeline.frameCount) * master.timeline.endFrame + scrubberLine.rect.x)
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
    //console.log(e.stageX);
    let closestFrame = Math.round((((e.stageX - scrubberLine.rect.x) / scrubberLine.rect.w) * master.timeline.duration) / (master.timeline.frameTime))
    if(closestFrame <= master.timeline.frameCount && closestFrame < master.timeline.endFrame && closestFrame >= 0)
    {
        scrubberLine.startMarker.x = closestFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.startFrame = closestFrame;
        if(master.timeline.currentTime < master.timeline.startFrame * master.timeline.frameTime)
        {
            master.timeline.currentTime = master.timeline.startFrame * master.timeline.frameTime;
        }
    }
    else if(closestFrame < 0)
    {
        scrubberLine.startMarker.x = scrubberLine.rect.x;
        master.timeline.startFrame = 0;
        if(master.timeline.currentTime < master.timeline.startFrame * master.timeline.frameTime)
        {
            master.timeline.currentTime = master.timeline.startFrame * master.timeline.frameTime;
        }
    }
    frameArrows.update();
});

scrubberLine.endMarker.on("pressmove", function(e){
    //console.log(e.stageX);
    let closestFrame = Math.round((((e.stageX - scrubberLine.rect.x) / scrubberLine.rect.w) * master.timeline.duration) / (master.timeline.frameTime))
    if(closestFrame <= master.timeline.frameCount && closestFrame > master.timeline.startFrame)
    {
        scrubberLine.endMarker.x = closestFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.endFrame = closestFrame;
        if(master.timeline.currentTime > master.timeline.endFrame * master.timeline.frameTime)
        {
            master.timeline.currentTime = master.timeline.endFrame * master.timeline.frameTime;
        }
    }
    else if(closestFrame > master.timeline.frameCount)
    {
        scrubberLine.endMarker.x = master.timeline.frameCount * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.endFrame = master.timeline.frameCount;
        if(master.timeline.currentTime > master.timeline.endFrame * master.timeline.frameTime)
        {
            master.timeline.currentTime = master.timeline.endFrame * master.timeline.frameTime;
        }
    }
    frameArrows.update();
});
document.onkeydown = function(e){
    switch(e.keyCode)
    {
        case 16:
            stage.cursor = "copy";
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