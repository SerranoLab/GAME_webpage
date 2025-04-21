// script.js

// 1) Canvas setup
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

// 2) Game state
let score = 0;
let gameFrame = 0;
ctx.font = "50px Georgia";

// 3) Mouse interactivity
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  click: false
};
canvas.addEventListener("mousemove", (e) => {
  mouse.click = true;
  mouse.x = e.clientX - canvasPosition.left;
  mouse.y = e.clientY - canvasPosition.top;
});
window.addEventListener("mouseup", () => (mouse.click = false));
window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
  mouse.x = canvas.width / 2;
  mouse.y = canvas.height / 2;
});

// 4) Load player sprites and compute frame size
const playerLeft = new Image();
const playerRight = new Image();
playerLeft.src = "https://i.ibb.co/1Gv8LCvH/zebrafish-left.png";
playerRight.src = "https://i.ibb.co/B2fHC3RD/zebrafish-right.png";

// grid dimensions
const COLS = 4,
  ROWS = 3,
  TOTAL_FRAMES = COLS * ROWS;

let SPRITE_W, SPRITE_H;
playerLeft.onload = () => {
  SPRITE_W = playerLeft.naturalWidth / COLS; // ~639/4 = 159.75
  SPRITE_H = playerLeft.naturalHeight / ROWS; // ~153/3 = 51
};

// 5) Player class
class Player {
  constructor() {
    this.x = canvas.width;
    this.y = canvas.height / 2;
    this.radius = 50;
    this.angle = 0;
    this.frame = 0;
  }
  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    if (mouse.x !== this.x) this.x -= dx / 20;
    if (mouse.y !== this.y) this.y -= dy / 20;
    // clamp
    this.x = Math.max(0, Math.min(canvas.width, this.x));
    this.y = Math.max(50, Math.min(canvas.height, this.y));
    this.angle = Math.atan2(dy, dx);
  }
  draw() {
    if (!SPRITE_W || !SPRITE_H) return; // wait until loaded

    // optional line if clicking
    if (mouse.click) {
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }

    // advance frame
    if (gameFrame % 10 === 0) {
      this.frame = (this.frame + 1) % TOTAL_FRAMES;
    }
    const frameX = this.frame % COLS;
    const frameY = Math.floor(this.frame / COLS);

    // destination dimensions
    const dw = SPRITE_W * 0.8,
      dh = SPRITE_H * 0.8,
      dx = -dw / 2,
      dy = -dh / 2;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const sheet = this.x >= mouse.x ? playerLeft : playerRight;
    ctx.drawImage(
      sheet,
      Math.floor(frameX * SPRITE_W),
      Math.floor(frameY * SPRITE_H),
      Math.ceil(SPRITE_W),
      Math.ceil(SPRITE_H),
      dx,
      dy,
      dw,
      dh
    );

    ctx.restore();
  }
}
const player = new Player();

// 6) Bubbles, patched pop logic
// Bubbles
const bubblesArray = [];
const bubble = new Image();
bubble.src = 'https://i.ibb.co/ZX3thkw/pop2.png';
class Bubble {
    constructor(){
        this.x = Math.random() * canvas.width;
        this.y = 0 - 50 - Math.random() * canvas.height/2;
        this.radius = 50;
        this.speed = Math.random() * -5 + -1;
        this.distance;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
        this.counted = false;
        this.frameX = 0;
        this.spriteWidth = 91;
        this.spriteHeight = 91;
        this.pop = false;
        this.counted = false;
    }
    update(){
        this.y -= this.speed
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx * dx + dy * dy);
    }
    draw(){
      /*
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();*/
        ctx.drawImage(bubble, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x - 68, this.y - 68, this.spriteWidth*1.5, this.spriteHeight*1.5);
    }
}
function handleBubbles(){
    for (let i = 0; i < bubblesArray.length; i++){
        if (bubblesArray[i].y > canvas.height * 2){
            bubblesArray.splice(i, 1);
        }
    }
    for (let i = 0; i < bubblesArray.length; i++){
        if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius){
            popAndRemove(i);
        }
    }
    for (let i = 0; i < bubblesArray.length; i++){
        bubblesArray[i].update();
        bubblesArray[i].draw();
    }
    if (gameFrame % 50 == 0) {
        bubblesArray.push(new Bubble());

    }
}
function popAndRemove(i){
    if (bubblesArray[i]) {
        if (!bubblesArray[i].counted) score++;
        bubblesArray[i].counted = true;
        bubblesArray[i].frameX++;
        if (bubblesArray[i].frameX > 7) bubblesArray[i].pop = true;
        if (bubblesArray[i].pop) bubblesArray.splice(i, 1);
        requestAnimationFrame(popAndRemove);
    }

}


// 7) Bubble text (unchanged)
let bubbleTextArray = [];
let adjustX = -6,
  adjustY = -3;
ctx.fillStyle = "white";
ctx.font = "10px Verdana";
ctx.fillText("Serrano Lab", 20, 42);
const textCoordinates = ctx.getImageData(0, 0, 100, 100);

class Particle2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 7;
    this.baseX = x;
    this.baseY = y;
    this.density = Math.random() * 15 + 1;
    this.distance = 0;
  }
  draw() {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(34,147,214,1)";
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.beginPath();
    if (this.distance < 50) {
      this.size = 14;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(this.x + 4, this.y - 4, this.size / 3, 0, Math.PI * 2);
      ctx.arc(this.x - 6, this.y - 6, this.size / 5, 0, Math.PI * 2);
    } else if (this.distance <= 80) {
      this.size = 8;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(this.x + 3, this.y - 3, this.size / 2.5, 0, Math.PI * 2);
      ctx.arc(this.x - 4, this.y - 4, this.size / 4.5, 0, Math.PI * 2);
    } else {
      this.size = 5;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(this.x + 1, this.y - 1, this.size / 3, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.fill();
  }
  update() {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    this.distance = dist;
    const forceDirX = dx / dist,
      forceDirY = dy / dist;
    const maxDist = 100;
    const force = (maxDist - dist) / maxDist;
    const dirX = forceDirX * force * this.density;
    const dirY = forceDirY * force * this.density;
    if (dist < 100) {
      this.x -= dirX;
      this.y -= dirY;
    } else {
      if (this.x !== this.baseX) {
        const dx0 = this.x - this.baseX;
        this.x -= dx0 / 20;
      }
      if (this.y !== this.baseY) {
        const dy0 = this.y - this.baseY;
        this.y -= dy0 / 20;
      }
    }
  }
}

function init2() {
  bubbleTextArray = [];
  for (let y = 0; y < textCoordinates.height; y++) {
    for (let x = 0; x < textCoordinates.width; x++) {
      if (
        textCoordinates.data[y * 4 * textCoordinates.width + x * 4 + 3] > 128
      ) {
        bubbleTextArray.push(
          new Particle2((x + adjustX) * 8, (y + adjustY) * 8)
        );
      }
    }
  }
}
init2();

// 8) Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // bubble text
  for (let p of bubbleTextArray) {
    p.draw();
    p.update();
  }

  // bubbles
  handleBubbles();

  // player
  player.update();
  player.draw();

  // score
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "20px Georgia";
  ctx.fillText(`score: ${score}`, 140, 335);

  gameFrame++;
  requestAnimationFrame(animate);
}
animate();
// … all your existing code above …

/**  Extra: Vignette overlay for focus & polish  **/
function drawVignette() {
  ctx.save();
  // center: transparent → edge: semi‑opaque black
  const vg = ctx.createRadialGradient(
    canvas.width/2, canvas.height/2, canvas.width*0.2,
    canvas.width/2, canvas.height/2, canvas.width*0.6
  );
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.4)');

  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

// Your existing animate()…
function animate(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1) bubble text
  for (let p of bubbleTextArray){
    p.draw();
    p.update();
  }

  // 2) bubbles
  handleBubbles();

  // 3) player
  player.update();
  player.draw();

  // 4) score
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '20px Georgia';
  ctx.fillText(`score: ${score}`, 140, 335);

  // 5) vignette overlay
  drawVignette();

  gameFrame++;
  requestAnimationFrame(animate);
}
animate();