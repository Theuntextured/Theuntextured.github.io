import { renderContentCard } from '../components/content-card.mjs';
import { renderInline } from '../inline-markdown.mjs';

export function renderCompetences(groups, copy, escape, root) {
  const labels = copy.competences;
  const buttons = Object.keys(groups)
    .map(
      (group, index) => /* HTML */ `
        <button
          type="button"
          id="switch-${group}"
          data-content-group="${group}"
          aria-controls="group-${group}"
          aria-pressed="${index === 0}"
        >
          ${escape(labels[group])}<span class="group-count"
            >${groups[group].length}</span
          >
        </button>
      `,
    )
    .join('');

  const sections = Object.entries(groups)
    .map(([group, items]) => {
      const cards = items.length
        ? items.map((item) => renderContentCard(item, escape, root)).join('')
        : /* HTML */ `<p>${renderInline(labels.empty)}</p>`;

      return /* HTML */ `
        <section
          class="content-group"
          id="group-${group}"
          aria-labelledby="heading-${group}"
        >
          <div class="content-group-heading">
            <h2 id="heading-${group}">${escape(labels[group])}</h2>
            <p>${renderInline(labels[`${group}Intro`])}</p>
          </div>
          <div class="content-cards">${cards}</div>
        </section>
      `;
    })
    .join('');

  return /* HTML */ `
    <div class="competences-heading">
      <p class="eyebrow">${escape(labels.eyebrow)}</p>
      <h1>${escape(copy.pages.competences)}</h1>
      <p>${renderInline(labels.intro)}</p>
    </div>
    <div
      class="group-switcher"
      data-group-switcher
      role="group"
      aria-label="${escape(labels.groupBy)}"
      hidden
    >
      ${buttons}
    </div>
    ${sections}
    <script defer src="${root}assets/competences.js"></script>
  `;
}
