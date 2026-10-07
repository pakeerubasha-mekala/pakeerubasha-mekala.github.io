# Developer guide

## Run locally (dev mode)

```sh
cd ~/Work/personal/snigji.com
npm install        # first time only
npm run dev
```

The site is served at http://localhost:4321 and reloads when you edit a file. Press `Ctrl+C` to stop it.

If the port is already taken by a background dev server, stop it first:

```sh
npx astro dev stop
```

### Run the dev server in the background

```sh
npx astro dev --background   # start
npx astro dev status         # check
npx astro dev logs           # see output
npx astro dev stop           # stop
```

If a blog post or file doesn't show up after you add or delete it, restart the dev server.

## Test the production build locally

```sh
npm run build && npm run preview
```

`npm run build` type-checks the project and builds the static site to `./dist`. `npm run preview` serves that build locally.

## Deploy

Pushing to `main` builds and deploys the site to GitHub Pages through `.github/workflows/deploy.yml`.

Live site: https://pakeerubasha-mekala.github.io
