import { test, expect } from '@playwright/test';

const screen = './#module-e/ecran-26';
const next = page => page.getByRole('button', { name: 'Déplacer d’un bit', exact: true });
const previous = page => page.getByRole('button', { name: 'Étape précédente', exact: true });
const sourceBit = (page, bit) => page.getByRole('button', { name: `Bit de départ ${bit}, poids ${2 ** bit}`, exact: true });

async function setSource(page, value) {
  for (let bit = 0; bit < 8; bit++) {
    const button = sourceBit(page, bit);
    if (await button.getAttribute('aria-pressed') !== String((value & (1 << bit)) !== 0)) await button.click();
  }
}

test('départ commun et premier déplacement : un 1 perdu ou réinjecté', async ({ page }) => {
  await page.goto(screen);
  await expect(page).toHaveTitle(/Décalage ou rotation/);
  await expect(page.locator('#chapter-letter')).toHaveText('E');
  await expect(page.locator('#screen-number')).toHaveText('26');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('#screen-previous')).toHaveAttribute('href', '#module-a/ecran-02');
  await expect(page.locator('#screen-next')).toHaveAttribute('href', '#module-f/ecran-27');
  await expect(page.locator('.movement-source-bit')).toHaveCount(8);
  await expect(page.locator('#movement-source-hex')).toHaveText('0x80');
  await expect(page.locator('#movement-source-decimal')).toHaveText('128 en décimal');
  await expect(previous(page)).toBeDisabled();
  await next(page).click();
  await expect(page.locator('#movement-shift-before')).toHaveAttribute('aria-label', 'Avant décalage : 10000000');
  await expect(page.locator('#movement-rotate-before')).toHaveAttribute('aria-label', 'Avant rotation : 10000000');
  await expect(page.locator('#movement-shift-after')).toHaveAttribute('aria-label', 'Après décalage : 00000000');
  await expect(page.locator('#movement-rotate-after')).toHaveAttribute('aria-label', 'Après rotation : 00000001');
  await expect(page.locator('#movement-shift-hex')).toHaveText('0x00');
  await expect(page.locator('#movement-rotate-decimal')).toHaveText('1 en décimal');
  await expect(page.locator('#movement-shift-out')).toHaveText('1');
  await expect(page.locator('#movement-shift-in')).toHaveText('0');
  await expect(page.locator('#movement-rotate-out')).toHaveText('1');
  await expect(page.locator('#movement-rotate-in')).toHaveText('1');
  await expect(page.locator('#movement-shift-paths')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('#movement-rotate-after > span').last()).toHaveAttribute('data-edge', 'true');
});

test('huit rotations à gauche retrouvent le motif, puis le retour arrière restaure les bits perdus', async ({ page }) => {
  await page.goto(screen);
  for (const value of ['01', '02', '04', '08', '10', '20', '40', '80']) {
    await next(page).click();
    await expect(page.locator('#movement-rotate-hex')).toHaveText(`0x${value}`);
    await expect(page.locator('#movement-shift-hex')).toHaveText('0x00');
  }
  await expect(next(page)).toBeDisabled();
  await expect(page.locator('#movement-progress')).toHaveText('8 / 8');
  await expect(page.locator('#movement-observation')).toContainText('le motif de départ');
  for (let step = 7; step >= 0; step--) {
    await previous(page).click();
    await expect(page.locator('#movement-progress')).toHaveText(`${step} / 8`);
  }
  await expect(page.locator('#movement-shift-hex')).toHaveText('0x80');
  await expect(page.locator('#movement-rotate-hex')).toHaveText('0x80');
  await expect(page.locator('#movement-shift-out')).toHaveText('—');
  await expect(page.locator('#movement-rotate-paths')).toHaveCSS('visibility', 'hidden');
  await expect(previous(page)).toBeDisabled();
  await next(page).click();
  await expect(page.locator('#movement-rotate-hex')).toHaveText('0x01');
});

test('à droite les résultats coïncident jusqu’à la sortie du 1, sans extension du signe', async ({ page }) => {
  await page.goto(screen);
  await page.getByRole('radio', { name: 'Vers la droite →', exact: true }).check();
  for (const value of ['40', '20', '10', '08', '04', '02', '01']) {
    await next(page).click();
    await expect(page.locator('#movement-shift-hex')).toHaveText(`0x${value}`);
    await expect(page.locator('#movement-rotate-hex')).toHaveText(`0x${value}`);
    await expect(page.locator('#movement-observation')).toContainText('Les résultats coïncident ici');
  }
  await next(page).click();
  await expect(page.locator('#movement-shift-hex')).toHaveText('0x00');
  await expect(page.locator('#movement-rotate-hex')).toHaveText('0x80');
  await expect(page.locator('#movement-rotate-out')).toHaveText('1');
  await expect(page.locator('#movement-rotate-after > span').first()).toHaveAttribute('data-edge', 'true');
});

test('motifs 00, FF, 81 et 01 : comparaison dans les deux sens et redémarrage après édition', async ({ page }) => {
  await page.goto(screen);
  for (const [seed, leftShift, leftRotate, rightShift, rightRotate] of [
    [0x00, '00', '00', '00', '00'],
    [0xFF, 'FE', 'FF', '7F', 'FF'],
    [0x81, '02', '03', '40', 'C0'],
    [0x01, '02', '02', '00', '80'],
  ]) {
    await page.getByRole('button', { name: 'Recommencer' }).click();
    await next(page).click();
    await setSource(page, seed);
    await expect(page.locator('#movement-progress')).toHaveText('0 / 8');
    await next(page).click();
    await expect(page.locator('#movement-shift-hex')).toHaveText(`0x${leftShift}`);
    await expect(page.locator('#movement-rotate-hex')).toHaveText(`0x${leftRotate}`);
    await page.getByRole('radio', { name: 'Vers la droite →', exact: true }).check();
    await expect(page.locator('#movement-progress')).toHaveText('0 / 8');
    await expect(page.locator('#movement-shift-out')).toHaveText('—');
    await next(page).click();
    await expect(page.locator('#movement-shift-hex')).toHaveText(`0x${rightShift}`);
    await expect(page.locator('#movement-rotate-hex')).toHaveText(`0x${rightRotate}`);
  }
});

test('défi de transfert, correction des deux erreurs et remise à zéro de la comparaison', async ({ page }) => {
  await page.goto(screen);
  const open = page.getByRole('button', { name: 'Vérifier ma compréhension' });
  const submit = page.getByRole('button', { name: 'Vérifier ma réponse' });
  const feedback = page.locator('#movement-challenge .feedback');
  await open.click();
  await expect(page.locator('#movement-challenge-title')).toBeFocused();
  await expect(submit).toBeDisabled();
  await page.getByRole('radio', { name: 'Les deux donnent 00000010.' }).check();
  await submit.click();
  await expect(feedback).toContainText('la rotation récupère le 1');
  await page.getByRole('radio', { name: 'Décalage : 00000011 ; rotation : 00000010.' }).check();
  await submit.click();
  await expect(feedback).toContainText('Les règles sont inversées');
  await page.getByRole('radio', { name: 'Décalage : 00000010 ; rotation : 00000011.' }).check();
  await expect(feedback).toBeEmpty();
  await submit.click();
  await expect(feedback).toContainText('Exactement');
  await expect(page.locator('#lesson-status')).not.toContainText('Notion comprise');
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await next(page).click();
  await expect(page.locator('#lesson-status')).toHaveText('26 / Notion comprise ✓');
  await sourceBit(page, 0).click();
  await page.getByRole('radio', { name: 'Vers la droite →', exact: true }).check();
  await next(page).click();
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await expect(page.locator('#movement-source-hex')).toHaveText('0x80');
  await expect(page.locator('#movement-shift-hex')).toHaveText('0x80');
  await expect(page.locator('#movement-rotate-hex')).toHaveText('0x80');
  await expect(page.getByRole('radio', { name: '← Vers la gauche', exact: true })).toBeChecked();
  await expect(page.locator('#movement-progress')).toHaveText('0 / 8');
  await expect(page.locator('#lesson-status')).not.toContainText('Notion comprise');
  await open.click();
  await expect(page.locator('#movement-challenge input:checked')).toHaveCount(0);
  await expect(feedback).toBeEmpty();
  await expect(submit).toBeDisabled();
});

test('navigation 02 → 26 → 27 : état conservé pendant la session, rechargement au départ', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./#module-a/ecran-02');
  await page.getByRole('link', { name: /Écran suivant : 26/ }).click();
  await expect(page.locator('#movement-title')).toBeFocused();
  await sourceBit(page, 0).click();
  await page.getByRole('radio', { name: 'Vers la droite →', exact: true }).check();
  await next(page).click();
  await next(page).click();
  await page.getByRole('link', { name: /Écran suivant : 27/ }).click();
  await expect(page.locator('#memory-title')).toBeFocused();
  await expect(page.locator('#chapter-letter')).toHaveText('F');
  await page.goBack();
  await expect(page.locator('#chapter-letter')).toHaveText('E');
  await expect(page.locator('#movement-source-hex')).toHaveText('0x81');
  await expect(page.locator('#movement-progress')).toHaveText('2 / 8');
  await expect(page.locator('#movement-shift-hex')).toHaveText('0x20');
  await expect(page.locator('#movement-rotate-hex')).toHaveText('0x60');
  await expect(page.locator('#lesson-status')).toContainText('2 sur 8');
  await page.reload();
  await expect(page.locator('#screen-26')).toBeVisible();
  await expect(page.locator('#movement-source-hex')).toHaveText('0x80');
  await expect(page.locator('#movement-progress')).toHaveText('0 / 8');
  expect(errors).toEqual([]);
});

test('bits, sens et commandes au clavier, sans animation obligatoire', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(screen);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#lesson')).toBeFocused();
  await expect(page).toHaveURL(/#module-e\/ecran-26$/);
  await sourceBit(page, 0).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#movement-source-hex')).toHaveText('0x81');
  await page.getByRole('radio', { name: '← Vers la gauche', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Vers la droite →', exact: true })).toBeChecked();
  await next(page).focus();
  for (let i = 0; i < 8; i++) await page.keyboard.press('Enter');
  await expect(previous(page)).toBeFocused();
  await expect(page.locator('#movement-rotate-hex')).toHaveText('0x81');
  for (let i = 0; i < 8; i++) await page.keyboard.press('Enter');
  await expect(next(page)).toBeFocused();
  await expect(page.locator('#movement-progress')).toHaveText('0 / 8');
  expect(await sourceBit(page, 0).evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`comparaison, commandes et défi sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(screen);
    await page.evaluate(() => document.fonts.ready);
    for (let i = 0; i < 8; i++) await next(page).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.locator('#movement-rotate-after').scrollIntoViewIfNeeded();
    await expect(previous(page)).toBeInViewport();
    await previous(page).click();
    await page.getByRole('button', { name: 'Vérifier ma compréhension' }).click();
    await expect(page.getByRole('radio', { name: 'Les deux donnent 00000010.' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Projection', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
