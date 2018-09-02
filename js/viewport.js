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

var originalCoords = {
    x: 0,
    y: 0
};

var originalPosition = {
    x: master.positioning.x,
    y: master.positioning.y
};
var backgroundDimensions = {
    w: master.background.w,
    h: master.background.h
};

master.addBackground.on("mousedown", function(e){
    originalCoords = {
        x: e.stageX,
        y: e.stageY
    };
    originalPosition = {
        x: master.positioning.x,
        y: master.positioning.y
    };
    backgroundDimensions = {
        w: master.background.w,
        h: master.background.h
    };
});
master.addBackground.on("pressmove", function(e){
    let coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
    if(master.state.mode == "positioning")
    {
        let newPos = {
            x: originalPosition.x + coords.x - originalCoords.x,
            y: originalPosition.y + coords.y - originalCoords.y
        };

        if(newPos.x + backgroundDimensions.w < canvas.width)
        {
            newPos.x = canvas.width - backgroundDimensions.w;
        }
        
        if(newPos.x > 0 && backgroundDimensions.w > canvas.width)
        {
            newPos.x = 0;
        }

        if(newPos.y + backgroundDimensions.h < canvas.height)
        {
            newPos.y = canvas.height - backgroundDimensions.h;
        }
        
        if(newPos.y > 0 && backgroundDimensions.h > canvas.height)
        {
            newPos.y = 0;
        }

        if(backgroundDimensions.w > canvas.width)
        {
            master.positioning.x = newPos.x;
            master.positioning.stuck = false;
        }

        if(backgroundDimensions.h > canvas.height)
        {
            master.positioning.y = newPos.y;
            master.positioning.stuck = false;
        }
    }
});

canvas.addEventListener("wheel", function(e){
    e.preventDefault();
    if(master.state.mode == "positioning")
    {
        if(master.positioning.zoom > 0.01 || Math.sign(e.deltaY) == -1)
            master.positioning.zoom -= e.deltaY/25;

        if(master.positioning.zoom <= 0.01)
            master.positioning.zoom = 0.01;
    }
});

master.positioning.on("zoomin, zoomout", function(e){

    let newPos = {
        x: master.positioning.x,
        y: master.positioning.y
    };

    newPos.x -= (this.timeline.video.videoWidth * e.delta) / 2;
    newPos.y -= (this.timeline.video.videoHeight * e.delta) / 2;

    if(this.background.w > this.stage.canvas.width)
    {
        if(newPos.x + this.background.w < this.stage.canvas.width)
            this.positioning.x = canvas.width - this.background.w;
        else if(newPos.x > 0)
            this.positioning.x = 0;
        else
            this.positioning.x = newPos.x;
    }
    else
        this.positioning.x = (this.stage.canvas.width - this.background.w) / 2;

    if(this.background.h > this.stage.canvas.height)
    {
        if(newPos.y + this.background.h < this.stage.canvas.height)
            this.positioning.y = canvas.height - this.background.h;
        else if(newPos.y > 0)
            this.positioning.y = 0;
        else
            this.positioning.y = newPos.y;
    }
    else
        this.positioning.y = (this.stage.canvas.height - this.background.h) / 2;
})
.on("zoom, translation", function(){
    background2.scale = this.background.scale;
    background2.x = this.background.x;
    background2.y = this.background.y;
})
.on("zoom", function(){
    document.getElementById("screen-fit-button").classList.remove("disabled");
});