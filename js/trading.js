/* ========================================
   MADAO Trading Dashboard — Premium Renderer
   SVG gauge, Lucide icons, staggered animations
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

  function getScoreColor(score) {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#4ade80';
    if (score >= 50) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  }

  function getSignalColor(score) {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  }

  function getSignalGradient(score, id) {
    if (score >= 70) return '<linearGradient id="' + id + '" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient>';
    if (score >= 50) return '<linearGradient id="' + id + '" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#eab308"/><stop offset="100%" stop-color="#f97316"/></linearGradient>';
    return '<linearGradient id="' + id + '" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#f97316"/></linearGradient>';
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

  function getChangeArrow(direction) {
    if (direction === 'up') return '<svg class="change-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 10 8 5 13 10"/></svg>';
    if (direction === 'down') return '<svg class="change-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 8 11 13 6"/></svg>';
    return '';
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

  // --- SVG Gauge ---
  function buildGaugeSVG(score, size) {
    var r = (size / 2) - 12;
    var circumference = 2 * Math.PI * r;
    var arc = circumference * 0.75; // 270 degrees
    var fill = arc * (score / 100);
    var offset = arc - fill;
    var color = getScoreColor(score);

    return '<svg class="gauge-svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<defs>' +
        '<linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="' + color + '"/>' +
          '<stop offset="100%" stop-color="' + color + '" stop-opacity="0.5"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<circle class="gauge-bg" cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" ' +
        'stroke-dasharray="' + arc + ' ' + circumference + '" ' +
        'transform="rotate(135 ' + (size/2) + ' ' + (size/2) + ')"/>' +
      '<circle class="gauge-fill" cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" ' +
        'stroke="url(#gauge-grad)" ' +
        'stroke-dasharray="' + arc + ' ' + circumference + '" ' +
        'stroke-dashoffset="' + offset + '" ' +
        'style="--gauge-color: ' + color + ';" ' +
        'transform="rotate(135 ' + (size/2) + ' ' + (size/2) + ')"/>' +
    '</svg>';
  }

  // --- Signal icon map ---
  var signalIcons = {
    'Liquidity Regime': 'droplets',
    '流动性制度': 'droplets',
    'Forward Earnings': 'trending-up',
    '前瞻盈利': 'trending-up',
    'Market Breadth': 'bar-chart-3',
    '市场广度': 'bar-chart-3',
    'Price Signal': 'activity',
    '价格信号': 'activity'
  };

  function getSignalIcon(name) {
    return signalIcons[name] || 'circle-dot';
  }

  // --- Market asset icon map ---
  function getAssetIcon(asset) {
    var a = (asset || '').toLowerCase();
    if (a.includes('s&p') || a.includes('标普')) return 'bar-chart-2';
    if (a.includes('nasdaq') || a.includes('纳斯达克')) return 'cpu';
    if (a.includes('dow') || a.includes('道琼斯')) return 'building-2';
    if (a.includes('10y') || a.includes('2y') || a.includes('treasury') || a.includes('美债')) return 'landmark';
    if (a.includes('dxy') || a.includes('美元')) return 'dollar-sign';
    if (a.includes('gold') || a.includes('xau') || a.includes('黄金')) return 'gem';
    if (a.includes('oil') || a.includes('wti') || a.includes('原油')) return 'flame';
    if (a.includes('btc') || a.includes('比特币')) return 'bitcoin';
    if (a.includes('vix')) return 'gauge';
    return 'circle';
  }

  // --- Render Functions ---
  function renderHeroScore(data) {
    var el = document.getElementById('hero-score');
    var scoreClass = getScoreClass(data.composite_score);
    var rangeLabel = L(data.score_range_label);

    el.innerHTML =
      '<div class="hero-date animate-in">' + escapeHtml(data.report_date) + ' — ' + escapeHtml(t('trading.report_subtitle')) + '</div>' +
      '<div class="hero-title animate-in animate-in-delay-1">' + escapeHtml(t('trading.composite_title')) + '</div>' +
      '<div class="score-gauge-container animate-in animate-in-delay-2">' +
        '<div class="score-gauge ' + scoreClass + '">' +
          buildGaugeSVG(data.composite_score, 220) +
          '<div class="gauge-value">' +
            '<div class="gauge-number">' + data.composite_score.toFixed(1) + '</div>' +
            '<div class="gauge-label">' + escapeHtml(rangeLabel) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="position-badge animate-in animate-in-delay-3">' +
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
        '<div class="card-title"><i data-lucide="droplets" class="icon"></i>' + escapeHtml(t('trading.liquidity_title')) + '</div>' +
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
      var sigName = L(sig.name);
      var iconName = getSignalIcon(sigName);
      var gradId = 'sig-grad-' + i;

      html +=
        '<div class="signal-card animate-in animate-in-delay-' + (i + 1) + '">' +
          '<div class="signal-header">' +
            '<span class="signal-name"><i data-lucide="' + iconName + '" class="icon"></i>' + escapeHtml(sigName) + '</span>' +
            '<span class="signal-weight">' + escapeHtml(t('trading.weight_prefix')) + ' ' + escapeHtml(sig.weight) + '</span>' +
          '</div>' +
          '<div class="signal-bar-container">' +
            '<svg width="100%" height="6" style="display:block;">' +
              '<defs>' + getSignalGradient(sig.score, gradId) + '</defs>' +
              '<rect x="0" y="0" width="100%" height="6" rx="3" fill="rgba(255,255,255,0.04)"/>' +
              '<rect x="0" y="0" width="' + sig.score + '%" height="6" rx="3" fill="url(#' + gradId + ')" style="transition: width 1.2s cubic-bezier(0.4,0,0.2,1);"/>' +
            '</svg>' +
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
        '<div class="card-title"><i data-lucide="message-square-text" class="icon"></i>' + escapeHtml(t('trading.summary_title')) + '</div>' +
      '</div>' +
      '<div class="summary-text">' + escapeHtml(L(data.trading_summary)) + '</div>' +
      (data.trading_quote ? '<div class="summary-quote">"' + escapeHtml(data.trading_quote) + '"</div>' : '');
  }

  function renderMarketOverview(data) {
    var headEl = document.getElementById('market-table-head');
    var bodyEl = document.getElementById('market-table-body');

    headEl.innerHTML =
      '<tr>' +
        '<th>' + escapeHtml(t('trading.th_asset')) + '</th>' +
        '<th>' + escapeHtml(t('trading.th_value')) + '</th>' +
        '<th>' + escapeHtml(t('trading.th_change')) + '</th>' +
        '<th>' + escapeHtml(t('trading.th_note')) + '</th>' +
      '</tr>';

    var html = '';
    for (var i = 0; i < data.market_overview.length; i++) {
      var item = data.market_overview[i];
      var changeClass = getChangeClass(item.direction);
      var assetName = L(item.asset);
      var iconName = getAssetIcon(assetName);
      html +=
        '<tr>' +
          '<td class="asset-name"><i data-lucide="' + iconName + '" class="icon"></i>' + escapeHtml(assetName) + '</td>' +
          '<td class="asset-value">' + escapeHtml(item.value) + '</td>' +
          '<td class="asset-change ' + changeClass + '">' + getChangeArrow(item.direction) + escapeHtml(L(item.change)) + '</td>' +
          '<td class="asset-note">' + escapeHtml(L(item.note)) + '</td>' +
        '</tr>';
    }
    bodyEl.innerHTML = html;
  }

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
        '<div class="card-title"><i data-lucide="bitcoin" class="icon"></i>' + escapeHtml(t('trading.btc_title')) + '</div>' +
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

  function renderGoldDetail(data) {
    var el = document.getElementById('gold-detail-card');
    if (!el || !data.gold_detail) return;
    var gold = data.gold_detail;
    var changeClass = (gold.change || '').startsWith('-') ? 'change-down' : 'change-up';

    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title"><i data-lucide="gem" class="icon"></i>' + escapeHtml(t('trading.gold_title')) + '</div>' +
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

  function renderRisks(data) {
    var el = document.getElementById('risks-list');
    var html = '';
    for (var i = 0; i < data.risks.length; i++) {
      var risk = data.risks[i];
      html +=
        '<li class="risk-item animate-in animate-in-delay-' + (i + 1) + '">' +
          '<div class="risk-title"><i data-lucide="alert-triangle" class="icon"></i>' + escapeHtml(L(risk.title)) + '</div>' +
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
        '<div class="card-title"><i data-lucide="git-compare-arrows" class="icon"></i>' + escapeHtml(t('trading.divergence_title')) + '</div>' +
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

  // --- Build Page Structure ---
  function buildStructure() {
    var main = document.getElementById('trading-content');
    main.innerHTML =
      '<div id="hero-score" class="hero-score"></div>' +
      '<div class="container">' +
        '<div id="liquidity-card" class="card animate-in"></div>' +

        '<div class="section-title animate-in animate-in-delay-1" data-i18n="trading.signals_section">' + escapeHtml(t('trading.signals_section')) + '</div>' +
        '<div id="signals-grid" class="signals-grid"></div>' +

        '<div id="summary-card" class="card animate-in"></div>' +

        '<div class="section-title animate-in" data-i18n="trading.market_section">' + escapeHtml(t('trading.market_section')) + '</div>' +
        '<div class="card animate-in">' +
          '<table class="market-table">' +
            '<thead id="market-table-head"></thead>' +
            '<tbody id="market-table-body"></tbody>' +
          '</table>' +
        '</div>' +

        '<div class="section-title animate-in" data-i18n="trading.asset_detail_section">' + escapeHtml(t('trading.asset_detail_section')) + '</div>' +
        '<div class="detail-cards-row">' +
          '<div id="btc-detail-card" class="card detail-card btc-card animate-in"></div>' +
          '<div id="gold-detail-card" class="card detail-card gold-card animate-in animate-in-delay-1"></div>' +
        '</div>' +

        '<div class="section-title animate-in" data-i18n="trading.risks_section">' + escapeHtml(t('trading.risks_section')) + '</div>' +
        '<ul id="risks-list" class="risk-list"></ul>' +

        '<div class="section-title animate-in" data-i18n="trading.divergence_section">' + escapeHtml(t('trading.divergence_section')) + '</div>' +
        '<div id="divergence-card" class="card animate-in"></div>' +

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
    // Dispatch event so index.html can re-init Lucide icons
    window.dispatchEvent(new Event('trading-rendered'));
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
