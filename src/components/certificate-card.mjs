import { renderContentCard } from './content-card.mjs';

export function renderCertificateCard(item, labels, escape, root) {
  return renderContentCard(
    {
      ...item,
      html: /* HTML */ `<p>${escape(item.description)}</p>`,
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
