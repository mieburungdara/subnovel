# Project Overview

This is a Jekyll-based website for web novel translations. It hosts **several novels**: every
novel is a Jekyll collection with its own folder, chapter tracker, chapter list page and Atom feed.

# Building and Running

The project uses Bundler to manage Ruby gem dependencies.

*   To install dependencies: `bundle install`
*   To build and serve the site locally: `bundle exec jekyll serve` (site is served under `/subnovel`)
*   To build the static output: `bundle exec jekyll build --strict_front_matter`
*   To verify the output: `bash script/check-content.sh _site` and `ruby script/check-links.rb _site`

# Development Conventions

*   Every novel lives in its own collection folder `_<slug>/` and is registered in `_config.yml`
    under `collections` (permalink) and `novels` (title, description, path, feed).
*   The chapter tracker of a novel lives in `chapter/<slug>/done` and `chapter/<slug>/undone`.
    Both folders are excluded from the build and must never be published.
*   Layouts are defined in the `_layouts` directory: `default.html` (shell, sidebar, bottom bar)
    and `novel.html` (chapter list page of one novel).
*   Custom CSS is located in `assets/style.css`; the client-side scripts in `assets/js/`.
*   `script/check-content.sh` enforces the markdown conventions below and runs in CI.

## Chapter posts

Each document is one translated chapter and uses the `default` layout (applied automatically through
the `defaults` entry in `_config.yml`).

*   Front matter carries `layout`, `title` and `date`. Every chapter shares the same placeholder
    date and encodes its serial order in the time part (chapter 241 -> `04:01`), so that the Atom
    feed and the navigation are ordered newest-first without changing any chapter URL.
*   The translator/editor credits block ends with a kramdown block IAL `{: .credits}`.
*   The chapter notes block at the end of a post ends with `{: .notes}`.
*   Footnote numbers are written `1 :` (never `1.`); a period makes kramdown parse the notes as an
    ordered list.
*   Scene separators are written `* * *` with ordinary spaces; a non-breaking space makes kramdown
    parse them as a bullet list.

# Deployment

`.github/workflows/jekyll-gh-pages.yml` deploys to GitHub Pages on pushes to `main`;
`.github/workflows/ci.yml` builds and runs the content/link checks on every pull request.
