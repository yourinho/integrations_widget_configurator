/**
 * Configuration state for initWidget parameters.
 * Default values per PRD / EMBEDDING_TUTORIAL.
 */

const DEFAULT_WIDGET_URL = 'https://yourinho.github.io/integrations_widget/albato-widget.iife.js';

const DEFAULT_COLORS = {
  primary: '#2C3534',
  background: '#FFFFFF',
  surface: '#F4F5F6',
  text: '#2C3534',
  textMuted: '#A0A4B1',
  border: '#E6E8EC',
  textOnPrimary: '#FFFFFF',
};

function getDefaultConfig() {
  return {
    widgetUrl: DEFAULT_WIDGET_URL,
    regions: [], // empty = show all
    font: '',
    colors: { ...DEFAULT_COLORS },
    cardSize: 'l',
    detailCardSize: 'l',
    detailLayout: 'stacked',
    partnerIds: [],
    align: 'center',
  };
}

/**
 * Build initWidget params object from config (excluding container).
 * Omits params that have default values for minimal output.
 */
function getInitWidgetParams(config) {
  const params = {};

  if (config.regions && config.regions.length > 0) {
    params.regions = config.regions;
  }
  if (config.font && config.font.trim()) {
    params.font = config.font.trim();
  }
  if (config.colors && Object.keys(config.colors).length > 0) {
    params.colors = { ...config.colors };
  }
  if (config.cardSize && config.cardSize !== 'l') {
    params.cardSize = config.cardSize;
  }
  if (config.detailCardSize && config.detailCardSize !== 'l') {
    params.detailCardSize = config.detailCardSize;
  }
  if (config.detailLayout && config.detailLayout !== 'stacked') {
    params.detailLayout = config.detailLayout;
  }
  if (config.partnerIds && config.partnerIds.length > 0) {
    params.partnerIds = config.partnerIds;
  }
  if (config.align && config.align !== 'center') {
    params.align = config.align;
  }

  return params;
}

// Export for use in module pattern (attached to window if needed)
window.WidgetConfig = {
  getDefaultConfig,
  getInitWidgetParams,
  DEFAULT_WIDGET_URL,
  DEFAULT_COLORS,
};
