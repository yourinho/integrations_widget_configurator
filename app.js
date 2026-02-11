/**
 * Albato Widget Configurator — Stage 3
 * Settings panel: Widget URL, regions, font, cardSize, detailLayout, align
 */

(function () {
  'use strict';

  const PREVIEW_VIEW = {
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
  };

  const DEBOUNCE_MS = { url: 300, font: 200 };

  let currentView = PREVIEW_VIEW.DESKTOP;
  let config = null;
  let debounceTimers = {};

  function init() {
    config = window.WidgetConfig.getDefaultConfig();
    initPreviewToggle();
    initSettingsPanel();
    initWidgetPreview();
  }

  function initPreviewToggle() {
    const wrapper = document.querySelector('.preview-wrapper');
    const buttons = document.querySelectorAll('.toggle-btn');

    if (!wrapper || !buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view !== PREVIEW_VIEW.DESKTOP && view !== PREVIEW_VIEW.MOBILE) return;

        currentView = view;

        // Update wrapper class
        wrapper.classList.remove('desktop', 'mobile');
        wrapper.classList.add(view);

        // Update button states
        buttons.forEach((b) => b.classList.toggle('active', b.dataset.view === view));
      });
    });

    // Set initial state
    wrapper.classList.add(PREVIEW_VIEW.DESKTOP);
  }

  function getWidgetMount() {
    return document.getElementById('widget-mount');
  }

  function getWidgetWrapper() {
    return document.querySelector('.widget-wrapper');
  }

  function showLoading() {
    const mount = getWidgetMount();
    const wrapper = getWidgetWrapper();

    if (mount) {
      mount.classList.add('is-loading');
      mount.textContent = 'Loading...';
    }
    if (wrapper) wrapper.classList.remove('has-error');
  }

  function showError() {
    const mount = getWidgetMount();
    const wrapper = getWidgetWrapper();

    if (mount) {
      mount.classList.remove('is-loading');
      mount.innerHTML = '';
    }
    if (wrapper) wrapper.classList.add('has-error');
  }

  function showWidget() {
    const mount = getWidgetMount();
    const wrapper = getWidgetWrapper();

    if (mount) mount.classList.remove('is-loading');
    if (wrapper) wrapper.classList.remove('has-error');
  }

  function loadWidget() {
    const mount = getWidgetMount();
    if (!mount) return;

    showLoading();

    const params = window.WidgetConfig.getInitWidgetParams(config);
    window.WidgetLoader
      .loadAndInit(config.widgetUrl, mount, params)
      .then(() => {
        showWidget();
      })
      .catch(() => {
        showError();
      });
  }

  function debounce(key, fn) {
    if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
    debounceTimers[key] = setTimeout(() => {
      debounceTimers[key] = null;
      fn();
    }, DEBOUNCE_MS[key] || 200);
  }

  function syncConfigFromForm() {
    const urlInput = document.getElementById('widget-url');
    const fontInput = document.getElementById('font');
    const cardSizeSelect = document.getElementById('card-size');
    const detailCardSizeSelect = document.getElementById('detail-card-size');
    const detailLayoutSelect = document.getElementById('detail-layout');
    const alignSelect = document.getElementById('align');
    const regionCheckboxes = document.querySelectorAll('input[name="region"]:checked');

    if (urlInput) config.widgetUrl = urlInput.value.trim();
    if (fontInput) config.font = fontInput.value.trim();
    if (cardSizeSelect) config.cardSize = cardSizeSelect.value;
    if (detailCardSizeSelect) config.detailCardSize = detailCardSizeSelect.value;
    if (detailLayoutSelect) config.detailLayout = detailLayoutSelect.value;
    if (alignSelect) config.align = alignSelect.value;
    config.regions = Array.from(regionCheckboxes).map((c) => parseInt(c.value, 10));
  }

  function showUrlError(msg) {
    const el = document.getElementById('url-error');
    if (el) el.textContent = msg;
  }

  function setUrlInvalid(invalid) {
    const input = document.getElementById('widget-url');
    if (input) input.classList.toggle('is-invalid', invalid);
  }

  /**
   * Update only cosmetic options (cardSize, detailCardSize, align, font, colors).
   * Preserves current view — no full remount.
   * Note: detailLayout changes DOM structure, so it requires reinit.
   */
  function applyCosmeticOptions() {
    syncConfigFromForm();
    const mount = getWidgetMount();
    if (!mount || !mount.classList.contains('albato-widget')) return;
    const params = {
      cardSize: config.cardSize,
      detailCardSize: config.detailCardSize,
      detailLayout: config.detailLayout,
      align: config.align,
      font: config.font,
      colors: config.colors,
    };
    window.WidgetLoader.updateWidgetOptions(mount, params);
  }

  /**
   * Full reinit — required when widgetUrl, regions, or partnerIds change.
   */
  function reinitWidget() {
    syncConfigFromForm();
    loadWidget();
  }

  function initSettingsPanel() {
    const urlInput = document.getElementById('widget-url');
    const fontInput = document.getElementById('font');
    const cardSizeSelect = document.getElementById('card-size');
    const detailCardSizeSelect = document.getElementById('detail-card-size');
    const detailLayoutSelect = document.getElementById('detail-layout');
    const alignSelect = document.getElementById('align');
    const regionCheckboxes = document.querySelectorAll('input[name="region"]');

    function handleUrlChange() {
      const url = urlInput.value.trim();
      if (!window.Validation.isValidWidgetUrl(url)) {
        setUrlInvalid(true);
        showUrlError('Invalid URL. Use https:// and a valid format.');
        return;
      }
      setUrlInvalid(false);
      showUrlError('');
      syncConfigFromForm();
      loadWidget();
    }

    if (urlInput) {
      urlInput.addEventListener('input', () => debounce('url', handleUrlChange));
      urlInput.addEventListener('blur', () => {
        if (urlInput.value.trim() && !window.Validation.isValidWidgetUrl(urlInput.value.trim())) {
          setUrlInvalid(true);
          showUrlError('Invalid URL. Use https:// and a valid format.');
        }
      });
    }

    if (fontInput) {
      fontInput.addEventListener('input', () => debounce('font', applyCosmeticOptions));
    }

    [cardSizeSelect, detailCardSizeSelect, alignSelect].forEach((el) => {
      if (el) el.addEventListener('change', applyCosmeticOptions);
    });

    if (detailLayoutSelect) detailLayoutSelect.addEventListener('change', reinitWidget);

    regionCheckboxes.forEach((cb) => {
      cb.addEventListener('change', reinitWidget);
    });
  }

  function initWidgetPreview() {
    const retryBtn = document.querySelector('.btn-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', loadWidget);
    }

    loadWidget();
  }

  window.ConfiguratorApp = {
    getConfig: () => config,
    setConfig: (updates) => {
      Object.assign(config, updates);
    },
    reinitWidget: loadWidget,
    applyCosmeticOptions,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
