# GitHub-managed portfolio

Live portfolio: https://iemfaraz.github.io/faraz-engineering-portfolio/
Dashboard: https://iemfaraz.github.io/faraz-engineering-portfolio/#/admin

This static React app reads `../portfolio-data.json` and `../uploads/` from GitHub Pages. The dashboard writes directly to the GitHub repository using GitHub's REST API. It does not use a ChatGPT account or a Sites backend.

Create a fine-grained personal access token on GitHub, select only `faraz-engineering-portfolio`, and grant Contents: Read and write. Enter it only in the live dashboard's password field. The token stays in tab memory, goes only to api.github.com, and clears on reload or Disconnect. Never commit a token. Branch protection may require a pull-request workflow instead of dashboard writes.

Dashboard tabs manage intro video, projects, covers, project videos, drawing sheets and cover, CVs and profile photo, English/Arabic section text, uploaded files, and approved recommendations. Saves create commits with current branch data and never force push. Uploads are limited to 25 MB and supported PDF/image/video formats. Saved uploads are public. Recommendations received privately should be reviewed before manually publishing them; the public form prepares an email.

## Automatic English-to-Arabic translation

The Pages workflow runs the open-source Argos Translate en-ar neural model locally in GitHub Actions. No external inference API, API key, ChatGPT account or browser AI credential is used. Model downloads are cached. CV contents are processed on the runner, not sent to a public translation endpoint.

English section overrides and project title/summary/scope changes update the corresponding Arabic text. Existing Arabic project text is retained on first initialization; subsequent English changes regenerate its Arabic. Manual Arabic corrections survive unchanged English saves. Clearing an English section override restores the default Arabic wording. Translation is incremental using `translation-state.json`; remove a specific source hash to regenerate that field.

The current uploaded English CV, or bundled CV when no upload exists, is extracted and translated into an Arabic PDF with an RTL layout. Scans use English OCR. Up to 12 pages / 25 MB / 40,000 extracted characters are supported. Password-protected, externally hosted or unreadable PDFs report a failure without losing English data. Arabic CV files use a readable template, not the original PDF design. Review names and technical terms before sharing.

The **AI translation** tab shows status, links to Actions, and can queue a retry using the existing Contents permission. New English CV uploads hide a stale auto-generated Arabic CV until the new translation finishes. If a run fails, the last successful translations and their hashes are preserved; English edits still publish. The workflow uses a normal non-force push and rejects stale branch snapshots. Its generated commit does not trigger a new workflow; the same run builds and publishes the translated content.

Translation tests: `python -m unittest discover -s pages-site/tests -p test_translation.py` from the repository root. Install dependencies with `python -m pip install -r pages-site/translation-requirements.txt` (install the pinned torch CPU wheel first as shown in the workflow), plus Noto Arabic fonts and Tesseract English OCR.

Run `npm ci`, `node prepare-source.mjs`, `npm test`, and `npm run build`. Presentation components and validation are copied from `../independent`; providers and API are overridden locally. The Actions workflow rebuilds when content or uploads change. The root built mirror also supports the repository's legacy branch-based Pages configuration.
