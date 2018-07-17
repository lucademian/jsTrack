class Timeline
{
	constructor(duration, width, height, video, markerShape)
	{
		this.duration = duration.roundTo(3);
		this.video = video;
		this.width = width;
        this.height = height;
        this.fps = 29.21;
        this.frameSkip = 1;
		this.frameTime = (1/this.fps).roundTo(3);
		this.frameCount =  Math.round(this.duration / this.frameTime);
		this.currentTime = 0;
		this.startFrame = 0;
		this.endFrame = this.frameCount;
		this.frames = {
			0: new Frame(this, 0, this.video)
		};
    }
    update()
    {
        if(this.video.currentTime != this.currentTime)
        {
            this.video.currentTime = this.currentTime;
        }
    }
	updateDuration(duration){
		this.duration = duration.roundTo(3);
		this.frameCount = Math.round(this.duration / this.frameTime);
		this.duration = (this.frameCount * this.frameTime).roundTo(3);
		//this.duration = this.video.duration;
		this.endFrame = this.frameCount;
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