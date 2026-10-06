import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
    await page.goto('/');

    expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
    await page.goto('/');


    await page.getByRole('link', { name: 'Order' }).click();
    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('3');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await page.getByRole('link', { name: 'Image Description Margarita' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 3');
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('main')).toContainText('Send me those 3 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tbody')).toContainText('Margarita');
    await page.getByRole('button', { name: 'Pay now' }).click();
});

test('login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');

    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'pd' })).toBeVisible();

});

test('login fails with wrong password', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await expect(page.getByText('{"code":404,"message":"unknown user"}')).toBeVisible();
});

test('logout', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await page.getByRole('link', { name: 'Logout' }).click();

    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

    await expect(page.getByText("The web's best pizza", { exact: true })).toBeVisible();
});

test('diner dashboard', async ({ page }) => {
    await page.goto('/');

    //login first
    await page.getByRole('link', { name: 'Login', exact: true }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');

    //then click on the diner dashboard

    await page.getByRole('link', { name: 'pd' }).click();
    await expect(page.getByRole('heading', { name: 'Your pizza kitchen' })).toBeVisible();
    await expect(page.getByText('pizza diner')).toBeVisible();
    await expect(page.getByText('d@jwt.com')).toBeVisible();
    await expect(page.getByText(/history of all the good times/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
})

test('register', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill('testUser@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'TU' }).click();
})

test('franchise dashboard', async ({ page }) => {
    await page.goto('/');

    //login first
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');

    await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();

    //then go to franchise dashboard
    await expect(page.getByText(/So you want a piece of the/i)).toBeVisible();
    await expect(page.getByText(/If you are already a/i)).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Year' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Profit' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Costs' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Franchise Fee' })).toBeVisible();
})