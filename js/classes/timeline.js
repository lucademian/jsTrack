class Timeline
{
	constructor(width, height, video, fps)
	{
		this.duration = video.duration.roundTo(3);
		this.video = video;
		this.width = width;
        this.height = height;
        this.fps = fps;
        this.frameSkip = 1;
		this.frameTime = (1/this.fps).roundTo(3);
		this.frameCount =  Math.floor(this.duration / this.frameTime);
        this.currentTime = 0;
        this.currentFrame = 0;
        this.savedTime = 0;
        this.seekSaved = false;
		this.startFrame = 0;
        this.endFrame = this.frameCount;
        this.callbacks = {};
		this.frames = [];
    }
    // function to fire "loaded" event
    createFrames()
    {
        var counter = 0;
        for(var time = 0; time < (this.video.duration) - (this.video.duration % this.frameTime); time = (time + this.frameTime).roundTo(3))
        {
            this.frames[counter] = new Frame(this, time, counter);
            counter++;
        }
    }
    trigger(events, argArray=[])
    {
        events = events.split(",");
        for(var i = 0; i < events.length; i++)
        {
            let event = events[i].trim();
            if(this.callbacks[event] !== undefined)
            {
                for(var j = 0; j < this.callbacks[event].length; j++)
                {
                    this.callbacks[event][j].call(this, argArray);
                }
            }
        }
    }
    on(events, callback)
    {
        events = events.split(",");
        for(var i = 0; i < events.length; i++)
        {
            let event = events[i].trim();
            if(this.callbacks[event] === undefined)
            {
                this.callbacks[event] = [];
            }
            this.callbacks[event].push(callback);
        }
    }
    detectFrameRate(callback=null)
    {
        let lastTime = 0;
        let frame = null;
        let frameTime = 1/120;
        let difference = 0;
        let tempVideo = document.createElement("video");
        let timeline = this;
        var newFrames = 0;
        var firstLoad = true;
        tempVideo.onloadeddata = function(){
            if(firstLoad)
            {
                firstLoad = false;
                console.log("onloadeddata");
                var newCanv = document.createElement("canvas");
                newCanv.height = tempVideo.videoHeight;
                newCanv.width = tempVideo.videoWidth;
                var newCtx = newCanv.getContext("2d");
                newCtx.drawImage(tempVideo, 0, 0, newCanv.width, newCanv.height);
                let lastFrame = newCanv.toDataURL();
                var timeStart = 0.1;
                var timeEnd = timeStart + 0.1;
                if(tempVideo.duration < timeEnd)
                    timeEnd = tempVideo.duration;
                var tempTime = timeStart;
                tempVideo.currentTime = tempTime;
                console.log("Detecting...");
                var firstDetection = true;
                tempVideo.addEventListener("timeupdate", function(){
                    newCtx.drawImage(tempVideo, 0, 0, newCanv.width, newCanv.height);
                    frame = newCanv.toDataURL();
                    if(frame !== lastFrame)
                    {
                        newFrames++;
                        lastFrame = frame;
                    }
                    if(tempTime < timeEnd)
                    {
                        tempTime += frameTime;
                        tempVideo.currentTime = tempTime;
                    }
                    else if(firstDetection)
                    {
                        firstDetection = false;
                        var framerate = (newFrames - 1) / (timeEnd - timeStart);
                        console.log(framerate);
                        if(callback !== null)
                            callback(framerate);
                    }
                });
            }
        }
        tempVideo.src = this.video.src;
    }
    currentImage()
    {
        return this.getImage();
    }
    getImage(time=this.currentTime)
    {
        var lastTime = this.currentTime;
        this.video.currentTime = time;
        var canvas = document.createElement('canvas');
        canvas.height = this.video.videoHeight;
        canvas.width = this.video.videoWidth;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        var img = new Image();
        img.src = canvas.toDataURL();
        this.video.currentTime = lastTime;
        return img;
    }
    play(callback, options)
    {
        if(this.playInterval == undefined)
        {
            var loop = true;
            var startingTime = this.currentTime;
            var startingFrame = this.startFrame;
            var endingFrame = this.endFrame;
            var frameSkip = this.frameSkip;
            var speed = 0.25;

            for(var key in options)
            {
                let value = options[key];
                switch(key)
                {
                    case "loop":
                        loop = value;
                        break;
                    case "startTime":
                    case "startingTime":
                        if(value > 0 && value < this.duration)
                            startingTime = value;
                        break;
                    case "startFrame":
                    case "startingFrame":
                        if(value >= 0 && value < this.frameCount)
                            startingFrame = value;
                        break;
                    case "endFrame":
                    case "endingFrame":
                        if(value > 0 && value <= this.frameCount)
                            endingFrame = value;
                        break;
                }
            }

            this.currentTime = startingTime;
            var counter = startingFrame;
            var timeline = this;

            this.playInterval = setInterval(function(){
                if(counter < endingFrame - frameSkip)
                {
                    let next = timeline.next();
                    if(next !== false)
                    {
                        timeline.setFrame(next.frame);
                        counter = next.number;
                    }
                }
                else
                {
                    counter = startingFrame;
                }
                timeline.project.updateVisiblePoints();
                if(timeline.project.track !== undefined && timeline.project.track !== null)
                {
                    if(timeline.project.track.points[timeline.currentFrame] !== undefined)
                    {
                        timeline.project.track.unemphasizeAll();
                        timeline.project.track.points[timeline.currentFrame].emphasize();
                    }
                }
            }, timeline.frameTime / speed);
        }
    }
    pause()
    {
        clearInterval(this.playInterval);
        this.playInterval = undefined;
    }
    seek(frame)
    {
        this.savedFrame = frame;
        this.seekSaved = true;

        return this;
    }
    update()
    {
        if(this.seekSaved && this.duration > 0)
        {
            this.currentFrame = this.savedFrame;
            this.seekSaved = false;
            
            this.trigger("seek");
        }

        this.currentTime = (this.currentFrame * this.frameTime).roundTo(3);
        
        if(this.video.currentTime != this.currentTime)
        {
            this.video.currentTime = this.currentTime;
        }
    }
    updateFps(fps)
    {
        let ratios = {
            start: (this.startFrame / this.frameCount) || 0,
            end: (this.endFrame / this.frameCount) || 1
        };
        this.fps = parseFloat(fps);
		this.frameTime = (1/this.fps).roundTo(3);
        this.frameCount =  Math.floor(this.duration / this.frameTime);
		this.duration = (this.frameCount * this.frameTime).roundTo(3);
        this.startFrame = Math.floor(ratios.start * this.frameCount);
        this.endFrame = Math.floor(ratios.end * this.frameCount);
    }
	updateDuration(duration){
        let ratios = {
            start: (this.startFrame / this.frameCount) || 0,
            end: (this.endFrame / this.frameCount) || 1
        };
		this.duration = duration.roundTo(3);
		this.frameCount = Math.floor(this.duration / this.frameTime);
		this.duration = (this.frameCount * this.frameTime).roundTo(3);
        this.startFrame = Math.floor(ratios.start * this.frameCount);
        this.endFrame = Math.floor(ratios.end * this.frameCount);
		return this.duration;
	}
	current()
	{
		if(this.frames[this.currentFrame] !== undefined)
		{
			return this.frames[this.currentFrame];
		}
		else
		{
			return false;
		}
	}
	setFrame(frameNum)
	{
		let frame = this.frames[frameNum];
		if(frame !== undefined)
		{
            this.currentFrame = frame.number;
			this.currentTime = frame.time.roundTo(3);
			this.video.currentTime = frame.time;
		}
		else
		{
			return false;
		}
    }
    getClosestFrame(time=this.currentTime)
    {
        return Math.floor((time / this.frameTime).roundTo(3));
    }
    getFrameStart(frameNum)
    {
        return (this.frameTime * frameNum).roundTo(3);
    }
	next()
	{
        var pickedFrame = this.frames[this.currentFrame + 1]
		if(pickedFrame == undefined)
		{
			return false;
		}
		else
		{
			return {"frame": pickedFrame, "time": pickedFrame.time.roundTo(3)};
		}
	}
	prev()
	{
		var pickedFrame = this.frames[this.currentFrame - 1]
		if(pickedFrame == undefined)
		{
			return false;
		}
		else
		{
			return {"frame": pickedFrame, "time": pickedFrame.time.roundTo(3)};
		}
	}
}