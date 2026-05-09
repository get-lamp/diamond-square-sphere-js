const random = require('./random');

class Midpoint {

	constructor(matrix, opt){
		opt = opt || {};

		this.seed = null;
		this.length = matrix.length-1;
		this.H = opt.hardness || 1.8;
		this.zoom = opt.zoom || 0;
		this.depth = (Math.log(this.length) / Math.log(2)) - this.zoom;
		this.random = {matrix: null, north: null, south: null, east: null};
		this.seed = opt.seed || null;
		this.minHeight = 0;
		this.maxHeight = 0;

		this.variance = {
			globe: 		3,
			east:      	3,
		}
	}

	computeHeight(points, dh, rand)
	{
		var len = points.length;
		var sum = 0;
		var d2 = dh/2;

		for(var i=0; i<len; i++){
			sum += points[i];
		}

		var height = (sum / len) + (rand * dh) - d2;

		if(height < this.minHeight)
			this.minHeight = height;
		else
		if(height > this.maxHeight)
			this.maxHeight = height;

		return height;
	}

	midpoint1d(M, x0, y0, x1, y1, dh, depth){

		if(depth == 0)
			return;

		var dx = x1 - x0;
		var dy = y1 - y0;
		var cx = x0 + dx/2;
		var cy = y0 + dy/2;
		
		// can't subdivide any more
		if(cx % 1 !== 0 || cy % 1 !== 0)
			return;
		
		//center point
		M[cy][cx] = this.computeHeight([M[y0][x0], M[y1][x1]], dh, this.random.matrix[cy][cx]);

		var nh = dh/this.H;
		depth--;

		this.midpoint1d(M, x0, y0, cx, cy, nh, depth);
		this.midpoint1d(M, cx, cy, x1, y1, nh, depth);
	}

	midpoint2d(M, NWx, NWy, SEx, SEy, dh, depth){

		if(depth == 0)
			return;

		// compute delta x:y
		var dx = SEx - NWx;
		var dy = SEy - NWy;
		// compute x:y for center
		var cx = NWx + dx/2; 
		var cy = NWy + dy/2;

		// can't subdivide any more
		if(cx % 1 !== 0 || cy % 1 !== 0)
			return;

		M[cy][cx] = this.computeHeight([M[NWy][NWx], M[NWy][SEx], M[SEy][SEx], M[SEy][NWx]], dh, this.random.matrix[cy][cx]);
		// compute N, S, W, E heights
		if(M[NWy][cx] === undefined) M[NWy][cx] = this.computeHeight([M[NWy][NWx], M[NWy][SEx]], dh, this.random.matrix[NWy][cx]);
		if(M[SEy][cx] === undefined) M[SEy][cx] = this.computeHeight([M[SEy][NWx], M[SEy][SEx]], dh, this.random.matrix[SEy][cx]);
		if(M[cy][NWx] === undefined) M[cy][NWx] = this.computeHeight([M[NWy][NWx], M[SEy][NWx]], dh, this.random.matrix[cy][NWx]);
		if(M[cy][SEx] === undefined) M[cy][SEx] = this.computeHeight([M[NWy][SEx], M[SEy][SEx]], dh, this.random.matrix[cy][SEx]);

		var nh = dh/this.H;
		depth--;
		
		// recurse for NW, NE, SW, SE quadrants
		this.midpoint2d(M, NWx, NWy, cx, cy, nh, depth);
		this.midpoint2d(M, cx, NWy, SEx, cy, nh, depth);
		this.midpoint2d(M, NWx, cy, cx, SEy, nh, depth);
		this.midpoint2d(M, cx, cy, SEx, SEy, nh, depth);
		
	}

	init(){

		this.matrix = new Array(this.length + 1);

		for(var y = 0; y <= this.length; y++){   
			this.matrix[y] = new Array(this.length + 1);
		}			
	}

	seedMatrix(){
		
		if(!this.seed)
			this.seed = random.randUnitFloat().toString(36).substring(7);

		random.seed(this.seed);

		this.random.north = random.randUnitFloat();
		this.random.south = this.random.north; //random.randUnitFloat();
		this.random.east = random.randUnitFloat();

		this.random.matrix = new Array(this.length + 1);

		for(var y=0; y <= this.length; y++){

			this.random.matrix[y] = new Array(this.length+1);
			
			for(var x=0; x <= this.length; x++){

				// poles
				if(y == 0 || y == this.length){
					this.random.matrix[y][x] = (y == 0) ? this.random.north : this.random.south;
					this.matrix[y][x] = this.random.matrix[y][x];
				}
				else // east/west
				if(x == this.length){
					this.random.matrix[y][x] = this.random.matrix[y][0];
				}
				else // everything else
					this.random.matrix[y][x] = random.randUnitFloat();
			}
		}
		random.removeSeed();		
	}

	normalize(height, deltaHeight){

		var delta = this.maxHeight - this.minHeight;

		for(var y=0; y <= this.length; y++){
			for(var x=0; x <= this.length; x++){
				this.matrix[y][x] =  (-this.minHeight + this.matrix[y][x]) * 1/delta;
			}

		}
	}

	create(){

		console.time('midpoint');

		// initialize map matrix
		this.init();

		// precompute seeds to allow consistency between zoom levels when dynamically building the map
		this.seedMatrix();

	   	// EAST    
	   	//Math.seedrandom(this.random.east);
		this.midpoint1d(this.matrix, this.length, 0, this.length, this.length , this.variance.east, this.H, this.depth); 

		// WEST
		//Math.seedrandom(this.random.east);
		this.midpoint1d(this.matrix, 0, 0, 0, this.length , this.variance.east, this.H, this.depth);
		
		// 
		this.midpoint2d(this.matrix, 0, 0, this.length, this.length, this.variance.globe, this.H, this.depth);

		this.normalize(); 

		console.timeEnd('midpoint');
		return this;
	}

	
}


exports.Midpoint = Midpoint;

