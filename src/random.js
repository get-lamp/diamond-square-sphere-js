
class Random {

	static seed(seed){
		Math.seedrandom(seed);
	}

	static removeSeed(){
		Math.seedrandom();
	}

	static randUnitFloat(){
		return Math.random();
	}

	/**
	 * Returns a random integer between min (inclusive) and max (inclusive)
	 * Using Math.round() will give you a non-uniform distribution!
	 */
	static flipCoin(){
		return Math.floor(Math.random() * 2);
	}

	static randInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static randHex(){
		return Math.floor(Math.random()*16777215);
	}

}

module.exports = Random;