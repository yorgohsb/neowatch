import { NeoApi } from "./api.js";
import { Asteroid } from "./models.js";
import { CardGrid } from "./card-grid.js";

/**
 * Home page: shows the handful of closest asteroid approaches happening today,
 * as a live preview of what the Live Tracker offers.
 */
class HomePage {
  constructor() {
    this.api = new NeoApi();
    this.grid = new CardGrid(document.querySelector("#featuredGrid"), { api: this.api });

    // Bound once so the retry button inside an error state works.
    this.grid.container.addEventListener("click", (e) => {
      if (e.target.matches("[data-retry]")) this.load();
    });
  }

  async load() {
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

new HomePage().load();
