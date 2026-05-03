SEPARATE LOGIN VERSION

User login:
- login.html
- For applicants/users only.
- If an admin account tries to login here, it will be blocked and told to use Admin Login.

Admin login:
- admin-login.html
- Only Firebase users with role: "admin" can continue to admin.html.

How to make an admin:
1. Register account normally.
2. Firebase Console > Firestore Database > users
3. Open that user document.
4. Change role from "user" to "admin".
5. Login using admin-login.html.

Live URLs:
- User: https://condezc.github.io/erepcard-system/login.html
- Admin: https://condezc.github.io/erepcard-system/admin-login.html

Upload/push these updated files to GitHub.
