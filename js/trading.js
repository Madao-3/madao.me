/* ========================================
   MADAO Trading Dashboard — Data Loader
   Uses MadaoI18n for bilingual rendering
   ======================================== */

(function () {
  'use strict';

  var DATA_URL = 'data/trading/latest.json';
  var cachedData = null;

  // --- Shorthand ---
  function t(key) { return window.MadaoI18n ? window.MadaoI18n.t(key) : key; }
  function L(val) {
    if (val === null || val === undefined) return '';
    if (window.MadaoI18n) return window.MadaoI18n.localize(val);
    // Fallback: if val is {en, zh}, return en
    if (typeof val === 'object' && !Array.isArray(val)) {
      return val.en !== undefined ? val.en : String(val);
    }
    return val;
  }

  // --- Utility ---
  function getScoreClass(score) {
    if (score >= 90) return 'score-fat-pitch';
    if (score >= 70) return 'score-high-conviction';
    if (score >= 50) return 'score-moderate';
    if (score >= 30) return 'score-low-conviction';
    return 'score-capital-preservation';
  }

  function getSignalColor(score) {
    if (score >= 70) return 'var(--accent-green)';
    if (score >= 50) return 'var(--accent-yellow)';
    return 'var(--accent-red)';
  }

  function getSignalBadgeClass(score) {
    if (score >= 70) return 'badge-green';
    if (score >= 50) return 'badge-yellow';
    return 'badge-red';
  }

  function getChangeClass(direction) {
    if (direction === 'up') return 'change-up';
    if (direction === 'down') return 'change-down';
    return 'change-neutral';
  }

  function getLiquidityBadgeClass(condition) {
    if (!condition || typeof condition !== 'string') return 'badge-yellow';
    var c = condition.toLowerCase();
    if (c.includes('expan')) return 'badge-green';
    if (c.includes('tight') || c.includes('contract') || c.includes('紧')) return 'badge-red';
    return 'badge-yellow';
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') str = String(str);
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getFearGreedClass(value) {
    if (value >= 75) return 'badge-green';
    if (value >= 50) return 'badge-yellow';
    if (value >= 25) return 'badge-yellow';
    return 'badge-red';
  }

  function getFearGreedLabel(value) {
    var lang = window.MadaoI18n ? window.MadaoI18n.getLang() : 'en';
    if (lang === 'zh') {
      if (value >= 75) return '极度贪婪';
      if (value >= 55) return '贪婪';
      if (value >= 45) return '中性';
      if (value >= 25) return '恐惧';
      return '极度恐惧';
    }
    if (value >= 75) return 'Extreme Greed';
    if (value >= 55) return 'Greed';
    if (value >= 45) return 'Neutral';
    if (value >= 25) return 'Fear';
    return 'Extreme Fear';
  }

  // --- Render Functions ---
  function renderHeroScore(data) {
    var el = document.getElementById('hero-score');
    var scoreClass = getScoreClass(data.composite_score);
    var rangeLabel = L(data.score_range_label);

    el.innerHTML =
      '<div class="hero-date">' + escapeHtml(data.report_date) + ' — ' + escapeHtml(t('trading.report_subtitle')) + '</div>' +
      '<div class="hero-title">' + escapeHtml(t('trading.composite_title')) + '</div>' +
      '<div class="score-display ' + scoreClass + '">' +
        '<div class="score-number">' + data.composite_score.toFixed(1) + '</div>' +
        '<div class="score-label">' + escapeHtml(rangeLabel) + '</div>' +
      '</div>' +
      '<div class="position-badge">' +
        '<span class="label">' + escapeHtml(t('trading.position_label')) + '</span>' +
        '<span class="value">' + escapeHtml(L(data.position_advice)) + '</span>' +
      '</div>';
  }

  function renderLiquidity(data) {
    var el = document.getElementById('liquidity-card');
    var liq = data.liquidity_status;
    var conditionText = L(liq.condition);
    var badgeClass = getLiquidityBadgeClass(conditionText);

    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' +
          escapeHtml(t('trading.liquidity_title')) +
        '</div>' +
        '<span class="card-badge ' + badgeClass + '">' + escapeHtml(conditionText) + '</span>' +
      '</div>' +
      '<div class="liquidity-grid">' +
        '<div class="liquidity-item">' +
          '<div class="metric-label">' + escapeHtml(t('trading.fed_label')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(L(liq.fed_balance_sheet)) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(liq.fed_balance_sheet_change)) + '</div>' +
        '</div>' +
        '<div class="liquidity-item">' +
          '<div class="metric-label">' + escapeHtml(t('trading.rrp_label')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(L(liq.rrp)) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(liq.rrp_note)) + '</div>' +
        '</div>' +
        '<div class="liquidity-item">' +
          '<div class="metric-label">' + escapeHtml(t('trading.tga_label')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(L(liq.tga)) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(liq.tga_note)) + '</div>' +
        '</div>' +
        '<div class="liquidity-item">' +
          '<div class="metric-label">' + escapeHtml(t('trading.net_liq_label')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(L(liq.net_liquidity)) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(liq.net_liquidity_change)) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="liquidity-detail">' + escapeHtml(L(liq.details)) + '</div>';
  }

  function renderSignals(data) {
    var el = document.getElementById('signals-grid');
    var html = '';
    for (var i = 0; i < data.signals.length; i++) {
      var sig = data.signals[i];
      var color = getSignalColor(sig.score);
      var badgeClass = getSignalBadgeClass(sig.score);
      html +=
        '<div class="signal-card">' +
          '<div class="signal-header">' +
            '<span class="signal-name">' + escapeHtml(L(sig.name)) + '</span>' +
            '<span class="signal-weight">' + escapeHtml(t('trading.weight_prefix')) + ' ' + escapeHtml(sig.weight) + '</span>' +
          '</div>' +
          '<div class="signal-bar-container">' +
            '<div class="signal-bar" style="width: ' + sig.score + '%; background: ' + color + ';"></div>' +
          '</div>' +
          '<div class="signal-score-row">' +
            '<span class="signal-score" style="color: ' + color + ';">' + sig.score + '</span>' +
            '<span class="signal-status ' + badgeClass + '">' + escapeHtml(L(sig.status)) + '</span>' +
          '</div>' +
          '<div class="signal-reason">' + escapeHtml(L(sig.reason)) + '</div>' +
        '</div>';
    }
    el.innerHTML = html;
  }

  function renderSummary(data) {
    var el = document.getElementById('summary-card');
    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          escapeHtml(t('trading.summary_title')) +
        '</div>' +
      '</div>' +
      '<div class="summary-text">' + escapeHtml(L(data.trading_summary)) + '</div>' +
      (data.trading_quote ? '<div class="summary-quote">"' + escapeHtml(data.trading_quote) + '"</div>' : '');
  }

  function renderMarketOverview(data) {
    var el = document.getElementById('market-table-body');
    var html = '';
    for (var i = 0; i < data.market_overview.length; i++) {
      var item = data.market_overview[i];
      var changeClass = getChangeClass(item.direction);
      html +=
        '<tr>' +
          '<td class="asset-name">' + escapeHtml(L(item.asset)) + '</td>' +
          '<td class="asset-value">' + escapeHtml(item.value) + '</td>' +
          '<td class="asset-change ' + changeClass + '">' + escapeHtml(L(item.change)) + '</td>' +
          '<td class="asset-note">' + escapeHtml(L(item.note)) + '</td>' +
        '</tr>';
    }
    el.innerHTML = html;
  }

  function renderMarketTableHeaders() {
    var el = document.getElementById('market-table-head');
    if (el) {
      el.innerHTML =
        '<tr>' +
          '<th>' + escapeHtml(t('trading.th_asset')) + '</th>' +
          '<th>' + escapeHtml(t('trading.th_value')) + '</th>' +
          '<th>' + escapeHtml(t('trading.th_change')) + '</th>' +
          '<th>' + escapeHtml(t('trading.th_note')) + '</th>' +
        '</tr>';
    }
  }

  function renderRisks(data) {
    var el = document.getElementById('risks-list');
    var html = '';
    for (var i = 0; i < data.risks.length; i++) {
      var risk = data.risks[i];
      html +=
        '<li class="risk-item">' +
          '<div class="risk-title">' + escapeHtml(L(risk.title)) + '</div>' +
          '<div class="risk-desc">' + escapeHtml(L(risk.description)) + '</div>' +
        '</li>';
    }
    el.innerHTML = html;
  }

  function renderDivergence(data) {
    var el = document.getElementById('divergence-card');
    var div = data.divergence;
    var statusText = L(div.status);
    var isNone = !statusText || statusText === 'None' || statusText === '无明显背离';
    var badgeClass = isNone ? 'badge-green' : 'badge-red';

    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
          escapeHtml(t('trading.divergence_title')) +
        '</div>' +
      '</div>' +
      '<div class="divergence-content">' +
        '<span class="divergence-status ' + badgeClass + '">' + escapeHtml(statusText) + '</span>' +
        '<div class="divergence-desc">' + escapeHtml(L(div.description)) + '</div>' +
      '</div>';
  }

  function renderDisclaimer(data) {
    var el = document.getElementById('disclaimer');
    if (el && data.disclaimer) {
      el.textContent = L(data.disclaimer);
    }
  }

  // --- BTC Detail Card ---
  function renderBtcDetail(data) {
    var el = document.getElementById('btc-detail-card');
    if (!el || !data.btc_detail) return;
    var btc = data.btc_detail;
    var changeClass = (btc.change_24h || '').startsWith('-') ? 'change-down' : 'change-up';
    var fgValue = btc.fear_greed_index || 0;
    var fgClass = getFearGreedClass(fgValue);
    var fgLabel = getFearGreedLabel(fgValue);
    var flowClass = 'change-neutral';
    var flowDir = L(btc.exchange_flow_direction);
    if (typeof flowDir === 'string') {
      var fd = flowDir.toLowerCase();
      if (fd.includes('inflow') || fd.includes('流入')) flowClass = 'change-down';
      if (fd.includes('outflow') || fd.includes('流出')) flowClass = 'change-up';
    }

    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.5 8h3.5a2 2 0 0 1 0 4h-3.5"/><path d="M9.5 12h4.5a2 2 0 0 1 0 4h-4.5"/><line x1="10" y1="6" x2="10" y2="18"/><line x1="13" y1="6" x2="13" y2="18"/></svg>' +
          escapeHtml(t('trading.btc_title')) +
        '</div>' +
      '</div>' +
      '<div class="detail-metrics-grid">' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.btc_price')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(btc.price) + '</div>' +
          '<div class="metric-sub ' + changeClass + '">' + escapeHtml(btc.change_24h) + '</div>' +
        '</div>' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.fear_greed')) + '</div>' +
          '<div class="metric-value">' + fgValue + '</div>' +
          '<div class="metric-sub"><span class="inline-badge ' + fgClass + '">' + escapeHtml(fgLabel) + '</span></div>' +
        '</div>' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.exchange_flow')) + '</div>' +
          '<div class="metric-value ' + flowClass + '">' + escapeHtml(L(btc.exchange_flow_direction)) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(btc.exchange_flow_note)) + '</div>' +
        '</div>' +
      '</div>' +
      (btc.note ? '<div class="detail-note">' + escapeHtml(L(btc.note)) + '</div>' : '');
  }

  // --- Gold Detail Card ---
  function renderGoldDetail(data) {
    var el = document.getElementById('gold-detail-card');
    if (!el || !data.gold_detail) return;
    var gold = data.gold_detail;
    var changeClass = (gold.change || '').startsWith('-') ? 'change-down' : 'change-up';

    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>' +
          escapeHtml(t('trading.gold_title')) +
        '</div>' +
      '</div>' +
      '<div class="detail-metrics-grid">' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.gold_spot')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(gold.spot_price) + '</div>' +
          '<div class="metric-sub ' + changeClass + '">' + escapeHtml(gold.change) + '</div>' +
        '</div>' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.gold_silver_ratio')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(gold.gold_silver_ratio) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(gold.gold_silver_note)) + '</div>' +
        '</div>' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.gold_driver')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(L(gold.key_driver)) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(gold.driver_note)) + '</div>' +
        '</div>' +
      '</div>' +
      (gold.note ? '<div class="detail-note">' + escapeHtml(L(gold.note)) + '</div>' : '');
  }

  // --- Build Page Structure ---
  function buildStructure() {
    var main = document.getElementById('trading-content');
    main.innerHTML =
      '<div id="hero-score" class="hero-score"></div>' +
      '<div class="container">' +
        '<div id="liquidity-card" class="card"></div>' +
        '<div class="section-title" data-i18n="trading.signals_section">' + escapeHtml(t('trading.signals_section')) + '</div>' +
        '<div id="signals-grid" class="signals-grid"></div>' +
        '<div id="summary-card" class="card"></div>' +
        '<div class="section-title" data-i18n="trading.market_section">' + escapeHtml(t('trading.market_section')) + '</div>' +
        '<div class="card">' +
          '<table class="market-table">' +
            '<thead id="market-table-head"></thead>' +
            '<tbody id="market-table-body"></tbody>' +
          '</table>' +
        '</div>' +
        '<div class="section-title" data-i18n="trading.asset_detail_section">' + escapeHtml(t('trading.asset_detail_section')) + '</div>' +
        '<div class="detail-cards-row">' +
          '<div id="btc-detail-card" class="card detail-card"></div>' +
          '<div id="gold-detail-card" class="card detail-card"></div>' +
        '</div>' +
        '<div class="section-title" data-i18n="trading.risks_section">' + escapeHtml(t('trading.risks_section')) + '</div>' +
        '<ul id="risks-list" class="risk-list"></ul>' +
        '<div class="section-title" data-i18n="trading.divergence_section">' + escapeHtml(t('trading.divergence_section')) + '</div>' +
        '<div id="divergence-card" class="card"></div>' +
        '<div class="footer">' +
          '<p id="disclaimer" class="footer-text"></p>' +
        '</div>' +
      '</div>';
  }

  function renderAllData(data) {
    renderHeroScore(data);
    renderLiquidity(data);
    renderSignals(data);
    renderSummary(data);
    renderMarketTableHeaders();
    renderMarketOverview(data);
    renderBtcDetail(data);
    renderGoldDetail(data);
    renderRisks(data);
    renderDivergence(data);
    renderDisclaimer(data);
  }

  // --- Main ---
  function showLoading() {
    var main = document.getElementById('trading-content');
    main.innerHTML =
      '<div class="loading">' +
        '<div class="loading-spinner"></div>' +
        '<div class="loading-text">' + escapeHtml(t('loading')) + '</div>' +
      '</div>';
  }

  function showError(msg) {
    var main = document.getElementById('trading-content');
    main.innerHTML =
      '<div class="error-state">' +
        '<h3>' + escapeHtml(t('error.title')) + '</h3>' +
        '<p>' + escapeHtml(msg) + '</p>' +
      '</div>';
  }

  function renderAll(data) {
    buildStructure();
    renderAllData(data);
  }

  // --- Language change handler ---
  window.addEventListener('langchange', function () {
    if (cachedData) {
      renderAll(cachedData);
    }
  });

  // --- Init ---
  async function init() {
    showLoading();
    try {
      var resp = await fetch(DATA_URL);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      cachedData = await resp.json();
      renderAll(cachedData);
    } catch (err) {
      console.error('Failed to load trading data:', err);
      showError(err.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
