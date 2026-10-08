import { test, expect } from '@playwright/test';

const machineScreen = './#module-f/ecran-28';
const initialContents = ['00', '2A', '7F', '10', 'FF', '08', 'C3', '00', '91', '42', '3C', 'A5', '18', '80', '0F', 'E7'];
const next = page => page.getByRole('button', { name: 'Étape suivante', exact: true });
const previous = page => page.getByRole('button', { name: 'Étape précédente', exact: true });
const bytes = page => page.locator('.machine-cell-value');

test('accès direct : seize octets, une adresse sur quatre bits et deux registres de huit bits', async ({ page }) => {
  await page.goto(machineScreen);
  await expect(page).toHaveTitle(/Lecture, calcul, écriture/);
  await expect(page.locator('#screen-number')).toHaveText('28');
  await expect(page.locator('#chapter-letter')).toHaveText('F');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('#screen-next')).toBeHidden();
  await expect(bytes(page)).toHaveText(initialContents);
  await expect(page.locator('#machine-address-bits > span')).toHaveCount(4);
  await expect(page.locator('#machine-a-bits > span')).toHaveCount(8);
  await expect(page.locator('#machine-b-bits > span')).toHaveCount(8);
  await expect(page.locator('#machine-a')).toHaveText('0x00');
  await expect(page.locator('#machine-b')).toHaveText('0x00');
  await expect(page.locator('#machine-progress')).toHaveText('0 / 4');
  await expect(previous(page)).toBeDisabled();
  await expect(next(page)).toBeEnabled();
});

test('deux lectures, une addition dans A et une écriture qui ne modifie qu’une case', async ({ page }) => {
  await page.goto(machineScreen);
  await next(page).click();
  await expect(page.locator('#machine-a')).toHaveText('0x3C');
  await expect(page.locator('#machine-a-decimal')).toHaveText('60 en décimal');
  await expect(page.locator('#machine-a-bits')).toHaveAttribute('aria-label', 'A en binaire : 00111100');
  await expect(page.locator('#machine-b')).toHaveText('0x00');
  await expect(page.locator('#machine-address')).toHaveText('0x0A');
  await expect(page.locator('#machine-address-bits')).toHaveAttribute('aria-label', 'Adresse en binaire : 1010');
  await expect(bytes(page)).toHaveText(initialContents);
  await expect(page.locator('td[data-address="10"] .machine-cell-transfer')).toHaveText('LU');
  await next(page).click();
  await expect(page.locator('#machine-a')).toHaveText('0x3C');
  await expect(page.locator('#machine-b')).toHaveText('0x10');
  await expect(page.locator('#machine-address')).toHaveText('0x03');
  await expect(page.locator('#machine-calculation')).toHaveText('0x3C + 0x10 → ?');
  await expect(bytes(page)).toHaveText(initialContents);
  await next(page).click();
  await expect(page.locator('#machine-a')).toHaveText('0x4C');
  await expect(page.locator('#machine-a-bits')).toHaveAttribute('aria-label', 'A en binaire : 01001100');
  await expect(page.locator('#machine-b')).toHaveText('0x10');
  await expect(page.locator('#machine-address')).toHaveText('0x03');
  await expect(page.locator('#machine-calculation')).toHaveText('0x3C + 0x10 = 0x4C');
  await expect(page.locator('#machine-calculation-decimal')).toHaveText('60 + 16 = 76 en décimal');
  await expect(page.locator('#machine-alu')).toHaveAttribute('data-active', 'true');
  await expect(bytes(page)).toHaveText(initialContents);
  await next(page).click();
  const stored = [...initialContents];
  stored[12] = '4C';
  await expect(bytes(page)).toHaveText(stored);
  await expect(page.locator('td[data-modified="true"]')).toHaveCount(1);
  await expect(page.locator('td[data-address="12"] .machine-cell-transfer')).toHaveText('ÉCRIT');
  await expect(page.locator('#machine-address')).toHaveText('0x0C');
  await expect(page.locator('#machine-a')).toHaveText('0x4C');
  await expect(page.locator('#machine-b')).toHaveText('0x10');
  await expect(page.locator('#machine-transfer-target')).toHaveText('mémoire[0x0C]');
  await expect(next(page)).toBeDisabled();
});

test('retour arrière : restaurer exactement la mémoire et les registres, puis rejouer', async ({ page }) => {
  await page.goto(machineScreen);
  for (let i = 0; i < 4; i++) await next(page).click();
  await previous(page).click();
  await expect(bytes(page)).toHaveText(initialContents);
  await expect(page.locator('#machine-a')).toHaveText('0x4C');
  await expect(page.locator('#machine-address')).toHaveText('0x03');
  await expect(page.locator('td[data-modified="true"]')).toHaveCount(0);
  await previous(page).click();
  await expect(page.locator('#machine-a')).toHaveText('0x3C');
  await expect(page.locator('#machine-b')).toHaveText('0x10');
  await previous(page).click();
  await expect(page.locator('#machine-a')).toHaveText('0x3C');
  await expect(page.locator('#machine-b')).toHaveText('0x00');
  await previous(page).click();
  await expect(page.locator('#machine-a')).toHaveText('0x00');
  await expect(page.locator('#machine-address')).toHaveText('0x00');
  await expect(previous(page)).toBeDisabled();
  await expect(page.locator('.machine-program [aria-current]')).toHaveCount(0);
  for (let i = 0; i < 4; i++) await next(page).click();
  await expect(page.locator('#machine-a')).toHaveText('0x4C');
  await expect(bytes(page).nth(12)).toHaveText('4C');
});

test('défi : correction des erreurs, validation après le parcours, remise à zéro complète', async ({ page }) => {
  await page.goto(machineScreen);
  const open = page.getByRole('button', { name: 'Vérifier ma compréhension' });
  await open.click();
  await expect(page.locator('#machine-challenge-title')).toBeFocused();
  const submit = page.getByRole('button', { name: 'Vérifier ma réponse' });
  const feedback = page.locator('#machine-challenge .feedback');
  await expect(submit).toBeDisabled();
  await page.getByLabel('Dans la case 0x0A, à la place de la valeur lue.').check();
  await submit.click();
  await expect(feedback).toContainText('sans vider ni modifier');
  await page.getByLabel('Déjà dans la case 0x0C, où l’on prévoit de le stocker.').check();
  await submit.click();
  await expect(feedback).toContainText('ne suffit pas à écrire');
  await page.getByLabel('Dans A ; le contenu de la mémoire n’a pas changé.').check();
  await expect(feedback).toBeEmpty();
  await submit.click();
  await expect(feedback).toContainText('Exactement');
  await expect(page.locator('#lesson-status')).not.toContainText('Notion comprise');
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  for (let i = 0; i < 4; i++) await next(page).click();
  await expect(page.locator('#lesson-status')).toHaveText('28 / Notion comprise ✓');
  await previous(page).click();
  await expect(page.locator('#lesson-status')).toHaveText('28 / Notion comprise ✓');
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await expect(bytes(page)).toHaveText(initialContents);
  await expect(page.locator('#machine-progress')).toHaveText('0 / 4');
  await expect(page.locator('#machine-a')).toHaveText('0x00');
  await expect(page.locator('#machine-b')).toHaveText('0x00');
  await expect(page.locator('#lesson-status')).not.toContainText('Notion comprise');
  await open.click();
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  await expect(submit).toBeDisabled();
  await expect(feedback).toBeEmpty();
});

test('navigation 27 ↔ 28 : mémoires indépendantes et conservation de la séquence', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./#module-f/ecran-27');
  await page.getByLabel('Ou écrivez une valeur hexadécimale').fill('FF');
  await page.getByRole('button', { name: 'Écrire', exact: true }).click();
  await page.getByRole('link', { name: /Écran suivant : 28/ }).click();
  await expect(page.locator('#machine-title')).toBeFocused();
  await expect(bytes(page).nth(10)).toHaveText('3C');
  for (let i = 0; i < 3; i++) await next(page).click();
  await page.getByRole('link', { name: /Écran précédent : 27/ }).click();
  await expect(page.locator('#memory-value')).toHaveText('0xFF');
  await expect(page.locator('.cell-value').nth(12)).toHaveText('18');
  await page.goBack();
  await expect(page.locator('#machine-progress')).toHaveText('3 / 4');
  await expect(page.locator('#machine-a')).toHaveText('0x4C');
  await expect(page.locator('#lesson-status')).toContainText('3 sur 4');
  await next(page).click();
  await expect(bytes(page).nth(12)).toHaveText('4C');
  await page.reload();
  await expect(page.locator('#screen-28')).toBeVisible();
  await expect(page.locator('#machine-progress')).toHaveText('0 / 4');
  await expect(bytes(page)).toHaveText(initialContents);
  expect(errors).toEqual([]);
});

test('étapes au clavier, mouvement réduit et focus aux extrémités de la séquence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(machineScreen);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#lesson')).toBeFocused();
  await expect(page).toHaveURL(/#module-f\/ecran-28$/);
  await next(page).focus();
  for (let i = 1; i <= 4; i++) {
    await page.keyboard.press(i % 2 ? 'Space' : 'Enter');
    await expect(page.locator('#machine-progress')).toHaveText(`${i} / 4`);
    await expect(page.locator('.machine-program [aria-current="step"]')).toHaveAttribute('data-machine-step', String(i));
  }
  await expect(previous(page)).toBeFocused();
  expect(await page.locator('#machine-register-a').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  await expect(page.locator('#machine-transfer-value')).toHaveText('0x4C');
  for (let i = 0; i < 4; i++) await page.keyboard.press('Enter');
  await expect(next(page)).toBeFocused();
  await expect(page.locator('#machine-progress')).toHaveText('0 / 4');
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`machine et défi sans débordement horizontal à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(machineScreen);
    await page.evaluate(() => document.fonts.ready);
    for (let step = 0; step <= 4; step++) {
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (step < 4) await next(page).click();
    }
    const destinationVisible = await page.locator('td[data-address="12"]').evaluate(cell => {
      const bounds = cell.getBoundingClientRect();
      const frame = document.querySelector('#machine-memory-scroll').getBoundingClientRect();
      return bounds.left >= frame.left && bounds.right <= frame.right;
    });
    expect(destinationVisible).toBe(true);
    // Les commandes restent utilisables pendant qu’on observe les registres.
    await page.locator('#machine-register-b').scrollIntoViewIfNeeded();
    await expect(previous(page)).toBeInViewport();
    await previous(page).click();
    await expect(bytes(page)).toHaveText(initialContents);
    await page.getByRole('button', { name: 'Vérifier ma compréhension' }).click();
    await expect(page.getByRole('radio').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Projection', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
