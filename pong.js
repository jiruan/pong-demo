//NOTE: grid exists on quadrant 4 with y inverted from negative to positive

// constants
const canvas = document.querySelector(".pong");
const ctx = canvas.getContext("2d");

const height = canvas.height = window.innerHeight;
const width = canvas.width = window.innerWidth;

const acceleration = 0.0;
const boundary = 20;
const maxSpeed = 9;

const paddleWidth = 100;
const paddleHeight = 10;

const reactionBoundary = height / 2;

const disableAI = false;
const DEBUG = false;

//declarations

function randomNum(num) {
    let absSpeed = 0;

    while(absSpeed === 0) {
        absSpeed = Math.random() * num; 
    }

    if(Math.random() > 0.5) {
        return absSpeed;
    } else {
        return -1 * absSpeed;
    }
}

function calculateOtherSpeed(speed) {
    let absSpeed = Math.sqrt(maxSpeed * maxSpeed - speed * speed);

    if(Math.random() > 0.5) {
        return absSpeed;
    } else {
        return -1 * absSpeed;
    }
}

function quadraticEquation(a, b, c) {
    let b2_4ac = b * b - 4 * a * c;
    let a2 = 2 * a;
    let negB = -b;

    if(b2_4ac < 0) {
        return null;
    }

    let midSqrt = Math.sqrt(b2_4ac);

    return [negB + (midSqrt / a2), negB - (midSqrt / a2)];
}

class Ball {
    constructor() {
        this.x = width /  2;
        this.y = height / 2;
        this.size = 10;
        this.color = "rgb(0, 0, 255)";
        this.xVel = randomNum(maxSpeed);
        this.yVel = calculateOtherSpeed(this.xVel);
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.xVel = randomNum(maxSpeed);
        this.yVel = calculateOtherSpeed(this.xVel);
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Paddle {
   constructor(y) {
    this.height = paddleHeight;
    this.width = paddleWidth;
    this.x = width / 2 - this.width;
    this.y = y - this.height;
    this.color = 'rgb(255, 255, 255)';

    this.step = 30;

    this.halfWidth = this.width / 2;

    this.halfHeight = this.height / 2;
    this.midY = this.y + this.halfHeight;

    this.move = this.move.bind(this);
    this.addControl = this.addControl.bind(this);
   }

   draw() {
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
   }

   //these are for AI's
   moveLeft() {
        if(this.x > 0) {
            this.x -= this.step;
        }
   }

   moveRight() {
        if(this.x < (width - this.width)) {
            this.x += this.step;
        }
   }

   //this is for players
   move (e) {
        if(e.code == "ArrowLeft") {
            this.moveLeft();
        } else if(e.code == "ArrowRight") {
            this.moveRight();
        }
   }

   addControl() {        
        window.addEventListener("keydown", this.move, false);
   }
}

class midLine {
    constructor(dashLen) {
        this.dash = dashLen;
        this.color = 'rgb(255, 255, 255)';
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.setLineDash([this.dash, this.dash]);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }
}

class scoreDisplay {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(score) {
        let text = "score: " + score;

        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(text, this.x, this.y);
    }
}

//canvas is on the third quadrant
class Pong {
    constructor() {
        this.ball = new Ball();

        //AI paddle
        this.paddle1 = new Paddle(boundary);

        //player paddle
        this.paddle2 = new Paddle(height - boundary);

        this.score1 = 0;
        this.score2 = 0;

        this.scoreDisplay1 = new scoreDisplay(0, height / 2 - 50)
        this.scoreDisplay2 = new scoreDisplay(0, height / 2 + 50);

        this.paddle2.addControl();

        this.line = new midLine(5);

        this.loop = this.loop.bind(this);
    }

    boundaryCollision() {
        //AI lost
        if((this.ball.y + this.ball.size) >= height) {
            if(DEBUG) {
                if(this.ball.yVel > 0) {
                    this.ball.yVel = -(this.ball.yVel);
                }
            } else {
                this.score1 += 1;
                this.ball.reset();
            }
        }

        //player lost
        if((this.ball.y - this.ball.size) <= 0) {
            if(DEBUG) {
                if(this.ball.yVel < 0) {
                    this.ball.yVel = -(this.ball.yVel);
                }
            } else {
                this.score2 += 1;
                this.ball.reset();
            }
        }
    }

    paddleCollision() {
        if(Math.abs(this.paddle2.midY - (this.ball.y + this.ball.size)) <= this.paddle2.halfHeight) {
            if(this.ball.x > this.paddle2.x && this.ball.x < (this.paddle2.x + this.paddle2.width)) {
                this.ball.yVel = -(this.ball.yVel);
            }
        }

        if(Math.abs(this.paddle1.midY - (this.ball.y - this.ball.size)) <= this.paddle1.halfHeight ) {
            if(this.ball.x > this.paddle1.x && this.ball.x < (this.paddle1.x + this.paddle1.width)) {
                this.ball.yVel = -(this.ball.yVel);
            }
        }
    }

    sideWallCollision() {
        //collision with right wall
        if((this.ball.x + this.ball.size) >= width) {
            if(this.ball.xVel > 0) {
                this.ball.xVel = -(this.ball.xVel);
            }
        }

        // collision with left wall
        if((this.ball.x - this.ball.size) <= 0) {
            if(this.ball.xVel < 0) {
                this.ball.xVel = -(this.ball.xVel);
            }
        }
    }

    botReact() {
        if(disableAI) {
            return null;
        }

        let distanceToMove = 0;

        if(this.ball.y < reactionBoundary && this.ball.yVel < 0) {
            let distanceToBoundary = this.ball.y - boundary;
            let time = distanceToBoundary / -this.ball.yVel;

            if(acceleration != 0) {
                let times = quadraticEquation(acceleration / 2, -this.ball.yVel, -distanceToBoundary);

                if(times != null) {
                    let timeA = times[0];
                    let timeB = times[1];

                    time = timeA < 0 ? timeB : timeA;
                }
            }

            let predictedPos = this.ball.x + this.ball.xVel * time;

            if(predictedPos < 0) {
                predictedPos = -predictedPos;
            } else if(predictedPos > this.width) {
                predictedPos = width - (predictedPos - width);
            }

            let paddleMidX = this.paddle1.x + this.paddle1.halfWidth;

            distanceToMove = predictedPos - paddleMidX;
        }

        if(Math.abs(distanceToMove) > this.paddle1.halfWidth) {
            if(distanceToMove > 0) {
                this.paddle1.moveRight();
            } else if(distanceToMove < 0) {
                this.paddle1.moveLeft();
            }
        }
    }

    update() {
        this.ball.x += this.ball.xVel;
        this.ball.y += this.ball.yVel;

        if(this.ball.xVel >= 0 && this.ball.xVel < maxSpeed) {
            this.ball.xVel += acceleration;
        } else {
            this.ball.xVel -= acceleration;
        }

        if(this.ball.yVel >= 0 && this.ball.yVel < maxSpeed) {
            this.ball.yVel += acceleration;
        } else {
            this.ball.yVel -= acceleration;
        }
    }

    loop() {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, width, height);

        this.line.draw();
        this.scoreDisplay1.draw(this.score1);
        this.scoreDisplay2.draw(this.score2);

        this.ball.draw();
        this.boundaryCollision();
        this.paddleCollision();
        this.sideWallCollision();
        this.update();

        this.botReact();

        this.paddle1.draw();
        this.paddle2.draw();

        requestAnimationFrame(this.loop);
    }
}

const game = new Pong();
game.loop();
