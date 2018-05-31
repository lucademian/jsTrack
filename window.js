if (!Array.prototype.last){
	Array.prototype.last = function(){
		return this[this.length - 1];
	}
}
if (!Number.prototype.roundTo){
	Number.prototype.roundTo = function(x){
		return parseFloat(parseFloat(this).toFixed(x));
	}
}
if (!String.prototype.roundTo){
	String.prototype.roundTo = function(x){
		return parseFloat(parseFloat(this).toFixed(x));
	}
}

class Timeline
{
	constructor(name, duration, width, height, video, markerShape)
	{
		this.name = name;
		this.duration = parseFloat(duration);
		this.video = video;
		this.width = width;
		this.height = height;
		this.frameCount = (30 * this.duration);
		this.frameTime = (1/29.97).roundTo(3);
		this.currentTime = 0;
		this.startFrame = 0;
		this.endFrame = this.frameCount;
		this.frames = {
			0: new Frame(this, 0, this.video)
		};
	}
	updateDuration(duration){
		this.duration = duration;
		this.frameCount = Math.round(this.duration / this.frameTime);
		this.duration = this.frameCount * this.frameTime;
		//this.duration = this.video.duration;
		this.endFrame = this.frameCount;
		console.log(this.duration % this.frameCount);
		return this.duration;
	}
	current()
	{
		if(this.frames[this.currentTime.toString()] !== undefined)
		{
			return {"frame": this.frames[this.currentTime.toString()], "time": this.currentTime.roundTo(3)};
		}
		else
		{
			return false;
		}
	}
	addFrame(time)
	{
		time = time.roundTo(3);
		let image = "";
		let frame = new Frame(this, time, image);
		this.frames[time] = frame;
		return frame;
	}
	setFrame(time)
	{
		let frame = this.frames[time];
		if(frame !== undefined)
		{
			this.currentTime = frame.time.roundTo(3);
			this.video.currentTime = frame.time;
		}
		else
		{
			return false;
		}
	}
	next()
	{
		//console.log(this.currentTime);
		let timeDiff = Infinity;
		let pickedFrame = this.frames[this.currentTime];
		let newTime = 0;
		for(var time in this.frames)
		{
			time = time.roundTo(3);
			if(time > this.currentTime)
			{
				if(time - this.currentTime < timeDiff)
				{
					timeDiff = time - this.currentTime;
					pickedFrame = this.frames[time.toString()];
					newTime = time.roundTo(3);
				}
			}
		}
		if(pickedFrame == this.frames[this.currentTime])
		{
			return false;
		}
		else
		{
			return {"frame": pickedFrame, "time": pickedFrame.time.roundTo(3), "distance": timeDiff.roundTo(3)};
		}

	}
	prev()
	{
		//console.log(this.currentTime, this.frames);
		let timeDiff = Infinity;
		let pickedFrame = this.frames[this.currentTime];
		let newTime = 0;
		for(var time in this.frames)
		{
			time = time.roundTo(3);
			if(time < this.currentTime)
			{
				if(Math.abs(time - this.currentTime) < timeDiff)
				{
					timeDiff = Math.abs(time - this.currentTime);
					pickedFrame = this.frames[time.toString()];
					newTime = time.roundTo(3);
				}
			}
		}

		if(pickedFrame === this.frames[this.currentTime])
		{
			return false;
		}
		else
		{
			return {"frame": pickedFrame, "time": pickedFrame.time.roundTo(3), "distance": timeDiff.roundTo(3)};
		}

	}
	newScale(name, units, pixels, size)
	{
		this.scale = new Scale(name, units, pixels, size);
	}
}

class Frame
{
	constructor(timeline, time, video)
	{
		this.time = time;
		this.video = video;
		this.timeline = timeline;
		this.uid = (Math.round(Math.random() * 100000) + 1).toString();
		//this.timeline.
	}
}

class Scale
{
	constructor (name, units, pixels, size)
	{
		this.name = name;
		this.units = units;
		this.pixels = pixels;
		this.size = size;
	}
	pixelsToUnits(pixels)
	{
		return {"number": pixels * (this.units / this.pixels), units: this.units};
	}
}

class Track
{
	constructor (timeline, name, type, color, shape, stage)
	{
		this.name = name;
		this.type = type;
		this.color = color;
		this.shape = shape;
		this.timeline = timeline;
		this.stage = stage;
		this.points = {};
		this.selectedPoint = 0;
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
	export()
	{
		let data = {};
		data.name = this.name;
		data.points = [];
		for(var time in this.points)
		{
			data.points.push({"time": (time - (this.timeline.startFrame * this.timeline.frameTime)).roundTo(3), "x": this.points[time], "y": this.points[time]})
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
			this.stage.addChild(this.points[frame.time].sprite);
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
	
	addScale(pixels, size, name=this.name+"-scale", units="meters")
	{
		this.scale = new Scale(name, units, pixels, size)
	}
	
}

class Point
{
	constructor(track, frame, x, y)
	{
		this.track = track;
		this.frame = frame;
		this.x = x;
		this.y = y;
		this.sprite = new createjs.Sprite(this.track.shape, "unselected");
		this.sprite.regX = 5;
		this.sprite.regY = 5;
		this.sprite.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000000").drawRect(-1, -1, 12, 12));
		this.sprite.x = x;
		this.sprite.y = y;
		this.deleted = false;
		var tempSprite = this;
		this.track.state.modeChange(function(mode){
			if(mode == "add")
			{
				tempSprite.track.stage.removeChild(tempSprite.sprite);
			}
			else
			{
				if(!tempSprite.deleted)
					tempSprite.track.stage.addChild(tempSprite.sprite);
			}
		});
		this.sprite.on("pressmove", function(e){
			//if(tempSprite.track.state.mode == "default")
				tempSprite.move(e.stageX, e.stageY);
				tempSprite.select();
		});
		this.sprite.on("dblclick", function(e){
		//	if(tempSprite.track.timeline.mode == "default")
				tempSprite.remove();
		});
		this.sprite.on("click", function(e){
		//	if(tempSprite.track.timeline.mode == "default")
				tempSprite.select();
		});
		// this.sprite.on("key")
	}
	select()
	{
		this.track.unselectAll();
		this.sprite.gotoAndStop("selected");
		this.track.stage.update();
		this.track.selectedPoint = this.frame.time;
		return this;
	}
	unselect()
	{
		this.sprite.gotoAndStop("unselected");
		return this;
	}

	move(x, y)
	{
		this.sprite.x = x;
		this.sprite.y = y;
		this.track.stage.update();
		return this;
	}

	remove()
	{
		this.track.stage.removeChild(this.sprite);
		this.track.stage.update();
		this.deleted = true;
		delete this.track.points[this.frame.time];
	}
}




canvas = document.getElementById("main");

var stage = new createjs.Stage("main");
createjs.Ticker.addEventListener("tick", stage);
var background = new createjs.Bitmap(document.getElementById("my-video"));
stage.addChild(background);

video = document.getElementById("my-video");
video.pause();

var defaultShape = new createjs.SpriteSheet({
	images: ["selectors.png"],
	frames: {width:10, height:10},
	animations: {
		unselected: 0,
		selected: 1
	}
});

var master = new Timeline("test1", video.duration, canvas.width, canvas.height, video, new createjs.Shape());

var myTrack = new Track(master, "track1", "position", "red", defaultShape, stage);

var posText = new createjs.Text("Frame: 0, X: 0, Y: 0", "13px Arial", "#FFF");
posText.x = 10;
posText.y = canvas.height - 20;
stage.addChild(posText);


stage.update();

