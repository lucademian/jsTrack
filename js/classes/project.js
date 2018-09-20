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
 * lucademian1@gmail.com
 * 
 */

class Project
{
	constructor(name, timeline, handsOnTable, stage, background)
	{
        this.name = name;
        this.created = false;
        this.uid = Math.random() * 100000000000000;
        this.timeline = timeline;
        this.stage = stage;
        this.videoName = "";
        this.addBackground = new createjs.Shape();
        let hitArea = new createjs.Shape();
        hitArea.graphics.beginFill("#000000");
        hitArea.graphics.drawRect(-10000, -10000, 30000, 30000);
        this.addBackground.hitArea = hitArea;
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
            stuck: true,
            autoZoom: true,
            _callbacks: {},
            get zoom(){
                return this._zoom;
            },
            set zoom(value){
                let oldZoom = this._zoom;
                this._zoom = value.roundTo(5);
                this.autoZoom = false;
                let zoomChange = this._zoom - oldZoom;

                project.background.scale = project.backgroundScale * this._zoom;
                project.background.w = project.background.scale * project.timeline.video.videoWidth;
                project.background.h = project.background.scale * project.timeline.video.videoHeight;
                project.updateScale();

                if(oldZoom > this._zoom)
                    this.trigger("zoomout", {"delta": zoomChange});
                else
                    this.trigger("zoomin", {"delta": zoomChange});
                
                this.trigger("zoom", {"delta": zoomChange});
            },
            get x(){
                return this._x;
            },
            set x(value){
                this._x = value.roundTo(5);

                project.background.x = this._x;
                project.updateScale();

                this.trigger("translation");
            },
            get y(){
                return this._y;
            },
            set y(value){
                this._y = value.roundTo(5);

                project.background.y = this._y;
                project.updateScale();

                this.trigger("translation");
            },
            trigger(event, argArray={}){
                argArray.event = event;
                if(this._callbacks[event] !== undefined)
                {
                    let callbacks = this._callbacks[event];
                    for(var i = 0; i < callbacks.length; i++)
                    {
                        callbacks[i].call(project, argArray);
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
                return this;
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
            if(mode == "add")
            {
                if(this.axes !== null && this.axes !== undefined)
                {
                    this.axes.hide();
                }
                if(this.scale !== null && this.scale !== undefined)
                {
                    this.scale.hide();
                }
            }
            else
            {
                if(this.axes !== null && this.axes !== undefined)
                {
                    this.axes.show();
                }
                if(this.scale !== null && this.scale !== undefined)
                {
                    this.scale.show();
                }
            }

            switch(mode)
            {
                case "seek":
                    this.stage.removeChild(this.addBackground);
                    this.stage.cursor = "crosshair";
                    break;
                case "add":
                case "newScale":
                    this.stage.addChild(this.addBackground);
                    // in chrome, (16,16) is bottom right, in firefox it is center. image is 16x16 so ???
                    switch(platform.name)
                    {
                        case "Firefox":
                            this.stage.cursor = "url('icons/add_point.png') 16 16, copy";
                            break;
                        case "Chrome":
                            this.stage.cursor = "url('icons/add_point.png') 8 8, copy";
                            break;
                        default:
                            this.stage.cursor = "copy";
                            break;
                    }
                    break;
                case "positioning":
                    this.stage.addChild(this.addBackground);
                    this.stage.cursor = "move";
                    break;
                default:
                    this.stage.removeChild(this.addBackground);
                    this.stage.cursor = "default";
                    this.updateVisiblePoints();
                    break;
            }
            this.stage._testMouseOver(true);
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

        return {x: (((x - translation.x) / changing.width) * unchanging.width), y: (((y - translation.y) / changing.height) * unchanging.height)};
    }
    updateScale()
    {
        if(this.axes !== undefined && this.axes !== null)
        {
            let moveTo = this.toUnscaled(this.axes.x, this.axes.y);
            this.axes.shape.x = moveTo.x;
            this.axes.shape.y = moveTo.y;
        }
        for(var i=0; i < this.timeline.frames.length; i++)
        {
            let frame = this.timeline.frames[i];
            for(var j = 0; j < frame.points.length; j++)
            {
                let point = frame.points[j];
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

        this.trigger("undo");
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

        this.trigger("redo");
    }
    backup()
    {
        this.backedUp = true;
        this.backUpDate = new Date();
        this.backUpIndex = this.undoManager.getIndex();
    }
    on(events, callback)
    {
        events = events.split(",");
        for(var i=0; i < events.length; i++)
        {
            let event = events[i].trim();
            if(this.callbacks[event] === undefined)
            {
                this.callbacks[event] = [];
            }

            this.callbacks[event].push(callback);
        }

        return this;
    }
    trigger(events, argArray=[])
    {
        events = events.split(",");
        for(var i = 0; i < events.length; i++)
        {
            let event = events[i].trim();
            if(this.callbacks[event] !== undefined)
            {
                for(var j=0; j < this.callbacks[event].length; j++)
                {
                    this.callbacks[event][j].call(this, argArray);
                }
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

        this.undoManager.add({
            undo: actions.undo,
            redo: actions.redo
        });

        this.trigger("change");

        return this;
    }
    updateVisiblePoints()
    {
        if(this.state.mode !== "add")
        {
            for(var i = 0; i < this.timeline.activeFrames.length; i++)
            {
                let frame = this.timeline.activeFrames[i];
                // console.log(frame);
                if(frame.number < this.timeline.currentFrame - (this.viewPoints.backward * this.timeline.frameSkip) || frame.number > this.timeline.currentFrame + (this.viewPoints.forward * this.timeline.frameSkip) || frame.number < this.timeline.startFrame || frame.number > this.timeline.endFrame)
                {
                    for(var j = 0; j < frame.points.length; j++)
                    {
                        if(!frame.points[j].hidden)
                        {
                            frame.points[j].hide();
                        }
                    }
                }
                else
                {
                    for(var j = 0; j < frame.points.length; j++)
                    {
                        if(frame.points[j].hidden)
                        {
                            frame.points[j].show();
                        }
                    }
                }
            }
            if(this.track !== undefined && this.track !== null)
            {
                if(this.track.emphasizedPoint !== null && this.track.emphasizedPoint !== undefined)
                {
                    this.track.emphasizedPoint.emphasize();
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
            currentFrame: this.timeline.currentFrame,
            uid: this.uid,
            startFrame: this.timeline.startFrame,
            endFrame: this.timeline.endFrame,
            videoName: this.videoName
        };

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

            for(var number in track.points)
            {
                trackInfo.points[number] = {x: track.points[number].x, y: track.points[number].y};
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

        if(data.fps !== undefined)
        {
            this.timeline.updateTiming(this.timeline.video.duration, data.fps);
            if(this.timeline.frames.length == 1)
            {
                this.timeline.createFrames();
            }
            this._load(data, version);
        }
        else
        {
            var project = this;
            this.timeline.detectFrameRate(function(fps){
                project.timeline.updateTiming(project.timeline.video.duration, fps);
                if(project.timeline.frames.length == 1)
                {
                    project.timeline.createFrames();
                }

                project._load(data, version);
            });
        }
        
        return this;
    }
    _load(data, version)
    {
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
                case "videoName":
                    this.videoName = value;
                    break;
                case "currentFrame":
                    this.timeline.seek(value);
                    break;
                case "startFrame":
                    this.timeline.startFrame = value;
                    break;
                case "endFrame":
                    this.timeline.endFrame = value;
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
                        for(var number in trackInfo.points)
                        {
                            let frame = master.timeline.frames[number];
                            if(frame !== undefined)
                                track.addPoint(frame, trackInfo.points[number].x, trackInfo.points[number].y);
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
    }
    deleteTrack(uid)
    {
        if(this.trackList[uid] !== undefined)
        {
            let track = this.trackList[uid];
            this.deletedTracks[uid] = track;
            for(var number in track.points)
            {
                let point = track.points[number];
                point.unemphasize();
                point.unselect();
                track.stage.removeChild(point.shape);
                for(var i=0; i < point.frame.points.length; i++)
                {
                    if(point.frame.points[i] == point)
                    {
                        delete point.frame.points[i];
                    }
                }
            }
            if(this.track == track)
            {
                this.track = null;
            }
            track.listElement.container.remove();

            delete this.trackList[uid];

            this.trigger("deleteTrack", [track]);
        }
    }
    undeleteTrack(uid)
    {
        if(this.deletedTracks[uid] !== undefined)
        {
            let track = this.deletedTracks[uid];
            this.trackList[uid] = track;
            document.getElementById("track-list").querySelector("ul").appendChild(track.listElement.container);
            for(var number in track.points)
            {
                let point = track.points[number];
                point.unemphasize();
                point.unselect();
                point.show();
                
                point.frame.points.push(point);
            }
            this.updateVisiblePoints();
            this.switchTrack(uid);
            delete this.deletedTracks[uid];
            
            this.trigger("undeleteTrack", [track]);
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

        this.trigger("newTrack", [track]);

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
            
        this.trigger("newScale", [scale]);

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

            let tableData = this.track.export().points.scaled;
            if(tableData.length == 0)
                tableData = [""];
            this.track.table.newData(tableData, true, true);

            if(this.track.points[master.timeline.currentFrame] !== undefined)
            {
                this.track.points[master.timeline.currentFrame].emphasize();
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
        }
        if(this.track !== null && this.track !== undefined)
        {
            let tableData = this.track.export().points.scaled;
            if(tableData.length == 0)
                tableData = [""];
            this.track.table.newData(tableData, true, true);
        }
        return this;
    }
}