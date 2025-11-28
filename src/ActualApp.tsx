import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

class SnowFlake {
  private canvasSize: number;
  private getIsFlipped: () => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getCtx: () => any;
  private isPixelHardEnough: (x: number, y: number) => boolean;
  private x: number = 0;
  private y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  private radius: number = 0;
  private friction: number = 0;
  private gravity: number;

  constructor(
    canvasSize: number,
    gravity: number,
    isPixelHardEnough: (x: number, y: number) => boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCtx: () => any,
    getIsFlipped: () => boolean,
  ) {
    this.canvasSize = canvasSize;
    this.gravity = gravity;
    this.getIsFlipped = getIsFlipped;
    this.getCtx = getCtx;
    this.isPixelHardEnough = isPixelHardEnough;
    this.init(true);
  }

  init(randomY = false) {
    const size = this.canvasSize;
    const center = size / 2;
    const geometricRadius = size / 2;

    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * (geometricRadius - 10);

    this.x = center + r * Math.cos(angle);

    if (randomY) {
      this.y = center + r * Math.sin(angle);
    } else {
      this.y = this.getIsFlipped()
        ? center + geometricRadius - 20
        : center - geometricRadius + 20;
    }

    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = Math.random() * 2.5 + 1.5;
    this.friction = 0.98;
  }

  update() {
    const currentGravity = this.getIsFlipped() ? -this.gravity : this.gravity;
    const prevX = this.x;
    const prevY = this.y;

    this.vy += currentGravity;
    this.vx *= this.friction;
    this.vy *= this.friction;

    const nextX = this.x + this.vx;
    const nextY = this.y + this.vy;

    if (this.isPixelHardEnough(nextX, nextY)) {
      const canMoveX = !this.isPixelHardEnough(nextX, prevY);
      const canMoveY = !this.isPixelHardEnough(prevY, nextY);

      if (canMoveX && !canMoveY) {
        this.y = prevY;
        this.x = nextX;
        this.vy *= -0.2;
      } else if (canMoveY && !canMoveX) {
        this.x = prevX;
        this.y = nextY;
        this.vx += Math.random() - 0.5;
        this.vy *= -0.2;
      } else {
        this.x = prevX;
        this.y = prevY;
        this.vx *= -0.5;
        this.vy *= -0.5;
      }
    } else {
      this.x = nextX;
      this.y = nextY;
    }

    const center = this.canvasSize / 2;
    const geometricRadius = this.canvasSize / 2;
    const dx = this.x - center;
    const dy = this.y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist + this.radius > geometricRadius) {
      const nx = dx / dist;
      const ny = dy / dist;

      this.x = center + nx * (geometricRadius - this.radius);
      this.y = center + ny * (geometricRadius - this.radius);

      const dotProduct = this.vx * nx + this.vy * ny;
      this.vx = this.vx - 2 * dotProduct * nx;
      this.vy = this.vy - 2 * dotProduct * ny;

      this.vx *= 0.5;
      this.vy *= 0.5;
    }
  }

  draw() {
    const ctx = this.getCtx();
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();
  }
}

const TheActualApp = () => {
  const { name } = useParams();

  const canRef = useRef<HTMLCanvasElement | null>(null);
  const butRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!canRef.current) return;
    if (!canRef.current) return;
    if (!butRef.current) return;
    const canvas = canRef.current;
    const ctx = canRef.current?.getContext("2d");
    if (!ctx) return;
    const btn = butRef.current;

    const MULT = 1.1;
    canvas.width = canvas.clientWidth * MULT;
    canvas.height = canvas.clientHeight * MULT;

    const SNOW_COUNT = 1000;
    let isFlipped = false;
    const gravity = 0.15;

    const collCanva = document.createElement("canvas");

    collCanva.width = canvas.width;
    collCanva.height = canvas.height;

    const cCtx = collCanva.getContext("2d");

    let collisionData: ImageDataArray;

    const initCollisionMap = () => {
      if (!cCtx) return;
      cCtx?.clearRect(0, 0, canvas.width, canvas.height);
      cCtx.textAlign = "center";
      cCtx.font = `900 100px "DynaPuff"`;
      cCtx.fillStyle = "white";
      cCtx.fillText(String(name), canvas.width / 2, canvas.height / 2);

      const imageData = cCtx.getImageData(0, 0, canvas.width, canvas.height);
      collisionData = imageData.data;
    };

    const isPixelHardEnough = (x: number, y: number) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);

      if (ix < 0 || ix >= canvas.width || iy < 0 || iy >= canvas.height)
        return false;

      const index = (iy * canvas.width + ix) * 4 + 3;
      return collisionData[index] > 50;
    };

    initCollisionMap();
    const snowflakes: SnowFlake[] = [];
    for (let i = 0; i < SNOW_COUNT; i++) {
      snowflakes.push(
        new SnowFlake(
          canvas.width,
          gravity,
          isPixelHardEnough,
          () => ctx,
          () => isFlipped,
        ),
      );
    }

    btn.addEventListener("click", () => {
      isFlipped = !isFlipped;
      snowflakes.forEach((f) => {
        f.vx += (Math.random() - 0.5) * 15;
        f.vy += (Math.random() - 0.5) * 15;
      });
      canvas.style.transition = "transform 0.6s ease-in-out";
      canvas.style.transform = isFlipped ? "rotate(180deg)" : "rotate(0deg)";
    });

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";
      ctx.fillStyle = "#C1C7CD";
      ctx.font = `900 100px "DynaPuff"`;
      ctx.fillText(String(name), canvas.width / 2, canvas.height / 2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.width / 2,
        canvas.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.clip();

      snowflakes.forEach((flake) => {
        flake.update();
        flake.draw();
      });
      ctx.restore();

      requestAnimationFrame(animate);
    }
    animate();
  }, [name]);

  return (
    <div className="w-svw flex justify-center flex-col items-center h-svh relative bg-[#0b0b0b] z-0 text-white">
      <div className="w-200 aspect-square flex justify-center items-center overflow-hidden">
        <canvas
          className="transition-all duration-500 ease-in w-3/4 h-3/4 rounded-ful backdrop-blur-[10px] border-4 border-white/20 rounded-full  shadow-[inset_50px_100px_50px_20px_rgba(255,255,255,0.3),inset_-50px_-100px_50px_20px_rgba(0,0,0,0.1),inset_0_0_200px_0px_rgba(200,200,255,0.5)]"
          ref={canRef}
        ></canvas>
      </div>
      <button
        ref={butRef}
        className="bg-blue-600 font-bold border-2 border-white/15 active:bg-blue-500 text-white px-6 py-3 text-3xl rounded-full"
      >
        Flip {name ? name : "Globe"}
      </button>
      <video
        src="/bg.mp4"
        autoPlay
        muted
        loop
        className="absolute w-full -z-1"
      />
    </div>
  );
};

export default TheActualApp;
