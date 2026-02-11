/**
 * Validation helpers for settings panel.
 */

const URL_MAX_LENGTH = 512;
const FONT_MAX_LENGTH = 128;

function isValidWidgetUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.length > URL_MAX_LENGTH) return false;
  if (!url.startsWith('https://')) return false;
  if (url.toLowerCase().includes('javascript:')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

window.Validation = {
  isValidWidgetUrl,
  URL_MAX_LENGTH,
  FONT_MAX_LENGTH,
};
