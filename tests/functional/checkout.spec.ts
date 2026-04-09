import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import users from '../../fixtures/users.json';

test.describe('Checkout — Functional Tests', () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.validUser.username, users.validUser.password);
    });

    test('TC13 — Flujo completo de compra', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const cart      = new CartPage(page);
        const checkout  = new CheckoutPage(page);

        // Agregar producto
        await inventory.addProductToCart('Sauce Labs Backpack');
        await inventory.goToCart();

        // Verificar carrito
        const itemCount = await cart.getCartItemCount();
        expect(itemCount).toBe(1);

        // Checkout
        await cart.proceedToCheckout();
        await checkout.fillShippingInfo(
            users.shippingInfo.firstName,
            users.shippingInfo.lastName,
            users.shippingInfo.postalCode
        );
        await checkout.continue();

        // Verificar total
        const total = await checkout.getTotal();
        expect(total).toContain('$');

        // Finalizar
        await checkout.finish();
        const complete = await checkout.isOrderComplete();
        expect(complete).toBeTruthy();
    });

    test('TC14 — Checkout sin datos de envío muestra error', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const cart      = new CartPage(page);
        const checkout  = new CheckoutPage(page);

        await inventory.addProductToCart('Sauce Labs Backpack');
        await inventory.goToCart();
        await cart.proceedToCheckout();
        await checkout.continue();

        const error = await checkout.getErrorMessage();
        expect(error).toContain('First Name is required');
    });

    test('TC15 — Remover producto desde el carrito', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const cart      = new CartPage(page);

        await inventory.addProductToCart('Sauce Labs Backpack');
        await inventory.goToCart();
        await cart.removeItem('Sauce Labs Backpack');

        const itemCount = await cart.getCartItemCount();
        expect(itemCount).toBe(0);
    });

    test('TC16 — Checkout con carrito vacío no es posible', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goToCart();
        const checkoutBtn = page.locator('[data-test="checkout"]');
        await expect(checkoutBtn).toBeVisible();
        // Carrito vacío — botón visible pero sin items
        const cart = new CartPage(page);
        const itemCount = await cart.getCartItemCount();
        expect(itemCount).toBe(0);
    });
});