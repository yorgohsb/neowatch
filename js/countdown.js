/**
 * Live countdown to a fixed future moment, rendered into <span data-unit="…">
 * slots (d/h/m/s) inside the given element. Ticks once per second.
 */
export class Countdown {
  constructor(el, targetIso) {
    this.el = el;
    this.target = new Date(targetIso);
    this.units = {};
    for (const span of el.querySelectorAll("[data-unit]")) {
      this.units[span.dataset.unit] = span;
    }
  }

  start() {
    this.#tick();
    this.timer = setInterval(() => this.#tick(), 1000);
  }

  #tick() {
    const ms = this.target - new Date();
    if (ms <= 0) {
      clearInterval(this.timer);
      this.#set({ d: "0", h: "00", m: "00", s: "00" });
      return;
    }
    this.#set({
      d: String(Math.floor(ms / 86400000)),
      h: String(Math.floor(ms / 3600000) % 24).padStart(2, "0"),
      m: String(Math.floor(ms / 60000) % 60).padStart(2, "0"),
      s: String(Math.floor(ms / 1000) % 60).padStart(2, "0"),
    });
  }

  #set(values) {
    for (const [unit, value] of Object.entries(values)) {
      if (this.units[unit]) this.units[unit].textContent = value;
    }
  }
}
