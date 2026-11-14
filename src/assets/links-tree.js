/* D3 handles the physics and gestures; content comes from links-tree.json. */
(() => {
  const container = document.querySelector('.tree-interactive');
  if (!container || !window.d3) {
    return;
  } // The HTML list remains usable without JS.
  const data = JSON.parse(
    document.getElementById('links-tree-data').textContent,
  );
  const lang = document.documentElement.lang;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const expanded = new Set([data.id, 'website']);
  const positions = new Map();
  const chains = new Map();
  const allBranches = [];
  const collect = (node) => {
    if (node.children) {
      allBranches.push(node.id);
      node.children.forEach(collect);
    }
  };
  collect(data);
  const svg = d3.select('.links-tree');
  const world = svg.append('g');
  const edges = world.append('g').attr('class', 'tree-edges');
  const cards = world.append('g');
  const duration = reduced ? 0 : 420;
  let visible = [],
    edgeSelection,
    flowSelection,
    nodeSelection;
  let width = 1000,
    height = 650;
  const zoom = d3
    .zoom()
    .scaleExtent([0.15, 2.5])
    .on('start', (event) => {
      if (event.sourceEvent) {
        simulation.on('end.fit', null);
      }
    })
    .on('zoom', (event) => world.attr('transform', event.transform));
  svg.call(zoom).on('dblclick.zoom', null);
  const simulation = d3
    .forceSimulation()
    .stop()
    .velocityDecay(0.24)
    .force(
      'link',
      d3
        .forceLink()
        .id((node) => node.id)
        .distance(52)
        .strength(0.4),
    )
    .force(
      'charge',
      d3.forceManyBody().strength((node) => (node.joint ? 0 : -260)),
    )
    .force(
      'collide',
      d3.forceCollide((node) => (node.joint ? 0 : 32)).strength(0.5),
    )
    // Gentle orientation only; links, not fixed slots, hold the tree together.
    .force(
      'x',
      d3
        .forceX((node) => node.targetX || 0)
        .strength((node) => (node.joint ? 0 : 0.009)),
    )
    .force(
      'y',
      d3
        .forceY((node) => node.targetY || 0)
        .strength((node) => (node.joint ? 0 : 0.012)),
    );
  // Physics joints transmit movement, but wires stay clean between endpoints.
  const wire = (source, target) =>
    `M${source.x},${source.y} L${target.x},${target.y}`;
  function draw() {
    nodeSelection
      .attr('x', (node) => node.x - (node.children ? 118 : 16))
      .attr('y', (node) => node.y - (node.children ? 24 : 16));
    edgeSelection.attr('d', (edge) => wire(edge.source, edge.target));
    flowSelection.attr('d', (edge) => wire(edge.source, edge.target));
  }
  simulation.on('tick', draw);
  const drag = d3
    .drag()
    .clickDistance(6)
    .on('start', (event, node) => {
      simulation.on('end.fit', null);
      if (!event.active && !reduced) {
        simulation.alphaTarget(0.35).restart();
      }
      node.fx = node.x;
      node.fy = node.y;
    })
    .on('drag', (event, node) => {
      node.fx = node.x = event.x;
      node.fy = node.y = event.y;
      if (reduced) {
        draw();
      }
    })
    .on('end', (event, node) => {
      // Release the node so momentum travels back through the whole chain.
      node.fx = null;
      node.fy = null;
      if (!event.active) {
        simulation.alphaTarget(0);
      }
    });
  function rebuild(initial = false) {
    simulation.stop();
    const previousIds = new Set(visible.map((node) => node.id));
    const hierarchy = d3.hierarchy(data, (node) =>
      expanded.has(node.id) ? node.children : null,
    );
    d3.tree().nodeSize([100, 290])(hierarchy);
    visible = hierarchy.descendants().map((item) => {
      let node = positions.get(item.data.id);
      if (!node) {
        node = { ...item.data, x: item.y, y: item.x };
        positions.set(node.id, node);
      }
      if (!initial && !visible.includes(node)) {
        const parent = positions.get(item.parent?.data.id);
        if (parent) {
          node.x = parent.x + 4;
          node.y = parent.y + (item.x >= 0 ? 4 : -4);
          node.vx = 0;
          node.vy = 0;
        }
      }
      node.parentId = item.parent?.data.id;
      node.targetX = item.y;
      node.targetY = item.x;
      return node;
    });
    const links = hierarchy.links().map((edge) => ({
      source: positions.get(edge.source.data.id),
      target: positions.get(edge.target.data.id),
    }));
    const joints = [],
      springs = [];
    for (const edge of links) {
      if (!previousIds.has(edge.target.id)) {
        chains.delete(edge.target.id);
      }
      let particles = chains.get(edge.target.id);
      if (!particles) {
        particles = Array.from({ length: 3 }, (_, index) => {
          const t = (index + 1) / 4;
          return {
            id: `joint:${edge.target.id}:${index}`,
            joint: true,
            x: edge.source.x + (edge.target.x - edge.source.x) * t,
            y: edge.source.y + (edge.target.y - edge.source.y) * t,
          };
        });
        chains.set(edge.target.id, particles);
      }
      edge.chain = [edge.source, ...particles, edge.target];
      joints.push(...particles);
      edge.chain
        .slice(1)
        .forEach((target, index) =>
          springs.push({ source: edge.chain[index], target }),
        );
    }
    const visibleIds = new Set(visible.map((node) => node.id));
    const ancestor = (node) => {
      while (!visibleIds.has(node.id) && node.parentId) {
        node = positions.get(node.parentId);
      }
      return node;
    };
    const joinWires = (className) =>
      edges
        .selectAll(`path.${className}`)
        .data(links, (edge) => edge.target.id)
        .join(
          (enter) =>
            enter
              .append('path')
              .attr('class', className)
              .attr('aria-hidden', 'true')
              .attr('opacity', 0)
              .call((selection) =>
                selection
                  .transition('visibility')
                  .duration(duration)
                  .attr('opacity', 1),
              ),
          (update) => update.interrupt('visibility').attr('opacity', 1),
          (exit) =>
            exit
              .transition('visibility')
              .duration(duration)
              .attr('opacity', 0)
              .attr('d', (edge) =>
                wire(ancestor(edge.target), ancestor(edge.target)),
              )
              .remove(),
        );
    edgeSelection = joinWires('tree-wire');
    // A separate dashed overlay keeps the underlying connection continuous.
    // Paths always run source (parent) → target (child), regardless of position.
    flowSelection = joinWires('tree-flow');
    nodeSelection = cards
      .selectAll('foreignObject')
      .data(visible, (node) => node.id)
      .join(
        (enter) => {
          const objects = enter
            .append('foreignObject')
            .attr('width', 240)
            .attr('height', 72)
            .attr('opacity', 0);
          objects.each(function (node) {
            const card = document.createElementNS(
              'http://www.w3.org/1999/xhtml',
              node.children ? 'button' : 'a',
            );
            card.className = 'tree-node';
            if (node.children) {
              const outline = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
              );
              outline.setAttribute('class', 'tree-category-outline');
              outline.setAttribute('viewBox', '0 0 236 48');
              outline.setAttribute('aria-hidden', 'true');
              const polygon = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'polygon',
              );
              polygon.setAttribute(
                'points',
                '15,1 221,1 235,24 221,47 15,47 1,24',
              );
              outline.append(polygon);
              card.append(outline);
              card.type = 'button';
              card.addEventListener('click', () => {
                expanded.has(node.id)
                  ? expanded.delete(node.id)
                  : expanded.add(node.id);
                rebuild();
              });
            } else {
              card.href = node.page
                ? `../../${lang}/${node.page === 'home' ? '' : node.page + '/'}`
                : node.href;
            }
            const icon = document.createElement('img');
            icon.src = `../../assets/icons/${node.icon}.svg`;
            icon.alt = '';
            icon.className = 'icon';
            icon.width = icon.height = 20;
            const text = document.createElement('span');
            text.className = 'tree-node-copy';
            const title = document.createElement('span');
            title.className = 'tree-node-title';
            title.textContent = node.name[lang];
            text.append(title);
            if (!node.children) {
              const description = document.createElement('span');
              description.className = 'tree-node-description';
              description.textContent = node.description[lang];
              text.append(description);
            }
            const point = document.createElement('span');
            point.className = 'tree-point';
            point.append(icon);
            card.append(point, text);
            if (node.children) {
              const marker = document.createElement('span');
              marker.className = 'tree-marker';
              marker.setAttribute('aria-hidden', 'true');
              card.append(marker);
            }
            this.append(card);
          });
          objects
            .transition('visibility')
            .duration(duration)
            .attr('opacity', 1);
          return objects;
        },
        (update) => update.interrupt('visibility').attr('opacity', 1),
        (exit) =>
          exit
            .transition('visibility')
            .duration(duration)
            .attr('opacity', 0)
            .attr('x', (node) => ancestor(node).x - (node.children ? 118 : 16))
            .attr('y', (node) => ancestor(node).y - (node.children ? 24 : 16))
            .remove(),
      )
      .call(drag);
    nodeSelection.each(function (node) {
      if (!node.children) {
        return;
      }
      this.firstChild.setAttribute(
        'aria-expanded',
        String(expanded.has(node.id)),
      );
      this.querySelector('.tree-marker').textContent = expanded.has(node.id)
        ? '−'
        : '+';
    });
    // Remove old springs before reindexing; hidden particles leave the simulation.
    simulation.force('link').links([]);
    simulation.nodes([...visible, ...joints]);
    simulation.force('link').links(springs);
    simulation.alpha(0.8).on('end.fit', null);
    if (reduced) {
      simulation.stop().tick(100);
      draw();
    } else {
      draw();
      simulation.restart();
    }
  }
  function fit() {
    const minX = d3.min(visible, (node) => node.x - (node.children ? 135 : 35));
    const maxX = d3.max(visible, (node) => node.x) + 240;
    const minY = d3.min(visible, (node) => node.y) - 45;
    const maxY = d3.max(visible, (node) => node.y) + 75;
    const scale =
      Math.min(1.2, width / (maxX - minX), height / (maxY - minY)) * 0.9;
    const transform = d3.zoomIdentity
      .translate(
        width / 2 - (scale * (minX + maxX)) / 2,
        height / 2 - (scale * (minY + maxY)) / 2,
      )
      .scale(scale);
    svg.interrupt();
    (reduced ? svg : svg.transition().duration(350)).call(
      zoom.transform,
      transform,
    );
  }
  function resize() {
    if (!svg.node().clientWidth || !svg.node().clientHeight) {
      return;
    }
    width = svg.node().clientWidth;
    height = svg.node().clientHeight;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    fit();
  }
  container.hidden = false;
  const listView = document.querySelector('.tree-list');
  const viewToggle = document.querySelector('[data-tree-view-toggle]');
  listView.hidden = true;
  viewToggle.hidden = false;
  viewToggle.addEventListener('click', () => {
    const showList = listView.hidden;
    listView.hidden = !showList;
    container.hidden = showList;
    viewToggle.textContent = showList
      ? viewToggle.dataset.treeLabel
      : viewToggle.dataset.listLabel;
    if (showList) {
      simulation.stop();
    } else if (!reduced && simulation.alpha() > simulation.alphaMin()) {
      simulation.restart();
    }
  });
  rebuild(true);
  // Settle the first frame before fitting, so the map starts fully in view.
  simulation.stop().tick(100);
  draw();
  resize();
  new ResizeObserver(resize).observe(svg.node());
  container.querySelectorAll('[data-tree-action]').forEach((button) =>
    button.addEventListener('click', () => {
      const action = button.dataset.treeAction;
      if (action === 'expand' || action === 'collapse') {
        expanded.clear();
        expanded.add(data.id);
        if (action === 'expand') {
          allBranches.forEach((id) => expanded.add(id));
        }
        rebuild();
      } else if (action === 'reset') {
        positions.clear();
        chains.clear();
        rebuild(true);
        if (!reduced) {
          simulation.on('end.fit', fit);
        }
      } else if (action === 'fit') {
        fit();
      } else {
        (reduced ? svg : svg.transition().duration(200)).call(
          zoom.scaleBy,
          action === 'zoomIn' ? 1.3 : 1 / 1.3,
        );
      }
    }),
  );
})();
