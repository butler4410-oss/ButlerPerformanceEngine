// BPA VIBRANT COLOR & CHART INJECTION SYSTEM
(function(){
// 1) Inject vibrant CSS
var s=document.createElement('style');
s.textContent='.section-title{font-size:15px;font-weight:700;color:var(--text);padding:12px 0;margin-bottom:16px;border-bottom:3px solid #4da6ff;display:flex;align-items:center;gap:8px}.section-title .dot{width:8px;height:8px;border-radius:50%}.section-title.green{border-bottom-color:#00e68a}.section-title.red{border-bottom-color:#ff4d6a}.section-title.blue{border-bottom-color:#4da6ff}.section-title.purple{border-bottom-color:#a78bfa}.section-title.orange{border-bottom-color:#ff8c42}.section-title.teal{border-bottom-color:#5eead4}.kpi-card .kpi-icon{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;opacity:.85}.rank-gold td{background:linear-gradient(90deg,rgba(255,215,0,.2) 0%,transparent 60%)!important}.rank-gold td:first-child{border-left:4px solid #fbbf24!important;font-weight:800!important}.rank-silver td{background:linear-gradient(90deg,rgba(192,192,192,.15) 0%,transparent 60%)!important}.rank-silver td:first-child{border-left:4px solid #9ca3af!important;font-weight:800!important}.rank-bronze td{background:linear-gradient(90deg,rgba(205,127,50,.15) 0%,transparent 60%)!important}.rank-bronze td:first-child{border-left:4px solid #d97706!important;font-weight:800!important}.inline-chart-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.inline-chart-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 20px;box-shadow:0 2px 12px rgba(0,0,0,.2);position:relative;overflow:hidden}.inline-chart-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;border-radius:12px 12px 0 0}.inline-chart-card.accent-blue::before{background:linear-gradient(90deg,#2563eb,#60a5fa)}.inline-chart-card.accent-green::before{background:linear-gradient(90deg,#059669,#34d399)}.inline-chart-card.accent-purple::before{background:linear-gradient(90deg,#7c3aed,#a78bfa)}.inline-chart-card.accent-orange::before{background:linear-gradient(90deg,#ea580c,#fb923c)}.inline-chart-card.accent-red::before{background:linear-gradient(90deg,#dc2626,#f87171)}.inline-chart-card.accent-teal::before{background:linear-gradient(90deg,#0d9488,#5eead4)}.inline-chart-card h4{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;display:flex;align-items:center;gap:6px;color:var(--text)}.inline-chart-card h4 .chart-dot{width:8px;height:8px;border-radius:50%;box-shadow:0 0 6px currentColor}.forecast-progress-wrap{margin-bottom:10px}.forecast-progress-label{display:flex;justify-content:space-between;font-size:11px;font-weight:600;margin-bottom:4px}.forecast-progress-label .target-value{font-family:"IBM Plex Mono",monospace;font-weight:700}.forecast-progress-bar{height:8px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden}.forecast-progress-fill{height:100%;border-radius:4px;transition:width .8s ease}.forecast-progress-fill.green{background:linear-gradient(90deg,#059669,#00e68a);box-shadow:0 0 8px rgba(0,230,138,.3)}.forecast-progress-fill.blue{background:linear-gradient(90deg,#2563eb,#4da6ff);box-shadow:0 0 8px rgba(77,166,255,.3)}.forecast-progress-fill.orange{background:linear-gradient(90deg,#ea580c,#ff8c42);box-shadow:0 0 8px rgba(255,140,66,.3)}.forecast-progress-fill.red{background:linear-gradient(90deg,#dc2626,#ff4d6a);box-shadow:0 0 8px rgba(255,77,106,.3)}.forecast-progress-fill.purple{background:linear-gradient(90deg,#7c3aed,#a78bfa);box-shadow:0 0 8px rgba(167,139,250,.3)}.bpa-panel .bpa-header{background:linear-gradient(135deg,rgba(77,166,255,.08),rgba(77,166,255,.02))!important;margin:-16px -20px 14px!important;padding:14px 20px!important;border-radius:12px 12px 0 0!important;border-bottom:2px solid rgba(77,166,255,.12)!important}.view-hero{position:relative!important;padding-left:16px!important}.view-hero::before{content:"";position:absolute;left:0;top:0;bottom:16px;width:4px;border-radius:2px;background:linear-gradient(180deg,#4da6ff,#00e68a)}.sparkline-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.2)}.sparkline-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#5eead4,#00e68a)}.sparkline-card .spark-label{font-size:10px;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-muted);font-weight:700;margin-bottom:4px}.sparkline-card .spark-value{font-size:22px;font-weight:800;font-family:"IBM Plex Mono",monospace;color:#00e68a;text-shadow:0 0 16px rgba(0,230,138,.3)}.sparkline-card .spark-chart{flex:1;height:50px}.ops-grid-wrap>h3{position:relative!important;padding-left:12px!important;color:var(--text)!important}.ops-grid-wrap>h3::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:4px;height:20px;border-radius:2px;background:linear-gradient(180deg,#4da6ff,#00e68a)}';
document.head.appendChild(s);

// 2) Wrap renderOpsGrid - gold/silver/bronze + revenue chart
var _og = renderOpsGrid;
renderOpsGrid = function() {
  _og.apply(this, arguments);
  var tb = document.getElementById('opsGridBody');
  if (!tb) return;
  var rows = tb.querySelectorAll('tr:not(.district-row):not(.totals-row):not(.store-child)');
  rows.forEach(function(r, i) {
    r.classList.remove('rank-gold', 'rank-silver', 'rank-bronze');
    if (i === 0) r.classList.add('rank-gold');
    else if (i === 1) r.classList.add('rank-silver');
    else if (i === 2) r.classList.add('rank-bronze');
  });

  // Add inline revenue distribution charts
  var wrap = document.getElementById('allStoresView');
  var cr = document.getElementById('storeRevenueChartRow');
  if (!cr && wrap) {
    cr = document.createElement('div');
    cr.id = 'storeRevenueChartRow';
    cr.className = 'inline-chart-row';
    cr.innerHTML = '<div class="inline-chart-card accent-blue"><h4><span class="chart-dot" style="background:#2563eb"></span> Revenue by Store</h4><div style="height:220px"><canvas id="chartStoreRevDist"></canvas></div></div><div class="inline-chart-card accent-green"><h4><span class="chart-dot" style="background:#059669"></span> Cars Per Day by Store</h4><div style="height:220px"><canvas id="chartStoreCPD"></canvas></div></div>';
    var bp = document.getElementById('bpaOps');
    if (bp) wrap.insertBefore(cr, bp); else wrap.appendChild(cr);
  }

  var storeRev = {}, storeCars = {};
  var cu = FILTERED.customers;
  var dts = cu.map(function(r) { return parseDate(r.Invoice_Date); }).filter(Boolean);
  var mn = dts.length ? dts.reduce(function(a, b) { return a < b ? a : b; }) : new Date();
  var mx = dts.length ? dts.reduce(function(a, b) { return a > b ? a : b; }) : new Date();
  var dy = Math.max(1, Math.ceil((mx - mn) / 864e5) + 1);
  cu.forEach(function(r) {
    storeRev[r.Store_Number] = (storeRev[r.Store_Number] || 0) + (+r.Net_Sales || 0);
    storeCars[r.Store_Number] = (storeCars[r.Store_Number] || 0) + 1;
  });

  var sorted = Object.entries(storeRev).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 15);
  var colors = ['#1e40af','#2563eb','#3b82f6','#60a5fa','#93c5fd','#059669','#34d399','#7c3aed','#a78bfa','#ea580c','#fb923c','#0d9488','#5eead4','#d97706','#fbbf24'];

  if (sorted.length > 0) {
    makeChart('chartStoreRevDist', {
      type: 'bar',
      data: { labels: sorted.map(function(x) { return '#' + x[0]; }), datasets: [{ label: 'Revenue', data: sorted.map(function(x) { return x[1]; }), backgroundColor: colors.slice(0, sorted.length), borderRadius: 6, maxBarThickness: 45 }] },
      options: { indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { callback: function(v) { return '$' + (v / 1e3).toFixed(0) + 'K'; } } }, y: { ticks: { font: { size: 11, weight: 600 } } } }, plugins: { legend: { display: false } } }
    });

    var cpdSorted = Object.entries(storeCars).sort(function(a, b) { return b[1] / dy - a[1] / dy; }).slice(0, 15);
    var cpdColors = cpdSorted.map(function(e) { var c = e[1] / dy; return c >= 15 ? '#059669' : c >= 8 ? '#2563eb' : c >= 4 ? '#d97706' : '#dc2626'; });
    makeChart('chartStoreCPD', {
      type: 'bar',
      data: { labels: cpdSorted.map(function(x) { return '#' + x[0]; }), datasets: [{ label: 'CPD', data: cpdSorted.map(function(x) { return x[1] / dy; }), backgroundColor: cpdColors, borderRadius: 6, maxBarThickness: 45 }] },
      options: { indexAxis: 'y', scales: { x: { beginAtZero: true }, y: { ticks: { font: { size: 11, weight: 600 } } } }, plugins: { legend: { display: false } } }
    });
  }
};

// 3) Wrap renderOverview - KPI icons, sparkline card, vibrant charts
var _oo = renderOverview;
renderOverview = function() {
  _oo.apply(this, arguments);
  var cu = FILTERED.customers;
  if (!cu || !cu.length) return;

  // KPI icons
  var iconMap = {'Net Sales':'\u{1F4B5}','Cars / Day':'\u{1F697}','Ticket Average':'\u{1F3AF}','Vehicles Serviced':'\u{1F527}','Active Stores':'\u{1F3EA}','YoY Change':'\u{1F4C8}','Repeat Customers':'\u{1F465}'};
  document.querySelectorAll('#dashKPIs .kpi-card').forEach(function(c) {
    var l = c.querySelector('.kpi-label');
    if (l && !c.querySelector('.kpi-icon')) {
      var ic = iconMap[l.textContent.trim()];
      if (ic) { var d = document.createElement('div'); d.className = 'kpi-icon'; d.textContent = ic; c.appendChild(d); }
    }
  });

  // Gold/silver/bronze on dashboard store table
  var db = document.getElementById('dashStoreBody');
  if (db) {
    var si = 0;
    db.querySelectorAll('tr').forEach(function(r) {
      if (r.querySelector('td[colspan]')) { si = 0; return; }
      r.classList.remove('rank-gold', 'rank-silver', 'rank-bronze');
      if (si === 0) r.classList.add('rank-gold');
      else if (si === 1) r.classList.add('rank-silver');
      else if (si === 2) r.classList.add('rank-bronze');
      si++;
    });
  }

  // Sparkline Cars Per Day card + Day of Week chart
  var chartsRow = document.querySelector('#view-business .reveal:last-of-type');
  var sp = document.getElementById('bpaSparklineCard');
  if (!sp && chartsRow) {
    sp = document.createElement('div');
    sp.id = 'bpaSparklineCard';
    sp.style.cssText = 'display:grid;grid-template-columns:1fr 2fr;gap:16px;margin-top:12px';
    sp.innerHTML = '<div class="sparkline-card"><div><div class="spark-label">Cars Per Day</div><div class="spark-value" id="sparkCPDValue">--</div><div style="font-size:10px;color:#64748b;margin-top:2px">avg across stores</div></div><div class="spark-chart"><canvas id="chartSparkCPD"></canvas></div></div><div class="inline-chart-card accent-purple"><h4><span class="chart-dot" style="background:#7c3aed"></span> Revenue by Day of Week</h4><div style="height:120px"><canvas id="chartDayOfWeek"></canvas></div></div>';
    chartsRow.parentNode.insertBefore(sp, chartsRow.nextSibling);
  }

  var invByDate = {};
  cu.forEach(function(r) {
    var d = parseDate(r.Invoice_Date);
    if (!d) return;
    var k = d.toISOString().split('T')[0];
    invByDate[k] = (invByDate[k] || 0) + 1;
  });
  var storeCount = new Set(cu.map(function(r) { return r.Store_Number; })).size || 1;
  var sparkDates = Object.keys(invByDate).sort().slice(-21);
  var sparkData = sparkDates.map(function(d) { return invByDate[d] / storeCount; });
  var avgCPD = sparkData.length ? sparkData.reduce(function(a, b) { return a + b; }, 0) / sparkData.length : 0;
  var sparkValEl = document.getElementById('sparkCPDValue');
  if (sparkValEl) sparkValEl.textContent = avgCPD.toFixed(1);

  if (sparkData.length > 0) {
    makeChart('chartSparkCPD', {
      type: 'line',
      data: { labels: sparkDates, datasets: [{ data: sparkData, borderColor: '#0d9488', backgroundColor: 'rgba(13,148,136,0.1)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }] },
      options: { scales: { x: { display: false }, y: { display: false } }, plugins: { legend: { display: false }, tooltip: { enabled: false } }, layout: { padding: 0 } }
    });

    // Day of week chart
    var dowRev = [0, 0, 0, 0, 0, 0, 0];
    cu.forEach(function(r) {
      var d = parseDate(r.Invoice_Date);
      if (d) dowRev[d.getDay()] += (+r.Net_Sales || 0);
    });
    var mxDow = Math.max.apply(null, dowRev);
    var dowColors = dowRev.map(function(v) { return v >= mxDow * 0.9 ? '#059669' : v >= mxDow * 0.6 ? '#2563eb' : v >= mxDow * 0.3 ? '#d97706' : '#dc2626'; });
    makeChart('chartDayOfWeek', {
      type: 'bar',
      data: { labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], datasets: [{ label: 'Revenue', data: dowRev, backgroundColor: dowColors, borderRadius: 6, maxBarThickness: 50 }] },
      options: { scales: { x: { ticks: { font: { size: 11, weight: 600 } } }, y: { beginAtZero: true, ticks: { callback: function(v) { return '$' + (v / 1e3).toFixed(0) + 'K'; } } } }, plugins: { legend: { display: false } } }
    });
  }

  // Vibrant revenue trend gradient
  var rc = document.getElementById('chartDashRevenue');
  if (rc && typeof allCharts !== 'undefined' && allCharts.chartDashRevenue) {
    var ch = allCharts.chartDashRevenue, d0 = ch.data.datasets[0];
    if (d0 && !d0._vib) {
      var c2 = rc.getContext('2d'), g = c2.createLinearGradient(0, 0, 0, rc.height);
      g.addColorStop(0, 'rgba(30,64,175,0.35)');
      g.addColorStop(0.5, 'rgba(59,130,246,0.15)');
      g.addColorStop(1, 'rgba(59,130,246,0.02)');
      d0.backgroundColor = g; d0.borderColor = '#1e40af'; d0.borderWidth = 2.5; d0._vib = true;
      ch.update('none');
    }
  }
};

// 4) Wrap renderForecastResults - colored progress bars
var _of = renderForecastResults;
renderForecastResults = function() {
  _of.apply(this, arguments);
  var re = document.getElementById('forecastResults');
  if (!re || !window._fcBaseline) return;

  var pe = document.getElementById('fcProgressBars');
  if (!pe) {
    pe = document.createElement('div');
    pe.id = 'fcProgressBars';
    pe.className = 'inline-chart-card accent-green';
    pe.style.marginTop = '16px';
    re.appendChild(pe);
  }

  var cp = +document.getElementById('fcCarTarget').value;
  var tp = +document.getElementById('fcTicketTarget').value;
  var cv = +document.getElementById('fcConvTarget').value;
  var pr = +document.getElementById('fcPromoReduction').value;

  var targets = [
    { l: 'Car Count Growth', v: cp, m: 30, c: cp > 0 ? 'green' : cp < 0 ? 'red' : 'blue', d: (cp >= 0 ? '+' : '') + cp + '%' },
    { l: 'Ticket Average Lift', v: tp, m: 30, c: tp > 0 ? 'green' : tp < 0 ? 'red' : 'blue', d: (tp >= 0 ? '+' : '') + tp + '%' },
    { l: 'Upsell Conversion', v: cv, m: 30, c: cv > 0 ? 'green' : cv < 0 ? 'red' : 'blue', d: (cv >= 0 ? '+' : '') + cv + '%' },
    { l: 'Promo Reduction', v: pr, m: 50, c: pr > 0 ? 'orange' : 'blue', d: '-' + pr + '%' }
  ];

  pe.innerHTML = '<h4><span class="chart-dot" style="background:#059669"></span> Growth Target Progress</h4>' +
    targets.map(function(t) {
      var pct = Math.min(Math.abs(t.v) / t.m * 100, 100);
      var co = t.c === 'green' ? '#059669' : t.c === 'red' ? '#dc2626' : t.c === 'orange' ? '#ea580c' : '#2563eb';
      return '<div class="forecast-progress-wrap"><div class="forecast-progress-label"><span>' + t.l + '</span><span class="target-value" style="color:' + co + '">' + t.d + '</span></div><div class="forecast-progress-bar"><div class="forecast-progress-fill ' + t.c + '" style="width:' + pct + '%"></div></div></div>';
    }).join('');

  // Color projected values green
  re.querySelectorAll('.kpi-card').forEach(function(c) {
    var v = c.querySelector('.kpi-value');
    if (v && v.textContent.indexOf('+') >= 0) v.style.color = '#059669';
  });
};

// 5) Wrap renderPromos - add inline charts to Data Room
var _op = renderPromos;
renderPromos = function() {
  _op.apply(this, arguments);

  var dr = document.getElementById('view-dataroom');
  var pc = document.getElementById('drPromoChartRow');
  if (!pc && dr) {
    var bp = document.getElementById('bpaReporting');
    pc = document.createElement('div');
    pc.id = 'drPromoChartRow';
    pc.className = 'inline-chart-row';
    pc.innerHTML = '<div class="inline-chart-card accent-orange"><h4><span class="chart-dot" style="background:#ea580c"></span> Promo Usage Impact</h4><div style="height:220px"><canvas id="chartDRPromoImpact"></canvas></div></div><div class="inline-chart-card accent-purple"><h4><span class="chart-dot" style="background:#7c3aed"></span> Service Revenue Breakdown</h4><div style="height:220px"><canvas id="chartDRServiceMix"></canvas></div></div>';
    if (bp) dr.insertBefore(pc, bp); else dr.appendChild(pc);
  }

  // Promo impact chart
  var promoMap = {};
  FILTERED.promos.forEach(function(r) {
    var code = r.Promo_Code;
    if (!promoMap[code]) promoMap[code] = { uses: 0, total: 0 };
    promoMap[code].uses++;
    promoMap[code].total += (+r.Promo_Amount || 0);
  });
  var topPromos = Object.entries(promoMap).sort(function(a, b) { return b[1].total - a[1].total; }).slice(0, 8);
  if (topPromos.length > 0) {
    makeChart('chartDRPromoImpact', {
      type: 'bar',
      data: {
        labels: topPromos.map(function(p) { return p[0].substring(0, 14); }),
        datasets: [
          { label: 'Discount $', data: topPromos.map(function(p) { return p[1].total; }), backgroundColor: ['#ea580c','#fb923c','#fdba74','#fed7aa','#f97316','#c2410c','#7c2d12','#431407'], borderRadius: 6, maxBarThickness: 40 },
          { label: 'Uses', data: topPromos.map(function(p) { return p[1].uses; }), backgroundColor: 'rgba(124,58,237,0.5)', borderRadius: 6, maxBarThickness: 40, yAxisID: 'y1' }
        ]
      },
      options: {
        scales: { x: { ticks: { font: { size: 10 }, maxRotation: 45 } }, y: { beginAtZero: true, ticks: { callback: function(v) { return '$' + v.toLocaleString(); } } }, y1: { position: 'right', beginAtZero: true, grid: { display: false } } },
        plugins: { legend: { display: true, labels: { font: { size: 10 } } } }
      }
    });
  }

  // Service revenue doughnut chart
  var catRev = {};
  FILTERED.details.forEach(function(r) {
    var cat = r.JLI_Category_Code || r.Invoice_Detail_Type || 'OTHER';
    catRev[cat] = (catRev[cat] || 0) + (+r.Extended_Price || 0);
  });
  var catEntries = Object.entries(catRev).filter(function(e) { return e[1] > 0; }).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 10);
  if (catEntries.length > 0) {
    makeChart('chartDRServiceMix', {
      type: 'doughnut',
      data: { labels: catEntries.map(function(e) { return e[0]; }), datasets: [{ data: catEntries.map(function(e) { return e[1]; }), backgroundColor: ['#1e40af','#059669','#7c3aed','#ea580c','#d97706','#dc2626','#0d9488','#2563eb','#db2777','#34d399'], borderWidth: 2, borderColor: '#fff' }] },
      options: { plugins: { legend: { position: 'right', labels: { font: { size: 10 }, padding: 8 } } } }
    });
  }
};

// 6) Color forecast baseline KPI cards
var _ofv = renderForecastView;
renderForecastView = function() {
  _ofv.apply(this, arguments);
  var fk = document.getElementById('fcBaselineKPIs');
  if (fk) {
    var accentMap = {'Cars Per Day':'kpi-blue','Ticket Average':'kpi-green','Daily Revenue':'kpi-revenue','Monthly Revenue':'kpi-purple','Annual Revenue':'kpi-orange','Upsell Rate':'kpi-teal'};
    fk.querySelectorAll('.kpi-card').forEach(function(c) {
      var l = c.querySelector('.kpi-label');
      if (l) { var a = accentMap[l.textContent.trim()]; if (a) c.classList.add(a); }
    });
  }
};

// 7) Gold/silver/bronze store rankings
var _os = renderStores;
renderStores = function() {
  _os.apply(this, arguments);
  var tb = document.querySelector('#tblStores tbody');
  if (!tb) return;
  tb.querySelectorAll('tr').forEach(function(r, i) {
    r.classList.remove('rank-gold', 'rank-silver', 'rank-bronze');
    if (i === 0) r.classList.add('rank-gold');
    else if (i === 1) r.classList.add('rank-silver');
    else if (i === 2) r.classList.add('rank-bronze');
  });
};

console.log('[BPA] Vibrant color & chart system loaded');
})();
