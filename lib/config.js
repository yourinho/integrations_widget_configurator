/**
 * Configuration state for initWidget parameters.
 * Default values per PRD / EMBEDDING_TUTORIAL.
 */

const DEFAULT_WIDGET_URL = 'https://yourinho.github.io/integrations_widget/albato-widget.iife.js';

/**
 * Supported languages for partner titles and trigger/action names.
 * Value is the locale code passed to initWidget.
 */
const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'pt', label: 'Português' },
  { value: 'tr', label: 'Türkçe' },
];

const DEFAULT_LANGUAGE = 'en';

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
  cardBackground: '#FFFFFF',
  detailCardBackground: '#FFFFFF',
  galleryBackground: '',
  detailBackground: '',
  searchBackground: '',
  searchBorderColor: '',
  searchFocusBorderColor: '',
  cardBorderColor: '',
  cardHoverBorderColor: '',
  cardHoverShadow: '',
  tabBackground: '',
  tabActiveBackground: '',
  tabBorderColor: '',
  detailCardFooterBackground: '',
  detailCardFooterLabelColor: '',
  emptyTextColor: '',
  errorTextColor: '',
  skeletonColor: '',
  backButtonHoverBackground: '',
  showMoreBackground: '',
  showMoreBorderColor: '',
};

const DEFAULT_TYPOGRAPHY = {
  galleryTitleSize: '56px',
  galleryTitleWeight: 700,
  searchSize: '15px',
  cardTitleSize: '14px',
  cardTitleWeight: 400,
  detailTitleSize: '32px',
  detailTitleWeight: 700,
  detailSubtitleSize: '17px',
  tabSize: '15px',
  sectionTitleSize: '20px',
  detailCardNameSize: '17px',
  detailCardTypeSize: '17px',
  detailCardTypeWeight: 600,
  showMoreSize: '17px',
  backSize: '17px',
};

const DEFAULT_TEXTS = {
  galleryTitle: 'Available integrations',
  searchPlaceholder: 'Search integrations',
  showMore: 'Show more',
  back: 'Back',
  triggersTab: 'Triggers',
  actionsTab: 'Actions',
  triggersAndActionsTab: 'Triggers & Actions',
  emptyGallery: 'No integrations available',
  emptySearch: 'No services found',
  emptyTriggers: 'This service has no available triggers',
  emptyActions: 'This service has no available actions',
  errorGeneral: "We couldn't load integrations right now.",
  errorServices: 'Failed to load services',
  retry: 'Try again',
};

const DEFAULT_VISIBILITY = {
  showGalleryTitle: true,
  showSearch: true,
  showShowMore: true,
  showDetailTitle: true,
  showDetailSubtitle: true,
  showDetailTabs: true,
  showSectionTitles: true,
  showCardLogos: true,
  showDetailCardType: true,
  showDetailCardFooter: true,
};

const DEFAULT_LAYOUT_SPACING = {
  maxWidth: '1040px',
  galleryPadding: '80px',
  galleryGap: '32px',
  galleryCardsGap: '32px',
  detailPadding: '80px',
  detailGap: '32px',
  detailCardsGap: '25px',
};

function getDefaultConfig() {
  return {
    widgetUrl: DEFAULT_WIDGET_URL,
    regions: [],
    language: DEFAULT_LANGUAGE,
    font: '',
    colors: { ...DEFAULT_COLORS },
    typography: { ...DEFAULT_TYPOGRAPHY },
    texts: { ...DEFAULT_TEXTS },
    ...DEFAULT_VISIBILITY,
    ...DEFAULT_LAYOUT_SPACING,
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
 */
function getInitWidgetParams(config) {
  const params = {};

  if (config.regions && config.regions.length > 0) params.regions = config.regions;
  if (config.partnerIds && config.partnerIds.length > 0) params.partnerIds = config.partnerIds;
  if (config.language) params.language = config.language;
  if (config.font !== undefined) params.font = config.font || '';
  if (config.colors && Object.keys(config.colors).length > 0) {
    params.colors = Object.fromEntries(
      Object.entries(config.colors).filter(([, v]) => v != null && String(v).trim() !== '')
    );
  }
  if (config.cardSize) params.cardSize = config.cardSize;
  if (config.detailCardSize) params.detailCardSize = config.detailCardSize;
  if (config.detailLayout) params.detailLayout = config.detailLayout;
  if (config.align) params.align = config.align;
  if (config.cardRadius !== undefined) params.cardRadius = config.cardRadius;
  if (config.detailCardRadius !== undefined) params.detailCardRadius = config.detailCardRadius;

  if (config.typography && Object.keys(config.typography).length > 0) {
    params.typography = { ...config.typography };
  }
  if (config.texts && Object.keys(config.texts).length > 0) {
    params.texts = { ...config.texts };
  }
  Object.keys(DEFAULT_VISIBILITY).forEach((k) => {
    if (config[k] !== DEFAULT_VISIBILITY[k]) params[k] = config[k];
  });
  Object.keys(DEFAULT_LAYOUT_SPACING).forEach((k) => {
    if (config[k] !== undefined && config[k] !== DEFAULT_LAYOUT_SPACING[k]) params[k] = config[k];
  });

  return params;
}

window.WidgetConfig = {
  getDefaultConfig,
  getInitWidgetParams,
  DEFAULT_WIDGET_URL,
  DEFAULT_COLORS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_TEXTS,
  DEFAULT_VISIBILITY,
  DEFAULT_LAYOUT_SPACING,
  SUPPORTED_FONTS,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
};
