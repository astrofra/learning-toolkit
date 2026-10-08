import { cp, mkdir, rm } from 'node:fs/promises';

const source = new URL('../binary/', import.meta.url);
// Ce dossier reproduit le préfixe de GitHub Pages pour l’aperçu et les tests.
const destination = new URL('../dist/learning-toolkit/', import.meta.url);

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

// Publier uniquement l’application et ses ressources, sans les tests ni les PDF.
for (const entry of ['index.html', 'js', 'styles', 'assets', 'fonts']) {
  await cp(new URL(entry, source), new URL(entry, destination), {
    recursive: true,
    filter: path => !path.endsWith('/.DS_Store'),
  });
}

console.log('Site prêt dans dist/learning-toolkit/');
