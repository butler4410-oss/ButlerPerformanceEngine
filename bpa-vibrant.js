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

// 8) Enhanced renderOverview — visible charts alongside store table
var _oo2 = renderOverview;
renderOverview = function() {
  _oo2.apply(this, arguments);
  var cu = FILTERED.customers;

  // Empty state for My Business when no data
  var biz = document.getElementById('view-business');
  if (biz && (!cu || !cu.length)) {
    var existingEmpty = document.getElementById('bpaBusinessEmptyState');
    if (!existingEmpty) {
      // Add empty state messages to charts area
      var chartArea = biz.querySelectorAll('.chart-card');
      chartArea.forEach(function(c) {
        if (!c.querySelector('.bpa-empty-chart')) {
          var wrap = c.querySelector('.chart-wrap');
          if (wrap) {
            var msg = document.createElement('div');
            msg.className = 'bpa-empty-chart';
            msg.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;z-index:2;';
            msg.innerHTML = '<div style="font-size:12px;color:var(--text-muted);font-weight:600;">No data loaded</div><button class="empty-state-action" onclick="openSettings();switchSettingsTab(\'datasource\');" style="font-size:11px;padding:6px 14px;">Sync Data</button>';
            wrap.style.position = 'relative';
            wrap.appendChild(msg);
          }
        }
      });
    }
    return;
  }

  // Remove empty chart messages if data is loaded
  var empties = document.querySelectorAll('.bpa-empty-chart');
  empties.forEach(function(e) { e.remove(); });

  if (!cu || !cu.length) return;

  // ── Revenue vs Prior Period line chart (visible in My Business) ──
  var businessChartsRow = document.getElementById('bpaBusinessCharts');
  if (!businessChartsRow && biz) {
    businessChartsRow = document.createElement('div');
    businessChartsRow.id = 'bpaBusinessCharts';
    businessChartsRow.className = 'inline-chart-row';
    businessChartsRow.style.marginBottom = '12px';
    businessChartsRow.innerHTML = '<div class="inline-chart-card accent-blue"><h4><span class="chart-dot" style="background:#2563eb"></span> Revenue vs Prior Period</h4><div style="height:200px"><canvas id="chartBizRevVsPrior"></canvas></div></div>'
      + '<div class="inline-chart-card accent-teal"><h4><span class="chart-dot" style="background:#0d9488"></span> Cars Per Day Trend</h4><div style="height:200px"><canvas id="chartBizCPDTrend"></canvas></div></div>';
    // Insert after BPA Insights but before store table
    var bpaOv = document.getElementById('bpaOverview');
    if (bpaOv && bpaOv.parentNode && bpaOv.parentNode.nextSibling) {
      bpaOv.parentNode.parentNode.insertBefore(businessChartsRow, bpaOv.parentNode.nextSibling);
    } else {
      var storeWrap = biz.querySelector('.ops-grid-wrap');
      if (storeWrap) biz.insertBefore(businessChartsRow, storeWrap);
    }
  }

  // Build revenue by date data
  var revByDate = {};
  var invByDate2 = {};
  cu.forEach(function(r) {
    var d = parseDate(r.Invoice_Date);
    if (!d) return;
    var k = d.toISOString().split('T')[0];
    revByDate[k] = (revByDate[k] || 0) + (+r.Net_Sales || 0);
    invByDate2[k] = (invByDate2[k] || 0) + 1;
  });

  var allDates = Object.keys(revByDate).sort();
  var storeCount2 = new Set(cu.map(function(r) { return r.Store_Number; })).size || 1;

  if (allDates.length >= 2) {
    // Split into two halves for "prior period" comparison
    var mid = Math.floor(allDates.length / 2);
    var currentDates = allDates.slice(mid);
    var priorDates = allDates.slice(0, mid);
    var currentRev = currentDates.map(function(d) { return revByDate[d]; });
    var priorRev = priorDates.map(function(d) { return revByDate[d]; });
    // Pad shorter array
    while (priorRev.length < currentRev.length) priorRev.push(0);
    while (currentRev.length < priorRev.length) currentRev.push(0);
    var labels = [];
    for (var i = 0; i < currentDates.length; i++) labels.push('Day ' + (i + 1));

    makeChart('chartBizRevVsPrior', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Current Period', data: currentRev, borderColor: '#4da6ff', backgroundColor: 'rgba(77,166,255,0.1)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2.5 },
          { label: 'Prior Period', data: priorRev, borderColor: '#7b8ba5', backgroundColor: 'rgba(123,139,165,0.05)', fill: true, tension: 0.4, pointRadius: 1, borderWidth: 1.5, borderDash: [5, 3] }
        ]
      },
      options: {
        scales: {
          x: { ticks: { font: { size: 10 }, maxTicksLimit: 10, color: '#7b8ba5' }, grid: { color: 'rgba(77,166,255,0.05)' } },
          y: { beginAtZero: true, ticks: { callback: function(v) { return '$' + (v / 1e3).toFixed(0) + 'K'; }, font: { size: 10 }, color: '#7b8ba5' }, grid: { color: 'rgba(77,166,255,0.05)' } }
        },
        plugins: { legend: { display: true, labels: { font: { size: 10 }, color: '#7b8ba5', usePointStyle: true, pointStyleWidth: 10, boxWidth: 8 } } }
      }
    });

    // CPD trend sparkline (detailed)
    var cpdData = allDates.map(function(d) { return (invByDate2[d] || 0) / storeCount2; });
    var avgCPD2 = cpdData.reduce(function(a, b) { return a + b; }, 0) / cpdData.length;
    var cpdColors = cpdData.map(function(v) { return v >= avgCPD2 * 1.2 ? '#00e68a' : v >= avgCPD2 * 0.8 ? '#4da6ff' : '#ff8c42'; });

    makeChart('chartBizCPDTrend', {
      type: 'bar',
      data: {
        labels: allDates.map(function(d) { return d.substring(5); }),
        datasets: [{
          label: 'Cars/Day', data: cpdData, backgroundColor: cpdColors,
          borderRadius: 3, maxBarThickness: 12
        }, {
          label: 'Average', data: allDates.map(function() { return avgCPD2; }),
          type: 'line', borderColor: '#ff4d6a', borderWidth: 1.5, borderDash: [4, 3],
          pointRadius: 0, fill: false
        }]
      },
      options: {
        scales: {
          x: { ticks: { font: { size: 9 }, maxTicksLimit: 15, maxRotation: 45, color: '#7b8ba5' }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { font: { size: 10 }, color: '#7b8ba5' }, grid: { color: 'rgba(77,166,255,0.05)' } }
        },
        plugins: { legend: { display: true, labels: { font: { size: 10 }, color: '#7b8ba5', usePointStyle: true, pointStyleWidth: 10, boxWidth: 8 } } }
      }
    });
  }
};

// 9) Enhanced renderStores — empty state + View All
var _os2 = renderStores;
renderStores = function() {
  _os2.apply(this, arguments);
  var cu = FILTERED.customers;
  var storeView = document.getElementById('allStoresView');
  if (storeView && (!cu || !cu.length)) {
    var gridBody = document.getElementById('opsGridBody');
    if (gridBody && !gridBody.innerHTML.trim()) {
      gridBody.innerHTML = '<tr><td colspan="12" class="empty-state"><div class="empty-state-title">No store data loaded</div><div class="empty-state-sub">Upload files or sync from your DDS connection.</div><button class="empty-state-action" onclick="openSettings();switchSettingsTab(\'datasource\');">Sync Data</button></td></tr>';
    }
  }
  // Gold/silver/bronze on ops grid
  var tb = document.querySelector('#opsGridBody');
  if (tb) {
    var si = 0;
    tb.querySelectorAll('tr:not(.district-row):not(.totals-row):not(.store-child)').forEach(function(r) {
      r.classList.remove('rank-gold', 'rank-silver', 'rank-bronze');
      if (si === 0) r.classList.add('rank-gold');
      else if (si === 1) r.classList.add('rank-silver');
      else if (si === 2) r.classList.add('rank-bronze');
      si++;
    });
  }
};

// 10) Enhanced renderReporting — empty state for Data Room
var _or2 = renderReporting;
renderReporting = function() {
  _or2.apply(this, arguments);
  var cu = FILTERED.customers;
  var dr = document.getElementById('view-dataroom');
  if (dr && (!cu || !cu.length)) {
    var pab = document.getElementById('productAnalysisBody');
    if (pab && !pab.innerHTML.trim()) {
      pab.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-state-title">No data loaded</div><div class="empty-state-sub">Upload files or sync from your DDS connection.</div><button class="empty-state-action" onclick="openSettings();switchSettingsTab(\'datasource\');">Sync Data</button></td></tr>';
    }
  }
};

// 11) Enhanced renderGrow — empty state for Growth
var _og2 = renderGrow;
renderGrow = function() {
  _og2.apply(this, arguments);
  var cu = FILTERED.customers;
  var gv = document.getElementById('view-growth');
  if (gv && (!cu || !cu.length)) {
    var ab = document.getElementById('fcActualsBody');
    if (ab && !ab.innerHTML.trim()) {
      ab.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state-title">No baseline data</div><div class="empty-state-sub">Upload data to generate growth forecasts.</div><button class="empty-state-action" onclick="openSettings();switchSettingsTab(\'datasource\');">Sync Data</button></td></tr>';
    }
  }
};

// 12) Add View All buttons to truncated tables
function addViewAllButtons() {
  // Dashboard store table — View All to My Stores
  var dashWrap = document.querySelector('#view-business .ops-grid-wrap h3');
  if (dashWrap && !dashWrap.querySelector('.view-all-btn')) {
    var btns = dashWrap.querySelector('div');
    if (btns) {
      var va = document.createElement('button');
      va.className = 'view-all-btn';
      va.innerHTML = 'View All &#8594;';
      va.onclick = function() { navigateTo('stores'); };
      btns.insertBefore(va, btns.firstChild);
    }
  }
  // Product Analysis — if more than 15 rows, show View All
  var pab = document.getElementById('productAnalysisBody');
  if (pab && pab.querySelectorAll('tr').length > 15) {
    var paWrap = pab.closest('.ops-grid-wrap');
    if (paWrap) {
      var h3 = paWrap.querySelector('h3');
      if (h3 && !h3.querySelector('.view-all-btn')) {
        var btns = h3.querySelector('div');
        if (btns) {
          var va = document.createElement('button');
          va.className = 'view-all-btn';
          va.innerHTML = 'View All &#8594;';
          va.onclick = function() {
            var scroll = paWrap.querySelector('.ops-grid-scroll');
            if (scroll) scroll.style.maxHeight = 'none';
            va.style.display = 'none';
          };
          btns.insertBefore(va, btns.firstChild);
        }
      }
    }
  }
  // Service Mix — View All
  var smb = document.getElementById('serviceMixBody');
  if (smb && smb.querySelectorAll('tr').length > 10) {
    var smWrap = smb.closest('.ops-grid-wrap');
    if (smWrap) {
      var h3 = smWrap.querySelector('h3');
      if (h3 && !h3.querySelector('.view-all-btn')) {
        var va = document.createElement('button');
        va.className = 'view-all-btn';
        va.innerHTML = 'View All &#8594;';
        va.onclick = function() {
          var scroll = smWrap.querySelector('.ops-grid-scroll');
          if (scroll) scroll.style.maxHeight = 'none';
          va.style.display = 'none';
        };
        h3.appendChild(va);
      }
    }
  }
}

// 13) Dark theme chart defaults
function applyDarkChartDefaults() {
  if (typeof Chart === 'undefined') return;
  var isDark = document.body.classList.contains('dark-mode');
  if (!isDark) return;
  Chart.defaults.color = '#7b8ba5';
  Chart.defaults.borderColor = 'rgba(77,166,255,0.08)';
  Chart.defaults.plugins.legend.labels.color = '#7b8ba5';
  Chart.defaults.scale.grid = Chart.defaults.scale.grid || {};
  Chart.defaults.scale.grid.color = 'rgba(77,166,255,0.06)';
  Chart.defaults.scale.ticks = Chart.defaults.scale.ticks || {};
  Chart.defaults.scale.ticks.color = '#7b8ba5';
}

// 14) Apply section header accent bars to all views
function applySectionAccentBars() {
  var headers = document.querySelectorAll('.ops-grid-wrap > h3, .chart-card > h3, .trend-section-title');
  headers.forEach(function(h) {
    if (h.getAttribute('data-accent-applied')) return;
    h.setAttribute('data-accent-applied', '1');
  });
}

// 15) Watch for view changes and reapply
var _origNav = navigateTo;
navigateTo = function() {
  _origNav.apply(this, arguments);
  setTimeout(function() {
    addViewAllButtons();
    applySectionAccentBars();
  }, 300);
};

// Initialize on load
applyDarkChartDefaults();
setTimeout(function() {
  addViewAllButtons();
  applySectionAccentBars();
}, 500);

console.log('[BPA] Vibrant color & chart system loaded');
console.log('[BPA] Premium polish pass applied — full badassery');
})();
