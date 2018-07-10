class Track
{
	constructor (project, timeline, name, color, stage, unit="m")
	{
		this.name = name;
		this.color = color;
        this.unit = math.unit(unit);
        this.project = project;
		this.timeline = timeline;
		this.stage = stage;
		this.points = {};
        this.selectedPoint = null;
        this.emphasizedPoint = 0;
        this.table = new Table(this, {"t": "s", "x": this.unit.toString()});
        this.uid = (Math.round(Math.random() * 100000000) + 1).toString();
        this.listElement = {"container": document.createElement("li")};
        this.listElement.container.setAttribute("data-uid", this.uid);
        this.listElement.swath = document.createElement("div");
        this.listElement.swath.classList.add("swath");
        this.listElement.name = document.createElement("div");
        this.listElement.name.classList.add("name");
        this.listElement.name.innerText = this.name;

        document.getElementById("track-list").querySelector("ul").appendChild(this.listElement.container);
        this.listElement.container.appendChild(this.listElement.swath);
        this.listElement.container.appendChild(this.listElement.name);

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
        
        
        let tempTrack = this;
        this.stage.addEventListener("click", function(e){
            let point = tempTrack.selectedPoint;
            if(!(point == (null || undefined)))
            {
                let mouseCoords = point.shape.globalToLocal(e.stageX, e.stageY);
                if(mouseCoords.x < -1 || mouseCoords.x > 12 || mouseCoords.y < -1 || mouseCoords.y > 12)
                {
                    point.unselect();
                }
            }
        });
        this.listElement.container.addEventListener("click", function(){
            let uid = this.getAttribute("data-uid");
            tempTrack.project.switchTrack(uid);
        });
	}

	export(axes=this.project.axes, scale=this.project.scale)
	{
		var track = this;
		let data = {};
		data.name = this.name;
		data.points = {
            scaled: [],
            pixels: []
        };
		for(var key in track.points)
		{
			console.log(axes);
			if(track.points.hasOwnProperty(key))
			{
				let point = track.points[key];
				
				let location = axes.convert(point.x, point.y);

                let pushData = {
					t: (point.frame.time - (track.timeline.startFrame * track.timeline.frameTime)).roundTo(3),
					x: location.x,
					y: location.y
                };

				data.points.pixels.push(pushData);
                
				data.points.scaled.push({
					t: pushData.t,
					x: scale.convert(pushData.x, track.unit).number,
					y: scale.convert(pushData.y, track.unit).number
				});
			}
		}
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
        this.table.addRow(newPoint.export(), true);
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
    select()
    {
        document.getElementById("track-list").querySelector("ul").querySelectorAll("li").forEach(function(el){
            el.classList.remove("selected");
        });
        this.listElement.container.classList.add("selected");
    }
    unselect()
    {
        this.listElement.container.classList.remove("selected");
    }
	
}