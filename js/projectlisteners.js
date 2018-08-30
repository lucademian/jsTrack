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

master.on("newTrack", function(){
    document.getElementById("tracks").classList.remove("hidden");
    document.getElementById("export-button").classList.remove("disabled");
});

master.on("newpoint", function(){
    document.getElementById("graphs").classList.remove("hidden");
});

master.on("created", function(){
    scrubberLine.startMarker.x = this.timeline.startFrame * (scrubberLine.rect.w / this.timeline.frameCount) + scrubberLine.rect.x;
    scrubberLine.endMarker.x = this.timeline.endFrame * (scrubberLine.rect.w / this.timeline.frameCount) + scrubberLine.rect.x;

    updateScrubber(master.timeline.currentTime, master.timeline.duration);
    this.updateVisiblePoints();
    frameArrows.update();
});

var secondVidTimeout = null;
master.timeline.on("seek, timingUpdate", function(){
    this.project.updateVisiblePoints();
    frameArrows.update();
    posText.text = "Frame: " + master.timeline.currentFrame + ", X: "+stage.mouseX+", Y: "+stage.mouseY;
    if(this.project.track !== null && this.project.track !== undefined)
    {
        this.project.track.unemphasizeAll();
        if(this.project.track.points[this.project.timeline.currentFrame] !== undefined)
        {
            this.project.track.points[this.project.timeline.currentFrame].emphasize();
        }
    }
    updateScrubber(master.timeline.currentTime, master.timeline.duration);
    let video2 = document.getElementById("video-clone");
    clearTimeout(secondVidTimeout);
    secondVidTimeout = setTimeout(function(){
        video2.currentTime = master.timeline.currentTime;
    }, 100);
});