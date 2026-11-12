# Riccardo Giorgi — personal website

Minimal bilingual static site. Requires Node.js 22+. Run `npm ci` once to install
the build-time Markdown renderer and HTML sanitizer.

## Local preview

Run `npm start`, then open http://localhost:3000. Restart after edits to rebuild.
Run `npm run build` to generate `dist/` for static hosting, including GitHub Pages.
Deployment is not configured yet.

## Editing guide

- `src/content/it.json`: Italian page titles and placeholder copy.
- `src/content/en.json`: English page titles and placeholder copy.
- `src/site.mjs`: name, languages, page IDs and navigation order.
- `src/layout.mjs`: shared HTML layout and navigation.
- `src/assets/`: shared styles and future static assets.
- `scripts/`: build and preview commands.
- `cv/`: future LaTeX sources and PDF automation.
- `dist/`: generated output; never edit or commit.

Both /it/ and /en/ contain Home, Links, Competences & activities, Certificates,
and Printable CV. The root opens Italian. Language switching preserves the
current page. Both languages share English URL slugs for predictable routing.

To add a page, add its ID to src/site.mjs and its title to both content files.
Navigation updates automatically. As real content is added, extend content
entries and the shared layout; keep translated copy out of scripts.

The example content uses bracketed writing prompts until real content is added.

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
The reusable disclosure is in `src/components/content-card.mjs`; page markup is
in `src/pages/competences.mjs`, with its styles and switcher in
`src/assets/competences.css` and `src/assets/competences.js`.
Run `npm run build` after content edits to update the running local preview.

## Home page

Edit the home object in each language's content file to replace the bracketed writing prompts. Its items list controls the Currently rows and its links list controls the next-step links. Home-only markup lives in src/pages/home.mjs; shared navigation remains in src/layout.mjs. Styling uses named color variables at the top of src/assets/site.css.


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
