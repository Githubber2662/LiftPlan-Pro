window.LiftReports = {
  build(project, standard, p, traffic, shaft, drive, notes) {
    const rows = [
      ["Standard profile", standard], ["Floors", p.floors], ["Floor-to-floor", `${p.floorHeight} m`],
      ["Building travel", `${LiftCalc.fmt(p.travelM,2)} m`], ["Population", p.population],
      ["Elevators", p.lifts], ["Rated capacity / lift", `${p.capacity} kg`], ["Rated speed", `${p.speed} m/s`],
      ["Car dimensions", `${p.carWidth} × ${p.carDepth} mm`], ["Car floor area", `${LiftCalc.fmt(shaft.carArea,2)} m²`],
      ["Clear door opening", `${p.doorWidth} mm`], ["Shaft dimensions", `${p.shaftWidth} × ${p.shaftDepth} mm`],
      ["Pit / headroom", `${p.pit} / ${p.headroom} mm`], ["Estimated round-trip time", `${LiftCalc.fmt(traffic.rtt)} s`],
      ["Estimated interval", `${LiftCalc.fmt(traffic.interval)} s`], ["Five-minute handling", `${LiftCalc.fmt(traffic.handling,0)} persons`],
      ["Handling / population", `${LiftCalc.fmt(traffic.handlingPercent)}%`], ["Indicative motor power", `${LiftCalc.fmt(drive.power,2)} kW`],
      ["Estimated daily group energy", `${LiftCalc.fmt(drive.daily,1)} kWh`], ["Estimated annual group energy", `${LiftCalc.fmt(drive.annual,0)} kWh`]
    ];
    return {project, standard, rows, notes: notes || "No project notes entered.", disclaimer: "Preliminary planning estimate only. Not an approved design, code compliance determination or safety certification. Verify all calculations and dimensions against the current adopted standards, local authority requirements and manufacturer data."};
  },
  render(report) {
    const root=document.getElementById("reportPreview");
    root.innerHTML = `<h3>${this.escape(report.project)}</h3><p class="muted small">Preliminary elevator engineering report · ${this.escape(report.standard)} profile</p><table>${report.rows.map(r=>`<tr><td>${this.escape(String(r[0]))}</td><td>${this.escape(String(r[1]))}</td></tr>`).join("")}</table><p class="report-section">Engineering notes</p><p>${this.escape(report.notes).replace(/\n/g,"<br>")}</p><div class="notice notice-amber"><strong>Important limitation</strong><p>${this.escape(report.disclaimer)}</p></div>`;
  },
  text(report) {
    return `${report.project}\nPRELIMINARY ELEVATOR ENGINEERING REPORT\n${report.standard} PROFILE\n\n${report.rows.map(r=>`${r[0]}: ${r[1]}`).join("\n")}\n\nEngineering notes:\n${report.notes}\n\n${report.disclaimer}`;
  },
  escape(value) {
    return String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  },
  download(name, content, type) {
    const blob=new Blob([content],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=name;a.click();
    URL.revokeObjectURL(url);
  }
};
