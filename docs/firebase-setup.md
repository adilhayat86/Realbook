# Firebase Setup Checklist

DealerTribe can now use Firestore for shared listings, requirements, and comments when Firebase environment variables are configured.

Without Firebase env values, the app keeps using local AsyncStorage fallback.

## 1. Create Firebase project

1. Go to Firebase Console.
2. Create a project for DealerTribe / Realbook.
3. Add a Web app.
4. Copy the Firebase config values.

## 2. Create `.env`

Copy `.env.example` to `.env` and fill:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Restart Expo after changing `.env`.

## 3. Enable Firestore

In Firebase Console:

1. Open Firestore Database.
2. Create database.
3. Start in test mode for private alpha testing only.
4. Use a region close to Pakistan if available.

## 4. Collections currently used

The app is prepared to use these Firestore collections:

- `listings`
- `requirements`
- `comments`
- `users`
- `agents`
- `notifications`

Currently wired with cloud-if-ready fallback:

- requirements
- comments
- listings

Still local/pending migration:

- auth/users
- agents/admin approval
- notifications

## 5. Required two-device test

After `.env` is configured:

1. Run app in Browser A.
2. Run app in Browser B or another phone.
3. Post a requirement in A.
4. Confirm B sees it after refresh.
5. Post a listing in A.
6. Confirm B sees it after refresh.
7. Add a comment in B.
8. Confirm A sees it after refresh.

If this passes, the app is no longer separate-universe for listings, requirements, and comments.

## 6. Important warning

Do not invite dealers for a live dinner test until the two-device test passes.
