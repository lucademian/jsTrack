class Axes
{
	constructor(stage, x, y, color, project)
	{
        this.stage = stage;
        this.project = project;
		this.x = x;
		this.y = y;
		this.theta = 0;
        this.color = color;
        this.styles = {
            color: []
        };
		this.size = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2))*2;
		this.shape = new createjs.Shape();
		// this.shape.regX = 2000;
		// this.shape.regY = 2000;
		this.shape.x = x;
		this.shape.y = y;
		this.shape.rotation = this.theta;
		this.shape.cursor = "pointer";
		this.stage.addChild(this.shape);
		this.styles.color.push(this.shape.graphics.beginFill(this.color).command);
		this.shape.graphics.drawRect(19, -6, 2, 12);
		this.shape.graphics.drawRect(-this.size/2, -1, this.size, 2);
		this.shape.graphics.drawRect(-1, -this.size/2, 2, this.size);

        this.hitShape = new createjs.Shape();
        
		this.styles.color.push(this.hitShape.graphics.beginFill(this.color).command);
		this.hitShape.graphics.drawRect(-this.size/2, -3, this.size, 6);
		this.hitShape.graphics.drawRect(-3, -this.size/2, 6, this.size);
		this.shape.hitArea = this.hitShape;

		let parent = this;
		let moving = false;
		let rotating = false;
		this.shape.addEventListener("mousedown", function(e){
            let coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
			moving = false;
			rotating = false;
			let mouseCoords = parent.convert(coords.x, coords.y);
			if(mouseCoords.x < 20 && mouseCoords.x > -20 && mouseCoords.y < 20 && mouseCoords.y > -20)
			{
				moving = true;
				parent.shape.cursor = "grabbing";
				parent.stage.update();
				parent.stage._testMouseOver(true);
			}
			else if(mouseCoords.x > 20)
			{
				rotating = true;
				moving = false;
			}
		});
		this.shape.addEventListener("tick", function(e){
            let coords = e.target.stage.globalToLocal(stage.mouseX, stage.mouseY);
			let mouseCoords = parent.convert(coords.x, coords.y);
			if(mouseCoords.x < 20 && mouseCoords.x > -20 && mouseCoords.y < 20 && mouseCoords.y > -20)
			{
				if(moving)
				{
					parent.shape.cursor = "grabbing";
				}
				else
				{
					parent.shape.cursor = "grab";
					parent.stage._testMouseOver(true);
				}
			}
			else if(mouseCoords.x > 20)
			{
				let cursorDegree = parent.theta.toDegrees();
				parent.cursor();
			}
			else
			{
				parent.shape.cursor = "default";
			}
		});
		this.shape.addEventListener("pressmove", function(e){
            let coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
			if(moving)
			{
				parent.shape.cursor = "grabbing";
				parent.x = coords.x;
				parent.shape.x = parent.x - 1;
				parent.y = coords.y;
				parent.shape.y = parent.y - 1;
                parent.stage.update();
			}
			else if(rotating)
			{
				let sign = 1;
				let reference = Math.PI;

				if(coords.y > parent.y && coords.x > parent.x)
				{
					sign = 1;
					reference = Math.PI * 2;
				}
				else if(coords.y > parent.y && coords.x < parent.x)
				{
					sign = 1;
					reference = Math.PI;
				}
				else if(coords.y < parent.y && coords.x < parent.x)
				{
					sign = 1;
					reference = Math.PI;
				}
				else if(coords.y < parent.y && coords.x > parent.x)
				{
					sign = 1;
					reference = 0;
				}

				parent.theta = sign * (-sign * Math.atan((parent.y - coords.y)/(parent.x - coords.x)) + reference);
				if(parent.theta == Math.PI && coords.x > parent.x)
				{
					parent.theta = 0;
				}

				parent.cursor();

                parent.shape.rotation = -parent.theta.toDegrees();
			}
		});
		this.shape.addEventListener("pressup", function(e){
            parent.project.update();
			moving = false;
			rotating = false;
		});
    }
    rotate(radians)
    {
        this.theta = radians;
        this.shape.rotation = -this.theta.toDegrees();
        this.project.update();
    }
    updateColor(color)
    {
        this.color = color;
        for(var i=0; i < this.styles.color.length; i++)
        {
            this.styles.color[i].style = this.color;
        }
    }
	cursor()
	{
		let parent = this;
		let cursorDegree = parent.theta.toDegrees();

		if((cursorDegree >= 0 && cursorDegree <= 20) || (cursorDegree > 340 && cursorDegree <= 360))
		{
			parent.shape.cursor = "ns-resize";
		}
		else if(cursorDegree > 20 && cursorDegree <= 60)
		{
			parent.shape.cursor = "nw-resize";
		}
		else if(cursorDegree > 60 && cursorDegree <= 120)
		{
			parent.shape.cursor = "ew-resize";
		}
		else if(cursorDegree > 120 && cursorDegree <= 160)
		{
			parent.shape.cursor = "ne-resize";
		}
		else if(cursorDegree > 160 && cursorDegree <= 200)
		{
			parent.shape.cursor = "ns-resize";
		}
		else if(cursorDegree > 200 && cursorDegree <= 250)
		{
			parent.shape.cursor = "se-resize";
		}
		else if(cursorDegree > 250 && cursorDegree <= 290)
		{
			parent.shape.cursor = "ew-resize";
		}
		else if(cursorDegree > 290 && cursorDegree <= 340)
		{
			parent.shape.cursor = "ne-resize";
		}
	}
	convert(x, y)
	{
		let axes = this;
		let coords = {x: x, y: -y};
		let origin = {x: axes.x, y: -axes.y};

		let tan = Math.tan(axes.theta);
		let cot = Math.cot(axes.theta);

		// https://www.desmos.com/calculator/oeke5fmddc
		let interceptX = {};
		interceptX.x = (-origin.y + coords.y + (tan * origin.x) + (cot * coords.x)) / (cot + tan);
		interceptX.y = (tan * interceptX.x) + (origin.y - (tan * origin.x));

		let interceptY = {};
		interceptY.x = (-coords.y + origin.y + tan * coords.x + cot * origin.x) / (cot + tan);
		interceptY.y = -cot * interceptY.x + (origin.y + cot * origin.x);

		let signX = Math.sign(interceptX.x - origin.x);
		if(axes.theta > 0.5*Math.PI && axes.theta < 1.5*Math.PI)
		{
			signX *= -1;
		}

		let location = {
			x: signX * Math.sqrt(Math.pow(interceptX.y - origin.y, 2) + Math.pow(interceptX.x - origin.x, 2)),
			y: Math.sign(interceptY.y - origin.y) * Math.sqrt(Math.pow(interceptX.y - coords.y, 2) + Math.pow(interceptX.x - coords.x, 2))
		}


		switch(axes.theta)
		{
			case 0:
				location = {x: coords.x - origin.x, y: coords.y - origin.y};
				break;
			case 0.5*Math.PI:
				location = {x: coords.y - origin.y, y: origin.x - coords.x};
				break;
			case Math.PI:
				location = {x: origin.x - coords.x, y: origin.y - coords.y};
				break;
			case 1.5*Math.PI:
				location = {x: origin.y - coords.y, y: coords.x - origin.x};
				break;
			case 2*Math.PI:
				location = {x: coords.x - origin.x, y: coords.y - origin.y};
				break;
		}


		return location;
	}
}