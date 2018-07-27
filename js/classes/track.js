class Track
{
	constructor (project, timeline, name, color, stage, uid=false)
	{
		this.name = name;
		this.color = color;
        this.project = project;
        this.hidden = false;

        if(this.project.scale === null || this.project.scale === undefined)
        {
            this.unit = "px";
        }
        else
        {
            this.unit = this.project.scale.unit().toString();
        }
		this.timeline = timeline;
		this.stage = stage;
		this.points = {};
        this.selectedPoint = null;
        this.emphasizedPoint = 0;
        this.table = new Table(this, {"t": "s", "x": this.unit, "y": this.unit});
        if(uid === false)
            this.uid = (Math.round(Math.random() * 100000000) + 1).toString();
        else
            this.uid = uid.toString();
        this.listElement = {"container": document.createElement("li")};
        this.listElement.container.setAttribute("data-uid", this.uid);
        this.listElement.container.title = "Double Click to Edit";
        this.listElement.swath = document.createElement("div");
        this.listElement.swath.classList.add("swath");
        this.listElement.swath.style.background = this.color;
        this.listElement.name = document.createElement("div");
        this.listElement.name.classList.add("name");
        this.listElement.name.innerText = this.name;
        this.listElement.visibility = document.createElement("div");
        this.listElement.visibility.classList.add("visibility");
        this.listElement.visibility.title = "Click to hide";

        document.getElementById("track-list").querySelector("ul").appendChild(this.listElement.container);
        this.listElement.container.appendChild(this.listElement.swath);
        this.listElement.container.appendChild(this.listElement.name);
        this.listElement.container.appendChild(this.listElement.visibility);

		this.state = {
            _mode: "default",
            _lastMode: "",
			_selected: true,
			modeCallbacks: [],
			selectionCallbacks: [],
			set mode(val){
                this._lastMode = this._mode;
                this._mode = val;
                console.log(this._lastMode, this._mode);
				for(var i = 0; i < this.modeCallbacks.length; i++)
				{
					this.modeCallbacks[i](this._mode, this._lastMode);
				}
			},
			get mode(){
				return this._mode;
            },
            resetMode(){
                let tempLastMode = this._lastMode;
                this._lastMode = this._mode;
                this._mode = tempLastMode;
				for(var i = 0; i < this.modeCallbacks.length; i++)
				{
					this.modeCallbacks[i](this._mode, this._lastMode);
				}
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
            tempTrack.project.switchTrack(tempTrack.uid);
        });
        this.listElement.container.addEventListener("dblclick", function(){
            editTrack.push({
                "name": tempTrack.name,
                "color": tempTrack.color,
                "uid": uid
            }).show();
        });
        
        this.listElement.visibility.addEventListener("click", function(e){
            e.stopPropagation();
            if(this.classList.contains("hidden"))
            {
                tempTrack.show();
            }
            else
            {
                tempTrack.hide()
            }
        }, false);
    }
    hide()
    {
        this.state.mode = "hidden";
        this.hidden = true;
        this.listElement.visibility.classList.add("hidden");
        this.listElement.visibility.title = "Click to make visible";
    }
    show()
    {
        this.state.resetMode();
        this.hidden = false;
        this.listElement.visibility.classList.remove("hidden");
        this.listElement.visibility.title = "Click to hide";
    }
    update(data)
    {
        for(var key in data)
        {
            switch(key)
            {
                case "name":
                    this.name = data[key];
                    this.listElement.name.innerText = this.name;
                    break;
                case "color":
                    this.color = data[key];
                    this.listElement.swath.style.background = this.color;
                    for(var pointKey in this.points)
                    {
                        this.points[pointKey].color(this.color);
                    }
                    break;
            }
        }
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
        data.table = {
            scaled: [],
            pixels: []
        };

        data.table.scaled.push(["t (s)", "x (" + track.unit+")", "y (" + track.unit+")"]);
        data.table.pixels.push(["t (s)", "x (" + track.unit+")", "y (" + track.unit+")"]);

		for(var key in track.points)
		{
			if(track.points.hasOwnProperty(key))
			{
				let point = track.points[key];
                let pointData = point.export();
                let pushData = {
                    pixels: {
                        t: pointData.t,
                        x: pointData.pixels.x,
                        y: pointData.pixels.y
                    },
                    scaled: {
                        t: pointData.t,
                        x: pointData.scaled.x,
                        y: pointData.scaled.y
                    }
                };

                data.points.pixels.push(pushData.pixels);
                data.table.pixels.push([pushData.pixels.t, pushData.pixels.x, pushData.pixels.y]);
                
                data.points.scaled.push(pushData.scaled);
                data.table.scaled.push([pushData.scaled.t, pushData.scaled.x, pushData.scaled.y]);
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
        let pointData = newPoint.export();
        this.table.addRow({t: pointData.t, x: pointData.scaled.x, y: pointData.scaled.y}, true);
        
        this.project.saved = false;
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