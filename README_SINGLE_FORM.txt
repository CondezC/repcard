SINGLE FORM VERSION

Changes:
- Removed register.html and register.js specimen card step.
- form.html now submits directly to Firestore collection: sss-submissions.
- Admin dashboard shows only the submitted Company Representative Authorization Card data.
- Status starts as pending.
- Admin can approve or reject.

Main flow:
1. User logs in at login.html
2. User opens dashboard.html
3. User fills form.html
4. Submission appears in admin.html
5. Admin approves/rejects

Push:
git add .
git commit -m "single form direct admin submission"
git push

Firebase:
No new Firebase setup needed if Auth + Firestore rules are already working.
