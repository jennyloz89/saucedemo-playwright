import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import users from '../../../fixtures/users.json';

test.describe('Smoke - Login', () => {
  test('SMK01 - Login válido @smoke', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login(users.validUser.username, users.validUser.password);

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('SMK02 - Login inválido @smoke', async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login(users.invalidUser.username, users.invalidUser.password);

    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });
});