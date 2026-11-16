import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const escapeText = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const markdown = new Marked({
  async: false,
  renderer: {
    // JSON prose supports inline Markdown, never executable HTML or images.
    html: ({ text }) => escapeText(text),
    image: ({ text }) => escapeText(text),
  },
});

export function renderInline(text) {
  return sanitizeHtml(markdown.parseInline(text), {
    allowedTags: ['a', 'em', 'strong', 'code', 'del', 'br'],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowProtocolRelative: false,
  });
}
