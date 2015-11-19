// http://stackoverflow.com/questions/7176908/how-to-get-index-of-object-by-its-property-in-javascript
Array.prototype.indexOfAttr = function (attr, value) {
    for(var i = 0; i < this.length; i += 1) {
        if(this[i][attr] === value) {
            return i;
        }
    }
    return -1;
};

Array.prototype.elementWithAttr = function (attr, value) {
    for(var i = 0; i < this.length; i += 1) {
        if(this[i][attr] === value) {
            return this[i];
        }
    }
    return null;
};

Number.prototype.toMinutes = function(){
	return (Math.floor(parseInt(this)/60)).addTrailingZero()+":"+(parseInt(this)%60).addTrailingZero();
};

Number.prototype.addTrailingZero = function(){
	if(this < 10)	return "0"+this;
	else	return this;
};

String.prototype.parseTime = function(){
  return (parseInt(this.substring(0, 2)) * 60) + (parseInt(this.substring(3)));
};

String.prototype.truncate = function(x){
  if(this.length < x) return this.valueOf();
  else return this.substring(0, x - 3) + "...";
};

String.prototype.splitFirst = function(x){
  // get index of first Delimeter
  var index = this.indexOf(x);

  return [
    this.substring(0, index),
    this.substring(index + x.length)
  ]
}
