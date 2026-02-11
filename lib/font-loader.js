/**
 * Dynamic Google Fonts loader for widget preview.
 * Loads fonts on demand when user enters a font-family value.
 */

(function () {
  'use strict';

  const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2';
  const LINK_ID_PREFIX = 'configurator-font-';
  const loadedFonts = new Set(['Inter', 'Roboto', 'Open Sans']);

  const GENERIC_FAMILIES = [
    'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy',
    'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded',
    'math', 'emoji', 'fangsong', 'inherit', 'initial', 'unset',
  ];

  /**
   * Extract the first font family name from a CSS font-family string.
   * e.g. "'Roboto', sans-serif" → "Roboto"
   *      "'Open Sans', sans-serif" → "Open Sans"
   * @param {string} fontValue - Full font-family value
   * @returns {string|null} - Font name or null if generic
   */
  function extractFontName(fontValue) {
    const s = (fontValue || '').trim();
    if (!s) return null;

    let name = '';
    if (s.startsWith("'") || s.startsWith('"')) {
      const quote = s[0];
      const end = s.indexOf(quote, 1);
      name = end > 0 ? s.slice(1, end) : s.slice(1).split(',')[0].trim();
    } else {
      name = s.split(',')[0].trim();
    }
    if (!name) return null;
    if (GENERIC_FAMILIES.includes(name.toLowerCase())) return null;
    return name;
  }

  /**
   * Load a font from Google Fonts if not already loaded.
   * @param {string} fontValue - Full font-family value (e.g. "'Roboto', sans-serif")
   */
  function loadFont(fontValue) {
    const fontName = extractFontName(fontValue);
    if (!fontName || loadedFonts.has(fontName)) return;

    const familyParam = fontName.replace(/\s+/g, '+');
    const url = `${GOOGLE_FONTS_BASE}?family=${familyParam}:wght@400;500;600;700&display=swap`;
    const id = LINK_ID_PREFIX + familyParam.replace(/[^a-zA-Z0-9-_]/g, '-');

    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => loadedFonts.add(fontName);
    document.head.appendChild(link);
  }

  window.FontLoader = { loadFont, extractFontName };
})();
