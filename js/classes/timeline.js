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
        this.savedTime = 0;
        this.seekSaved = false;
		this.startFrame = 0;
		this.endFrame = this.frameCount;
		this.frames = {
			0: new Frame(this, 0, this.video)
        };
    }
    currentImage()
    {
        var canvas = document.createElement('canvas');
        canvas.height = this.video.videoHeight;
        canvas.width = this.video.videoWidth;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        var img = new Image();
        img.src = canvas.toDataURL();
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
                console.log(counter);
                if(counter < endingFrame - frameSkip)
                {
                    let next = timeline.next();
                    if(next !== false && next.distance < (frameSkip * timeline.frameTime).roundTo(3))
                    {
                        timeline.currentTime = (next.time).roundTo(3);
                        counter = timeline.getClosestFrame(next.time);
                    }
                    else
                    {
                        timeline.currentTime = (counter * timeline.frameTime).roundTo(3);
                        counter += frameSkip;
                    }
                }
                else
                {
                    counter = startingFrame;
                }
                timeline.project.updateVisiblePoints();
                if(timeline.project.track !== undefined && timeline.project.track !== null)
                {
                    if(timeline.project.track.points[timeline.currentTime] !== undefined)
                    {
                        timeline.project.track.unemphasizeAll();
                        timeline.project.track.points[timeline.currentTime].emphasize();
                    }
                }
                console.log(timeline.currentTime);
            }, timeline.frameTime / speed);
        }
    }
    pause()
    {
        clearInterval(this.playInterval);
        this.playInterval = undefined;
    }
    seek(time)
    {
        this.savedTime = time;
        this.seekSaved = true;

        return this;
    }
    update()
    {
        if(this.video.currentTime != this.currentTime)
        {
            this.video.currentTime = this.currentTime;
        }

        if(this.seekSaved && this.duration > 0)
        {
            this.currentTime = this.savedTime;
            this.seekSaved = false;
        }
    }
    updateFps(fps)
    {
        let ratios = {
            start: (this.startFrame / this.frameCount) || 0,
            end: (this.endFrame / this.frameCount) || 1
        };
        this.fps = fps;
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
		if(this.frames[this.currentTime.toString()] !== undefined)
		{
			return this.frames[this.currentTime.toString()];
		}
		else
		{
			return false;
		}
	}
	addFrame(time)
	{
        time = time.roundTo(3);
        var frame = null;
        if(this.frames[time] === undefined)
        {
            frame = new Frame(this, time);
            this.frames[time] = frame;
        }
        else
        {
            frame = this.frames[time];
        }

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
}