# Editing the site from a web UI (Pages CMS) and comments (giscus)

The site is static, so there is no server to log in to. Instead, [Pages CMS](https://pagescms.org) edits the files in this repo through a web UI. **Every save is a commit to `main`**, and the GitHub Actions workflow then rebuilds and deploys the site (about a minute).

**Who needs to log in?** Nobody to *read* the site. Only you log in to the CMS, and visitors need a GitHub account only to *comment*.

## One-time setup

1. Open https://app.pagescms.org and sign in with GitHub (`pakeerubasha-mekala`).
2. Install the Pages CMS GitHub app on the `pakeerubasha-mekala.github.io` repository when asked (you can limit it to that one repo).
3. Open the repo in Pages CMS. It reads `.pages.yml` from the repo root and shows these sections:
   - **Blog posts** (`src/content/blog/*.md`): title, description, date, tags, draft switch, optional "originally published at" link, and the post body in a rich-text editor. Images you upload go to `public/blog/`.
   - **Case studies** (`src/content/work/*.md`): title, company, role, summary, tools, optional measured impact, and the write-up.
   - **Profile**, **Experience**, **Skills**, **Education**, **Projects**, **Publications**, **Analytics** (`src/data/*.json`).

> Not yet tested in the real Pages CMS app. If a field looks wrong in the editor, adjust `.pages.yml`; the [Pages CMS docs](https://pagescms.org/docs/) describe every option. If you prefer another tool (Decap CMS, Tina), the JSON and Markdown files do not need to change.

## Writing a blog post

1. **Blog posts → New**, fill in the title, description and date, and write the post.
2. Leave **Draft** on while writing; turn it off to publish. A saved draft is committed but stays hidden on the live site.
3. Save. The post is live after the next deploy.

You can still write posts as Markdown files (`npm run new:post`, see `DEVELOPER.md`) or with GitHub's own web editor; all three methods edit the same files.

## Editing the profile, experience, skills and so on

Open the section, edit, save. Notes:

- Leave **Email**, **GitHub URL** or **Stack Overflow URL** empty to hide that button.
- **Projects** and **Publications** sections stay hidden on the site while their lists are empty.
- In **Experience**, a company can have a list of projects (newest first); each project has its own highlights and tools. The **short highlights for the one-page resume** are what the two resumes print; keep them to a few lines each so the PDF stays on one page.
- **What I do:** the four cards on the home page. **Testimonials:** the section stays hidden until you add real entries. **Newsletter link** in Profile shows a "Subscribe by email" band when filled in.
- **Booking link** in Profile shows a "Book a call" button when filled in.
- **Case studies:** a project in Experience links to its case study when the names match (project `Waitrose` and case study titled `Waitrose`). Add real, measured results under **Impact** and an Impact section appears.
- The JSON files are in `src/data/`. The matching `.ts` files only add types; edit the JSON, not the `.ts`.
- The resume page and its PDF use the same data, so they update on the next deploy.

## Comments (giscus)

Comments appear under every blog post and live in this repo's **GitHub Discussions** (category "Announcements"). Discussions are already switched on and the IDs are in `src/data/comments.json`.

**You must install the giscus app once**, or the comment box shows an error instead of loading:

1. Go to https://github.com/apps/giscus and click **Install**.
2. Choose **Only select repositories** and pick `pakeerubasha-mekala.github.io`.

Then open any post: visitors sign in with GitHub to comment, and each post's thread is created on its first comment. Moderate from the repo's **Discussions** tab.

To turn comments off, empty `repoId` in `src/data/comments.json`; the section then does not render. Comments load the script from giscus.app, so visitors' browsers contact that service when they scroll to the comments.

## Things to know

- **Merge conflicts:** the CMS commits to `main`. Pull before you edit locally if you also use the CMS (`git pull`).
- **Empty items:** the CMS can leave blank list items; the site ignores them.
- **Formatting:** the CMS may reformat frontmatter or JSON slightly when you save. That is harmless.
