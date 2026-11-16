# Riccardo Giorgi — personal website

Minimal bilingual static site. Requires Node.js 22+ and `pdflatex` (TeX Live).
Run `npm ci` once to install the build-time Markdown renderer and HTML sanitizer.
On Debian/Ubuntu, install LaTeX with
`sudo apt install texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-lang-italian lmodern`.

## Local preview

Run `npm start`, then open http://localhost:3000. Saving content, templates,
styles or assets automatically rebuilds the site and refreshes open preview tabs.
Changes to build scripts and LaTeX sources in `cv/` also trigger a rebuild. Build errors appear in the
terminal; fix the error and save to retry. Live reload runs only in local preview.
Run `npm run build` to generate `dist/` for static hosting, including GitHub Pages.
The GitHub Pages deployment workflow is described below.

## GitHub Pages deployment

`.github/workflows/pages.yml` builds this repository for
`Theuntextured/Theuntextured.github.io`. Pushes to the default `master` branch
build and deploy the website; pull requests targeting `master` run the same
checks without deploying. The workflow can also be started manually; deployment
is limited to the repository's default branch.

In the repository's **Settings → Pages → Build and deployment**, select
**GitHub Actions** as the source before the first deployment. The workflow
installs Node.js 24, LaTeX with Italian language support and Poppler, runs
`npm ci` and `npm run check`, then publishes only `dist/`. Both compiled CV
PDFs are included. No personal access token or separate deployment branch is
needed. The deployment job uses the `github-pages` environment and the built-in
`GITHUB_TOKEN` with Pages and OIDC permissions.

The custom domain is `riccardogiorgi.tech`. Set it in **Settings → Pages →
Custom domain**; the workflow deploys to the domain configured there. Actions
deployments do not use a repository `CNAME` file to configure the domain.

The workflow uses official GitHub actions pinned to verified commit revisions.
See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Formatting and checks

Run `npm run format` to format source files with Prettier and `npm run lint`
to check JavaScript with ESLint. `npm run lint:fix` applies automatic lint fixes.
Run `npm test` to check CV compilation, failure handling and inline Markdown rendering. Run `npm run check`
to run lint, verify formatting, run tests and build all pages and the CV PDF.

Use two spaces for indentation. HTML templates use `/* HTML */` comments so
Prettier can format their markup too. Generated files, vendored D3 and upstream
icons are excluded from formatting; vendored code is excluded from linting.

## Editing guide

- `src/content/it.json`: Italian page titles, home copy and PDF viewer labels.
- `src/content/en.json`: English page titles, home copy and PDF viewer labels.
- `src/site.mjs`: name, languages, page IDs and navigation order.
- `src/layout.mjs`: shared HTML layout and navigation.
- `src/assets/`: shared styles and future static assets.
- `scripts/`: build and preview commands.
- `cv/en.tex`, `cv/it.tex`: English and Italian printable CV content.
- `cv/layout.tex`: shared A4 typography and layout for both CVs.
- `dist/`: generated output; never edit or commit.

Both /it/ and /en/ contain Home, Links, Competences & activities, Current projects,
Certificates, and Printable CV. The root opens Italian. Language switching preserves the
current page. Both languages share English URL slugs for predictable routing.

To add a page, add its ID to src/site.mjs and its title to both content files.
Navigation updates automatically. As real content is added, extend content
entries and the shared layout; keep translated copy out of scripts.

English content was initially populated from https://riccardogiorgi.tech/en/,
its skills page and printable CV, then updated with personal project, badge
and profile details. Italian content translates the current English material.
Both languages use matching competence, activity, project and certificate
entries. The Links page is maintained separately in `src/content/links-tree.json`.
Content entries can specify `"languages": ["en"]` or `["it"]` to appear only
in that language; omit `languages` for bilingual entries. Only the selected
languages require translated fields. This applies to competences, activities,
projects, certificates and nodes in the links tree.

The printable CV pages at `/en/cv/` and `/it/cv/` embed PDFs compiled from
`cv/en.tex` and `cv/it.tex` on every website build. Generated files are
`dist/assets/cv/riccardo-giorgi-en.pdf` and
`dist/assets/cv/riccardo-giorgi-it.pdf`. The pages include download and open
links, plus a fallback for browsers without embedded PDF support. Viewer labels
live in each language's JSON file, markup in `src/pages/cv.mjs` and styles in
`src/assets/cv.css`. See `cv/README.md` for sources and editing details.

## Competences & activities

Edit `src/content/competences-activities.json` to add, remove or reorder entries.
Its `competences` and `activities` arrays control the Skills / Experience switcher.
Each entry has a unique lowercase `id`, bilingual `title`, and bilingual `body`
paths relative to `src/content/`, for example:

```json
{
  "id": "my-project",
  "title": { "en": "My project", "it": "Il mio progetto" },
  "body": {
    "en": "activities/my-project.en.md",
    "it": "activities/my-project.it.md"
  },
  "image": {
    "src": "images/my-project.jpg",
    "alt": { "en": "Project description", "it": "Descrizione del progetto" }
  }
}
```

Keep Markdown files in the matching `competences/` or `activities/` folder.
The optional `image.src` is relative to `src/assets/`; omit the entire `image`
object for a text-only entry. Markdown and images remain separate files.
Both language versions are required. The build checks IDs, paths, translations,
and missing files, and converts Markdown to sanitized HTML. Headings, lists,
links, images, block quotes, code blocks and tables are supported. Use full HTTPS
URLs or site-relative URLs for links/images inside Markdown (not paths relative
to the source `.md` file).

All entries start collapsed and expand independently. Switching groups preserves
their open state; without JavaScript, both groups are visible and collapsible.
The reusable disclosure is in `src/components/content-card.mjs`, with shared
card styles in `src/assets/content-card.css`; page markup is
in `src/pages/competences.mjs`, with its page styles and switcher in
`src/assets/competences.css` and `src/assets/competences.js`.
The running local preview updates automatically after content edits.

### Tool logos beside card titles

Competence, activity, project and certificate entries accept an optional `logos`
array, for example `"logos": ["cplusplus"]` or
`"logos": ["stm32", "solidworks"]`. Logo IDs refer to
`src/content/tool-logos.json`, which maps each ID to a local asset and readable
label. Labels can be a shared string for tool names or an `en`/`it` object for
translated descriptions. Omit `logos` when no particular tool is relevant.

Logos appear at 32px to the left of the title, including when a card is collapsed.
Mixed disciplines can display more than one logo; title text wraps independently.
White backgrounds keep the original artwork visible in both color themes.
The build rejects unknown or duplicate logo IDs and missing image files.
Downloaded artwork and attribution files live in `src/assets/logos/`; see its
README for original sources. The large content image remains a separate field.

## Current projects

The Current projects page is available at `/en/projects/` and `/it/projects/`,
in the navigation and in the links tree. It uses the same expandable cards,
responsive image layout and color themes as the other content pages.

Edit `src/content/projects.json` to add, remove or reorder projects:

```json
{
  "id": "my-project",
  "title": { "en": "My project", "it": "Il mio progetto" },
  "body": {
    "en": "projects/my-project.en.md",
    "it": "projects/my-project.it.md"
  },
  "image": {
    "src": "images/my-project.jpg",
    "alt": { "en": "Project preview", "it": "Anteprima del progetto" }
  },
  "href": "https://example.com/my-project"
}
```

Keep descriptions in separate Markdown files inside `src/content/projects/`.
Both languages are required; Markdown uses the same sanitizer as competences.
Use the description to explain the goal, current work and next steps.
The `image` and HTTPS `href` are optional; omit them for a text-only project
or one without a public link. Image paths are relative to `src/assets/`.
IDs must be unique lowercase slugs. The build validates IDs, translations,
paths, images and project URLs. An empty array displays a translated empty state.

Replace the bracketed example, stock image and example.com URL with your own
project details. Page markup is in `src/pages/projects.mjs`, page styles are in
`src/assets/projects.css`, and cards reuse `src/components/content-card.mjs`.
Run `npm run check` after edits.

## Certificates

Edit `src/content/certificates.json` to add, remove or reorder certificates.
Each entry uses the same expandable card as the competences page, with a title,
description, optional image and link. For example:

```json
{
  "id": "my-certificate",
  "title": { "en": "Certificate title", "it": "Titolo del certificato" },
  "description": {
    "en": "Issuer, date and what the qualification covers.",
    "it": "Ente, data e contenuti della qualifica."
  },
  "image": {
    "src": "images/my-certificate.jpg",
    "alt": { "en": "Certificate preview", "it": "Anteprima del certificato" }
  },
  "href": "https://example.com/my-certificate"
}
```

Use a unique lowercase `id` and provide both languages for the title,
description and image description. Descriptions support inline Markdown. Image paths
are relative to `src/assets/`. The `href` can be a full HTTPS URL or a local
asset path such as `certificates/my-certificate.pdf` (place the PDF inside
`src/assets/certificates/`). Local links work when hosted under a subdirectory.
The build checks translations, IDs, URLs and local files.

Both languages include the verified Maya credential and Big Global Challenges
badge, with matching title icons. An empty array displays a translated
empty state. Cards open independently and work without JavaScript.
The reusable certificate block is in `src/components/certificate-card.mjs`;
page markup and styles are in `src/pages/certificates.mjs` and
`src/assets/certificates.css`. The running local preview updates automatically.

## Home page

Edit the home object in each language's content file. Its items list controls the Currently rows and its links list controls the next-step links. Omit `projectAlt` to hide the stock project photo, and leave `portraitCaption` empty to omit the portrait caption. Home-only markup lives in src/pages/home.mjs; shared navigation remains in src/layout.mjs. Styling uses named color variables at the top of src/assets/site.css.

### Inline links in JSON

Use Markdown links directly inside supported prose fields, for example in
`home.items[].text`:

```json
{
  "label": "Learning",
  "text": "Alongside my degree, I follow the [INTRAPRENDENTI](https://www.polito.it/didattica/polito-learning-experiences/learning-experiences-in-interdisciplinarity/percorso-intraprendenti) honours track."
}
```

Inline Markdown works in the home headline, introduction, Currently introduction,
item text and photo captions; competence/project/certificate introductions and
empty states; certificate descriptions; and the CV viewer introduction and
fallback message. Links, emphasis and inline code are rendered at build time
using `src/inline-markdown.mjs`. HTML is escaped, images are not embedded, and
unsafe link protocols are removed. HTTPS, HTTP, email, phone and relative links
are supported. Use full HTTPS URLs or site-relative paths for predictable routing.

Navigation, headings, labels, image alt text, links-tree entries and descriptions
inside already clickable home cards remain plain text. Their dedicated `href`
or `page` properties still control navigation. The printable LaTeX CV is edited
separately and continues to print its URLs as text.

## Images and icons

Replace `src/assets/images/portrait-placeholder.jpg` with your portrait and
`src/assets/images/project-placeholder.jpg` with a project photo. Update the
image descriptions and captions in both language files (`home.portraitAlt`,
`home.portraitCaption`, `home.projectAlt`, `home.projectCaption`). If image
proportions change, update their dimensions in `src/pages/home.mjs` too.

Temporary photos downloaded from Lorem Picsum:

- https://picsum.photos/id/64/640/800
- https://picsum.photos/id/180/1000/600

Icons are downloaded SVGs from https://lucide.dev and stored in
`src/assets/icons/`, with the upstream license alongside them. They require
no browser JavaScript or third-party requests. To add an icon, download its
SVG from the Lucide library and reference its filename in the home template.

## Color themes

The navbar switch remembers a light/dark preference in the browser. Without a saved preference, the site follows the system theme. Theme behavior is in src/assets/theme.js, palettes are at the bottom of src/assets/site.css, and button labels are in each language file. Printing always uses light colors.

## Find-everything tree

Edit `src/content/links-tree.json` to change the whole tree. Each node needs a
unique `id`, an `icon` (the filename without `.svg` in `src/assets/icons/`),
and `name` with `it` and `en` text. Branches contain a `children` array.
Leaves contain a short bilingual `description` and either:

- `page`: a site page ID such as `home`, `cv`, or `competences`.
- `href`: an external `https://` URL, `mailto:` address, or `tel:` link.

Replace the example.com links with your real profiles and contacts. The build
checks IDs, translations, links and icon files. One JSON file drives both the
interactive graph and the HTML list, which works without JavaScript.

Interactions: click branches to animate expansion/collapse, drag nodes to pull
the connected spring links, pan the background, and scroll/pinch to zoom.
Nodes are released on drop so momentum travels through the tree. Reset layout
restores the initial arrangement; Fit to view recenters the map. Expand/collapse state and
positions last for the current page visit. The list offers keyboard-friendly
navigation. Reduced-motion settings disable the ongoing force animation.

Implementation: `src/pages/links.mjs` renders the page;
`src/assets/links-tree.js` handles the graph; `src/assets/links-tree.css`
handles its appearance. D3 7.9.0 is stored locally in `src/assets/vendor/`
with its license. No installation or external browser requests are needed.
