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

var scrubberCanv = document.getElementById("scrubber");
var scrubber = new createjs.Stage("scrubber");
scrubber.enableMouseOver(10);


var scrubberLine = {"rectShape": new createjs.Shape(), "thumbShape": new createjs.Shape()};
scrubberLine.rectShape.graphics.setStrokeStyle(1).beginStroke("#d8d8d8");
scrubberLine.rect = scrubberLine.rectShape.graphics.drawRoundRect(0, (scrubberCanv.height - 10) / 2, scrubberCanv.width - 200, 10, 3, 3, 3, 3).command;
scrubber.addChild(scrubberLine.rectShape);

scrubberLine.thumb = new createjs.Shape;
scrubberLine.thumb.graphics.beginFill("#000");
scrubberLine.thumb.regX = 0;
scrubberLine.thumb.regY = 0;
scrubberLine.thumb.rect = scrubberLine.thumb.graphics.drawRoundRect(-2, -5, 4, scrubberLine.rect.h, 3, 3, 3, 3).command;
scrubber.addChild(scrubberLine.thumb);

var marker = new createjs.SpriteSheet({
	images: ["icons/marker.png"],
	frames: {width:10, height:9},
	animations: {
        "default": 0
	}
});

scrubberLine["startMarker"] = new createjs.Sprite(marker, "default");
scrubberLine["endMarker"] = new createjs.Sprite(marker, "default");
scrubberLine.startMarker.regX = 5;
scrubberLine.endMarker.regX = 5;
scrubber.addChild(scrubberLine.startMarker);
scrubber.addChild(scrubberLine.endMarker);

var buttons = new createjs.SpriteSheet({
	images: ["icons/buttons.png"],
	frames: {width:20, height:20},
	animations: {
		"frameBack": 0,
		"frameBackClicked": 1,
        "frameBackDisabled": 2,
		"frameForward": 3,
        "frameForwardClicked": 4,
        "frameForwardDisabled": 5
	}
});

var frameArrows = {
    "forward": {
        "sprite": new createjs.Sprite(buttons),
        "enabled": true
    },
    "back": {
        "sprite": new createjs.Sprite(buttons),
        "enabled": true
    }
};
frameArrows.forward.button = new createjs.ButtonHelper(frameArrows.forward.sprite, "frameForward", "frameForward", "frameForwardClicked", false);
frameArrows.back.button = new createjs.ButtonHelper(frameArrows.back.sprite, "frameBack", "frameBack", "frameBackClicked", false);
scrubber.addChild(frameArrows.forward.sprite);
scrubber.addChild(frameArrows.back.sprite);

frameArrows.update = function(){
    if(master.timeline.currentFrame == master.timeline.endFrame)
    {
        frameArrows.forward.sprite.gotoAndStop("frameForwardDisabled");
        frameArrows.forward.button.enabled = false;
        frameArrows.forward.enabled = false;
    }
    else
    {
        frameArrows.forward.sprite.gotoAndStop("frameForward");
        frameArrows.forward.button.enabled = true;
        frameArrows.forward.enabled = true;
    }

    if(master.timeline.currentFrame == master.timeline.startFrame)
    {
        frameArrows.back.sprite.gotoAndStop("frameBackDisabled");
        frameArrows.back.button.enabled = false;
        frameArrows.back.enabled = false;
    }
    else
    {
        frameArrows.back.sprite.gotoAndStop("frameBack");
        frameArrows.back.button.enabled = true;
        frameArrows.back.enabled = true;
    }
    scrubber.update();
}


scrubber.update();

function updateScrubber(time, total)
{
    scrubberLine.thumb.x = (time / total) * scrubberLine.rect.w + scrubberLine.rect.x;
    scrubberLine.startMarker.x = master.timeline.startFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;
    scrubberLine.endMarker.x = master.timeline.endFrame * (scrubberLine.rect.w / master.timeline.frameCount) + scrubberLine.rect.x;

    scrubber.update();
}