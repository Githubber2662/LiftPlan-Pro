(() => {
  const $ = id => document.getElementById(id);
  const defaults = {floors:12,floorHeight:3.3,population:240,lifts:2,customTravel:0,peakDemand:12,capacity:1000,speed:1.6,carWidth:1400,carDepth:1600,doorWidth:900,dwell:5,shaftWidth:2200,shaftDepth:2100,pit:1500,headroom:4500,doorCycle:8,stopFactor:.65,movingMass:750,balance:.45,efficiency:.8,acceleration:.8,hours:12,utilization:.4};
  const labels = {dashboard:"Project dashboard",inputs:"Design inputs",traffic:"Traffic analysis",carshaft:"Car & shaft planning",drive:"Drive & energy",calculators:"Engineering calculators",compliance:"Standards review",reports:"Reports & export"};
  let projectName="New Elevator Project", standard="EN 81", notes="", checks={};
  let currentReport=null;
  const num = id => Number($(id).value)||0;
  const fmt = (n,d=1) => LiftCalc.fmt(n,d);
  function params(){
    const p={}; Object.keys(defaults).forEach(k=>p[k]=num(k));
    p.floors=Math.max(1,p.floors);p.lifts=Math.max(1,p.lifts);p.travelM=p.customTravel>0?p.customTravel:(p.floors-1)*p.floorHeight;
    return p;
  }
  function set(id,value){if($(id))$(id).textContent=value;}
  function showToast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200);}
  function navigate(page){
    document.querySelectorAll(".page").forEach(el=>el.classList.toggle("active",el.id===`page-${page}`));
    document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.page===page));
    set("pageTitle",labels[page]||"LiftPlan Pro");
    $("sidebar").classList.remove("open");
    if(page==="reports")renderReport();
    if(page==="compliance")renderChecklist();
  }
  function readForm(){projectName=$("projectName").value.trim()||"Untitled Project";standard=$("standardMode").value;notes=$("complianceNotes").value||"";}
  function render(){
    readForm();const p=params(),t=LiftTraffic.calculate(p),s=LiftShaft.calculate(p),d=LiftDrive.calculate(p);
    set("dashboardProject",projectName);set("dashboardStandard",`${standard} planning profile`);set("sidebarStandard",`${standard.toUpperCase()} PROFILE`);
    set("metricTravel",`${fmt(p.travelM,1)} m`);set("metricFloors",`${p.floors} floors`);
    set("metricLifts",`${p.lifts} units`);set("metricCapacity",`${fmt(p.capacity,0)} kg rated load each`);
    set("metricInterval",`${fmt(t.interval)} sec`);set("metricHandling",`${fmt(t.handling,0)} pax`);set("metricHandlingPct",`${fmt(t.handlingPercent)}% of building population / 5 min`);
    set("snapCarArea",`${fmt(s.carArea,2)} m²`);set("snapShaftArea",`${fmt(s.shaftArea,2)} m²`);set("snapRtt",`${fmt(t.rtt)} s`);set("snapMotor",`${fmt(d.power,2)} kW`);set("snapEnergy",`${fmt(d.daily,1)} kWh`);set("snapSpeed",`${fmt(p.speed,2)} m/s`);
    const checksList=[
      [p.speed>0,"Rated speed is greater than zero"],[p.efficiency>0&&p.efficiency<=1,"Drive efficiency is within 0–1"],[s.widthPass&&s.depthPass,"Shaft passes placeholder envelope screen"],[p.pit>0&&p.headroom>0,"Pit and headroom values entered"],[p.floors>=2,"At least two floors configured"]
    ];
    $("dashboardChecks").innerHTML=checksList.map(([ok,label])=>`<div class="check-row"><span class="check-dot ${ok?"":"warn"}">${ok?"✓":"!"}</span><span>${label}</span></div>`).join("");
    renderTraffic(p,t);renderShaft(p,s);renderDrive(p,d,t);renderCalc(p,t,s,d);renderReport();
  }
  function renderTraffic(p,t){
    set("trafficRtt",`${fmt(t.rtt)} sec`);set("trafficInterval",`${fmt(t.interval)} sec`);set("trafficHandling",`${fmt(t.handling,0)} persons`);set("trafficPct",`${fmt(t.handlingPercent)}% of population`);
    set("trafficStops",t.stops);set("trafficOccupancy",`${fmt(t.passengers,1)} persons`);set("trafficTarget",`${fmt(t.target,0)} persons / 5 min`);set("trafficMargin",`${fmt(t.margin,0)} persons`);
    const parts=[["Vertical travel",t.verticalTime],["Stops and door allowances",t.stopTime],["Acceleration allowance",t.accelerationTime]];
    const max=Math.max(...parts.map(x=>x[1]),1);
    $("trafficBreakdown").innerHTML=parts.map(([label,val])=>`<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${val/max*100}%"></div></div><span class="bar-value">${fmt(val)} s</span></div>`).join("");
  }
  function renderShaft(p,s){
    set("carArea",`${fmt(s.carArea,2)} m²`);set("shaftArea",`${fmt(s.shaftArea,2)} m²`);set("carPassengers",`${fmt(s.passengers,1)} persons`);set("areaPerPassenger",`${fmt(s.areaPerPassenger,3)} m²`);set("verticalEnvelope",`${fmt(s.travelEnvelope,2)} m`);
    set("widthAllowance",`${fmt(s.widthAllowance,0)} mm`);set("depthAllowance",`${fmt(s.depthAllowance,0)} mm`);
    const pass=s.widthPass&&s.depthPass;$("shaftScreen").className=`status-line ${pass?"":"warning"}`;$("shaftScreen").textContent=pass?"Placeholder envelope screen passed — detailed shaft design still required.":"Placeholder envelope screen failed — review shaft dimensions.";
    LiftShaft.draw(p);
  }
  function renderDrive(p,d,t){
    set("motorPower",`${fmt(d.power,2)} kW`);set("dailyEnergy",`${fmt(d.daily,1)} kWh`);set("annualEnergy",`${fmt(d.annual,0)} kWh`);
    set("driveMass",`${fmt(p.movingMass,0)} kg`);set("driveBalance",fmt(p.balance,2));set("driveEfficiency",fmt(p.efficiency,2));set("driveDailyGroup",`${fmt(d.daily,1)} kWh`);
  }
  function renderCalc(p,t,s,d){
    set("calcTravelTime",`${fmt(LiftCalc.travelTime(p.travelM,p.speed))} s`);set("calcCarArea",`${fmt(s.carArea,2)} m²`);set("calcOccupancy",`${fmt(s.passengers,1)} persons`);set("calcPower",`${fmt(d.power,2)} kW`);set("calcEnergy",`${fmt(d.daily,1)} kWh`);set("calcInterval",`${fmt(t.interval)} s`);
    const custom=LiftDrive.customPower(num("customLoad"),num("customHeight"),num("customTime"));set("customPower",`${fmt(custom,2)} kW`);
  }
  function renderChecklist(){
    const profile=LiftStandards.profiles[standard];set("checklistTitle",profile.title);set("checklistDescription",profile.description);set("complianceTag",standard);
    $("checklist").innerHTML=profile.items.map((item,i)=>`<label class="check-item ${checks[`${standard}-${i}`]?"done":""}"><input type="checkbox" data-check="${standard}-${i}" ${checks[`${standard}-${i}`]?"checked":""}><span>${item}</span></label>`).join("");
    const done=profile.items.filter((_,i)=>checks[`${standard}-${i}`]).length,pct=Math.round(done/profile.items.length*100);set("checkProgress",`${pct}%`);$("progressBar").style.width=`${pct}%`;
  }
  function renderReport(){
    const p=params(),t=LiftTraffic.calculate(p),s=LiftShaft.calculate(p),d=LiftDrive.calculate(p);
    currentReport=LiftReports.build(projectName,standard,p,t,s,d,notes);LiftReports.render(currentReport);
  }
  function projectData(){readForm();return {app:"LiftPlan Pro",version:1,projectName,standard,notes,inputs:params(),checks,exportedAt:new Date().toISOString()};}
  function applyData(data){
    if(!data||!data.inputs)throw new Error("Invalid project file");
    projectName=data.projectName||"Imported Project";$("projectName").value=projectName;standard=data.standard||"EN 81";$("standardMode").value=standard in LiftStandards.profiles?standard:"EN 81";notes=data.notes||"";$("complianceNotes").value=notes;checks=data.checks||{};
    Object.keys(defaults).forEach(k=>{if(data.inputs[k]!==undefined&&$(k))$(k).value=data.inputs[k];});
    render();renderChecklist();showToast("Project imported");
  }
  function saveLocal(){
    try{localStorage.setItem("liftplan-pro-project",JSON.stringify(projectData()));$("saveState").textContent="Saved locally";showToast("Project saved in this browser");}
    catch(e){showToast("Could not save locally — export JSON instead");}
  }
  document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
  $("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
  document.querySelectorAll("[data-input]").forEach(el=>el.addEventListener("input",render));
  ["projectName","standardMode","complianceNotes"].forEach(id=>$(id).addEventListener("input",()=>{readForm();render();if(id==="standardMode")renderChecklist();}));
  $("saveProject").addEventListener("click",saveLocal);
  $("resetInputs").addEventListener("click",()=>{Object.entries(defaults).forEach(([k,v])=>$(k).value=v);render();showToast("Inputs reset to defaults");});
  $("checklist").addEventListener("change",e=>{if(e.target.matches("[data-check]")){checks[e.target.dataset.check]=e.target.checked;renderChecklist();}});
  ["customLoad","customHeight","customTime"].forEach(id=>$(id).addEventListener("input",()=>renderCalc(params(),LiftTraffic.calculate(params()),LiftShaft.calculate(params()),LiftDrive.calculate(params()))));
  $("complianceNotes").addEventListener("input",()=>{notes=$("complianceNotes").value;renderReport();});
  $("printReport").addEventListener("click",()=>{navigate("reports");window.print();});
  $("exportJson").addEventListener("click",()=>LiftReports.download("liftplan-project.json",JSON.stringify(projectData(),null,2),"application/json"));
  $("exportCsv").addEventListener("click",()=>{renderReport();const csv=[["Parameter","Value"],...currentReport.rows].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");LiftReports.download("liftplan-summary.csv",csv,"text/csv");});
  $("copyReport").addEventListener("click",async()=>{renderReport();try{await navigator.clipboard.writeText(LiftReports.text(currentReport));showToast("Report copied to clipboard");}catch(e){showToast("Clipboard unavailable in this browser");}});
  $("importJson").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{applyData(JSON.parse(await file.text()));}catch(err){showToast("Could not import this project file");}e.target.value="";});
  $("projectName").addEventListener("input",()=>{projectName=$("projectName").value;set("dashboardProject",projectName);});
  try{const saved=localStorage.getItem("liftplan-pro-project");if(saved)applyData(JSON.parse(saved));else render();}catch(e){render();}
  renderChecklist();
})();
