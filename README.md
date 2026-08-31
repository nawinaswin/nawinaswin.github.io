# Personal Research Portfolio & Blog

Static site built with [Hugo](https://gohugo.io/) and the [hugo-noir](https://github.com/prxshetty/hugo-noir) theme.

## Prerequisites

- Hugo extended v0.92.0 or later
- Git

## Directory Structure

```
.
├── archetypes/        # Content templates
│   ├── blogs.md
│   ├── default.md
│   └── projects.md
├── content/           # Markdown content
│   ├── _index.md      # Home page
│   ├── about.md
│   ├── contact.md
│   ├── research.md
│   ├── blogs/         # Blog posts
│   │   ├── _index.md
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
│   └── robots.txt
├── .github/
│   └── workflows/
│       └── deploy.yml
├── hugo.toml
└── README.md
```

## Local Development

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

### Projects

```bash
hugo new projects/my-project.md
```

## Deployment

This site is configured for GitHub Pages via GitHub Actions.

1. Push this repository to GitHub.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` will automatically build and deploy the site.

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
