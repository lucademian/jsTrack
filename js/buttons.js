document.getElementById("new-project").addEventListener("click", function(){
    window.location.reload();
});
document.getElementById("sidebar-visibility").addEventListener("click", function(){
    if(this.classList.contains("show"))
    {
        document.getElementById("sidebar").classList.add("normal");
        document.getElementById("sidebar").classList.remove("hidden");
        document.getElementById("sidebar-visibility").classList.add("hide");
        document.getElementById("sidebar-visibility").classList.remove("show");
    }
    else
    {
        document.getElementById("sidebar").classList.remove("normal");
        document.getElementById("sidebar").classList.add("hidden");
        document.getElementById("sidebar-visibility").classList.add("show");
        document.getElementById("sidebar-visibility").classList.remove("hide");
    }
    
    document.getElementById("sidebar").classList.add("changed");
    document.getElementById("sidebar-visibility").style.right = document.getElementById("sidebar").offsetWidth + 'px';
    drawGraphics();
});
document.querySelector("#new-track-button:not(.disabled)").addEventListener("click", function(){
    newTrack.push({
        "color": newTrack.defaultColors[Math.floor(Math.random()*newTrack.defaultColors.length)]
    });
    newTrack.show();
});
document.querySelector("#undo-button:not(.disabled)").addEventListener("click", function(){
    master.undo();
});
document.querySelector("#screen-fit-button").addEventListener("click", function(){
    if(!this.classList.contains("disabled"))
    {
        master.positioning.zoom = 1;
        master.positioning.autoZoom = true;
        master.positioning.stuck = true;
        drawGraphics();
        this.classList.add("disabled");
    }
});
document.querySelector("#redo-button:not(.disabled)").addEventListener("click", function(){
    master.redo();
});
document.getElementById("export-button").addEventListener("click", function(){
    if(!this.classList.contains("disabled"))
        exportData.show();
});
document.querySelector("#save-button:not(.disabled)").addEventListener("click", function(){
    saveProject.show();
});
document.querySelectorAll(".help-button:not(.disabled)").forEach(function(el){
    el.addEventListener("click", function(){
        helpText.show();
    });
});
document.querySelector("#scale-button:not(.disabled)").addEventListener("click", function(){
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
document.querySelector("#edit-project-button:not(.disabled)").addEventListener("click", function(){
    editProject.push({
        "name": master.name,
        "framerate": master.timeline.fps,
        "frameskip": master.timeline.frameSkip,
        "axesColor": master.axes.color,
        "pointsForward": master.viewPoints.forward,
        "pointsBackward": master.viewPoints.backward
    }).show();
});

master.on("undo, created, change", function(){
    if(this.undoManager.hasUndo())
        document.getElementById("undo-button").classList.remove("disabled");
    else
        document.getElementById("undo-button").classList.add("disabled");
});
master.on("redo, created, change", function(){
    if(this.undoManager.hasRedo())
        document.getElementById("redo-button").classList.remove("disabled");
    else
        document.getElementById("redo-button").classList.add("disabled");
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