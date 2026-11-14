import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { languages } from '../src/site.mjs';
import {
  contentRoot,
  assetsRoot,
  localFile,
  translation,
  readMarkdown,
} from './content-utils.mjs';

export async function loadCompetences() {
  const manifest = JSON.parse(
    await readFile(resolve(contentRoot, 'competences-activities.json'), 'utf8'),
  );
  const result = Object.fromEntries(languages.map((lang) => [lang, {}]));
  const ids = new Set();
  for (const group of ['competences', 'activities']) {
    if (!Array.isArray(manifest[group])) {
      throw new Error(`Expected ${group} array in competences-activities.json`);
    }
    for (const lang of languages) {
      result[lang][group] = [];
    }
    for (const item of manifest[group]) {
      if (!/^[a-z][a-z0-9-]*$/.test(item.id || '') || ids.has(item.id)) {
        throw new Error(`Invalid or duplicate entry ID: ${item.id}`);
      }
      ids.add(item.id);
      if (item.image) {
        await readFile(localFile(assetsRoot, item.image.src));
      }
      for (const lang of languages) {
        const title = translation(item.title, lang, `${item.id} title`);
        const body = translation(item.body, lang, `${item.id} Markdown path`);
        if (!body.startsWith(`${group}/`)) {
          throw new Error(`${item.id} body must be in ${group}/`);
        }
        const html = await readMarkdown(body);
        result[lang][group].push({
          id: item.id,
          title,
          html,
          image: item.image
            ? {
                src: item.image.src,
                alt: translation(
                  item.image.alt,
                  lang,
                  `${item.id} image description`,
                ),
              }
            : null,
        });
      }
    }
  }
  return result;
}
