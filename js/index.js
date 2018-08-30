function drawGraphics(initialDraw=false)
{
    if(window.innerWidth < 1000)
    {
        if(!sidebar.classList.contains("changed"))
        {
            sidebar.classList.remove("normal");
            sidebar.classList.add("hidden");
            document.getElementById("sidebar-visibility").classList.add("show");
            document.getElementById("sidebar-visibility").classList.remove("hide");
        }
    }
    else
    {
        if(!sidebar.classList.contains("changed"))
        {
            sidebar.classList.add("normal");
            sidebar.classList.remove("hidden");
            document.getElementById("sidebar-visibility").classList.add("hide");
            document.getElementById("sidebar-visibility").classList.remove("show");
        }
    }
    
    let width = window.innerWidth - sidebar.offsetWidth;
    let height = window.innerHeight - 50;

    document.getElementById("sidebar-visibility").style.right = sidebar.offsetWidth + 'px';

    videoContainer.style.width = width + "px";
    videoContainer.style.height = height + "px";

    let scale = Math.min((width / master.timeline.video.videoWidth), (height / master.timeline.video.videoHeight));
    
    canvas.height = height;
    canvas.width = width;
    
    if(master.positioning.autoZoom)
    {
        master.backgroundScale = scale;
        background.scale = master.backgroundScale * master.positioning.zoom;
    }

    master.background.w = background.scale * master.timeline.video.videoWidth;
    master.background.h = background.scale * master.timeline.video.videoHeight;

    if(master.background.w <= canvas.width)
    {
        master.positioning.x = (canvas.width - (master.background.scale * master.timeline.video.videoWidth)) / 2;
    }
    else
    {
        if(master.positioning.x + master.background.w < canvas.width)
        {
            master.positioning.x = canvas.width - master.background.w;
        }
        
        if(master.positioning.x > 0 && master.background.w > canvas.width)
        {
            master.positioning.x = 0;
        }
    }
    if(master.background.h <= canvas.height)
    {
        master.positioning.y = (canvas.height - (master.background.scale * master.timeline.video.videoHeight)) / 2;
    }
    else
    {
        if(master.positioning.y + master.background.h < canvas.height)
        {
            master.positioning.y = canvas.height - master.background.h;
        }
        
        if(master.positioning.y > 0 && master.background.h > canvas.height)
        {
            master.positioning.y = 0;
        }
    }

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

    master.handsOnTable.render();

    updateScrubber(master.timeline.currentTime, master.timeline.duration);
    stage.update();
    master.updateScale();
    scrubber.update();
    frameArrows.update();
}

video.onplaying = (function(){
    video.pause();
    video.currentTime = 0;
    background.image = this;
    master.updateVisiblePoints();
    drawGraphics(true);
    video.style.display = "none";
});

stage.on("stagemousemove", function(e){
    var coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
    
    if(master.state.mode != "newScale")
    {
        posText.text = "Frame: " + master.timeline.currentFrame + ", X: " + Math.round(coords.x) + ", Y: " + Math.round(coords.y);
    }
    
    stage.update();
});

stage.on("click", function(e){
    if(master.track !== null && master.track !== undefined)
    {
        if(master.track.state.mode == "add")
        {
            var frame = master.timeline.current();
            let scaled = master.toScaled(e.stageX, e.stageY);
            master.track.addPoint(frame, scaled.x, scaled.y);

            var nextFrame = master.timeline.next();
            master.timeline.setFrame(nextFrame.number);

            if(master.track.points[nextFrame.number] !== undefined)
                master.track.points[nextFrame.number].show().emphasize();
        }
    }
});