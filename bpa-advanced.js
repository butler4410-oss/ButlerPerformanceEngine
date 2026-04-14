// ============================================================
// BPA ADVANCED FEATURES
// Trend Arrows, Revenue Heatmap, Customer Intelligence,
// Service Mix Optimization, Smart Alerts
// ============================================================

// ── TREND ARROWS ──
function buildTrendBadge(trend) {
  if (trend == null || isNaN(trend.pctChange)) return '';
  var pv = trend.pctChange;
  if (Math.abs(pv) < 0.5) return '<div class="kpi-trend trend-flat">&#8596; 0.0%</div>';
  var cls = pv > 0 ? 'trend-up' : 'trend-down';
  var arrow = pv > 0 ? '&#9650;' : '&#9660;';
  var sign = pv > 0 ? '+' : '';
  return '<div class="kpi-trend ' + cls + '" title="' + escapeHTML(trend.label || 'vs prior period') + '">' + arrow + ' ' + sign + pv.toFixed(1) + '%</div>';
}

function computePriorPeriodDates() {
  var dates = FILTERED.customers.map(function(r) { return parseDate(r.Invoice_Date); }).filter(Boolean);
  if (dates.length < 2) return null;
  var minD = new Date(Math.min.apply(null, dates));
  var maxD = new Date(Math.max.apply(null, dates));
  var spanMs = maxD - minD;
  if (spanMs < 86400000) return null;
  var priorEnd = new Date(minD.getTime() - 86400000);
  var priorStart = new Date(priorEnd.getTime() - spanMs);
  return { currentStart: minD, currentEnd: maxD, priorStart: priorStart, priorEnd: priorEnd };
}

function computeOverviewTrends(cust) {
  var periods = computePriorPeriodDates();
  if (!periods) return {};
  var priorCust = DATA.customers.filter(function(r) { var d = parseDate(r.Invoice_Date); return d && d >= periods.priorStart && d <= periods.priorEnd; });
  if (!priorCust.length) return {};
  var curRev = cust.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0);
  var priRev = priorCust.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0);
  var curAvg = cust.length ? curRev / cust.length : 0;
  var priAvg = priorCust.length ? priRev / priorCust.length : 0;
  var curCount = cust.length, priCount = priorCust.length;
  var curDatesSet = new Set(cust.map(function(r) { var d = parseDate(r.Invoice_Date); return d ? fmtDateISO(d) : null; }).filter(Boolean));
  var priDatesSet = new Set(priorCust.map(function(r) { var d = parseDate(r.Invoice_Date); return d ? fmtDateISO(d) : null; }).filter(Boolean));
  var curStores = new Set(cust.map(function(r) { return r.Store_Number; }).filter(Boolean));
  var priStores = new Set(priorCust.map(function(r) { return r.Store_Number; }).filter(Boolean));
  var curCPD = curDatesSet.size && curStores.size ? curCount / curDatesSet.size / curStores.size : 0;
  var priCPD = priDatesSet.size && priStores.size ? priCount / priDatesSet.size / priStores.size : 0;
  var result = {};
  var pc = function(cur, pri) { return pri !== 0 ? ((cur - pri) / Math.abs(pri) * 100) : null; };
  var label = 'vs prior period';
  var c = pc(curRev, priRev); if (c != null) result['Net Sales'] = { pctChange: c, label: label };
  c = pc(curAvg, priAvg); if (c != null) result['Ticket Average'] = { pctChange: c, label: label };
  c = pc(curCPD, priCPD); if (c != null) result['Cars / Day'] = { pctChange: c, label: label };
  c = pc(curCount, priCount); if (c != null) result['Vehicles Serviced'] = { pctChange: c, label: label };
  return result;
}

function computeTrendData() {
  var periods = computePriorPeriodDates();
  if (!periods) return {};
  var fp = function(arr) { return arr.filter(function(r) { var d = parseDate(r.Invoice_Date || r.From_Date); return d && d >= periods.priorStart && d <= periods.priorEnd; }); };
  var priorCust = fp(DATA.customers), priorDet = fp(DATA.details), priorPromo = fp(DATA.promos), priorInsp = fp(DATA.inspections);
  if (!priorCust.length) return {};
  var result = {}, label = 'vs prior period';
  var pc = function(cur, pri) { return pri !== 0 ? ((cur - pri) / Math.abs(pri) * 100) : null; };
  var c;
  c = pc(FILTERED.customers.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0), priorCust.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0));
  if (c != null) result['total_revenue'] = { pctChange: c, label: label };
  var curAvg = FILTERED.customers.length ? FILTERED.customers.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0) / FILTERED.customers.length : 0;
  var priAvg = priorCust.length ? priorCust.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0) / priorCust.length : 0;
  c = pc(curAvg, priAvg); if (c != null) result['avg_ticket'] = { pctChange: c, label: label };
  c = pc(FILTERED.customers.length, priorCust.length); if (c != null) result['total_invoices'] = { pctChange: c, label: label };
  c = pc(FILTERED.details.reduce(function(s, r) { return s + (+r.Quantity_Sold || 0); }, 0), priorDet.reduce(function(s, r) { return s + (+r.Quantity_Sold || 0); }, 0));
  if (c != null) result['total_qty_sold'] = { pctChange: c, label: label };
  c = pc(FILTERED.promos.length, priorPromo.length); if (c != null) result['promo_uses'] = { pctChange: c, label: label };
  c = pc(new Set(FILTERED.inspections.map(function(r) { return r.Invoice_Number; })).size, new Set(priorInsp.map(function(r) { return r.Invoice_Number; })).size);
  if (c != null) result['insp_total'] = { pctChange: c, label: label };
  var curEC = FILTERED.customers.filter(function(r) { return r.Customer_Email_Address && r.Customer_Email_Address.trim(); }).length;
  var priEC = priorCust.filter(function(r) { return r.Customer_Email_Address && r.Customer_Email_Address.trim(); }).length;
  var curEP = FILTERED.customers.length ? curEC / FILTERED.customers.length * 100 : 0;
  var priEP = priorCust.length ? priEC / priorCust.length * 100 : 0;
  c = pc(curEP, priEP); if (c != null) result['email_capture'] = { pctChange: c, label: label };
  return result;
}

// ── REVENUE HEATMAP ──
function renderRevenueHeatmap() {
  var cust = FILTERED.customers, wrap = document.getElementById('revenueHeatmapWrap'), grid = document.getElementById('revenueHeatmapGrid');
  if (!wrap || !grid) return;
  if (!cust.length) { wrap.style.display = 'none'; return; }
  function parseDH(ds) { if (!ds) return null; var d = parseDate(ds); if (!d) return null; var tm = ds.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/); var hour = 12; if (tm) { hour = parseInt(tm[1]); var ap = (tm[4] || '').toUpperCase(); if (ap === 'PM' && hour < 12) hour += 12; if (ap === 'AM' && hour === 12) hour = 0; } return { day: d.getDay(), hour: hour }; }
  var data = {}, dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], hours = [];
  for (var hh = 7; hh <= 19; hh++) hours.push(hh);
  dayNames.forEach(function(_, d) { data[d] = {}; hours.forEach(function(h) { data[d][h] = { rev: 0, count: 0 }; }); });
  cust.forEach(function(r) { var dh = parseDH(r.Invoice_Date); if (!dh) return; var h = Math.max(7, Math.min(19, dh.hour)); data[dh.day][h].rev += (+r.Net_Sales || 0); data[dh.day][h].count += 1; });
  var maxRev = 0;
  dayNames.forEach(function(_, d) { hours.forEach(function(h) { if (data[d][h].rev > maxRev) maxRev = data[d][h].rev; }); });
  if (maxRev === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  var html = '<div class="heatmap-grid" style="grid-template-columns:50px repeat(' + hours.length + ',1fr);">';
  html += '<div class="heatmap-label"></div>';
  hours.forEach(function(h) { var l = h <= 12 ? h + (h < 12 ? 'a' : 'p') : (h - 12) + 'p'; html += '<div class="heatmap-label">' + l + '</div>'; });
  var dayOrder = [1, 2, 3, 4, 5, 6, 0];
  dayOrder.forEach(function(d) {
    html += '<div class="heatmap-label" style="font-weight:700;">' + dayNames[d] + '</div>';
    hours.forEach(function(h) {
      var cell = data[d][h], intensity = maxRev > 0 ? cell.rev / maxRev : 0;
      var bg = intensity > 0 ? 'rgba(0,200,83,' + (0.1 + intensity * 0.85).toFixed(2) + ')' : 'rgba(100,116,139,0.06)';
      var tc = intensity > 0.5 ? 'rgba(255,255,255,0.95)' : (intensity > 0 ? 'rgba(0,200,83,0.8)' : 'rgba(100,116,139,0.3)');
      var sv = cell.rev >= 1000 ? '$' + (cell.rev / 1000).toFixed(0) + 'K' : (cell.rev > 0 ? '$' + Math.round(cell.rev) : '');
      html += '<div class="heatmap-cell" style="background:' + bg + ';color:' + tc + ';" data-rev="' + cell.rev.toFixed(2) + '" data-count="' + cell.count + '" data-day="' + dayNames[d] + '" data-hour="' + h + '" onmouseenter="showHeatmapTip(event,this)" onmouseleave="hideHeatmapTip()" onclick="drillHeatmapCell(\'' + dayNames[d] + '\',' + h + ')">' + sv + '</div>';
    });
  });
  html += '</div>'; grid.innerHTML = html;
  var tbody = document.getElementById('revenueHeatmapTableBody');
  if (tbody) { var tbl = ''; dayOrder.forEach(function(d) { hours.forEach(function(h) { var c = data[d][h]; if (c.count > 0) tbl += '<tr><td>' + dayNames[d] + '</td><td>' + h + ':00</td><td>' + money(c.rev) + '</td><td>' + c.count + '</td></tr>'; }); }); tbody.innerHTML = tbl; }
}
function showHeatmapTip(e, el) { var tip = document.getElementById('heatmapTooltip'); if (!tip) return; var rev = parseFloat(el.dataset.rev) || 0, cnt = parseInt(el.dataset.count) || 0, dy = el.dataset.day, hr = parseInt(el.dataset.hour); var hl = hr <= 12 ? hr + ':00 ' + (hr < 12 ? 'AM' : 'PM') : (hr - 12) + ':00 PM'; tip.innerHTML = '<strong>' + dy + ' ' + hl + '</strong><br>Revenue: ' + money(rev) + '<br>Invoices: ' + num(cnt) + (cnt > 0 ? '<br>Avg Ticket: ' + money(rev / cnt) : ''); tip.style.display = 'block'; tip.style.left = (e.clientX + 12) + 'px'; tip.style.top = (e.clientY - 10) + 'px'; }
function hideHeatmapTip() { var tip = document.getElementById('heatmapTooltip'); if (tip) tip.style.display = 'none'; }
function drillHeatmapCell(dayName, hour) {
  var dm = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 }, dn = dm[dayName];
  var fn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hl = hour <= 12 ? hour + ':00 ' + (hour < 12 ? 'AM' : 'PM') : (hour - 12) + ':00 PM';
  var matching = FILTERED.customers.filter(function(r) { var d = parseDate(r.Invoice_Date); if (!d || d.getDay() !== dn) return false; var tm = (r.Invoice_Date || '').match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/); if (!tm) return true; var h = parseInt(tm[1]); var ap = (tm[4] || '').toUpperCase(); if (ap === 'PM' && h < 12) h += 12; if (ap === 'AM' && h === 12) h = 0; return h === hour; });
  openReportModal(fn[dn] + ' ' + hl + ' — ' + num(matching.length) + ' invoices', function(body) {
    var tr = matching.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0), at = matching.length ? tr / matching.length : 0;
    body.innerHTML = '<div class="kpi-grid" style="margin-bottom:16px;"><div class="kpi-card kpi-revenue"><div class="kpi-label">Revenue</div><div class="kpi-value">' + money(tr) + '</div></div><div class="kpi-card kpi-blue"><div class="kpi-label">Invoices</div><div class="kpi-value">' + num(matching.length) + '</div></div><div class="kpi-card kpi-green"><div class="kpi-label">Avg Ticket</div><div class="kpi-value">' + money(at) + '</div></div></div>';
    var t = '<div class="ops-grid-scroll" style="max-height:400px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Store</th><th style="text-align:left;">Invoice</th><th>Date</th><th>Net Sales</th></tr></thead><tbody>';
    matching.slice(0, 100).forEach(function(r) { t += '<tr class="clickable-row" onclick="navigateTo(\'stores/' + escapeHTML(r.Store_Number) + '\')"><td style="text-align:left;">#' + escapeHTML(r.Store_Number) + '</td><td style="text-align:left;">' + escapeHTML(r.Invoice_Number) + '</td><td>' + escapeHTML(r.Invoice_Date) + '</td><td>' + money(+r.Net_Sales || 0) + '</td></tr>'; });
    t += '</tbody></table></div>'; body.innerHTML += t;
  });
}

// ── CUSTOMER INTELLIGENCE ──
function getCustomerKey(r) { var e = (r.Customer_Email_Address || '').trim().toLowerCase(); if (e && e.indexOf('@') > 0) return 'email:' + e; var f = (r.Customer_First_Name || '').trim().toLowerCase(), l = (r.Customer_Last_Name || '').trim().toLowerCase(), p = (r.Customer_Phone_Number || '').trim().replace(/\D/g, ''); if (f && l && p) return 'name:' + f + '|' + l + '|' + p; if (f && l) return 'name:' + f + '|' + l; return null; }
function buildCustomerProfiles(rows) { var profiles = {}; rows.forEach(function(r) { var key = getCustomerKey(r); if (!key) return; if (!profiles[key]) profiles[key] = { key: key, name: ((r.Customer_First_Name || '') + ' ' + (r.Customer_Last_Name || '')).trim() || 'Unknown', email: (r.Customer_Email_Address || '').trim(), phone: (r.Customer_Phone_Number || '').trim(), totalSpend: 0, visits: 0, stores: new Set(), dates: [], invoices: [] }; var p = profiles[key]; p.totalSpend += (+r.Net_Sales || 0); p.visits += 1; if (r.Store_Number) p.stores.add(r.Store_Number); var d = parseDate(r.Invoice_Date); if (d) p.dates.push(d); p.invoices.push(r); }); Object.values(profiles).forEach(function(p) { p.dates.sort(function(a, b) { return a - b; }); }); return profiles; }

function renderCustomerIntelligence() {
  var cust = FILTERED.customers, section = document.getElementById('customerIntelSection');
  if (!section) return;
  if (!cust.length) { section.style.display = 'none'; return; }
  var profiles = buildCustomerProfiles(cust), profileArr = Object.values(profiles);
  if (profileArr.length < 5) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  var totalId = profileArr.length, repeatCust = profileArr.filter(function(p) { return p.visits > 1; }), repeatPct = totalId ? (repeatCust.length / totalId * 100) : 0;
  var allGaps = []; profileArr.forEach(function(p) { if (p.dates.length < 2) return; for (var i = 1; i < p.dates.length; i++) { var g = Math.round((p.dates[i] - p.dates[i - 1]) / 86400000); if (g > 0 && g < 365) allGaps.push(g); } });
  var avgDB = allGaps.length ? (allGaps.reduce(function(a, b) { return a + b; }, 0) / allGaps.length) : 0;
  var allDates = cust.map(function(r) { return parseDate(r.Invoice_Date); }).filter(Boolean);
  var maxDate = allDates.length ? new Date(Math.max.apply(null, allDates)) : new Date();
  var atRisk = profileArr.filter(function(p) { if (p.visits < 3) return false; var ld = p.dates[p.dates.length - 1]; return ld && Math.round((maxDate - ld) / 86400000) >= 60; });
  // KPIs
  var ciKPIs = document.getElementById('ciKPIs');
  if (ciKPIs) ciKPIs.innerHTML = '<div class="kpi-card kpi-blue clickable" onclick="drillCustomerList(\'all\')"><div class="kpi-label">Identified Customers</div><div class="kpi-value">' + num(totalId) + '</div><div class="kpi-sub">unique profiles</div></div><div class="kpi-card kpi-green clickable" onclick="drillCustomerList(\'repeat\')"><div class="kpi-label">Repeat Rate</div><div class="kpi-value">' + pct(repeatPct) + '</div><div class="kpi-sub">' + num(repeatCust.length) + ' multi-visit</div></div><div class="kpi-card kpi-teal clickable" onclick="drillCustomerList(\'all\')"><div class="kpi-label">Avg Days Between Visits</div><div class="kpi-value">' + (avgDB > 0 ? avgDB.toFixed(1) : '--') + '</div><div class="kpi-sub">' + num(allGaps.length) + ' visit gaps</div></div><div class="kpi-card kpi-red clickable" onclick="drillCustomerList(\'atrisk\')"><div class="kpi-label">At-Risk Customers</div><div class="kpi-value">' + num(atRisk.length) + '</div><div class="kpi-sub">60+ days absent</div></div>';
  // CLV Top 50
  var clvBody = document.getElementById('clvTop50Body');
  if (clvBody) { var sorted = profileArr.slice().sort(function(a, b) { return b.totalSpend - a.totalSpend; }).slice(0, 50); clvBody.innerHTML = sorted.map(function(p, i) { var lv = p.dates.length ? p.dates[p.dates.length - 1] : null, at = p.visits ? p.totalSpend / p.visits : 0; return '<tr class="clickable-row" style="cursor:pointer;" onclick="drillCustomerProfile(\'' + escapeHTML(p.key.replace(/'/g, "\\'")) + '\')"><td style="text-align:left;position:sticky;left:0;z-index:1;background:var(--card);"><strong>' + (i + 1) + '.</strong> ' + escapeHTML(p.name) + (p.email ? '<br><span style="font-size:10px;color:var(--text-muted);">' + escapeHTML(p.email) + '</span>' : '') + '</td><td style="color:var(--green);font-weight:700;">' + money(p.totalSpend) + '</td><td>' + p.visits + '</td><td>' + money(at) + '</td><td>' + (lv ? fmtDateISO(lv) : '--') + '</td><td>' + p.stores.size + '</td></tr>'; }).join(''); }
  // Visit Frequency
  var fb = { '1 visit': 0, '2-3 visits': 0, '4-6 visits': 0, '7+ visits': 0 };
  profileArr.forEach(function(p) { if (p.visits === 1) fb['1 visit']++; else if (p.visits <= 3) fb['2-3 visits']++; else if (p.visits <= 6) fb['4-6 visits']++; else fb['7+ visits']++; });
  makeChart('chartVisitFreq', { type: 'bar', data: { labels: Object.keys(fb), datasets: [{ label: 'Customers', data: Object.values(fb), backgroundColor: [PALETTE.blueLight, PALETTE.greenLight, PALETTE.yellowLight, PALETTE.redLight], borderRadius: 6, maxBarThickness: 80 }] }, options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: tooltipCount } } }, scales: { y: { beginAtZero: true, ticks: { callback: tickCount } } }, onClick: function(e, el) { if (!el.length) return; drillVisitBucket(Object.keys(fb)[el[0].index], profileArr); } } });
  // At-Risk Table
  var arBody = document.getElementById('atRiskBody');
  if (arBody) { var arS = atRisk.sort(function(a, b) { return Math.round((maxDate - b.dates[b.dates.length - 1]) / 86400000) - Math.round((maxDate - a.dates[a.dates.length - 1]) / 86400000); }).slice(0, 100); arBody.innerHTML = arS.length ? arS.map(function(p) { var ld = p.dates[p.dates.length - 1], ds = Math.round((maxDate - ld) / 86400000), at = p.visits ? p.totalSpend / p.visits : 0, urg = ds > 120 ? 'cell-red' : ds > 90 ? 'cell-orange' : 'cell-yellow'; return '<tr class="clickable-row" style="cursor:pointer;" onclick="drillCustomerProfile(\'' + escapeHTML(p.key.replace(/'/g, "\\'")) + '\')"><td style="text-align:left;position:sticky;left:0;z-index:1;background:var(--card);">' + escapeHTML(p.name) + (p.email ? '<br><span style="font-size:10px;color:var(--text-muted);">' + escapeHTML(p.email) + '</span>' : '') + '</td><td>' + money(p.totalSpend) + '</td><td>' + p.visits + '</td><td>' + fmtDateISO(ld) + '</td><td class="' + urg + '">' + ds + ' days</td><td>' + money(at) + '</td></tr>'; }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">No at-risk customers detected</td></tr>'; }
  // New vs Returning
  var monthData = {}, firstVisitDates = {}, allP = buildCustomerProfiles(DATA.customers);
  Object.values(allP).forEach(function(p) { if (p.dates.length) firstVisitDates[p.key] = p.dates[0]; });
  cust.forEach(function(r) { var key = getCustomerKey(r), d = parseDate(r.Invoice_Date); if (!key || !d) return; var mk = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); if (!monthData[mk]) monthData[mk] = { newCust: new Set(), retCust: new Set() }; var fd = firstVisitDates[key]; if (fd && fmtDateISO(fd) === fmtDateISO(d)) monthData[mk].newCust.add(key); else monthData[mk].retCust.add(key); });
  var months = Object.keys(monthData).sort();
  makeChart('chartNewVsReturn', { type: 'bar', data: { labels: months, datasets: [{ label: 'New', data: months.map(function(m) { return monthData[m].newCust.size; }), backgroundColor: PALETTE.blueLight, borderRadius: 4 }, { label: 'Returning', data: months.map(function(m) { return monthData[m].retCust.size; }), backgroundColor: PALETTE.greenLight, borderRadius: 4 }] }, options: { plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }, tooltip: { callbacks: { label: tooltipCount } } }, scales: { x: { stacked: true, ticks: { font: { size: 10 } } }, y: { stacked: true, beginAtZero: true, ticks: { callback: tickCount } } }, onClick: function(e, el) { if (!el.length) return; var m = months[el[0].index]; drillNewVsReturn(m, monthData[m]); } } });
  // Days Between Visits
  if (allGaps.length > 0) { var gb = { '1-7': 0, '8-14': 0, '15-30': 0, '31-60': 0, '61-90': 0, '91-180': 0, '180+': 0 }; allGaps.forEach(function(g) { if (g <= 7) gb['1-7']++; else if (g <= 14) gb['8-14']++; else if (g <= 30) gb['15-30']++; else if (g <= 60) gb['31-60']++; else if (g <= 90) gb['61-90']++; else if (g <= 180) gb['91-180']++; else gb['180+']++; }); makeChart('chartDaysBetween', { type: 'bar', data: { labels: Object.keys(gb).map(function(k) { return k + ' days'; }), datasets: [{ label: 'Visit Gaps', data: Object.values(gb), backgroundColor: PALETTE.tealLight, borderRadius: 6, maxBarThickness: 60 }] }, options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: tooltipCount } } }, scales: { y: { beginAtZero: true, ticks: { callback: tickCount } }, x: { ticks: { font: { size: 10 } } } } } }); }
}

function drillCustomerProfile(key) { var profiles = buildCustomerProfiles(FILTERED.customers), p = profiles[key]; if (!p) return; openReportModal('Customer: ' + p.name, function(body) { var at = p.visits ? p.totalSpend / p.visits : 0; var h = '<div class="kpi-grid" style="margin-bottom:16px;"><div class="kpi-card kpi-revenue"><div class="kpi-label">Lifetime Value</div><div class="kpi-value">' + money(p.totalSpend) + '</div></div><div class="kpi-card kpi-blue"><div class="kpi-label">Total Visits</div><div class="kpi-value">' + p.visits + '</div></div><div class="kpi-card kpi-green"><div class="kpi-label">Avg Ticket</div><div class="kpi-value">' + money(at) + '</div></div><div class="kpi-card kpi-purple"><div class="kpi-label">Stores Visited</div><div class="kpi-value">' + p.stores.size + '</div></div></div>'; h += '<div class="ops-grid-scroll" style="max-height:400px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Date</th><th style="text-align:left;">Store</th><th style="text-align:left;">Invoice</th><th>Net Sales</th></tr></thead><tbody>'; p.invoices.sort(function(a, b) { var da = parseDate(a.Invoice_Date), db = parseDate(b.Invoice_Date); return (db || 0) - (da || 0); }).forEach(function(r) { h += '<tr class="clickable-row" onclick="navigateTo(\'stores/' + escapeHTML(r.Store_Number) + '\')"><td style="text-align:left;">' + escapeHTML(r.Invoice_Date) + '</td><td style="text-align:left;">#' + escapeHTML(r.Store_Number) + '</td><td style="text-align:left;">' + escapeHTML(r.Invoice_Number) + '</td><td>' + money(+r.Net_Sales || 0) + '</td></tr>'; }); h += '</tbody></table></div>'; body.innerHTML = h; }); }
function drillCustomerList(type) { var profiles = Object.values(buildCustomerProfiles(FILTERED.customers)); var allDates = FILTERED.customers.map(function(r) { return parseDate(r.Invoice_Date); }).filter(Boolean); var maxDate = allDates.length ? new Date(Math.max.apply(null, allDates)) : new Date(); var list = profiles, title = 'All Identified Customers'; if (type === 'repeat') { list = profiles.filter(function(p) { return p.visits > 1; }); title = 'Repeat Customers'; } if (type === 'atrisk') { list = profiles.filter(function(p) { return p.visits >= 3 && p.dates.length && Math.round((maxDate - p.dates[p.dates.length - 1]) / 86400000) >= 60; }); title = 'At-Risk Customers'; } list.sort(function(a, b) { return b.totalSpend - a.totalSpend; }); openReportModal(title + ' (' + num(list.length) + ')', function(body) { var h = '<div class="ops-grid-scroll" style="max-height:500px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Customer</th><th>Total Spend</th><th>Visits</th><th>Last Visit</th><th>Avg Ticket</th></tr></thead><tbody>'; list.slice(0, 200).forEach(function(p) { var lv = p.dates.length ? p.dates[p.dates.length - 1] : null; h += '<tr class="clickable-row" style="cursor:pointer;" onclick="drillCustomerProfile(\'' + escapeHTML(p.key.replace(/'/g, "\\'")) + '\')"><td style="text-align:left;">' + escapeHTML(p.name) + '</td><td>' + money(p.totalSpend) + '</td><td>' + p.visits + '</td><td>' + (lv ? fmtDateISO(lv) : '--') + '</td><td>' + money(p.visits ? p.totalSpend / p.visits : 0) + '</td></tr>'; }); h += '</tbody></table></div>'; body.innerHTML = h; }); }
function drillVisitBucket(bl, pa) { var f = []; if (bl.indexOf('1') === 0) f = pa.filter(function(p) { return p.visits === 1; }); else if (bl.indexOf('2') === 0) f = pa.filter(function(p) { return p.visits >= 2 && p.visits <= 3; }); else if (bl.indexOf('4') === 0) f = pa.filter(function(p) { return p.visits >= 4 && p.visits <= 6; }); else f = pa.filter(function(p) { return p.visits >= 7; }); f.sort(function(a, b) { return b.totalSpend - a.totalSpend; }); openReportModal(bl + ' (' + num(f.length) + ' customers)', function(body) { var h = '<div class="ops-grid-scroll" style="max-height:500px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Customer</th><th>Total Spend</th><th>Visits</th><th>Avg Ticket</th></tr></thead><tbody>'; f.slice(0, 150).forEach(function(p) { h += '<tr class="clickable-row" onclick="drillCustomerProfile(\'' + escapeHTML(p.key.replace(/'/g, "\\'")) + '\')"><td style="text-align:left;">' + escapeHTML(p.name) + '</td><td>' + money(p.totalSpend) + '</td><td>' + p.visits + '</td><td>' + money(p.visits ? p.totalSpend / p.visits : 0) + '</td></tr>'; }); h += '</tbody></table></div>'; body.innerHTML = h; }); }
function drillNewVsReturn(month, data) { var ap = buildCustomerProfiles(FILTERED.customers), nl = Array.from(data.newCust).map(function(k) { return ap[k]; }).filter(Boolean), rl = Array.from(data.retCust).map(function(k) { return ap[k]; }).filter(Boolean); openReportModal(month + ' — New (' + nl.length + ') vs Returning (' + rl.length + ')', function(body) { var h = '<h4 style="margin-bottom:8px;color:var(--blue);">New Customers (' + nl.length + ')</h4><div class="ops-grid-scroll" style="max-height:200px;margin-bottom:16px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Customer</th><th>Spend</th></tr></thead><tbody>'; nl.sort(function(a, b) { return b.totalSpend - a.totalSpend; }).slice(0, 50).forEach(function(p) { h += '<tr class="clickable-row" onclick="drillCustomerProfile(\'' + escapeHTML(p.key.replace(/'/g, "\\'")) + '\')"><td style="text-align:left;">' + escapeHTML(p.name) + '</td><td>' + money(p.totalSpend) + '</td></tr>'; }); h += '</tbody></table></div><h4 style="margin-bottom:8px;color:var(--green);">Returning (' + rl.length + ')</h4><div class="ops-grid-scroll" style="max-height:200px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Customer</th><th>Spend</th><th>Visits</th></tr></thead><tbody>'; rl.sort(function(a, b) { return b.totalSpend - a.totalSpend; }).slice(0, 50).forEach(function(p) { h += '<tr class="clickable-row" onclick="drillCustomerProfile(\'' + escapeHTML(p.key.replace(/'/g, "\\'")) + '\')"><td style="text-align:left;">' + escapeHTML(p.name) + '</td><td>' + money(p.totalSpend) + '</td><td>' + p.visits + '</td></tr>'; }); h += '</tbody></table></div>'; body.innerHTML = h; }); }

// ── SERVICE MIX OPTIMIZATION ──
function renderServiceMixOptimization() {
  var det = FILTERED.details, cust = FILTERED.customers, section = document.getElementById('serviceMixOptSection');
  if (!section) return; if (!det.length || !cust.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  var totalInvoices = new Set(cust.map(function(r) { return r.Invoice_Number; })).size || cust.length;
  var storeSet = new Set(), stores = []; cust.forEach(function(r) { if (r.Store_Number && !storeSet.has(r.Store_Number)) { storeSet.add(r.Store_Number); stores.push(r.Store_Number); } });
  var catInvoices = {}, catRevenue = {};
  det.forEach(function(r) { var cat = (r.JLI_Category_Code || 'OTHER').toUpperCase(); if (!catInvoices[cat]) catInvoices[cat] = new Set(); catInvoices[cat].add(r.Invoice_Number || r.Store_Number + '|' + r.Invoice_Date); catRevenue[cat] = (catRevenue[cat] || 0) + (+r.Extended_Price || 0); });
  var totalDetRev = det.reduce(function(s, r) { return s + (+r.Extended_Price || 0); }, 0);
  var catArr = Object.keys(catInvoices).map(function(cat) { return { cat: cat, invoices: catInvoices[cat].size, attachPct: totalInvoices ? (catInvoices[cat].size / totalInvoices * 100) : 0, revenue: catRevenue[cat] || 0, avgPrice: catInvoices[cat].size ? (catRevenue[cat] || 0) / catInvoices[cat].size : 0, revShare: totalDetRev ? ((catRevenue[cat] || 0) / totalDetRev * 100) : 0 }; }).sort(function(a, b) { return b.attachPct - a.attachPct; });
  // Attach Rate Table
  var arBody = document.getElementById('attachRateBody');
  if (arBody) arBody.innerHTML = catArr.map(function(c) { var ac = c.attachPct > 50 ? 'cell-green' : c.attachPct > 20 ? 'cell-yellow' : 'cell-red'; return '<tr class="clickable-row" style="cursor:pointer;" onclick="drillAttachCategory(\'' + escapeHTML(c.cat) + '\')"><td style="text-align:left;position:sticky;left:0;z-index:1;background:var(--card);font-weight:600;">' + escapeHTML(c.cat) + '</td><td>' + num(c.invoices) + '</td><td class="' + ac + '">' + pct(c.attachPct) + '</td><td>' + money(c.revenue) + '</td><td>' + money(c.avgPrice) + '</td><td>' + pct(c.revShare) + '</td></tr>'; }).join('');
  // Cross-Sell Matrix
  var container = document.getElementById('crossSellMatrixContainer');
  if (container) { var invCats = {}; det.forEach(function(r) { var inv = r.Invoice_Number || (r.Store_Number + '|' + r.Invoice_Date), cat = (r.JLI_Category_Code || 'OTHER').toUpperCase(); if (!invCats[inv]) invCats[inv] = new Set(); invCats[inv].add(cat); }); var topCats = catArr.slice(0, 8).map(function(c) { return c.cat; }), coOccur = {}; topCats.forEach(function(a) { coOccur[a] = {}; topCats.forEach(function(b) { coOccur[a][b] = 0; }); }); Object.values(invCats).forEach(function(cats) { var arr = Array.from(cats).filter(function(c) { return topCats.indexOf(c) >= 0; }); for (var i = 0; i < arr.length; i++) for (var j = 0; j < arr.length; j++) coOccur[arr[i]][arr[j]]++; }); var maxCo = 0; topCats.forEach(function(a) { topCats.forEach(function(b) { if (a !== b && coOccur[a][b] > maxCo) maxCo = coOccur[a][b]; }); }); var mH = '<div class="cross-sell-matrix" style="grid-template-columns:70px repeat(' + topCats.length + ',1fr);"><div></div>'; topCats.forEach(function(c) { mH += '<div style="font-size:9px;font-weight:700;color:var(--text-muted);text-align:center;padding:4px 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + escapeHTML(c) + '">' + escapeHTML(c.length > 8 ? c.slice(0, 7) + '..' : c) + '</div>'; }); topCats.forEach(function(a) { mH += '<div style="font-size:9px;font-weight:700;color:var(--text-muted);padding:4px 2px;display:flex;align-items:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + escapeHTML(a) + '">' + escapeHTML(a.length > 8 ? a.slice(0, 7) + '..' : a) + '</div>'; topCats.forEach(function(b) { var v = coOccur[a][b], int2 = a === b ? 0.3 : (maxCo > 0 ? v / maxCo : 0), bg = a === b ? 'rgba(100,116,139,0.1)' : (int2 > 0 ? 'rgba(37,99,235,' + (0.08 + int2 * 0.6).toFixed(2) + ')' : 'rgba(100,116,139,0.03)'), tc = a === b ? 'var(--text-muted)' : (int2 > 0.4 ? 'white' : 'var(--text)'); mH += '<div class="cross-sell-cell" style="background:' + bg + ';color:' + tc + ';" title="' + escapeHTML(a) + ' + ' + escapeHTML(b) + ': ' + v + ' invoices" onclick="drillCrossSell(\'' + escapeHTML(a) + '\',\'' + escapeHTML(b) + '\')">' + (v > 0 ? v : '') + '</div>'; }); }); mH += '</div>'; container.innerHTML = mH; }
  // Revenue per Bay Hour
  var sbd = {}; cust.forEach(function(r) { var s = r.Store_Number; if (!s) return; if (!sbd[s]) sbd[s] = { rev: 0, bayMin: 0 }; sbd[s].rev += (+r.Net_Sales || 0); var m = diffMinutes(r.Bay_Start_Time, r.Bay_End_Time); if (m != null && m > 0 && m < 180) sbd[s].bayMin += m; });
  var bayStores = Object.entries(sbd).filter(function(e) { return e[1].bayMin > 0; }).map(function(e) { return { store: e[0], rpbh: e[1].bayMin > 0 ? (e[1].rev / (e[1].bayMin / 60)) : 0 }; }).sort(function(a, b) { return b.rpbh - a.rpbh; });
  if (bayStores.length > 0) makeChart('chartRevPerBayHour', { type: 'bar', data: { labels: bayStores.map(function(s) { return '#' + s.store; }), datasets: [{ label: 'Rev/Bay Hour', data: bayStores.map(function(s) { return s.rpbh; }), backgroundColor: bayStores.map(function(s, i) { return i < bayStores.length / 3 ? PALETTE.greenLight : i < bayStores.length * 2 / 3 ? PALETTE.blueLight : PALETTE.redLight; }), borderRadius: 4, maxBarThickness: 50 }] }, options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return '#' + bayStores[ctx.dataIndex].store + ': ' + money(ctx.parsed.y) + '/bay hour'; } } } }, scales: { y: { beginAtZero: true, ticks: { callback: tickMoney } }, x: { ticks: { font: { size: 10 } } } }, onClick: function(e, el) { if (!el.length) return; navigateTo('stores/' + bayStores[el[0].index].store); } } });
  // Upsell Opportunity
  var netAttach = {}, netAvgP = {}; catArr.forEach(function(c) { netAttach[c.cat] = c.attachPct; netAvgP[c.cat] = c.avgPrice; });
  var uBody = document.getElementById('upsellOpptyBody');
  if (uBody && stores.length > 1) {
    var ss = stores.map(function(store) { var sc = cust.filter(function(r) { return r.Store_Number === store; }), sd = det.filter(function(r) { return r.Store_Number === store; }), si = new Set(sc.map(function(r) { return r.Invoice_Number; })).size || sc.length; var sci = {}; sd.forEach(function(r) { var cat = (r.JLI_Category_Code || 'OTHER').toUpperCase(); if (!sci[cat]) sci[cat] = new Set(); sci[cat].add(r.Invoice_Number || (r.Store_Number + '|' + r.Invoice_Date)); }); var tmr = 0, sa = 0, cc = 0; Object.keys(netAttach).forEach(function(cat) { var stA = si ? ((sci[cat] ? sci[cat].size : 0) / si * 100) : 0; var gap = netAttach[cat] - stA; if (gap > 0) tmr += (gap / 100) * si * (netAvgP[cat] || 0); sa += stA; cc++; }); sa = cc ? sa / cc : 0; var na = catArr.reduce(function(s, c) { return s + c.attachPct; }, 0) / (catArr.length || 1); return { store: store, invoices: si, storeAttach: sa, networkAvg: na, gap: na - sa, missedRev: tmr, score: tmr }; }).sort(function(a, b) { return b.score - a.score; });
    uBody.innerHTML = ss.map(function(s) { var gc = s.gap > 10 ? 'cell-red' : s.gap > 5 ? 'cell-yellow' : 'cell-green'; return '<tr class="clickable-row" style="cursor:pointer;" onclick="navigateTo(\'stores/' + escapeHTML(s.store) + '\')"><td style="text-align:left;position:sticky;left:0;z-index:1;background:var(--card);font-weight:600;">#' + escapeHTML(s.store) + '</td><td>' + num(s.invoices) + '</td><td>' + pct(s.storeAttach) + '</td><td>' + pct(s.networkAvg) + '</td><td class="' + gc + '">' + (s.gap > 0 ? '-' : '+') + pct(Math.abs(s.gap)) + '</td><td style="color:var(--red);">' + money(s.missedRev) + '</td><td style="font-weight:700;">' + money(s.score) + '</td></tr>'; }).join('');
    var smoKPIs = document.getElementById('smoKPIs');
    if (smoKPIs) { var tm = ss.reduce(function(s, x) { return s + x.missedRev; }, 0), aa = catArr.length ? catArr.reduce(function(s, c) { return s + c.attachPct; }, 0) / catArr.length : 0, tcp = findTopCrossSellPair(det); smoKPIs.innerHTML = '<div class="kpi-card kpi-revenue clickable" onclick="drillAttachOverview()"><div class="kpi-label">Categories Tracked</div><div class="kpi-value">' + catArr.length + '</div><div class="kpi-sub">service categories</div></div><div class="kpi-card kpi-blue clickable" onclick="drillAttachOverview()"><div class="kpi-label">Avg Attach Rate</div><div class="kpi-value">' + pct(aa) + '</div><div class="kpi-sub">network average</div></div><div class="kpi-card kpi-red clickable" onclick="drillAttachOverview()"><div class="kpi-label">Total Missed Revenue</div><div class="kpi-value">' + money(tm) + '</div><div class="kpi-sub">upsell opportunity</div></div>' + (tcp ? '<div class="kpi-card kpi-green clickable" onclick="drillCrossSell(\'' + escapeHTML(tcp[0]) + '\',\'' + escapeHTML(tcp[1]) + '\')"><div class="kpi-label">Top Cross-Sell</div><div class="kpi-value" style="font-size:14px;">' + escapeHTML(tcp[0]) + ' + ' + escapeHTML(tcp[1]) + '</div><div class="kpi-sub">' + num(tcp[2]) + ' invoices</div></div>' : ''); }
  } else if (uBody) { uBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px;">Need 2+ stores for upsell comparison</td></tr>'; var sk = document.getElementById('smoKPIs'); if (sk) { var aa2 = catArr.length ? catArr.reduce(function(s, c) { return s + c.attachPct; }, 0) / catArr.length : 0; sk.innerHTML = '<div class="kpi-card kpi-blue"><div class="kpi-label">Categories</div><div class="kpi-value">' + catArr.length + '</div></div><div class="kpi-card kpi-green"><div class="kpi-label">Avg Attach Rate</div><div class="kpi-value">' + pct(aa2) + '</div></div>'; } }
}

function findTopCrossSellPair(det) { var ic = {}; det.forEach(function(r) { var inv = r.Invoice_Number || (r.Store_Number + '|' + r.Invoice_Date), cat = (r.JLI_Category_Code || 'OTHER').toUpperCase(); if (!ic[inv]) ic[inv] = new Set(); ic[inv].add(cat); }); var pairs = {}; Object.values(ic).forEach(function(cats) { var a = Array.from(cats).sort(); for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) { var k = a[i] + '|' + a[j]; pairs[k] = (pairs[k] || 0) + 1; } }); var best = null; Object.entries(pairs).forEach(function(e) { if (!best || e[1] > best[2]) { var p = e[0].split('|'); best = [p[0], p[1], e[1]]; } }); return best; }
function drillAttachCategory(cat) { var det = FILTERED.details.filter(function(r) { return (r.JLI_Category_Code || '').toUpperCase() === cat; }); openReportModal(cat + ' — ' + num(det.length) + ' line items', function(body) { var tr = det.reduce(function(s, r) { return s + (+r.Extended_Price || 0); }, 0); body.innerHTML = '<div class="kpi-grid" style="margin-bottom:16px;"><div class="kpi-card kpi-revenue"><div class="kpi-label">Revenue</div><div class="kpi-value">' + money(tr) + '</div></div><div class="kpi-card kpi-blue"><div class="kpi-label">Items</div><div class="kpi-value">' + num(det.length) + '</div></div></div>'; var dm = {}; det.forEach(function(r) { var d = r.Invoice_Detail_Description || 'Unknown'; if (!dm[d]) dm[d] = { qty: 0, rev: 0, cnt: 0 }; dm[d].qty += (+r.Quantity_Sold || 0); dm[d].rev += (+r.Extended_Price || 0); dm[d].cnt++; }); var h = '<div class="ops-grid-scroll" style="max-height:400px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Description</th><th>Qty</th><th>Revenue</th><th>Avg Price</th></tr></thead><tbody>'; Object.entries(dm).sort(function(a, b) { return b[1].rev - a[1].rev; }).forEach(function(e) { h += '<tr class="clickable-row"><td style="text-align:left;">' + escapeHTML(e[0]) + '</td><td>' + num(Math.round(e[1].qty)) + '</td><td>' + money(e[1].rev) + '</td><td>' + money(e[1].cnt ? e[1].rev / e[1].cnt : 0) + '</td></tr>'; }); h += '</tbody></table></div>'; body.innerHTML += h; }); }
function drillCrossSell(catA, catB) { var ic = {}; FILTERED.details.forEach(function(r) { var inv = r.Invoice_Number || (r.Store_Number + '|' + r.Invoice_Date), cat = (r.JLI_Category_Code || 'OTHER').toUpperCase(); if (!ic[inv]) ic[inv] = new Set(); ic[inv].add(cat); }); var mi = Object.entries(ic).filter(function(e) { return e[1].has(catA) && e[1].has(catB); }).map(function(e) { return e[0]; }); openReportModal(catA + ' + ' + catB + ' — ' + num(mi.length) + ' invoices', function(body) { var m = FILTERED.customers.filter(function(r) { return mi.indexOf(r.Invoice_Number) >= 0; }); var tr = m.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0); body.innerHTML = '<div class="kpi-grid" style="margin-bottom:16px;"><div class="kpi-card kpi-revenue"><div class="kpi-label">Revenue</div><div class="kpi-value">' + money(tr) + '</div></div><div class="kpi-card kpi-blue"><div class="kpi-label">Invoices</div><div class="kpi-value">' + num(m.length) + '</div></div><div class="kpi-card kpi-green"><div class="kpi-label">Avg Ticket</div><div class="kpi-value">' + money(m.length ? tr / m.length : 0) + '</div></div></div>'; var h = '<div class="ops-grid-scroll" style="max-height:400px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Store</th><th style="text-align:left;">Invoice</th><th>Date</th><th>Net Sales</th></tr></thead><tbody>'; m.slice(0, 100).forEach(function(r) { h += '<tr class="clickable-row" onclick="navigateTo(\'stores/' + escapeHTML(r.Store_Number) + '\')"><td style="text-align:left;">#' + escapeHTML(r.Store_Number) + '</td><td style="text-align:left;">' + escapeHTML(r.Invoice_Number) + '</td><td>' + escapeHTML(r.Invoice_Date) + '</td><td>' + money(+r.Net_Sales || 0) + '</td></tr>'; }); h += '</tbody></table></div>'; body.innerHTML += h; }); }
function drillAttachOverview() { openReportModal('Attach Rate Analysis', function(body) { var det = FILTERED.details, cust = FILTERED.customers, ti = new Set(cust.map(function(r) { return r.Invoice_Number; })).size || cust.length; var ci = {}; det.forEach(function(r) { var cat = (r.JLI_Category_Code || 'OTHER').toUpperCase(); if (!ci[cat]) ci[cat] = new Set(); ci[cat].add(r.Invoice_Number || r.Store_Number + '|' + r.Invoice_Date); }); var ca = Object.entries(ci).map(function(e) { return { cat: e[0], count: e[1].size, pct: ti ? e[1].size / ti * 100 : 0 }; }).sort(function(a, b) { return b.pct - a.pct; }); var h = '<div class="ops-grid-scroll" style="max-height:500px;"><table class="ops-grid"><thead><tr><th style="text-align:left;">Category</th><th>Invoices</th><th>Attach %</th><th>Visual</th></tr></thead><tbody>'; ca.forEach(function(c) { var bw = Math.min(100, c.pct); h += '<tr class="clickable-row" onclick="drillAttachCategory(\'' + escapeHTML(c.cat) + '\')"><td style="text-align:left;font-weight:600;">' + escapeHTML(c.cat) + '</td><td>' + num(c.count) + '</td><td>' + pct(c.pct) + '</td><td><div style="width:100%;background:var(--border);border-radius:4px;height:12px;overflow:hidden;"><div style="width:' + bw + '%;height:100%;background:linear-gradient(90deg,var(--green),var(--blue));border-radius:4px;"></div></div></td></tr>'; }); h += '</tbody></table></div>'; body.innerHTML = h; }); }

// ── SMART ALERTS ──
var smartAlerts = [];
function toggleSmartAlerts() { var dd = document.getElementById('smartAlertsDropdown'); if (dd) dd.classList.toggle('open'); }
document.addEventListener('click', function(e) { var dd = document.getElementById('smartAlertsDropdown'), b = document.getElementById('smartAlertsBadge'); if (dd && dd.classList.contains('open') && !dd.contains(e.target) && e.target !== b) dd.classList.remove('open'); });

function runSmartAlertCheck() {
  smartAlerts = [];
  var cust = FILTERED.customers; if (!cust.length) { updateSmartAlertBadge(); return; }
  var storeSet = new Set(); cust.forEach(function(r) { if (r.Store_Number) storeSet.add(r.Store_Number); });
  var stores = Array.from(storeSet), periods = computePriorPeriodDates();
  stores.forEach(function(store) {
    var sc = cust.filter(function(r) { return r.Store_Number === store; }), si = FILTERED.inspections.filter(function(r) { return r.Store_Number === store; });
    if (periods) {
      var pc = DATA.customers.filter(function(r) { var d = parseDate(r.Invoice_Date); return d && d >= periods.priorStart && d <= periods.priorEnd && r.Store_Number === store; });
      var cr = sc.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0), pr = pc.reduce(function(s, r) { return s + (+r.Net_Sales || 0); }, 0);
      if (pr > 0) { var rc = ((cr - pr) / pr * 100); if (rc <= -20) smartAlerts.push({ severity: 'critical', store: store, message: 'Revenue down ' + Math.abs(rc).toFixed(1) + '% vs prior period', detail: money(cr) + ' vs ' + money(pr), type: 'revenue_drop' }); }
      var cb = [], pb = []; sc.forEach(function(r) { var m = diffMinutes(r.Bay_Start_Time, r.Bay_End_Time); if (m != null && m > 0 && m < 180) cb.push(m); }); pc.forEach(function(r) { var m = diffMinutes(r.Bay_Start_Time, r.Bay_End_Time); if (m != null && m > 0 && m < 180) pb.push(m); });
      if (cb.length && pb.length) { var cab = cb.reduce(function(a, b) { return a + b; }, 0) / cb.length, pab = pb.reduce(function(a, b) { return a + b; }, 0) / pb.length; if (pab > 0) { var bc = ((cab - pab) / pab * 100); if (bc >= 15) smartAlerts.push({ severity: 'warning', store: store, message: 'Bay time up ' + bc.toFixed(1) + '% vs prior period', detail: cab.toFixed(1) + ' min vs ' + pab.toFixed(1) + ' min', type: 'bay_time_increase' }); } }
    }
    var we = sc.filter(function(r) { return r.Customer_Email_Address && r.Customer_Email_Address.trim(); }).length, ep = sc.length ? (we / sc.length * 100) : 100;
    if (ep < 50 && sc.length >= 10) smartAlerts.push({ severity: 'warning', store: store, message: 'Email capture rate at ' + pct(ep), detail: num(we) + ' of ' + num(sc.length) + ' invoices', type: 'email_capture_low' });
    if (si.length === 0 && sc.length >= 10) smartAlerts.push({ severity: 'info', store: store, message: 'No inspections recorded this period', detail: num(sc.length) + ' invoices without inspection data', type: 'zero_inspections' });
  });
  smartAlerts.sort(function(a, b) { var o = { critical: 0, warning: 1, info: 2 }; return (o[a.severity] || 9) - (o[b.severity] || 9); });
  updateSmartAlertBadge();
}

function updateSmartAlertBadge() {
  var badge = document.getElementById('smartAlertsBadge'), content = document.getElementById('smartAlertsContent');
  if (!badge || !content) return;
  if (smartAlerts.length > 0) {
    badge.style.display = 'flex'; badge.textContent = smartAlerts.length;
    content.innerHTML = smartAlerts.map(function(a) { return '<div class="smart-alert-item" onclick="navigateTo(\'stores/' + escapeHTML(a.store) + '\');toggleSmartAlerts();"><div class="smart-alert-dot ' + a.severity + '"></div><div><div class="smart-alert-text"><strong>Store #' + escapeHTML(a.store) + '</strong> — ' + escapeHTML(a.message) + '</div><div class="smart-alert-meta">' + escapeHTML(a.detail) + '</div></div></div>'; }).join('');
  } else { badge.style.display = 'none'; content.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">All clear. No anomalies detected.</div>'; }
}
