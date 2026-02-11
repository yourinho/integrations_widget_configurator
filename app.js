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
    initSettingsPanel();
    initWidgetPreview();
    initEmbedModal();
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

    document.querySelectorAll('.color-hex').forEach((input) => {
      const key = input.dataset.key;
      if (key && config.colors) {
        const val = input.value.trim();
        config.colors[key] = hexToSixDigit(val) || window.WidgetConfig.DEFAULT_COLORS[key];
      }
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
    Object.keys(defaults).forEach((key) => {
      const picker = document.getElementById('color-' + key);
      const hexInput = document.querySelector('.color-hex[data-key="' + key + '"]');
      if (picker) picker.value = defaults[key];
      if (hexInput) hexInput.value = defaults[key];
    });
    applyCosmeticOptions();
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

    initColorFields();
    initPartnerIds();
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

  function initPartnerIds() {
    const searchInput = document.getElementById('partner-search');
    const dropdown = document.getElementById('partner-dropdown');
    const addIdInput = document.getElementById('partner-add-id');
    const addIdBtn = document.querySelector('.btn-add-id');
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

    searchInput.addEventListener('blur', () => {
      setTimeout(hideDropdown, 200);
    });
    document.addEventListener('click', (e) => {
      if (dropdown.classList.contains('is-open') && !dropdown.contains(e.target) && e.target !== searchInput) {
        hideDropdown();
      }
    });

    if (addIdInput && addIdBtn) {
      addIdBtn.addEventListener('click', () => {
        const val = addIdInput.value.trim();
        if (!val) return;
        if (!isValidPartnerId(val)) {
          showPartnerError('Enter a valid integer ID');
          addIdInput.classList.add('is-invalid');
          return;
        }
        showPartnerError('');
        addIdInput.classList.remove('is-invalid');
        addPartnerId(val, val);
        addIdInput.value = '';
      });
      addIdInput.addEventListener('input', () => {
        showPartnerError('');
        addIdInput.classList.remove('is-invalid');
      });
      addIdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addIdBtn.click();
        }
      });
    }

    renderPartnerChips();
  }

  function initColorFields() {
    const resetBtn = document.querySelector('.btn-reset-colors');
    if (resetBtn) resetBtn.addEventListener('click', resetColorsToDefaults);

    document.querySelectorAll('.color-field').forEach((field) => {
      const key = field.dataset.key;
      if (!key) return;
      const picker = field.querySelector('input[type="color"]');
      const hexInput = field.querySelector('.color-hex');
      if (!picker || !hexInput) return;

      picker.addEventListener('input', () => {
        hexInput.value = picker.value;
        syncConfigFromForm();
        applyCosmeticOptions();
      });

      hexInput.addEventListener('input', () => {
        const hex = hexToSixDigit(hexInput.value.trim());
        if (hex) picker.value = hex;
        syncConfigFromForm();
        debounce('color', applyCosmeticOptions);
      });
    });
  }

  function initWidgetPreview() {
    const retryBtn = document.querySelector('.btn-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', loadWidget);
    }

    loadWidget();
  }

  function openEmbedModal() {
    syncConfigFromForm();
    const code = window.CodeGenerator.generateEmbedCode(config);
    const codeEl = document.getElementById('embed-code');
    const modal = document.getElementById('embed-modal');
    if (codeEl && modal) {
      codeEl.textContent = code;
      if (window.Prism) Prism.highlightElement(codeEl);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.querySelector('.modal-close')?.focus();
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
    const feedback = document.getElementById('copy-feedback');
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

    if (btnCopy && feedback && codeEl) {
      btnCopy.addEventListener('click', () => {
        const code = codeEl.textContent;
        navigator.clipboard.writeText(code).then(() => {
          feedback.classList.add('is-visible');
          btnCopy.disabled = true;
          setTimeout(() => {
            feedback.classList.remove('is-visible');
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
