import { test, expect } from '@playwright/test';

test('le lien d’évitement apparaît au clavier et rejoint le contenu', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Aller à l’expérience' });
  await expect(skip).toBeFocused();
  expect(await skip.evaluate(el => getComputedStyle(el).clipPath)).toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.locator('#lesson')).toBeFocused();
});

test('lampe et bit restent synchronisés, avec des ressources locales sous un préfixe', async ({ page }) => {
  const errors = [];
  const failures = [];
  const externalRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4174/')) externalRequests.push(request.url()); });
  await page.goto('./#module-a/ecran-01');
  await page.evaluate(() => document.fonts.ready);
  const lamp = page.getByRole('switch', { name: 'Interrupteur de la lampe' });
  await expect(lamp).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('#bit-value')).toHaveText('0');
  for (let i = 0; i < 5; i++) {
    await lamp.click();
    await expect(page.locator('#bit-value')).toHaveText('1');
    await expect(page.locator('#physical-label')).toHaveText('Lampe allumée');
    await expect(lamp).toHaveAttribute('aria-checked', 'true');
    await lamp.click();
    await expect(page.locator('#bit-value')).toHaveText('0');
    await expect(page.locator('#physical-label')).toHaveText('Lampe éteinte');
  }
  await expect(page.locator('#observation-text')).toContainText('exploré les deux états');
  expect(await page.evaluate(() => document.fonts.check('400 16px Roboto') && document.fonts.check('400 16px "Roboto Mono"'))).toBe(true);
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test('interrupteur utilisable avec Espace et Entrée, puis réinitialisation', async ({ page }) => {
  await page.goto('./');
  const lamp = page.getByRole('switch');
  await lamp.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#bit-value')).toHaveText('1');
  await expect(page.locator('#state-announcement')).toContainText('La valeur du bit est 1');
  await page.keyboard.press('Enter');
  await expect(page.locator('#bit-value')).toHaveText('0');
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await expect(page.locator('#observation-text')).toContainText('Essayez');
  await expect(lamp).toHaveAttribute('aria-checked', 'false');
});

test('défi : erreur expliquée, correction, fermeture au clavier et remise à zéro', async ({ page }) => {
  await page.goto('./');
  const open = page.getByRole('button', { name: 'Vérifier ma compréhension' });
  await open.click();
  await expect(page.locator('#challenge-title')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Vérifier ma réponse' })).toBeDisabled();
  await page.getByLabel('Oui, la lampe s’éteint.').check();
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await expect(page.locator('#answer-feedback')).toContainText('Pas tout à fait');
  await page.getByLabel('Non, seule sa représentation change.').check();
  await expect(page.locator('#answer-feedback')).toBeEmpty();
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await expect(page.locator('#answer-feedback')).toContainText('Exactement');
  await expect(page.locator('#lesson-status')).toContainText('Notion comprise');
  await page.keyboard.press('Escape');
  await expect(page.locator('#challenge')).toBeHidden();
  await expect(open).toBeFocused();
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await open.click();
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  await expect(page.locator('#answer-feedback')).toBeEmpty();
  await expect(page.locator('#lesson-status')).not.toContainText('Notion comprise');
});

test('préférence système de mouvement réduit et préférences locales', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('body')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('button', { name: 'Mouvement réduit' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('switch').click();
  await expect(page.locator('#bit-value')).toHaveText('1');
  expect(await page.locator('.switch-knob').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.getByRole('button', { name: 'Projection' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Projection' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveAttribute('data-projection', 'true');
});

test('fonctionne avec un stockage local inaccessible', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Projection' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-projection', 'true');
  await page.getByRole('switch').click();
  await expect(page.locator('#bit-value')).toHaveText('1');
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`mise en page sans débordement horizontal à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('switch').click();
    await page.getByRole('button', { name: 'Vérifier ma compréhension' }).click();
    await expect(page.getByRole('radio').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
