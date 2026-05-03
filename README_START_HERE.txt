e-RepCard Full Stack Firebase Version

Start here:
- login.html

Pages:
- signup.html - user registration
- login.html - user login
- dashboard.html - user dashboard
- index.html - first application form
- register.html - second specimen signature form
- my-submissions.html - user status monitor
- admin.html - admin monitor
- summary.html?id=SUBMISSION_ID - public/QR summary page

Before deploy:
1. Enable Firebase Authentication Email/Password.
2. Create Firestore database.
3. Apply rules in FIREBASE_SETUP_AND_RULES.txt.
4. Register your own account.
5. In Firestore users collection, edit your user document role from "user" to "admin".
6. Deploy to Vercel/InfinityFree/static hosting.

Important:
This is full-stack using Firebase Auth + Firestore, no PHP/MySQL needed.
