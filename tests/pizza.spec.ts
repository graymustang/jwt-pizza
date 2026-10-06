import { test, expect } from './testSetup';
import { Page } from '@playwright/test';


async function basicInit(page: Page) {
    let loggedInUser: any;
    let stores = [
        {
            id: '10',
            name: 'Test store',
            totalRevenue: 0,
        },
    ];
    const validUsers: Record<string, any> = {
        'd@jwt.com': {
            id: '3',
            name: 'pizza diner',
            email: 'd@jwt.com',
            password: 'diner',
            roles: [{ role: 'diner' }],
        },
        'f@jwt.com': {
            id: '4',
            name: 'franchise owner',
            email: 'f@jwt.com',
            password: 'franchisee',
            roles: [{ role: 'franchisee', objectId: '1' }],
        },
        'a@jwt.com': {
            id: '5',
            name: 'admin',
            email: 'a@jwt.com',
            password: 'admin',
            roles: [{ role: 'admin' }],
        },
    };

    //login/registe /logout
    await page.route('*/**/api/auth', async (route) => {
        const method = route.request().method();
        if (method === 'PUT') {
            const body = route.request().postDataJSON();
            const user = validUsers[body.email];

            if (!user || user.password !== body.password) {
                await route.fulfill({
                    status: 404,
                    json: { message: 'unknown user' },
                });
                return;
            }

            loggedInUser = user;

            await route.fulfill({
                json: {
                    user,
                    token: 'abcdef',
                },
            });

            return;
        }
        if (method === 'POST') {
            const body = route.request().postDataJSON();
            loggedInUser = {
                id: '100',
                name: body.name,
                email: body.email,
                roles: [{ role: 'diner' }],
            };
            await route.fulfill({
                json: {
                    user: loggedInUser,
                    token: 'abcdef',
                },
            });
            return;
        }

        if (method === 'DELETE') {
            loggedInUser = undefined;
            await route.fulfill({ json: {} });
            return;
        }
        await route.fallback();
    });

    //current user
    await page.route('*/**/api/user/me', async (route) => {
        await route.fulfill({
            json: loggedInUser,
        });
    });

    //pizza menu
    await page.route('*/**/api/order/menu', async (route) => {
        await route.fulfill({
            json: [
                {
                    id: '1',
                    title: 'Veggie',
                    image: 'pizza1.png',
                    price: 0.0038,
                    description: 'A garden of delight',
                },
                {
                    id: '2',
                    title: 'Pepperoni',
                    image: 'pizza2.png',
                    price: 0.0042,
                    description: 'Spicy treat',
                },
                {
                    id: '3',
                    title: 'Margarita',
                    image: 'pizza3.png',
                    price: 0.0014,
                    description: 'Essential classic',
                },
            ],
        });
    });

    //franchise list used by menu
    await page.route(/\/api\/franchise\?.*$/, async (route) => {
        await route.fulfill({
            json: {
                franchises: [
                    {
                        id: '1',
                        name: 'Test Franchise',
                        stores: [
                            {
                                id: '3',
                                name: 'SLC',
                                totalRevenue: 0,
                            },
                        ],
                    },
                ],
                more: false,
            },
        });
    });

    //franchise owned by f@jwt.com
    await page.route(/\/api\/franchise\/\d+$/, async (route) => {
        if (route.request().method() === 'GET') {
            const url = route.request().url();
            const userId = url.split('/').pop();
            if (userId === '3') {
                await route.fulfill({
                    json: [],
                });
                return;
            }
            if (userId === '4') {
                await route.fulfill({
                    json: [
                        {
                            id: '1',
                            name: 'Test Franchise',
                            stores: stores,
                        },
                    ],
                });
                return;
            }
            await route.fulfill({
                json: [],
            });
            return;
        }

        await route.fallback();
    });

    await page.route('*/**/api/franchise/1/store', async (route) => {
        if (route.request().method() === 'POST') {
            const body = route.request().postDataJSON();

            const newStore = {
                id: String(stores.length + 11),
                name: body.name,
                totalRevenue: 0,
            };

            stores.push(newStore);

            await route.fulfill({
                json: newStore,
            });

            return;
        }

        await route.fallback();
    });

    //orders
    await page.route('*/**/api/order', async (route) => {
        const method = route.request().method();
        if (method === 'POST') {
            const order = route.request().postDataJSON();
            await route.fulfill({
                json: {
                    order: {
                        ...order,
                        id: '23',
                        date: new Date().toISOString(),
                    },
                    jwt: 'fake-jwt',
                },
            });

            return;
        }
        if (method === 'GET') {
            await route.fulfill({
                json: {
                    id: '1',
                    dinerId: '3',
                    orders: [
                        {
                            id: '16',
                            franchiseId: '1',
                            storeId: '3',
                            date: new Date().toISOString(),
                            items: [
                                {
                                    menuId: '1',
                                    description: 'Veggie',
                                    price: 0.0038,
                                },
                            ],
                        },
                    ],
                },
            });

            return;
        }

        await route.fallback();
    });

    await page.goto('/');

    await page.route(/\/api\/franchise\/1\/store\/\d+$/, async (route) => {
        if (route.request().method() === 'DELETE') {
            const storeId = route.request().url().split('/').pop();
            stores = stores.filter(
                (store) => String(store.id) !== storeId
            );
            await route.fulfill({
                json: {},
            });
            return;
        }
        await route.fallback();
    });
}
test('home page', async ({ page }) => {
    await basicInit(page);

    expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
    await basicInit(page);


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
    await basicInit(page);;
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');

    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'pd' })).toBeVisible();

});

test('login fails with wrong password', async ({ page }) => {
    await basicInit(page);;
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await expect(page.getByText('{"code":404,"message":"unknown user"}')).toBeVisible();
});

test('logout', async ({ page }) => {
    await basicInit(page);

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
    await basicInit(page);

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
});

test('register', async ({ page }) => {
    await basicInit(page);

    const email = `test${Date.now()}@jwt.com`

    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'TU' }).click();
});

test('franchise dashboard', async ({ page }) => {
    await basicInit(page);

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
});


test('admin dashboard', async ({ page }) => {
    await basicInit(page);

    //login as admin
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');

    await expect(page.getByText("The web's best pizza", { exact: true })).toBeVisible();
    await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();
    await expect(page.getByText('Franchises')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
});

test('create store', async ({ page }) => {
    test.setTimeout(15000);
    await basicInit(page);
    const storeName = `Test store ${Date.now()}`;

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();

    await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
    await page.getByRole('button', { name: 'Create store' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill(storeName);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('cell', { name: storeName })).toBeVisible();
});

test('close store', async ({ page }) => {
    test.setTimeout(15000);

    await basicInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');

    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();

    const storeRow = page.getByRole('row').filter({ hasText: /Test store/i });
    await expect(storeRow.first()).toBeVisible();
    await storeRow.first().getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText(/Sorry to see you go/i)).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
});

test('about page', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('main')).toBeVisible();
});

test('not found page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    await expect(page.getByText('oops')).toBeVisible();
});

test('delivery page', async ({ page }) => {
    test.setTimeout(15000);
    await basicInit(page);

    await page.getByRole('link', { name: 'Order' }).click();
    await page.getByRole('combobox').selectOption('3');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'Pay now' }).click();

    await expect(page.getByRole('heading', { name: 'Here is your JWT Pizza!' })).toBeVisible();
    await expect(page.getByText(/order ID:/i)).toBeVisible();
    await expect(page.getByText(/pie count:/i)).toBeVisible();
    await expect(page.getByText(/total:/i)).toBeVisible();
    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(page.getByText('JWT Pizza - invalid')).toBeAttached();
});

test('history page', async ({ page }) => {
    await page.goto('/history');

    await expect(page.getByRole('heading', { name: 'Mama Rucci, my my' })).toBeVisible();
    await expect(page.getByText(/It all started in Mama Ricci's kitchen/i)).toBeVisible();
});


test('order now button', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('button', { name: 'Order now' }).click();
    await expect(page).toHaveURL(/\/menu/);
});
