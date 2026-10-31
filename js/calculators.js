window.LiftCalc = {
  clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); },
  carArea(widthMm, depthMm) { return (widthMm * depthMm) / 1e6; },
  occupancy(capacityKg, assumedPersonKg = 75, loadingFactor = 0.8) {
    return capacityKg / assumedPersonKg * loadingFactor;
  },
  travelTime(distanceM, speedMps) { return speedMps > 0 ? distanceM / speedMps : 0; },
  tractionPower(massKg, speedMps, balance, efficiency) {
    if (efficiency <= 0) return 0;
    return massKg * 9.81 * speedMps * balance / (1000 * efficiency);
  },
  energy(powerKw, hours, utilization, liftCount) {
    return powerKw * hours * utilization * liftCount;
  },
  fmt(value, decimals = 1) {
    return Number.isFinite(value) ? value.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals}) : "—";
  }
};
