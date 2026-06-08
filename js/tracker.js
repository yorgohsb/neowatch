import { NeoApi } from "./api.js";
import { Asteroid } from "./models.js";
import { CardGrid } from "./card-grid.js";

/**
 * Controller for the Live Tracker page.
 *
 * Strategy: fetch the close-approach feed once for the chosen date window and
 * buffer every asteroid in memory, then run search + hazard filter + sorting +
 * pagination entirely on the client. This keeps all four interactive features
 * working on one coherent dataset without extra network calls.
 */
export class TrackerPage {
  constructor() {
    this.api = new NeoApi();
    this.all = []; // full buffer of Asteroid instances
    this.filtered = []; // current view after search/filter/sort
    this.pageSize = 9;
    this.page = 1;

    this.els = {
      form: document.querySelector("#filters"),
      start: document.querySelector("#startDate"),
      end: document.querySelector("#endDate"),
      search: document.querySelector("#search"),
      hazard: document.querySelector("#hazardOnly"),
      sort: document.querySelector("#sortBy"),
      grid: document.querySelector("#grid"),
      pager: document.querySelector("#pager"),
      count: document.querySelector("#resultCount"),
    };
    this.grid = new CardGrid(this.els.grid, { api: this.api });
  }

  init() {
    this.#setDefaultDates();
    this.#bindEvents();
    this.load();
  }

  #setDefaultDates() {
    const today = new Date();
    const weekEnd = new Date();
    weekEnd.setDate(today.getDate() + 6); // 7-day inclusive window (API max)
    this.els.start.value = this.#iso(today);
    this.els.end.value = this.#iso(weekEnd);
  }

  #iso(date) {
    return date.toISOString().slice(0, 10);
  }

  #bindEvents() {
    // Re-fetch only when the date window changes (form submit).
    this.els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.load();
    });

    // Search / filter / sort act on the in-memory buffer — no network call.
    this.els.search.addEventListener("input", () => this.#refresh());
    this.els.hazard.addEventListener("change", () => this.#refresh());
    this.els.sort.addEventListener("change", () => this.#refresh());

    // Delegated clicks inside the grid: retry button only — the card flip is
    // handled internally by CardGrid.
    this.els.grid.addEventListener("click", (e) => {
      if (e.target.matches("[data-retry]")) this.load();
    });

    // Pagination.
    this.els.pager.addEventListener("click", (e) => {
      if (e.target.matches("[data-page]")) {
        this.page = Number(e.target.dataset.page);
        this.#renderPage();
        this.els.grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  async load() {
    this.grid.renderLoading();
    this.els.pager.innerHTML = "";
    this.els.count.textContent = "";
    try {
      const raw = await this.api.getFeed(this.els.start.value, this.els.end.value);
      this.all = raw.map((r) => new Asteroid(r));
      this.#refresh();
    } catch (err) {
      this.grid.renderError(err.message);
    }
  }

  /** Recompute the filtered view from the current control values. */
  #refresh() {
    this.page = 1;
    this.filtered = this.#applyFilters(this.all);
    this.#renderPage();
  }

  #applyFilters(list) {
    const query = this.els.search.value.trim().toLowerCase();

    let out = list.filter((a) => a.name.toLowerCase().includes(query));
    if (this.els.hazard.checked) out = out.filter((a) => a.isHazardous);

    const [key, dir] = this.els.sort.value.split(":");
    const metric = {
      distance: (a) => a.missDistanceKm,
      size: (a) => a.diameterMeters,
      speed: (a) => a.velocityKmh,
      danger: (a) => a.dangerScore,
    }[key];
    if (metric) {
      const factor = dir === "desc" ? -1 : 1;
      out.sort((a, b) => (metric(a) - metric(b)) * factor);
    }
    return out;
  }

  #renderPage() {
    const total = this.filtered.length;
    this.els.count.textContent = `${total} asteroid${total === 1 ? "" : "s"}`;

    if (!total) {
      this.grid.renderEmpty();
      this.els.pager.innerHTML = "";
      return;
    }

    const pages = Math.ceil(total / this.pageSize);
    this.page = Math.min(this.page, pages);
    const start = (this.page - 1) * this.pageSize;
    this.grid.render(this.filtered.slice(start, start + this.pageSize));
    this.#renderPager(pages);
  }

  #renderPager(pages) {
    if (pages <= 1) {
      this.els.pager.innerHTML = "";
      return;
    }
    const btn = (page, label = page, { disabled = false, active = false } = {}) =>
      `<button class="page-btn ${active ? "is-active" : ""}" data-page="${page}" ${
        disabled ? "disabled" : ""
      }>${label}</button>`;

    let html = btn(this.page - 1, "‹", { disabled: this.page === 1 });
    for (let p = 1; p <= pages; p++) html += btn(p, p, { active: p === this.page });
    html += btn(this.page + 1, "›", { disabled: this.page === pages });
    this.els.pager.innerHTML = html;
  }

}

new TrackerPage().init();
