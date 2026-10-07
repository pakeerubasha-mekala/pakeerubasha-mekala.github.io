# Moving to Cloudflare (future)

The site currently deploys to GitHub Pages at https://pakeerubasha-mekala.github.io through `.github/workflows/deploy.yml`. This guide covers moving it to Cloudflare. **No domain purchase is needed:** Cloudflare gives a free `*.pages.dev` address (Pages) or `*.workers.dev` address (Workers).

GitHub Pages already hosts the site for free, so only migrate if you want Cloudflare's CDN, per-branch preview URLs, or a custom domain later.

## Choose an option

| | A. Pages + Git integration | B. GitHub Actions + Cloudflare |
|---|---|---|
| Setup | Easiest, all in the Cloudflare dashboard | Needs an API token stored as a GitHub secret |
| Resume PDF | **Not auto-built** (Cloudflare's build image has no Chrome) | **Auto-built** (the workflow already generates it) |
| Previews per branch | Yes | Only if you add them |

Recommendation: **Option A** if you will remember to run `npm run pdf` before pushing, otherwise **Option B**.

## Option A: Cloudflare Pages connected to GitHub

1. Go to https://dash.cloudflare.com, then **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the `pakeerubasha-mekala.github.io` repository and the `main` branch.
3. Build settings:
   - Framework preset: `Astro` (or `None`)
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add an environment variable (Production and Preview): `NODE_VERSION` = `24`. The site requires Node 24 or newer (`package.json` engines and `.nvmrc`).
5. Save and deploy. The site is served at `https://<project-name>.pages.dev`.

**Resume PDF with Option A:** the build only copies `public/pakeeru-basha-mekala-resume.pdf`. Before pushing any change to your data files, run:

```sh
npm run pdf
git add public/pakeeru-basha-mekala-resume.pdf
```

## Option B: GitHub Actions deploys to Cloudflare

1. In Cloudflare, create the Pages project once: **Workers & Pages → Create → Pages → Direct Upload**, name it (for example `pakeeru-portfolio`).
2. Create an API token: **My Profile → API Tokens → Create Token**, using the "Edit Cloudflare Workers" template or a custom token with **Account → Cloudflare Pages → Edit**. Copy your **Account ID** from the dashboard sidebar.
3. In the GitHub repo: **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. In `.github/workflows/deploy.yml`, keep the `build` job as it is, and replace the final `deploy` job (and the `pages`/`id-token` permissions) with:

```yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: github-pages        # the artifact made by upload-pages-artifact
          path: artifact
      - run: mkdir site && tar -xf artifact/artifact.tar -C site
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy site --project-name=pakeeru-portfolio
```

   A simpler variant: skip `upload-pages-artifact` and `download-artifact`, and run the `wrangler-action` step in the `build` job directly with `pages deploy dist --project-name=pakeeru-portfolio`, right after the PDF step.

5. Push to `main`. The site is served at `https://pakeeru-portfolio.pages.dev` (use your project name).

## Code changes needed in both options

Replace `https://pakeerubasha-mekala.github.io` with the new address in:

- `astro.config.mjs`: `site`
- `public/robots.txt`: the `Sitemap:` line
- `src/pages/rss.xml.ts`: the fallback `site`
- `AGENTS.md`: the Deployment section
- `README.md` and `DEVELOPER.md`: the live site links

The site address drives canonical links, the sitemap, RSS and social previews, so a wrong value there points search engines and link previews at the old site.

## Things that behave differently

- **Live status:** the pipeline line, the `site-deploy` row and the `git log` / `status` terminal commands read the GitHub API for `profile.repo` in `src/data/profile.ts`. They keep working, but they report the GitHub workflow runs. With Option A, "last deploy" will no longer reflect Cloudflare deploys.
- **GitHub Pages:** the old site stays online until you turn it off (repo **Settings → Pages**) or delete `.github/workflows/deploy.yml`. Keeping both is harmless, but the two addresses can drift apart.
- **Old `wrangler.jsonc`:** this repo no longer has one. It is only needed if you choose Workers Static Assets instead of Pages (`assets.directory: ./dist`, `not_found_handling: 404-page`) and deploy with `npx wrangler deploy`.

## Custom domain later

When you own a domain, add it in Cloudflare: **Pages project → Custom domains → Set up a domain**. Then update the site address in the files above to the new domain.

## Roll back

Re-enable the GitHub Pages workflow (or keep it), and switch the site address back to `https://pakeerubasha-mekala.github.io` in the files listed above.
