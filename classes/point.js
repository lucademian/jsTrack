class Point
{
	constructor(track, frame, x, y)
	{
		this.track = track;
		this.frame = frame;
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

        this.strokeWidth = this.shape.graphics.setStrokeStyle(2).command;
        this.strokeColor = this.shape.graphics.beginStroke(this.track.color).command;
        this.pointRect = this.shape.graphics.drawRect(0,0,this.pointSize,this.pointSize).command;
        
        this.circle = new createjs.Shape();
        this.circle.regX = (this.pointSize + 5) / 2;
        this.circle.regY = (this.pointSize + 5) / 2;
        this.circle.x = this.shape.x;
        this.circle.y = this.shape.y;
        this.circle.graphics.setStrokeStyle(1);
        this.circle.graphics.beginStroke(this.track.color);
        this.circle.graphics.drawEllipse(0, 0, this.pointSize+5, this.pointSize+5);

		this.deleted = false;
		var tempShape = this;
		this.track.state.modeChange(function(mode){
			if(mode == "add")
			{
				tempShape.track.stage.removeChild(tempShape.shape);
			}
			else
			{
				if(!tempShape.deleted)
                    tempShape.track.stage.addChild(tempShape.shape);
			}
		});
		this.shape.on("pressmove", function(e){
            let coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
			//if(tempSprite.track.state.mode == "default")
            tempShape.move(coords.x, coords.y);
            tempShape.select();
		});
		this.shape.on("dblclick", function(e){
		//	if(tempSprite.track.timeline.mode == "default")
            tempShape.remove();
		});
		this.shape.on("click", function(e){
        //	if(tempSprite.track.timeline.mode == "default")
            tempShape.track.unselectAll();
            tempShape.select();
        });
    }
    color(color)
    {
        this.strokeColor.style = color;
    }
    export(axes=this.track.project.axes, scale=this.track.project.scale)
	{
        let point = this;
        
        let location = axes.convert(point.x, point.y);

        let x = 0, y = 0;

        if(this.scale === (null || undefined))
        {
            x = location.x;
            y = location.y;
        }
        else
        {
            x = scale.convert(location.x, point.track.unit).number;
            y = scale.convert(location.y, point.track.unit).number;
        }

        let data = {
            t: (point.frame.time - (point.track.timeline.startFrame * point.track.timeline.frameTime)).roundTo(3),
            x: x,
            y: y
        };

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
        this.strokeWidth.width = 2;
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
		this.track.stage.update();
		return this;
	}

	remove()
	{
		this.track.stage.removeChild(this.shape);
		this.track.stage.update();
		this.deleted = true;
        this.track.selectedPoint = null;
		delete this.track.points[this.frame.time];
	}
}