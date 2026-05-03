UNIFIED LOGIN VERSION

Default:
- index.html redirects to login.html
- login.html is now the only login page.
- signup.html registers normal users only.
- admin-login.html redirects to login.html for compatibility.

Role behavior:
- If users/{uid}.role is "admin" -> login redirects to admin.html
- Otherwise -> login redirects to dashboard.html

How to make an admin:
1. Register normally using signup.html.
2. Firebase Console > Firestore Database > users.
3. Click the user document.
4. Edit field:
   role = admin
5. Login again using login.html.

Push:
git add .
git commit -m "unified role based login"
git push
