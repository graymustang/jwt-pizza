
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
    await route.fulfill({
      json: {
        users: [
          {
            id: '1',
            name: 'Pizza Diner',
            email: 'd@jwt.com',
            roles: [{ role: 'diner' }],
          },
          {
            id: '2',
            name: 'Pizza Admin',
            email: 'admin@jwt.com',
            roles: [{ role: 'admin' }],
          },
        ],
        more: false,
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
  await expect(page.getByRole('main')).toContainText('Pizza Diner');
  await expect(page.getByRole('main')).toContainText('d@jwt.com');
  await expect(page.getByRole('main')).toContainText('Pizza Admin');
  await expect(page.getByRole('main')).toContainText('admin@jwt.com');
});
