# Public GitHub Pages portfolio

Static portfolio built from the design and content in `../independent`. Run `npm ci` and `npm run build` from this directory. The workflow `.github/workflows/pages.yml` publishes `dist/` on pushes to main. Repository Settings → Pages must use GitHub Actions.

Public URL: https://iemfaraz.github.io/faraz-engineering-portfolio/

Project pages use hash links so direct links work on static GitHub Pages hosting. Photo, CV and intro video are bundled. English/Arabic and theme preferences run locally in the browser. Recommendation forms prepare an email; the visitor completes sending in their email application. There are no API calls, login, file uploads or database operations in this static version. The complete private backend remains in `independent/` and its Sites deployment.

## Dashboard within GitHub Pages

Open `https://iemfaraz.github.io/faraz-engineering-portfolio/#/admin` or click Dashboard. This route embeds the real protected owner dashboard; credentials and mutations remain on the backend origin. Native ChatGPT sign-in runs at the top level and returns to this route. Browsers restricting third-party cookies may need the supplied separate-window sign-in fallback. `/admin/` redirects to this hash route.
