# react-native-social-app

Cross-platform social media mobile app built with React Native (Expo), TypeScript, Redux Toolkit and Firebase, featuring real-time messaging, posts and user profiles.

The app talks to its backend through one interface (`src/services/types.ts`). Two implementations ship with it:

- **`MockService`** (default): in-memory, no setup, includes an echo bot so chat works offline. Also used by the tests.
- **`FirebaseService`**: Firebase Auth (anonymous sign-in with a display name) + Cloud Firestore. Enabled automatically when all `EXPO_PUBLIC_FIREBASE_*` variables are set (see `.env.example`).

## Features

- Sign in with a display name
- Feed: publish posts (280 chars), like / unlike, pull to refresh
- Realtime chat rooms: a live subscription per open room, cleaned up on switch/leave
- Profile: edit name and bio, post count, sign out
- Redux Toolkit store with injected service; slices covered by tests

## Getting started

```bash
npm install
npm start          # then press a / i, or scan the QR code with Expo Go
npm test           # store + service tests (no device needed)
npm run typecheck
```

### Using Firebase

1. Create a Firebase project, enable **Anonymous** sign-in and create a Firestore database.
2. Copy `.env.example` to `.env` and fill in the four values.
3. Suggested Firestore rules: authenticated users can read everything, create their own posts/messages and edit only their `users/{uid}` document.

Firestore layout: `users/{uid}`, `posts/{id}`, `chats/{id}/messages/{id}` (create the `chats` documents with a `title` field).

## Structure

```
App.tsx                 navigation + providers
src/services/           SocialService interface, MockService, FirebaseService
src/store/              auth, posts, chat slices
src/screens/            Login, Feed, Chat, Profile
src/components/         PostCard, Avatar
tests/                  node:test suites for the store and services
```

## Development history

This project was developed locally between 2025-11-26 and 2025-12-17. The commit history was created afterwards, and the commit dates were adjusted to match the period in which the work was actually done.
