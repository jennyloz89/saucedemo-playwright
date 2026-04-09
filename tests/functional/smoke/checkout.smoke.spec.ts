import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { InventoryPage } from '../../../pages/InventoryPage';
import { CartPage } from '../../../pages/CartPage';
import { CheckoutPage } from '../../../pages/CheckoutPage';
import users from '../../../fixtures/users.json';

test.describe('Smoke - Checkout', () => {
  test('SMK05 - Checkout happy path @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await login.goto();
    await login.login(users.validUser.username, users.validUser.password);
    await expect(page).toHaveURL(/inventory\.html/);

    await inventory.addProductToCart('Sauce Labs Backpack');
    await inventory.goToCart();

    await cart.proceedToCheckout();
    await checkout.fillShippingInfo(
      users.shippingInfo.firstName,
      users.shippingInfo.lastName,
      users.shippingInfo.postalCode
    );
    await checkout.continue();
    await checkout.finish();

    await expect(page.locator('.complete-header')).toBeVisible();
  });
});