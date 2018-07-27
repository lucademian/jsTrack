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
	Number.prototype.toDegrees = function(){
		return this * (180 / Math.PI);
	}
}
if (!Number.prototype.toRadians){
	Number.prototype.toRadians = function(){
		return this * (Math.PI / 180);
	}
}
if (!Number.prototype.sigFigs){
	Number.prototype.sigFigs = function(){
        let log10 = Math.log(10);
        let n = Math.abs(String(this).replace(".", ""));
        if (n == 0) return 0;
        while (n != 0 && n % 10 == 0) n /= 10;
        
        return Math.floor(Math.log(n) / log10) + 1;
    }
}
if (!String.prototype.sigFigs){
	String.prototype.sigFigs = function(){
        let log10 = Math.log(10);
        let n = Math.abs(String(this).replace(".", ""));
        if (n == 0) return 0;
        while (n != 0 && n % 10 == 0) n /= 10;
        
        return Math.floor(Math.log(n) / log10) + 1;
    }
}
if(!Math.cot)
{
    Math.cot = function(number){
        return (1 / Math.tan(number));
    }
}

function hideLoader()
{
    document.getElementById("fullscreen-loader").classList.remove("active");
}

function showLoader()
{
    document.getElementById("fullscreen-loader").classList.add("active");
    setTimeout(hideLoader, 4000);
}









