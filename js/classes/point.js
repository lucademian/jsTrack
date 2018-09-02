class Point
{
	constructor(track, frame, x, y)
	{
		this.track = track;
        this.frame = frame;
        this.hidden = false;
		this.x = x;
        this.y = y;
        this.pointSize = 6;
        this.shape = new createjs.Shape();
        this.shape.cursor = "pointer";
		this.shape.regX = this.pointSize / 2;
        this.shape.regY = this.pointSize / 2;
        let unscaled = this.track.project.toUnscaled(x, y);
        this.shape.x = unscaled.x;
		this.shape.y = unscaled.y;
        this.shape.rotation = 45;
        this.shape.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000000").drawRect(-1, -1, 12, 12));

        this.strokeWidth = this.shape.graphics.setStrokeStyle(2).command;
        this.strokeColor = this.shape.graphics.beginStroke(this.track.color).command;
        this.pointRect = this.shape.graphics.drawRect(0,0,this.pointSize,this.pointSize).command;
        
        this.circle = new createjs.Shape();
        this.circle.regX = (this.pointSize + 6) / 2;
        this.circle.regY = (this.pointSize + 6) / 2;
        this.circle.x = this.shape.x;
        this.circle.y = this.shape.y;
        this.circle.graphics.setStrokeStyle(2);
        this.circle.graphics.beginStroke(this.track.color);
        this.circle.graphics.drawEllipse(0, 0, this.pointSize+6, this.pointSize+6);

        this.deleted = false;
        
        if(this.track.state.mode !== "add" && this.track.state.mode !== "hidden")
        {
            this.track.stage.addChild(this.shape);
        }

		var tempShape = this;
		this.track.state.modeChange(function(mode){
			if(mode == "add" || mode == "hidden")
			{
                tempShape.track.stage.removeChild(tempShape.shape);
                tempShape.track.stage.removeChild(tempShape.circle);
            }
			else
			{
                if(!tempShape.deleted && !tempShape.hidden)
                {
                    tempShape.track.stage.addChild(tempShape.shape);
                }
			}
        });
        var moving = false;
		this.shape.on("pressmove", function(e){
            if(tempShape.track.project.state.mode !== "seek")
            {
                let coords = tempShape.track.project.toScaled(e.stageX, e.stageY);
                moving = true;
                tempShape.move(coords.x, coords.y, true);
                tempShape.select();
            }
        });
        this.shape.on("pressup", function(e){
            if(tempShape.track.project.state.mode !== "seek" && moving)
            {
                moving = false;
                let coords = tempShape.track.project.toScaled(e.stageX, e.stageY);
                
                var goTo = {x: tempShape.x, y: tempShape.y};
                tempShape.track.project.change({
                    undo: function(){
                        tempShape.move(goTo.x, goTo.y);
                    },
                    redo: function(){
                        tempShape.move(coords.x, coords.y);
                    }
                });
                
                tempShape.move(coords.x, coords.y);
                tempShape.track.project.update();
            }
        });
		this.shape.on("dblclick", function(e){
            tempShape.remove();
            
            tempShape.track.project.change({
                undo: function(){
                    let tempPoint = tempShape.track.deletedPoints[tempShape.frame.number];
                    tempPoint.deleted = false;
                    tempShape.track.points[point.frame.number] = tempPoint;
                    tempShape.track.stage.addChild(tempPoint.shape);
                    tempShape.track.project.update();
                },
                redo: function(){
                    tempShape.remove();
                }
            });
		});
		this.shape.on("click", function(e){
        //	if(tempSprite.track.timeline.mode == "default")
            tempShape.track.unselectAll();
            tempShape.select();

            if(tempShape.track.project.state.mode == "seek")
            {
                tempShape.track.project.timeline.seek(tempShape.frame.number);
                tempShape.track.project.switchTrack(tempShape.track.uid);
                tempShape.track.project.changed();
            }
        });
        this.track.project.state.modeChange(function(mode){
            if(mode == "seek")
            {
                tempShape.shape.cursor = "crosshair";
            }
            else
            {
                tempShape.shape.cursor = "pointer";
            }
        });
    }
    hide()
    {
        this.track.stage.removeChild(this.shape);
        this.track.stage.removeChild(this.circle);
        this.hidden = true;
        return this;
    }
    show()
    {
        if(!this.deleted)
        {
            this.track.stage.addChild(this.shape);
            this.hidden = false;
        }
        return this;
    }
    color(color)
    {
        this.strokeColor.style = color;
    }
    export(axes=this.track.project.axes, scale=this.track.project.scale)
	{
        let point = this;
        
        if(point.frame.number >= point.track.timeline.startFrame && point.frame.number <= point.track.timeline.endFrame)
        {
            let location = axes.convert(point.x, point.y);

            let data = {
                t: (point.frame.time - point.track.timeline.getFrameStart(point.track.timeline.startFrame)).roundTo(3),
                pixels: {},
                scaled: {}
            };

            data.pixels.x = location.x.roundTo(5);
            data.pixels.y = location.y.roundTo(5);

            if(scale == null || scale == undefined)
            {
                data.scaled.x = location.x.roundTo(5);
                data.scaled.y = location.y.roundTo(5);
            }
            else
            {
                data.scaled.x = scale.convert(location.x).number.roundTo(5);
                data.scaled.y = scale.convert(location.y).number.roundTo(5);
            }

            return data;
        }
	}
    emphasize(multiple=false)
    {
        if(!multiple)
            this.track.unemphasizeAll();
        if(!this.track.hidden && !this.hidden && this.track.state.mode !== "add")
            this.track.stage.addChild(this.circle);
        this.circle.x = this.shape.x;
        this.circle.y = this.shape.y;
        this.track.emphasizedPoint = this;
        return this;
    }
    unemphasize()
    {
        this.track.stage.removeChild(this.circle);
        this.track.emphasizedPoint = null;
        this.track.stage.update();
    }
	select(multiple=false)
	{
        if(!multiple)
            this.track.unselectAll();
        this.shape.rotation = 0;
        this.strokeWidth.width = 2;
        this.pointRect.w = this.pointSize + 2;
        this.pointRect.h = this.pointSize + 2;
		this.shape.regX = (this.pointSize + 2) / 2;
        this.shape.regY = (this.pointSize + 2) / 2;

		this.track.selectedPoint = this;
		return this;
	}
	unselect()
	{
		this.shape.rotation = 45;
        this.strokeWidth.width = 2;
        this.pointRect.w = this.pointSize;
        this.pointRect.h = this.pointSize;
		this.shape.regX = this.pointSize / 2;
        this.shape.regY = this.pointSize / 2;
        this.track.selectedPoint = null;
		return this;
	}

	move(x, y, internal=false)
	{
        let unscaled = this.track.project.toUnscaled(x, y);
		this.shape.x = unscaled.x;
        this.shape.y = unscaled.y;
        this.circle.x = unscaled.x;
        this.circle.y = unscaled.y;
        if(!internal)
        {
            this.x = x;
            this.y = y;
        }
		return this;
    }
    
	remove()
	{
        var point = this;
		this.track.stage.removeChild(this.shape);
        this.track.stage.removeChild(this.circle);
        this.unselect().unemphasize();
        this.deleted = true;
        this.track.deletedPoints[this.frame.number] = this;
        delete this.track.points[this.frame.number];
        this.track.project.update();
    }
    
    unRemove()
    {
        var point = this;
        if(!this.track.hidden && !this.hidden)
        {
            this.track.stage.addChild(this.shape);
        }
        this.deleted = false;
		this.track.points[this.frame.number] = this;
        delete this.track.deletedPoints[this.frame.number];
        this.track.project.update();
    }
}