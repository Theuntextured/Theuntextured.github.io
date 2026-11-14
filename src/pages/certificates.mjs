import { renderCertificateCard } from '../components/certificate-card.mjs';

export function renderCertificates(items, copy, escape, root) {
  const labels = copy.certificates;
  const cards = items.length
    ? items
        .map((item) => renderCertificateCard(item, labels, escape, root))
        .join('')
    : /* HTML */ `<p>${escape(labels.empty)}</p>`;

  return /* HTML */ `<div class="certificates-heading">
      <p class="eyebrow">${escape(labels.eyebrow)}</p>
      <h1>${escape(copy.pages.certificates)}</h1>
      <p>${escape(labels.intro)}</p>
    </div>
    <section
      class="certificates-list"
      aria-label="${escape(copy.pages.certificates)}"
    >
      <div class="content-cards">${cards}</div>
    </section>`;
}
