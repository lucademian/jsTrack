class Track
{
	constructor (project, timeline, name, color, stage, uid=false)
	{
		this.name = name;
		this.color = color;
        this.project = project;
        this.hidden = false;
        this.selectedPoints = {};

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
        this.deletedPoints = {};
        this.selectedPoint = null;
        this.emphasizedPoint = null;
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

        var track = this;
		this.state = {
            _mode: "default",
            _lastMode: "",
			_selected: true,
			modeCallbacks: [],
			selectionCallbacks: [],
			set mode(val){
                if(this._mode !== val)
                {
                    this._lastMode = this._mode;
                    this._mode = val;
                }
                this.triggerChange();
			},
			get mode(){
				return this._mode;
            },
            triggerChange()
            {
				for(var i = 0; i < this.modeCallbacks.length; i++)
				{
					this.modeCallbacks[i].call(track, this._mode, this._lastMode);
				}
            },
            resetMode(){
                let tempLastMode = this._lastMode;
                this._lastMode = this._mode;
                this._mode = tempLastMode;
				this.triggerChange();
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
            var lastUid = "";
            if(tempTrack.project.track !== null && tempTrack.project.track !== undefined)
            {
                lastUid = tempTrack.project.track.uid;
            }
            tempTrack.project.change({
                undo: function(){
                    tempTrack.project.switchTrack(lastUid);
                },
                redo: function(){
                    tempTrack.project.switchTrack(tempTrack.uid);
                }
            });
            
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
                tempTrack.project.change({
                    undo: function(){
                        tempTrack.hide();
                    },
                    redo: function(){
                        tempTrack.show();
                    }
                });
                tempTrack.show();
            }
            else
            {
                tempTrack.project.change({
                    undo: function(){
                        tempTrack.show();
                    },
                    redo: function(){
                        tempTrack.hide();
                    }
                });
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
                    this.project.changed();
                    break;
                case "color":
                    this.color = data[key];
                    this.listElement.swath.style.background = this.color;
                    for(var pointKey in this.points)
                    {
                        this.points[pointKey].color(this.color);
                    }
                    this.project.changed();
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
	addPoint(frame, x, y, userAction=true)
	{
		if(this.points[frame.time] !== undefined)
		{
            var track = this;
            var point = this.points[frame.time];
            var toGo = {x: point.x, y: point.y};
            this.project.change({
                undo: function(){
                    point.move(toGo.x, toGo.y);
                    track.project.update();
                },
                redo: function(){
                    point.move(x, y);
                    track.project.update();
                }
            });
            
            point.move(x, y).select();
            this.project.update();
            return this.points[frame.time];
		}
		else
		{
            var newPoint = new Point(this, frame, x, y);
            this.points[frame.time] = newPoint;
            frame.points.push(newPoint);

            var track = this;
            this.project.change({
                undo: function(){
                    newPoint.remove();
                    track.project.update();
                },
                redo: function(){
                    newPoint.unRemove();
                    track.project.update();
                }
            });

            let pointData = newPoint.export();
            this.table.addRow({t: pointData.t, x: pointData.scaled.x, y: pointData.scaled.y}, true);
            return newPoint;
        }
        
	}
	unselectAll()
	{
        if(this.selectedPoint !== null && this.selectedPoint !== undefined)
        {
            this.selectedPoint.unselect();
        }
		this.selectedPoint = null;
    }
    unemphasizeAll()
	{
        if(this.emphasizedPoint !== null && this.emphasizedPoint !== undefined)
        {
            //console.log(this.emphasizedPoint);
            this.emphasizedPoint.unemphasize();
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