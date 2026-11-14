import { readFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export const contentRoot = resolve('src/content');
export const assetsRoot = resolve('src/assets');

export function localFile(root, path, extension) {
  if (typeof path !== 'string' || !path || path.includes('\\')) {
    throw new Error(`Invalid content path: ${path}`);
  }
  const file = resolve(root, path);
  const within = relative(root, file);
  if (
    within.startsWith(`..${sep}`) ||
    within === '..' ||
    within.startsWith(sep) ||
    (extension && !file.endsWith(extension))
  ) {
    throw new Error(`Expected a local ${extension || 'asset'} file: ${path}`);
  }
  return file;
}

export function translation(value, lang, field) {
  if (typeof value?.[lang] !== 'string' || !value[lang].trim()) {
    throw new Error(`Missing ${lang} ${field}`);
  }
  return value[lang];
}

export async function readMarkdown(path) {
  const markdown = await readFile(localFile(contentRoot, path, '.md'), 'utf8');
  return sanitizeHtml(marked.parse(markdown), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
  });
}
