import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { renderInline } from '../src/inline-markdown.mjs';
import { renderHome } from '../src/pages/home.mjs';

test('renders multiple inline links while preserving surrounding prose', () => {
  assert.equal(
    renderInline(
      'See [the programme](https://example.com/programme) or [email me](mailto:hello@example.com).',
    ),
    'See <a href="https://example.com/programme">the programme</a> or <a href="mailto:hello@example.com">email me</a>.',
  );
});

test('supports parentheses, query parameters and inline formatting in links', () => {
  assert.equal(
    renderInline(
      '[**Details**](https://example.com/course_(engineering)?a=1&b=2 "Course details")',
    ),
    '<a href="https://example.com/course_(engineering)?a=1&amp;b=2" title="Course details"><strong>Details</strong></a>',
  );
});

test('keeps raw HTML inert and does not render images', () => {
  const html = renderInline(
    '<img src=x onerror=alert(1)> <script>alert(1)</script> ![a photo](https://example.com/photo.png)',
  );
  assert.ok(html.includes('&lt;img'));
  assert.ok(!/<(?:script|img)\b/i.test(html));
  assert.ok(html.endsWith('a photo'));
});

test('removes executable and protocol-relative link destinations', () => {
  for (const destination of [
    'javascript:alert(1)',
    'data:text/html,hello',
    '//example.com',
  ]) {
    const html = renderInline(`[label](${destination})`);
    assert.ok(!html.includes('href='), html);
    assert.ok(html.includes('label'));
  }
});

test('renders the homepage programme link from JSON', async () => {
  const { home } = JSON.parse(
    await readFile(new URL('../src/content/en.json', import.meta.url), 'utf8'),
  );
  const html = renderHome(
    home,
    (id) => `/en/${id}/`,
    (text) => text,
  );
  assert.ok(
    html.includes(
      '<a href="https://www.polito.it/didattica/polito-learning-experiences/learning-experiences-in-interdisciplinarity/percorso-intraprendenti">INTRAPRENDENTI</a>',
    ),
  );
  assert.ok(!html.includes('[INTRAPRENDENTI]'));
});
