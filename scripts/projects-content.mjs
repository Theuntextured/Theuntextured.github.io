import { readFile } from 'node:fs/promises';
import { languages } from '../src/site.mjs';
import { loadLogos } from './content-logos.mjs';
import {
  assetsRoot,
  localFile,
  readMarkdown,
  translation,
  contentLanguages,
} from './content-utils.mjs';

export async function loadProjects() {
  const items = JSON.parse(await readFile('src/content/projects.json', 'utf8'));
  if (!Array.isArray(items)) {
    throw new Error('Expected an array in projects.json');
  }

  const result = Object.fromEntries(languages.map((lang) => [lang, []]));
  const ids = new Set();
  for (const item of items) {
    if (!/^[a-z][a-z0-9-]*$/.test(item.id || '') || ids.has(item.id)) {
      throw new Error(`Invalid or duplicate project ID: ${item.id}`);
    }
    ids.add(item.id);
    if (item.image) {
      await readFile(localFile(assetsRoot, item.image.src));
    }
    if (item.href !== undefined) {
      try {
        const url = new URL(item.href);
        if (
          url.protocol !== 'https:' ||
          !url.hostname ||
          url.username ||
          url.password
        ) {
          throw new Error();
        }
      } catch {
        throw new Error(`Expected an HTTPS project URL: ${item.id}`);
      }
    }

    for (const lang of contentLanguages(item)) {
      const logos = await loadLogos(item, lang);
      const body = translation(item.body, lang, `${item.id} Markdown path`);
      if (!body.startsWith('projects/')) {
        throw new Error(`${item.id} body must be in projects/`);
      }
      result[lang].push({
        id: item.id,
        title: translation(item.title, lang, `${item.id} title`),
        html: await readMarkdown(body),
        logos,
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
        href: item.href,
      });
    }
  }
  return result;
}
