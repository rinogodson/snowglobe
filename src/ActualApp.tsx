import { spring } from "motion";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Modal from "./Modal";
import { AnimatePresence } from "motion/react";
import { BadgePlus, Lightbulb, LightbulbOff, Snowflake } from "lucide-react";
import DecodeOREncode from "./services";

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

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

    do {
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
    } while (this.isPixelHardEnough(this.x, this.y));

    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = Math.random() * 2 + 0.8;
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  let name = queryParams.get("n");

  const isFlipped = useRef(false);

  const [flipped, setFlipped] = useState(false);
  const [showButton, setShowButton] = useState(true);

  const [snowCount, setSnowCount] = useState(2000);

  const [permission, setPermission] = useState(false);

  let noName = false;
  if (!name) {
    name = "SnowGlobe";
    noName = true;
  }
  if (name.length > 14) {
    name = name.slice(0, 14);
  }
  if (name != "SnowGlobe") name = DecodeOREncode(String(name));

  const canRef = useRef<HTMLCanvasElement | null>(null);
  const butRef = useRef<HTMLButtonElement>(null);

  const [fontLoaded, setFontLoaded] = useState(false);

  const snowflakes = useRef<SnowFlake[]>([]);

  useEffect(() => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS)
        .requestPermission !== "function"
    ) {
      setPermission(true);
    }
  }, []);

  useEffect(() => {
    if (!permission) return;
    const handleOr = (e: DeviceOrientationEvent) => {
      const beta = e.beta;
      if (beta === null) return;
      setShowButton((prev) => (prev ? false : prev));
      const isUpsideDown = beta < -20;
      const isUpright = beta > 30;
      if (isUpsideDown && !isFlipped.current) {
        isFlipped.current = true;
        snowflakes.current.forEach((f: SnowFlake) => {
          f.vx += (Math.random() - 0.5) * 15;
          f.vy += (Math.random() - 0.5) * 15;
        });
      } else if (isUpright && isFlipped.current) {
        isFlipped.current = false;
        snowflakes.current.forEach((f: SnowFlake) => {
          f.vx += (Math.random() - 0.5) * 15;
          f.vy += (Math.random() - 0.5) * 15;
        });
      }
    };

    window.addEventListener("deviceorientation", handleOr);
    return () => {
      window.removeEventListener("deviceorientation", handleOr);
    };
  }, [permission]);

  const handleRequestPermission = async () => {
    if (
      typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS)
        .requestPermission === "function"
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const permissionState = await (
          DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
        ).requestPermission();
        if (permissionState === "granted") {
          setPermission(true);
          setShowButton(false);
        } else {
          alert("Permission denied. You can still tap the button manually.");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setPermission(true);
    }
  };

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!canRef.current) return;
    if (!butRef.current) return;
    if (!fontLoaded) return;
    const canvas = canRef.current;
    const ctx = canRef.current?.getContext("2d");
    if (!ctx) return;
    const btn = butRef.current;

    const SNOW_COUNT = snowCount;

    const gravity = 0.2;

    const collCanva = document.createElement("canvas");
    const fixedWidth = 800;

    const snowman = new Image();
    snowman.src = "/snowman.webp";
    const ig = new Image();
    ig.src = "/ig.webp";
    const base = new Image();
    base.src = "/base.webp";

    const MULT = 1;

    canvas.width = fixedWidth * MULT;
    canvas.height = fixedWidth * MULT;

    collCanva.width = canvas.width;
    collCanva.height = canvas.height;

    const cCtx = collCanva.getContext("2d");

    const fontSize = Math.min(canvas.width * 0.1, 120);
    let collisionData: ImageDataArray;

    const initCollisionMap = () => {
      if (!cCtx) return;
      cCtx?.clearRect(0, 0, canvas.width, canvas.height);

      const baseW = canvas.width;
      cCtx.drawImage(
        base,
        canvas.width / 2 - baseW / 2,
        canvas.height - baseW * (base.height / base.width) + 30,
        baseW,
        baseW * (base.height / base.width),
      );

      cCtx.textAlign = "center";
      cCtx.font = `900 ${fontSize}px "DynaPuff"`;
      cCtx.fillStyle = "white";
      cCtx.textBaseline = "middle";
      cCtx.fillText(String(name), canvas.width / 2, canvas.height / 2 - 120);

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

    base.onload = () => {
      initCollisionMap();
      for (let i = 0; i < SNOW_COUNT; i++) {
        snowflakes.current.push(
          new SnowFlake(
            canvas.width,
            gravity,
            isPixelHardEnough,
            () => ctx,
            () => isFlipped.current,
          ),
        );
      }

      animate();
    };

    const handleBtn = () => {
      isFlipped.current = !isFlipped.current;
      if (!permission) {
        handleRequestPermission();
        return;
      }
      setFlipped(isFlipped.current);
      snowflakes.current.forEach((f) => {
        f.vx += (Math.random() - 0.5) * 15;
        f.vy += (Math.random() - 0.5) * 15;
      });
    };

    btn.addEventListener("click", handleBtn);

    let animationFrameId: number;

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#41648A";
      ctx.lineWidth = 12;
      ctx.strokeText(String(name), canvas.width / 2, canvas.height / 2 - 120);

      ctx.textAlign = "center";
      ctx.fillStyle = "#E7EDEF";
      ctx.font = `900 ${fontSize}px "DynaPuff"`;
      ctx.textBaseline = "middle";
      ctx.fillText(String(name), canvas.width / 2, canvas.height / 2 - 120);

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

      snowflakes.current.forEach((flake) => {
        flake.update();
        flake.draw();
      });

      const baseW = canvas.width;
      ctx.drawImage(
        base,
        canvas.width / 2 - baseW / 2,
        canvas.height - baseW * (base.height / base.width) + 30,
        baseW,
        baseW * (base.height / base.width),
      );

      const igW = 300;
      ctx.drawImage(
        ig,
        canvas.width / 2 - igW + 40,
        canvas.height - igW * (ig.height / ig.width) - 180,
        igW,
        igW * (ig.height / ig.width),
      );

      const snowmanW = 250;
      ctx.drawImage(
        snowman,
        canvas.width / 2 + snowmanW / 7,
        canvas.height - snowmanW * (snowman.height / snowman.width) - 120,
        snowmanW,
        snowmanW * (snowman.height / snowman.width),
      );

      ctx.restore();

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      snowflakes.current = [];
      btn.removeEventListener("click", handleBtn);
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontLoaded, name, snowCount]);

  const [showModal, setShowModal] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="w-screen flex justify-center overflow-hidden flex-col items-center h-svh relative bg-[#0b0b0b] z-0 text-white">
      <p className="absolute bottom-30 sm:hidden right-[50%] translate-x-[50%] w-fit">
        Try Flipping your phone.
      </p>
      <img
        src="/wish.svg"
        className="absolute top-10 h-27 sm:h-40 sm:top-auto sm:bottom-10 sm:right-10"
      />
      <button
        onClick={() => setShowVideo(!showVideo)}
        className="absolute sm:top-10 top-auto bottom-10 right-auto left-10 sm:right-10 sm:bottom-auto sm:left-auto cursor-pointer active:scale-96 rounded-full p-3 bg-white/10 backdrop-blur-sm shadow-[inset_0_1px_1px_1px_rgba(255,255,255,0.2),0_1px_3px_1px_rgba(0,0,0,0.1)]"
      >
        {!showVideo ? <LightbulbOff size={35} /> : <Lightbulb size={35} />}
      </button>
      <div className="absolute bottom-10 right-8 sm:left-8 sm:right-auto flex gap-2">
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0, scaleX: 0.5 }}
              animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
              className="absolute right-0 p-2 sm:origin-bottom-left origin-bottom-right flex justify-center items-center flex-col gap-1 sm:right-auto bottom-0 h-20 w-50 -translate-y-full z-1000 bg-green-700 rounded-2xl shadow-[inset_0_1px_1px_1px_rgba(255,255,255,0.2),0_1px_3px_1px_rgba(0,0,0,0.1)]"
            >
              <p>Snow Flakes Count</p>
              <div className="w-full h-1/2 bg-white/10 grid grid-cols-3 border border-white/20 rounded-full overflow-hidden">
                <div
                  style={{
                    background:
                      snowCount === 1000 ? "rgba(255, 255, 255, 0.5)" : "none",
                  }}
                  className="w-full h-full flex justify-center items-center font-bold"
                  onClick={() => {
                    setSnowCount(1000);
                  }}
                >
                  1000
                </div>
                <div
                  style={{
                    background:
                      snowCount === 2000 ? "rgba(255, 255, 255, 0.5)" : "none",
                  }}
                  className="w-full h-full flex justify-center items-center font-bold"
                  onClick={() => {
                    setSnowCount(2000);
                  }}
                >
                  2000
                </div>
                <div
                  style={{
                    background:
                      snowCount === 5000 ? "rgba(255, 255, 255, 0.5)" : "none",
                  }}
                  className="w-full h-full flex justify-center items-center font-bold"
                  onClick={() => {
                    setSnowCount(5000);
                  }}
                >
                  5000
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="cursor-pointer hidden sm:flex active:scale-96 rounded-full p-3 bg-green-800 shadow-[inset_0_1px_1px_1px_rgba(255,255,255,0.2),0_1px_3px_1px_rgba(0,0,0,0.1)]"
        >
          <Snowflake size={35} className={showSettings ? "animate-spin" : ""} />
        </button>
        {noName && (
          <button
            onClick={() => setShowModal(!showModal)}
            className="cursor-pointer active:scale-96 rounded-full p-3 bg-red-500 shadow-[inset_0_1px_1px_1px_rgba(255,255,255,0.2),0_1px_3px_1px_rgba(0,0,0,0.1)]"
          >
            <BadgePlus size={35} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {showModal && <Modal setFn={setShowModal} />}
      </AnimatePresence>
      <div className="w-full max-w-[800px] aspect-square flex justify-center items-center overflow-hidden">
        <div className="relative w-9/10 sm:w-3/4 rounded-full aspect-square shadow-[inset_0_20px_20px_-10px_rgba(255,255,255,0.9),inset_20px_0_40px_rgba(255,255,255,0.4),inset_-20px_-30px_40px_rgba(50,0,0,0.1),inset_0_-2px_10px_rgba(255,255,255,0.3),inset_0_0_50px_20px_rgba(0,0,0,0.5),inset_50px_100px_50px_20px_rgba(255,255,255,0.3),inset_-50px_-100px_50px_20px_rgba(0,0,0,0.1),inset_0_0_200px_0px_rgba(200,200,255,0.5)]">
          <canvas
            style={{
              rotate: flipped ? "180deg" : "0deg",
              transition: "all " + spring(0.5, 0.2),
            }}
            className="transition-all z-100 sm:saturate-100 saturate-150 absolute bg-white/10 duration-500 ease-in w-full aspect-square backdrop-contrast-125 border-4 border-white/50 rounded-full  "
            ref={canRef}
          ></canvas>
          <div
            style={{ rotate: flipped ? "180deg" : "0deg" }}
            className="w-full aspect-square absolute inset-0 rounded-full backdrop-blur-sm mask-[radial-gradient(circle,rgba(0,0,0,0)0%,rgba(0,0,0,1)66%)]"
          ></div>
          <div
            style={{ rotate: flipped ? "180deg" : "0deg" }}
            className="w-full aspect-square border-2 border-white/30 absolute z-100 inset-0 rounded-full backdrop-blur-[10px] backdrop-contrast-130 backdrop-saturate-200 mask-[radial-gradient(circle,rgba(0,0,0,0)0%,rgba(0,0,0,1)90%)] sm:mask-[radial-gradient(circle,rgba(0,0,0,0)0%,rgba(0,0,0,1)90%)]"
          ></div>
        </div>
      </div>
      {showButton && (
        <button
          ref={butRef}
          className="cursor-pointer bg-blue-600 sm:flex font-bold border-2 border-white/15 active:bg-blue-500 text-white  text-3xl rounded-full"
        >
          <p className="px-6 py-3 w-full h-full transition-all duration-200">
            Flip SnowGlobe
          </p>
        </button>
      )}
      {showVideo && (
        <video
          src="/bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute sm:brightness-90 brightness-80 h-full sm:w-full -z-1 object-cover "
        />
      )}
      <div
        style={{
          fontFamily: '"DynaPuff"',
          fontWeight: 900,
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        AVOID LOOKING AT THIS PART OF MY CODE! THIS IS A DUMB Text to Force
        FontLoad
      </div>
    </div>
  );
};

export default TheActualApp;
