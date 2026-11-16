import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';

const run = promisify(execFile);
const moduleURL = new URL('./build-cv.mjs', import.meta.url).href;
const script = `import { buildCV } from ${JSON.stringify(moduleURL)}; await buildCV('en');`;

async function fixture(t, source) {
  const root = await mkdtemp(join(tmpdir(), 'cv-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'cv'));
  await writeFile(join(root, 'cv/en.tex'), source);
  return root;
}

test('compiles English and Italian PDFs without auxiliary source files', async (t) => {
  const root = await fixture(
    t,
    '\\documentclass{article}\\begin{document}CV build check\\end{document}',
  );
  await writeFile(
    join(root, 'cv/it.tex'),
    '\\documentclass{article}\\usepackage[italian]{babel}\\begin{document}Formazione, attività e mobilità\\end{document}',
  );
  const bilingual = `import { buildCV } from ${JSON.stringify(moduleURL)}; await buildCV('it'); await buildCV('en');`;
  await run(process.execPath, ['--input-type=module', '-e', bilingual], {
    cwd: root,
    timeout: 15000,
  });
  for (const lang of ['en', 'it']) {
    const pdf = await readFile(
      join(root, `dist/assets/cv/riccardo-giorgi-${lang}.pdf`),
    );
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  }
  assert.deepEqual(await readdir(join(root, 'cv')), ['en.tex', 'it.tex']);
  assert.deepEqual(await readdir(join(root, 'dist/assets/cv')), [
    'riccardo-giorgi-en.pdf',
    'riccardo-giorgi-it.pdf',
  ]);
});

test('fails with installation instructions when pdflatex is missing', async (t) => {
  const root = await fixture(t, '');
  await assert.rejects(
    run(process.execPath, ['--input-type=module', '-e', script], {
      cwd: root,
      env: { ...process.env, PATH: '' },
      timeout: 15000,
    }),
    (error) =>
      error.code !== 0 &&
      /requires pdflatex.*Install TeX Live/s.test(error.stderr),
  );
});

test('fails with LaTeX diagnostics for an invalid document', async (t) => {
  const root = await fixture(
    t,
    '\\documentclass{article}\\begin{document}\\invalidCVcommand\\end{document}',
  );
  await assert.rejects(
    run(process.execPath, ['--input-type=module', '-e', script], {
      cwd: root,
      timeout: 15000,
    }),
    (error) =>
      error.code !== 0 &&
      /Failed to compile cv\/en\.tex/.test(error.stderr) &&
      /Undefined control sequence/.test(error.stderr),
  );
  await assert.rejects(
    readFile(join(root, 'dist/assets/cv/riccardo-giorgi-en.pdf')),
    {
      code: 'ENOENT',
    },
  );
});
