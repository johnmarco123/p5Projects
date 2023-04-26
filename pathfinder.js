// let pf;

// function setup() {
// 	createCanvas(innerWidth, innerHeight);
// 	// put setup code here
// 	pf = new Pathfinder()
// }

// function draw() {
// 	background(255);
// 	pf.run()

// }
const makeKey = (x, y) => x.toString() + y.toString()

// function mouseDragged(){
// 	pf.addWall(mouseX, mouseY)
// }
// function keyPressed(){
// 	if(key == 'Control'){
// 		pf.addFinder(mouseX, mouseY)
// 	}
// 	if(key == 'f'){
// 		let coords = pf.getCellCoords(mouseX, mouseY)
// 		let food = createVector(coords.x, coords.y)
// 		food.keyName = makeKey(food.x, food.y)
// 		pf.foods.push(food)
// 		pf.allFoods.push(food)
// 	}
// 	if(key == 'r'){
// 		pf = new Pathfinder()
// 	}
// 	if(key == 'k'){
// 		pf.generateRandomLevel()
// 	}
// 	if(key == 'ArrowLeft'){
// 		if(pf.size < 50){
// 			pf.size += 5
// 		}
// 	}
// 	if(key == 'ArrowRight'){
// 		if(pf.size >= 10){
// 			pf.size -= 5
// 		}
// 	}
// }

//once a food is gotten we need to create a new pathfinder start that does not contain the food its got
//if THAT gets another food, same thing applies, the food gotten is stored locally
//if all food is got we set thepathfinder foodfound to true and we provide it with the pathfinder
//that reached this
class Pathfinder{
	constructor(){
		this.size = 5 //anything less then five will take quite a while to iterate to, but it will eventuallyf
		this.bounds = createVector();
		this.finders = [];
		this.foods = [];
		this.allFoods = [];
		this.foodCounter = 0;
		this.foodFound = false;
		this.fastestRoutes = [];
		// this.distances = new Map();
		this.hashMapFinders = new Map();
		this.hashMapWalls = new Map();
		this.pathLength = 0
		this.color = color(random(255), random(255), random(255))
	}
	run(){
		this.createGrid()
		this.showWalls();
		this.showFood();
		if(this.foodFound){
			this.showFastestPath()
		} else {
				this.showFinders();
			if(frameCount % (this.size / 5) == 0 && !this.foodFound){
				if(this.finders.length > 0){
					this.updateFinders()
				}
			}
		}


	}

	addWall(x, y){
		let coords = pf.getCellCoords(x, y)
		let hashKey = makeKey(coords.x, coords.y);
		//if a wall does not exist, we add it
		if(!pf.hashMapWalls.get(hashKey)){
			pf.hashMapWalls.set(hashKey, coords)
		}
	}
	addFinder(x, y){
		if(this.foods.length > 0){
			let coords = pf.getCellCoords(x, y)
			this.finders.push(new Finder(coords.x, coords.y, pf.size,[], [random(255),random(255),random(255)]))
		}
	}
	generateRandomLevel(){
		const amount = 5000/this.size
		for(let i = 0; i < amount; i++){
			let randWall = createVector(random(0, width), random(0, height))
			this.addWall(randWall.x, randWall.y);
		}
	}
	showFastestPath(){
		for(let route of this.fastestRoutes){
			for(let coord of route.prevPath){
				fill(route.color)
				rectMode(CENTER)
				rect(coord.x, coord.y, this.size)
				}
			}
		for(let fd of this.allFoods){
			fill(0, 255, 0)
			ellipse(fd.x, fd.y, this.size * 2)
		}
		rectMode(CORNER)
	}
	calculatePathLength(){
		let sum = 0;
		this.fastestRoutes.forEach(f => sum += f.prevPath.length)
		return sum
	}
	createGrid(){
		rectMode(CORNER)
		stroke(0, 25);
		fill(0, 120, 140)
		for(let i = 0; i < width; i += this.size){
			if(i + this.size >= width){
				//right bounds
				rect(i, 0, this.size, height);
				this.bounds.x = i;
				break;
			}
			line(i, 0, i, height);
		}
		for(let i = 0; i < height; i+= this.size){
			if(i + this.size >= height){
				//bottom bounds
				rect(0, i, width, this.size)
				this.bounds.y = i;
				break;
			}
			line(0, i, width, i);
		}
		fill(255, 0, 0);
		ellipse(this.bounds.x, this.bounds.y, 10);
	}
	getCellCoords(x, y){
		//check to see which square it shall be placed in
		let coords = createVector()
		for(let i = 0; i < width; i += this.size){
			if(x >= i && x < i + this.size){
				coords.x = i + this.size / 2;
			}
		}
		for(let i = 0; i < height; i+= this.size){
				if(y >= i && y < i + this.size){
					coords.y = i + this.size / 2;
				}
			}
		return coords
	}
	showFood(){
		if(this.foods){
			fill(0, 255, 0)
			rectMode(CENTER)
			this.foods.forEach(f => rect(f.x, f.y, this.size))
			rectMode(CORNER)
		}
	}
	showWalls(){
		for(let value of this.hashMapWalls.values()){
		rectMode(CENTER)
		fill(0)
		rect(value.x, value.y, this.size)
		rectMode(CORNER)
		}
	}
	showFinders(){
		this.finders.forEach(f => f.show());
	}
	foodIsFound(finder){
		// We iterate through all the foods
		for(let i = 0; i < this.foods.length; i++){
			// and we check if the finder is on the food, if so have found a food and we return true
			if(finder.loc.equals(this.foods[i])){
				this.finders = [new Finder(this.foods[i].x, this.foods[i].y, this.size, [], [random(255),random(255),random(255)])]
				this.hashMapFinders.clear()
				this.fastestRoutes.push(finder)
				this.foods.splice(i, 1);
				return true
			}
		} 
		return false;
	}
	//return true if the cell is empty
	cellIsEmpty(x, y, toAdd){
		let hashKey = makeKey(x, y)
		//if the key exists the cell isnt empty
		let finders = [...this.finders, ...toAdd]
		for(let f of finders){
			if(x == f.loc.x && y == f.loc.y){
				return false;
			}
		}
		if(this.hashMapFinders.get(hashKey) || 
		   this.hashMapWalls.get(hashKey) || 
		   (x >= this.bounds.x || y >= this.bounds.y || x <= 0 || y <= 0)){
			return false;
		} else {
			return true;
		}
	}

	updateFinders(){
			let findersToAdd = [];
			let i = this.finders.length - 1;
			while(i >= 0){
				let newFinder;
				let f = this.finders[i];
				let left = [f.loc.x - f.size, f.loc.y];
				let right = [f.loc.x + f.size, f.loc.y];
				let up = [f.loc.x, f.loc.y - this.size];
				let down = [f.loc.x, f.loc.y + this.size];
				let prev = [...f.prevPath]
				prev.push(f.loc.copy());
				if(this.cellIsEmpty(...left, findersToAdd)){
					newFinder = new Finder(...left, this.size, prev, [random(255),random(255),random(255)])
					if(this.foodIsFound(newFinder)){return}
					findersToAdd.push(newFinder)
				}
				if(this.cellIsEmpty(...right, findersToAdd)){
					newFinder = new Finder(...right, this.size, prev, [random(255),random(255),random(255)])
					if(this.foodIsFound(newFinder)){return}
					findersToAdd.push(newFinder)
				}
				if(this.cellIsEmpty(...up, findersToAdd)){
					newFinder = new Finder(...up, this.size, prev, [random(255),random(255),random(255)])
					if(this.foodIsFound(newFinder)){return}
					findersToAdd.push(newFinder)
				}
				if(this.cellIsEmpty(...down, findersToAdd)){
					newFinder = new Finder(...down, this.size, prev, [random(255),random(255),random(255)])
					if(this.foodIsFound(newFinder)){return}
					findersToAdd.push(newFinder)
				}

				//we save the old value of the finder before we kill it
				//we do this to fill the squares its already travelled 
				let hashKey = makeKey(f.loc.x, f.loc.y)
				if(!this.hashMapFinders.get(hashKey)){
					this.hashMapFinders.set(hashKey, f.loc.copy());
				}
				this.finders.splice(i,1)
				i--
			}
			this.finders = findersToAdd

			if (this.foods.length == 0 && this.finders.length > 0){
				this.foodFound = true;
			} 
		}
}
class Finder {
	constructor(x, y, s, prevPath, col){
		this.loc = createVector(x, y);
		this.size = s;
		this.color = col;
		this.prevPath = prevPath || [];
	};
	show(){
		fill(this.color)
		rectMode(CENTER)
		rect(this.loc.x, this.loc.y, this.size)
		rectMode(CORNER)
	}
}
class Wall extends Finder{
	constructor(x, y, s){
		super(x, y, s)
		this.loc = createVector(x, y)
		this.size = s
	}
}