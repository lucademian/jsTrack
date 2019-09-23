/**
 * jsTrack: web-based Tracker (https://physlets.org/tracker/). Get position data from objects in a video.
 * Copyright (C) 2018 Luca Demian
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * Contact:
 * 
 * Luca Demian
 * jstrack.luca@gmail.com
 * 
 */

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
document.getElementById("play-pause-button").addEventListener("click", function(){
    if(this.classList.contains("play"))
    {
        master.timeline.play();
        this.classList.remove("play");
        this.classList.add("pause");
    }
    else
    {
        master.timeline.pause();
        this.classList.remove("pause");
        this.classList.add("play");
    }
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
        window.open("https://docs.google.com/document/d/1O1SreDzyFuCWGf4FgaYWwVGx91DtyCNsM3eOawcJG7E/edit", "_blank");
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