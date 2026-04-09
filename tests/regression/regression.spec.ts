import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import users from '../../fixtures/users.json';

const BASELINE_PRODUCT_NAMES = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
];

const BASELINE_PRODUCT_PRICES = [7.99, 9.99, 15.99, 15.99, 29.99, 49.99];

async function loginAsValidUser(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.validUser.username, users.validUser.password);
  await expect(page).toHaveURL(/inventory\.html/);
}

async function loginAsProblemUser(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.problemUser.username, users.problemUser.password);
  await expect(page).toHaveURL(/inventory\.html/);
}

function sortStrings(values: string[]) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sortNumbers(values: number[]) {
  return [...values].sort((a, b) => a - b);
}

test.describe('Regression Suite', () => {
  test('REG01 - El titulo de la pagina siempre es Swag Labs @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page).toHaveTitle('Swag Labs');
  });

  test('REG02 - El boton de login siempre esta presente y habilitado @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('REG03 - Username y password tienen placeholders correctos @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.usernameInput).toHaveAttribute('placeholder', 'Username');
    await expect(loginPage.passwordInput).toHaveAttribute('placeholder', 'Password');
  });

  test('REG04 - Siempre hay exactamente 6 productos @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await loginAsValidUser(page);
    await expect(inventory.productList).toHaveCount(6);
  });

  test('REG05 - Los nombres de productos no cambian entre runs @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await loginAsValidUser(page);

    const currentNames = (await inventory.getProductNames()).map((name) => name.trim());
    expect(sortStrings(currentNames)).toEqual(sortStrings(BASELINE_PRODUCT_NAMES));
  });

  test('REG06 - Los precios no cambian entre runs @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await loginAsValidUser(page);

    const currentPrices = await inventory.getProductPrices();
    expect(sortNumbers(currentPrices)).toEqual(sortNumbers(BASELINE_PRODUCT_PRICES));
  });

  test('REG07 - El sort funciona correctamente despues del login @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await loginAsValidUser(page);

    await inventory.sortBy('az');
    const azNames = await inventory.getProductNames();
    expect(azNames).toEqual(sortStrings(azNames));

    await inventory.sortBy('za');
    const zaNames = await inventory.getProductNames();
    expect(zaNames).toEqual(sortStrings(zaNames).reverse());

    await inventory.sortBy('lohi');
    const lowToHighPrices = await inventory.getProductPrices();
    expect(lowToHighPrices).toEqual(sortNumbers(lowToHighPrices));

    await inventory.sortBy('hilo');
    const highToLowPrices = await inventory.getProductPrices();
    expect(highToLowPrices).toEqual(sortNumbers(highToLowPrices).reverse());
  });

  test('REG08 - El contador del carrito refleja el numero correcto de items @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await loginAsValidUser(page);

    await inventory.addProductToCart('Sauce Labs Backpack');
    await inventory.addProductToCart('Sauce Labs Bike Light');

    await expect(inventory.cartBadge).toHaveText('2');
    expect(await inventory.getCartCount()).toBe(2);
  });

  test('REG09 - Los items del carrito persisten al navegar entre paginas @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    await loginAsValidUser(page);

    await inventory.addProductToCart('Sauce Labs Backpack');
    await inventory.goToCart();
    expect(await cart.getCartItemCount()).toBe(1);
    expect(await cart.getCartItemNames()).toContain('Sauce Labs Backpack');

    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventory.cartBadge).toHaveText('1');

    await inventory.goToCart();
    expect(await cart.getCartItemCount()).toBe(1);
  });

  test('REG10 - El precio en carrito coincide con inventario @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await loginAsValidUser(page);

    const productName = 'Sauce Labs Backpack';
    const itemInInventory = page.locator('.inventory_item').filter({ hasText: productName });
    const inventoryPriceText = (await itemInInventory.locator('.inventory_item_price').textContent()) ?? '';
    const inventoryPrice = parseFloat(inventoryPriceText.replace('$', ''));

    await inventory.addProductToCart(productName);
    await inventory.goToCart();

    const itemInCart = page.locator('.cart_item').filter({ hasText: productName });
    const cartPriceText = (await itemInCart.locator('.inventory_item_price').textContent()) ?? '';
    const cartPrice = parseFloat(cartPriceText.replace('$', ''));

    expect(cartPrice).toBe(inventoryPrice);
  });

  test('REG11 - El total de checkout siempre incluye tax @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await loginAsValidUser(page);

    await inventory.addProductToCart('Sauce Labs Backpack');
    await inventory.goToCart();
    await cart.proceedToCheckout();
    await checkout.fillShippingInfo(users.shippingInfo.firstName, users.shippingInfo.lastName, users.shippingInfo.postalCode);
    await checkout.continue();

    const subtotalText = (await page.locator('.summary_subtotal_label').textContent()) ?? '';
    const taxText = (await page.locator('.summary_tax_label').textContent()) ?? '';
    const totalText = await checkout.getTotal();

    const subtotal = parseFloat(subtotalText.replace('Item total: $', ''));
    const tax = parseFloat(taxText.replace('Tax: $', ''));
    const total = parseFloat(totalText.replace('Total: $', ''));

    await expect(page.locator('.summary_tax_label')).toContainText('Tax: $');
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('REG12 - El mensaje de confirmacion siempre es Thank you for your order! @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await loginAsValidUser(page);

    await inventory.addProductToCart('Sauce Labs Backpack');
    await inventory.goToCart();
    await cart.proceedToCheckout();
    await checkout.fillShippingInfo(users.shippingInfo.firstName, users.shippingInfo.lastName, users.shippingInfo.postalCode);
    await checkout.continue();
    await checkout.finish();

    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  test('REG13 - Despues de completar orden, el carrito queda vacio @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await loginAsValidUser(page);

    await inventory.addProductToCart('Sauce Labs Backpack');
    await inventory.goToCart();
    await cart.proceedToCheckout();
    await checkout.fillShippingInfo(users.shippingInfo.firstName, users.shippingInfo.lastName, users.shippingInfo.postalCode);
    await checkout.continue();
    await checkout.finish();

    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });

  test.describe('Problem User - Known Bugs Documentation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsProblemUser(page);
    });

    test('BUG-01 - Imagenes de productos son incorrectas @regression @problem-user @known-bug', async ({ page }) => {
      test.fail(true, 'Known bug: problem_user muestra imagen repetida en el catalogo.');

      const images = await page
        .locator('.inventory_item_img img')
        .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') ?? ''));
      const uniqueImages = new Set(images);

      // Comportamiento esperado para un usuario sano: 6 imagenes distintas.
      expect(uniqueImages.size).toBe(6);
    });

    test('BUG-02 - Sort Z-A no funciona correctamente @regression @problem-user @known-bug', async ({ page }) => {
      test.fail(true, 'Known bug: el ordenamiento Z-A no reordena correctamente con problem_user.');
      const inventory = new InventoryPage(page);

      await inventory.sortBy('za');
      const names = await inventory.getProductNames();
      const expectedDesc = [...names].sort((a, b) => a.localeCompare(b)).reverse();

      // Deberia estar ordenado de Z a A.
      expect(names).toEqual(expectedDesc);
    });

    test('BUG-03 - Last Name no acepta input en checkout @regression @problem-user @known-bug', async ({ page }) => {
      test.fail(true, 'Known bug: checkout ignora Last Name y muestra error de campo requerido.');
      const inventory = new InventoryPage(page);
      const cart = new CartPage(page);
      const checkout = new CheckoutPage(page);

      await inventory.addProductToCart('Sauce Labs Backpack');
      await inventory.goToCart();
      await cart.proceedToCheckout();

      await checkout.fillShippingInfo(users.shippingInfo.firstName, users.shippingInfo.lastName, users.shippingInfo.postalCode);
      await checkout.continue();

      // Flujo esperado: no debe aparecer error al enviar datos validos.
      await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    });

    test('BUG-04 - Algunos productos no se pueden agregar al carrito @regression @problem-user @known-bug', async ({ page }) => {
      test.fail(true, 'Known bug: no todos los productos se agregan correctamente al carrito con problem_user.');
      const inventory = new InventoryPage(page);

      for (const product of BASELINE_PRODUCT_NAMES) {
        await inventory.addProductToCart(product);
      }

      // Comportamiento esperado: contador debe quedar en 6.
      await expect(inventory.cartBadge).toHaveText(String(BASELINE_PRODUCT_NAMES.length));
    });
  });
});
