import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { promisify } from 'node:util';
import { languages } from '../src/site.mjs';

const run = promisify(execFile);

export async function buildCV(lang) {
  if (!languages.includes(lang)) {
    throw new Error(`Unsupported CV language: ${lang}`);
  }
  const source = resolve('cv', `${lang}.tex`);
  const name = `riccardo-giorgi-${lang}`;
  const output = resolve('dist/assets/cv', `${name}.pdf`);
  const temporary = await mkdtemp(join(tmpdir(), 'riccardo-cv-'));

  try {
    // Two passes resolve hyperlinks and references. Keep auxiliary files
    // outside the source tree, and disable shell commands in TeX documents.
    for (let pass = 0; pass < 2; pass++) {
      await run(
        'pdflatex',
        [
          '-no-shell-escape',
          '-halt-on-error',
          '-interaction=nonstopmode',
          '-file-line-error',
          `-output-directory=${temporary}`,
          `-jobname=${name}`,
          source,
        ],
        { cwd: resolve('cv'), timeout: 120000, maxBuffer: 4 * 1024 * 1024 },
      );
    }
    await mkdir(resolve('dist/assets/cv'), { recursive: true });
    await copyFile(join(temporary, `${name}.pdf`), output);
    console.log(`Compiled cv/${lang}.tex -> dist/assets/cv/${name}.pdf`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        'Building the CV requires pdflatex. Install TeX Live (including latex-recommended, latex-extra and recommended fonts), then run the build again.',
        { cause: error },
      );
    }
    const details = [error.stdout, error.stderr]
      .filter(Boolean)
      .join('\n')
      .trim()
      .split('\n')
      .slice(-30)
      .join('\n');
    throw new Error(
      `Failed to compile cv/${lang}.tex.\n${details || error.message}`,
      {
        cause: error,
      },
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
