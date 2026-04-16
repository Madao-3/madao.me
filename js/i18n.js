/* ========================================
   MADAO Dashboard — i18n System
   ======================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'madao_lang';
  var DEFAULT_LANG = 'en';

  // --- Static UI translations ---
  var translations = {
    en: {
      // Nav
      'nav.trading': 'Trading',
      'nav.health': 'Health',
      'nav.work': 'Work',

      // Trading page
      'trading.report_subtitle': 'Druckenmiller Macro Signal Report',
      'trading.composite_title': 'Composite Conviction Score',
      'trading.position_label': 'Suggested Position',
      'trading.liquidity_title': 'USD Liquidity Status',
      'trading.fed_label': 'Fed Balance Sheet',
      'trading.rrp_label': 'RRP',
      'trading.tga_label': 'TGA',
      'trading.net_liq_label': 'Net Liquidity',
      'trading.signals_section': 'Signal Scoring Panel',
      'trading.weight_prefix': 'Weight:',
      'trading.summary_title': 'Trading Signal Summary',
      'trading.market_section': 'Market Overview',
      'trading.th_asset': 'Asset',
      'trading.th_value': 'Value',
      'trading.th_change': 'Change',
      'trading.th_note': 'Note',
      'trading.risks_section': 'Key Risks',
      'trading.divergence_section': 'Divergence Alert',
      'trading.divergence_title': 'Divergence Alert',
      'trading.asset_detail_section': 'Asset Deep Dive',
      'trading.btc_title': 'Bitcoin (BTC)',
      'trading.btc_price': 'Price',
      'trading.fear_greed': 'Fear & Greed Index',
      'trading.exchange_flow': 'Exchange Net Flow',
      'trading.gold_title': 'Gold (XAU)',
      'trading.gold_spot': 'Spot Price',
      'trading.gold_silver_ratio': 'Gold/Silver Ratio',
      'trading.gold_driver': 'Key Driver',

      // Health page
      'health.title': 'Health Module',
      'health.desc': 'Biometrics and health data visualization coming soon. This module will integrate data from wearable devices to provide comprehensive health insights.',
      'health.chip1': 'Whoop Recovery',
      'health.chip2': 'Apple Watch',
      'health.chip3': 'Sleep Analysis',
      'health.chip4': 'HRV Trends',
      'health.chip5': 'Activity Tracking',

      // Work page
      'work.title': 'Work Module',
      'work.desc': 'Work log, project tracking, and productivity insights coming soon. This module will serve as a personal knowledge base and task management system.',
      'work.chip1': 'Daily Log',
      'work.chip2': 'Project Tracker',
      'work.chip3': 'Code Commits',
      'work.chip4': 'Meeting Notes',
      'work.chip5': 'Goal Progress',

      // Common
      'loading': 'Loading trading data...',
      'error.title': 'Failed to load data'
    },
    zh: {
      // Nav
      'nav.trading': '交易',
      'nav.health': '健康',
      'nav.work': '工作',

      // Trading page
      'trading.report_subtitle': 'Druckenmiller 每日宏观交易信号报告',
      'trading.composite_title': '综合确信度分数',
      'trading.position_label': '建议仓位',
      'trading.liquidity_title': '美元流动性状态',
      'trading.fed_label': '美联储资产负债表',
      'trading.rrp_label': 'RRP（逆回购）',
      'trading.tga_label': 'TGA（财政账户）',
      'trading.net_liq_label': '净流动性',
      'trading.signals_section': '信号评分面板',
      'trading.weight_prefix': '权重：',
      'trading.summary_title': '交易信号摘要',
      'trading.market_section': '市场行情一览',
      'trading.th_asset': '资产',
      'trading.th_value': '数值',
      'trading.th_change': '变动',
      'trading.th_note': '说明',
      'trading.risks_section': '关键风险提示',
      'trading.divergence_section': '背离预警',
      'trading.divergence_title': '背离预警',
      'trading.asset_detail_section': '资产深度分析',
      'trading.btc_title': '比特币 (BTC)',
      'trading.btc_price': '价格',
      'trading.fear_greed': '恐惧贪婪指数',
      'trading.exchange_flow': '交易所净流向',
      'trading.gold_title': '黄金 (XAU)',
      'trading.gold_spot': '现货价格',
      'trading.gold_silver_ratio': '金银比',
      'trading.gold_driver': '核心驱动',

      // Health page
      'health.title': '健康模块',
      'health.desc': '生物指标与健康数据可视化即将上线。该模块将整合可穿戴设备数据，提供全面的健康洞察。',
      'health.chip1': 'Whoop 恢复',
      'health.chip2': 'Apple Watch',
      'health.chip3': '睡眠分析',
      'health.chip4': 'HRV 趋势',
      'health.chip5': '活动追踪',

      // Work page
      'work.title': '工作模块',
      'work.desc': '工作日志、项目追踪与生产力洞察即将上线。该模块将作为个人知识库和任务管理系统。',
      'work.chip1': '每日日志',
      'work.chip2': '项目追踪',
      'work.chip3': '代码提交',
      'work.chip4': '会议记录',
      'work.chip5': '目标进度',

      // Common
      'loading': '正在加载交易数据...',
      'error.title': '数据加载失败'
    }
  };

  // --- Core API ---
  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') return stored;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (lang !== 'en' && lang !== 'zh') return;
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function t(key) {
    var lang = getLang();
    var dict = translations[lang] || translations[DEFAULT_LANG];
    return dict[key] || key;
  }

  /** Resolve a bilingual value from JSON data.
   *  If val is an object with en/zh keys, return the current language version.
   *  Otherwise return val as-is (for non-i18n fields like numbers). */
  function localize(val) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      var lang = getLang();
      if (val[lang] !== undefined) return val[lang];
      if (val[DEFAULT_LANG] !== undefined) return val[DEFAULT_LANG];
    }
    return val;
  }

  /** Apply translations to all elements with data-i18n attribute */
  function applyStaticTranslations() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var key = elements[i].getAttribute('data-i18n');
      elements[i].textContent = t(key);
    }
    // Update html lang attribute
    document.documentElement.lang = getLang() === 'zh' ? 'zh-CN' : 'en';
  }

  /** Update the language toggle button text */
  function updateToggleButton() {
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = getLang() === 'en' ? '中文' : 'EN';
    }
  }

  /** Switch language and re-render everything */
  function toggleLang() {
    var current = getLang();
    var next = current === 'en' ? 'zh' : 'en';
    setLang(next);
    applyStaticTranslations();
    updateToggleButton();
    // Dispatch custom event so trading.js can re-render dynamic content
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: next } }));
  }

  // --- Init ---
  function init() {
    applyStaticTranslations();
    updateToggleButton();

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', toggleLang);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API globally for trading.js
  window.MadaoI18n = {
    getLang: getLang,
    t: t,
    localize: localize
  };
})();
