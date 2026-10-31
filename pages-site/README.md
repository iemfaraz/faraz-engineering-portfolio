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

## Save permissions and full Arabic coverage

The dashboard connection now verifies Contents:write with an unreferenced Git blob; this creates no file or commit. A read-only token cannot enter the editor. Errors retain GitHub's reason and endpoint, required-permission header and request ID; rate limits and expired credentials are distinguished from missing write access. Token settings must use Resource owner `iemfaraz`, select this repository, and grant Contents: Read and write. GitHub account permission changes require the account owner; a connector connection does not grant the browser dashboard access automatically.

Automatic translation covers English section overrides, source dictionary changes, project title/summary/scope and all shared project facts, media titles/notes, approved recommendation details, and English CV uploads. Shared display translations live in `portfolio-data.json` under `localization.ar`; canonical English records, URLs, file paths and slugs are preserved. Arabic providers use these translations only for display. Standard codes, contact details and technical identifiers are intentionally retained. The Pages workflow exports source dictionaries into a runner-temporary file before translation. No translation button is required after a successful English save.

## AI portfolio assistant

The AI assistant tab accepts a plain-language prompt for one section, project, media item, or supported appearance setting. GitHub saves the request under `ai/requests/`, the dedicated assistant workflow runs a pinned, checksummed Apache-2.0 Qwen2.5-7B-Instruct GGUF model locally, and the result is committed under `ai/proposals/`. No AI API key or ChatGPT account is required. Model download and inference take a few minutes. Prompts and proposals are public repository content; do not include secrets.

Nothing changes on the live portfolio until the owner reviews the before/after values and clicks Apply reviewed changes. Applying rechecks the selected English values against the current branch, then atomically commits content and an `ai/applied/` audit record. Arabic-only updates do not invalidate a preview. A newer English edit requires a new proposal. The assistant never executes prompt text, writes source code or arbitrary files, automatically publishes proposals, or bypasses GitHub permissions. The model is instructed to preserve facts; the owner should review factual accuracy before applying. It edits existing content and supports accent colour (blue/emerald/gold/violet) and hero heading size (compact/standard/large). New projects and uploads use the existing dashboard tabs.

Advanced JSON change plans use `{"summary":"...","changes":[{"target":"section","id":"hero.lead","field":"value","value":"New wording"}]}`. Validate and review them in the selected scope. This mode does not execute JavaScript or shell code. The local model is constrained to structured JSON; shared validation, record schemas and stale-data checks are enforced before application. The connected token needs Contents: Read and write, with no additional Actions permission.

Assistant checks: `python -m unittest discover -s pages-site/assistant -p test_worker.py`, `npm test` from pages-site, and `python pages-site/assistant/worker.py --smoke` after installing assistant requirements. The assistant workflow runs an actual model smoke test on source changes.


### Recommendation review

Visitors submit recommendations to the existing private D1 inbox service. Anonymous intake requires consent, validates bounded fields, uses a honeypot and an hourly rate limit. Pending and rejected records, email, phone, profile URL, project context and owner notes never enter portfolio-data.json or the public feed. The GitHub dashboard Recommendations tab shows private submissions for review. Owner approval publishes only name, role, company, relationship and message; a stable public ID makes retries idempotent. Unpublish before rejecting or permanently deleting private details. Existing published recommendations are preserved.

Inbox review uses the existing GitHub repository write boundary without sending a GitHub PAT to the inbox service. The dashboard commits a SHA-256 digest of a random ten-minute proof under .recommendation-access/. Only the digest, scope and timestamps are public; the separate random secret remains in memory. The service verifies the proof against the fixed repository main branch on each private request. Disconnecting clears the browser proof. Native hosted-site authentication remains unchanged. Source and schema migrations for this service are archived in independent/; its live service must be deployed separately from GitHub Pages.
