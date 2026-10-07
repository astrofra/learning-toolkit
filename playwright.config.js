import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './binary/tests',
  fullyParallel: true,
  // Éviter de saturer le petit serveur HTTP local avec plusieurs navigateurs.
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174/binary/',
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
  },
  webServer: {
    // Le préfixe /binary/ vérifie aussi le chargement relatif pour GitHub Pages.
    command: 'python3 -m http.server 4174 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4174/binary/',
    reuseExistingServer: !process.env.CI,
    stderr: 'ignore',
  },
});
