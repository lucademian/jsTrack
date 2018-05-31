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
    background.scaleY = (window.innerWidth - 500) / video.videoWidth;
    background.scaleX = (window.innerWidth - 500) / video.videoWidth;
    
    if(background.scaleY > (window.innerHeight - 50) / video.videoHeight)
    {
        background.scaleY = (window.innerHeight - 50) / video.videoHeight;
        background.scaleX = (window.innerHeight - 50) / video.videoHeight;
    }
    
    canvas.height = window.innerHeight - 50;
    canvas.width = (window.innerWidth - 500);
    scrubberCanv.width = canvas.width;
    scrubberCanv.height = 50;
    scrubberLine.rect.w = scrubberCanv.width - 100;
    scrubberLine.rect.h = 10;
    scrubberLine.rect.y = (scrubberCanv.height - 10) / 2;
    scrubberLine.rect.x = 15;

    scrubberLine.thumb.y = scrubberLine.rect.y - 5;
    scrubberLine.thumb.x = scrubberLine.rect.x;
    scrubberLine.thumb.regX = 4;
    scrubberLine.thumb.scaleX = 0.5;
    scrubberLine.thumb.scaleY = (scrubberLine.rect.h + 10) / 78;
    // scrubberLine.thumb.h = scrubberLine.rect.h + 10;
    
    frameArrows.forward.sprite.x = scrubberCanv.width - 30;
    frameArrows.forward.sprite.y = (scrubberCanv.height - 20) / 2;

    frameArrows.back.sprite.x = scrubberCanv.width - 60;
    frameArrows.back.sprite.y = (scrubberCanv.height - 20) / 2;
    
    master.updateDuration(video.duration);
    updateScrubber(master.startFrame * master.frameTime, master.duration);
    posText.x = 10;
    posText.y = canvas.height - 25;
    master.currentTime = master.startFrame * master.frameTime;
    master.video.currentTime = master.startFrame * master.frameTime;
    scrubberLine.startMarker.x = (master.startFrame / master.frameCount * scrubberLine.rect.w) + scrubberLine.rect.x;
    scrubberLine.endMarker.x = (master.endFrame / master.frameCount * scrubberLine.rect.w) + scrubberLine.rect.x;
    scrubberLine.startMarker.y = scrubberLine.rect.y + scrubberLine.rect.h + 6;
    scrubberLine.endMarker.y = scrubberLine.rect.y + scrubberLine.rect.h + 6;
    stage.update();
    scrubber.update();
    frameArrows.update();
});

stage.on("stagemousemove", function(e){
	posText.text = "Frame: " + (master.currentTime / master.frameTime).roundTo(2) + ", X: " + Math.round(e.stageX) + ", Y: " + Math.round(e.stageY);
    stage.update();
});

background.on("click", function(e){
    //console.log(myTrack.state.mode);
    if(myTrack.state.mode == "add")
    {
        let frame = master.current();
        //console.log(frame);
        if(frame === false)
        {
            frame = master.addFrame(master.currentTime);
            frameMarkers.master.markers[frame.uid] = frameMarkers.master.shape.graphics.drawRect(((master.currentTime / master.duration) * scrubberLine.rect.w + scrubberLine.rect.x), scrubberLine.rect.y, 1, scrubberLine.rect.h).command;
            scrubber.update();
            ////console.log(frameMarkers);
        }

        myTrack.addPoint(frame, e.stageX, e.stageY);
        stage.update();


        let nextFrame = master.next();

        if(nextFrame !== false && nextFrame.distance <= master.frameTime)
        {
            console.log(nextFrame);
            master.setFrame(nextFrame.frame.time);
            myTrack.points[nextFrame.frame.time].select();
            stage.update();
        }
        else
        {
            let closestFrame = Math.floor((master.currentTime / master.frameTime).roundTo(3))
            
            console.log(closestFrame);
            master.currentTime = ((closestFrame + 1) * master.frameTime).roundTo(3);
            master.video.currentTime = master.currentTime;
            myTrack.unselectAll();
            stage.update();
        }
        
        updateScrubber(master.currentTime, master.duration);
        //console.log(myTrack.export());
    }
    frameArrows.update();
});

frameArrows.forward.sprite.on("click", function(e){
    if(frameArrows.forward.enabled === true)
    {
        let time = master.currentTime;
        let frame = master.next();
        if(frame !== false && frame.distance <= master.frameTime)
        {
            if(master.setFrame(frame.frame.time) !== false)
            {
                myTrack.unselectAll();
                if(myTrack.points[frame.frame.time] !== undefined)
                {
                    myTrack.points[frame.frame.time].select();
                }
                updateScrubber(frame.frame.time, master.duration);
                stage.update();
            }
            else
            {
            }
        }
        else if(master.currentTime <= master.duration - master.frameTime)
        {
            let closestFrame = Math.floor((master.currentTime / master.frameTime).roundTo(3));
            
            if(closestFrame < master.endFrame && closestFrame >= master.startFrame)
            {
                if(closestFrame >= master.frameCount)
                    closestFrame = master.frameCount - 1;
                master.currentTime = ((closestFrame * master.frameTime) + master.frameTime).roundTo(3);
                master.video.currentTime = master.currentTime;
                myTrack.unselectAll();
                updateScrubber(master.currentTime, master.duration);
                stage.update();
            }
        }
        else
        {
            master.currentTime = master.duration.roundTo(3);
            master.video.currentTime = master.duration;
            myTrack.unselectAll();
            updateScrubber(master.duration, master.duration);
            stage.update();
        }
        posText.text = "Frame: " + (master.currentTime / master.frameTime).roundTo(2) + ", X: 0, Y: 0";
        stage.update();
        frameArrows.update();
    }
});

frameArrows.back.sprite.on("click", function(e){
    if(frameArrows.back.enabled === true)
    {
        let time = master.currentTime;
        let frame = master.prev();
        if(frame !== false && frame.distance <= master.frameTime)
        {
            if(master.setFrame(frame.frame.time) !== false)
            {
                myTrack.unselectAll();
                if(myTrack.points[frame.frame.time] !== undefined)
                {
                    myTrack.points[frame.frame.time].select();
                }

                updateScrubber(frame.frame.time, master.duration);
                stage.update();
            }
            else
            {
            }
        }
        else if(master.currentTime >= master.frameTime)
        {
            let closestFrame = Math.round(master.currentTime / master.frameTime);
            if((master.currentTime - (closestFrame * master.frameTime).roundTo(3)).roundTo(3) > master.frameTime)
                closestFrame++;
            
            if(closestFrame <= master.endFrame && closestFrame > master.startFrame)
            {
                master.currentTime = ((closestFrame * master.frameTime) - master.frameTime).roundTo(3);
                master.video.currentTime = master.currentTime;
                myTrack.unselectAll();
                updateScrubber(master.currentTime, master.duration);
                stage.update();
            }
        }
        else
        {
            master.currentTime = 0;
            master.video.currentTime = 0;
            myTrack.unselectAll();
            updateScrubber(0, master.duration);
            stage.update();
        }
        posText.text = "Frame: " + (master.currentTime / master.frameTime).roundTo(2) + ", X: 0, Y: 0";
        stage.update();
        frameArrows.update();
    }
});

scrubberLine.thumb.on("pressmove", function(e){
    if(e.stageX >= scrubberLine.rect.x && e.stageX <= scrubberLine.rect.w + scrubberLine.rect.x)
    {
        let closestFrame = Math.round((((e.stageX - scrubberLine.rect.x) / scrubberLine.rect.w) * master.duration) / (master.frameTime / 4)) / 4;
        if(closestFrame <= master.endFrame && closestFrame >= master.startFrame)
        {
            
            //console.log(closestFrame);
            scrubberLine.thumb.x = closestFrame * (scrubberLine.rect.w / master.frameCount) + scrubberLine.rect.x;
            scrubber.update();
            
            time = (closestFrame * master.frameTime).roundTo(3);
            master.video.currentTime = time;
            master.currentTime = time;
            stage.update();
        }
        else if(closestFrame < master.startFrame)
        {
            scrubberLine.thumb.x = (scrubberLine.rect.w / master.frameCount) * master.startFrame + scrubberLine.rect.x;
            scrubber.update();
            time = (master.frameTime * master.startFrame).roundTo(3);
            master.video.currentTime = time;
            master.currentTime = time;
            stage.update();
        }
        else if(closestFrame > master.endFrame)
        {
            scrubberLine.thumb.x = (scrubberLine.rect.w / master.frameCount) * master.endFrame + scrubberLine.rect.x;
            scrubber.update();
            time = (master.frameTime * master.endFrame).roundTo(3);
            master.video.currentTime = time;
            master.currentTime = time;
            stage.update();
        }

    }
    else if(e.stageX < (scrubberLine.rect.w / master.frameCount) * master.startFrame + scrubberLine.rect.x)
    {
        scrubberLine.thumb.x = (scrubberLine.rect.w / master.frameCount) * master.startFrame + scrubberLine.rect.x;
        scrubber.update();
        time = (master.frameTime * master.startFrame).roundTo(3);
        master.video.currentTime = time;
        master.currentTime = time;
        stage.update();
    }
    else if(e.stageX > (scrubberLine.rect.w / master.frameCount) * master.endFrame + scrubberLine.rect.x)
    {
        scrubberLine.thumb.x = (scrubberLine.rect.w / master.frameCount) * master.endFrame + scrubberLine.rect.x;
        scrubber.update();
        time = (master.frameTime * master.endFrame).roundTo(3);
        master.video.currentTime = time;
        master.currentTime = time;
        stage.update();
    }
    
    let current = master.current();
    if(current !== false)
    {
        myTrack.unselectAll();
        if(myTrack.points[current.time] !== undefined)
        {
            myTrack.points[current.time].select();
        }
    }
    else
    {
        myTrack.unselectAll();
    }

    posText.text = "Frame: " + (master.currentTime / master.frameTime).roundTo(2) + ", X: 0, Y: 0";
    stage.update();
    frameArrows.update();
});
scrubberLine.startMarker.on("pressmove", function(e){
    //console.log(e.stageX);
    let closestFrame = Math.round((((e.stageX - scrubberLine.rect.x) / scrubberLine.rect.w) * master.duration) / (master.frameTime))
    if(closestFrame <= master.frameCount && closestFrame < master.endFrame && closestFrame >= 0)
    {
        scrubberLine.startMarker.x = closestFrame * (scrubberLine.rect.w / master.frameCount) + scrubberLine.rect.x;
        master.startFrame = closestFrame;
        if(master.currentTime < master.startFrame * master.frameTime)
        {
            master.currentTime = master.startFrame * master.frameTime;
            updateScrubber(master.currentTime, master.duration);
        }
        scrubber.update();
    }
    else if(closestFrame < 0)
    {
        scrubberLine.startMarker.x = scrubberLine.rect.x;
        master.startFrame = 0;
        if(master.currentTime < master.startFrame * master.frameTime)
        {
            master.currentTime = master.startFrame * master.frameTime;
            updateScrubber(master.currentTime, master.duration);
            scrubber.update();
        }
        scrubber.update();
    }
    frameArrows.update();
});

scrubberLine.endMarker.on("pressmove", function(e){
    //console.log(e.stageX);
    let closestFrame = Math.round((((e.stageX - scrubberLine.rect.x) / scrubberLine.rect.w) * master.duration) / (master.frameTime))
    if(closestFrame <= master.frameCount && closestFrame > master.startFrame)
    {
        scrubberLine.endMarker.x = closestFrame * (scrubberLine.rect.w / master.frameCount) + scrubberLine.rect.x;
        master.endFrame = closestFrame;
        if(master.currentTime > master.endFrame * master.frameTime)
        {
            master.currentTime = master.endFrame * master.frameTime;
            updateScrubber(master.currentTime, master.duration);
            scrubber.update();
        }
        scrubber.update();
    }
    else if(closestFrame > master.frameCount)
    {
        scrubberLine.endMarker.x = master.frameCount * (scrubberLine.rect.w / master.frameCount) + scrubberLine.rect.x;
        master.endFrame = master.frameCount;
        if(master.currentTime > master.endFrame * master.frameTime)
        {
            master.currentTime = master.endFrame * master.frameTime;
            updateScrubber(master.currentTime, master.duration);
        }
        scrubber.update();
    }
    frameArrows.update();
});
document.onkeydown = function(e){
    switch(e.keyCode)
    {
        default:
            myTrack.state.mode = "add";
            break;
    }
}
document.onkeyup = function(e){
    switch(e.keyCode)
    {
        default:
            myTrack.state.mode = "default";
            break;
    }
}