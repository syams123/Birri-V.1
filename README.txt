BIRRI AUTH 2.0 — Syams Digital
1. Backup repo. Enable Email/Password in Firebase Authentication > Sign-in method. Keep Google enabled. Configure password policy minimum 8 in Firebase (client check alone is insufficient).
2. Upload new/replacement files from this ZIP into existing repo at matching paths. Keep all existing assets, css/dashboard.css, css/legal.css, js/firestore.js, dashboard.html. The existing welcome.css is no longer used by index.html.
3. In dashboard.html change ./js/dashboard.js?v=2 to ./js/dashboard.js?v=3 for cache busting. Do not change markup.
4. Paste firestore.rules into Firebase console Rules and Publish. It adds verified-email requirement for all users. No data migration is needed. Verify existing Google users have verified email.
5. Keep assets/images/welcome-bg.webp, dashboard-bg.webp, birri-logo.webp. New index renders welcome art above controls, may scroll on smaller screens.
6. Test registration, wrong passwords, reset, verification (open email then return and click Saya sudah verifikasi), Google sign-in, logout, existing data, denied Firestore for unverified users. Firebase default hosted action handler used for email links. No OAuth branding changes needed. No manual account-linking UI included. Terms and privacy updated from previous legal UI; review prior to publishing. No live Firebase/browser testing performed.
