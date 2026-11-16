import { renderContentCard } from './content-card.mjs';
import { renderInline } from '../inline-markdown.mjs';

export function renderCertificateCard(item, labels, escape, root) {
  return renderContentCard(
    {
      ...item,
      html: /* HTML */ `<p>${renderInline(item.description)}</p>`,
      link: {
        href: item.href.startsWith('https://')
          ? item.href
          : `${root}assets/${item.href}`,
        label: labels.view,
      },
    },
    escape,
    root,
  );
}
