/* ========================================
   MADAO Trading Dashboard — Data Loader
   ======================================== */

(function () {
  'use strict';

  const DATA_URL = 'data/trading/latest.json';

  // --- Utility ---
  function getScoreClass(score) {
    if (score >= 90) return 'score-fat-pitch';
    if (score >= 70) return 'score-high-conviction';
    if (score >= 50) return 'score-moderate';
    if (score >= 30) return 'score-low-conviction';
    return 'score-capital-preservation';
  }

  function getScoreRangeLabel(score) {
    if (score >= 90) return 'Fat Pitch';
    if (score >= 70) return 'High Conviction';
    if (score >= 50) return 'Moderate';
    if (score >= 30) return 'Low Conviction';
    return 'Capital Preservation';
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

  function getLiquidityBadgeClass(condition_en) {
    const c = condition_en.toLowerCase();
    if (c.includes('expan')) return 'badge-green';
    if (c.includes('tight') || c.includes('contract')) return 'badge-red';
    return 'badge-yellow';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Render Functions ---
  function renderHeroScore(data) {
    const el = document.getElementById('hero-score');
    const scoreClass = getScoreClass(data.composite_score);
    const rangeLabel = data.score_range_label || getScoreRangeLabel(data.composite_score);

    el.innerHTML = `
      <div class="hero-date">${escapeHtml(data.report_date)} — Druckenmiller Macro Signal Report</div>
      <div class="hero-title">Composite Conviction Score</div>
      <div class="score-display ${scoreClass}">
        <div class="score-number">${data.composite_score.toFixed(1)}</div>
        <div class="score-label">${escapeHtml(rangeLabel)}</div>
      </div>
      <div class="position-badge">
        <span class="label">Suggested Position</span>
        <span class="value">${escapeHtml(data.position_advice_en || data.position_advice)}</span>
      </div>
    `;
  }

  function renderLiquidity(data) {
    const el = document.getElementById('liquidity-card');
    const liq = data.liquidity_status;
    const badgeClass = getLiquidityBadgeClass(liq.condition_en);

    el.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          USD Liquidity Status
        </div>
        <span class="card-badge ${badgeClass}">${escapeHtml(liq.condition_en)}</span>
      </div>
      <div class="liquidity-grid">
        <div class="liquidity-item">
          <div class="metric-label">Fed Balance Sheet</div>
          <div class="metric-value">${escapeHtml(liq.fed_balance_sheet)}</div>
          <div class="metric-sub">${escapeHtml(liq.fed_balance_sheet_change)}</div>
        </div>
        <div class="liquidity-item">
          <div class="metric-label">RRP</div>
          <div class="metric-value">${escapeHtml(liq.rrp)}</div>
          <div class="metric-sub">${escapeHtml(liq.rrp_note)}</div>
        </div>
        <div class="liquidity-item">
          <div class="metric-label">TGA</div>
          <div class="metric-value">${escapeHtml(liq.tga)}</div>
          <div class="metric-sub">${escapeHtml(liq.tga_note)}</div>
        </div>
        <div class="liquidity-item">
          <div class="metric-label">Net Liquidity</div>
          <div class="metric-value">${escapeHtml(liq.net_liquidity)}</div>
          <div class="metric-sub">${escapeHtml(liq.net_liquidity_change)}</div>
        </div>
      </div>
      <div class="liquidity-detail">${escapeHtml(liq.details)}</div>
    `;
  }

  function renderSignals(data) {
    const el = document.getElementById('signals-grid');
    el.innerHTML = data.signals.map(sig => {
      const color = getSignalColor(sig.score);
      const badgeClass = getSignalBadgeClass(sig.score);
      return `
        <div class="signal-card">
          <div class="signal-header">
            <span class="signal-name">${escapeHtml(sig.name_en)}</span>
            <span class="signal-weight">Weight: ${escapeHtml(sig.weight)}</span>
          </div>
          <div class="signal-bar-container">
            <div class="signal-bar" style="width: ${sig.score}%; background: ${color};"></div>
          </div>
          <div class="signal-score-row">
            <span class="signal-score" style="color: ${color};">${sig.score}</span>
            <span class="signal-status ${badgeClass}">${escapeHtml(sig.status_en)}</span>
          </div>
          <div class="signal-reason">${escapeHtml(sig.reason)}</div>
        </div>
      `;
    }).join('');
  }

  function renderSummary(data) {
    const el = document.getElementById('summary-card');
    el.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Trading Signal Summary
        </div>
      </div>
      <div class="summary-text">${escapeHtml(data.trading_summary)}</div>
      ${data.trading_quote ? `<div class="summary-quote">"${escapeHtml(data.trading_quote)}"</div>` : ''}
    `;
  }

  function renderMarketOverview(data) {
    const el = document.getElementById('market-table-body');
    el.innerHTML = data.market_overview.map(item => {
      const changeClass = getChangeClass(item.direction);
      return `
        <tr>
          <td class="asset-name">${escapeHtml(item.asset)}</td>
          <td class="asset-value">${escapeHtml(item.value)}</td>
          <td class="asset-change ${changeClass}">${escapeHtml(item.change)}</td>
          <td class="asset-note">${escapeHtml(item.note)}</td>
        </tr>
      `;
    }).join('');
  }

  function renderRisks(data) {
    const el = document.getElementById('risks-list');
    el.innerHTML = data.risks.map(risk => `
      <li class="risk-item">
        <div class="risk-title">${escapeHtml(risk.title)}</div>
        <div class="risk-desc">${escapeHtml(risk.description)}</div>
      </li>
    `).join('');
  }

  function renderDivergence(data) {
    const el = document.getElementById('divergence-card');
    const div = data.divergence;
    const isNone = div.status === 'None';
    const badgeClass = isNone ? 'badge-green' : 'badge-red';

    el.innerHTML = `
      <div class="card-header">
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Divergence Alert
        </div>
      </div>
      <div class="divergence-content">
        <span class="divergence-status ${badgeClass}">${escapeHtml(div.status_cn)}</span>
        <div class="divergence-desc">${escapeHtml(div.description)}</div>
      </div>
    `;
  }

  function renderDisclaimer(data) {
    const el = document.getElementById('disclaimer');
    if (el && data.disclaimer) {
      el.textContent = data.disclaimer;
    }
  }

  // --- Main ---
  function showLoading() {
    const main = document.getElementById('trading-content');
    main.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading trading data...</div>
      </div>
    `;
  }

  function showError(msg) {
    const main = document.getElementById('trading-content');
    main.innerHTML = `
      <div class="error-state">
        <h3>Failed to load data</h3>
        <p>${escapeHtml(msg)}</p>
      </div>
    `;
  }

  function renderAll(data) {
    // Build the full trading content structure
    const main = document.getElementById('trading-content');
    main.innerHTML = `
      <div id="hero-score" class="hero-score"></div>

      <div class="container">
        <div id="liquidity-card" class="card"></div>

        <div class="section-title">Signal Scoring Panel</div>
        <div id="signals-grid" class="signals-grid"></div>

        <div id="summary-card" class="card"></div>

        <div class="section-title">Market Overview</div>
        <div class="card">
          <table class="market-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Value</th>
                <th>Change</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody id="market-table-body"></tbody>
          </table>
        </div>

        <div class="section-title">Key Risks</div>
        <ul id="risks-list" class="risk-list"></ul>

        <div class="section-title">Divergence Alert</div>
        <div id="divergence-card" class="card"></div>

        <div class="footer">
          <p id="disclaimer" class="footer-text"></p>
        </div>
      </div>
    `;

    renderHeroScore(data);
    renderLiquidity(data);
    renderSignals(data);
    renderSummary(data);
    renderMarketOverview(data);
    renderRisks(data);
    renderDivergence(data);
    renderDisclaimer(data);
  }

  // --- Init ---
  async function init() {
    showLoading();
    try {
      const resp = await fetch(DATA_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      renderAll(data);
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
