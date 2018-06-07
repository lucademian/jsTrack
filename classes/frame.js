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