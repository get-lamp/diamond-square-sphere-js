const {Midpoint} = require('./midpoint')
const {TileMap} = require('./tileMap')

var Matrix = function(width, height, callback){

    if(!callback){
        callback = function(x,y){
            return null;
        }
    }

    var matrix = new Array(height);

    for(var y=0; y < height; y++){

        matrix[y] = new Array(width);

        for(var x=0; x < width; x++){
            matrix[y][x] = callback(x,y);
        }
    }

    return matrix;
}


class World {

	constructor(size, opt){

		this.size = size;
		this.length = Math.pow(2, size) + 1;
		this.opt = opt;
		
	}

	build(){
		const matrix = new Matrix(this.length, this.length);
		this.heightMap = new Midpoint(matrix, this.opt).create();
	    this.tileMap = new TileMap(this.heightMap, this.opt);
	    return this;
	}

	draw(){
		this.tileMap.draw();
	}

	getGraphics()
	{
		return this.tileMap.getGraphics();
	}
}

exports.World = World;