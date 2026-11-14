// Reusable disclosure: only the title remains visible when collapsed.
export function renderContentCard(item, escape, root) {
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
      <h3>${escape(item.title)}</h3>
      <span class="disclosure-icon" aria-hidden="true"></span>
    </summary>
    <div class="content-card-body${item.image ? ' has-image' : ''}">
      <div class="markdown-body">${item.html}${link}</div>
      ${image}
    </div>
  </details>`;
}
