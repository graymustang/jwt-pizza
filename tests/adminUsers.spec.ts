
import { test, expect } from './testSetup';

test('admin can list users', async ({ page }) => {
    await page.route('**/api/auth', async (route) => {
        if (route.request().method() === 'PUT') {
            await route.fulfill({
                json: {
                    user: {
                        id: '5',
                        name: 'admin',
                        email: 'a@jwt.com',
                        roles: [{ role: 'admin' }],
                    },
                    token: 'test-token',
                },
            });
            return;
        }
        await route.fallback();
    });

    await page.route('**/api/user/me', async (route) => {
        await route.fulfill({
            json: {
                id: '5',
                name: 'admin',
                email: 'a@jwt.com',
                roles: [{ role: 'admin' }],
            },
        });
    });

    await page.route('**/api/franchise?*', async (route) => {
        await route.fulfill({
            json: { franchises: [], more: false },
        });
    });



    await page.route('**/api/user?*', async (route) => {
        const url = new URL(route.request().url());
        const pageNumber = Number(url.searchParams.get('page') || '1');
        const limit = Number(url.searchParams.get('limit') || '10');
        const nameFilter = url.searchParams.get('name') || '*';

        const users = Array.from({ length: 23 }, (_, i) => ({
            id: String(i + 1),
            name: `Pizza User ${i + 1}`,
            email: `user${i + 1}@jwt.com`,
            roles: [{ role: 'diner' }],
        }));

        const filteredUsers = users.filter((user) =>
            user.name.toLowerCase().includes(
                nameFilter.replace(/\*/g, '').toLowerCase()
            )
        );

        const start = (pageNumber - 1) * limit;
        const pageUsers = filteredUsers.slice(start, start + limit);

        await route.fulfill({
            json: {
                users: pageUsers,
                more: start + limit < filteredUsers.length,
            },
        });
    });



    await page.goto('/');

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.goto('/admin-dashboard');

    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    const usersTable = page.getByRole('table', { name: 'Users' });

    await page.getByPlaceholder('Filter users').fill('User');
    await page.getByRole('button', { name: 'Search Users' }).click();

    await expect(usersTable.getByRole('cell', { name: 'Pizza User 1', exact: true })).toBeVisible();
    await expect(usersTable.getByRole('cell', { name: 'Pizza User 10', exact: true })).toBeVisible();
    await expect(usersTable.getByRole('cell', { name: 'user11@jwt.com', exact: true })).toHaveCount(0);

    // First page
    await expect(page.getByText('Page 1', { exact: true })).toBeVisible();

    // Second page
    await page.getByRole('button', { name: 'Next Users' }).click();

    await expect(usersTable.getByRole('cell', { name: 'Pizza User 11', exact: true })).toBeVisible();
    await expect(usersTable.getByRole('cell', { name: 'Pizza User 20', exact: true })).toBeVisible();
    await expect(usersTable.getByRole('cell', { name: 'user1@jwt.com', exact: true })).toHaveCount(0);
    await expect(page.getByText('Page 2', { exact: true })).toBeVisible();

    // Third page
    await page.getByRole('button', { name: 'Next Users' }).click();

    await expect(usersTable.getByRole('cell', { name: 'Pizza User 21', exact: true })).toBeVisible();
    await expect(usersTable.getByRole('cell', { name: 'Pizza User 23', exact: true })).toBeVisible();
    await expect(page.getByText('Page 3', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Users' })).toBeDisabled();

    // Go back
    await page.getByRole('button', { name: 'Previous Users' }).click();

    await expect(usersTable.getByRole('cell', { name: 'Pizza User 11', exact: true })).toBeVisible();
    await expect(page.getByText('Page 2', { exact: true })).toBeVisible();


});
