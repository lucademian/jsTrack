class Scale
{
	constructor (stage, name, size, x1, y1, x2, y2, color)
	{
		this.stage = stage;
		this.color = color;
		this.nodeSize = 8;
		this.textValue = math.unit(size).toString();
        this.size = math.unit(size);

		this.hitArea = new createjs.Shape();
		this.hitArea.graphics.beginFill(this.color).drawRect(-1, -1,this.nodeSize+2, this.nodeSize+2);
		this.nodes = [
			new createjs.Shape(),
			new createjs.Shape()
		];
		this.nodes[0].hitArea = this.hitArea;
		this.nodes[1].hitArea = this.hitArea;
		this.nodes[0].regX = this.nodeSize/2;
		this.nodes[1].regX = this.nodeSize/2;
		this.nodes[0].regY = this.nodeSize/2;
		this.nodes[1].regY = this.nodeSize/2;
		this.nodes[0].graphics.beginStroke(this.color);
		this.nodes[1].graphics.beginStroke(this.color);
		this.nodes[0].graphics.drawEllipse(0,0,this.nodeSize,this.nodeSize);
		this.nodes[1].graphics.drawEllipse(0,0,this.nodeSize,this.nodeSize);
		this.nodes[0].cursor = "pointer";
		this.nodes[1].cursor = "pointer";
		this.nodes[0].x = x1;
		this.nodes[1].x = x2;

		this.nodes[0].y = y1;
		this.nodes[1].y = y2;

		this.length = Math.sqrt(Math.pow(this.nodes[0].y - this.nodes[1].y, 2) + Math.pow(this.nodes[0].x - this.nodes[1].x, 2));
		this.line = new createjs.Shape();
		this.line.graphics.setStrokeStyle("2");
		this.line.graphics.beginStroke(this.color);
		this.lineStart = this.line.graphics.moveTo(this.nodes[0].x, this.nodes[0].y).command;
		this.lineEnd = this.line.graphics.lineTo(this.nodes[1].x, this.nodes[1].y).command;
		this.line.graphics.endStroke();

		this.textSizingElement = document.createElement("span");
		this.textSizingElement.innerText = this.textValue;
		this.textSizingElement.classList.add("scale-text");
		document.getElementById("main-container").appendChild(this.textSizingElement);
		this.letterWidth = this.textSizingElement.getBoundingClientRect().width / this.textValue.length;
		this.textSizingElement.remove();

		this.textElement = document.createElement("input");
		document.getElementById("main-container").appendChild(this.textElement);
		this.textElement.classList.add("scale-text");
		this.textElement.classList.add("not-editing");
		this.textElement.type = "text";
		this.textElement.readOnly = true;
		this.textElement.style.border = "2px " + this.color + " solid";
		this.textElement.style.color = this.color;
		this.textElement.style.width = (this.letterWidth * this.textValue.length) + "px";
		this.textElement.value = this.textValue;
        this.text = new createjs.DOMElement(this.textElement);
        
		this.textHitShape = new createjs.Shape();
		// this.textHitShape.graphics.beginFill("#000");
		this.textHit = this.textHitShape.graphics.drawRect(this.text.x - this.text.regX, this.text.y - this.text.regY, this.text.offsetWidth, this.text.offsetHeight);

		this.stage.addChild(this.textHitShape);
        this.stage.addChild(this.text);
		this.stage.addChild(this.line);
		this.stage.addChild(this.nodes[0]);
		this.stage.addChild(this.nodes[1]);
        
        this.update();
		this.stage.update();
		
		let _scale = this;
		this.textElement.addEventListener("focus", function(e){
			if(_scale.textElement.readOnly)
			{
				_scale.textElement.blur();
			}
		});
		this.textElement.addEventListener("dblclick", function(){
			_scale.textElement.classList.add("editing");
			_scale.textElement.classList.remove("not-editing");
			_scale.textElement.readOnly = false;
		});
		["change", "keypress", "keyup"].forEach(function(value){
			_scale.textElement.addEventListener(value, function(e){
				if((value != "keypress" && value != "keyup") || e.key == "13")
				{
					_scale.update(_scale.textElement.value);
					_scale.textElement.classList.remove("editing");
					_scale.textElement.classList.add("not-editing");
					_scale.textElement.blur();
					_scale.textElement.readOnly = true;
				}
				else
				{
					_scale.update();
				}
			});
		});
		_scale.stage.addEventListener("click", function(e){
			let mouseCoords = _scale.textHitShape.globalToLocal(e.stageX, e.stageY);
			if(mouseCoords.x > _scale.textElement.offsetWidth)
			{
				_scale.update(_scale.textElement.value);
				_scale.textElement.classList.remove("editing");
				_scale.textElement.classList.add("not-editing");
				_scale.textElement.blur();
				_scale.textElement.readOnly = true;
			}
		});
		
		this.nodes[0].addEventListener("pressmove", function(e){
            let coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
			_scale.nodes[0].x = coords.x;
			_scale.nodes[0].y = coords.y;
			_scale.update();
            _scale.stage.update();
		});
		this.nodes[1].addEventListener("pressmove", function(e){
            let coords = e.target.stage.globalToLocal(e.stageX, e.stageY);
			_scale.nodes[1].x = coords.x;
			_scale.nodes[1].y = coords.y;
			_scale.update();
			_scale.stage.update();
		});
	}
	update(value=this.textValue)
	{
		let _scale = this;

		if(value !== _scale.textValue)
		{
			if(value.length > 0)
			{
				try
				{
					math.unit(value);
					_scale.size = math.unit(value);
					_scale.textValue = math.format(math.unit(value)).toString();
				}
				catch(TypeError)
				{

				}
			}

			_scale.textElement.value = _scale.textValue;
		}
		
		_scale.lineStart.x = _scale.nodes[1].x;
		_scale.lineStart.y = _scale.nodes[1].y;
		_scale.lineEnd.x = _scale.nodes[0].x;
		_scale.lineEnd.y = _scale.nodes[0].y;
		_scale.length = Math.sqrt(Math.pow(_scale.nodes[0].y - _scale.nodes[1].y, 2) + Math.pow(_scale.nodes[0].x - _scale.nodes[1].x, 2));

		_scale.textElement.style.width = (_scale.letterWidth * _scale.textElement.value.length) + "px";

		if((_scale.nodes[0].x < _scale.nodes[1].x && _scale.nodes[0].y < _scale.nodes[1].y) || (_scale.nodes[1].x < _scale.nodes[0].x && _scale.nodes[1].y < _scale.nodes[0].y))
		{
			_scale.text.regX = 0;
			_scale.text.regY = _scale.textElement.offsetHeight;
			_scale.text.x = _scale.nodes[1].x + (_scale.nodes[0].x - _scale.nodes[1].x)/2 + 0;
			_scale.text.y = _scale.nodes[1].y + (_scale.nodes[0].y - _scale.nodes[1].y)/2 - 0;
		}
		else
		{
			_scale.text.regX = _scale.textElement.offsetWidth;
			_scale.text.regY = _scale.textElement.offsetHeight;
			_scale.text.x = _scale.nodes[1].x + (_scale.nodes[0].x - _scale.nodes[1].x)/2 - 0;
			_scale.text.y = _scale.nodes[1].y + (_scale.nodes[0].y - _scale.nodes[1].y)/2 - 0;
        }
        
        if(Math.abs((_scale.nodes[1].y - _scale.nodes[0].y) / (_scale.nodes[1].x - _scale.nodes[0].x)) < 0.4)
        {
            _scale.text.regX = _scale.textElement.offsetWidth * 0.5;
			_scale.text.regY = _scale.textElement.offsetHeight;
			_scale.text.x = _scale.nodes[1].x + (_scale.nodes[0].x - _scale.nodes[1].x)/2 - 0;
			_scale.text.y = _scale.nodes[1].y + (_scale.nodes[0].y - _scale.nodes[1].y)/2 - 0;
        }

		_scale.textHit.x = _scale.text.x - _scale.text.regX;
		_scale.textHit.y = _scale.text.y - _scale.text.regY;
		_scale.textHit.w = _scale.textElement.offsetWidth;
        _scale.textHit.h = _scale.textElement.offsetHeight;
        _scale.stage.update();
	}
    convert(pixels, unit=this.size)
	{
        let convertTo = unit;
        let mathUnit = math.unit(math.multiply(pixels, math.divide(this.size, this.length))).to(unit);
		return {"number": mathUnit.toNumber(unit)};
	}
}