/**
 * Hand-drawn approaches-per-day bar chart on a <canvas> — no chart library.
 * Each bar stacks the potentially-hazardous count (red) under the rest
 * (page accent). Redraws crisply on window resize and at any device pixel
 * ratio. Colors are read from CSS custom properties at draw time, so the
 * per-page accent theme applies automatically.
 */
export class ApproachChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.data = null;

    window.addEventListener("resize", () => {
      if (this.data) requestAnimationFrame(() => this.#draw());
    });
  }

  /**
   * @param {import("./models.js").Asteroid[]} asteroids
   * @param {string} startIso YYYY-MM-DD (inclusive)
   * @param {string} endIso   YYYY-MM-DD (inclusive)
   */
  render(asteroids, startIso, endIso) {
    this.data = { asteroids, startIso, endIso };
    this.#draw();
  }

  #days(startIso, endIso) {
    const out = [];
    const d = new Date(`${startIso}T00:00:00Z`);
    const end = new Date(`${endIso}T00:00:00Z`);
    while (d <= end && out.length < 14) {
      out.push(d.toISOString().slice(0, 10));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return out;
  }

  #css(name, fallback) {
    return getComputedStyle(document.body).getPropertyValue(name).trim() || fallback;
  }

  #draw() {
    const { asteroids, startIso, endIso } = this.data;
    const { ctx, canvas } = this;

    // Crisp rendering at any zoom/screen density.
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const days = this.#days(startIso, endIso);
    const byDay = new Map(days.map((d) => [d, { total: 0, hazard: 0 }]));
    for (const a of asteroids) {
      const bucket = byDay.get(a.approachDate);
      if (bucket) {
        bucket.total++;
        if (a.isHazardous) bucket.hazard++;
      }
    }

    const accent = this.#css("--accent", "#b08cff");
    const danger = this.#css("--danger", "#ff5a5a");
    const muted = this.#css("--muted", "#a9a2c8");

    const pad = { top: 24, right: 8, bottom: 22, left: 8 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const stepX = plotW / days.length;
    const barW = Math.min(46, stepX * 0.55);
    const max = Math.max(1, ...[...byDay.values()].map((c) => c.total));

    // Baseline
    ctx.strokeStyle = "rgba(150, 120, 230, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH + 0.5);
    ctx.lineTo(w - pad.right, pad.top + plotH + 0.5);
    ctx.stroke();

    ctx.textAlign = "center";
    days.forEach((day, i) => {
      const { total, hazard } = byDay.get(day);
      const cx = pad.left + stepX * (i + 0.5);
      const x = cx - barW / 2;
      const hHaz = (hazard / max) * plotH;
      const hSafe = ((total - hazard) / max) * plotH;
      const yTop = pad.top + plotH - hHaz - hSafe;

      // Stacked bar: hazardous slice sits on the baseline, the rest above it.
      if (hSafe > 0) {
        ctx.fillStyle = accent;
        ctx.fillRect(x, yTop, barW, hSafe);
      }
      if (hHaz > 0) {
        ctx.fillStyle = danger;
        ctx.fillRect(x, pad.top + plotH - hHaz, barW, hHaz);
      }

      // Count above the bar, date label below the baseline.
      if (total > 0) {
        ctx.fillStyle = "#e8ecf5";
        ctx.font = "600 11px system-ui, sans-serif";
        ctx.fillText(String(total), cx, yTop - 5);
      }
      ctx.fillStyle = muted;
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText(day.slice(5), cx, pad.top + plotH + 14);
    });

    // Tiny legend, top-right.
    ctx.textAlign = "right";
    ctx.font = "10px system-ui, sans-serif";
    const legendY = 10;
    ctx.fillStyle = muted;
    ctx.fillText("hazardous", w - pad.right, legendY);
    ctx.fillStyle = danger;
    ctx.fillRect(w - pad.right - 60, legendY - 7, 8, 8);
    ctx.fillStyle = muted;
    ctx.fillText("all", w - pad.right - 70, legendY);
    ctx.fillStyle = accent;
    ctx.fillRect(w - pad.right - 92, legendY - 7, 8, 8);
  }
}
