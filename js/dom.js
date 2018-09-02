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
 * lucademian1@gmail.com
 * 
 */

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
    document.getElementById("sidebar-visibility").style.right = event.rect.width + 'px';
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

var resizeTimer;
window.addEventListener("resize", function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawGraphics, 250);
    document.getElementById("sidebar-visibility").style.right = sidebar.offsetWidth + 'px';
});