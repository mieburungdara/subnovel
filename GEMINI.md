# Project Overview

This is a Jekyll-based website for a web novel translation project named "Subnovel". It uses the `minima` theme and is configured to serve translated chapters.

# Building and Running

The project uses Bundler to manage Ruby gem dependencies.

*   To install dependencies: `bundle install`
*   To build and serve the site locally: `bundle exec jekyll serve` (site is served under `/subnovel`)
*   To build the static output: `bundle exec jekyll build --strict_front_matter`
*   To verify internal links of a build: `ruby script/check-links.rb _site`

# Development Conventions

*   Jekyll posts are located in the `_posts` directory, following the `YYYY-MM-DD-title.md` naming convention.
*   The site uses the `minima` Jekyll theme.
*   Custom CSS is located in `assets/style.css`.
*   Layouts are defined in the `_layouts` directory.

## Chapter posts

Each post is one translated chapter and uses the `default` layout (applied automatically through the
`defaults` entry in `_config.yml`).

*   Front matter only carries `title`; the chapter heading is rendered by `_layouts/default.html`.
*   The translator/editor credits block ends with a kramdown block IAL `{: .credits}`.
*   The chapter notes block at the end of a post ends with `{: .notes}`.
*   `chapter/done/` and `chapter/undone/` hold the source texts; they are excluded from the build and
    must never be published.

# Deployment

`.github/workflows/jekyll-gh-pages.yml` deploys to GitHub Pages on pushes to `main`;
`.github/workflows/ci.yml` builds and link-checks every pull request.
