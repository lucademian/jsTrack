class Project
{
	constructor(name, timeline, handsOnTable, stage, background)
	{
        this.name = name;
        this.created = false;
        this.uid = Math.random() * 100000000000000;
        this.timeline = timeline;
        this.stage = stage;
        this.background = background;
        this.backgroundScale = 0;
        this.saved = true;
        this.backedUp = true;
        this.backUpDate = null;
        this.videoFile = null;
		this.track = null;
		this.scale = null;
        this.axes = null;
        this.trackList = {};
        this.deletedTracks = {};
        this.axesList = [];
        this.callbacks = {};
        this.undoManager = new UndoManager();
        this.saveIndex = this.backUpIndex = this.undoManager.getIndex();
        this.viewPoints = {
            forward: 0,
            backward: 7
        };
        this.handsOnTable = handsOnTable;
        this.handsOnTable.updateSettings({
            readOnly: true,
            autoColumnSize: true,
            manualColumnResize: true,
            manualColumnMove: true,
            tableClassName: "data-table-master",
            rowHeaders: false,
            colHeaders: true,
            startRows: 3,
            fixedColsLeft: 1,
            preventOverflow: "horizontal",
            type: "numeric",
            stretchH: "last"
        });

        var project = this;
        
        this.positioning = {
            _zoom: 1,
            _x: 0,
            _y: 0,
            _callbacks: {},
            get zoom(){
                return this._zoom;
            },
            set zoom(value){
                this._zoom = value;
                this.trigger("zoom");
            },
            get x(){
                return this._x;
            },
            set x(value){
                this._x = value;
                this.trigger("translation");
            },
            get y(){
                return this._y;
            },
            set y(value){
                this._y = value;
                this.trigger("translation");
            },
            trigger(event){
                if(this._callbacks[event] !== undefined)
                {
                    let callbacks = this._callbacks[event];
                    for(var i = 0; i < callbacks.length; i++)
                    {
                        callbacks[i].call(project, {zoom: this._zoom, x: this._x, y: this._y});
                    }
                }
            },
            on(event, callback)
            {
                let events = event.split(",");
                for(var i = 0; i < events.length; i++)
                {
                    let tempEvent = events[i].trim();

                    if(this._callbacks[tempEvent] === undefined)
                    {
                        this._callbacks[tempEvent] = [];
                    }

                    this._callbacks[tempEvent].push(callback);
                }
            }
        }
        this.state = {
            _mode: "default",
            _lastMode: "",
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
					this.modeCallbacks[i].call(project, this._mode, this._lastMode);
				}
            },
            reset: function(){
                let tempLastMode = this._lastMode;
                this._lastMode = this._mode;
                this._mode = tempLastMode;
                this.triggerChange();
            },
			modeChange: function(val){
				this.modeCallbacks.push(val);
            },
            default: function(){
                this._mode = "default";
                this.triggerChange();
            }
        };

        this.state.modeChange(function(mode){
            switch(mode)
            {
                case "cell":
                    this.stage.cursor = "cell";
                    this.stage._testMouseOver(true);
                    break;
                case "add":
                case "newScale":
                    this.stage.cursor = "url('add_point.png') 16 16, auto";
                    this.stage._testMouseOver(true);
                    break;
                default:
                    this.stage.cursor = "default";
                    this.stage._testMouseOver(true);
                    break;
            }
        });
        
        this.positioning.on("translation, zoom", function(position){
            console.log(position);
            this.background.scale = this.backgroundScale * position.zoom;
            this.background.x = position.x;
            this.background.y = position.y;
            this.updateScale();
        });

        this.timeline.project = this;
    }
    toUnscaled(x, y=null)
    {
        if(typeof x == "object" && y == null)
        {
            y = x.y;
            x = x.x;
        }

        let changing = {
            width: this.timeline.video.videoWidth * (this.backgroundScale * this.positioning.zoom),
            height: this.timeline.video.videoHeight * (this.backgroundScale * this.positioning.zoom)
        };
        let unchanging = {
            width: this.timeline.video.videoWidth,
            height: this.timeline.video.videoHeight
        };
        let translation = {
            x: this.positioning.x,
            y: this.positioning.y
        };

        return {x: ((x / unchanging.width) * changing.width) + translation.x, y: ((y / unchanging.height) * changing.height) + translation.y};
    }
    toScaled(x, y)
    {
        if(typeof x == "object" && y == null)
        {
            y = x.y;
            x = x.x;
        }
        
        let changing = {
            width: this.timeline.video.videoWidth * (this.backgroundScale * this.positioning.zoom),
            height: this.timeline.video.videoHeight * (this.backgroundScale * this.positioning.zoom)
        };
        let unchanging = {
            width: this.timeline.video.videoWidth,
            height: this.timeline.video.videoHeight
        };
        let translation = {
            x: this.positioning.x,
            y: this.positioning.y
        };

        return {x: (((x + translation.x) / changing.width) * unchanging.width), y: (((y + translation.y) / changing.height) * unchanging.height)};
    }
    updateScale()
    {
        if(this.axes !== undefined && this.axes !== null)
        {
            let moveTo = this.toUnscaled(this.axes.x, this.axes.y);
            this.axes.shape.x = moveTo.x;
            this.axes.shape.y = moveTo.y;
        }
        for(var time in this.timeline.frames)
        {
            let frame = this.timeline.frames[time];
            for(var i = 0; i < frame.points.length; i++)
            {
                let point = frame.points[i];
                let scaled = this.toUnscaled(point.x, point.y);
                point.shape.x = point.circle.x = scaled.x;
                point.shape.y = point.circle.y = scaled.y;
            }
        }
        if(this.scale !== undefined && this.scale !== null)
        {
            let moveTo = [this.toUnscaled(this.scale.positions[0]), this.toUnscaled(this.scale.positions[1])];
            this.scale.nodes[0].x = moveTo[0].x;
            this.scale.nodes[0].y = moveTo[0].y;
            this.scale.nodes[1].x = moveTo[1].x;
            this.scale.nodes[1].y = moveTo[1].y;
            this.scale.update();
        }
    }
    undo()
    {
        this.undoManager.undo();
        if(this.saveIndex !== this.undoManager.getIndex())
        {
            this.saved = false;
            this.trigger("change");
        }
        if(this.backUpIndex !== this.undoManager.getIndex())
        {
            this.backedUp = false;
            this.trigger("change");
        }
    }
    redo()
    {
        this.undoManager.redo();
        if(this.saveIndex !== this.undoManager.getIndex())
        {
            this.saved = false;
            this.trigger("change");
        }
        if(this.backUpIndex !== this.undoManager.getIndex())
        {
            this.backedUp = false;
            this.trigger("change");
        }
    }
    backup()
    {
        this.backedUp = true;
        this.backUpDate = new Date();
        this.backUpIndex = this.undoManager.getIndex();
    }
    on(event, callback)
    {
        if(this.callbacks[event] === undefined)
        {
            this.callbacks[event] = [];
        }

        this.callbacks[event].push(callback);
        return this;
    }
    trigger(event, argArray=[])
    {
        if(this.callbacks[event] !== undefined)
        {
            for(var i=0; i < this.callbacks[event].length; i++)
            {
                this.callbacks[event][i].call(this, argArray);
            }
        }
        return this;
    }
    changed()
    {
        this.saved = false;
        this.backedUp = false;
        this.trigger("change");
        return this;
    }
    change(actions)
    {
        this.saved = false;
        this.backedUp = false;
        this.trigger("change");

        this.undoManager.add({
            undo: actions.undo,
            redo: actions.redo
        });

        return this;
    }
    updateVisiblePoints()
    {
        if(this.state.mode !== "add")
        {
            for(var time in this.timeline.frames)
            {
                let frame = this.timeline.frames[time];
                if(frame.time < this.timeline.currentTime - this.timeline.frameTime * this.viewPoints.backward || frame.time > this.timeline.currentTime + this.timeline.frameTime * this.viewPoints.forward)
                {
                    for(var i = 0; i < frame.points.length; i++)
                    {
                        if(!frame.points[i].hidden)
                        {
                            frame.points[i].hide();
                        }
                    }
                }
                else
                {
                    for(var i = 0; i < frame.points.length; i++)
                    {
                        if(frame.points[i].hidden)
                        {
                            frame.points[i].show();
                        }
                    }
                }
            }
        }
        return this;
    }
    destroy()
    {
        for(var uid in this.trackList)
        {
            let track = this.trackList[uid];
            track.listElement.container.remove();
        }
        if(master.scale !== null && master.scale !== undefined)
            master.scale.textElement.remove();
        
        master.handsOnTable.destroy();
        return this;
    }
    save()
    {
        var metaInfo = {
            date: new Date().toString(),
            createdWith: "Created with JSTrack by Luca Demian",
            appVersion: 0.1,
            fileVersion: 0.3
        };

        var saveData = {
            name: this.name,
            duration: this.timeline.duration,
            video: this.timeline.video,
            fps: this.timeline.fps,
            currentTime: this.timeline.currentTime,
            uid: this.uid,
            frames: []
        };

        for(var time in this.timeline.frames)
        {
            saveData.frames.push(time);
        }

        if(this.scale !== null && this.scale !== undefined)
        {
            saveData.scale = {
                size: this.scale.size.toString(),
                color: this.scale.color,
                nodes: [
                    {x: this.scale.positions[0].x, y: this.scale.positions[0].y},
                    {x: this.scale.positions[1].x, y: this.scale.positions[1].y}
                ]
            }
        }

        if(this.axes !== null && this.axes !== undefined)
        {
            saveData.axes = {
                position: {x: this.axes.x, y: this.axes.y, rotation: this.axes.theta},
                color: this.axes.color
            }
        }

        if(this.track !== null && this.track !== undefined)
            saveData.activeTrack = this.track.uid;

        
        saveData.tracks = {};
        for(var uid in this.trackList)
        {
            let track = this.trackList[uid];
            let trackInfo = {
                name: track.name,
                color: track.color,
                points: {},
                hidden: track.hidden
            };

            for(var time in track.points)
            {
                trackInfo.points[time] = {x: track.points[time].x, y: track.points[time].y};
            }

            saveData.tracks[uid] = trackInfo;
        }

        return {meta: metaInfo, project: saveData};

    }
    load(fileData)
    {
        var version = 0;
        var fileInfo = fileData["meta"];

        if(fileInfo !== undefined)
        {
            version = fileInfo["fileVersion"];
            if(version > 0)
            {
                var data = fileData["project"];
            }
            else
            {
                var data = fileData;
            }
        }
        else
        {
            var data = fileData;
        }
        for(var key in data)
        {
            let value = data[key];
            switch(key)
            {
                case "name":
                    this.name = value;
                    break;
                case "uid":
                    this.uid = value;
                    break;
                case "fps":
                    this.timeline.updateFps(value);
                    break;
                case "currentTime":
                    this.timeline.seek(value);
                    break;
                case "frames":
                    for(var i=0; i < value.length; i++)
                    {
                        this.timeline.addFrame(value[i]);
                    }
                    break;
                case "scale":
                    master.newScale(value.size, value.nodes[0].x, value.nodes[0].y, value.nodes[1].x, value.nodes[1].y, value.color, true);
                    break;
                case "axes":
                    console.log(value);
                    let axes = master.newAxes(value.position.x, value.position.y, value.color, true);
                    if(version > 0)
                    {
                        axes.rotate(value.position.rotation);
                    }
                    break;
                case "tracks":
                    for(var uid in value)
                    {
                        let trackInfo = value[uid];
                        let track = this.newTrack(trackInfo.name, trackInfo.color, false, uid);
                        for(var time in trackInfo.points)
                        {
                            let frame = master.timeline.addFrame(time);
                            track.addPoint(frame, trackInfo.points[time].x, trackInfo.points[time].y);
                        }
                        track.unselectAll();
                        if(version > 0.2)
                        {
                            if(trackInfo.hidden)
                                track.hide();
                        }
                    }
                    break;
            }
            if(data["activeTrack"] !== undefined && data["activeTrack"] !== null)
            {
                this.switchTrack(data["activeTrack"]);
            }
        }

        this.updateVisiblePoints();
        this.created = true;
        this.trigger("created");
        this.undoManager.clear();
        return this;
    }
    deleteTrack(uid)
    {
        if(this.trackList[uid] !== undefined)
        {
            let track = this.trackList[uid];
            this.deletedTracks[uid] = track;
            for(var time in track.points)
            {
                let point = track.points[time];
                point.unemphasize();
                point.unselect();
                track.stage.removeChild(point.shape);
            }
            if(this.track == track)
            {
                this.track = null;
            }
            track.listElement.container.remove();

            delete this.trackList[uid];
        }
    }
    undeleteTrack(uid)
    {
        if(this.deletedTracks[uid] !== undefined)
        {
            let track = this.deletedTracks[uid];
            this.trackList[uid] = track;
            document.getElementById("track-list").querySelector("ul").appendChild(track.listElement.container);
            for(var time in track.points)
            {
                let point = track.points[time];
                point.unemphasize();
                point.unselect();
                track.stage.removeChild(point.shape);
            }
            
            delete this.deletedTracks[uid];
        }
    }
	newTrack(name, color, makeDefault=true, uid=false)
	{
        var project = this;
        let track = new Track(this, this.timeline, name, color, this.stage, uid);
        
        this.change({
            undo: function(){
                project.deleteTrack(track.uid);
            },
            redo: function(){
                project.undeleteTrack(track.uid);
            }
        });

		this.trackList[track.uid] = track;
        if(makeDefault)
        {
            this.track = track;
            this.track.select();
        }
        track.table.makeActive();
        return track;
	}
	newAxes(x, y, color, makeDefault=true)
	{
		let axes = new Axes(this.stage, x, y, color, this);
		this.axesList.push(axes);
		if(makeDefault)
            this.axes = axes;
            
        return axes;
	}
	newScale(size, x1, y1, x2, y2, color="#39ff14", makeDefault=true)
	{
        var project = this;
        let scale = new Scale(this.stage, size, x1, y1, x2, y2, color, this);
        
        this.change({
            undo: function(){
                project.deleteScale(scale.uid);
            },
            redo: function(){
                project.newScale(size, x1, y1, x2, y2, color, makeDefault);
            }
        });

		if(makeDefault)
            this.scale = scale;
            
        return scale;
    }
    switchTrack(uid)
    {
        var project = this;
        if(this.trackList[uid] !== undefined)
        {
            if(this.track !== null && this.track !== undefined)
            {
                this.track.unselectAll();
                this.track.unemphasizeAll();
            }

            this.track = this.trackList[uid];
            this.track.select();
            this.track.table.makeActive();
            if(this.track.points[master.timeline.currentTime] !== undefined)
            {
                this.track.points[master.timeline.currentTime].emphasize();
            }
        }
        return this;
    }
    update()
    {
        for(var uid in this.trackList)
        {
            let track = this.trackList[uid];

            if((this.scale === null || this.scale === undefined))
            {
                track.unit = "px";
            }
            else
            {
                track.scale = this.scale;

                if(track.unit !== this.scale.unit().toString())
                {
                    track.unit = this.scale.unit().toString();
                    track.table.newCols({"t": "s", "x": track.unit, "y": track.unit});
                }
            }

            track.table.newData(track.export().points.scaled, true, true);
        }
        return this;
    }
}