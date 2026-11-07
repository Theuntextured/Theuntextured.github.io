// Semantic list and interactive graph share one validated JSON source.
export function renderLinks(tree, copy, lang, url, escape, root) {
  const label = node => escape(node.name[lang]);
  const icon = node => `<img class="icon" src="${root}assets/icons/${node.icon}.svg" width="20" height="20" alt="">`;
  const list = node => node.children
    ? `<li><details open><summary>${icon(node)}${label(node)}</summary><ul>${node.children.map(list).join('')}</ul></details></li>`
    : `<li>${icon(node)}<a href="${escape(node.page ? url(node.page) : node.href)}">${label(node)}</a><p>${escape(node.description[lang])}</p></li>`;
  const payload = JSON.stringify(tree).replaceAll('<', '\\u003c');
  return `<div class="links-topbar"><h1>${escape(copy.links.title)}</h1><button type="button" class="tree-view-toggle" data-tree-view-toggle data-list-label="${escape(copy.links.textView)}" data-tree-label="${escape(copy.links.treeView)}" aria-controls="links-graph links-list" hidden>${escape(copy.links.textView)}</button></div>
    <div id="links-graph" class="tree-interactive" hidden>
      <div class="tree-toolbar" role="group" aria-label="${escape(copy.links.graph)}">
        ${['expand','collapse','fit','reset'].map(action => `<button type="button" data-tree-action="${action}">${escape(copy.links[action])}</button>`).join('')}
        <span class="zoom-controls">${['zoomOut','zoomIn'].map((action,index) => `<button type="button" data-tree-action="${action}" aria-label="${escape(copy.links[action])}" title="${escape(copy.links[action])}"><img class="icon" src="${root}assets/icons/${index ? 'plus' : 'minus'}.svg" width="20" height="20" alt=""></button>`).join('')}</span>
      </div>
      <p id="tree-instructions" class="tree-hint">${escape(copy.links.hint)}</p>
      <svg class="links-tree" aria-label="${escape(copy.links.graph)}" aria-describedby="tree-instructions"></svg>
    </div>
    <section id="links-list" class="tree-list" aria-label="${escape(copy.links.list)}"><ul>${list(tree)}</ul></section>
    <script type="application/json" id="links-tree-data">${payload}</script>
    <script defer src="${root}assets/vendor/d3.min.js"></script>
    <script defer src="${root}assets/links-tree.js"></script>`;
}
