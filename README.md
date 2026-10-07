# Pakeeru Basha Mekala – portfolio

Personal portfolio site, built with [Astro](https://astro.build) and deployed to GitHub Pages at https://pakeerubasha-mekala.github.io.

## Commands

```sh
npm install                              # first time only
npm run dev                              # local dev server at localhost:4321
npm run build                            # type-check and build static site to ./dist
npm run preview                          # serve ./dist locally
npm run new:post -- "My post title"      # create a new blog post (see below)
npm run pdf                              # rebuild the resume PDF locally
```

Pushing to `main` builds and deploys the site (and regenerates the resume PDF) through `.github/workflows/deploy.yml`.

## Add a blog post from the command line

```sh
cd ~/Work/personal/snigji.com
npm run new:post -- "My post title" --tags aws,devops
```

Optional flag if the post was first published elsewhere (adds an "Also published on …" link):

```sh
npm run new:post -- "My post title" --tags aws --medium https://medium.com/@you/your-post
```

This creates `src/content/blog/<slug>.md` with the front matter filled in and `draft: true`. Then:

1. Open the file, fill in `description`, and write the post in Markdown.
2. Put images in `public/blog/<slug>/` and reference them as `/blog/<slug>/name.png`.
3. Preview with `npm run dev` at http://localhost:4321/blog (drafts show in dev only).
4. Set `draft: false` when it is ready.
5. Publish:

   ```sh
   git add -A
   git commit -m "Add post: My post title"
   git push
   ```

The site redeploys in about a minute. Pull first (`git pull`) if you also edit through the CMS.

Other ways to write posts: the web editor (Pages CMS) and GitHub's own file editor. See [CMS.md](./CMS.md).

## More

- [DEVELOPER.md](./DEVELOPER.md): running locally, blog and resume details, interactive extras.
- [CMS.md](./CMS.md): editing from a web UI, and comments (giscus).
- [CLOUDFLARE_MIGRATION.md](./CLOUDFLARE_MIGRATION.md): moving to Cloudflare later.
- [AGENTS.md](./AGENTS.md): architecture notes.
