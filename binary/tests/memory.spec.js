import { test, expect } from '@playwright/test';

const memoryScreen = './#module-f/ecran-27';
const initialContents = ['00', '2A', '7F', '10', 'FF', '08', 'C3', '00', '91', '42', '3C', 'A5', '18', '80', '0F', 'E7'];
const cell = (page, address) => page.locator(`.memory-cell[data-address="${address}"]`);

async function writeHex(page, value) {
  await page.getByLabel('Ou écrivez une valeur hexadécimale').fill(value);
  await page.getByRole('button', { name: 'Écrire', exact: true }).click();
}

test('l’écran 27 distingue les 16 adresses du contenu de chaque octet', async ({ page }) => {
  await page.goto(memoryScreen);
  await expect(page).toHaveTitle(/Adresse et contenu/);
  await expect(page.locator('#screen-number')).toHaveText('27');
  await expect(page.locator('#chapter-letter')).toHaveText('F');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('.memory-cell')).toHaveCount(16);
  await expect(page.locator('.memory-bit')).toHaveCount(8);
  await expect(page.locator('#memory-address')).toHaveText('0x0A');
  await expect(page.locator('#memory-address-binary')).toHaveText('1010');
  await expect(page.locator('#memory-value')).toHaveText('0x3C');
  await expect(page.locator('#memory-decimal')).toHaveText('60 en décimal');
  await expect(page.locator('.memory-bit-digit')).toHaveText(['0', '0', '1', '1', '1', '1', '0', '0']);

  // Une sélection est une lecture : même une saisie non validée ne doit rien écrire.
  await page.getByLabel('Ou écrivez une valeur hexadécimale').fill('FF');
  for (let address = 0; address < 16; address++) {
    await cell(page, address).click();
    await expect(page.locator('#memory-value')).toHaveText(`0x${initialContents[address]}`);
    await expect(page.locator('#memory-address-binary')).toHaveText(address.toString(2).padStart(4, '0'));
  }
  await expect(page.locator('.cell-value')).toHaveText(initialContents);
  await expect(page.locator('.memory-cell[aria-pressed="true"]')).toHaveCount(1);
});

test('écrire ne change que l’octet choisi, sans changer son adresse', async ({ page }) => {
  await page.goto(memoryScreen);
  await writeHex(page, '0Xff');
  await expect(page.locator('#memory-address')).toHaveText('0x0A');
  await expect(page.locator('#memory-value')).toHaveText('0xFF');
  await expect(page.locator('#memory-decimal')).toHaveText('255 en décimal');
  await expect(page.locator('.memory-bit[aria-pressed="true"]')).toHaveCount(8);
  await expect(page.locator('#memory-write-feedback')).toContainText('L’adresse reste 0x0A');
  const expected = [...initialContents];
  expected[10] = 'FF';
  await expect(page.locator('.cell-value')).toHaveText(expected);
  await expect(page.locator('#memory-relation-address')).toHaveText('0x0A');
  await expect(page.locator('#memory-relation-value')).toHaveText('0xFF');
  await cell(page, 11).click();
  await expect(page.locator('#memory-value')).toHaveText('0xA5');
  await cell(page, 10).click();
  await expect(page.locator('#memory-value')).toHaveText('0xFF');
  await writeHex(page, '0xf');
  await expect(page.locator('#memory-value')).toHaveText('0x0F');
  await expect(page.locator('#memory-decimal')).toHaveText('15 en décimal');
  await writeHex(page, ' 00 ');
  await expect(page.locator('#memory-value')).toHaveText('0x00');
  await expect(page.locator('.memory-bit[aria-pressed="true"]')).toHaveCount(0);
});

test('les saisies invalides ou supérieures à un octet sont refusées sans troncature', async ({ page }) => {
  await page.goto(memoryScreen);
  for (const invalid of ['', '100', '0x100', 'GG', '1G', '-1', '3.5', '0x', 'FFjunk']) {
    await writeHex(page, invalid);
    await expect(page.locator('#memory-write-value')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#memory-write-feedback')).toContainText('Aucune case n’a été modifiée');
    await expect(page.locator('.cell-value')).toHaveText(initialContents);
  }
  await writeHex(page, '80');
  await expect(page.locator('#memory-write-value')).not.toHaveAttribute('aria-invalid');
  await expect(page.locator('#memory-decimal')).toHaveText('128 en décimal');
});

test('chaque bit possède son poids, et Recommencer restaure l’exemple initial', async ({ page }) => {
  await page.goto(memoryScreen);
  await writeHex(page, '00');
  for (let bit = 0; bit < 8; bit++) {
    const control = page.getByRole('button', { name: `Bit ${bit}, poids ${2 ** bit}`, exact: true });
    await control.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#memory-decimal')).toHaveText(`${2 ** bit} en décimal`);
    await page.keyboard.press('Enter');
    await expect(page.locator('#memory-decimal')).toHaveText('0 en décimal');
  }
  await cell(page, 0).click();
  await writeHex(page, '12');
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await expect(page.locator('.cell-value')).toHaveText(initialContents);
  await expect(page.locator('#memory-address')).toHaveText('0x0A');
  await expect(page.locator('#memory-value')).toHaveText('0x3C');
  await expect(page.locator('.memory-cell[data-modified="true"]')).toHaveCount(0);
});

test('Reset memory met tous les octets à zéro et conserve les adresses', async ({ page }) => {
  await page.goto(memoryScreen);
  await cell(page, 5).click();
  await writeHex(page, 'AB');
  const addresses = await page.locator('.cell-address').allTextContents();
  await page.getByRole('button', { name: 'Reset memory', exact: true }).click();
  await expect(page.locator('.cell-value')).toHaveText(Array(16).fill('00'));
  await expect(page.locator('.cell-address')).toHaveText(addresses);
  await expect(page.locator('#memory-address')).toHaveText('0x05');
  await expect(page.locator('#memory-value')).toHaveText('0x00');
  await expect(page.locator('#memory-decimal')).toHaveText('0 en décimal');
  await expect(page.locator('.memory-bit[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('#memory-write-value')).toHaveValue('00');
  await expect(page.locator('#memory-relation-value')).toHaveText('0x00');
  await expect(page.locator('#memory-write-feedback')).toContainText('Les 16 octets');
  await expect(page.locator('.memory-cell[data-modified="true"]')).toHaveCount(0);
  await writeHex(page, '80');
  await expect(page.locator('.memory-cell[data-modified="true"]')).toHaveCount(1);
  await page.getByRole('link', { name: /Écran précédent/ }).click();
  await page.getByRole('link', { name: /Écran suivant : 27/ }).click();
  const expected = Array(16).fill('00');
  expected[5] = '80';
  await expect(page.locator('.cell-value')).toHaveText(expected);
  await page.getByRole('button', { name: 'Reset memory', exact: true }).click();
  await expect(page.locator('.cell-value')).toHaveText(Array(16).fill('00'));
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await expect(page.locator('.cell-value')).toHaveText(initialContents);
});

test('le ruban se parcourt au clavier sans dépasser les adresses disponibles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(memoryScreen);
  await cell(page, 10).focus();
  for (const [key, address] of [['ArrowRight', 11], ['ArrowRight', 12], ['ArrowLeft', 11], ['Home', 0], ['ArrowLeft', 0], ['ArrowRight', 1], ['End', 15], ['ArrowRight', 15]]) {
    await page.keyboard.press(key);
    await expect(cell(page, address)).toBeFocused();
    await expect(cell(page, address)).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(page.locator('#memory-announcement')).toContainText('Adresse 0x0F, soit 15 en décimal');
  await expect(page.locator('.memory-cell[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Bit 7, poids 128', exact: true })).toBeFocused();
  await page.locator('#memory-write-value').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#memory-address')).toHaveText('0x0F');
  expect(await cell(page, 15).evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});

test('défi corrigé, navigation entre modules et conservation pendant la session', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(memoryScreen);
  await writeHex(page, 'AA');
  const open = page.getByRole('button', { name: 'Vérifier ma compréhension' });
  await open.click();
  await expect(page.locator('#memory-challenge-title')).toBeFocused();
  await page.getByLabel('Son adresse devient 0xFF.', { exact: true }).check();
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await expect(page.locator('#memory-challenge .feedback')).toContainText('pas son adresse');
  await page.getByLabel('Son contenu devient 0xFF ; son adresse reste 0x0A.', { exact: true }).check();
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await expect(page.locator('#lesson-status')).toHaveText('27 / Notion comprise ✓');
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await page.getByRole('link', { name: /Écran précédent : 02/ }).click();
  await expect(page.locator('#chapter-letter')).toHaveText('A');
  await expect(page.locator('#screen-number')).toHaveText('02');
  await page.getByRole('link', { name: /Écran suivant : 27/ }).click();
  await expect(page.locator('#memory-title')).toBeFocused();
  await expect(page.locator('#chapter-letter')).toHaveText('F');
  await expect(page.locator('#memory-value')).toHaveText('0xAA');
  await expect(page.locator('#lesson-status')).toHaveText('27 / Notion comprise ✓');
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await open.click();
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  await expect(page.locator('#memory-challenge .feedback')).toBeEmpty();
  await expect(page.locator('#lesson-status')).toHaveText('27 / Adresse et contenu');
  await page.reload();
  await expect(page.locator('#memory-value')).toHaveText('0x3C');
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`mémoire et messages sans débordement horizontal à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(memoryScreen);
    await page.evaluate(() => document.fonts.ready);
    await writeHex(page, '100');
    await page.getByRole('button', { name: 'Vérifier ma compréhension' }).click();
    await expect(page.getByRole('radio').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Projection', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
