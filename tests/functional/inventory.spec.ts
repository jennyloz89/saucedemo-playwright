import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import users from '../../fixtures/users.json';

test.describe('Inventory — Functional Tests', () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.validUser.username, users.validUser.password);
    });

    test('TC07 — Página de inventario carga correctamente', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const count = await inventory.productList.count();
        expect(count).toBe(6);
    });

    test('TC08 — Agregar producto al carrito', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.addProductToCart('Sauce Labs Backpack');
        const count = await inventory.getCartCount();
        expect(count).toBe(1);
    });

    test('TC09 — Agregar múltiples productos al carrito', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.addProductToCart('Sauce Labs Backpack');
        await inventory.addProductToCart('Sauce Labs Bike Light');
        const count = await inventory.getCartCount();
        expect(count).toBe(2);
    });

    test('TC10 — Remover producto del carrito desde inventario', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.addProductToCart('Sauce Labs Backpack');
        await inventory.removeProductFromCart('Sauce Labs Backpack');
        const badge = page.locator('[data-test="shopping-cart-badge"]');
        await expect(badge).not.toBeVisible();
    });

    test('TC11 — Ordenar productos A-Z', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.sortBy('az');
        const names = await inventory.getProductNames();
        const sorted = [...names].sort();
        expect(names).toEqual(sorted);
    });

    test('TC12 — Ordenar productos por precio menor a mayor', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.sortBy('lohi');
        const prices = await inventory.getProductPrices();
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
    });
});