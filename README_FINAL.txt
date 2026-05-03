FINAL e-RepCard Project

Default site opens login.html because index.html redirects to login.

Main pages:
- login.html = User login
- signup.html = User registration only
- admin-login.html = Admin login only
- dashboard.html = User dashboard
- form.html = Company Representative Authorization Card form
- register.html = Specimen Signature Card form
- my-submissions.html = user application status
- admin.html = admin approval dashboard

After extracting:
1. Replace your project folder files with these files.
2. Check auth-config.js matches your Firebase project.
3. Push to GitHub:
   git add .
   git commit -m "final auth UI and login redirect"
   git push
4. GitHub Pages URL should open login first.

Admin account:
Register user first, then Firebase > Firestore > users > your user document > set role = admin.
