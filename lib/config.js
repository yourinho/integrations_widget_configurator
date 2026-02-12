/**
 * Configuration state for initWidget parameters.
 * Default values per PRD / EMBEDDING_TUTORIAL.
 */

const DEFAULT_WIDGET_URL = 'https://yourinho.github.io/integrations_widget/albato-widget.iife.js';

/**
 * Supported fonts for the widget (Google Fonts).
 * Value is the full font-family CSS string.
 */
const SUPPORTED_FONTS = [
  { value: '', label: 'Inter (default)' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Lato', sans-serif", label: 'Lato' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Nunito', sans-serif", label: 'Nunito' },
  { value: "'Raleway', sans-serif", label: 'Raleway' },
  { value: "'Source Sans 3', sans-serif", label: 'Source Sans 3' },
  { value: "'Ubuntu', sans-serif", label: 'Ubuntu' },
  { value: "'Nunito Sans', sans-serif", label: 'Nunito Sans' },
  { value: "'Work Sans', sans-serif", label: 'Work Sans' },
  { value: "'Manrope', sans-serif", label: 'Manrope' },
  { value: "'DM Sans', sans-serif", label: 'DM Sans' },
  { value: "'IBM Plex Sans', sans-serif", label: 'IBM Plex Sans' },
];

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
    cardRadius: 8,
    detailCardRadius: 8,
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
  if (config.cardRadius !== undefined && config.cardRadius !== 8) {
    params.cardRadius = config.cardRadius;
  }
  if (config.detailCardRadius !== undefined && config.detailCardRadius !== 8) {
    params.detailCardRadius = config.detailCardRadius;
  }

  return params;
}

// Export for use in module pattern (attached to window if needed)
window.WidgetConfig = {
  getDefaultConfig,
  getInitWidgetParams,
  DEFAULT_WIDGET_URL,
  DEFAULT_COLORS,
  SUPPORTED_FONTS,
};
