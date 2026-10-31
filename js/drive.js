window.LiftDrive = {
  calculate(p) {
    const power = LiftCalc.tractionPower(p.movingMass, p.speed, p.balance, p.efficiency);
    const daily = LiftCalc.energy(power, p.hours, p.utilization, p.lifts);
    return {power, daily, annual: daily * 365};
  },
  customPower(loadKg, heightM, seconds) {
    return seconds > 0 ? loadKg * 9.81 * heightM / seconds / 1000 : 0;
  }
};
