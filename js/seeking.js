frameArrows.forward.sprite.on("click", function(e){
    if(frameArrows.forward.enabled === true)
    {
        let frame = master.timeline.next();
        
        if(frame !== false && frame.number <= master.timeline.endFrame)
        {
            if(master.timeline.setFrame(frame.number) !== false)
            {
                if(master.track !== null)
                {
                    master.track.unselectAll();
                    master.track.unemphasizeAll();
                    if(master.track.points[frame.number] !== undefined)
                    {
                        master.track.points[frame.number].show().emphasize();
                    }
                }
            }
        }
    }
});

frameArrows.back.sprite.on("click", function(e){
    if(frameArrows.back.enabled === true)
    {
        let frame = master.timeline.prev();
        
        if(frame !== false && frame.number >= master.timeline.startFrame)
        {
            if(master.timeline.setFrame(frame.number) !== false)
            {
                if(master.track !== null)
                {
                    master.track.unselectAll();
                    master.track.unemphasizeAll();
                    if(master.track.points[frame.number] !== undefined)
                    {
                        master.track.points[frame.number].show().emphasize();
                    }
                }
            }
        }
    }
});

scrubberLine.thumb.on("pressmove", function(e){
    var coords = e.target.stage.globalToLocal(e.stageX, e.stageY);

    if(coords.x >= scrubberLine.rect.x && coords.x <= scrubberLine.rect.w + scrubberLine.rect.x)
    {
        let closestFrame = Math.round((((coords.x - scrubberLine.rect.x) / scrubberLine.rect.w) * master.timeline.duration) / (master.timeline.frameTime));
        if(closestFrame <= master.timeline.endFrame && closestFrame >= master.timeline.startFrame)
        {
            scrubberLine.thumb.x = closestFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
            
            master.timeline.seek(closestFrame);
        }
        else if(closestFrame < master.timeline.startFrame)
        {
            master.timeline.seek(master.timeline.startFrame);
        }
        else if(closestFrame > master.timeline.endFrame)
        {
            master.timeline.seek(master.timeline.endFrame);
        }

    }
    else if(coords.x < (scrubberLine.rect.w / master.timeline.frameCount) * master.timeline.startFrame + scrubberLine.rect.x)
    {
        master.timeline.seek(master.timeline.startFrame);
    }
    else if(coords.x > (scrubberLine.rect.w / master.timeline.frameCount) * master.timeline.endFrame + scrubberLine.rect.x)
    {
        master.timeline.seek(master.timeline.endFrame);
    }
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
        if(master.timeline.currentFrame <= master.timeline.startFrame)
        {
            startMarkerStuck = true;
        }
        master.update();
    }
    else if(closestFrame < 0)
    {
        scrubberLine.startMarker.x = scrubberLine.rect.x;
        master.timeline.startFrame = 0;
        if(master.timeline.currentFrame <= master.timeline.startFrame)
        {
            startMarkerStuck = true;
        }
        master.update();
    }

    if(startMarkerStuck)
    {
        master.timeline.seek(master.timeline.startFrame);
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
                        master.timeline.seek(master.timeline.startFrame);
                    }
                    master.update();
                },
                redo: function(){
                    startFrames.push(current);
                    scrubberLine.startMarker.x = current * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
                    master.timeline.startFrame = current;
                    if(stuck)
                    {
                        master.timeline.seek(master.timeline.startFrame);
                    }
                    master.update();
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
        if(master.timeline.currentFrame > master.timeline.endFrame)
        {
            endMarkerStuck = true;
        }
        master.update();
    }
    else if(closestFrame > master.timeline.frameCount)
    {
        scrubberLine.endMarker.x = master.timeline.frameCount * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
        master.timeline.endFrame = master.timeline.frameCount;
        if(master.timeline.currentFrame >= master.timeline.endFrame)
        {
            endMarkerStuck = true;
        }
        master.update();
    }

    if(endMarkerStuck)
    {
        master.timeline.seek(master.timeline.endFrame);
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
                        master.timeline.seek(master.timeline.endFrame);
                    }
                    master.update();
                },
                redo: function(){
                    endFrames.push(current);
                    scrubberLine.endMarker.x = current * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
                    master.timeline.endFrame = current;
                    if(stuck)
                    {
                        master.timeline.seek(master.timeline.endFrame);
                    }
                    master.update();
                }
            });
        }
    }
    
    endFrames.push(master.timeline.endFrame);
    endMarkerStuck = false;
});