# Printable CV

Edit `cv/en.tex` and `cv/it.tex` for the English and Italian CV content.
`cv/layout.tex` defines their shared A4 layout. These LaTeX files are the source
of truth for the printable documents; the website's language JSON files contain
only the PDF viewer labels. Keep the two documents in sync when updating facts.

The PDF contains no hyperlinks. Contact details and complete profile, project,
credential and document addresses are printed as readable text, so they remain
usable on paper. Keep every address visible when updating the LaTeX source.

`npm run build` compiles each document with `pdflatex` twice, publishes the PDFs
at `dist/assets/cv/riccardo-giorgi-en.pdf` and
`dist/assets/cv/riccardo-giorgi-it.pdf`, and embeds them on `/en/cv/` and
`/it/cv/`. Both pages offer download and open links, including a fallback for browsers without
embedded PDF support. Use the PDF viewer's print controls to print the document.
`npm start` also watches `cv/` and rebuilds when the source changes.

Install TeX Live with the recommended LaTeX packages, extra LaTeX packages and
recommended fonts. On Debian/Ubuntu:

```sh
sudo apt install texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-lang-italian lmodern
```

Compilation uses temporary directories, cleans auxiliary files and disables
shell escape. Missing tools or LaTeX errors fail the website build with a
diagnostic instead of serving a substitute document. Generated PDFs stay in
the ignored `dist/` directory and should not be committed.

`scripts/build-cv.mjs` handles compilation. `src/pages/cv.mjs` and
`src/assets/cv.css` implement the embedded viewer. A language's CV is built when
its content file has a `cv` object, from the corresponding `cv/<language>.tex`.
Italian hyphenation is provided by Babel and `texlive-lang-italian`. Both CVs
currently fit two pages. The Pages workflow installs the dependencies, checks
the source, builds both documents and deploys them with the website.

The English home, skills, experience, projects, certificates and links were
populated from these public sources on 16 November 2026:

- https://riccardogiorgi.tech/en/
- https://riccardogiorgi.tech/en/skills/
- https://riccardogiorgi.tech/en/cv/
- https://riccardogiorgi.tech/en/experience/team-icarus/

The documents also incorporate subsequent user updates: the firmware role from
October 2026, English C2 and French B2, the Global Challenges badge, the current
game project, chess ratings, driving licences and VAT registration. The Team
Icarus entry describes responsibilities without
claiming flight-test results or guessing the project's latest integration stage.
The Italian document translates the same information as the English document.
