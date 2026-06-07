import { CONFIG } from "./config.js";

/**
 * Thin wrapper around the NASA NeoWs REST API.
 *
 * Every method returns parsed JSON and throws an Error on a non-OK response so
 * that the UI layer (CardGrid) can render a proper error state.
 */
export class NeoApi {
  constructor(apiKey = CONFIG.API_KEY, baseUrl = CONFIG.BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /** Internal helper: builds the URL, performs the fetch, validates the status. */
  async #request(path, params = {}) {
    const url = new URL(`${this.baseUrl}${path}`);
    url.search = new URLSearchParams({ ...params, api_key: this.apiKey });

    const res = await fetch(url);
    if (!res.ok) {
      const reason =
        res.status === 429
          ? "NASA API rate limit reached. Wait a bit, or add your own free API key in js/config.js."
          : `Request failed (${res.status} ${res.statusText}).`;
      throw new Error(reason);
    }
    return res.json();
  }

  /**
   * Fetch the close-approach feed for a date range (the API allows a max 7-day
   * window). Returns a flat array of raw asteroid objects across all days.
   */
  async getFeed(startDate, endDate) {
    const data = await this.#request("/feed", {
      start_date: startDate,
      end_date: endDate,
    });
    return Object.values(data.near_earth_objects ?? {}).flat();
  }

  /** Fetch full orbital details for a single asteroid by its NeoWs id. */
  async lookup(id) {
    return this.#request(`/neo/${id}`);
  }
}
