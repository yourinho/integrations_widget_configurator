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

  function formatParams(params) {
    const out = {};
    if (params.regions && params.regions.length > 0) {
      out.regions = '[' + params.regions.join(', ') + ']';
    }
    if (params.font) {
      out.font = JSON.stringify(params.font);
    }
    if (params.colors && Object.keys(params.colors).length > 0) {
      const defaults = window.WidgetConfig.DEFAULT_COLORS || {};
      const overrides = Object.entries(params.colors)
        .filter(([k, v]) => v !== defaults[k])
        .map(([k, v]) => k + ': ' + JSON.stringify(v));
      if (overrides.length > 0) {
        out.colors = '{ ' + overrides.join(', ') + ' }';
      }
    }
    if (params.cardSize) out.cardSize = JSON.stringify(params.cardSize);
    if (params.detailCardSize) out.detailCardSize = JSON.stringify(params.detailCardSize);
    if (params.detailLayout) out.detailLayout = JSON.stringify(params.detailLayout);
    if (params.partnerIds && params.partnerIds.length > 0) {
      out.partnerIds = '[' + params.partnerIds.join(', ') + ']';
    }
    if (params.align) out.align = JSON.stringify(params.align);
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
