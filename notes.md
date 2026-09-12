# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      | home.tsx           | none              | none         |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx       | [post]/api/auth   | INSERT INTO user (name, email, password) VALUES (?, ?, ?) <br/>  INSERT INTO useRole (userId, role, objectId) VALUES (?, ?, ?)|
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx          | [PUT]/api/auth    |              |
| Order pizza                                         | payment.tsx        | [POST]/api/order  |              |
| Verify pizza                                        | delivery.tsx       |                   |              |
| View profile page                                   | dinerDashboard.tsx | none              | none         |
| View franchise<br/>(as diner)                       | franchiseDashboard.tsx|                |              |
| Logout                                              | logout.tsx         | [DELETE]/api/auth |              |
| View About page                                     | about.tsx          | none              | none         |
| View History page                                   | history.tsx        | none              | none         |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | home.tsx           |                   |              |
| View franchise<br/>(as franchisee)                  | home.tsx           |                   |              |
| Create a store                                      | createStore.tsx    | [post]/:franchiseId/store        |              |
| Close a store                                       | closeFranchise.tsx | [DELETE]/:franchiseId/store |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           | home.tsx           |                   |              |
| View Admin page                                     | adminDashboard.tsx |                   |              |
| Create a franchise for t@jwt.com                    | createFranchise.tsx| [POST]//                  |              |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx | [DELETE]/api/:franchiseId |              |
