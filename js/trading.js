/* ========================================
   MADAO Trading Dashboard — Premium Renderer
   SVG gauge, Lucide icons, staggered animations,
   Date-based report archive navigation
   ======================================== */

(function () {
  'use strict';

  var BASE_DATA_PATH = 'data/trading/';
  var cachedData = null;
  var reportIndex = null;
  var currentDate = null;
  var dropdownOpen = false;

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

  function getScoreBadgeClass(score) {
    if (score >= 90) return 'badge-green';
    if (score >= 70) return 'badge-green';
    if (score >= 50) return 'badge-yellow';
    if (score >= 30) return 'badge-yellow';
    return 'badge-red';
  }

  function getScoreRangeShort(score) {
    var lang = window.MadaoI18n ? window.MadaoI18n.getLang() : 'en';
    if (lang === 'zh') {
      if (score >= 90) return 'Fat Pitch';
      if (score >= 70) return '高确信';
      if (score >= 50) return '中等';
      if (score >= 30) return '低确信';
      return '资本保全';
    }
    if (score >= 90) return 'Fat Pitch';
    if (score >= 70) return 'High';
    if (score >= 50) return 'Moderate';
    if (score >= 30) return 'Low';
    return 'Preserve';
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

  // =============================================
  // DATE NAVIGATOR
  // =============================================
  function renderDateNav() {
    var el = document.getElementById('date-nav');
    if (!el || !reportIndex) return;

    var reports = reportIndex.reports || [];
    var latestDate = reportIndex.latest;
    var isLatest = currentDate === latestDate;
    var displayDate = currentDate || latestDate;

    // Build report list items
    var listHtml = '';
    for (var i = 0; i < reports.length; i++) {
      var rpt = reports[i];
      var isActive = rpt.date === displayDate;
      var isRptLatest = rpt.date === latestDate;
      var scoreBadgeClass = getScoreBadgeClass(rpt.score);
      var rangeLabel = L(rpt.range);

      listHtml +=
        '<div class="report-list-item' + (isActive ? ' active' : '') + '" data-date="' + escapeHtml(rpt.date) + '">' +
          '<div class="report-date">' +
            escapeHtml(rpt.date) +
            (isRptLatest ? '<span class="latest-tag">' + escapeHtml(t('trading.latest_report')) + '</span>' : '') +
          '</div>' +
          '<div class="report-meta">' +
            '<span class="report-score ' + scoreBadgeClass + '">' + rpt.score.toFixed(1) + '</span>' +
            '<span class="report-range ' + scoreBadgeClass + '">' + escapeHtml(rangeLabel) + '</span>' +
          '</div>' +
        '</div>';
    }

    el.innerHTML =
      '<div class="report-list-wrapper">' +
        '<button class="date-nav-toggle" id="date-nav-toggle">' +
          '<i data-lucide="calendar" class="icon"></i>' +
          '<span>' + escapeHtml(displayDate) + '</span>' +
          '<svg class="chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 6 8 10 12 6"/></svg>' +
        '</button>' +
        '<div class="report-list" id="report-list">' +
          (listHtml || '<div style="padding:1rem;text-align:center;color:var(--text-muted)">' + escapeHtml(t('trading.no_reports')) + '</div>') +
        '</div>' +
      '</div>';

    // Bind toggle
    var toggleBtn = document.getElementById('date-nav-toggle');
    var listEl = document.getElementById('report-list');

    if (toggleBtn && listEl) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownOpen = !dropdownOpen;
        toggleBtn.classList.toggle('open', dropdownOpen);
        listEl.classList.toggle('open', dropdownOpen);
      });

      // Bind date selection
      var items = listEl.querySelectorAll('.report-list-item');
      for (var j = 0; j < items.length; j++) {
        items[j].addEventListener('click', function () {
          var date = this.getAttribute('data-date');
          if (date && date !== currentDate) {
            loadReportByDate(date);
          }
          dropdownOpen = false;
          toggleBtn.classList.remove('open');
          listEl.classList.remove('open');
        });
      }
    }

    // Close on outside click
    document.addEventListener('click', function () {
      if (dropdownOpen) {
        dropdownOpen = false;
        var tb = document.getElementById('date-nav-toggle');
        var rl = document.getElementById('report-list');
        if (tb) tb.classList.remove('open');
        if (rl) rl.classList.remove('open');
      }
    });
  }

  // =============================================
  // RENDER FUNCTIONS
  // =============================================
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
      '</div>' +
      '<div id="date-nav" class="date-nav"></div>';

    // Render date navigator inside hero
    renderDateNav();
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
          '<div class="signal-progress">' +
            '<svg width="100%" height="6" style="border-radius:3px;overflow:hidden">' +
              '<defs>' + getSignalGradient(sig.score, gradId) + '</defs>' +
              '<rect width="100%" height="6" fill="rgba(255,255,255,0.04)" rx="3"/>' +
              '<rect width="' + sig.score + '%" height="6" fill="url(#' + gradId + ')" rx="3"/>' +
            '</svg>' +
          '</div>' +
          '<div class="signal-score-row">' +
            '<span class="signal-score" style="color:' + color + '">' + sig.score + '</span>' +
            '<span class="signal-badge ' + badgeClass + '">' + escapeHtml(L(sig.status)) + '</span>' +
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
        '<div class="card-title"><i data-lucide="file-text" class="icon"></i>' + escapeHtml(t('trading.summary_title')) + '</div>' +
      '</div>' +
      '<div class="summary-text">' + escapeHtml(L(data.trading_summary)) + '</div>' +
      (data.trading_quote ? '<blockquote class="summary-quote">"' + escapeHtml(L(data.trading_quote)) + '"</blockquote>' : '');
  }

  function renderMarketOverview(data) {
    var headEl = document.getElementById('market-table-head');
    var bodyEl = document.getElementById('market-table-body');

    headEl.innerHTML =
      '<tr>' +
        '<th>' + escapeHtml(t('trading.th_asset')) + '</th>' +
        '<th>' + escapeHtml(t('trading.th_value')) + '</th>' +
        '<th>' + escapeHtml(t('trading.th_change')) + '</th>' +
        '<th class="asset-note">' + escapeHtml(t('trading.th_note')) + '</th>' +
      '</tr>';

    var rows = '';
    for (var i = 0; i < data.market_overview.length; i++) {
      var m = data.market_overview[i];
      var changeClass = getChangeClass(m.direction);
      var arrow = getChangeArrow(m.direction);
      var assetName = L(m.asset);
      var iconName = getAssetIcon(assetName);

      rows +=
        '<tr>' +
          '<td class="asset-name"><i data-lucide="' + iconName + '" class="icon"></i>' + escapeHtml(assetName) + '</td>' +
          '<td class="asset-value">' + escapeHtml(m.value) + '</td>' +
          '<td class="' + changeClass + '">' + arrow + escapeHtml(L(m.change)) + '</td>' +
          '<td class="asset-note">' + escapeHtml(L(m.note)) + '</td>' +
        '</tr>';
    }
    bodyEl.innerHTML = rows;
  }

  function renderBtcDetail(data) {
    var el = document.getElementById('btc-detail-card');
    if (!el || !data.btc_detail) return;
    var btc = data.btc_detail;
    var fgValue = btc.fear_greed_index || 0;
    var fgClass = getFearGreedClass(fgValue);
    var fgLabel = getFearGreedLabel(fgValue);

    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title"><i data-lucide="bitcoin" class="icon"></i>' + escapeHtml(t('trading.btc_title')) + '</div>' +
      '</div>' +
      '<div class="detail-metrics-grid">' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.btc_price')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(btc.price) + '</div>' +
          '<div class="metric-sub ' + getChangeClass(btc.change_direction) + '">' + getChangeArrow(btc.change_direction) + escapeHtml(btc.change_24h) + '</div>' +
        '</div>' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.fear_greed')) + '</div>' +
          '<div class="metric-value">' + fgValue + '</div>' +
          '<div class="metric-sub"><span class="inline-badge ' + fgClass + '">' + escapeHtml(fgLabel) + '</span></div>' +
        '</div>' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.exchange_flow')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(L(btc.exchange_flow_direction)) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(btc.exchange_flow_detail)) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-analysis">' + escapeHtml(L(btc.analysis)) + '</div>';
  }

  function renderGoldDetail(data) {
    var el = document.getElementById('gold-detail-card');
    if (!el || !data.gold_detail) return;
    var gold = data.gold_detail;

    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title"><i data-lucide="gem" class="icon"></i>' + escapeHtml(t('trading.gold_title')) + '</div>' +
      '</div>' +
      '<div class="detail-metrics-grid">' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.gold_spot')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(gold.spot_price) + '</div>' +
          '<div class="metric-sub ' + getChangeClass(gold.change_direction) + '">' + getChangeArrow(gold.change_direction) + escapeHtml(gold.change) + '</div>' +
        '</div>' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.gold_silver_ratio')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(gold.gold_silver_ratio) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(gold.gold_silver_note)) + '</div>' +
        '</div>' +
        '<div class="detail-metric">' +
          '<div class="metric-label">' + escapeHtml(t('trading.gold_driver')) + '</div>' +
          '<div class="metric-value">' + escapeHtml(L(gold.key_driver)) + '</div>' +
          '<div class="metric-sub">' + escapeHtml(L(gold.key_driver_detail)) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-analysis">' + escapeHtml(L(gold.analysis)) + '</div>';
  }

  function renderRisks(data) {
    var el = document.getElementById('risks-list');
    var html = '';
    for (var i = 0; i < data.risks.length; i++) {
      var risk = data.risks[i];
      html +=
        '<li class="risk-item animate-in animate-in-delay-' + (i + 1) + '">' +
          '<div class="risk-title"><i data-lucide="alert-triangle" class="icon risk-icon"></i>' + escapeHtml(L(risk.title)) + '</div>' +
          '<div class="risk-desc">' + escapeHtml(L(risk.description)) + '</div>' +
        '</li>';
    }
    el.innerHTML = html;
  }

  function renderDivergence(data) {
    var el = document.getElementById('divergence-card');
    var div = data.divergence;
    var statusText = L(div.status);
    var hasDiv = statusText && statusText.toLowerCase && statusText.toLowerCase() !== 'none' && statusText !== '无明显背离';
    var badgeClass = hasDiv ? 'badge-red' : 'badge-green';

    el.innerHTML =
      '<div class="card-header">' +
        '<div class="card-title"><i data-lucide="git-compare-arrows" class="icon"></i>' + escapeHtml(t('trading.divergence_title')) + '</div>' +
        '<span class="card-badge ' + badgeClass + '">' + escapeHtml(statusText) + '</span>' +
      '</div>' +
      '<div class="divergence-content">' +
        '<p>' + escapeHtml(L(div.description)) + '</p>' +
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

  // --- Load report by date ---
  async function loadReportByDate(date) {
    currentDate = date;
    try {
      var url = BASE_DATA_PATH + date + '.json';
      var resp = await fetch(url);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      cachedData = await resp.json();
      renderAll(cachedData);
    } catch (err) {
      console.error('Failed to load report for ' + date + ':', err);
      // Try falling back to latest
      try {
        var resp2 = await fetch(BASE_DATA_PATH + 'latest.json');
        if (!resp2.ok) throw new Error('HTTP ' + resp2.status);
        cachedData = await resp2.json();
        currentDate = reportIndex ? reportIndex.latest : date;
        renderAll(cachedData);
      } catch (err2) {
        showError(err2.message);
      }
    }
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
      // Load report index first
      var indexResp = await fetch(BASE_DATA_PATH + 'index.json');
      if (indexResp.ok) {
        reportIndex = await indexResp.json();
        currentDate = reportIndex.latest;
      }

      // Load the latest report data
      var dataUrl = currentDate
        ? BASE_DATA_PATH + currentDate + '.json'
        : BASE_DATA_PATH + 'latest.json';

      var resp = await fetch(dataUrl);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      cachedData = await resp.json();

      // Set currentDate from data if not set
      if (!currentDate && cachedData.report_date) {
        currentDate = cachedData.report_date;
      }

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
