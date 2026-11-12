// Reusable disclosure: only the title remains visible when collapsed.
export function renderContentCard(item, escape, root) {
  return `<details class="content-card" id="${escape(item.id)}">
    <summary><h3>${escape(item.title)}</h3><span class="disclosure-icon" aria-hidden="true"></span></summary>
    <div class="content-card-body${item.image ? ' has-image' : ''}">
      <div class="markdown-body">${item.html}</div>
      ${item.image ? `<img class="content-card-image" src="${root}assets/${escape(item.image.src)}" alt="${escape(item.image.alt)}" loading="lazy">` : ''}
    </div>
  </details>`;
}
