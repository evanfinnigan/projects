/*
*	BRICK DESTROYER
*	Author: Evan Finnigan
*/

function rectCollision(ball, rect) {
	x_distance = Math.abs(ball.x - rect.x)
	y_distance = Math.abs(ball.y - rect.y)
	if (y_distance > rect.height/2 + ball.radius) return {collision: false}
	if (x_distance > rect.width/2 + ball.radius) return {collision: false}
	if (y_distance <= rect.height/2) return {collision: true, x:-1, y:1}
	if (x_distance <= rect.width/2) return {collision: true, x:1, y:-1}
	return {collision: false}
}

// Create the canvas
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")

canvas.width = 800
canvas.height = 600

ctx.fillStyle = "rgb(255,0,0)"
ctx.font = "100px 'Metal Mania'"
ctx.textAlign = "center"
ctx.textBaseline = "middle"


// Background image
var bgImage = new Image();
bgImage.src = "images/bg.png"

var bricks, paddle, ball;

function reset() {
	// Initialize Bricks
	bricks = []
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 5; j++) {
			let img = new Image()
			img.src = 'images/brick.png'
			bricks.push({
				row: i,
				col: j,
				image: img,
				x: 75 + 64 + j*128,
				y: 32 + i*64,
				width: 128,
				height: 64
			})
		}
	}

	// Initialize Paddle
	paddle = {
		x: 400, 
		y: 600 - 32,
		width: 256,
		height: 64,
		speed: 5,
		image: new Image()
	}
	paddle.image.src = "images/paddle.png"

	// Initialize Ball
	let speed = 3
	let angle = (45 + Math.floor(Math.random()*90)) * Math.PI / 180
	ball = {
		x: 400,
		y: 350,
		width: 64,
		height: 64,
		radius: 20,
		x_speed: speed * Math.cos(angle),
		y_speed: -speed * Math.sin(angle),
		image: new Image()
	}
	ball.image.src = "images/ball.png"
}

// Handle keyboard controls
var keysDown = {}

addEventListener("keydown", function (e) {
	keysDown[e.key] = true
}, false)

addEventListener("keyup", function (e) {
	delete keysDown[e.key]
}, false)


// Update game objects
function update(modifier) {


	if ('a' in keysDown || 'ArrowLeft' in keysDown) { // player holding left / a
		paddle.x -= paddle.speed
		if (paddle.x < -32) {
			paddle.x = -32
		}
	}
	if ('d' in keysDown || 'ArrowRight' in keysDown) { // player holding right / d
		paddle.x += paddle.speed
		if (paddle.x > 832) {
			paddle.x = 832
		}
	}

	// Detect Collisions & Update Bricks
	if (ball.x < ball.radius) {
		ball.x = ball.radius
		ball.x_speed = -ball.x_speed
	}

	if (ball.x > 800 - ball.radius) {
		ball.x = 800 - ball.radius
		ball.x_speed = -ball.x_speed
	}

	if (ball.y < ball.radius) {
		ball.y = ball.radius
		ball.y_speed = -ball.y_speed
	}

	if (ball.y > 600 - ball.radius) {
		reset()
	}

	for(let i = bricks.length - 1; i >= 0; i--) {
		r = rectCollision(ball, bricks[i])
		if (r.collision) {
			bricks.splice(i, 1)
			ball.x_speed *= r.x
			ball.y_speed *= r.y
			break
		}
	}

	r2 = rectCollision(ball, paddle)
	if (r2.collision) {
		ball.x_speed *= r2.x
		ball.y_speed *= r2.y
	}

	// Update Ball
	ball.x += ball.x_speed
	ball.y += ball.y_speed

}


hue = 0
function render(modifier) {

	ctx.filter = `hue-rotate(${hue}deg)`
	hue += 0.1
	if (hue > 360) hue = 0
	
	// Draw Background
	ctx.drawImage(bgImage, 0, 0)

	// Draw Ball (center image)
	ctx.drawImage(ball.image, ball.x - ball.width/2, ball.y - ball.height/2)

	// Draw Paddle
	ctx.drawImage(paddle.image, paddle.x - paddle.width/2, paddle.y - paddle.height/2)

	bricks.forEach(element => {
		ctx.drawImage(element.image, element.x - element.width/2, element.y - element.height/2)
	});

	if (bricks.length == 0) {
		ctx.fillText("YOU WIN", 400, 300)
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
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
reset()
main()