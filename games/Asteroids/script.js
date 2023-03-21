/*
*	OUTER SPACE SURVIVAL
*	Author: Evan Finnigan
*/

const screen_width = 800
const screen_height = 600

class Body {
	constructor(x, y, w, h, r, angle, speed, img, lifespan = -1) {
		this.lifespan=lifespan
		this.speed=speed
		this.angle=angle
		this.x=x
		this.y=y
		this.width=w
		this.height=h
		this.radius=r
		this.image= new Image()
		this.image.src = img
	}
	move(a) {
		this.x += this.speed * Math.cos(a * Math.PI / 180)
		if (this.x > screen_width + this.radius) this.x = 0 - this.radius
		if (this.x < 0 - this.radius) this.x = screen_width + this.radius
		this.y += this.speed * Math.sin(a * Math.PI / 180)
		if (this.y > screen_height + this.radius) this.y = 0 - this.radius
		if (this.y < 0 - this.radius) this.y = screen_height + this.radius
	}
}

class Ship extends Body {
	constructor(x, y, w, h, r, angle, direction, speed, max_speed, img) {
		super(x, y, w, h, r, angle, speed, img)
		this.direction = direction
		this.max_speed = max_speed
		this.canFire = true
	}
	shoot() {
		this.canFire = false
		let bx = ship.x + Math.cos((ship.angle-90) * Math.PI / 180) * ship.width/2
		let by = ship.y + Math.sin((ship.angle-90) * Math.PI / 180) * ship.height/2
		let b = new Body(bx, by, 32, 32,16, ship.angle-90, 10, 'images/bullet.png', 1.5)
		bullets.push(b)
	}
	
}

function distance_squared(a, b) {
	return (a.x - b.x)**2 + (a.y - b.y)**2
}


// Create the canvas
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")

canvas.width = screen_width
canvas.height = screen_height

ctx.fillStyle = "rgb(255,0,0)"
ctx.font = "100px 'Bungee'"
ctx.textAlign = "center"
ctx.textBaseline = "middle"

// Background image
var bgImage = new Image()
bgImage.src = "images/bg.png"

var rocks, ship, bullets;

function reset() {

	// Initialize Ship
	ship = new Ship(screen_width/2,screen_height/2,64,64,5,0,0,0,3,"images/ship.png")

	// Initialize Rocks
	rocks = []
	for (let i = 0; i < 6; i++) {
		rocks.push(new Body(Math.random()*screen_width,Math.random()*screen_height,64,64,32,Math.floor(Math.random()*360),1,'images/rock.png'))
		while (distance_squared(ship, rocks[i]) < 150**2) {
			rocks[i].x = Math.random()*screen_width
			rocks[i].y = Math.random()*screen_height
		}
	}

	bullets = []

}

// Handle keyboard controls
var keysDown = {}

addEventListener("keydown", function (e) {
	keysDown[e.key] = true
	if (e.key == ' ' && ship.canFire) {
		ship.shoot()
	}
}, false)

addEventListener("keyup", function (e) {
	delete keysDown[e.key]
	ship.canFire = true
}, false)


// Update game objects
function update(modifier) {

	// Update Ship
	if ('a' in keysDown || 'ArrowLeft' in keysDown) { // player holding left / a
		ship.angle -= 360 * modifier
		if (ship.angle < 0) ship.angle = 360
	}
	if ('d' in keysDown || 'ArrowRight' in keysDown) { // player holding right / d
		ship.angle += 360 * modifier
		if (ship.angle > 360) ship.angle = 0
	}
	if ('w' in keysDown || 'ArrowUp' in keysDown) { // player holding right / d
		ship.speed += 60 * modifier
		if (ship.speed > ship.max_speed) ship.speed = ship.max_speed
		ship.direction = ship.angle
	}
	if ('s' in keysDown || 'ArrowDown' in keysDown) { // player holding right / d
		ship.speed -= 30 * modifier
		if (ship.speed < -ship.max_speed/2) ship.speed = -ship.max_speed/2
		ship.direction = ship.angle
	}

	ship.move(ship.direction - 90)
	if (ship.speed > 0.2) ship.speed -= 0.02
	if (ship.speed < -0.2) ship.speed += 0.02
	if (ship.speed >= -0.2 && ship.speed <= 0.2) ship.speed = 0

	// Update Rocks
	for (let rock of rocks) {
		if (distance_squared(rock,ship) < 42**2) {
			reset()
			break
		}
		rock.move(rock.angle)
	}

	// Update Bullets
	for (let i = bullets.length - 1; i >= 0; i--) {
		bullets[i].lifespan -= modifier
		if (bullets[i].lifespan < 0) {
			bullets.splice(i,1)
			continue
		}
		bullets[i].move(bullets[i].angle)
	}

	// Check for bullet-rock collisions
	for (let i = bullets.length - 1; i >= 0; i--) {
		let collision = false
		for (let j = rocks.length - 1; j >= 0; j--) {
			if (distance_squared(bullets[i], rocks[j]) < (bullets[i].radius + rocks[j].radius)**2) {
				collision = true
				if (rocks[j].radius >= 16) {
					let new_rock_1 = new Body(rocks[j].x,rocks[j].y,rocks[j].width/2,rocks[j].height/2,rocks[j].radius/2,rocks[j].angle+20,rocks[j].speed+1,'images/rock.png')
					let new_rock_2 = new Body(rocks[j].x,rocks[j].y,rocks[j].width/2,rocks[j].height/2,rocks[j].radius/2,rocks[j].angle-20,rocks[j].speed+1,'images/rock.png')
					rocks.push(new_rock_1)
					rocks.push(new_rock_2)
				}
				rocks.splice(j,1)
				break
			}
		}
		if (collision) {
			bullets.splice(i,1)
			break
		}
	}
}


hue = 0
function render(modifier) {

	ctx.filter = `hue-rotate(${hue}deg)`
	hue += 0.1
	if (hue > 360) hue = 0
	
	// Draw Background
	ctx.drawImage(bgImage, 0, 0, screen_width, screen_height)

	// Win?
	if (rocks.length == 0) {
		ctx.fillText("YOU WIN", screen_width / 2, screen_height / 2)
	}

	// Draw Ship (center image)
	ctx.save()
	ctx.translate(ship.x, ship.y)
	ctx.rotate(ship.angle * Math.PI / 180)
	ctx.translate(-ship.x, -ship.y)
	ctx.drawImage(ship.image, ship.x - ship.width/2, ship.y - 2*ship.height/3, 64, 64)
	ctx.restore()

	// Draw bullets
	for (let bullet of bullets) {
		ctx.drawImage(bullet.image, bullet.x - bullet.width/2, bullet.y - bullet.height/2)
	}
	
	// Draw Rocks
	for (let rock of rocks) {
		ctx.save()
		ctx.filter = `hue-rotate(${rock.angle}deg)`
		ctx.drawImage(rock.image, rock.x - rock.width/2, rock.y - rock.height/2, rock.width, rock.height)
		ctx.restore()
	}
}

var then = Date.now()
// The main game loop
function main() {
	let now = Date.now()
	delta = now - then
	update(delta/1000)
	render(delta/1000)
	then = now
	
	// Request to do this again ASAP
	requestAnimationFrame(main)
}

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame
reset()
main()
