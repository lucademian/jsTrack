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
if (!Number.prototype.toDegrees){
	Number.prototype.toDegrees = function(x){
		return this * (180 / Math.PI);
	}
}
if (!Number.prototype.toRadians){
	Number.prototype.toRadians = function(x){
		return this * (Math.PI / 180);
	}
}
if(!Math.cot)
{
	Math.cot = function(number){
		return (1 / Math.tan(number));
	}
}











