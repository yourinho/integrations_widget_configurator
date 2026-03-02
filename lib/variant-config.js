/**
 * Variant configuration for the configurator.
 * Variant is selected by URL param ?variant=cis or window.CONFIGURATOR_VARIANT.
 *
 * - default (no param): Brazil and global only, no Russian, default region = Brazil and global
 * - cis: full options (All regions, all languages including Russian)
 */
(function () {
  'use strict';

  function getVariant() {
    const params = new URLSearchParams(window.location.search);
    return params.get('variant') || window.CONFIGURATOR_VARIANT || 'default';
  }

  const VARIANTS = {
    default: {
      regionOptions: [
        { value: 'brazil', label: 'Only Brazil' },
        { value: 'global', label: 'Only global' },
        { value: 'brazil-global', label: 'Brazil and global' },
      ],
      defaultRegion: 'brazil-global',
      supportedLanguages: [
        { value: 'en', label: 'English' },
        { value: 'de', label: 'Deutsch' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'pt', label: 'Português' },
        { value: 'tr', label: 'Türkçe' },
      ],
      defaultLanguage: 'en',
    },
    cis: {
      regionOptions: [
        { value: 'all', label: 'All regions' },
        { value: 'brazil', label: 'Only Brazil' },
        { value: 'global', label: 'Only global' },
        { value: 'brazil-global', label: 'Brazil and global' },
      ],
      defaultRegion: 'all',
      supportedLanguages: [
        { value: 'en', label: 'English' },
        { value: 'ru', label: 'Русский' },
        { value: 'de', label: 'Deutsch' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'pt', label: 'Português' },
        { value: 'tr', label: 'Türkçe' },
      ],
      defaultLanguage: 'en',
    },
  };

  const active = VARIANTS[getVariant()] || VARIANTS.default;

  window.VariantConfig = {
    getVariant: getVariant,
    getRegionOptions: function () {
      return active.regionOptions;
    },
    getDefaultRegion: function () {
      return active.defaultRegion;
    },
    getSupportedLanguages: function () {
      return active.supportedLanguages;
    },
    getDefaultLanguage: function () {
      return active.defaultLanguage;
    },
  };
})();
