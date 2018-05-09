if (!Array.prototype.last){
	Array.prototype.last = function(){
		return this[this.length - 1];
	}
}

class Timeline
{
	constructor(name, duration, width, height)
	{
		this.name = name;
		this.duration = duration;
		this.width = width;
		this.height = height;
		this.frames = {};
	}
	addFrame(time)
	{
		let image = "";
		this.frames[time] = new Frame(this, time, image);
	}
	newScale(name, units, pixels, size)
	{
		this.scale = new Scale(name, units, pixels, size);
	}
}

class Frame
{
	constructor(timeline, time, image)
	{
		this.time = time;
		this.image = image;
		this.timeline = timeline;
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
		return {number: pixels * (this.units / this.pixels), units: this.units};
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
	}
	
	addPoint(frame, x, y)
	{
		let newPoint = new Point(this, frame, x, y);
		this.points[frame.time] = newPoint;
		newPoint.select();
		this.stage.addChild(newPoint.sprite);
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
		var tempSprite = this;
		this.sprite.on("pressmove", function(e){
			tempSprite.move(e.stageX, e.stageY);
			tempSprite.select();
		});
		this.sprite.on("dblclick", function(e){
			tempSprite.remove();
		});
		this.sprite.on("click", function(e){
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
	}
	unselect()
	{
		this.sprite.gotoAndStop("unselected");
	}

	move(x, y)
	{
		this.sprite.x = x;
		this.sprite.y = y;
	}

	remove()
	{
		this.track.stage.removeChild(this.sprite);
	}
}




canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var stage = new createjs.Stage("canvas");
var background = new createjs.Shape(new createjs.Graphics().beginFill("#FFFFFF").drawRect(0, 0, canvas.width, canvas.height));
stage.addChild(background);
stage.update();

var defaultShape = new createjs.SpriteSheet({
	images: ["selectors.png"],
	frames: {width:10, height:10},
	animations: {
		unselected: 0,
		selected: 1
	}
});

var currentTimeline = new Timeline("test1", 1000, canvas.width, canvas.height);

var myTrack = new Track(currentTimeline, "track1", "position", "red", defaultShape, stage);

var posText = new createjs.Text("X: 0, Y: 0", "13px Arial", "#FFF");
posText.x = 10;
posText.y = canvas.height - 20;
stage.addChild(posText);


stage.update();

stage.on("stagemousemove", function(e){
	posText.text = "X: " + Math.round(e.stageX) + ", Y: " + Math.round(e.stageY);
	stage.update();
});

background.on("click", function(e){
	console.log("asdf");
	myTrack.addPoint(new Frame(currentTimeline, Math.round(Math.random()*42353), "image"), e.stageX, e.stageY);
});
