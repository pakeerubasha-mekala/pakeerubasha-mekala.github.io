# Cloudflare Pages (dual deploy)

The site deploys to **GitHub Pages** at https://pakeerubasha-mekala.github.io through `.github/workflows/deploy.yml`. That same workflow now **also** publishes the identical build to **Cloudflare Pages** (free `*.pages.dev`, global CDN, per-deploy preview URLs) — one build, two hosts.

**No domain purchase is needed:** Cloudflare gives a free `*.pages.dev` address. A custom top-level domain (`.com`, `.dev`) is optional and bought separately (Cloudflare Registrar sells at wholesale/at-cost).

## How it works

`make-pdf.mjs` and `make-og.mjs` render the resume PDF and social cards with headless **Chrome**, which GitHub's runners have and Cloudflare's build image does **not**. So Cloudflare never builds the site — GitHub Actions builds `dist/` once (with the PDF and OG cards) and uploads it to both GitHub Pages and Cloudflare Pages. The Cloudflare step is **skipped automatically** until you configure the secrets below, so nothing breaks before setup.

GitHub Pages stays the canonical site (`site` in `astro.config.mjs`), so there is no duplicate-content SEO split; Cloudflare is a fast mirror. To make Cloudflare (or a custom domain) primary later, see "Make Cloudflare primary" below.

## One-time setup

1. **Create the Cloudflare Pages project** (once):
   - Dashboard: https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Direct Upload**, name it (for example `pakeeru`), create it. (Direct Upload — not "Connect to Git" — because GitHub Actions does the building.)
   - Or CLI: `npx wrangler pages project create pakeeru --production-branch=main` (after `npx wrangler login`).
2. **Create an API token:** **My Profile → API Tokens → Create Token → Custom token** with permission **Account → Cloudflare Pages → Edit**. Copy it. Also copy your **Account ID** from the dashboard sidebar.
3. **Add them to GitHub:** repo **Settings → Secrets and variables → Actions → Secrets**:
   - `CLOUDFLARE_API_TOKEN` = the token
   - `CLOUDFLARE_ACCOUNT_ID` = your account ID

   (The Pages project name is hardcoded as `pakeeru` in `deploy.yml`; change it there if you rename the project.)
4. **Push to `main`** (or run the workflow from the Actions tab). The build now deploys to both. The site is live at `https://pakeeru.pages.dev`.

That's it — both hosts update on every push.

## Make Cloudflare (or a custom domain) primary later

If you want Cloudflare/`pages.dev`/a custom domain to be the main address, replace `https://pakeerubasha-mekala.github.io` with the new address in:

- `astro.config.mjs`: `site` (drives canonical links, sitemap, RSS, social previews)
- `public/robots.txt`: the `Sitemap:` line
- `src/pages/rss.xml.ts`: the fallback `site`
- `AGENTS.md`, `README.md`, `DEVELOPER.md`: the live-site links

A custom domain is added in **Pages project → Custom domains → Set up a domain** once you own one.

## Notes

- **Live status:** the `/status` page and the bot's deploy answers read the GitHub API for `profile.repo`, so they report the GitHub Actions run (which is what drives both deploys). No change needed.
- **Turning off a host:** GitHub Pages can be disabled in repo **Settings → Pages**; Cloudflare deploys stop if you remove the secrets/variable. Keeping both is harmless.
- **Rollback:** remove the three Cloudflare secrets/variable and the Cloudflare step goes dormant again; GitHub Pages is unaffected.
