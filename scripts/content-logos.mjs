import { readFile } from 'node:fs/promises';
import { assetsRoot, localFile, translation } from './content-utils.mjs';

const catalog = JSON.parse(
  await readFile(
    new URL('../src/content/tool-logos.json', import.meta.url),
    'utf8',
  ),
);

export async function loadLogos(item, lang) {
  const references = item.logos ?? [];
  if (
    !Array.isArray(references) ||
    new Set(references).size !== references.length
  ) {
    throw new Error(`Expected unique logo IDs: ${item.id}`);
  }
  return Promise.all(
    references.map(async (id) => {
      if (typeof id !== 'string' || !Object.hasOwn(catalog, id)) {
        throw new Error(`Unknown logo for ${item.id}: ${id}`);
      }
      const logo = catalog[id];
      const label =
        typeof logo.label === 'string'
          ? logo.label
          : translation(logo.label, lang, `${id} logo label`);
      if (!label.trim()) {
        throw new Error(`Missing logo label: ${id}`);
      }
      await readFile(localFile(assetsRoot, logo.src));
      return { ...logo, label };
    }),
  );
}
