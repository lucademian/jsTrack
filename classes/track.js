class Track
{
	constructor (timeline, name, color, stage, unit="m")
	{
		this.name = name;
		this.color = color;
        this.unit = math.unit(unit);
		this.timeline = timeline;
		this.stage = stage;
		this.points = {};
        this.selectedPoint = 0;
        this.emphasizedPoint = 0;
		this.state = {
			_mode: "default",
			_selected: true,
			modeCallbacks: [],
			selectionCallbacks: [],
			set mode(val){
				this._mode = val;
				for(var i = 0; i < this.modeCallbacks.length; i++)
				{
					this.modeCallbacks[i](this._mode);
				}
			},
			get mode(){
				return this._mode;
			},
			modeChange: function(val){
				this.modeCallbacks.push(val);
			},
			set selected(val)
			{
				this._selected = val;
				for(var i = 0; i < this.selectionCallbacks.length; i++)
				{
					this.selectionCallbacks[i](this._selected);
				}
			},
			get selected()
			{
				return this._selected;
			},
			selectionChange: function(val)
			{
				this.selectionCallbacks.push(val);
			}

		};
	}

	export(axes=this.timeline.project.axes, scale=this.timeline.project.axes, format="object")
	{
		var track = this;
		let data = {};
		data.name = this.name;
		data.points = [];
		for(var key in track.points)
		{
			console.log(axes);
			if(track.points.hasOwnProperty(key))
			{
				let point = track.points[key];
				
				let location = axes.convert(point.x, point.y);

				data.points.push({
					time: (point.frame.time - (track.timeline.startFrame * track.timeline.frameTime)).roundTo(3),
					x: scale.convert(location.x, track.unit).number,
					y: scale.convert(location.y, track.unit).number
				});
			}
		}
		// switch(format)
		// {
		// 	case "json":
		// 		return 
		// }
		return data;
	}
	addPoint(frame, x, y)
	{
		let newPoint = new Point(this, frame, x, y);
		if(this.points[frame["time"]] !== undefined)
		{
			this.points[frame["time"]].move(x, y).select();
		}
		else
		{
			this.points[frame.time] = newPoint;
			this.points[frame.time].select();
			this.stage.addChild(this.points[frame.time].shape);
		}

		this.stage.update();

		return newPoint;
	}
	
	unselectAll()
	{
		let tempPoints = this.points;
		for(var time in tempPoints)
		{
			//console.log(tempPoints[time]);
			tempPoints[time].unselect();
		}
		this.selectedPoint = null;
    }
    unemphasizeAll()
	{
		let tempPoints = this.points;
		for(var time in tempPoints)
		{
			//console.log(tempPoints[time]);
			tempPoints[time].unemphasize();
		}
		this.emphasizedPoint = null;
	}
	
}