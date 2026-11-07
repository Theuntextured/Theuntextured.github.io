import { name } from '../site.mjs';

// Home-only markup. All editable copy lives in src/content/{language}.json.
export function renderHome(home, url, escape) {
  const asset = path => `../assets/${path}`;
  const icon = name => `<img class="icon" src="${asset(`icons/${name}.svg`)}" width="20" height="20" alt="" aria-hidden="true">`;
  return `
    <section class="intro" aria-labelledby="intro-title">
      <div class="intro-text">
      <p class="eyebrow">${escape(home.eyebrow)}</p>
      <h1 id="intro-title">${name}<span class="accent">.</span></h1>
      <p class="intro-headline placeholder">${escape(home.headline)}</p>
      <p class="intro-copy placeholder">${escape(home.intro)}</p>
      </div>
      <figure class="portrait">
        <img src="${asset('images/portrait-placeholder.jpg')}" width="640" height="800" alt="${escape(home.portraitAlt)}" fetchpriority="high">
        <figcaption>${icon('image')}${escape(home.portraitCaption)}</figcaption>
      </figure>
    </section>
    <section class="currently" aria-labelledby="currently-title">
      <div class="section-heading">
        <h2 id="currently-title">${escape(home.nowTitle)}</h2>
        <p>${escape(home.nowIntro)}</p>
        <figure class="project-photo">
          <img src="${asset('images/project-placeholder.jpg')}" width="1000" height="600" alt="${escape(home.projectAlt)}" loading="lazy">
          <figcaption>${escape(home.projectCaption)}</figcaption>
        </figure>
      </div>
      <dl class="current-list">
        ${home.items.map((item, index) => `<div class="current-item">
          <dt>${icon(['graduation-cap', 'wrench', 'compass'][index % 3])}${escape(item.label)}</dt>
          <dd class="placeholder">${escape(item.text)}</dd>
        </div>`).join('')}
      </dl>
    </section>
    <section class="explore" aria-labelledby="explore-title">
      <h2 id="explore-title">${escape(home.exploreTitle)}</h2>
      <div class="explore-links">
        ${home.links.map(link => `<a class="explore-link" href="${url(link.page)}">
          <span class="link-title"><span class="link-label">${icon({competences: 'wrench', cv: 'file-text', links: 'link'}[link.page] || 'link')}${escape(link.title)}</span>${icon('arrow-up-right')}</span>
          <span class="link-description">${escape(link.description)}</span>
        </a>`).join('')}
      </div>
    </section>`;
}
