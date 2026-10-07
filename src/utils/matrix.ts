/** Briefly rains green characters over the page. Click or press a key to stop early. */
let running = false;

export function startMatrix(durationMs = 7000) {
  if (running || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  running = true;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:90;pointer-events:none;width:100%;height:100%';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); running = false; return; }

  const size = 16;
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const glyphs = 'アイウエオカキクケコサシスセソ01{}[]<>/$#=+*';
  let drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * -40);
  const started = performance.now();

  const stop = () => {
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', stop);
    window.removeEventListener('pointerdown', stop);
    canvas.remove();
    running = false;
  };
  window.addEventListener('keydown', stop, { once: true });
  window.addEventListener('pointerdown', stop, { once: true });

  const frame = (now: number) => {
    if (!running) return;
    if (now - started > durationMs) return stop();
    ctx.fillStyle = 'rgba(3, 6, 10, 0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#39ff88';
    ctx.font = `${size}px ui-monospace, Menlo, monospace`;
    if (drops.length * size < canvas.width) drops = drops.concat(Array(5).fill(0));
    drops.forEach((y, i) => {
      ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size);
      drops[i] = y * size > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
    });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
