/**
 * Albato Widget Configurator — Stage 2
 * Widget loading, error handling, Retry, config state
 */

(function () {
  'use strict';

  const PREVIEW_VIEW = {
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
  };

  let currentView = PREVIEW_VIEW.DESKTOP;
  let config = null;

  function init() {
    config = window.WidgetConfig.getDefaultConfig();
    initPreviewToggle();
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

  function initWidgetPreview() {
    const retryBtn = document.querySelector('.btn-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', loadWidget);
    }

    loadWidget();
  }

  // Expose for future use (reinit when config changes)
  window.ConfiguratorApp = {
    getConfig: () => config,
    setConfig: (updates) => {
      Object.assign(config, updates);
    },
    reinitWidget: loadWidget,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
