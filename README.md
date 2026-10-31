# Faraz Nawaz — Engineering Portfolio

- [Live portfolio](https://iemfaraz.github.io/faraz-engineering-portfolio/)
- [Manage portfolio](https://iemfaraz.github.io/faraz-engineering-portfolio/#/admin)

Manage projects, covers, videos, CVs, drawings and section text through the GitHub-backed dashboard. Its connection screen explains the one-time GitHub token setup. Content and media are stored in this repository; no ChatGPT account is needed to manage the live portfolio.

The production app is in `pages-site/`. Canonical content is `portfolio-data.json`, and uploaded media are in `uploads/`. Each dashboard save commits to main and triggers Pages publication. See [setup and development](pages-site/README.md).

`independent/` preserves the earlier full-stack implementation and presentation source. The original Base44 export is retained for reference. Neither backend is required by the GitHub Pages dashboard.
