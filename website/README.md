# WSP Training — website

The marketing/program site for WSP (Walkley Specialist Performance) — a single
static HTML file, no build step, no dependencies. Everything (styling,
program data, the calculators) lives inline in `index.html`.

## Deploying (Vercel, free tier)

1. Go to [vercel.com](https://vercel.com) and sign up/log in with GitHub.
2. **Add New... → Project**, import `jacksonwalkley-cmd/WSP`.
3. When configuring the project:
   - **Root Directory**: set to `website` (this folder) — the repo also
     contains an unrelated Expo app (`wsp-app/`) at the root, so Vercel needs
     to be pointed specifically here.
   - **Framework Preset**: "Other" (it's a plain static site).
   - Leave build command / output directory blank — nothing to build.
4. Deploy. Vercel gives you a free `*.vercel.app` URL immediately.
5. Once you own a real domain, add it under the Vercel project's
   **Settings → Domains** and follow the DNS instructions Vercel shows you.

## Which branch is "live"

This file currently lives on the `claude/eloquent-tesla-9h0hnu` branch, not
`main`. By default Vercel deploys your repository's default branch (usually
`main`) as Production. Until this branch is merged into `main`, either:

- merge this branch into `main` yourself (or ask Claude to open a PR for it), or
- in the Vercel project's **Settings → Git**, set the Production Branch to
  `claude/eloquent-tesla-9h0hnu` directly.

## Making changes after it's live

Ask Claude to edit `website/index.html` and push the change (to whichever
branch Vercel is watching). Vercel redeploys automatically on every push —
no manual redeploy step.
