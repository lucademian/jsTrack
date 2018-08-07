class Frame
{
	constructor(timeline, time, number)
	{
        this.time = time;
        this.number = number;
		this.timeline = timeline;
        this.uid = (Math.round(Math.random() * 100000) + 1).toString();
        this.points = [];
	}
}