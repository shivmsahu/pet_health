# Pawday 🐾

A cute, minimal React Native companion for keeping every pet's meals, medicine, play, walks, memories, and milestones together. The app now includes a local-first MVP implementation: persisted pet profiles, date-aware care reminders, completion history, streaks and awards, journal moments with optional photos, and local notifications.

## Run locally

```bash
npm install
npm run web       # or npm run ios / npm run android
npm test          # domain and recurrence tests
npm run typecheck
```

Data is stored locally with AsyncStorage. Notification delivery depends on the device permission and platform; the in-app schedule remains available when notifications are disabled.

See [PRD.md](./PRD.md) for the product requirements, acceptance criteria, and remaining production hardening work.
