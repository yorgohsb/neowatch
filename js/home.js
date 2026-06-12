import { NeoApi } from "./api.js";
import { ApodApi } from "./apod.js";
import { Asteroid } from "./models.js";
import { CardGrid } from "./card-grid.js";
import { Watchlist } from "./watchlist.js";
import { Countdown } from "./countdown.js";

// Apophis close approach: 2029-04-13 21:46 UTC (per NASA/JPL).
const APOPHIS_FLYBY = "2029-04-13T21:46:00Z";

/**
 * Home page: a cinematic APOD hero plus a live preview of the closest asteroid
 * approaches happening today.
 */
class HomePage {
  constructor() {
    this.api = new NeoApi();
    this.apod = new ApodApi();
    this.grid = new CardGrid(document.querySelector("#featuredGrid"), {
      api: this.api,
      watchlist: new Watchlist(),
    });

    // Bound once so the retry button inside an error state works.
    this.grid.container.addEventListener("click", (e) => {
      if (e.target.matches("[data-retry]")) this.#loadFeatured();
    });
  }

  init() {
    this.#loadApod();
    this.#loadFeatured();
    new Countdown(document.querySelector("#apophisClock"), APOPHIS_FLYBY).start();
  }

  /** Set the hero background to NASA's Astronomy Picture of the Day. */
  async #loadApod() {
    const img = document.querySelector("#heroImg");
    const credit = document.querySelector("#apodCredit");
    try {
      const data = await this.apod.getToday();
      const background = data.media_type === "image" ? data.url : data.thumbnail_url;
      const fullImage = data.hdurl || data.url;

      if (background) {
        // Preload, then fade in — avoids showing a half-painted image.
        const preload = new Image();
        preload.addEventListener("load", () => {
          img.style.backgroundImage = `url("${background}")`;
          img.classList.add("is-loaded");
        });
        preload.src = background;
      }

      credit.innerHTML = `
        <span class="apod-tag">NASA · Astronomy Picture of the Day</span>
        <strong>${data.title}</strong>
        <span>${data.date}${this.#formatCopyright(data.copyright)}</span>
        ${background ? `<a href="${fullImage}" target="_blank" rel="noopener">View full image ↗</a>` : ""}`;
      credit.hidden = false;
    } catch {
      // APOD unavailable (offline / rate limit): keep the themed gradient hero.
    }
  }

  /** Collapse the messy multi-line copyright field into a short, clean credit. */
  #formatCopyright(copyright) {
    if (!copyright) return "";
    const clean = copyright.replace(/\s+/g, " ").trim();
    const short = clean.length > 70 ? `${clean.slice(0, 67)}…` : clean;
    return ` · © ${short}`;
  }

  /** Show the closest few approaches happening today. */
  async #loadFeatured() {
    this.grid.renderLoading(3);
    const today = new Date().toISOString().slice(0, 10);
    try {
      const raw = await this.api.getFeed(today, today);
      const asteroids = raw
        .map((r) => new Asteroid(r))
        .sort((a, b) => a.missDistanceKm - b.missDistanceKm)
        .slice(0, 6);

      asteroids.length
        ? this.grid.render(asteroids)
        : this.grid.renderEmpty("No close approaches are logged for today.");
    } catch (err) {
      this.grid.renderError(err.message);
    }
  }
}

new HomePage().init();
