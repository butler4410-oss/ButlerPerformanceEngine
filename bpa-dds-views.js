// BPA DDS DATA VIEWS — renders employees, daily_sales, stores, categories, services
(function() {

// ── STORE NAME LOOKUP ──
window.getStoreDisplayName = function(num) {
  var s = (DATA.stores || []).find(function(r) { return String(r.Store_Number) === String(num) || String(r.Store_Id) === String(num); });
  return s ? '#' + num + ' — ' + (s.Store_Name || '').replace(/JIFFY LUBE\s*#?\s*/i, 'JL ') + (s.City ? ' (' + s.City + ')' : '') : '#' + num;
};

// ── DAILY SALES TRENDS (full year from pre-aggregated data) ──
function renderDailySalesTrends() {
  var ds = DATA.daily_sales;
  if (!ds || !ds.length) return;

  // Find or create container after the KPI grid
  var target = document.getElementById('dailySalesTrends');
  if (!target) {
    var biz = document.getElementById('view-business');
    if (!biz) return;
    var d = document.createElement('div');
    d.id = 'dailySalesTrends';
    d.className = 'reveal';
    d.style.marginBottom = '24px';
    // Insert after BPA insights
    var bpa = document.getElementById('bpaOverview');
    if (bpa && bpa.parentElement) bpa.parentElement.parentElement.insertAdjacentElement('afterend', d);
    else biz.appendChild(d);
    target = d;
  }

  // Aggregate by date
  var byDate = {};
  ds.forEach(function(r) {
    var day = r.Operations_Day || '';
    var d = r._d || new Date(day);
    if (!d || isNaN(d.getTime())) return;
    var key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    if (!byDate[key]) byDate[key] = { rev: 0, cars: 0, inv: 0, bayTime: [], waitTime: [], totalTime: [], pmm: 0, pmmCars: 0, repeat: 0, repeatRev: 0 };
    byDate[key].rev += (+r.Net_Sales || 0);
    byDate[key].cars += (+r.Vehicle_Count || 0);
    byDate[key].inv += (+r.Invoice_Count || 0);
    var bt = +r.Bay_Start_To_Bay_End_Time;
    if (bt > 0) byDate[key].bayTime.push(bt);
    var wt = +r.Greet_Start_To_Bay_Start_Time;
    if (wt > 0) byDate[key].waitTime.push(wt);
    var tt = +r.Start_To_Finish_Time;
    if (tt > 0) byDate[key].totalTime.push(tt);
    byDate[key].pmm += (+r.PMM_Vehicle_Count || 0);
    byDate[key].pmmCars += (+r.Vehicle_Count || 0);
    byDate[key].repeat += (+r.Repeat_Customer_Count || 0);
    byDate[key].repeatRev += (+r.Repeat_Customer_Dollars || 0);
  });

  var dates = Object.keys(byDate).sort();
  if (dates.length < 7) return;

  // Weekly aggregation for smoother trends
  var weeks = [];
  for (var i = 0; i < dates.length; i += 7) {
    var chunk = dates.slice(i, i + 7);
    var w = { rev: 0, cars: 0, bayAvg: 0, waitAvg: 0, pmmPct: 0, repeatPct: 0, label: chunk[0] };
    var baySum = 0, bayN = 0, waitSum = 0, waitN = 0, pmmTotal = 0, carsTotal = 0, repTotal = 0;
    chunk.forEach(function(d) {
      var dd = byDate[d];
      w.rev += dd.rev;
      w.cars += dd.cars;
      dd.bayTime.forEach(function(t) { baySum += t; bayN++; });
      dd.waitTime.forEach(function(t) { waitSum += t; waitN++; });
      pmmTotal += dd.pmm;
      carsTotal += dd.pmmCars;
      repTotal += dd.repeat;
    });
    w.bayAvg = bayN ? baySum / bayN / 60 : 0; // seconds to minutes
    w.waitAvg = waitN ? waitSum / waitN / 60 : 0;
    w.pmmPct = carsTotal ? pmmTotal / carsTotal * 100 : 0;
    w.repeatPct = carsTotal ? repTotal / carsTotal * 100 : 0;
    weeks.push(w);
  }

  var wLabels = weeks.map(function(w) { return w.label; });

  target.innerHTML = '<div style="margin-bottom:12px;"><h3 style="font-size:14px;font-weight:700;color:var(--text);border-left:4px solid #4da6ff;padding-left:12px;">Full Year Trends <span style="font-weight:400;color:var(--text-muted);font-size:11px;">(from daily_sales — ' + ds.length.toLocaleString() + ' daily records)</span></h3></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">' +
    '<div class="chart-card" style="border-top:3px solid #4da6ff;"><h3>Weekly Revenue</h3><div class="chart-wrap" style="height:220px;"><canvas id="dsTrendRev"></canvas></div></div>' +
    '<div class="chart-card" style="border-top:3px solid #00e68a;"><h3>Weekly Cars Serviced</h3><div class="chart-wrap" style="height:220px;"><canvas id="dsTrendCars"></canvas></div></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">' +
    '<div class="chart-card" style="border-top:3px solid #a78bfa;"><h3>Avg Bay Time (min)</h3><div class="chart-wrap" style="height:200px;"><canvas id="dsTrendBay"></canvas></div></div>' +
    '<div class="chart-card" style="border-top:3px solid #ff8c42;"><h3>PMM Penetration %</h3><div class="chart-wrap" style="height:200px;"><canvas id="dsTrendPMM"></canvas></div></div>' +
    '<div class="chart-card" style="border-top:3px solid #5eead4;"><h3>Repeat Customer %</h3><div class="chart-wrap" style="height:200px;"><canvas id="dsTrendRepeat"></canvas></div></div>' +
    '</div>';

  makeChart('dsTrendRev', { type: 'line', data: { labels: wLabels, datasets: [{ label: 'Revenue', data: weeks.map(function(w) { return w.rev; }), borderColor: '#4da6ff', backgroundColor: 'rgba(77,166,255,0.1)', fill: true, tension: 0.3, pointRadius: 0 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: function(v) { return '$' + (v/1000).toFixed(0) + 'K'; } } } } } });
  makeChart('dsTrendCars', { type: 'bar', data: { labels: wLabels, datasets: [{ label: 'Vehicles', data: weeks.map(function(w) { return w.cars; }), backgroundColor: 'rgba(0,230,138,0.6)', borderRadius: 3 }] }, options: { plugins: { legend: { display: false } } } });
  makeChart('dsTrendBay', { type: 'line', data: { labels: wLabels, datasets: [{ label: 'Bay Time', data: weeks.map(function(w) { return w.bayAvg; }), borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.1)', fill: true, tension: 0.3, pointRadius: 0 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: function(v) { return v.toFixed(0) + 'm'; } } } } } });
  makeChart('dsTrendPMM', { type: 'line', data: { labels: wLabels, datasets: [{ label: 'PMM %', data: weeks.map(function(w) { return w.pmmPct; }), borderColor: '#ff8c42', backgroundColor: 'rgba(255,140,66,0.1)', fill: true, tension: 0.3, pointRadius: 0 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: function(v) { return v.toFixed(0) + '%'; } }, max: 100 } } } });
  makeChart('dsTrendRepeat', { type: 'line', data: { labels: wLabels, datasets: [{ label: 'Repeat %', data: weeks.map(function(w) { return w.repeatPct; }), borderColor: '#5eead4', backgroundColor: 'rgba(94,234,212,0.1)', fill: true, tension: 0.3, pointRadius: 0 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: function(v) { return v.toFixed(0) + '%'; } } } } } });
}

// ── EMPLOYEE ROSTER ──
function renderEmployeeRoster() {
  var emp = DATA.employees;
  if (!emp || !emp.length) return;

  var target = document.getElementById('employeeRoster');
  if (!target) {
    var dr = document.getElementById('view-dataroom');
    if (!dr) return;
    var d = document.createElement('div');
    d.id = 'employeeRoster';
    d.className = 'reveal';
    d.style.marginBottom = '24px';
    dr.appendChild(d);
    target = d;
  }

  var active = emp.filter(function(e) { return e.Active_Flag === 'TRUE' || e.Active_Flag === '1' || e.Active_Flag === 'true'; });
  var byStore = {};
  active.forEach(function(e) {
    var s = e.Home_Store_Id || 'Unknown';
    if (!byStore[s]) byStore[s] = [];
    byStore[s].push(e);
  });

  var html = '<div style="margin-bottom:12px;"><h3 style="font-size:14px;font-weight:700;color:var(--text);border-left:4px solid #00e68a;padding-left:12px;">Employee Roster <span style="font-weight:400;color:var(--text-muted);font-size:11px;">(' + active.length + ' active of ' + emp.length + ' total)</span></h3></div>';
  html += '<div class="table-wrap"><h3>Active Employees by Store</h3><div class="table-scroll" style="max-height:400px;"><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Store</th><th style="text-align:left;">Hire Date</th><th style="text-align:left;">Phone</th></tr></thead><tbody>';

  active.sort(function(a, b) { return (a.Home_Store_Id || '').localeCompare(b.Home_Store_Id || '', undefined, {numeric: true}); }).forEach(function(e) {
    var name = ((e.First_Name || '') + ' ' + (e.Last_Name || '')).trim() || 'Unknown';
    var hireDate = e.Hire_Date ? new Date(e.Hire_Date) : null;
    var hireFmt = hireDate && !isNaN(hireDate.getTime()) ? (hireDate.getMonth()+1) + '/' + hireDate.getDate() + '/' + hireDate.getFullYear() : '--';
    html += '<tr class="clickable-row" onclick="navigateTo(\'stores/' + escapeHTML(e.Home_Store_Id || '') + '\')"><td style="text-align:left;">' + escapeHTML(name) + '</td><td style="text-align:left;">#' + escapeHTML(e.Home_Store_Id || '?') + '</td><td style="text-align:left;">' + hireFmt + '</td><td style="text-align:left;">' + escapeHTML(e.Phone_Number || '--') + '</td></tr>';
  });

  html += '</tbody></table></div></div>';

  // Employee count by store chart
  var storeArr = Object.entries(byStore).sort(function(a, b) { return b[1].length - a[1].length; });
  html += '<div class="chart-card" style="border-top:3px solid #00e68a;margin-top:16px;"><h3>Employees per Store</h3><div class="chart-wrap" style="height:220px;"><canvas id="empByStoreChart"></canvas></div></div>';

  target.innerHTML = html;

  if (storeArr.length) {
    makeChart('empByStoreChart', { type: 'bar', data: { labels: storeArr.slice(0, 20).map(function(e) { return '#' + e[0]; }), datasets: [{ label: 'Employees', data: storeArr.slice(0, 20).map(function(e) { return e[1].length; }), backgroundColor: 'rgba(0,230,138,0.6)', borderRadius: 4 }] }, options: { plugins: { legend: { display: false } } } });
  }
}

// ── STORE DIRECTORY ──
function renderStoreDirectory() {
  var stores = DATA.stores;
  if (!stores || !stores.length) return;

  // Update filter dropdown with store names
  var sel = document.getElementById('filterStore');
  if (sel && sel.options.length > 1) {
    for (var i = 1; i < sel.options.length; i++) {
      var num = sel.options[i].value;
      var store = stores.find(function(s) { return String(s.Store_Number) === num || String(s.Store_Id) === num; });
      if (store && store.Store_Name) {
        sel.options[i].textContent = '#' + num + ' — ' + (store.Store_Name || '').replace(/JIFFY LUBE\s*#?\s*/i, 'JL ').trim();
      }
    }
  }
}

// ── HOOK INTO RENDER PIPELINE ──
var _origRenderDashboard = typeof renderDashboard === 'function' ? renderDashboard : null;
if (_origRenderDashboard) {
  window.renderDashboard = function() {
    _origRenderDashboard.apply(this, arguments);
    try { renderDailySalesTrends(); } catch(e) { console.warn('dailySalesTrends:', e); }
    try { renderEmployeeRoster(); } catch(e) { console.warn('employeeRoster:', e); }
    try { renderStoreDirectory(); } catch(e) { console.warn('storeDirectory:', e); }
  };
}

})();
