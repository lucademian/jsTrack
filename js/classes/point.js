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
        this.shape.x = x;
		this.shape.y = y;
        this.shape.rotation = 45;
        this.shape.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000000").drawRect(-1, -1, 12, 12));

        this.strokeWidth = this.shape.graphics.setStrokeStyle(1).command;
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
		var tempShape = this;
		this.track.state.modeChange(function(mode){
			if(mode == "add" || mode == "hidden")
			{
				tempShape.hide();
            }
			else
			{
                tempShape.show();
			}
		});
		this.shape.on("pressmove", function(e){
            let coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
            
            tempShape.move(coords.x, coords.y);
            tempShape.select();
        });
        this.shape.on("pressup", function(){
            tempShape.track.project.update();
        });
		this.shape.on("dblclick", function(e){
		//	if(tempSprite.track.timeline.mode == "default")
            tempShape.remove();
		});
		this.shape.on("click", function(e){
        //	if(tempSprite.track.timeline.mode == "default")
            tempShape.track.unselectAll();
            tempShape.select();

            if(tempShape.track.project.state.mode == "seek")
            {
                tempShape.track.project.timeline.setFrame(tempShape.frame.time);
                tempShape.track.project.switchTrack(tempShape.track.uid);
            }
        });
        this.track.project.state.modeChange(function(mode){
            if(mode == "seek")
            {
                tempShape.shape.cursor = "cell";
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
        this.hidden = true;
        this.track.stage.removeChild(this.circle);
    }
    show()
    {
        if(!this.deleted)
        {
            this.track.stage.addChild(this.shape);
            this.hidden = false;
        }
    }
    color(color)
    {
        this.strokeColor.style = color;
    }
    export(axes=this.track.project.axes, scale=this.track.project.scale)
	{
        let point = this;
        
        let location = axes.convert(point.x, point.y);

        let data = {
            t: (point.frame.time - (point.track.timeline.startFrame * point.track.timeline.frameTime)).roundTo(3),
            pixels: {},
            scaled: {}
        };

        data.pixels.x = location.x;
        data.pixels.y = location.y;

        if(scale == null || scale == undefined)
        {
            data.scaled.x = location.x;
            data.scaled.y = location.y;
        }
        else
        {
            data.scaled.x = scale.convert(location.x).number;
            data.scaled.y = scale.convert(location.y).number;
        }

        return data;
	}
    emphasize(multiple=false)
    {
        if(!multiple)
            this.track.unemphasizeAll();
        this.track.stage.addChild(this.circle);
        this.circle.x = this.shape.x;
        this.circle.y = this.shape.y;
        this.track.stage.update();
		this.track.emphasizedPoint = this.frame.time;
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

		this.track.stage.update();
		this.track.selectedPoint = this;
		return this;
	}
	unselect()
	{
		this.shape.rotation = 45;
        this.strokeWidth.width = 1;
        this.pointRect.w = this.pointSize;
        this.pointRect.h = this.pointSize;
		this.shape.regX = this.pointSize / 2;
        this.shape.regY = this.pointSize / 2;
        this.track.selectedPoint = null;
		return this;
	}

	move(x, y)
	{
		this.shape.x = x;
		this.shape.y = y;
        this.circle.x = this.shape.x;
        this.circle.y = this.shape.y;
		this.track.stage.update();
		return this;
    }
    
	remove()
	{
		this.track.stage.removeChild(this.shape);
		this.track.stage.update();
        this.deleted = true;
        this.hidden = true;
        this.track.selectedPoint = null;
		delete this.track.points[this.frame.time];
	}
}