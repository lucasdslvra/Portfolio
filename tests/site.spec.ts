import { expect, test } from '@playwright/test';

const cornerList = 'ol[aria-label="Les virages du tour"]';

test.describe('Accueil', () => {
  test('la liste des virages se parcourt au clavier et sélectionne le projet', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator(`${cornerList} a`);
    await expect(rows).toHaveCount(5);

    await rows.first().focus();
    await expect(rows.first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(rows.nth(1)).toBeFocused();
    await expect(rows.nth(1)).toHaveAttribute('data-selected', 'true');
    await expect(rows.first()).toHaveAttribute('data-selected', 'false');

    const card = page.locator('section[aria-label="Projet sélectionné"] article:visible');
    await expect(card.getByRole('heading', { level: 2 })).toHaveText('SpotiFiles');

    // Entrée suit le lien : chaque ligne est un vrai lien vers l'article.
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/projets\/spotifystats$/);
  });

  test('le survol ouvre la vue embarquée du bon projet', async ({ page }) => {
    await page.goto('/');
    const scene = page.locator('[class*="Onboard_scene"]');
    await expect(scene).toHaveAttribute('data-open', 'false');

    await page.locator(`${cornerList} a`).nth(2).hover();
    await expect(scene).toHaveAttribute('data-open', 'true');
    await expect(scene).toHaveAttribute('aria-label', /virage 14, Château d'Eau.*MrVeto/);
    await expect(scene.getByText('MrVeto', { exact: true })).toBeVisible();

    // Sortie de la liste : retour à la carte.
    await page.mouse.move(5, 5);
    await expect(scene).toHaveAttribute('data-open', 'false');
  });
});

test('les filtres de /projets changent l’URL et la liste', async ({ page }) => {
  await page.goto('/projets');
  const titles = page.locator('main article h2');
  await expect(titles).toHaveCount(4);

  const equipe = page.getByRole('button', { name: /^Équipe/ });
  await equipe.click();
  await expect(page).toHaveURL(/\/projets\?cat=equipe$/);
  await expect(equipe).toHaveAttribute('aria-pressed', 'true');
  await expect(titles).toHaveCount(1);
  await expect(titles.first()).toHaveText('MrVeto');

  await page.getByRole('button', { name: /^Tous/ }).click();
  await expect(page).toHaveURL(/\/projets$/);
  await expect(titles).toHaveCount(4);
});

test('le bouton copier copie l’adresse e-mail', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/contact');
  await page.getByRole('button', { name: "Copier l'adresse" }).click();
  await expect(page.getByRole('button', { name: 'Adresse copiée ✓' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('lucasdslvra@gmail.com');
});

test('la 404 s’affiche', async ({ page }) => {
  const response = await page.goto('/cette-page-nexiste-pas');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sortie de piste');
  await expect(page.getByRole('link', { name: 'Revenir sur la piste' })).toHaveAttribute('href', '/');
});

test.describe('animations réduites', () => {
  test.use({ reducedMotion: 'reduce' });

  test('aucune vidéo ne se lance', async ({ page }) => {
    await page.goto('/');
    await page.locator(`${cornerList} a`).first().hover();
    await expect(page.locator('[class*="Onboard_scene"]')).toHaveAttribute('data-open', 'true');
    await page.waitForTimeout(500);
    const playing = await page.evaluate(() =>
      Array.from(document.querySelectorAll('video')).filter((v) => !v.paused).length,
    );
    expect(playing).toBe(0);
  });
});

test('les liens internes passent par une transition de page et naviguent', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const w = window as Window & { transitions?: number };
    w.transitions = 0;
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (cb) => {
      w.transitions = (w.transitions ?? 0) + 1;
      return original(cb);
    };
  });
  await page.getByRole('link', { name: 'Lire le projet AC Paddock' }).click();
  await expect(page).toHaveURL(/\/projets\/acpaddock$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('AC Paddock');
  expect(await page.evaluate(() => (window as Window & { transitions?: number }).transitions)).toBe(1);
});

test.describe('menu mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('s’ouvre, se ferme (bouton, Échap) et suit les liens', async ({ page }) => {
    await page.goto('/projets/acpaddock');
    const trigger = page.getByRole('button', { name: 'Menu' });
    const dialog = page.getByRole('dialog', { name: 'Menu' });

    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-state', 'open');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await dialog.getByRole('button', { name: 'Fermer' }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await trigger.click();
    await dialog.getByRole('link', { name: /^Contact/ }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(dialog).toBeHidden();
  });
});

test('une image d’article passe au premier plan puis revient', async ({ page }) => {
  await page.goto('/projets/acpaddock');
  const trigger = page.getByRole('button', { name: "Agrandir l'image : Page de connexion Discord" });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Page de connexion Discord' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Fermer' })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});
