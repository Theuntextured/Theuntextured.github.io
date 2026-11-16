import { readFile } from 'node:fs/promises';
import { resolve, relative, sep, isAbsolute } from 'node:path';
import { languages } from '../src/site.mjs';
import { contentLanguages } from './content-utils.mjs';
import { loadLogos } from './content-logos.mjs';

const assetsRoot = resolve('src/assets');
async function asset(path) {
  if (
    typeof path !== 'string' ||
    !path ||
    isAbsolute(path) ||
    path.includes('\\') ||
    /[?#]/.test(path)
  ) {
    throw new Error(`Invalid certificate asset path: ${path}`);
  }
  const file = resolve(assetsRoot, path);
  const within = relative(assetsRoot, file);
  if (
    !within ||
    within === '..' ||
    within.startsWith(`..${sep}`) ||
    isAbsolute(within)
  ) {
    throw new Error(`Certificate asset must be inside src/assets: ${path}`);
  }
  await readFile(file);
}
function translation(value, lang, field) {
  if (typeof value?.[lang] !== 'string' || !value[lang].trim()) {
    throw new Error(`Missing ${lang} ${field}`);
  }
  return value[lang];
}

export async function loadCertificates() {
  const items = JSON.parse(
    await readFile('src/content/certificates.json', 'utf8'),
  );
  if (!Array.isArray(items)) {
    throw new Error('Expected an array in certificates.json');
  }
  const result = Object.fromEntries(languages.map((lang) => [lang, []]));
  const ids = new Set();
  for (const item of items) {
    if (!/^[a-z][a-z0-9-]*$/.test(item.id || '') || ids.has(item.id)) {
      throw new Error(`Invalid or duplicate certificate ID: ${item.id}`);
    }
    ids.add(item.id);
    if (item.image) {
      await asset(item.image.src);
    }
    if (typeof item.href !== 'string' || !item.href.trim()) {
      throw new Error(`Missing certificate link: ${item.id}`);
    }
    if (item.href.startsWith('https://')) {
      try {
        const url = new URL(item.href);
        if (!url.hostname || url.username || url.password) {
          throw new Error();
        }
      } catch {
        throw new Error(`Invalid certificate URL: ${item.id}`);
      }
    } else {
      if (/^[a-z][a-z0-9+.-]*:/i.test(item.href)) {
        throw new Error(`Unsupported certificate link protocol: ${item.id}`);
      }
      await asset(item.href);
    }
    for (const lang of contentLanguages(item)) {
      const logos = await loadLogos(item, lang);
      result[lang].push({
        id: item.id,
        logos,
        title: translation(item.title, lang, `${item.id} title`),
        description: translation(
          item.description,
          lang,
          `${item.id} description`,
        ),
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
