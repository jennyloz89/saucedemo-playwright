import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import users from '../../fixtures/users.json';

test.describe('Login — Functional Tests', () => {

    test('TC01 — Login exitoso con usuario válido', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.validUser.username, users.validUser.password);
        await expect(page).toHaveURL('/inventory.html');
    });

    test('TC02 — Login fallido con usuario inválido', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.invalidUser.username, users.invalidUser.password);
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Username and password do not match');
    });

    test('TC03 — Login fallido con usuario bloqueado', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.lockedUser.username, users.lockedUser.password);
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Sorry, this user has been locked out');
    });

    test('TC04 — Login fallido con campos vacíos', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('', '');
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Username is required');
    });

    test('TC05 — Login fallido con password vacío', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.validUser.username, '');
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Password is required');
    });

    test('TC06 — Logout exitoso', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.validUser.username, users.validUser.password);
        await expect(page).toHaveURL('/inventory.html');

        await page.locator('#react-burger-menu-btn').click();
        await page.locator('[data-test="logout-sidebar-link"]').click();
        await expect(page).toHaveURL('/');
    });
});