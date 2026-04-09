import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { InventoryPage } from '../../../pages/InventoryPage';
import users from '../../../fixtures/users.json';

test.describe('Smoke - Inventory', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(users.validUser.username, users.validUser.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('SMK03 - Inventario visible @smoke', async ({ page }) => {
    const inventory = new InventoryPage(page);

    await expect(inventory.productList.first()).toBeVisible();
    await expect(inventory.cartIcon).toBeVisible();
  });

  test('SMK04 - Add to cart básico @smoke', async ({ page }) => {
    const inventory = new InventoryPage(page);

    await inventory.addProductToCart('Sauce Labs Backpack');
    await expect(inventory.cartBadge).toHaveText('1');
  });
});