import { pages, languages, name } from './site.mjs';
import { renderHome } from './pages/home.mjs';
import { renderLinks } from './pages/links.mjs';
import { renderCompetences } from './pages/competences.mjs';
import { renderCertificates } from './pages/certificates.mjs';
import { renderProjects } from './pages/projects.mjs';

const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');

const pageStyles = {
  links: ['links-tree.css'],
  competences: ['content-card.css', 'competences.css'],
  certificates: ['content-card.css', 'certificates.css'],
  projects: ['content-card.css', 'projects.css'],
};

const pageClasses = {
  home: 'home',
  links: 'links-page',
  competences: 'competences-page',
  certificates: 'certificates-page',
  projects: 'projects-page',
};

export function render(
  lang,
  page,
  copy,
  tree,
  competences,
  certificates,
  projects,
) {
  const root = page === 'home' ? '../' : '../../';
  const url = (language, id) =>
    root + language + '/' + (id === 'home' ? '' : id + '/');
  const otherLanguage = languages.find((language) => language !== lang);
  const languageLabel =
    lang === 'it' ? 'Switch to English' : 'Passa a italiano';

  let content;
  switch (page) {
    case 'home':
      content = renderHome(copy.home, (id) => url(lang, id), escape);
      break;
    case 'links':
      content = renderLinks(
        tree,
        copy,
        lang,
        (id) => url(lang, id),
        escape,
        root,
      );
      break;
    case 'competences':
      content = renderCompetences(competences, copy, escape, root);
      break;
    case 'certificates':
      content = renderCertificates(certificates, copy, escape, root);
      break;
    case 'projects':
      content = renderProjects(projects, copy, escape, root);
      break;
    default:
      content = /* HTML */ `<h1>${escape(copy.pages[page])}</h1>
        <p>${escape(copy.placeholder)}</p>`;
  }

  const styles = (pageStyles[page] || [])
    .map(
      (file) =>
        /* HTML */ `<link rel="stylesheet" href="${root}assets/${file}" />`,
    )
    .join('');
  const navigation = pages
    .map(
      (id) =>
        /* HTML */ `<a
          href="${url(lang, id)}"
          ${id === page ? ' aria-current="page"' : ''}
          >${escape(copy.pages[id])}</a
        >`,
    )
    .join('');

  return /* HTML */ `<!doctype html>
    <html lang="${lang}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escape(copy.pages[page])} | ${name}</title>
        <script src="${root}assets/theme.js"></script>
        <link rel="stylesheet" href="${root}assets/site.css" />
        ${styles}
      </head>
      <body class="${page === 'links' ? 'links-screen' : ''}">
        <a class="skip" href="#main">${copy.skip}</a>
        <header>
          <a class="name" href="${url(lang, 'home')}">${name}</a>
          <nav aria-label="${copy.navigation}">${navigation}</nav>
          <div class="header-controls">
            <a
              class="language-toggle"
              href="${url(otherLanguage, page)}"
              lang="${otherLanguage}"
              hreflang="${otherLanguage}"
              aria-label="${languageLabel}"
              title="${languageLabel}"
            >
              <img
                class="flag"
                src="${root}assets/icons/flag-${lang === 'it' ? 'it' : 'gb'}.svg"
                width="24"
                height="16"
                alt=""
              />
            </a>
            <button
              class="theme-toggle"
              type="button"
              data-theme-toggle
              data-light-label="${escape(copy.theme.light)}"
              data-dark-label="${escape(copy.theme.dark)}"
              aria-label="${escape(copy.theme.dark)}"
              title="${escape(copy.theme.dark)}"
              hidden
            >
              <span class="theme-indicator" aria-hidden="true">
                <img
                  class="icon"
                  data-theme-icon="sun"
                  src="${root}assets/icons/sun.svg"
                  width="20"
                  height="20"
                  alt=""
                  hidden
                />
                <img
                  class="icon"
                  data-theme-icon="moon"
                  src="${root}assets/icons/moon.svg"
                  width="20"
                  height="20"
                  alt=""
                />
              </span>
            </button>
          </div>
        </header>
        <main id="main" class="${pageClasses[page] || 'stub'}">${content}</main>
      </body>
    </html>`;
}
