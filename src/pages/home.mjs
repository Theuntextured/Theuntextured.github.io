import { name } from '../site.mjs';
import { renderInline } from '../inline-markdown.mjs';

// Home-only markup. All editable copy lives in src/content/{language}.json.
export function renderHome(home, url, escape) {
  const asset = (path) => `../assets/${path}`;
  const icon = (name) =>
    /* HTML */ `<img
      class="icon"
      src="${asset(`icons/${name}.svg`)}"
      width="20"
      height="20"
      alt=""
      aria-hidden="true"
    />`;
  const currentItems = home.items
    .map(
      (item, index) =>
        /* HTML */ `<div class="current-item">
          <dt>
            ${icon(['graduation-cap', 'wrench', 'compass'][index % 3])}${escape(item.label)}
          </dt>
          <dd>${renderInline(item.text)}</dd>
        </div>`,
    )
    .join('');
  const details = (home.details || [])
    .map(
      (item) =>
        /* HTML */ `<div>
          <dt>${escape(item.label)}</dt>
          <dd>${escape(item.text)}</dd>
        </div>`,
    )
    .join('');
  const linkIcons = { competences: 'wrench', cv: 'file-text', links: 'link' };
  const exploreLinks = home.links
    .map(
      (link) =>
        /* HTML */ `<a class="explore-link" href="${url(link.page)}">
          <span class="link-title"
            ><span class="link-label"
              >${icon(linkIcons[link.page] || 'link')}${escape(link.title)}</span
            >${icon('arrow-up-right')}</span
          >
          <span class="link-description">${escape(link.description)}</span>
        </a>`,
    )
    .join('');

  return /* HTML */ ` <section class="intro" aria-labelledby="intro-title">
      <div class="intro-text">
        <p class="eyebrow">${escape(home.eyebrow)}</p>
        <h1 id="intro-title">${name}<span class="accent">.</span></h1>
        <p class="intro-headline">${renderInline(home.headline)}</p>
        <p class="intro-copy">${renderInline(home.intro)}</p>
        ${details ? /* HTML */ `<dl class="intro-details">${details}</dl>` : ''}
      </div>
      <figure class="portrait">
        <img
          src="${asset('images/portrait.png')}"
          width="640"
          height="800"
          alt="${escape(home.portraitAlt)}"
          fetchpriority="high"
        />
        ${home.portraitCaption ? /* HTML */ `<figcaption>${icon('image')}${renderInline(home.portraitCaption)}</figcaption>` : ''}
      </figure>
    </section>
    <section class="currently" aria-labelledby="currently-title">
      <div class="section-heading">
        <h2 id="currently-title">${escape(home.nowTitle)}</h2>
        <p>${renderInline(home.nowIntro)}</p>
        ${
          home.projectAlt
            ? /* HTML */ `<figure class="project-photo">
                <img
                  src="${asset('images/project-placeholder.jpg')}"
                  width="1000"
                  height="600"
                  alt="${escape(home.projectAlt)}"
                  loading="lazy"
                />
                <figcaption>${renderInline(home.projectCaption)}</figcaption>
              </figure>`
            : ''
        }
      </div>
      <dl class="current-list">${currentItems}</dl>
    </section>
    <section class="explore" aria-labelledby="explore-title">
      <h2 id="explore-title">${escape(home.exploreTitle)}</h2>
      <div class="explore-links">${exploreLinks}</div>
    </section>`;
}
