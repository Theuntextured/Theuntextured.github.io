import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { pages, languages } from '../src/site.mjs';
import { render } from '../src/layout.mjs';
import { loadCompetences } from './competences-content.mjs';
import { loadCertificates } from './certificates-content.mjs';
import { loadProjects } from './projects-content.mjs';
import { contentLanguages } from './content-utils.mjs';
import { buildCV } from './build-cv.mjs';

const competences = await loadCompetences();
const certificates = await loadCertificates();
const projects = await loadProjects();
const tree = JSON.parse(await readFile('src/content/links-tree.json', 'utf8'));
const ids = new Set();

async function validate(node) {
  if (!node.id || ids.has(node.id)) {
    throw new Error('Tree IDs must be unique: ' + node.id);
  }
  ids.add(node.id);
  if (!/^[a-z0-9-]+$/.test(node.icon)) {
    throw new Error('Invalid icon name');
  }
  await readFile(`src/assets/icons/${node.icon}.svg`);
  for (const lang of contentLanguages(node)) {
    if (!node.name?.[lang]) {
      throw new Error(`Missing ${lang} name: ${node.id}`);
    }
  }
  if (node.children) {
    if (!node.children.length || node.href || node.page) {
      throw new Error('Branches need children, not links');
    }
    for (const child of node.children) {
      await validate(child);
    }
  } else {
    if (!!node.page === !!node.href) {
      throw new Error('Leaves need exactly one page or href');
    }
    if (node.page && !pages.includes(node.page)) {
      throw new Error('Unknown page: ' + node.page);
    }
    if (node.href && !/^(https?:\/\/|mailto:|tel:)/i.test(node.href)) {
      throw new Error('Unsupported link protocol');
    }
    for (const lang of contentLanguages(node)) {
      if (!node.description?.[lang]) {
        throw new Error('Missing leaf description');
      }
    }
  }
}

await validate(tree);
for (const lang of languages) {
  const copy = JSON.parse(
    await readFile('src/content/' + lang + '.json', 'utf8'),
  );
  if (copy.cv) {
    await buildCV(lang);
  }
  for (const page of pages) {
    const directory =
      'dist/' + lang + '/' + (page === 'home' ? '' : page + '/');
    await mkdir(directory, { recursive: true });
    await writeFile(
      directory + 'index.html',
      render(
        lang,
        page,
        copy,
        tree,
        competences[lang],
        certificates[lang],
        projects[lang],
      ),
    );
  }
}

await cp('src/assets', 'dist/assets', { recursive: true });
await writeFile(
  'dist/index.html',
  /* HTML */ `<!doctype html>
    <html lang="it">
      <meta charset="utf-8" />
      <meta http-equiv="refresh" content="0;url=it/" />
      <title>Riccardo Giorgi</title>
      <a href="it/">Italiano</a>
      ·
      <a href="en/">English</a>
    </html>`,
);
console.log(`Built ${pages.length * languages.length} bilingual pages.`);
