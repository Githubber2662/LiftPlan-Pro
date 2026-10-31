window.LiftShaft = {
  calculate(p) {
    const carArea = LiftCalc.carArea(p.carWidth, p.carDepth);
    const shaftArea = p.shaftWidth * p.shaftDepth / 1e6;
    const passengers = LiftCalc.occupancy(p.capacity);
    const areaPerPassenger = passengers > 0 ? carArea / passengers : 0;
    // Explicitly an illustrative placeholder only; not a standards clearance.
    const widthAllowance = p.carWidth + 300;
    const depthAllowance = p.carDepth + 300;
    const widthPass = p.shaftWidth >= widthAllowance;
    const depthPass = p.shaftDepth >= depthAllowance;
    const travelEnvelope = p.travelM + (p.pit + p.headroom) / 1000;
    return {carArea, shaftArea, passengers, areaPerPassenger, widthAllowance, depthAllowance, widthPass, depthPass, travelEnvelope};
  },
  draw(p) {
    const svg = document.getElementById("carDrawing");
    if (!svg) return;
    const W=420,H=310, pad=48, maxW=Math.max(p.shaftWidth,1), maxD=Math.max(p.shaftDepth,1);
    const scale=Math.min(300/maxW,220/maxD);
    const sw=maxW*scale, sd=maxD*scale, cw=p.carWidth*scale, cd=p.carDepth*scale;
    const x=(W-sw)/2, y=(H-sd)/2+5, cx=x+(sw-cw)/2, cy=y+(sd-cd)/2;
    const doorW=Math.min(p.doorWidth*scale,cw*.8);
    svg.innerHTML = `
      <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#71809b"/></marker></defs>
      <rect x="${x}" y="${y}" width="${sw}" height="${sd}" rx="3" fill="#e9eef7" stroke="#8798b5" stroke-width="2"/>
      <rect x="${cx}" y="${cy}" width="${cw}" height="${cd}" rx="2" fill="#dbe5ff" stroke="#315ce8" stroke-width="2"/>
      <line x1="${cx+(cw-doorW)/2}" y1="${cy+cd}" x2="${cx+(cw+doorW)/2}" y2="${cy+cd}" stroke="#315ce8" stroke-width="5"/>
      <text x="${W/2}" y="${Math.max(16,y-12)}" text-anchor="middle" font-size="11" fill="#53627b">SHAFT ${p.shaftWidth} × ${p.shaftDepth} mm</text>
      <text x="${W/2}" y="${cy+cd/2}" text-anchor="middle" font-size="11" font-weight="700" fill="#3150a8">CAR</text>
      <text x="${W/2}" y="${Math.min(H-10,y+sd+22)}" text-anchor="middle" font-size="10" fill="#315ce8">DOOR ${p.doorWidth} mm</text>
      <line x1="${x}" y1="${H-27}" x2="${x+sw}" y2="${H-27}" stroke="#71809b" marker-start="url(#arr)" marker-end="url(#arr)"/>
      <text x="${W/2}" y="${H-13}" text-anchor="middle" font-size="9" fill="#71809b">Indicative plan · not to scale for construction</text>`;
  }
};
