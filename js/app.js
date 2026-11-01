(() => {
  const $ = id => document.getElementById(id);
  const safeValue = (id, fallback = "") => {
    const el = $(id);
    return el ? el.value : fallback;
  };
  const num = id => {
    const el = $(id);
    if (!el) return 0;
    const value = Number(el.value);
    return Number.isFinite(value) ? value : 0;
  };
  const set = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };
  const on = (id, eventName, handler) => {
    const el = $(id);
    if (el) el.addEventListener(eventName, handler);
  };

  const defaults = {floors:12,floorHeight:3.3,population:240,lifts:2,customTravel:0,peakDemand:12,capacity:1000,speed:1.6,carWidth:1400,carDepth:1600,doorWidth:900,dwell:5,shaftWidth:2200,shaftDepth:2100,pit:1500,headroom:4500,doorCycle:8,stopFactor:0.65,movingMass:750,balance:0.45,efficiency:0.8,acceleration:0.8,hours:12,utilization:0.4};
  const labels = {dashboard:"Project dashboard",inputs:"Design inputs",traffic:"Traffic analysis",carshaft:"Car & shaft planning",drive:"Drive & energy",calculators:"Engineering calculators",compliance:"Standards review",reports:"Reports & export"};
  let projectName="New Elevator Project", standard="EN 81", notes="", checks={};
  let currentReport=null;
  const fmt = (n,d=1) => LiftCalc.fmt(n,d);

  function params(){
    const p={}; Object.keys(defaults).forEach(k=>p[k]=num(k));
    p.floors=Math.max(1,p.floors);p.lifts=Math.max(1,p.lifts);p.travelM=p.customTravel>0?p.customTravel:(p.floors-1)*p.floorHeight;
    return p;
  }

  function showToast(msg){
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
  }

  function navigate(page){
    document.querySelectorAll(".page").forEach(el=>el.classList.toggle("active", el.id === `page-${page}`));
    document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active", el.dataset.page === page));
    set("pageTitle", labels[page] || "LiftPlan Pro");
    const sidebar = $("sidebar");
    if (sidebar) sidebar.classList.remove("open");
    if (page === "reports") renderReport();
    if (page === "compliance") renderChecklist();
  }

  function readForm(){
    const nameInput = $("projectName");
    const standardInput = $("standardMode");
    const notesInput = $("complianceNotes");

    projectName = nameInput ? nameInput.value.trim() || "Untitled Project" : "Untitled Project";
    standard = standardInput ? standardInput.value : "EN 81";
    notes = notesInput ? notesInput.value || "" : "";
  }

  function render(){
    readForm();
    const p=params(), t=LiftTraffic.calculate(p), s=LiftShaft.calculate(p), d=LiftDrive.calculate(p);
    set("dashboardProject", projectName);
    set("dashboardStandard", `${standard} planning profile`);
    set("sidebarStandard", `${standard.toUpperCase()} PROFILE`);
    set("metricTravel", `${fmt(p.travelM,1)} m`);
    set("metricFloors", `${p.floors} floors`);
    set("metricLifts", `${p.lifts} units`);
    set("metricCapacity", `${fmt(p.capacity,0)} kg rated load each`);
    set("metricInterval", `${fmt(t.interval)} sec`);
    set("metricHandling", `${fmt(t.handling,0)} pax`);
    set("metricHandlingPct", `${fmt(t.handlingPercent)}% of building population / 5 min`);
    set("snapCarArea", `${fmt(s.carArea,2)} m²`);
    set("snapShaftArea", `${fmt(s.shaftArea,2)} m²`);
    set("snapRtt", `${fmt(t.rtt)} s`);
    set("snapMotor", `${fmt(d.power,2)} kW`);
    set("snapEnergy", `${fmt(d.daily,1)} kWh`);
    set("snapSpeed", `${fmt(p.speed,2)} m/s`);

    const checksList = [
      [p.speed > 0, "Rated speed is greater than zero"],
      [p.efficiency > 0 && p.efficiency <= 1, "Drive efficiency is within 0–1"],
      [s.widthPass && s.depthPass, "Shaft passes placeholder envelope screen"],
      [p.population > 0, "Building population is greater than zero"],
      [p.lifts > 0, "At least one elevator is configured"]
    ];

    const dashboardChecks = $("dashboardChecks");
    if (dashboardChecks) {
      dashboardChecks.innerHTML = checksList.map(([ok,label]) => `<div class="check-row"><span class="check-dot ${ok ? "":"warn"}">${ok ? "✓":"!"}</span><span>${label}</span></div>`).join("");
    }

    renderTraffic(p,t);
    renderShaft(p,s);
    renderDrive(p,d,t);
    renderCalc(p,t,s,d);
    renderReport();
  }

  function renderTraffic(p,t){
    set("trafficRtt", `${fmt(t.rtt)} sec`);
    set("trafficInterval", `${fmt(t.interval)} sec`);
    set("trafficHandling", `${fmt(t.handling,0)} persons`);
    set("trafficPct", `${fmt(t.handlingPercent)}% of population`);
    set("trafficStops", t.stops);
    set("trafficOccupancy", `${fmt(t.passengers,1)} persons`);
    set("trafficTarget", `${fmt(t.target,0)} persons / 5 min`);
    set("trafficMargin", `${fmt(t.margin,0)} persons`);

    const parts = [["Vertical travel", t.verticalTime], ["Stops and door allowances", t.stopTime], ["Acceleration allowance", t.accelerationTime]];
    const max = Math.max(...parts.map(x => x[1]), 1);
    const trafficBreakdown = $("trafficBreakdown");
    if (trafficBreakdown) {
      trafficBreakdown.innerHTML = parts.map(([label,val]) => `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${(val / max) * 100}%"></div></div><span>${fmt(val,1)} s</span></div>`).join("");
    }
  }

  function renderShaft(p,s){
    set("carArea", `${fmt(s.carArea,2)} m²`);
    set("shaftArea", `${fmt(s.shaftArea,2)} m²`);
    set("carPassengers", `${fmt(s.passengers,1)} persons`);
    set("areaPerPassenger", `${fmt(s.areaPerPassenger,3)} m²`);
    set("verticalEnvelope", `${fmt(p.travelM + (p.pit + p.headroom) / 1000, 2)} m`);
    set("widthAllowance", `${fmt(s.widthAllowance,0)} mm`);
    set("depthAllowance", `${fmt(s.depthAllowance,0)} mm`);
    const pass = s.widthPass && s.depthPass;
    const shaftScreen = $("shaftScreen");
    if (shaftScreen) {
      shaftScreen.className = `status-line ${pass ? "":"warning"}`;
      shaftScreen.textContent = pass ? "Placeholder envelope screen passed — detailed shaft design checks required." : "Placeholder envelope screen not passed — revisit shaft allowances.";
    }
    LiftShaft.draw(p);
  }

  function renderDrive(p,d,t){
    set("motorPower", `${fmt(d.power,2)} kW`);
    set("dailyEnergy", `${fmt(d.daily,1)} kWh`);
    set("annualEnergy", `${fmt(d.annual,0)} kWh`);
    set("driveMass", `${fmt(p.movingMass,0)} kg`);
    set("driveBalance", fmt(p.balance,2));
    set("driveEfficiency", fmt(p.efficiency,2));
    set("driveDailyGroup", `${fmt(d.daily,1)} kWh`);
  }

  function renderCalc(p,t,s,d){
    set("calcTravelTime", `${fmt(LiftCalc.travelTime(p.travelM,p.speed))} s`);
    set("calcCarArea", `${fmt(s.carArea,2)} m²`);
    set("calcOccupancy", `${fmt(s.passengers,1)} persons`);
    set("calcPower", `${fmt(LiftCalc.tractionPower(p.movingMass, p.speed, p.balance, p.efficiency),2)} kW`);
    set("calcEnergy", `${fmt(LiftCalc.energy(d.power, p.hours, p.utilization, p.lifts),1)} kWh`);
    set("calcInterval", `${fmt(t.interval,1)} s`);
    const custom = LiftDrive.customPower(num("customLoad"), num("customHeight"), num("customTime"));
    set("customPower", `${fmt(custom,2)} kW`);
  }

  function renderChecklist(){
    const profile = LiftStandards && LiftStandards.profiles ? LiftStandards.profiles[standard] : null;
    if (!profile) return;
    set("checklistTitle", profile.title);
    set("checklistDescription", profile.description);
    set("complianceTag", standard);
    const checklist = $("checklist");
    if (checklist) {
      checklist.innerHTML = profile.items.map((item,i) => `<label class="check-item ${checks[`${standard}-${i}`] ? "done": ""}"><input type="checkbox" data-check="${standard}-${i}" ${checks[`${standard}-${i}`] ? "checked":""}>${item}</label>`).join("");
    }
    const done = profile.items.filter((_,i) => checks[`${standard}-${i}`]).length;
    const pct = Math.round((done / profile.items.length) * 100);
    const progressText = $("checkProgress");
    if (progressText) progressText.textContent = `${pct}%`;
    const progressBar = $("progressBar");
    if (progressBar) progressBar.style.width = `${pct}%`;
  }

  function renderReport(){
    const p=params(), t=LiftTraffic.calculate(p), s=LiftShaft.calculate(p), d=LiftDrive.calculate(p);
    currentReport = LiftReports.build(projectName, standard, p, t, s, d, notes);
    const reportPreview = $("reportPreview");
    if (reportPreview) LiftReports.render(currentReport);
  }

  function projectData(){
    readForm();
    return {app:"LiftPlan Pro", version:1, projectName, standard, notes, inputs:params(), checks, exportedAt:new Date().toISOString()};
  }

  function applyData(data){
    if (!data || !data.inputs) throw new Error("Invalid project file");
    projectName = data.projectName || "Imported Project";
    const nameInput = $("projectName");
    if (nameInput) nameInput.value = projectName;

    standard = data.standard || "EN 81";
    const standardMode = $("standardMode");
    if (standardMode) standardMode.value = standard in LiftStandards.profiles ? standard : "EN 81";

    Object.keys(defaults).forEach(k => {
      const input = $(k);
      if (data.inputs[k] !== undefined && input) input.value = data.inputs[k];
    });
    render();
    renderChecklist();
    showToast("Project imported");
  }

  function saveLocal(){
    try {
      if (typeof localStorage === "undefined") {
        showToast("Local saving unavailable in this environment");
        return;
      }
      localStorage.setItem("liftplan-pro-project", JSON.stringify(projectData()));
      const saveState = $("saveState");
      if (saveState) saveState.textContent = "Saved locally";
      showToast("Project saved in this browser");
    }
    catch(e) {
      showToast("Could not save locally — export JSON instead");
    }
  }

  document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => navigate(b.dataset.page)));
  on("mobileMenu", "click", () => {
    const sidebar = $("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
  });
  document.querySelectorAll("[data-input]").forEach(el => el.addEventListener("input", render));
  ["projectName", "standardMode", "complianceNotes"].forEach(id => {
    on(id, "input", () => {
      readForm();
      render();
      if (id === "standardMode") renderChecklist();
    });
  });
  on("saveProject", "click", saveLocal);
  on("resetInputs", "click", () => {
    Object.entries(defaults).forEach(([k, v]) => {
      const input = $(k);
      if (input) input.value = v;
    });
    render();
    showToast("Inputs reset to defaults");
  });
  on("checklist", "change", e => {
    if (e.target.matches("[data-check]")) {
      checks[e.target.dataset.check] = e.target.checked;
      renderChecklist();
    }
  });
  ["customLoad", "customHeight", "customTime"].forEach(id => {
    on(id, "input", () => renderCalc(params(), LiftTraffic.calculate(params()), LiftShaft.calculate(params()), LiftDrive.calculate(params())));
  });
  on("complianceNotes", "input", () => {
    notes = safeValue("complianceNotes");
    renderReport();
  });
  on("printReport", "click", () => { navigate("reports"); window.print(); });
  on("exportJson", "click", () => LiftReports.download("liftplan-project.json", JSON.stringify(projectData(), null, 2), "application/json"));
  on("exportCsv", "click", () => {
    renderReport();
    const csv = [["Parameter", "Value"], ...currentReport.rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    LiftReports.download("liftplan-summary.csv", csv, "text/csv;charset=utf-8;");
  });
  on("copyReport", "click", async () => {
    renderReport();
    try {
      await navigator.clipboard.writeText(LiftReports.text(currentReport));
      showToast("Report copied to clipboard");
    }
    catch (e) {
      showToast("Copy failed — export or print the report instead");
    }
  });
  on("importJson", "change", async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      applyData(JSON.parse(await file.text()));
    }
    catch (err) {
      showToast("Could not import this project file");
    }
  });
  on("projectName", "input", () => {
    projectName = safeValue("projectName") || "Untitled Project";
    set("dashboardProject", projectName);
  });

  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("liftplan-pro-project");
      if (saved) applyData(JSON.parse(saved));
      else render();
    } else {
      render();
    }
  }
  catch (e) {
    render();
  }

  renderChecklist();
})();
