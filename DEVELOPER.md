# Developer guide

## Run locally (dev mode)

Run these from the project folder.

```sh
cd ~/Work/personal/snigji.com
git pull           # the CMS commits straight to main, so get its changes first
npm install        # first time only
npm run dev
```

The site is served at http://localhost:4321 and reloads when you edit a file. Press `Ctrl+C` to stop it.

### Stop, start and restart

| Goal | Command |
|---|---|
| Start in the foreground (stop with `Ctrl+C`) | `npm run dev` |
| Start in the background (terminal stays free) | `npx astro dev --background` |
| Check whether it is running | `npx astro dev status` |
| See its output and errors | `npx astro dev logs` |
| Stop the background server | `npx astro dev stop` |
| Restart | `npx astro dev stop` then `npx astro dev --background` (or `npm run dev`) |

If `npm run dev` says the port is already in use, a background server is still running. Stop it with `npx astro dev stop`.

### When to restart

The dev server sometimes keeps old files in its cache. Restart it if:

- the page looks unstyled or out of date,
- a new or deleted file (a blog post, a component) doesn't show up,
- you see a 500 error after adding or deleting files.

## Test the production build locally

```sh
npm run build && npm run preview
```

`npm run build` type-checks the project and builds the static site to `./dist`. `npm run preview` serves that build locally.

## Edit from a web UI

Blog posts and the site data (profile, experience, skills, education) can be edited from a browser with Pages CMS, and blog posts have giscus comments. See [CMS.md](./CMS.md) for the one-time setup.

## Add a blog post

```sh
npm run new:post -- "My post title" --tags aws,devops
# optional, if it was first published on Medium:
npm run new:post -- "My post title" --tags aws --medium https://medium.com/@you/your-post
```

This creates `src/content/blog/<slug>.md` with the frontmatter filled in and `draft: true`.

1. Write the post in Markdown and fill in `description`.
2. Put images in `public/blog/<slug>/` and reference them as `/blog/<slug>/name.png`.
3. Drafts show in `npm run dev` only. Set `draft: false` when ready.
4. Commit and push to `main` to publish.

Reading time is calculated automatically. The blog page has a search box (press `/` to focus) that matches title, description, tags and the full post text, plus tag filters; the command palette (Ctrl/⌘ + K) also finds posts by tag and description. Share a filtered view with `/blog?q=oidc&tag=aws`. `canonicalUrl` adds an "Also published on ..." link to the post.

## Resume PDF

The resume page (`/resume`) and the PDF are built from the same data files as the home page (`src/data/*.ts`).

- **On deploy:** the GitHub Actions workflow builds the site and then regenerates the PDF into `dist/`, so the live PDF always matches your data. You don't need to do anything.
- **Locally:** `npm run pdf` rebuilds the site and writes `public/pakeeru-basha-mekala-resume.pdf`, which is what the dev server serves for the Download button. It uses a locally installed Chromium-based browser (Chrome, Brave, Edge or Chromium; set `CHROME_PATH` to choose one).

## Interactive extras

- **Terminal, command palette (Ctrl/⌘ + K), boot sequence, Konami code:** try `help` in the terminal on the home page.
- **Live data:** the pipeline status line, the `site-deploy` row, and the terminal commands `git log` and `status` read the public GitHub API for `profile.repo` (set in `src/data/profile.ts`). If you rename the repo, update it there.
- **Recruiter mode:** the header button switches off the effects and shows the clean layout. Decorative elements carry the `fx` class.

## Deploy

Pushing to `main` builds and deploys the site to GitHub Pages through `.github/workflows/deploy.yml`.

Live site: https://pakeerubasha-mekala.github.io

Planning to move to Cloudflare later? See [CLOUDFLARE_MIGRATION.md](./CLOUDFLARE_MIGRATION.md).
