/**
 * Generate embed code fragment for initWidget.
 * Minimal output — omits params with default values.
 */

(function () {
  'use strict';

  function generateEmbedCode(config) {
    const params = window.WidgetConfig.getInitWidgetParams(config);
    const scriptUrl = (config.widgetUrl || window.WidgetConfig.DEFAULT_WIDGET_URL).trim();

    const initArgs = {
      container: 'document.getElementById(\'albato-widget\')',
      ...formatParams(params),
    };

    const initStr = '  AlbatoWidget.initWidget({\n' +
      Object.entries(initArgs)
        .map(([k, v]) => '    ' + k + ': ' + v)
        .join(',\n') +
      '\n  });';

    return `<div id="albato-widget"></div>
<script src="${escapeAttr(scriptUrl)}"></script>
<script>
${initStr}
</script>`;
  }

  const DEFAULTS = window.WidgetConfig;

  function formatParams(params) {
    const out = {};
    if (params.regions && params.regions.length > 0) out.regions = '[' + params.regions.join(', ') + ']';
    if (params.partnerIds && params.partnerIds.length > 0) out.partnerIds = '[' + params.partnerIds.join(', ') + ']';
    if (params.font !== undefined) out.font = JSON.stringify(params.font);
    if (params.colors && Object.keys(params.colors).length > 0) {
      const overrides = Object.entries(params.colors)
        .map(([k, v]) => k + ': ' + JSON.stringify(v));
      out.colors = '{ ' + overrides.join(', ') + ' }';
    }
    if (params.cardSize) out.cardSize = JSON.stringify(params.cardSize);
    if (params.detailCardSize) out.detailCardSize = JSON.stringify(params.detailCardSize);
    if (params.detailLayout) out.detailLayout = JSON.stringify(params.detailLayout);
    if (params.align) out.align = JSON.stringify(params.align);
    if (params.cardRadius !== undefined) out.cardRadius = String(params.cardRadius);
    if (params.detailCardRadius !== undefined) out.detailCardRadius = String(params.detailCardRadius);

    if (params.typography && Object.keys(params.typography).length > 0) {
      const t = Object.entries(params.typography).map(([k, v]) => k + ': ' + JSON.stringify(v));
      out.typography = '{\n      ' + t.join(',\n      ') + '\n    }';
    }
    if (params.texts && Object.keys(params.texts).length > 0) {
      const t = Object.entries(params.texts).map(([k, v]) => k + ': ' + JSON.stringify(v));
      out.texts = '{\n      ' + t.join(',\n      ') + '\n    }';
    }
    ['showGalleryTitle', 'showSearch', 'showShowMore', 'showDetailTitle', 'showDetailSubtitle',
      'showDetailTabs', 'showSectionTitles', 'showCardLogos', 'showDetailCardType', 'showDetailCardFooter'].forEach((k) => {
      if (params[k] !== undefined) out[k] = String(params[k]);
    });
    ['maxWidth', 'galleryPadding', 'galleryGap', 'galleryCardsGap', 'detailPadding', 'detailGap', 'detailCardsGap'].forEach((k) => {
      if (params[k] !== undefined) out[k] = JSON.stringify(params[k]);
    });

    return out;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  window.CodeGenerator = { generateEmbedCode };
})();
