import { CONFIG } from "./config.js";

/**
 * Minimal client for NASA's Astronomy Picture of the Day (APOD) API.
 * Shares the same API key as NeoWs but lives at a different endpoint, so it is
 * kept separate from NeoApi.
 */
export class ApodApi {
  constructor(apiKey = CONFIG.API_KEY) {
    this.apiKey = apiKey;
    this.url = "https://api.nasa.gov/planetary/apod";
  }

  /**
   * Fetch today's picture. `thumbs=true` makes the API return a `thumbnail_url`
   * for the days when the entry is a video instead of an image.
   */
  async getToday() {
    const url = new URL(this.url);
    url.search = new URLSearchParams({ api_key: this.apiKey, thumbs: "true" });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`APOD request failed (${res.status}).`);
    return res.json();
  }
}
