class Project
{
	constructor(name, timeline)
	{
		this.name = name;
		this.timeline = timeline;
		this.track = null;
		this.scale = null;
		this.axes = null;
		this.trackList = [];
		this.scaleList = [];
		this.axesList = [];
		this.timeline.project = this;
	}
	newTrack(name, color, stage, unit="m", makeDefault=true)
	{
		let track = new Track(this.timeline, name, color, stage, unit);
		this.trackList.push(track);
		if(makeDefault)
			this.track = track;
	}
	newAxes(stage, x, y, color, makeDefault=true)
	{
		let axes = new Axes(stage, x, y, color);
		this.axesList.push(axes);
		if(makeDefault)
			this.axes = axes;
	}
	newScale(stage, name, size, x1, y1, x2, y2, makeDefault=true)
	{
		let scale = new Scale(stage, name, size, x1, y1, x2, y2);
		this.scaleList.push(scale);
		if(makeDefault)
			this.scale = scale;
	}
}