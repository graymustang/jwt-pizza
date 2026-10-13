import { test, expect } from './testSetup';

test('updateUser', async ({ page }) => {
    const email = `user${Date.now()}@jwt.com`;
    
    const password = 'diner';
    let account: any;
    let loggedInUser: any;

    await page.route('**/api/auth', async (route) => {
        const method = route.request().method();

        if (method === 'POST') {
            const body = route.request().postDataJSON();
            account = {
                id: '100',
                name: body.name,
                email: body.email,
                password: body.password,
                roles: [{ role: 'diner' }],
            };
            loggedInUser = account;
            await route.fulfill({ json: { user: account, token: 'test-token' } });
            return;
        }

        if (method === 'PUT') {
            const body = route.request().postDataJSON();
            if (!account || body.email !== account.email || body.password !== account.password) {
                await route.fulfill({ status: 404, json: { message: 'unknown user' } });
                return;
            }
            loggedInUser = account;
            await route.fulfill({ json: { user: account, token: 'test-token' } });
            return;
        }

        if (method === 'DELETE') {
            loggedInUser = undefined;
            await route.fulfill({ json: {} });
            return;
        }

        await route.fallback();
    });

    await page.route('**/api/user/me', async (route) => {
        await route.fulfill({ json: loggedInUser ?? null });
    });

    await page.route('**/api/user/100', async (route) => {
        if (route.request().method() !== 'PUT' || !account) {
            await route.fallback();
            return;
        }

        const changes = route.request().postDataJSON(); account = { ...account, ...changes }; loggedInUser = account; await route.fulfill({ json: { user: account, token: 'test-token' } });
    });

    await page.route('**/api/order', async (route) => {
        await route.fulfill({ json: { id: '1', dinerId: '100', orders: [] }, });
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByRole('link', { name: 'pd' }).click();
    await expect(page.getByRole('main')).toContainText('pizza diner');
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('dialog').locator('input[type="text"]').first().fill('pizza dinerx');
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByRole('main')).toContainText('pizza dinerx');

    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'pd' }).click();
    await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

