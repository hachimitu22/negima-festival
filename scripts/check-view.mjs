import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const viewDirectory = fileURLToPath(
  new URL('../src/views/', import.meta.url),
);

async function findJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return findJavaScriptFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.js')
      ? [entryPath]
      : [];
  }));

  return files.flat();
}

const viewFiles = (await findJavaScriptFiles(viewDirectory)).sort();

await Promise.all(
  viewFiles.map(file => import(pathToFileURL(file).href)),
);

console.log(`view check passed (${viewFiles.length} modules)`);
