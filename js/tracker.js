import { NeoApi } from "./api.js";
import { Asteroid } from "./models.js";
import { CardGrid } from "./card-grid.js";
import { TableView } from "./table-view.js";
import { Watchlist } from "./watchlist.js";

const VIEW_KEY = "neowatch.view";

/**
 * Controller for the Live Tracker page.
 *
 * Strategy: fetch the close-approach feed once for the chosen date window and
 * buffer every asteroid in memory, then run search + filters + sorting +
 * pagination entirely on the client. Results render as either a card grid or
 * a compact sortable table; the chosen view persists in localStorage.
 */
export class TrackerPage {
  constructor() {
    this.api = new NeoApi();
    this.watchlist = new Watchlist();
    this.all = []; // full buffer of Asteroid instances
    this.filtered = []; // current view after search/filter/sort
    this.pageSize = 9;
    this.page = 1;
    this.lastError = null;
    this.view = localStorage.getItem(VIEW_KEY) === "table" ? "table" : "cards";

    this.els = {
      form: document.querySelector("#filters"),
      start: document.querySelector("#startDate"),
      end: document.querySelector("#endDate"),
      search: document.querySelector("#search"),
      hazard: document.querySelector("#hazardOnly"),
      watch: document.querySelector("#watchOnly"),
      sort: document.querySelector("#sortBy"),
      grid: document.querySelector("#grid"),
      tableWrap: document.querySelector("#tableWrap"),
      viewCards: document.querySelector("#viewCards"),
      viewTable: document.querySelector("#viewTable"),
      pager: document.querySelector("#pager"),
      count: document.querySelector("#resultCount"),
    };
    this.grid = new CardGrid(this.els.grid, { api: this.api, watchlist: this.watchlist });
    this.table = new TableView(this.els.tableWrap, { watchlist: this.watchlist });
  }

  init() {
    this.#setDefaultDates();
    this.#bindEvents();
    this.#applyView();
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

    // Search / filters / sort act on the in-memory buffer — no network call.
    this.els.search.addEventListener("input", () => this.#refresh());
    this.els.hazard.addEventListener("change", () => this.#refresh());
    this.els.watch.addEventListener("change", () => this.#refresh());
    this.els.sort.addEventListener("change", () => this.#refresh());

    // Card ⇄ table view toggle.
    this.els.viewCards.addEventListener("click", () => this.#setView("cards"));
    this.els.viewTable.addEventListener("click", () => this.#setView("table"));

    // Retry buttons inside either container's error state.
    for (const el of [this.els.grid, this.els.tableWrap]) {
      el.addEventListener("click", (e) => {
        if (e.target.matches("[data-retry]")) this.load();
      });
    }

    // Table header clicks re-sort, kept in sync with the sort dropdown:
    // first click sorts descending, a second click flips to ascending.
    this.els.tableWrap.addEventListener("click", (e) => {
      const th = e.target.closest("th[data-sort]");
      if (!th) return;
      const key = th.dataset.sort;
      const { key: curKey, dir: curDir } = this.#sortState();
      const dir = curKey === key && curDir === "desc" ? "asc" : "desc";
      this.els.sort.value = `${key}:${dir}`;
      this.#refresh();
    });

    // Starring/unstarring changes the result set when "Watchlist only" is on.
    document.addEventListener("watchlist:change", () => {
      if (this.els.watch.checked) this.#refresh();
    });

    // Pagination.
    this.els.pager.addEventListener("click", (e) => {
      if (e.target.matches("[data-page]")) {
        this.page = Number(e.target.dataset.page);
        this.#renderPage();
        this.#activeContainer().scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  #setView(view) {
    if (view === this.view) return;
    this.view = view;
    localStorage.setItem(VIEW_KEY, view);
    this.#applyView();
    this.#renderPage();
  }

  #applyView() {
    const isTable = this.view === "table";
    this.els.grid.hidden = isTable;
    this.els.tableWrap.hidden = !isTable;
    this.els.viewCards.classList.toggle("active", !isTable);
    this.els.viewTable.classList.toggle("active", isTable);
    this.els.viewCards.setAttribute("aria-pressed", String(!isTable));
    this.els.viewTable.setAttribute("aria-pressed", String(isTable));
  }

  #activeRenderer() {
    return this.view === "table" ? this.table : this.grid;
  }

  #activeContainer() {
    return this.view === "table" ? this.els.tableWrap : this.els.grid;
  }

  #sortState() {
    const [key, dir] = this.els.sort.value.split(":");
    return { key, dir };
  }

  async load() {
    this.lastError = null;
    this.#activeRenderer().renderLoading();
    this.els.pager.innerHTML = "";
    this.els.count.textContent = "";
    try {
      const raw = await this.api.getFeed(this.els.start.value, this.els.end.value);
      this.all = raw.map((r) => new Asteroid(r));
      this.#refresh();
    } catch (err) {
      this.lastError = err.message;
      this.#activeRenderer().renderError(err.message);
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
    if (this.els.watch.checked) out = out.filter((a) => this.watchlist.has(a.id));

    const { key, dir } = this.#sortState();
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
    // If the last fetch failed, keep showing the error (e.g. after a view toggle).
    if (this.lastError) {
      this.#activeRenderer().renderError(this.lastError);
      this.els.pager.innerHTML = "";
      return;
    }

    const total = this.filtered.length;
    this.els.count.textContent = `${total} asteroid${total === 1 ? "" : "s"}`;

    if (!total) {
      this.#activeRenderer().renderEmpty(
        this.els.watch.checked
          ? "Nothing on your watchlist matches — star some asteroids first."
          : "No asteroids match your filters."
      );
      this.els.pager.innerHTML = "";
      return;
    }

    const pages = Math.ceil(total / this.pageSize);
    this.page = Math.min(this.page, pages);
    const start = (this.page - 1) * this.pageSize;
    const pageItems = this.filtered.slice(start, start + this.pageSize);

    if (this.view === "table") {
      this.table.render(pageItems, this.#sortState());
    } else {
      this.grid.render(pageItems);
    }
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
