# Faraz Engineering Portfolio — independent backend

An independent implementation of Faraz Nawaz's electrical/BIM portfolio, using the supplied Base44 source as a design and content reference. It does not call the Base44 SDK or require a Base44 account. The original Base44 export remains in the parent GitHub repository; this replacement is in `independent/`.

## Features

- English/Arabic portfolio, project detail pages, theme switching, CV downloads and introduction video.
- Owner dashboard at `/admin`: projects, covers, videos, drawings, project files, CVs, bilingual website text and recommendations.
- Persistent Cloudflare D1 records and R2 uploads. Maximum upload is 25 MB; accepted types are PDF, JPEG, PNG, WebP, MP4 and WebM, checked from file signatures.
- ChatGPT sign-in supplied by Sites; server authorization restricts administration to `ADMIN_EMAIL` (default `faraznawaz2014@gmail.com`). No default passwords, browser tokens, or public admin registration.
- Recommendations remain pending until approved; validation, a honeypot and an atomic hourly submission limit protect the public submission endpoint.
- Data export includes records and file metadata. Download original uploaded files separately; the export is not a complete media backup or automatic restore mechanism.

The supplied source content and bundled assets are preserved. Private Base44 records, uploaded media, user accounts and recommendations have not been copied. Two decorative images still use the reference's public image URLs. Arabic CV content and project translations are edited manually; no AI service is configured. The Arabic CV page opens browser printing for Save as PDF.

## Runtime and deployment

This project targets **Sites / Cloudflare Workers**, using Vinext, React, D1 and R2. It is not a GitHub Pages app or a drop-in Railway Node service. The tracked `.openai/hosting.json` declares `DB` and `BUCKET`; Sites provisions them and applies tracked Drizzle migrations when publishing. Hosted source and deployments are managed by Sites. A GitHub push alone does not trigger a deployment in this version.

New deployments are private to the owner until access is explicitly changed in Sites. If the owner's ChatGPT account uses a different email, set `ADMIN_EMAIL` through Sites runtime environment settings and redeploy. Do not put secrets in source or `NEXT_PUBLIC_*` variables.

From this project directory:

```sh
npm install
npm run build
node --test tests/backend.test.js
```

Use the supplied Sites helpers for managed preview, source synchronization and publication. For a local database, build once and apply each pending migration only once:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_closed_expediter.sql
```

Opening `/admin` as the authorized owner seeds the reference projects and introduction video once. Deleting a seeded project does not recreate it. Public pages display the bundled projects until initialization completes. Database migrations contain schema only.

## API

All API responses containing records use `Cache-Control: no-store`. Mutation endpoints validate inputs and enforce same-origin browser writes.

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET /api/health` | Site visitor | Database/storage readiness |
| `GET /api/session` | Site visitor | Current identity and role |
| `GET /api/records/:kind` | Site visitor | Paginated public content; approved recommendations only |
| `POST /api/records/:kind` | Admin | Create a validated record |
| `PATCH /api/records/:kind/:id` | Admin | Update an existing record |
| `DELETE /api/records/:kind/:id` | Admin | Delete a record |
| `POST /api/recommendations` | Site visitor | Submit for approval |
| `POST /api/uploads` | Admin | Upload a binary file with `X-File-Name` |
| `GET /api/uploads` | Admin | List uploaded files |
| `GET /api/files/:id` | Site visitor | Read or stream an uploaded file |
| `DELETE /api/files/:id` | Admin | Delete an unattached upload |
| `GET /api/backup` | Admin | Export JSON records and file metadata |
| `POST /api/initialize` | Admin | Initialize reference content once |

Kinds are `Project`, `MediaItem`, `TextOverride`, `CvVersion` and `Recommendation`.

Trusted identity headers are supplied and validated by the Sites gateway. Do not expose this Worker directly behind a host that lets callers supply these headers without authentication. Moving to another host requires replacing that identity boundary and binding D1/R2 or adapting the storage layer.

## Verification

The Node integration suite uses SQLite and an in-memory object-store test double. It tests unauthorized writes, CRUD persistence, duplicate slugs, moderation, status injection, invalid URLs, prototype-path rejection, request-size limits, cross-origin writes, submission throttling, one-time initialization, and upload attachment/deletion behavior. It does not replace a real sign-in check with the owner's account.

## Dashboard and public GitHub updates

The dashboard mirrors the reference tabs: Intro video, Projects, Project covers, Project videos, Drawings, CV & profile photo, Section details, Project files and Recommendations. CV uploads support independent English and Arabic PDFs; no automatic translation is configured. Project files includes a source ZIP link, content export, and uploaded-file management.

The public GitHub Pages frontend can read `/api/portfolio` from this backend and resolve uploaded files to this origin. Cross-origin read permission is limited to `https://iemfaraz.github.io`; cross-origin writes remain rejected, and every admin write still checks trusted identity. The feed excludes pending/rejected recommendations. Public feeds and media require the owner to explicitly enable public viewing of this Site. Until that access is enabled, GitHub Pages keeps showing bundled content as a fallback; adding the Manage link alone does not make edits public. The private admin dashboard remains protected after public viewing is enabled.
