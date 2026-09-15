# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      | home.tsx           | none              | none         |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx       | [post]/api/auth   | `INSERT INTO user (name, email, password) VALUES (?, ?, ?)` <br/>  `INSERT INTO useRole (userId, role, objectId) VALUES (?, ?, ?)`|
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx          | [PUT]/api/auth    | `SELECT * FROM user WHERE email=?`             |
| Order pizza                                         | payment.tsx        | [POST]/api/order  | `INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (?, ?, ?, now())` <br/> `INSERT INTO orderItem (orderId, menuId, description, price) VALUES (?, ?, ?, ?)`             |
| Verify pizza                                        | delivery.tsx       | [POST]/api/order/verify | none   |
| View profile page                                   | dinerDashboard.tsx | [GET]/api/order   | none         |
| View franchise<br/>(as diner)                       | franchiseDashboard.tsx| [GET]/api/franchise/:userId | `SELECT objectId FROM userRole WHERE role='franchisee' AND userId=?` <br/> `SELECT id, name FROM franchise WHERE id in (${franchiseIds.join(',')}` |
| Logout                                              | logout.tsx         | [DELETE]/api/auth | none         |
| View About page                                     | about.tsx          | none              | none         |
| View History page                                   | history.tsx        | none              | none         |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx          | [PUT]/api/auth    | `SELECT * FROM user WHERE email=?` |
| View franchise<br/>(as franchisee)                  | franchiseDashboard.tsx| [GET]/api/franchise/:userId   | `SELECT objectId FROM userRole WHERE role='franchisee' AND userId=?` <br/> `SELECT id, name FROM franchise WHERE id in (${franchiseIds.join(',')}` |
| Create a store                                      | createStore.tsx    | [post]/api/franchise/:franchiseId/store | `INSERT INTO store (franchiseId, name) VALUES (?, ?)` |
| Close a store                                       | closeStore.tsx     | [DELETE]/api/franchise/:franchiseId/store/:storeid | `DELETE FROM store WHERE franchiseId=? AND id=?` |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx          | [PUT]/api/auth    | `SELECT * FROM user WHERE email=?` <br/> `SELECT * FROM userRole WHERE userId=?` |
| View Admin page                                     | adminDashboard.tsx | [GET]/api/franchise?page=0&limit=10&name=* | `SELECT id, name FROM franchise WHERE name LIKE ? LIMIT ${limit + 1} OFFSET ${offset}` <br/> `SELECT id, name FROM store WHERE franchiseId=?` |
| Create a franchise for t@jwt.com                    | createFranchise.tsx| [POST]/api/franchise | `SELECT id, name FROM user WHERE email=?` <br/> `INSERT INTO franchise (name) VALUES (?)`    |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx | [DELETE]/api/franchise/:franchiseId |`DELETE FROM store WHERE franchiseId=?` <br/> `DELETE FROM userRole WHERE objectId=?` <br/> `DELETE FROM franchise WHERE id=?`|
