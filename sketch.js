let firework = [];
let scenes = [];
let G;
let scene = 0;
let springy;
let avoiders = [];
let targets = [];
let followMe;
let pf;
function setup() {
 let canvas = createCanvas(innerWidth, innerHeight)

 G = createVector(0, 0.2);



//EXAMPLE 2
springy = new SpringyPendulum();

//EXAMPLE 3
	// target = new Target(200, 100)
	for(let i = 0; i < 10; i++){
		let v = new Vehicle(random(width),random(height))
		avoiders.push(v);
	}
	followMe = new Target(width/2, height/2, color(0, 255, 0))



 stroke(255, 0, 0)
 strokeWeight(4)
  pf = new Pathfinder()

 scenes.push(fireworkShow)
 scenes.push(pendulumShow)
 scenes.push(autonomousAgentsScene)
 scenes.push(pathfinderShow)

 //scene 4

}
const toggleSketch = on =>{
	if(on){
		loop()
		document.getElementsByTagName("BODY")[0].style.overflow = "hidden";
	} else {
		noLoop()
		document.getElementsByTagName("BODY")[0].style.overflow = "auto";
	}
}
function draw() {
	
	background(scene == 3 ? 255 : 0);
    manageScenes();
}


function keyPressed(){
	if(keyCode == 32){
		scene++
	}
	if(key == 'Control'){
		pf.addFinder(mouseX, mouseY)
	}
	if(key == 'f'){
		let coords = pf.getCellCoords(mouseX, mouseY)
		let food = createVector(coords.x, coords.y)
		food.keyName = makeKey(food.x, food.y)
		pf.foods.push(food)
		pf.allFoods.push(food)
	}
	if(key == 'r'){
		pf = new Pathfinder()
	}
	if(key == 'k'){
		pf.generateRandomLevel()
	}
	if(key == 'ArrowLeft'){
		if(pf.size < 50){
			pf.size += 5
		}
	}
	if(key == 'ArrowRight'){
		if(pf.size >= 10){
			pf.size -= 5
		}
	}
}
function mouseDragged(){
	if(scene == 3){
		pf.addWall(mouseX, mouseY)
	}
}

const manageScenes = () => {

    if(scene > scenes.length - 1){
        scene = 0;
    }
    scenes[scene]();
	let txt;
	let col = 255;
	if(scene == 0){
		txt = "Hello, and welcome to my website! Click the space key to see all my different projects!"

	} else if (scene == 1){
		txt = 'Drag the bouncy pendulum!';

	} else if (scene == 2){
		txt = "Drag to add more planes!";

	} else if (scene == 3){
		txt =`Drag to add walls, click f whilst ur mouse is on a square to add a target, click ctrl on a square
		to start the path finding from that location, click R to reset and K to add random walls. Use the left and right arrow keys to adjust box size.`
		col = color(255, 0, 0)

	} else {
		col = 255
	}
	noStroke()
	fill(col)
	textAlign(CENTER);
	textSize(30);
	text(txt, 0, 20, width)

}
const pathfinderShow = () => {
	pf.run()
}

const pendulumShow = () => {
    springy.run()
}

const autonomousAgentsScene = () => {
    if(mouseIsPressed){
        if(avoiders.length < 50){
            avoiders.push(new Vehicle(mouseX, mouseY));
        }
    }
    if(frameCount % 60 == 0){
		if(targets.length < 100){
			targets.push(new Target(random(width),0, 255))
		}
		//every second +0.5 to their score
		avoiders.forEach(a => a.score += 0.1)
	}

	//if all avoiders die, we start the next generation
	if(avoiders.length == 0){
		for(let i = 0; i < 10; i++){
			avoiders.push(new Vehicle(random(width),random(height)));
		}
		targets = []
	}



	for(let i = 0; i < avoiders.length; i++){
		a = avoiders[i]
        let avoidThese = []
		targets.forEach(t => {
			//evade nearest object
			if(a.pos.dist(t.pos) < a.avoidDist){
                avoidThese.push(t)
			}
			//got killed
			if(a.pos.dist(t.pos) < a.r + t.r){

				avoiders.splice(i, 1)
			}
			//got disk
			if(a.pos.dist(followMe.pos) < a.r + followMe.r){
				followMe.pos = createVector(random(width), random(height))
				a.score += 2
			}
		})
        for(let thing of avoidThese){
            a.applyForce(a.evade(thing))
        }
		a.applyForce(a.pursue(followMe))
		a.update();
		a.show();
		a.edges();
	}
	targets.forEach(t =>{
		t.update();
		t.show();
		t.edges();
})
	followMe.update();
	followMe.show();
	followMe.bounce();

}
const avoidAll = () => {

	avoiders.forEach(avoider => {
		let closestPlaneIndex = undefined;
		let closestPlaneDist = Infinity;
		for(let i = 0; i < avoiders.length; i++){
			//we skip itself
			if(avoiders[i].pos.x == avoider.pos.x && avoiders[i].pos.y == avoider.pos.y){
				continue;
			} else {
				let thisDis = avoider.pos.dist(avoiders[i].pos)
				if(thisDis < closestPlaneDist){
					closestPlaneDist = thisDis;
					closestPlaneIndex = i;
				}
			}
		}
		let steering = avoider.evade(avoiders[closestPlaneIndex])
		avoider.applyForce(steering);
		avoider.update();
		avoider.show();
		avoider.edges();
	})
}
class Vehicle {
	constructor(x, y, color){
        if(~~random(1, 52) == 50 && !color){
            //spawn a super plane
            this.maxSpeed = 7;
            this.maxForce = 100;
            this.avoidDist = 100
            this.color = [0, 255, 0];
        } else {
            this.maxSpeed = random(1, 5);
            this.maxForce = random(0.1, 10);
            this.avoidDist = random(75, 120)
            this.color = color || [
                map(this.maxSpeed, 1, 5, 0, 255/3) +
                map(this.maxForce, 0.1, 10, 0, 255/3) +
                map(this.avoidDist, 75, 120, 0, 255/3)
                , 0,
                0
              ]
        }


		this.pos = createVector(x, y);
		this.vel = createVector(1, 0);
		this.acc = createVector(0, 0);


        
        


		this.r = 16;
		this.wanderTheta = PI / 2;
		this.score = 0;
		this.fitness = 0;
	}
	wander(){
		let wanderPoint = this.vel.copy();
		wanderPoint.setMag(100);
		wanderPoint.add(this.pos);
		fill(255, 0, 0);
		circle(wanderPoint.x, wanderPoint.y, 16)

		let wanderRadius = 50;
		noFill();
		circle(wanderPoint.x, wanderPoint.y, wanderRadius * 2);

		line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);

		let theta = this.wanderTheta + this.vel.heading();
		let x = wanderRadius * cos(theta);
		let y = wanderRadius * sin(theta);
		fill(0, 255, 0);
		wanderPoint.add(x, y)
		circle(wanderPoint.x, wanderPoint.y, 16)

		line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);

		let steer = wanderPoint.sub(this.pos);
		steer.setMag(this.maxForce);
		this.applyForce(steer);

		let displaceRange = 0.3;
		this.wanderTheta += random(-displaceRange, displaceRange);
	}

	pursue(vehicle){
		 let target = vehicle.pos.copy();
		 let prediction = vehicle.vel.copy();
		 const framesAhead = 10;
		 prediction.mult(framesAhead);
		 target.add(prediction);

		// fill(0, 255, 0);
		// circle(target.x, target.y, 16);

		 return this.seek(target)

	}
	arrive(target){
		return this.seek(target, true);
	}
	evade(vehicle){
		let pursuit = this.pursue(vehicle);
		pursuit.mult(-1);
		return pursuit
	}
	seek(target, arrival = false){
		let force = p5.Vector.sub(target, this.pos);
		let desiredSpeed = this.maxSpeed;
		if(arrival){
			let slowRadius = 100;
			let distance = force.mag();
			if (distance < slowRadius){
				desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
			}
		}
		force.setMag(desiredSpeed);
		force.sub(this.vel);
		force.limit(this.maxForce);
		return force;
	}
	flee(target){
		return this.seek(target).mult(-1);
	}
	applyForce(force){
		this.acc.add(force);
	}
	update(){
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.mult(0)
	}
	show(){
		let r = this.r
		stroke(255);
		strokeWeight(2);
		fill(this.color);
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		triangle(-r, -r/2, -r, r/2, r, 0)
		pop();
	}
	edges(){
		if(this.pos.x > width){
			this.pos.x = 0;
		}
		if(this.pos.x < 0){
			this.pos.x = width;
		}
		if(this.pos.y > height){
			this.pos.y = 0;
		}
		if(this.pos.y < 0){
			this.pos.y = height;
		}
	}
}
class Target extends Vehicle{
	constructor(x,y, color){
		super(x,y, color);
		this.vel = p5.Vector.random2D();
		this.vel.mult(random(0.5, 2.5))
	}
	show(){
		stroke(255);
		strokeWeight(2);
		push();
		fill(this.color);
		translate(this.pos.x, this.pos.y);
		ellipse(0, 0, this.r*2);
		pop();
	}
    bounce(){
        if(this.pos.x - this.r < 0 || this.pos.x + this.r > width){
             this.vel.x *= -1;
            }

        if(this.pos.y - this.r < 0 || this.pos.y + this.r > height){
            this.vel.y *= -1;

        }

    }

}




class SpringyPendulum {
	constructor(){
		this.anchor = createVector(width/2, height/3);
		this.location = createVector();
		this.velocity = createVector(0, 0);
		this.restLength = 200;
		this.bob = createVector(width/2 + 100, height/2);
		// how springy is the spring
		this.k = 0.008;
		this.gravity = createVector(0, 0.2);
	}
	spring(){
		let force = p5.Vector.sub(this.bob, this.anchor);
		let x = force.mag() - this.restLength;
		force.normalize();
		force.mult(-1 * this.k * x);

		this.velocity.add(force);
		this.velocity.add(this.gravity)
		this.bob.add(this.velocity);
		this.velocity.mult(0.99);

		if(mouseIsPressed){
			this.bob.x = mouseX;
			this.bob.y = mouseY;
			this.velocity.set(0,0);
		}

	}
	display(){
		fill(244, 197, 45);
		stroke(255)
		strokeWeight(4)
		line(this.anchor.x, this.anchor.y, this.bob.x, this.bob.y);
        noStroke()
		circle(this.anchor.x, this.anchor.y, 32);
		circle(this.bob.x, this.bob.y, 64);
	}
	run(){
		this.display();
		this.spring();
	}
}




const fireworkShow = () => {
    for(let i = firework.length - 1; i >= 0; i--){
        let f = firework[i];
        f.update()
        f.show()
        if(f.done()){
            firework.splice(i, 1);
        }
    }

    if(random() < 0.05){
        firework.push(new Firework())
    }
}
class Firework{
    constructor(){
        this.firework = new Particle(random(width), height, true)
        this.particles = []
        this.exploded = false;
    }
    update(){
        if(!this.exploded){
            this.firework.update();
            this.firework.applyForce(G)
            if(this.firework.vel.y >= 0){
                this.exploded = true
                this.explode();
            }
        } else {
            this.particles.forEach(p=>{
                p.applyForce(G)
                p.show();
                p.update();
            })
        }
    }
    done(){
        return this.exploded && this.particles.length == 0
    }
    show(){
        if(!this.exploded){
            this.firework.show();
        } else {
            for(let i = this.particles.length - 1; i >= 0; i--){
                let f = this.particles[i];
                f.show();
                if(f.done()){
                    this.particles.splice(i, 1)
                }
            }
        }

    }
    explode(){
        for(var i = 0; i < 100; i++){
            let p = new Particle(this.firework.pos.x, this.firework.pos.y, false, this.firework.color);
            this.particles.push(p);
        }
    }
}


class Particle {
    constructor(x, y, firework, color){
        this.pos = createVector(x, y);
        this.vel = firework ? createVector(0, random(-10, -15)) : p5.Vector.random2D().mult(random(2, 10));
        this.acc = createVector(0, 0)
        this.firework = firework;
        this.lifespan = 255;
        this.color = firework ? [random(255), random(255), random(255)] : color

    }
    applyForce(force){
        this.acc.add(force)
    }
    show(){
        if(this.firework){
            strokeWeight(4);
            stroke(this.color);
        } else {
            strokeWeight(2);
            stroke(...this.color, this.lifespan);
        }
        point(this.pos.x, this.pos.y)
    }
    done(){
        return this.lifespan <= 0 
    }
    update(){
        if(!this.firework){
            this.lifespan -= 4
            this.vel.mult(0.9)
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0)
    }


}
