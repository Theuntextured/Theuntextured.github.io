import { renderInline } from '../inline-markdown.mjs';

export function renderCV(cv, escape, root, lang) {
  const pdf = `${root}assets/cv/riccardo-giorgi-${lang}.pdf`;

  return /* HTML */ `<section class="cv-document" aria-labelledby="cv-title">
    <div class="cv-heading">
      <p class="eyebrow">${escape(cv.eyebrow)}</p>
      <h1 id="cv-title">${escape(cv.title)}</h1>
      <p>${renderInline(cv.intro)}</p>
      <div class="cv-actions">
        <a href="${pdf}" download>${escape(cv.download)}</a>
        <a href="${pdf}" target="_blank" rel="noopener">${escape(cv.open)}</a>
      </div>
    </div>
    <object
      class="cv-pdf"
      data="${pdf}#view=FitH"
      type="application/pdf"
      aria-label="${escape(cv.pdfTitle)}"
    >
      <p>
        ${renderInline(cv.fallback)}
        <a href="${pdf}">${escape(cv.open)}</a>
      </p>
    </object>
  </section>`;
}
