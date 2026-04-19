import { useEffect, useRef } from "react";

/**
 * Bayer-dithered animated payment-stream canvas.
 * Visual signature for the hero — flowing waves modulated by a 4x4 Bayer matrix
 * to evoke the reference's grainy monochrome aesthetic without copying it.
 */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function DitherCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const PIXEL = 4 * dpr; // dither cell size

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      const cols = Math.ceil(w / PIXEL);
      const rows = Math.ceil(h / PIXEL);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = x / cols;
          const ny = y / rows;

          // Three flowing waves — a payment "stream"
          const w1 = Math.sin(nx * 6 + t * 0.6) * 0.5 + 0.5;
          const w2 = Math.sin(nx * 3 - t * 0.4 + ny * 4) * 0.5 + 0.5;
          const w3 = Math.cos((nx - 0.5) * 8 + t * 0.3) * Math.exp(-Math.abs(ny - 0.5) * 3);

          // Vignette edges
          const edge = Math.pow(1 - Math.abs(ny - 0.5) * 1.6, 1.5);

          let v = (w1 * 0.4 + w2 * 0.35 + Math.abs(w3) * 0.25) * Math.max(0, edge);
          // Side fade
          v *= 0.4 + 0.6 * Math.sin(nx * Math.PI);

          const threshold = BAYER[y % 4][x % 4] / 16;
          const lit = v > threshold + 0.18;

          if (lit) {
            const a = Math.min(1, (v - threshold) * 1.4);
            ctx.fillStyle = `rgba(250,250,250,${a * 0.55})`;
            ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
          }
        }
      }

      t += 0.018;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
