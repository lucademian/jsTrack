class Project
{
	constructor(name, timeline, handsOnTable, stage)
	{
		this.name = name;
        this.timeline = timeline;
        this.stage = stage;
        this.saved = false;
        this.videoFile = null;
		this.track = null;
		this.scale = null;
        this.axes = null;
		this.trackList = {};
        this.axesList = [];
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

        this.state = {
            _mode: "default",
            _lastMode: "",
			modeCallbacks: [],
			selectionCallbacks: [],
			set mode(val){
                this._lastMode = this._mode;
                this._mode = val;
				for(var i = 0; i < this.modeCallbacks.length; i++)
				{
					this.modeCallbacks[i](this._mode);
				}
			},
			get mode(){
				return this._mode;
            },
            reset: function(){
                let tempLastMode = this._lastMode;
                this._lastMode = this._mode;
                this._mode = tempLastMode;
                
				for(var i = 0; i < this.modeCallbacks.length; i++)
				{
					this.modeCallbacks[i](this._mode);
				}
            },
			modeChange: function(val){
				this.modeCallbacks.push(val);
            },
            default: function(){
                this._mode = "default";
				for(var i = 0; i < this.modeCallbacks.length; i++)
				{
					this.modeCallbacks[i](this._mode);
				}
            }
        };


        this.timeline.project = this;
    }
    updateVisiblePoints()
    {
        // for(var uid in this.trackList)
        // {
        //     let track = this.trackList[uid];
        //     if(!track.hidden)
        //     {
        //         var points = track.points.values();

        //         for(var i = 0; i < points.length; i++)
        //         {
        //             let point = track.points[time];
        //             time = parseFloat(time);
        //             console.log(time);
        //             if(time < this.timeline.currentTime - this.timeline.frameTime * 7)
        //             {
        //                 if(!point.hidden)
        //                 {
        //                     point.hide();
        //                 }
        //             }
        //             else if(time > this.timeline.currentTime + this.timeline.frameTime * 7)
        //             {
        //                 if(!point.hidden)
        //                 {
        //                     point.hide();
        //                 }
        //             }
        //             else if(point.hidden)
        //             {
        //                 point.show();
        //             }
        //         }
        //     }
        // }
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
                    {x: this.scale.nodes[0].x, y: this.scale.nodes[0].y},
                    {x: this.scale.nodes[1].x, y: this.scale.nodes[1].y}
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
            console.log(track);
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
        this.saved = true;
    }
	newTrack(name, color, makeDefault=true, uid=false)
	{
        this.saved = false;
		let track = new Track(this, this.timeline, name, color, this.stage, uid);
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
        this.saved = false;
		let axes = new Axes(this.stage, x, y, color, this);
		this.axesList.push(axes);
		if(makeDefault)
            this.axes = axes;
            
        return axes;
	}
	newScale(size, x1, y1, x2, y2, color="#39ff14", makeDefault=true)
	{
        this.saved = false;
		let scale = new Scale(this.stage, size, x1, y1, x2, y2, color, this);
		if(makeDefault)
            this.scale = scale;
            
        return scale;
    }
    switchTrack(uid)
    {
        this.saved = false;
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
    }
    update()
    {
        this.saved = false;
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
    }
}