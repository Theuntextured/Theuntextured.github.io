import { renderContentCard } from '../components/content-card.mjs';

export function renderCompetences(groups, copy, escape, root) {
  const labels = copy.competences;
  return `<div class="competences-heading">
    <p class="eyebrow">${escape(labels.eyebrow)}</p>
    <h1>${escape(copy.pages.competences)}</h1>
    <p>${escape(labels.intro)}</p>
  </div>
  <div class="group-switcher" data-group-switcher role="group" aria-label="${escape(labels.groupBy)}" hidden>
    ${Object.keys(groups).map((group, index) => `<button type="button" id="switch-${group}" data-content-group="${group}" aria-controls="group-${group}" aria-pressed="${index === 0}">${escape(labels[group])}<span class="group-count">${groups[group].length}</span></button>`).join('')}
  </div>
  ${Object.entries(groups).map(([group, items]) => `<section class="content-group" id="group-${group}" aria-labelledby="heading-${group}">
    <div class="content-group-heading"><h2 id="heading-${group}">${escape(labels[group])}</h2><p>${escape(labels[`${group}Intro`])}</p></div>
    <div class="content-cards">${items.length ? items.map(item => renderContentCard(item, escape, root)).join('') : `<p>${escape(labels.empty)}</p>`}</div>
  </section>`).join('')}
  <script defer src="${root}assets/competences.js"></script>`;
}
