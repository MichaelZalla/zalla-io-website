/* Object.prototype extensions */
if(!Object.toArray) {
	Object.defineProperty(Object.prototype, 'toArray', {
		value: function() {
			//Strips keys from item values and returns an iterable list
			var ret = [ ];
			for(var key in this) {
				//Ignore properties inherited from higher up the prototype chain
				if(this.hasOwnProperty(key)) {
					ret.push(this[key]);
				}
			}
			return ret;
		}
	});
}

/* Array.prototype extensions */

if(!Array.max) {
	Object.defineProperty(Array.prototype, 'max', {
		value: function() {
			return Math.max.apply( Math, this);
		}
	});
}
if(!Array.min) {
	Object.defineProperty(Array.prototype, 'min', {
		value: function() {
			return Math.min.apply( Math, this);
		}
	});
}

