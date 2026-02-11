/**
 * Custom select dropdown with styled menu.
 * Enhances native select elements with design-system menu styling.
 */

(function () {
  'use strict';

  const CHEVRON_SVG = '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHECK_SVG = '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10l4 4 8-8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function createCustomSelect(nativeSelect) {
    if (nativeSelect.dataset.customSelect) return;
    nativeSelect.dataset.customSelect = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    nativeSelect.parentNode.insertBefore(wrapper, nativeSelect);
    wrapper.appendChild(nativeSelect);

    nativeSelect.classList.add('custom-select-native');
    nativeSelect.setAttribute('aria-hidden', 'true');
    nativeSelect.tabIndex = -1;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', nativeSelect.getAttribute('aria-label') || nativeSelect.previousElementSibling?.textContent || 'Select');
    const triggerText = document.createElement('span');
    triggerText.className = 'custom-select-value';
    trigger.appendChild(triggerText);
    const chevron = document.createElement('span');
    chevron.className = 'custom-select-chevron';
    chevron.innerHTML = CHEVRON_SVG;
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-hidden', 'true');

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);

    function getSelectedText() {
      const opt = nativeSelect.options[nativeSelect.selectedIndex];
      return opt ? opt.textContent : '';
    }

    function renderOptions() {
      menu.innerHTML = '';
      Array.from(nativeSelect.options).forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'custom-select-option' + (opt.selected ? ' is-selected' : '');
        div.setAttribute('role', 'option');
        div.setAttribute('aria-selected', !!opt.selected);
        div.setAttribute('data-value', opt.value);
        const text = document.createElement('span');
        text.className = 'custom-select-option-text';
        text.textContent = opt.textContent;
        div.appendChild(text);
        if (opt.selected) {
          const check = document.createElement('span');
          check.className = 'custom-select-check';
          check.innerHTML = CHECK_SVG;
          div.appendChild(check);
        }
        menu.appendChild(div);
      });
    }

    function updateTrigger() {
      triggerText.textContent = getSelectedText();
      trigger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
    }

    function openMenu() {
      renderOptions();
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function selectOption(value) {
      nativeSelect.value = value;
      triggerText.textContent = getSelectedText();
      closeMenu();
      nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.addEventListener('click', (e) => {
      const opt = e.target.closest('.custom-select-option');
      if (opt) selectOption(opt.dataset.value);
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        trigger.focus();
      }
    });

    triggerText.textContent = getSelectedText();

    const observer = new MutationObserver(() => {
      triggerText.textContent = getSelectedText();
    });
    observer.observe(nativeSelect, { childList: true, subtree: true });

    return { updateTrigger, renderOptions };
  }

  function initCustomSelects() {
    document.querySelectorAll('.form-select.custom-select-target').forEach(createCustomSelect);
  }

  window.CustomSelect = {
    init: initCustomSelects,
    enhance: (el) => el && createCustomSelect(el),
  };
})();
