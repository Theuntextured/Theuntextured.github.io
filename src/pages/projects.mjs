import { renderContentCard } from '../components/content-card.mjs';
import { renderInline } from '../inline-markdown.mjs';

export function renderProjects(items, copy, escape, root) {
  const labels = copy.projects;
  const cards = items.length
    ? items
        .map((item) =>
          renderContentCard(
            {
              ...item,
              link: item.href ? { href: item.href, label: labels.view } : null,
            },
            escape,
            root,
          ),
        )
        .join('')
    : /* HTML */ `<p>${renderInline(labels.empty)}</p>`;

  return /* HTML */ `
    <div class="projects-heading">
      <p class="eyebrow">${escape(labels.eyebrow)}</p>
      <h1>${escape(copy.pages.projects)}</h1>
      <p>${renderInline(labels.intro)}</p>
    </div>
    <section class="projects-list" aria-label="${escape(copy.pages.projects)}">
      <div class="content-cards">${cards}</div>
    </section>
  `;
}
