const PIXI = require('pixi.js')
const THREE = require('three')
const OrbitControl = require('../lib/orbitControl');
const {World} = require("./world");

var camera, scene, renderer, geometry, material, mesh;

function TestWorld(){
    var world = new World(9, {
        water: .6,
        hardness: 1.8, //2.5,
        tileSize: 1,
        zoom: 0,
        seed: 's123DT4pSLNvqQrSAfJL'
    });

    world.build().draw();

    return world;
}

testWorld = TestWorld()

var canvas2D = PIXI.autoDetectRenderer({
    height: 512,
    width: 512,
    antialias: false, 
    transparent: true, 
    resolution: 1
});

canvas2D.render(testWorld.getGraphics());

init();
animate();

function dir2xy(dir)
{
	dir.az = 360 - dir.az + 180;
	dir.az = dir.az % 360;

	var x = Math.floor(262 * dir.az / 360);
	var y = Math.floor(256 * (dir.h + 90) / 180);

	return {x: x, y: y};
}

function init() {

	var img = document.createElement('img');
	img.crossOrigin = "Anonymous";

	var getH = function(dir) {

		var xy = dir2xy(dir);

		h = testWorld.heightMap.matrix[xy.y][xy.x] * 1;

		return 10 + ((h > 0) ? h : 0); 

		//return 10;
	}

	var loadMyHeightmap = function(geometry){
		
		var maxX = 0;
		var minX = 0;
		var maxY = 0;
		var minY = 0;

		for (var i = 0, l = geometry.vertices.length; i < l; i++) {
			var dir = position2Dir(geometry.vertices[i]);
			var h = getH(dir);

			var xy = dir2xy(dir);

			if(xy.x > maxX)
				maxX = xy.x;
			else
			if(xy.x < minX)
				minX = xy.x;
			

			if(xy.y > maxY)
				maxY = xy.y;
			else
			if(xy.y < minY)
				minY = xy.y;

			var vector = new THREE.Vector3()
			vector.set(geometry.vertices[i].x, geometry.vertices[i].y, geometry.vertices[i].z);
			vector.setLength(h);
			geometry.vertices[i].x = vector.x;
			geometry.vertices[i].y = vector.y;
			geometry.vertices[i].z = vector.z;
		}
	}

	var position2Dir = function(position) {
		var az = null;
		var h = null;

		var vector = new THREE.Vector3(position.x, position.y, position.z);
		var length = vector.length();

		var hd = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.z, 2)) / length;

		h = Math.atan((position.y / length) / hd) / Math.PI * 180;
		h *= -1;

		az = Math.atan((position.z / hd) / (position.x / hd));

		if (position.x < 0 && position.z > 0) az = Math.PI + az;
		if (position.x < 0 && position.z < 0) az = Math.PI + az;
		if (position.x > 0 && position.z < 0) az = Math.PI * 2 + az;

		az = az / Math.PI * 180;

		if (isNaN(az)) az = 0;

		return {
			az: az,
			h: h
		};
	}

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 50;
	//camera.position.z=1;
	scene.add(camera);

	controls = new THREE.OrbitControls(camera);

	geometry = new THREE.SphereGeometry(1, 64, 64);
	//geometry = new THREE.TetrahedronGeometry(128, 4);

	texture = new THREE.Texture(canvas2D.view);
	texture.needsUpdate = true;

	var material = new THREE.MeshPhongMaterial({
		side: THREE.FrontSide,
		map: texture
	});

	var L0 = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(L0);

	mesh = new THREE.Mesh(geometry, material);

	loadMyHeightmap(geometry);

	scene.add(mesh);

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

}

function animate() {

	requestAnimationFrame(animate);
	render();

}

function render() {
	controls.update();
	mesh.rotation.y += 0.005;
	renderer.render(scene, camera);
}
