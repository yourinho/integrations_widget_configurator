/**
 * Albato Widget Configurator — Stage 1
 * Basic layout, preview area, Desktop/Mobile toggle
 */

(function () {
  'use strict';

  const PREVIEW_VIEW = {
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
  };

  let currentView = PREVIEW_VIEW.DESKTOP;

  function init() {
    initPreviewToggle();
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

  document.addEventListener('DOMContentLoaded', init);
})();
