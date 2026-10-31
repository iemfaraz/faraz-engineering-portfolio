# GitHub Pages portfolio

The public website is https://iemfaraz.github.io/faraz-engineering-portfolio/ . Run `npm ci && npm run build` here. The workflow `.github/workflows/pages.yml` publishes pushes to main. `prepare-source.mjs` copies presentation components and bundled media from `../independent` into ignored `reference/` for a standalone build.

The Manage link opens the owner-protected dashboard on the independent Site. The frontend reads `/api/portfolio` there with anonymous, read-only CORS requests, so saved projects, covers, videos, drawings, CVs and section text can appear on the next reload without a GitHub rebuild. This requires the Site owner to enable public viewing of portfolio data and media. Until then, the website falls back to bundled content. Admin mutations stay owner-only and reject cross-origin writes.

Recommendation forms prepare an email, which the visitor sends using their email application. Approved backend recommendations can be displayed from the live feed. Arabic CV uploads can be independent PDF files; no AI translation service is configured.

The unused Next.js sample workflow was moved to `.github/workflow-templates/nextjs-unused.yml` to avoid a competing deployment; this public frontend is built with Vite.
