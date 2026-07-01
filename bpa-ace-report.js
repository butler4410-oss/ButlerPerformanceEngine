/* ============================================================
 * BPA — ACE Report (Weekly Ancillary Scorecard) — Data Room panel
 * ------------------------------------------------------------
 * Bundled weekly "Monday morning tune-up" scorecard for Dakota's
 * 7 Arkansas Jiffy Lube stores. Renders a formatted, color-coded
 * per-store table into the Data Room. Static snapshot (source:
 * "Monday morning tune up 6-22 - 6-27.xlsx", sheet Ancillary_Retail_Comp).
 *
 * GATING: only renders when the current session's data includes one
 * of Dakota's stores (self-gating — no other tenant has these store
 * numbers), OR when ACE_REPORT.company matches the logged-in company.
 * To update next week: replace period/weekLabel and the rows[] values.
 * ============================================================ */
(function () {
  'use strict';

  var ACE_REPORT = {
    title: 'ACE Report',
    subtitle: 'Weekly Ancillary Retail Scorecard',
    period: '6/22 - 6/27',
    weekLabel: 'Jun 22 – Jun 27, 2026',
    company: null, // optional: set to Dakota's exact company name to lock the gate to it
    stores: ['319', '515', '3812', '4085', '4086', '4087', '4088'],
    rows: [
      { store: '319',  netSales: 15329.64, vehicles: 120, ticket: 127.75, labor: 25.5, nps: 75.0,  cogs: 52.52, af: 14.2, wb: 7.5, lb: 0.0, caf: 13.3, ff: 1.7, tr: 8.3,  ats: 0.0, gd: 2.5, rs: 0.0, bat: 0.0, brakeSales: 369.98,  brakeCount: 1, bfe: 0.0 },
      { store: '515',  netSales: 11409.26, vehicles: 87,  ticket: 131.14, labor: 43.6, nps: 50.0,  cogs: 29.43, af: 8.0,  wb: 4.6, lb: 1.1, caf: 12.6, ff: 0.0, tr: 9.2,  ats: 1.1, gd: 0.0, rs: 0.0, bat: 0.0, brakeSales: 1789.90, brakeCount: 7, bfe: 2.3 },
      { store: '3812', netSales: 11891.74, vehicles: 102, ticket: 116.59, labor: 40.8, nps: 20.0,  cogs: 30.90, af: 6.9,  wb: 6.9, lb: 5.9, caf: 9.8,  ff: 2.0, tr: 13.7, ats: 0.0, gd: 3.9, rs: 1.0, bat: 0.0, brakeSales: 369.98,  brakeCount: 1, bfe: 0.0 },
      { store: '4085', netSales: 18366.63, vehicles: 132, ticket: 139.14, labor: 23.4, nps: 72.7,  cogs: 28.80, af: 12.9, wb: 3.8, lb: 3.8, caf: 18.9, ff: 2.3, tr: 22.7, ats: 0.0, gd: 3.0, rs: 1.5, bat: 0.0, brakeSales: 449.98,  brakeCount: 1, bfe: 0.0 },
      { store: '4086', netSales: 13023.88, vehicles: 117, ticket: 111.32, labor: 29.9, nps: 85.7,  cogs: 28.74, af: 13.7, wb: 6.0, lb: 1.7, caf: 19.7, ff: 0.0, tr: 12.0, ats: 0.0, gd: 0.9, rs: 0.9, bat: 0.0, brakeSales: 169.99,  brakeCount: 1, bfe: 0.0 },
      { store: '4087', netSales: 12938.35, vehicles: 102, ticket: 126.85, labor: 28.5, nps: 50.0,  cogs: 33.46, af: 7.8,  wb: 2.9, lb: 2.9, caf: 12.7, ff: 0.0, tr: 8.8,  ats: 0.0, gd: 0.0, rs: 0.0, bat: 1.0, brakeSales: 339.98,  brakeCount: 2, bfe: 0.0 },
      { store: '4088', netSales: 10419.22, vehicles: 110, ticket: 94.72,  labor: 32.6, nps: 100.0, cogs: 31.09, af: 5.5,  wb: 2.7, lb: 3.6, caf: 4.5,  ff: 0.0, tr: 13.6, ats: 0.0, gd: 0.0, rs: 0.0, bat: 0.0, brakeSales: 169.99,  brakeCount: 1, bfe: 1.8 }
    ]
  };

  // Column definitions: key, header label, full title, format, and whether
  // higher (high) or lower (low) is better — drives the heatmap direction.
  // agg: how the totals/avg footer row is computed.
  var COLS = [
    { key: 'netSales',   label: 'Net Sales',  full: 'Net Sales',            fmt: 'money0', better: 'high', agg: 'sum' },
    { key: 'vehicles',   label: 'Vehicles',   full: 'Total Vehicles',       fmt: 'int',    better: 'high', agg: 'sum' },
    { key: 'ticket',     label: 'Ticket Avg', full: 'Ticket Average',       fmt: 'money2', better: 'high', agg: 'blendedTicket' },
    { key: 'labor',      label: 'Labor %',    full: 'Labor % of Sales',     fmt: 'pct',    better: 'low',  agg: 'salesWtd' },
    { key: 'cogs',       label: 'COGS %',     full: 'COGS % of Sales',      fmt: 'pct',    better: 'low',  agg: 'salesWtd' },
    { key: 'nps',        label: 'NPS',        full: 'Net Promoter Score',   fmt: 'num1',   better: 'high', agg: 'mean' },
    { key: 'af',  label: 'Air Flt',  full: 'Air Filter % of Vehicle',        fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'wb',  label: 'Wipers',   full: 'Wiper Blades % of Vehicle',      fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'lb',  label: 'Lightbl',  full: 'Lightbulbs % of Vehicle',        fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'caf', label: 'Cabin Air',full: 'Cabin Air Filter % of Vehicle',  fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'ff',  label: 'Fuel Flt', full: 'Fuel Filter % of Vehicle',       fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'tr',  label: 'Tire Rot', full: 'Tire Rotation % of Vehicle',     fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'ats', label: 'Auto Trns',full: 'Auto Trans Service % of Vehicle',fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'gd',  label: 'Gearbox',  full: 'Gearbox Differential % of Vehicle', fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'rs',  label: 'Radiator', full: 'Radiator Service % of Vehicle',  fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'bat', label: 'Batteries',full: 'Batteries % of Vehicle',         fmt: 'pct', better: 'high', agg: 'vehWtd', grp: 'attach' },
    { key: 'brakeSales', label: 'Brake $',  full: 'Brake Service Sales', fmt: 'money2', better: 'high', agg: 'sum' },
    { key: 'brakeCount', label: 'Brake Ct', full: 'Brake Service Count', fmt: 'int',    better: 'high', agg: 'sum' },
    { key: 'bfe',        label: 'BFE %',    full: 'BFE %',               fmt: 'pct',    better: 'high', agg: 'vehWtd' }
  ];

  function esc(s) { return (typeof escapeHTML === 'function') ? escapeHTML(String(s)) : String(s); }

  function fmt(v, kind) {
    var n = Number(v) || 0;
    switch (kind) {
      case 'money0': return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
      case 'money2': return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'int':    return n.toLocaleString('en-US');
      case 'pct':    return n.toFixed(1) + '%';
      case 'num1':   return n.toFixed(1);
      default:       return String(v);
    }
  }

  // Diverging heatmap: best value in a column → green tint, worst → red tint,
  // neutral in the middle. Direction respects "higher/lower is better".
  function cellStyle(col, value, min, max) {
    if (max === min) return '';
    var norm = (value - min) / (max - min);      // 0..1, 1 = highest raw value
    if (col.better === 'low') norm = 1 - norm;    // flip so 1 = best
    var alpha, rgb;
    if (norm >= 0.5) { rgb = '5,150,105';  alpha = (norm - 0.5) * 2 * 0.30; }   // green (var --green)
    else             { rgb = '220,38,38';  alpha = (0.5 - norm) * 2 * 0.26; }   // red (var --red)
    if (alpha < 0.02) return '';
    return 'background:rgba(' + rgb + ',' + alpha.toFixed(3) + ');';
  }

  function aggregate(col, rows) {
    var totVeh = rows.reduce(function (s, r) { return s + (Number(r.vehicles) || 0); }, 0);
    var totNet = rows.reduce(function (s, r) { return s + (Number(r.netSales) || 0); }, 0);
    switch (col.agg) {
      case 'sum':  return rows.reduce(function (s, r) { return s + (Number(r[col.key]) || 0); }, 0);
      case 'mean': return rows.length ? rows.reduce(function (s, r) { return s + (Number(r[col.key]) || 0); }, 0) / rows.length : 0;
      case 'blendedTicket': return totVeh ? totNet / totVeh : 0;
      case 'vehWtd': return totVeh ? rows.reduce(function (s, r) { return s + (Number(r[col.key]) || 0) * (Number(r.vehicles) || 0); }, 0) / totVeh : 0;
      case 'salesWtd': return totNet ? rows.reduce(function (s, r) { return s + (Number(r[col.key]) || 0) * (Number(r.netSales) || 0); }, 0) / totNet : 0;
      default: return 0;
    }
  }

  // Gate: is this the tenant this report belongs to?
  function shouldShow() {
    if (ACE_REPORT.company) {
      var co = '';
      try { co = (localStorage.getItem('bp_company') || ''); } catch (e) {}
      return co.trim().toLowerCase() === ACE_REPORT.company.trim().toLowerCase();
    }
    // Self-gate by store overlap — only Dakota's instance has these stores loaded.
    var loaded = {};
    try {
      [DATA.customers, DATA.details, DATA.inspections].forEach(function (arr) {
        if (!arr) return;
        arr.forEach(function (r) {
          var s = (typeof cleanStoreNum === 'function') ? cleanStoreNum(r.Store_Number) : String(r.Store_Number || '');
          if (s) loaded[String(s).trim()] = true;
        });
      });
    } catch (e) { return false; }
    return ACE_REPORT.stores.some(function (s) { return loaded[s]; });
  }

  function renderAceReport() {
    var el = document.getElementById('aceReportPanel');
    if (!el) return;

    if (!shouldShow()) { el.innerHTML = ''; el.style.display = 'none'; return; }
    el.style.display = 'block';

    var rows = ACE_REPORT.rows;

    // Per-column min/max for the heatmap.
    var bounds = {};
    COLS.forEach(function (c) {
      var vals = rows.map(function (r) { return Number(r[c.key]) || 0; });
      bounds[c.key] = { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
    });

    // Summary chips — group totals and weighted averages across the 7 stores.
    var totNet = aggregate({ key: 'netSales', agg: 'sum' }, rows);
    var totVeh = aggregate({ key: 'vehicles', agg: 'sum' }, rows);
    var blendTicket = totVeh ? totNet / totVeh : 0;
    var avgNps = aggregate({ key: 'nps', agg: 'mean' }, rows);
    var avgLabor = aggregate({ key: 'labor', agg: 'salesWtd' }, rows);
    var avgCogs = aggregate({ key: 'cogs', agg: 'salesWtd' }, rows);

    var chips = [
      { label: 'Net Sales', value: fmt(totNet, 'money0') },
      { label: 'Total Vehicles', value: fmt(totVeh, 'int') },
      { label: 'Blended Ticket', value: fmt(blendTicket, 'money2') },
      { label: 'Avg NPS', value: fmt(avgNps, 'num1') },
      { label: 'Labor % (wtd)', value: fmt(avgLabor, 'pct') },
      { label: 'COGS % (wtd)', value: fmt(avgCogs, 'pct') }
    ];

    var h = '';
    h += '<div class="ops-grid-wrap" style="margin-bottom:12px;border-top:3px solid var(--accent);">';

    // Header bar
    h += '<h3 style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'
       + '<span>' + esc(ACE_REPORT.title) + '</span>'
       + '<span style="font-size:11px;font-weight:600;text-transform:none;letter-spacing:0;color:#fff;background:var(--accent);padding:2px 9px;border-radius:20px;">' + esc(ACE_REPORT.weekLabel) + '</span>'
       + '<span style="font-size:11px;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text-muted);">' + esc(ACE_REPORT.subtitle) + '</span>'
       + '<button class="btn-export" style="margin-left:auto;" onclick="exportReport(\'tblAceReport\',\'ACE Report ' + esc(ACE_REPORT.period) + '\')">Export</button>'
       + '</h3>';

    // Summary chips
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin:4px 0 14px;">';
    chips.forEach(function (c) {
      h += '<div style="flex:1 1 130px;min-width:120px;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;">'
         + '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:4px;">' + esc(c.label) + '</div>'
         + '<div style="font-size:18px;font-weight:800;color:var(--accent);font-variant-numeric:tabular-nums;">' + esc(c.value) + '</div>'
         + '</div>';
    });
    h += '</div>';

    // Table
    h += '<div class="ops-grid-scroll" style="max-height:420px;">';
    h += '<table class="ops-grid" id="tblAceReport"><thead><tr>';
    h += '<th style="text-align:left;min-width:64px;position:sticky;left:0;z-index:3;background:var(--card);">Store</th>';
    COLS.forEach(function (c) {
      var isAttach = c.grp === 'attach';
      h += '<th title="' + esc(c.full) + '"' + (isAttach ? ' style="color:var(--text-muted);"' : '') + '>' + esc(c.label) + '</th>';
    });
    h += '</tr></thead><tbody>';

    rows.forEach(function (r) {
      var name = (typeof getStoreDisplayName === 'function') ? getStoreDisplayName(r.store) : ('#' + r.store);
      h += '<tr class="clickable-row" onclick="navigateTo(\'stores/' + esc(r.store) + '\')">';
      h += '<td style="text-align:left;font-weight:700;position:sticky;left:0;z-index:2;background:var(--card);">#' + esc(r.store) + '</td>';
      COLS.forEach(function (c) {
        var v = Number(r[c.key]) || 0;
        var st = cellStyle(c, v, bounds[c.key].min, bounds[c.key].max);
        h += '<td style="font-variant-numeric:tabular-nums;' + st + '">' + esc(fmt(v, c.fmt)) + '</td>';
      });
      h += '</tr>';
    });

    // Totals / averages footer
    h += '<tr style="font-weight:800;border-top:2px solid var(--accent);background:var(--card-hover);">';
    h += '<td style="text-align:left;position:sticky;left:0;z-index:2;background:var(--card-hover);">TOTAL</td>';
    COLS.forEach(function (c) {
      h += '<td style="font-variant-numeric:tabular-nums;">' + esc(fmt(aggregate(c, rows), c.fmt)) + '</td>';
    });
    h += '</tr>';

    h += '</tbody></table></div>';

    // Legend
    h += '<div style="font-size:10px;color:var(--text-muted);margin-top:8px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">'
       + '<span>Heatmap: <span style="color:var(--green);font-weight:700;">green = better</span> · <span style="color:var(--red);font-weight:700;">red = needs attention</span> (per column; Labor % &amp; COGS % inverted)</span>'
       + '<span>Source: Monday morning tune-up, ' + esc(ACE_REPORT.period) + '</span>'
       + '</div>';

    h += '</div>';

    el.innerHTML = h;
  }

  window.renderAceReport = renderAceReport;
  window.ACE_REPORT = ACE_REPORT;
})();
