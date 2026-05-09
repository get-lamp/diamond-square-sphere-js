const PIXI = require('pixi.js')

class TileMap {

	constructor(heightMap, opt){

		opt = opt || {}; 

		this.length = heightMap.length;
		this.tileSize = opt.tileSize;
		this.heightMap = heightMap.matrix;
		this.skip = this.length / Math.pow(2, heightMap.depth);
		this.water = opt.water || .5;
		this.g = new PIXI.Graphics();
		this.container = new PIXI.Container();
		this.sprites = {
			land: [
				0xffffe5,
				0xfff7bc,
				0xfee391,
				0xfec44f,
				0xfe9929,
				0xec7014,
				0xcc4c02,
				0x993404,
				0x662506,
			],
			ocean: [
				0xf7fbff,
				0xdeebf7,
				0xc6dbef,
				0x9ecae1,
				0x6baed6,
				0x4292c6,
				0x2171b5,
				0x08519c,
				0x08306b
			]
		}
	}

	getGraphics(){
		return this.container;
	}

	drawTile(x, y, color){

		// small offset patch
		y = y+(0);
		x = x+(0);

		this.g.beginFill(color);
		this.g.drawRect((x * this.tileSize), y * this.tileSize, this.tileSize, this.tileSize);
		this.g.endFill();
	}
	
	draw(){   

	   	// offset
		var oy = 0;
		var ox = 0;
		
		// x position on screen
		console.time("world.draw");
		for( var vy=0,my=0; my < this.length; vy++){

			// offset wrap around y axis
			var my = ((vy + oy) <= this.length) ? vy + oy : vy + oy - this.length;

			my*=this.skip;

			// x position on screen
			for( var vx=0,mx=0; mx < this.length; vx++){

				// offset wrap around x axis
				var mx = ((vx + ox) <= this.length) ? vx + ox : vx + ox - this.length;

				mx*=this.skip;
				
				var tile = this.heightMap[my][mx];

				var color = this.getTerrainColor(tile);      
				//color = this.getTerrainColorGrayscale(tile);      
				this.drawTile(vx, vy, color)
				
			}
		}
		this.container.addChild(this.g);
		console.timeEnd("world.draw");

	}

	getTerrainColor(height){

		var water = this.water;

		if(height > water){
			var index = (Math.floor(((1 / (1-water)) * (height-water)) / (1/this.sprites.land.length)));
			var color = this.sprites.land[index];
		}
		else {
			var index = this.sprites.ocean.length - (Math.floor(((1 / (water)) * (height)) / (1/this.sprites.ocean.length)));
			var color = this.sprites.ocean[index];
		}

		return color;
	}

}

exports.TileMap = TileMap;