import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './binary/tests',
  fullyParallel: true,
  // Éviter de saturer le petit serveur HTTP local avec plusieurs navigateurs.
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174/learning-toolkit/',
    channel: process.env.CI ? 'chromium' : 'chrome',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
  },
  webServer: {
    // Tester les fichiers publiés avec le même préfixe que GitHub Pages.
    command: 'npm run build && python3 -m http.server 4174 --bind 127.0.0.1 --directory dist',
    url: 'http://127.0.0.1:4174/learning-toolkit/',
    reuseExistingServer: false,
    stderr: 'ignore',
  },
});
