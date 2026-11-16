// Reusable disclosure: only the title remains visible when collapsed.
export function renderContentCard(item, escape, root) {
  const logos = (item.logos || [])
    .map(
      (logo) =>
        /* HTML */ `<img
          class="content-card-logo"
          src="${root}assets/${escape(logo.src)}"
          alt="${escape(logo.label)}"
          title="${escape(logo.label)}"
          width="32"
          height="32"
        />`,
    )
    .join('');
  const link = item.link
    ? /* HTML */ `<p class="content-card-link">
        <a
          href="${escape(item.link.href)}"
          aria-label="${escape(`${item.link.label}: ${item.title}`)}"
          >${escape(item.link.label)}</a
        >
      </p>`
    : '';
  const image = item.image
    ? /* HTML */ `<img
        class="content-card-image"
        src="${root}assets/${escape(item.image.src)}"
        alt="${escape(item.image.alt)}"
        loading="lazy"
      />`
    : '';

  return /* HTML */ `<details class="content-card" id="${escape(item.id)}">
    <summary>
      <h3>
        ${logos ? /* HTML */ `<span class="content-card-logos">${logos}</span>` : ''}
        <span class="content-card-title">${escape(item.title)}</span>
      </h3>
      <span class="disclosure-icon" aria-hidden="true"></span>
    </summary>
    <div class="content-card-body${item.image ? ' has-image' : ''}">
      <div class="markdown-body">${item.html}${link}</div>
      ${image}
    </div>
  </details>`;
}
