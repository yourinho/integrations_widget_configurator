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

  const DEBOUNCE_MS = { url: 300, font: 200, partnerSearch: 400 };

  let currentView = PREVIEW_VIEW.DESKTOP;
  let config = null;
  let debounceTimers = {};
  let partnerLabels = {}; // id -> display label (from search or manual)

  function init() {
    config = window.WidgetConfig.getDefaultConfig();
    initPreviewToggle();
    initSidebarToggle();
    initAccordions();
    initSettingsPanel();
    initWidgetPreview();
    initEmbedModal();
  }

  function initSidebarToggle() {
    const main = document.querySelector('.configurator-main');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebarTab = document.getElementById('sidebar-tab');

    const SIDEBAR_KEY = 'widget-configurator-sidebar-hidden';

    function setSidebarHidden(hidden) {
      main.classList.toggle('sidebar-hidden', hidden);
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', hidden ? 'Show settings panel' : 'Hide settings panel');
        toggleBtn.setAttribute('title', hidden ? 'Show settings' : 'Hide settings');
      }
      if (sidebarTab) {
        sidebarTab.setAttribute('aria-hidden', String(!hidden));
      }
      try {
        localStorage.setItem(SIDEBAR_KEY, hidden ? '1' : '0');
      } catch (_) {}
    }

    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(SIDEBAR_KEY) : null;
    if (stored === '1') setSidebarHidden(true);

    function toggle() {
      setSidebarHidden(main.classList.toggle('sidebar-hidden'));
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggle);
    if (sidebarTab) sidebarTab.addEventListener('click', toggle);
  }

  function initAccordions() {
    const items = document.querySelectorAll('.accordion-item');
    document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        if (!item) return;
        const wasCollapsed = item.classList.contains('is-collapsed');
        if (wasCollapsed) {
          items.forEach((other) => {
            if (other !== item) {
              other.classList.add('is-collapsed');
              const t = other.querySelector('.accordion-trigger');
              if (t) t.setAttribute('aria-expanded', 'false');
            }
          });
        }
        const collapsed = item.classList.toggle('is-collapsed');
        trigger.setAttribute('aria-expanded', String(!collapsed));
      });
    });
  }

  function initPreviewToggle() {
    const wrapper = document.querySelector('.preview-wrapper');
    const buttons = document.querySelectorAll('.toggle-btn');
    const deviceSelectWrap = document.getElementById('device-select-wrap');
    const deviceSelect = document.getElementById('device-select');

    if (deviceSelect && window.Devices?.list?.length) {
      deviceSelect.innerHTML = window.Devices.list
        .map((d, i) => `<option value="${d.width}" ${i === 2 ? 'selected' : ''}>${d.label} (${d.width}px)</option>`)
        .join('');

      deviceSelect.addEventListener('change', () => {
        const w = deviceSelect.value;
        if (wrapper) wrapper.style.setProperty('--mobile-preview-width', w ? w + 'px' : '375px');
      });
    }

    if (deviceSelectWrap) {
      deviceSelectWrap.classList.toggle('is-visible', currentView === PREVIEW_VIEW.MOBILE);
    }

    if (wrapper && deviceSelect?.value) {
      wrapper.style.setProperty('--mobile-preview-width', deviceSelect.value + 'px');
    }

    if (!wrapper || !buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view !== PREVIEW_VIEW.DESKTOP && view !== PREVIEW_VIEW.MOBILE) return;

        currentView = view;

        wrapper.classList.remove('desktop', 'mobile');
        wrapper.classList.add(view);

        if (deviceSelectWrap) {
          deviceSelectWrap.classList.toggle('is-visible', view === PREVIEW_VIEW.MOBILE);
        }

        if (view === PREVIEW_VIEW.MOBILE && deviceSelect) {
          wrapper.style.setProperty('--mobile-preview-width', deviceSelect.value + 'px');
        }

        buttons.forEach((b) => b.classList.toggle('active', b.dataset.view === view));
      });
    });

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

  function getIntegrationFilterMode() {
    const activeTab = document.querySelector('.integration-tab.active');
    return activeTab?.dataset.tab || 'region';
  }

  function syncConfigFromForm() {
    const urlInput = document.getElementById('widget-url');
    const fontSelect = document.getElementById('font');
    const cardSizeSelect = document.getElementById('card-size');
    const detailCardSizeSelect = document.getElementById('detail-card-size');
    const detailLayoutSelect = document.getElementById('detail-layout');
    const alignSelect = document.getElementById('align');
    const mode = getIntegrationFilterMode();

    if (urlInput) config.widgetUrl = urlInput.value.trim();
    if (fontSelect) config.font = fontSelect.value.trim();
    if (cardSizeSelect) config.cardSize = cardSizeSelect.value;
    if (detailCardSizeSelect) config.detailCardSize = detailCardSizeSelect.value;
    if (detailLayoutSelect) config.detailLayout = detailLayoutSelect.value;
    if (alignSelect) config.align = alignSelect.value;
    const cardRadiusInput = document.getElementById('card-radius');
    const detailCardRadiusInput = document.getElementById('detail-card-radius');
    if (cardRadiusInput) {
      const v = parseInt(cardRadiusInput.value, 10);
      config.cardRadius = !isNaN(v) && v >= 0 ? v : 8;
    }
    if (detailCardRadiusInput) {
      const v = parseInt(detailCardRadiusInput.value, 10);
      config.detailCardRadius = !isNaN(v) && v >= 0 ? v : 8;
    }

    if (mode === 'region') {
      const regionSelect = document.getElementById('region-select');
      const regionValue = regionSelect?.value || 'all';
      if (regionValue === 'all') config.regions = [];
      else if (regionValue === 'brazil') config.regions = [2];
      else if (regionValue === 'global') config.regions = [3];
      else if (regionValue === 'brazil-global') config.regions = [2, 3];
      else config.regions = [];
      config.partnerIds = [];
    } else {
      config.regions = [];
    }

    document.querySelectorAll('.color-hex[data-key]').forEach((input) => {
      const key = input.dataset.key;
      if (key && config.colors) {
        const val = input.value.trim();
        if (key === 'cardHoverShadow') {
          config.colors[key] = val || '';
        } else {
          config.colors[key] = hexToSixDigit(val) || val || '';
        }
      }
    });

    ['maxWidth', 'galleryPadding', 'galleryGap', 'galleryCardsGap', 'detailPadding', 'detailGap', 'detailCardsGap'].forEach((k) => {
      const id = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      const el = document.getElementById(id);
      if (el) config[k] = el.value.trim() || window.WidgetConfig.DEFAULT_LAYOUT_SPACING?.[k] || '';
    });

    const visibilityIds = { showGalleryTitle: 'show-gallery-title', showSearch: 'show-search', showShowMore: 'show-show-more', showDetailTitle: 'show-detail-title', showDetailSubtitle: 'show-detail-subtitle', showDetailTabs: 'show-detail-tabs', showSectionTitles: 'show-section-titles', showCardLogos: 'show-card-logos', showDetailCardType: 'show-detail-card-type', showDetailCardFooter: 'show-detail-card-footer' };
    Object.entries(visibilityIds).forEach(([cfgKey, id]) => {
      const el = document.getElementById(id);
      if (el) config[cfgKey] = el.checked;
    });

    const typoMap = { galleryTitleSize: 'typography-gallery-title-size', galleryTitleWeight: 'typography-gallery-title-weight', searchSize: 'typography-search-size', cardTitleSize: 'typography-card-title-size', cardTitleWeight: 'typography-card-title-weight', detailTitleSize: 'typography-detail-title-size', detailTitleWeight: 'typography-detail-title-weight', detailSubtitleSize: 'typography-detail-subtitle-size', tabSize: 'typography-tab-size', sectionTitleSize: 'typography-section-title-size', detailCardNameSize: 'typography-detail-card-name-size', detailCardTypeSize: 'typography-detail-card-type-size', detailCardTypeWeight: 'typography-detail-card-type-weight', showMoreSize: 'typography-show-more-size', backSize: 'typography-back-size' };
    const typoWeightKeys = ['galleryTitleWeight', 'cardTitleWeight', 'detailTitleWeight', 'detailCardTypeWeight'];
    config.typography = config.typography || {};
    Object.entries(typoMap).forEach(([cfgKey, id]) => {
      const el = document.getElementById(id);
      if (el) {
        const val = el.value.trim();
        config.typography[cfgKey] = typoWeightKeys.includes(cfgKey) ? (parseInt(val, 10) || window.WidgetConfig.DEFAULT_TYPOGRAPHY?.[cfgKey]) : (val || String(window.WidgetConfig.DEFAULT_TYPOGRAPHY?.[cfgKey] ?? ''));
      }
    });

    const textMap = { galleryTitle: 'text-gallery-title', searchPlaceholder: 'text-search-placeholder', showMore: 'text-show-more', back: 'text-back', triggersTab: 'text-triggers-tab', actionsTab: 'text-actions-tab', triggersAndActionsTab: 'text-triggers-and-actions-tab', emptyGallery: 'text-empty-gallery', emptySearch: 'text-empty-search', emptyTriggers: 'text-empty-triggers', emptyActions: 'text-empty-actions', errorGeneral: 'text-error-general', errorServices: 'text-error-services', retry: 'text-retry' };
    config.texts = config.texts || {};
    Object.entries(textMap).forEach(([cfgKey, id]) => {
      const el = document.getElementById(id);
      if (el) config.texts[cfgKey] = el.value.trim() || String(window.WidgetConfig.DEFAULT_TEXTS?.[cfgKey] ?? '');
    });
  }

  function hexToSixDigit(hex) {
    if (!hex || !hex.startsWith('#')) return null;
    const s = hex.slice(1);
    if (s.length === 6 && /^[0-9a-fA-F]+$/.test(s)) return '#' + s;
    if (s.length === 3 && /^[0-9a-fA-F]+$/.test(s)) return '#' + s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    return null;
  }

  function resetColorsToDefaults() {
    const defaults = window.WidgetConfig.DEFAULT_COLORS;
    config.colors = { ...defaults };
    syncColorsToForm();
    applyCosmeticOptions();
  }

  function showUrlError(msg) {
    const el = document.getElementById('url-error');
    if (el) el.textContent = msg;
  }

  function setUrlInvalid(invalid) {
    const wrap = document.getElementById('url-input-wrap');
    if (wrap) wrap.classList.toggle('is-invalid', invalid);
  }

  /**
   * Update display options in-place (no remount). Preserves current view (gallery or detail).
   * Applies: typography, colors, layout, font, card sizes, radii, visibility, texts.
   */
  function applyDisplayOptions() {
    syncConfigFromForm();
    const mount = getWidgetMount();
    if (!mount || !mount.classList.contains('albato-widget')) return;
    const params = window.WidgetConfig.getInitWidgetParams(config);
    params.cardSize = config.cardSize;
    params.detailCardSize = config.detailCardSize;
    params.detailLayout = config.detailLayout;
    params.align = config.align;
    params.font = config.font;
    params.colors = config.colors;
    params.cardRadius = config.cardRadius;
    params.detailCardRadius = config.detailCardRadius;
    params.typography = config.typography;
    params.texts = config.texts;
    Object.keys(window.WidgetConfig.DEFAULT_VISIBILITY || {}).forEach((k) => { params[k] = config[k]; });
    Object.keys(window.WidgetConfig.DEFAULT_LAYOUT_SPACING || {}).forEach((k) => { params[k] = config[k]; });
    window.WidgetLoader.updateWidgetOptions(mount, params);
    applyTextsInPlace(mount);
  }

  function applyTextsInPlace(container) {
    if (!container || !config.texts) return;
    const t = config.texts;

    /* Gallery view */
    const galleryTitle = container.querySelector('.aw-gallery-title');
    if (galleryTitle && t.galleryTitle) galleryTitle.textContent = t.galleryTitle;

    const searchInput = container.querySelector('.aw-search-input');
    if (searchInput && t.searchPlaceholder !== undefined) searchInput.placeholder = t.searchPlaceholder || '';

    const showMoreBtn = container.querySelector('.aw-show-more');
    if (showMoreBtn && t.showMore) showMoreBtn.textContent = t.showMore;

    const emptyEl = container.querySelector('.aw-empty');
    if (emptyEl) {
      const p = emptyEl.querySelector('p');
      const searchVal = searchInput?.value?.trim() || '';
      if (p) p.textContent = searchVal ? (t.emptySearch || 'No services found') : (t.emptyGallery || 'No integrations available');
    }

    const errorEl = container.querySelector('.aw-error');
    if (errorEl) {
      const p = errorEl.querySelector('p');
      if (p && t.errorServices) p.textContent = t.errorServices;
    }

    container.querySelectorAll('.aw-retry').forEach((btn) => {
      if (t.retry) btn.textContent = t.retry;
    });

    /* Detail view */
    const backBtn = container.querySelector('.aw-detail-back');
    if (backBtn && t.back) {
      const textNode = Array.from(backBtn.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNode) textNode.textContent = ' ' + t.back;
      else {
        const icon = backBtn.querySelector('.aw-detail-back-icon, svg');
        if (icon) icon.after(' ' + t.back);
      }
    }

    const tabs = container.querySelectorAll('.aw-detail-tab');
    if (tabs.length >= 3) {
      if (t.triggersAndActionsTab) tabs[0].textContent = t.triggersAndActionsTab;
      if (t.triggersTab) tabs[1].textContent = t.triggersTab;
      if (t.actionsTab) tabs[2].textContent = t.actionsTab;
    } else if (tabs.length >= 2) {
      if (t.triggersTab) tabs[0].textContent = t.triggersTab;
      if (t.actionsTab) tabs[1].textContent = t.actionsTab;
    }

    container.querySelectorAll('.aw-detail-section-title').forEach((el) => {
      const m = el.textContent.match(/^(.+?):\s*(\d+)$/);
      if (m && t.triggersTab && t.actionsTab) {
        const label = m[1].toLowerCase().includes('action') ? t.actionsTab : t.triggersTab;
        el.textContent = label + ': ' + m[2];
      }
    });

    /* Detail empty states (triggers vs actions) */
    container.querySelectorAll('.aw-detail-empty').forEach((el) => {
      const p = el.querySelector('p');
      if (!p) return;
      const section = el.closest('[data-section]');
      const col = el.closest('.aw-detail-column');
      const block = el.closest('.aw-detail-block');
      const isTriggers = (section?.dataset.section === 'triggers') ||
        (col && !col.previousElementSibling) ||
        (block && !block.previousElementSibling);
      p.textContent = isTriggers ? (t.emptyTriggers || 'This service has no available triggers') : (t.emptyActions || 'This service has no available actions');
    });

  }

  function applyCosmeticOptions() {
    applyDisplayOptions();
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
    const fontSelect = document.getElementById('font');
    const cardSizeSelect = document.getElementById('card-size');
    const detailCardSizeSelect = document.getElementById('detail-card-size');
    const detailLayoutSelect = document.getElementById('detail-layout');
    const alignSelect = document.getElementById('align');
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

    const urlCopyBtn = document.getElementById('url-copy');
    const urlEditBtn = document.getElementById('url-edit');
    if (urlCopyBtn) {
      urlCopyBtn.addEventListener('click', () => {
        const url = urlInput?.value?.trim() || '';
        if (url && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url).then(() => {
            urlCopyBtn.classList.add('copied');
            setTimeout(() => urlCopyBtn.classList.remove('copied'), 2000);
          });
        }
      });
    }
    if (urlEditBtn && urlInput) {
      urlEditBtn.addEventListener('click', () => {
        urlInput.focus();
      });
    }

    if (fontSelect && window.WidgetConfig?.SUPPORTED_FONTS?.length) {
      fontSelect.innerHTML = window.WidgetConfig.SUPPORTED_FONTS
        .map((f) => `<option value="${f.value.replace(/"/g, '&quot;')}">${f.label}</option>`)
        .join('');
      fontSelect.addEventListener('change', () => {
        const fontValue = fontSelect.value.trim();
        if (window.FontLoader && fontValue) window.FontLoader.loadFont(fontValue);
        applyCosmeticOptions();
      });
    }
    window.CustomSelect?.init();

    [cardSizeSelect, detailCardSizeSelect, alignSelect].forEach((el) => {
      if (el) el.addEventListener('change', applyCosmeticOptions);
    });
    const cardRadiusInput = document.getElementById('card-radius');
    const detailCardRadiusInput = document.getElementById('detail-card-radius');
    [cardRadiusInput, detailCardRadiusInput].forEach((el) => {
      if (el) el.addEventListener('input', () => debounce('radius', applyCosmeticOptions));
    });
    document.querySelectorAll('.number-input-wrap').forEach((wrap) => {
      const input = wrap.querySelector('input[type="number"]');
      const stepUp = wrap.querySelector('.number-input-step-up');
      const stepDown = wrap.querySelector('.number-input-step-down');
      if (input && stepUp) stepUp.addEventListener('click', () => { input.stepUp(); input.dispatchEvent(new Event('input', { bubbles: true })); });
      if (input && stepDown) stepDown.addEventListener('click', () => { input.stepDown(); input.dispatchEvent(new Event('input', { bubbles: true })); });
    });

    if (detailLayoutSelect) detailLayoutSelect.addEventListener('change', reinitWidget);

    initLayoutSpacing();
    initVisibility();
    initTypography();
    initTexts();
    initIntegrationFilter();
    initColorFields();
    initPartnerIds();
  }

  function initLayoutSpacing() {
    ['max-width', 'gallery-padding', 'gallery-gap', 'gallery-cards-gap', 'detail-padding', 'detail-gap', 'detail-cards-gap'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => debounce('layout', applyDisplayOptions));
    });
  }

  function initVisibility() {
    ['show-gallery-title', 'show-search', 'show-show-more', 'show-detail-title', 'show-detail-subtitle', 'show-detail-tabs', 'show-section-titles', 'show-card-logos', 'show-detail-card-type', 'show-detail-card-footer'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', applyDisplayOptions);
    });
  }

  function initTypography() {
    document.querySelectorAll('#accordion-typography input, #accordion-typography select').forEach((el) => {
      el.addEventListener('input', () => debounce('typo', applyDisplayOptions));
      el.addEventListener('change', applyDisplayOptions);
    });
  }

  function initTexts() {
    document.querySelectorAll('#accordion-texts input, #accordion-texts textarea').forEach((el) => {
      el.addEventListener('input', () => debounce('texts', applyDisplayOptions));
    });
  }

  function initIntegrationFilter() {
    const tabRegion = document.querySelector('.integration-tab[data-tab="region"]');
    const tabManual = document.querySelector('.integration-tab[data-tab="manual"]');
    const panelRegion = document.getElementById('panel-region');
    const panelManual = document.getElementById('panel-manual');
    const regionSelect = document.getElementById('region-select');

    function switchToRegion() {
      tabRegion?.classList.add('active');
      tabRegion?.setAttribute('aria-selected', 'true');
      tabManual?.classList.remove('active');
      tabManual?.setAttribute('aria-selected', 'false');
      panelRegion?.removeAttribute('hidden');
      panelManual?.setAttribute('hidden', '');
      config.partnerIds = [];
      Object.keys(partnerLabels).forEach((k) => delete partnerLabels[k]);
      renderPartnerChips();
      syncConfigFromForm();
      reinitWidget();
    }

    function switchToManual() {
      tabManual?.classList.add('active');
      tabManual?.setAttribute('aria-selected', 'true');
      tabRegion?.classList.remove('active');
      tabRegion?.setAttribute('aria-selected', 'false');
      panelManual?.removeAttribute('hidden');
      panelRegion?.setAttribute('hidden', '');
      if (regionSelect) {
        regionSelect.value = 'all';
        regionSelect.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        config.regions = [];
        syncConfigFromForm();
        reinitWidget();
      }
    }

    tabRegion?.addEventListener('click', () => {
      if (!tabRegion.classList.contains('active')) switchToRegion();
    });
    tabManual?.addEventListener('click', () => {
      if (!tabManual.classList.contains('active')) switchToManual();
    });

    if (regionSelect) {
      regionSelect.addEventListener('change', () => {
        syncConfigFromForm();
        reinitWidget();
      });
    }
  }

  function isValidPartnerId(value) {
    const n = parseInt(value, 10);
    return Number.isInteger(n) && n > 0 && String(n) === String(value).trim();
  }

  function renderPartnerChips() {
    const container = document.getElementById('partner-chips');
    if (!container) return;
    container.innerHTML = (config.partnerIds || []).map((id) => {
      const label = partnerLabels[id] || String(id);
      return `<span class="partner-chip" data-id="${id}">${escapeHtml(label)} (${id})<button type="button" class="partner-chip-remove" aria-label="Remove">×</button></span>`;
    }).join('');
    container.querySelectorAll('.partner-chip-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chip = btn.closest('.partner-chip');
        const id = parseInt(chip.dataset.id, 10);
        config.partnerIds = config.partnerIds.filter((x) => x !== id);
        delete partnerLabels[id];
        renderPartnerChips();
        reinitWidget();
      });
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function addPartnerId(id, label) {
    id = parseInt(id, 10);
    if (!config.partnerIds.includes(id)) {
      config.partnerIds = [...config.partnerIds, id].sort((a, b) => a - b);
      partnerLabels[id] = label || String(id);
      renderPartnerChips();
      reinitWidget();
    }
  }

  function addPartnerIdsBatch(entries) {
    let changed = false;
    entries.forEach(({ id, label }) => {
      id = parseInt(id, 10);
      if (!config.partnerIds.includes(id)) {
        config.partnerIds = [...config.partnerIds, id];
        partnerLabels[id] = label || String(id);
        changed = true;
      }
    });
    if (changed) {
      config.partnerIds.sort((a, b) => a - b);
      renderPartnerChips();
      reinitWidget();
    }
  }

  function initPartnerIds() {
    const searchInput = document.getElementById('partner-search');
    const dropdown = document.getElementById('partner-dropdown');
    const errorEl = document.getElementById('partnerIds-error');

    function showPartnerError(msg) {
      if (errorEl) errorEl.textContent = msg;
    }

    function hideDropdown() {
      if (dropdown) dropdown.classList.remove('is-open');
    }

    if (searchInput && dropdown) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        if (!q) {
          hideDropdown();
          return;
        }
        debounceTimers.partnerSearch && clearTimeout(debounceTimers.partnerSearch);
        debounceTimers.partnerSearch = setTimeout(() => {
          debounceTimers.partnerSearch = null;
          window.PartnersApi.searchPartners(q).then((results) => {
            dropdown.innerHTML = results.length
              ? results.map((p) => `<div class="partner-dropdown-item" data-id="${p.partnerId}" data-title="${escapeAttr(p.title)}">${escapeHtml(p.title)} (${p.partnerId})</div>`).join('')
              : '<div class="partner-dropdown-empty">No partners found</div>';
            dropdown.querySelectorAll('.partner-dropdown-item').forEach((item) => {
              item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                addPartnerId(item.dataset.id, item.dataset.title);
                searchInput.value = '';
                hideDropdown();
              });
            });
            dropdown.classList.add('is-open');
          });
        }, DEBOUNCE_MS.partnerSearch);
      });
    }

    if (searchInput) searchInput.addEventListener('blur', () => setTimeout(hideDropdown, 200));
    document.addEventListener('click', (e) => {
      if (dropdown && dropdown.classList.contains('is-open') && !dropdown.contains(e.target) && e.target !== searchInput) {
        hideDropdown();
      }
    });

    initBulkAddModal();
    renderPartnerChips();
  }

  function parseBulkIds(text) {
    return text
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function initBulkAddModal() {
    const modal = document.getElementById('bulk-add-modal');
    const btnOpen = document.getElementById('btn-bulk-add');
    const textarea = document.getElementById('bulk-add-ids');
    const countEl = document.getElementById('bulk-add-count');
    const btnClose = document.querySelector('.bulk-add-close');
    const btnCancel = document.querySelector('.bulk-add-cancel');
    const btnSubmit = document.querySelector('.bulk-add-submit');

    function openBulkAddModal() {
      if (modal) {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (textarea) {
          textarea.value = '';
          textarea.focus();
        }
        updateBulkAddCount();
      }
    }

    function closeBulkAddModal() {
      if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        btnOpen?.focus();
      }
    }

    function updateBulkAddCount() {
      if (!countEl || !textarea) return;
      const ids = parseBulkIds(textarea.value);
      const valid = ids.filter((id) => isValidPartnerId(id));
      const toAdd = valid.filter((id) => !config.partnerIds.includes(parseInt(id, 10)));
      countEl.textContent = toAdd.length === 0 ? (valid.length > 0 ? 'All already added' : '0 partners to add') : toAdd.length + ' partner' + (toAdd.length === 1 ? '' : 's') + ' to add';
    }

    if (btnOpen) btnOpen.addEventListener('click', openBulkAddModal);
    if (btnClose) btnClose.addEventListener('click', closeBulkAddModal);
    if (btnCancel) btnCancel.addEventListener('click', closeBulkAddModal);

    if (textarea) textarea.addEventListener('input', updateBulkAddCount);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBulkAddModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeBulkAddModal();
    });

    if (btnSubmit && textarea) {
      btnSubmit.addEventListener('click', async () => {
        const ids = parseBulkIds(textarea.value);
        const valid = ids.filter((id) => isValidPartnerId(id));
        const toAdd = valid
          .map((id) => parseInt(id, 10))
          .filter((n) => !config.partnerIds.includes(n));
        if (toAdd.length === 0) {
          closeBulkAddModal();
          return;
        }
        const fetchLabels = toAdd.map(async (n) => {
          const partner = window.PartnersApi?.getPartnerById
            ? await window.PartnersApi.getPartnerById(n)
            : null;
          return { id: n, label: partner?.title || String(n) };
        });
        const results = await Promise.all(fetchLabels);
        addPartnerIdsBatch(results);
        closeBulkAddModal();
      });
    }
  }

  function updateColorSwatch(key, value) {
    const swatch = document.getElementById('swatch-' + key);
    if (swatch) swatch.style.background = value || '#ffffff';
  }

  function syncColorsToForm() {
    if (!config?.colors) return;
    const defaults = window.WidgetConfig.DEFAULT_COLORS || {};
    Object.keys(defaults).forEach((key) => {
      const val = config.colors[key];
      const str = val != null ? String(val).trim() : '';
      const hexInput = document.querySelector('.color-hex[data-key="' + key + '"]');
      const picker = document.getElementById('color-' + key);
      if (hexInput) hexInput.value = str;
      if (picker && str && hexToSixDigit(str)) picker.value = hexToSixDigit(str) || picker.value;
      if (key !== 'cardHoverShadow') {
        updateColorSwatch(key, str || (picker?.value || '#ffffff'));
      }
    });
    const shadowInput = document.querySelector('.color-hex[data-key="cardHoverShadow"]');
    const shadowSwatch = document.getElementById('shadow-swatch-cardHoverShadow');
    if (shadowInput) shadowInput.value = (config.colors.cardHoverShadow || '').trim();
    if (shadowSwatch) shadowSwatch.style.boxShadow = (config.colors.cardHoverShadow || '').trim() || '0 4px 12px rgba(0,0,0,0.08)';
  }

  function initColorFields() {
    const resetBtn = document.querySelector('.btn-reset-colors');
    if (resetBtn) resetBtn.addEventListener('click', resetColorsToDefaults);

    syncColorsToForm();

    document.querySelectorAll('.color-row').forEach((row) => {
      const key = row.dataset.key;
      if (!key) return;
      const picker = row.querySelector('input[type="color"]');
      const hexInput = row.querySelector('.color-hex');
      if (!hexInput) return;

      if (key === 'cardHoverShadow') {
        initCardHoverShadow(row, hexInput);
        return;
      }

      if (picker) {
        picker.addEventListener('input', () => {
          hexInput.value = picker.value;
          updateColorSwatch(key, picker.value);
          syncConfigFromForm();
          applyCosmeticOptions();
        });
      }

      hexInput.addEventListener('input', () => {
        const val = hexInput.value.trim();
        const hex = hexToSixDigit(val);
        if (hex && picker) {
          picker.value = hex;
          updateColorSwatch(key, hex);
        } else if (key === 'cardHoverShadow' || !picker) {
          updateColorSwatch(key, val);
        }
        syncConfigFromForm();
        debounce('color', applyCosmeticOptions);
      });
    });
  }

  function initCardHoverShadow(row, hexInput) {
    const swatch = document.getElementById('shadow-swatch-cardHoverShadow');

    function updateShadowSwatch() {
      const val = hexInput.value.trim();
      if (swatch) swatch.style.boxShadow = val || '0 4px 12px rgba(0,0,0,0.08)';
    }

    hexInput.addEventListener('input', () => {
      updateShadowSwatch();
      syncConfigFromForm();
      debounce('color', applyCosmeticOptions);
    });

    updateShadowSwatch();
  }

  function initWidgetPreview() {
    const retryBtn = document.querySelector('.btn-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', loadWidget);
    }

    loadWidget();
  }

  function openEmbedModal() {
    try {
      syncConfigFromForm();
      if (!config) {
        console.error('Configurator: config is not initialized');
        return;
      }
      if (typeof window.CodeGenerator?.generateEmbedCode !== 'function') {
        console.error('Configurator: CodeGenerator.generateEmbedCode not available');
        return;
      }
      const code = window.CodeGenerator.generateEmbedCode(config);
      const codeEl = document.getElementById('embed-code');
      const modal = document.getElementById('embed-modal');
      if (codeEl && modal) {
        codeEl.textContent = code;
        try {
          if (window.Prism) window.Prism.highlightElement(codeEl);
        } catch (prismErr) {
          console.warn('Prism highlight failed:', prismErr);
        }
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.querySelector('.modal-close')?.focus();
      }
    } catch (err) {
      console.error('Configurator: openEmbedModal failed', err);
    }
  }

  function closeEmbedModal() {
    const modal = document.getElementById('embed-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.getElementById('btn-get-embed')?.focus();
    }
  }

  function initEmbedModal() {
    const btnGetEmbed = document.getElementById('btn-get-embed');
    const modal = document.getElementById('embed-modal');
    const btnClose = document.querySelector('.modal-close');
    const btnCopy = document.getElementById('btn-copy');
    const codeEl = document.getElementById('embed-code');

    if (btnGetEmbed) {
      btnGetEmbed.addEventListener('click', openEmbedModal);
    }

    if (btnClose) {
      btnClose.addEventListener('click', closeEmbedModal);
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeEmbedModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
        closeEmbedModal();
      }
    });

    if (btnCopy && codeEl) {
      const iconCopy = btnCopy.querySelector('.embed-copy-icon');
      const iconCheck = btnCopy.querySelector('.embed-copy-check');
      const label = btnCopy.querySelector('.embed-copy-label');
      const feedback = btnCopy.querySelector('.embed-copy-feedback');

      btnCopy.addEventListener('click', () => {
        const code = codeEl.textContent;
        navigator.clipboard.writeText(code).then(() => {
          if (iconCopy && iconCheck && label && feedback) {
            iconCopy.style.display = 'none';
            iconCheck.style.display = '';
            label.style.display = 'none';
            feedback.style.display = '';
          }
          btnCopy.disabled = true;
          setTimeout(() => {
            if (iconCopy && iconCheck && label && feedback) {
              iconCopy.style.display = '';
              iconCheck.style.display = 'none';
              label.style.display = '';
              feedback.style.display = 'none';
            }
            btnCopy.disabled = false;
          }, 2000);
        });
      });
    }
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
