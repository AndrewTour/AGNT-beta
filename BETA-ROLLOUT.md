# AGNT BETA v1.35.0 — Rollout Check

## Before team setup

1. Deploy the bundled `firestore.rules` to Firebase project `daily-accountability-be0ac`.
2. Upload the replacement BETA web package.
3. Reopen the installed PWA and allow the new service worker/cache to activate.
4. Confirm an existing account loads its historical Today, Contacts/Prospecting, Appointments and Insights data.

## Team meeting rollout

1. Team owner opens Settings → Team setup and creates the Team.
2. Copy the generated invite code.
3. Each existing user signs in with their existing Firebase account.
4. Each user opens Team setup → Join a team and enters the invite code.
5. Confirm each person appears in Team Management / Team Leaderboard.
6. Change one user’s Calls/Connects/Data and confirm Daily updates on another device.
7. Confirm the current Weekly leaderboard updates on another device.

## Acceptance

- Existing personal history is present before and after joining.
- Contacts/prospecting data remains private to each UID.
- Appointments remain present.
- Daily and Weekly team leaderboards update live.
- Team owner can view members and ordinary members can leave.
- No user creates a new Firebase account for this rollout.
