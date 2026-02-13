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

  const CARD_SIZES = ['s', 'm', 'l'];
  const DETAIL_LAYOUTS = ['stacked', 'columns'];
  const ALIGN_OPTIONS = ['left', 'center', 'right'];
  const COLOR_KEYS = [
    'primary', 'background', 'surface', 'text', 'textMuted', 'border', 'textOnPrimary',
    'cardBackground', 'detailCardBackground',
    'galleryBackground', 'detailBackground', 'searchBackground', 'searchBorderColor', 'searchFocusBorderColor',
    'cardBorderColor', 'cardHoverBorderColor', 'cardHoverShadow',
    'tabBackground', 'tabActiveBackground', 'tabBorderColor',
    'detailCardFooterBackground', 'detailCardFooterLabelColor',
    'emptyTextColor', 'errorTextColor', 'skeletonColor',
    'backButtonHoverBackground', 'showMoreBackground', 'showMoreBorderColor',
  ];

  const DEFAULT_TYPOGRAPHY = {
    galleryTitleSize: '56px', galleryTitleWeight: 700, searchSize: '15px',
    cardTitleSize: '14px', cardTitleWeight: 400, detailTitleSize: '32px', detailTitleWeight: 700,
    detailSubtitleSize: '17px', tabSize: '15px', sectionTitleSize: '20px',
    detailCardNameSize: '17px', detailCardTypeSize: '17px', detailCardTypeWeight: 600,
    showMoreSize: '17px', backSize: '17px',
  };
  const DEFAULT_LAYOUT = {
    maxWidth: '1040px', galleryPadding: '80px', galleryGap: '32px', galleryCardsGap: '32px',
    detailPadding: '80px', detailGap: '32px', detailCardsGap: '25px',
  };
  const DEFAULT_VISIBILITY_KEYS = [
    'showGalleryTitle', 'showSearch', 'showShowMore', 'showDetailTitle', 'showDetailSubtitle',
    'showDetailTabs', 'showSectionTitles', 'showCardLogos', 'showDetailCardType', 'showDetailCardFooter',
  ];

  /**
   * Update container attributes and styles in-place (no remount).
   * Preserves current view (gallery or detail). All display params applied via CSS vars.
   */
  function updateWidgetOptions(container, params) {
    if (!container) return;

    const size = params.cardSize && CARD_SIZES.includes(params.cardSize.toLowerCase()) ? params.cardSize.toLowerCase() : 'l';
    const detailSize = params.detailCardSize && CARD_SIZES.includes(params.detailCardSize.toLowerCase()) ? params.detailCardSize.toLowerCase() : 'l';
    const layout = params.detailLayout && DETAIL_LAYOUTS.includes(params.detailLayout.toLowerCase()) ? params.detailLayout.toLowerCase() : 'stacked';
    const alignVal = params.align && ALIGN_OPTIONS.includes(params.align.toLowerCase()) ? params.align.toLowerCase() : 'center';

    container.setAttribute('data-card-size', size);
    container.setAttribute('data-detail-card-size', detailSize);
    container.setAttribute('data-detail-layout', layout);
    container.setAttribute('data-align', alignVal);

    if (params.cardRadius !== undefined) {
      container.setAttribute('data-card-radius', String(params.cardRadius));
      container.style.setProperty('--aw-card-radius', (typeof params.cardRadius === 'number' ? params.cardRadius : parseInt(params.cardRadius, 10) || 8) + 'px');
    }
    if (params.detailCardRadius !== undefined) {
      container.setAttribute('data-detail-card-radius', String(params.detailCardRadius));
      container.style.setProperty('--aw-detail-card-radius', (typeof params.detailCardRadius === 'number' ? params.detailCardRadius : parseInt(params.detailCardRadius, 10) || 8) + 'px');
    }

    if (params.font !== undefined) container.style.fontFamily = params.font || '';

    if (params.colors && typeof params.colors === 'object') {
      COLOR_KEYS.forEach((key) => {
        const value = params.colors[key];
        const varName = '--aw-color-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (typeof value === 'string' && value.trim()) {
          container.style.setProperty(varName, value.trim());
        }
      });
    }

    const typo = params.typography && typeof params.typography === 'object' ? params.typography : {};
    Object.keys(DEFAULT_TYPOGRAPHY).forEach((k) => {
      const v = typo[k] ?? DEFAULT_TYPOGRAPHY[k];
      if (v !== undefined && v !== null) {
        container.style.setProperty('--aw-font-' + k.replace(/([A-Z])/g, '-$1').toLowerCase(), String(v));
      }
    });

    Object.keys(DEFAULT_LAYOUT).forEach((k) => {
      const v = params[k] ?? DEFAULT_LAYOUT[k];
      if (typeof v === 'string' && v.trim()) {
        container.style.setProperty('--aw-' + k.replace(/([A-Z])/g, '-$1').toLowerCase(), v.trim());
      }
    });

    DEFAULT_VISIBILITY_KEYS.forEach((key) => {
      const v = params[key];
      if (v !== undefined) {
        container.setAttribute('data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase(), String(v !== false));
      }
    });

    if (container._awOptions) {
      const textsMerged = params.texts && typeof params.texts === 'object'
        ? { ...(container._awOptions.texts || {}), ...params.texts }
        : container._awOptions.texts;
      container._awOptions = {
        ...container._awOptions,
        font: params.font !== undefined ? params.font : container._awOptions.font,
        colors: params.colors !== undefined ? params.colors : container._awOptions.colors,
        typography: { ...(container._awOptions.typography || {}), ...typo },
        texts: textsMerged,
        cardSize: size,
        detailCardSize: detailSize,
        detailLayout: layout,
        align: alignVal,
        cardRadius: params.cardRadius !== undefined ? params.cardRadius : container._awOptions.cardRadius,
        detailCardRadius: params.detailCardRadius !== undefined ? params.detailCardRadius : container._awOptions.detailCardRadius,
        ...Object.fromEntries(DEFAULT_VISIBILITY_KEYS.filter((k) => params[k] !== undefined).map((k) => [k, params[k]])),
        ...Object.fromEntries(Object.keys(DEFAULT_LAYOUT).filter((k) => params[k] !== undefined).map((k) => [k, params[k]])),
      };
    }
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

    delete container._awPartnersByIdsCache;
    delete container._awPartnerContinuation;
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
      try {
        initWidget(container, params || {});
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
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
    updateWidgetOptions,
  };
})();
