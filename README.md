# Albato Widget Configurator

WYSIWYG configurator for the [Albato Apps Widget](https://github.com/yourinho/integrations_widget). Configure the widget visually and get the embed code to paste on your landing page.

## Features

- Live preview with Desktop / Mobile view toggle
- All `initWidget` parameters: regions, font, colors, card sizes, layout, align, partner IDs
- Partner search by name (Albato API)
- Color pickers with reset to defaults
- Embed code modal with syntax highlighting and one-click copy

## Variants

By default the configurator shows **Brazil and global** regions only (no CIS) and languages **without Russian**. This matches the `albato-widget-global.iife.js` widget build.

To add CIS partners and Russian localization, append the `variant=cis` parameter to the URL:

```
https://your-site.com/?variant=cis
```

or for local development:

```
http://localhost:3000/?variant=cis
```

With `variant=cis` you get:
- **App filters:** "All regions" option added (alongside Brazil, Global, Brazil and global)
- **Localization:** Russian (Русский) added to the language list

## Run locally

The configurator is a static web app. Run a local server (required for API calls and widget loading):

```bash
npx serve .
```

Then open http://localhost:3000

Alternatively:

```bash
python -m http.server 8080
# Open http://localhost:8080
```

## Project structure

```
├── index.html          # Main page
├── styles.css          # Styles
├── app.js              # App logic, settings, modal
├── lib/
│   ├── variant-config.js  # Variant options (default vs cis)
│   ├── config.js       # Default config, getInitWidgetParams
│   ├── validation.js   # URL validation
│   ├── partners-api.js # Partner search API
│   ├── code-generator.js # Embed code generation
│   └── widget-loader.js  # Dynamic script load, initWidget
├── WYSIWYG_CONFIGURATOR_PRD.md
└── README.md
```

## Deploy

Deploy the project folder to any static host (GitHub Pages, Netlify, Vercel). No build step required.
