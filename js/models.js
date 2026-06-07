/**
 * Wraps a raw NeoWs asteroid object with convenient, typed getters.
 *
 * The NeoWs feed can list several close-approach entries per asteroid; we keep
 * the single closest one (smallest miss distance) and base the headline figures
 * on it.
 */
export class Asteroid {
  constructor(raw) {
    this.raw = raw;
    this.id = raw.id;
    this.name = raw.name.replace(/[()]/g, "").trim();
    this.isHazardous = raw.is_potentially_hazardous_asteroid;
    this.isSentry = raw.is_sentry_object;
    this.jplUrl = raw.nasa_jpl_url;
    this.magnitude = raw.absolute_magnitude_h;

    const approaches = raw.close_approach_data ?? [];
    this.closestApproach = approaches.reduce((closest, a) => {
      if (!closest) return a;
      return Number(a.miss_distance.kilometers) < Number(closest.miss_distance.kilometers)
        ? a
        : closest;
    }, null);
  }

  get approachDate() {
    return this.closestApproach?.close_approach_date ?? "—";
  }

  /** Average of NASA's min/max estimated diameter, in metres. */
  get diameterMeters() {
    const d = this.raw.estimated_diameter.meters;
    return (d.estimated_diameter_min + d.estimated_diameter_max) / 2;
  }

  get missDistanceKm() {
    return Number(this.closestApproach?.miss_distance.kilometers ?? 0);
  }

  /** Miss distance expressed in Lunar Distances (1 LD ≈ 384,400 km). */
  get missDistanceLunar() {
    return Number(this.closestApproach?.miss_distance.lunar ?? 0);
  }

  get velocityKmh() {
    return Number(this.closestApproach?.relative_velocity.kilometers_per_hour ?? 0);
  }

  /**
   * A 0–100 "danger index" used ONLY to drive the UI meter (not an official
   * NASA figure): larger + closer + faster + officially hazardous => higher.
   */
  get dangerScore() {
    const size = Math.min(this.diameterMeters / 1000, 1) * 40; // up to 40 pts
    const proximity = Math.max(0, 1 - this.missDistanceLunar / 50) * 35; // up to 35
    const speed = Math.min(this.velocityKmh / 100000, 1) * 15; // up to 15
    const hazard = this.isHazardous ? 10 : 0; // up to 10
    return Math.round(size + proximity + speed + hazard);
  }
}
