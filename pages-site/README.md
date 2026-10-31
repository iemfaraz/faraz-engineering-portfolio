# GitHub-managed portfolio

Live portfolio: https://iemfaraz.github.io/faraz-engineering-portfolio/
Dashboard: https://iemfaraz.github.io/faraz-engineering-portfolio/#/admin

This static React app reads `../portfolio-data.json` and `../uploads/` from GitHub Pages. The dashboard writes directly to the GitHub repository using GitHub's REST API. It does not use a ChatGPT account or a Sites backend.

Create a fine-grained personal access token on GitHub, select only `faraz-engineering-portfolio`, and grant Contents: Read and write. Enter it only in the live dashboard's password field. The token stays in tab memory, goes only to api.github.com, and clears on reload or Disconnect. Never commit a token. Branch protection may require a pull-request workflow instead of dashboard writes.

Dashboard tabs manage intro video, projects, covers, project videos, drawing sheets and cover, CVs and profile photo, English/Arabic section text, uploaded files, and approved recommendations. Saves create commits with current branch data and never force push. Uploads are limited to 25 MB and supported PDF/image/video formats. Saved uploads are public. Recommendations received privately should be reviewed before manually publishing them; the public form prepares an email.

Run `npm ci`, `node prepare-source.mjs`, `npm test`, and `npm run build`. Presentation components and validation are copied from `../independent`; providers and API are overridden locally. The Actions workflow rebuilds when content or uploads change. The root built mirror also supports the repository's legacy branch-based Pages configuration.
