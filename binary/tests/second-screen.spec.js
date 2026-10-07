import { test, expect } from '@playwright/test';

const secondScreen = './#module-a/ecran-02';

async function collectAllPatterns(page) {
  const left = page.getByRole('button', { name: 'Bit de gauche', exact: true });
  const right = page.getByRole('button', { name: 'Bit de droite', exact: true });
  const record = page.getByRole('button', { name: 'Enregistrer ce motif' });
  await record.click(); // 00
  await right.click();
  await record.click(); // 01
  await left.click();
  await record.click(); // 11
  await right.click();
  await record.click(); // 10
}

test('quatre motifs uniques, doublons sans effet et explication finale', async ({ page }) => {
  await page.goto(secondScreen);
  await expect(page.locator('#pattern-count')).toHaveText('0');
  await expect(page.locator('#combinations-insight')).toBeHidden();
  const record = page.getByRole('button', { name: 'Enregistrer ce motif' });
  await record.click();
  await record.click();
  await expect(page.locator('#pattern-count')).toHaveText('1');
  await expect(page.locator('#collection-feedback')).toContainText('déjà enregistré');
  await collectAllPatterns(page);
  await expect(page.locator('#pattern-count')).toHaveText('4');
  await expect(page.locator('.pattern-slot[data-found="true"]')).toHaveCount(4);
  expect(await page.locator('.pattern-symbols').allTextContents()).toEqual(['00', '01', '11', '10']);
  await expect(page.locator('#combinations-insight')).toContainText('2 × 2 = 4');
  await expect(page.locator('#collection-feedback')).toContainText('toutes les combinaisons');
  await record.click();
  await expect(page.locator('#pattern-count')).toHaveText('4');
});

test('défi sur les positions, réussite complète et remise à zéro', async ({ page }) => {
  await page.goto(secondScreen);
  const open = page.getByRole('button', { name: 'Vérifier ma compréhension' });
  await open.click();
  await expect(page.locator('#two-bits-challenge-title')).toBeFocused();
  await page.getByLabel('Non, ils contiennent les mêmes bits.').check();
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await expect(page.locator('#two-bits-challenge .feedback')).toContainText('position du 1');
  await page.getByLabel('Oui, les bits n’occupent pas les mêmes positions.').check();
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await expect(page.locator('#two-bits-challenge .feedback')).toContainText('Exactement');
  await expect(page.locator('#lesson-status')).not.toContainText('Notion comprise');
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await collectAllPatterns(page);
  await expect(page.locator('#lesson-status')).toContainText('Notion comprise');
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await expect(page.locator('#current-pattern')).toHaveText('00');
  await expect(page.locator('#pattern-count')).toHaveText('0');
  await expect(page.locator('#combinations-insight')).toBeHidden();
  await expect(page.locator('.pattern-slot[data-found="true"]')).toHaveCount(0);
  await open.click();
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  await expect(page.locator('#two-bits-challenge .feedback')).toBeEmpty();
});

test('navigation, historique et état propre à chaque écran', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await page.getByRole('switch').click();
  await page.getByRole('link', { name: /Écran suivant/ }).click();
  await expect(page).toHaveURL(/#module-a\/ecran-02$/);
  await expect(page.locator('#two-bits-title')).toBeFocused();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.getByRole('button', { name: 'Bit de gauche', exact: true }).click();
  await page.getByRole('button', { name: 'Enregistrer ce motif' }).click();
  await page.getByRole('link', { name: /Écran précédent/ }).click();
  await expect(page.locator('#lesson-title')).toBeFocused();
  await expect(page.locator('#bit-value')).toHaveText('1');
  await page.goBack();
  await expect(page.locator('#current-pattern')).toHaveText('10');
  await expect(page.locator('#pattern-count')).toHaveText('1');
  await page.goForward();
  await expect(page.locator('#bit-value')).toHaveText('1');
  for (let i = 0; i < 3; i++) {
    await page.getByRole('link', { name: /Écran suivant/ }).click();
    await page.getByRole('link', { name: /Écran précédent/ }).click();
  }
  await page.getByRole('link', { name: /Écran suivant/ }).click();
  await page.getByRole('button', { name: 'Bit de gauche', exact: true }).click();
  await expect(page.locator('#current-pattern')).toHaveText('00');
  await expect(page.locator('#lesson-status')).toContainText('1 sur 4');
  await page.reload();
  await expect(page.locator('#screen-02')).toBeVisible();
  await expect(page.locator('#pattern-count')).toHaveText('0');
  await expect(page).toHaveTitle(/Un bit, plusieurs bits/);
  expect(errors).toEqual([]);
});

test('bits au clavier, mouvement réduit et lien d’évitement sur le deuxième écran', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(secondScreen);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#lesson')).toBeFocused();
  await expect(page).toHaveURL(/#module-a\/ecran-02$/);
  const left = page.getByRole('button', { name: 'Bit de gauche', exact: true });
  await left.focus();
  await page.keyboard.press('Space');
  await expect(left).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#current-pattern')).toHaveText('10');
  await expect(page.locator('#two-bits-announcement')).toContainText('Bit de gauche : 1');
  await page.keyboard.press('Enter');
  await expect(page.locator('#current-pattern')).toHaveText('00');
  expect(await left.evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});

test('une URL inconnue revient au premier écran', async ({ page }) => {
  await page.goto('./#inconnu');
  await expect(page).toHaveURL(/#module-a\/ecran-01$/);
  await expect(page.locator('#screen-01')).toBeVisible();
  await expect(page.locator('#screen-02')).toBeHidden();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`deuxième écran complet sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(secondScreen);
    await page.evaluate(() => document.fonts.ready);
    await collectAllPatterns(page);
    await page.getByRole('button', { name: 'Vérifier ma compréhension' }).click();
    await expect(page.getByRole('radio').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
