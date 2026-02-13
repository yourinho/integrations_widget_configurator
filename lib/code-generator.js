/**
 * Generate embed code fragment for initWidget.
 * Minimal output — only params that differ from defaults.
 */

(function () {
  'use strict';

  const DEF = window.WidgetConfig;

  function generateEmbedCode(config) {
    const params = window.WidgetConfig.getInitWidgetParams(config);
    const filtered = filterToChangedOnly(params);
    const scriptUrl = (config.widgetUrl || DEF.DEFAULT_WIDGET_URL).trim();

    const initArgs = {
      container: 'document.getElementById(\'albato-widget\')',
      ...formatParams(filtered),
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

  function filterToChangedOnly(params) {
    const out = {};
    if (params.regions && params.regions.length > 0) out.regions = params.regions;
    if (params.partnerIds && params.partnerIds.length > 0) out.partnerIds = params.partnerIds;
    if (params.font !== undefined && params.font !== '') out.font = params.font;
    if (params.colors && Object.keys(params.colors).length > 0) {
      const changed = Object.fromEntries(
        Object.entries(params.colors).filter(([k, v]) => {
          const d = DEF.DEFAULT_COLORS?.[k];
          return v != null && String(v).trim() !== '' && String(v) !== String(d ?? '');
        })
      );
      if (Object.keys(changed).length > 0) out.colors = changed;
    }
    if (params.cardSize && params.cardSize !== 'l') out.cardSize = params.cardSize;
    if (params.detailCardSize && params.detailCardSize !== 'l') out.detailCardSize = params.detailCardSize;
    if (params.detailLayout && params.detailLayout !== 'stacked') out.detailLayout = params.detailLayout;
    if (params.align && params.align !== 'center') out.align = params.align;
    if (params.cardRadius !== undefined && params.cardRadius !== 8) out.cardRadius = params.cardRadius;
    if (params.detailCardRadius !== undefined && params.detailCardRadius !== 8) out.detailCardRadius = params.detailCardRadius;

    if (params.typography && Object.keys(params.typography).length > 0) {
      const changed = Object.fromEntries(
        Object.entries(params.typography).filter(([k, v]) => {
          const d = DEF.DEFAULT_TYPOGRAPHY?.[k];
          return v != null && String(v).trim() !== '' && v != d;
        })
      );
      if (Object.keys(changed).length > 0) out.typography = changed;
    }
    if (params.texts && Object.keys(params.texts).length > 0) {
      const changed = Object.fromEntries(
        Object.entries(params.texts).filter(([k, v]) => {
          const d = DEF.DEFAULT_TEXTS?.[k];
          return v != null && String(v).trim() !== '' && v != d;
        })
      );
      if (Object.keys(changed).length > 0) out.texts = changed;
    }
    ['showGalleryTitle', 'showSearch', 'showShowMore', 'showDetailTitle', 'showDetailSubtitle',
      'showDetailTabs', 'showSectionTitles', 'showCardLogos', 'showDetailCardType', 'showDetailCardFooter'].forEach((k) => {
      if (params[k] !== undefined && params[k] !== DEF.DEFAULT_VISIBILITY?.[k]) out[k] = params[k];
    });
    ['maxWidth', 'galleryPadding', 'galleryGap', 'galleryCardsGap', 'detailPadding', 'detailGap', 'detailCardsGap'].forEach((k) => {
      if (params[k] !== undefined && params[k] !== DEF.DEFAULT_LAYOUT_SPACING?.[k]) out[k] = params[k];
    });

    return out;
  }

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
