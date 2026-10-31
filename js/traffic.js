window.LiftTraffic = {
  calculate(p) {
    const travel = p.travelM;
    const speed = p.speed;
    const stops = Math.max(1, Math.round((p.floors - 1) * p.stopFactor));
    const verticalTime = speed > 0 ? 2 * travel / speed : 0;
    const stopTime = 2 * stops * (p.dwell + p.doorCycle);
    const accelerationTime = p.acceleration > 0 ? 2 * Math.sqrt(speed / p.acceleration) : 0;
    const rtt = verticalTime + stopTime + accelerationTime;
    const passengers = LiftCalc.occupancy(p.capacity);
    const interval = p.lifts > 0 ? rtt / p.lifts : 0;
    const handling = rtt > 0 ? 300 * passengers * p.lifts / rtt : 0;
    const handlingPercent = p.population > 0 ? handling / p.population * 100 : 0;
    const target = p.population * p.peakDemand / 100;
    return {stops, verticalTime, stopTime, accelerationTime, rtt, passengers, interval, handling, handlingPercent, target, margin: handling - target};
  }
};
