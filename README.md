# Personal Research Portfolio & Blog

Static site built with [Hugo](https://gohugo.io/) and the [hugo-noir](https://github.com/prxshetty/hugo-noir) theme.

## Prerequisites

- Hugo extended v0.167.0 (the version used by the deployment workflow)
- Git

## Directory Structure

```
.
├── archetypes/        # Content templates
│   ├── blogs.md
│   ├── default.md
│   ├── projects.md
│   └── research.md
├── content/           # Markdown content
│   ├── _index.md      # Home page
│   ├── about.md
│   ├── contact.md
│   ├── research/       # Individual research ideas and notes
│   │   └── _index.md
│   ├── blogs/         # Blog posts
│   │   ├── _index.md
│   │   ├── hard-problem-epistemic-boundary.md
│   │   └── welcome-to-my-blog.md
│   └── projects/      # Project pages
│       ├── _index.md
│       └── example-project.md
├── data/              # Data files for theme sections
│   └── en/
│       ├── author.yaml
│       ├── experience.yaml
│       ├── projects.yaml
│       └── tech.yaml
├── layouts/           # Template overrides
│   ├── _default/
│   │   ├── baseof.html
│   │   ├── blogs.html
│   │   └── projects.html
│   └── partials/
│       └── header.html
├── static/            # Static assets
│   ├── images/
│   │   └── projects/
│   │       └── saxon-icon.png
│   └── robots.txt
├── .github/
│   └── workflows/
│       └── deploy.yml
├── hugo.toml
└── README.md
```

## Local Development

After cloning the repository, fetch the theme:

```bash
git submodule update --init --recursive
```

Then start the preview:

```bash
hugo server --buildDrafts
```

Then open `http://localhost:1313/`.

## Build

```bash
hugo --minify
```

Output is written to the `public/` directory.

## Content Workflow

1. Write a Markdown article.
2. Put it in the appropriate content directory.
3. Run `hugo --minify`.
4. Obtain the generated static website in `public/`.

### Blog Posts

```bash
hugo new blogs/my-new-post.md
```

### Research Notes

Each idea is a separate Markdown file in `content/research/`. The Research page
automatically lists published notes with the newest first.

```bash
hugo new research/my-research-idea.md
```

This uses `archetypes/research.md`, with sections for the question, idea, approach,
and references. New notes start with `draft: true`; change it to `false` when ready
to publish. You can also create files directly in `content/research/` with title,
date, and draft status in their front matter. Edit `content/research/_index.md` to
change the section's introduction.

### Projects

```bash
hugo new projects/my-project.md
```

### Images in Markdown

Put shared images in `static/images/`, with optional folders such as `projects/`,
`blogs/`, or `research/`. Hugo publishes the contents of `static/` at the website
root, so omit `static` from the image URL:

```markdown
![Saxon application icon](/images/projects/saxon-icon.png)
```

That URL refers to `static/images/projects/saxon-icon.png` in this repository,
not to a folder inside `content/projects/`.

Images retain their original proportions and have no added background, border,
padding, or rounded-corner mask. Use a transparent PNG or WebP if you want the
page background to show through the image's corners; black pixels already in an
image remain part of the image.

### Background Curvature

Cards bend the background grid for roughly 4.5–5 cells (162–180px) beyond their
edges. Mass increases with visible character count, font size, font weight, and
heading text. Standalone headings exert a smaller pull; headings inside a card
contribute to that card. Nested cards count their own content once.

The build records byte sizes for images, GIFs, video, and audio in `static/`.
Media contributes mass on a logarithmic scale, with a cap on the total effect.
External media and embeds use a modest estimate. Supply `data-gravity-bytes` on a
media element when its size is known, for example:

```html
<video src="https://example.com/demo.mp4" data-gravity-bytes="2097152" controls></video>
```

Mass is cached until content, media, fonts, or layout changes; scrolling updates
only element positions. No extra media downloads are made to calculate mass.
Tune `panelEffect` and `contentMass` near the top of `static/js/background.js`.
Curvature reach and fading distance are independent.

Run the calculation and animation regression checks with Node.js (no package
installation or browser required):

```bash
node --test tests/background.test.cjs
```

## Deployment

The workflow in `.github/workflows/deploy.yml` builds and deploys the site to
GitHub Pages whenever a commit is pushed to `main`. It uses Hugo extended
v0.167.0, fetches the theme submodule, and publishes the generated `public/` directory. You do not need to
build locally or commit `public/` to deploy.

### One-time GitHub setup

1. Open [this repository's Pages settings](https://github.com/nawinaswin/nawinaswin.github.io/settings/pages).
2. Under **Build and deployment**, set **Source** to **GitHub Actions**. The
   repository already contains the workflow, so no additional template is needed.
3. Commit and push your changes to `main`, including `.github/workflows/deploy.yml`.
4. Open the [Actions tab](https://github.com/nawinaswin/nawinaswin.github.io/actions)
   and wait for **Deploy to GitHub Pages** to finish successfully.
5. Visit [https://nawinaswin.github.io/](https://nawinaswin.github.io/).

The workflow uses GitHub's automatic token; no personal access token or deployment
secret needs to be added. If Actions are disabled for the repository, enable them
in **Settings → Actions → General** and allow the actions used by this workflow.

See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Publishing later changes

From the repository on the `main` branch:

```bash
git add .
git commit -m "Update website"
git push origin main
```

The push triggers a new build and deployment automatically. A local commit alone
does not update the live site. Pushes to other branches are not deployed until
merged into `main`.

To retry a deployment without another commit, open **Actions → Deploy to GitHub
Pages → Run workflow** and select `main`. This is also useful if the first run
failed before the Pages source was configured. If deployment waits for approval,
check whether the `github-pages` environment has required reviewers configured.

Pages marked `draft: true` are visible in the local preview with `--buildDrafts`,
but are excluded from the production build. Set `draft: false` when ready to publish.

## Discoverability

The site is configured to discourage search-engine indexing:

- `static/robots.txt` disallows all crawlers.
- `<meta name="robots" content="noindex, nofollow">` is included in every page.
- No RSS feed is generated.
- No sitemap is generated.

These are soft controls only; they do not provide security.

## Future Private Content

The architecture leaves room for a future private/restricted-content system. Do not implement this unless explicitly requested. Potential approaches:

- Encrypted content stored in `content/private/`
- Client-side decryption in the browser
- Password/PIN supplied directly to selected individuals
- No authentication backend required
- Plaintext private content should not be publicly hosted

## License

The theme is licensed under its original terms. Site content is your own.
