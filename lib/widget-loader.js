/**
 * Dynamic widget script loader and initWidget orchestrator.
 * Handles: load script by URL, remove old script on URL change, initWidget call.
 */

(function () {
  'use strict';

  const SCRIPT_ID = 'albato-widget-script';
  let loadedScriptUrl = null;

  /**
   * Remove existing widget script from DOM (for URL change).
   */
  function removeExistingScript() {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.remove();
      loadedScriptUrl = null;
    }
  }

  /**
   * Load script by URL. Returns a Promise that resolves on load, rejects on error.
   * @param {string} url - Script URL (must be https)
   * @returns {Promise<void>}
   */
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      if (!url || typeof url !== 'string') {
        reject(new Error('Invalid script URL'));
        return;
      }

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = url;

      script.onload = () => {
        loadedScriptUrl = url;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load widget script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Clear container and call AlbatoWidget.initWidget with current config.
   * Assumes script is already loaded and window.AlbatoWidget exists.
   * @param {HTMLElement} container - DOM element for widget
   * @param {Object} params - initWidget params (from getInitWidgetParams)
   */
  function initWidget(container, params) {
    if (!container || !container.appendChild) {
      return;
    }
    if (typeof window.AlbatoWidget === 'undefined' || typeof window.AlbatoWidget.initWidget !== 'function') {
      return;
    }

    container.innerHTML = '';
    const initParams = { container, ...params };
    window.AlbatoWidget.initWidget(initParams);
  }

  /**
   * Load widget script and initialize. If URL changed, removes old script first.
   * @param {string} scriptUrl - Widget script URL
   * @param {HTMLElement} container - Container element
   * @param {Object} params - initWidget params
   * @returns {Promise<void>} Resolves when widget is ready, rejects on load error
   */
  function loadAndInit(scriptUrl, container, params) {
    const urlChanged = loadedScriptUrl && loadedScriptUrl !== scriptUrl;
    if (urlChanged) {
      removeExistingScript();
    }

    if (loadedScriptUrl === scriptUrl && window.AlbatoWidget) {
      initWidget(container, params || {});
      return Promise.resolve();
    }

    return loadScript(scriptUrl).then(() => {
      initWidget(container, params || {});
    });
  }

  window.WidgetLoader = {
    loadAndInit,
    loadScript,
    removeExistingScript,
    initWidget,
  };
})();
