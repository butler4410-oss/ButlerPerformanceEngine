/* ============================================================
 * BPA — Advanced Data Room reports
 * ------------------------------------------------------------
 * Four operator-grade reports computed from already-loaded data:
 *   1. renderDeclinedRevenue()  — lost upsell $ from declined inspections
 *   2. renderMarginByCategory() — true gross margin (uses Vendor_Item_Cost)
 *   3. renderSpeedOfService()   — cycle time by store + hour/day heatmap
 *   4. renderFleetRetention()   — fleet-vs-retail mix + repeat-customer rate
 * Each renders into its own container in the Data Room and hides when its
 * source data is absent. Pure HTML/CSS (no chart lib) so rendering is
 * deterministic. Hooked into renderDashboard's dataroom branch.
 * ============================================================ */
(function () {
  'use strict';

  function esc(s) { return (typeof escapeHTML === 'function') ? escapeHTML(String(s)) : String(s); }
  function num(s) { return parseFloat(String(s == null ? '' : s).replace(/[$,()]/g, '')) || 0; }
  function money0(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function money2(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(n) { return n.toFixed(1) + '%'; }
  function int(n) { return Math.round(n).toLocaleString('en-US'); }

  // Prefer the filtered view (respects store/date filters); fall back to raw.
  function rows(bucket) {
    if (typeof FILTERED !== 'undefined' && FILTERED && FILTERED[bucket] && FILTERED[bucket].length) return FILTERED[bucket];
    if (typeof DATA !== 'undefined' && DATA && DATA[bucket]) return DATA[bucket];
    return [];
  }
  function storeName(s) { return (typeof getStoreDisplayName === 'function') ? getStoreDisplayName(s) : ('#' + s); }

  // Diverging heat background: norm in [0,1], 1 = good (green), 0 = bad (red).
  function heatBg(norm) {
    if (norm == null) return '';
    if (norm >= 0.5) return 'background:rgba(5,150,105,' + ((norm - 0.5) * 2 * 0.30).toFixed(3) + ');';
    return 'background:rgba(220,38,38,' + ((0.5 - norm) * 2 * 0.26).toFixed(3) + ');';
  }
  function norm(v, min, max, better) {
    if (max === min) return 0.5;
    var n = (v - min) / (max - min);
    return better === 'low' ? 1 - n : n;
  }
  function minutes(a, b) {
    if (!a || !b) return null;
    var da = new Date(a), db = new Date(b);
    if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
    var m = (db - da) / 60000;
    return (m > 0 && m < 300) ? m : null; // drop overnight / bad stamps
  }

  function chipRow(chips) {
    return '<div style="display:flex;gap:10px;flex-wrap:wrap;margin:4px 0 14px;">' + chips.map(function (c) {
      return '<div style="flex:1 1 140px;min-width:120px;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 12px;">'
        + '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:4px;">' + esc(c.label) + '</div>'
        + '<div style="font-size:18px;font-weight:800;color:' + (c.color || 'var(--accent)') + ';font-variant-numeric:tabular-nums;">' + esc(c.value) + '</div></div>';
    }).join('') + '</div>';
  }
  function card(title, badge, inner, exportTblId) {
    return '<div class="ops-grid-wrap" style="margin-bottom:12px;border-top:3px solid var(--accent);">'
      + '<h3 style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><span>' + esc(title) + '</span>'
      + (badge ? '<span style="font-size:11px;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text-muted);">' + esc(badge) + '</span>' : '')
      + (exportTblId ? '<button class="btn-export" style="margin-left:auto;" onclick="exportReport(\'' + exportTblId + '\',\'' + esc(title) + '\')">Export</button>' : '')
      + '</h3>' + inner + '</div>';
  }
  function set(id, html) { var el = document.getElementById(id); if (!el) return; if (html == null) { el.style.display = 'none'; el.innerHTML = ''; } else { el.style.display = 'block'; el.innerHTML = html; } }

  // ── 1) DECLINED SERVICES / LOST REVENUE ──────────────────────
  function renderDeclinedRevenue() {
    var insp = rows('inspections');
    if (!insp.length) { set('rptDeclined', null); return; }

    // Best-effort price per category from sold line items (blended fallback).
    var det = rows('details');
    var catRev = {}, catQty = {}, allRev = 0, allQty = 0;
    det.forEach(function (r) {
      var ext = num(r.Extended_Price), q = num(r.Quantity_Sold) || 1, c = r.JLI_Category_Code || '';
      if (ext <= 0) return;
      catRev[c] = (catRev[c] || 0) + ext; catQty[c] = (catQty[c] || 0) + q; allRev += ext; allQty += q;
    });
    var blended = allQty ? allRev / allQty : 0;
    var priceFor = function (c) { return (catQty[c] && catRev[c]) ? catRev[c] / catQty[c] : blended; };

    // Single pass — accumulate declined opportunity by service, store, and severity.
    var SEV = { Red: 1, Orange: 1, Yellow: 1 };
    var flagged = 0, sold = 0, estLost = 0;
    var byCat = {}, byStore = {}, bySev = {};
    function bump(map, key, purch, lost, title) {
      var b = map[key] || (map[key] = { flag: 0, sold: 0, lost: 0, title: title || key });
      b.flag++; if (purch) b.sold++; b.lost += lost;
    }
    insp.forEach(function (r) {
      var st = r.Inspection_Status; if (!SEV[st]) return;
      var purch = String(r.Purchased_This_Visit) === 'True';
      var cat = r.JLI_Category_Code || (r.Service_Title || 'Other');
      var lost = purch ? 0 : priceFor(r.JLI_Category_Code || '');
      flagged++; if (purch) sold++; estLost += lost;
      bump(byCat, cat, purch, lost, r.Service_Title || cat);
      bump(byStore, (typeof cleanStoreNum === 'function') ? cleanStoreNum(r.Store_Number) : r.Store_Number, purch, lost);
      bump(bySev, st, purch, lost);
    });
    var declined = flagged - sold, closeRate = flagged ? sold / flagged * 100 : 0;

    var chips = chipRow([
      { label: 'Flagged (Y/O/R)', value: int(flagged) },
      { label: 'Sold on Visit', value: int(sold), color: 'var(--green)' },
      { label: 'Declined', value: int(declined), color: 'var(--red)' },
      { label: 'Close Rate', value: pct(closeRate) },
      { label: 'Value Declined (est.)', value: money0(estLost) },
      { label: 'Recoverable @ 25% Close', value: money0(estLost * 0.25), color: 'var(--green)' }
    ]);

    function sectionLabel(t) { return '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin:16px 0 6px;text-transform:uppercase;letter-spacing:0.5px;">' + t + '</div>'; }
    function declRow(label, b, lostMax) {
      var dec = b.flag - b.sold, close = b.flag ? b.sold / b.flag * 100 : 0;
      return '<tr><td style="text-align:left;font-weight:600;position:sticky;left:0;background:var(--card);">' + esc(label) + '</td>'
        + '<td>' + int(b.flag) + '</td><td style="color:var(--green);">' + int(b.sold) + '</td>'
        + '<td>' + int(dec) + '</td>'
        + '<td style="' + heatBg(norm(close, 0, 100, 'high')) + '">' + pct(close) + '</td>'
        + '<td style="font-weight:700;' + heatBg(1 - b.lost / (lostMax || 1)) + '">' + money0(b.lost) + '</td></tr>';
    }
    function grid(id, firstCol, entries) {
      var lostMax = Math.max.apply(null, entries.map(function (e) { return e.b.lost; }).concat([1]));
      var body = entries.map(function (e) { return declRow(e.label, e.b, lostMax); }).join('');
      return '<div class="ops-grid-scroll" style="max-height:320px;"><table class="ops-grid" id="' + id + '"><thead><tr>'
        + '<th style="text-align:left;position:sticky;left:0;background:var(--card);">' + firstCol + '</th>'
        + '<th>Flagged</th><th>Sold</th><th>Declined</th><th>Close %</th><th>Est. Lost $</th></tr></thead><tbody>'
        + body + '</tbody></table></div>';
    }

    var storeEntries = Object.keys(byStore).map(function (s) { return { label: storeName(s), b: byStore[s] }; }).sort(function (a, b) { return b.b.lost - a.b.lost; });
    var sevEntries = ['Red', 'Orange', 'Yellow'].filter(function (s) { return bySev[s]; }).map(function (s) { return { label: s, b: bySev[s] }; });
    var svcEntries = Object.keys(byCat).map(function (k) { return { label: byCat[k].title, b: byCat[k] }; }).sort(function (a, b) { return b.b.lost - a.b.lost; }).slice(0, 30);

    var inner = chips
      + sectionLabel('By store — where the money is walking out')
      + grid('tblDeclined', 'Store', storeEntries)
      + sectionLabel('By severity — close Red (safety/urgent) first')
      + grid('tblDeclinedSev', 'Severity', sevEntries)
      + sectionLabel('By service — top 30 declined recommendations')
      + grid('tblDeclinedSvc', 'Recommended Service', svcEntries)
      + '<div style="font-size:10px;color:var(--text-muted);margin-top:8px;">Value declined = declined count × average sold price for that category (an upper bound assuming everything closes). "Recoverable @ 25% Close" models lifting the close rate from today\'s ' + closeRate.toFixed(1) + '% toward a realistic target. Est. Lost $ heat: reddest = biggest opportunity.</div>';

    set('rptDeclined', card('Declined Services — Lost Revenue', 'Yellow/Orange/Red inspection recommendations not purchased', inner, 'tblDeclined'));
  }

  // ── 2) GROSS MARGIN BY CATEGORY ──────────────────────────────
  function renderMarginByCategory() {
    var det = rows('details');
    var hasCost = det.some(function (r) { return r.Vendor_Item_Cost != null && r.Vendor_Item_Cost !== ''; });
    if (!det.length || !hasCost) { set('rptMargin', null); return; }

    var byCat = {}, tRev = 0, tCost = 0;
    det.forEach(function (r) {
      var ext = num(r.Extended_Price); if (ext <= 0) return;
      var q = num(r.Quantity_Sold) || 1, vc = num(r.Vendor_Item_Cost) * q, c = r.JLI_Category_Code || 'Other';
      var b = byCat[c] || (byCat[c] = { rev: 0, cost: 0, qty: 0 });
      b.rev += ext; b.cost += vc; b.qty += q; tRev += ext; tCost += vc;
    });
    var list = Object.keys(byCat).map(function (c) {
      var b = byCat[c], m = b.rev - b.cost;
      return { cat: c, rev: b.rev, cost: b.cost, margin: m, mpct: b.rev ? m / b.rev * 100 : 0, qty: b.qty };
    }).sort(function (a, b) { return b.margin - a.margin; });

    var chips = chipRow([
      { label: 'Revenue', value: money0(tRev) },
      { label: 'Product Cost', value: money0(tCost), color: 'var(--red)' },
      { label: 'Gross Margin', value: money0(tRev - tCost), color: 'var(--green)' },
      { label: 'Margin %', value: pct(tRev ? (tRev - tCost) / tRev * 100 : 0) }
    ]);
    var body = list.slice(0, 30).map(function (r) {
      return '<tr>'
        + '<td style="text-align:left;font-weight:600;position:sticky;left:0;background:var(--card);">' + esc(r.cat) + '</td>'
        + '<td>' + money0(r.rev) + '</td><td>' + money0(r.cost) + '</td>'
        + '<td style="font-weight:700;">' + money0(r.margin) + '</td>'
        + '<td style="' + heatBg(norm(r.mpct, 0, 100, 'high')) + '">' + pct(r.mpct) + '</td>'
        + '<td>' + int(r.qty) + '</td></tr>';
    }).join('');
    var table = '<div class="ops-grid-scroll" style="max-height:380px;"><table class="ops-grid" id="tblMargin"><thead><tr>'
      + '<th style="text-align:left;position:sticky;left:0;background:var(--card);">Category</th>'
      + '<th>Revenue</th><th>Cost</th><th>Gross Margin</th><th>Margin %</th><th>Qty</th>'
      + '</tr></thead><tbody>' + body + '</tbody></table></div>'
      + '<div style="font-size:10px;color:var(--text-muted);margin-top:8px;">Cost = vendor part cost (Vendor_Item_Cost × qty); service labor is not costed, so margin reflects parts markup plus labor.</div>';
    set('rptMargin', card('Profit — Gross Margin by Category', 'Revenue vs vendor cost', chips + table, 'tblMargin'));
  }

  // ── 3) SPEED OF SERVICE + THROUGHPUT HEATMAP ─────────────────
  function renderSpeedOfService() {
    var cust = rows('customers');
    var timed = cust.filter(function (r) { return r.Bay_Start_Time && r.Bay_End_Time; });
    if (!timed.length) { set('rptSpeed', null); return; }

    var bayAll = [], totAll = [], byStore = {};
    var grid = {}; // day(0-6) -> hour -> count
    timed.forEach(function (r) {
      var bay = minutes(r.Bay_Start_Time, r.Bay_End_Time);
      var tot = minutes(r.Greet_Time, r.Ring_Out_End_Time) || minutes(r.Greet_Time, r.Bay_End_Time);
      var s = (typeof cleanStoreNum === 'function') ? cleanStoreNum(r.Store_Number) : r.Store_Number;
      var b = byStore[s] || (byStore[s] = { bay: [], tot: [], n: 0 });
      b.n++;
      if (bay != null) { b.bay.push(bay); bayAll.push(bay); }
      if (tot != null) { b.tot.push(tot); totAll.push(tot); }
      var g = new Date(r.Greet_Time);
      if (!isNaN(g.getTime())) {
        var d = g.getDay(), h = Math.max(6, Math.min(20, g.getHours()));
        grid[d] = grid[d] || {}; grid[d][h] = (grid[d][h] || 0) + 1;
      }
    });
    var avg = function (a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; };

    var chips = chipRow([
      { label: 'Avg Bay Time', value: avg(bayAll).toFixed(1) + ' min' },
      { label: 'Avg Total Cycle', value: avg(totAll).toFixed(1) + ' min' },
      { label: 'Cars Measured', value: int(timed.length) },
      { label: 'Stores', value: int(Object.keys(byStore).length) }
    ]);

    // per-store table
    var storeList = Object.keys(byStore).sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true }); });
    var bays = storeList.map(function (s) { return avg(byStore[s].bay); });
    var mnB = Math.min.apply(null, bays), mxB = Math.max.apply(null, bays);
    var body = storeList.map(function (s) {
      var b = byStore[s];
      return '<tr><td style="text-align:left;font-weight:700;position:sticky;left:0;background:var(--card);">' + esc(storeName(s)) + '</td>'
        + '<td>' + int(b.n) + '</td>'
        + '<td style="' + heatBg(norm(avg(b.bay), mnB, mxB, 'low')) + '">' + avg(b.bay).toFixed(1) + '</td>'
        + '<td>' + avg(b.tot).toFixed(1) + '</td></tr>';
    }).join('');
    var table = '<div class="ops-grid-scroll" style="max-height:260px;"><table class="ops-grid" id="tblSpeed"><thead><tr>'
      + '<th style="text-align:left;position:sticky;left:0;background:var(--card);">Store</th><th>Cars</th><th>Avg Bay (min)</th><th>Avg Cycle (min)</th>'
      + '</tr></thead><tbody>' + body + '</tbody></table></div>';

    // hour x day heatmap
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var hours = []; for (var h = 7; h <= 19; h++) hours.push(h);
    var maxCell = 1;
    for (var d = 0; d < 7; d++) hours.forEach(function (h) { maxCell = Math.max(maxCell, (grid[d] && grid[d][h]) || 0); });
    var hmHead = '<tr><th style="text-align:left;position:sticky;left:0;background:var(--card);">Day</th>' + hours.map(function (h) {
      var lbl = (h === 12) ? '12p' : (h < 12 ? h + 'a' : (h - 12) + 'p');
      return '<th>' + lbl + '</th>';
    }).join('') + '</tr>';
    var hmBody = days.map(function (dn, d) {
      return '<tr><td style="text-align:left;font-weight:600;position:sticky;left:0;background:var(--card);">' + dn + '</td>'
        + hours.map(function (h) {
          var v = (grid[d] && grid[d][h]) || 0;
          return '<td style="' + heatBg(v / maxCell * 0.5 + 0.5) + '">' + (v || '') + '</td>';
        }).join('') + '</tr>';
    }).join('');
    var heat = '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Throughput — cars by day &amp; hour</div>'
      + '<div class="ops-grid-scroll"><table class="ops-grid" id="tblSpeedHeat"><thead>' + hmHead + '</thead><tbody>' + hmBody + '</tbody></table></div>';

    set('rptSpeed', card('Speed of Service', 'Bay & cycle time by store · throughput heatmap', chips + table + heat, 'tblSpeed'));
  }

  // ── 4) FLEET vs RETAIL + RETENTION ───────────────────────────
  function renderFleetRetention() {
    var ds = rows('daily_sales');
    if (!ds.length) { set('rptFleet', null); return; }

    var byStore = {}, tNet = 0, tFleet = 0, tFleetCt = 0, tVeh = 0, tRepeat = 0, tRepeatRev = 0;
    ds.forEach(function (r) {
      var s = (typeof cleanStoreNum === 'function') ? cleanStoreNum(r.Store_Number) : r.Store_Number;
      var net = num(r.Net_Sales);
      var fleet = num(r.Local_Fleet_Sales) + num(r.National_Fleet_Sales);
      var fleetCt = num(r.Local_Fleet_Sales_Count) + num(r.National_Fleet_Sales_Count);
      var veh = num(r.Vehicle_Count);
      var rep = num(r.Repeat_Customer_Count), repRev = num(r.Repeat_Customer_Dollars);
      var b = byStore[s] || (byStore[s] = { net: 0, fleet: 0, fleetCt: 0, veh: 0, rep: 0, repRev: 0 });
      b.net += net; b.fleet += fleet; b.fleetCt += fleetCt; b.veh += veh; b.rep += rep; b.repRev += repRev;
      tNet += net; tFleet += fleet; tFleetCt += fleetCt; tVeh += veh; tRepeat += rep; tRepeatRev += repRev;
    });
    if (tNet <= 0 && tFleet <= 0) { set('rptFleet', null); return; }

    var chips = chipRow([
      { label: 'Fleet Sales', value: money0(tFleet) },
      { label: 'Fleet % of Sales', value: pct(tNet ? tFleet / tNet * 100 : 0) },
      { label: 'Fleet Cars %', value: pct(tVeh ? tFleetCt / tVeh * 100 : 0) },
      { label: 'Repeat Customer %', value: pct(tVeh ? tRepeat / tVeh * 100 : 0), color: 'var(--green)' }
    ]);
    var storeList = Object.keys(byStore).sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true }); });
    var body = storeList.map(function (s) {
      var b = byStore[s], retail = b.net - b.fleet, fpct = b.net ? b.fleet / b.net * 100 : 0, rpct = b.veh ? b.rep / b.veh * 100 : 0;
      return '<tr><td style="text-align:left;font-weight:700;position:sticky;left:0;background:var(--card);">' + esc(storeName(s)) + '</td>'
        + '<td>' + money0(b.net) + '</td><td>' + money0(retail) + '</td>'
        + '<td>' + money0(b.fleet) + '</td>'
        + '<td style="' + heatBg(norm(fpct, 0, 25, 'high')) + '">' + pct(fpct) + '</td>'
        + '<td style="' + heatBg(norm(rpct, 0, 80, 'high')) + '">' + pct(rpct) + '</td></tr>';
    }).join('');
    var table = '<div class="ops-grid-scroll" style="max-height:300px;"><table class="ops-grid" id="tblFleet"><thead><tr>'
      + '<th style="text-align:left;position:sticky;left:0;background:var(--card);">Store</th>'
      + '<th>Net Sales</th><th>Retail $</th><th>Fleet $</th><th>Fleet %</th><th>Repeat %</th>'
      + '</tr></thead><tbody>' + body + '</tbody></table></div>';
    set('rptFleet', card('Fleet vs Retail & Retention', 'From daily store operations', chips + table, 'tblFleet'));
  }

  function renderAdvancedReports() {
    try { renderDeclinedRevenue(); } catch (e) { console.warn('DeclinedRevenue:', e); }
    try { renderMarginByCategory(); } catch (e) { console.warn('MarginByCategory:', e); }
    try { renderSpeedOfService(); } catch (e) { console.warn('SpeedOfService:', e); }
    try { renderFleetRetention(); } catch (e) { console.warn('FleetRetention:', e); }
  }

  window.renderDeclinedRevenue = renderDeclinedRevenue;
  window.renderMarginByCategory = renderMarginByCategory;
  window.renderSpeedOfService = renderSpeedOfService;
  window.renderFleetRetention = renderFleetRetention;
  window.renderAdvancedReports = renderAdvancedReports;
})();
