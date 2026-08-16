# AGNT BETA v1.35.1 — Delete Team

Consumer-ready BETA promotion built from the confirmed AGNT Staging v1.34.8 application and the current functioning BETA Firebase environment.

## Promotion model

- Frontend/application baseline: confirmed Staging v1.34.8.
- Firebase configuration: preserved from the current functioning BETA (`daily-accountability-be0ac`).
- Personal data remains under the existing `users/{uid}` paths.
- Existing Firebase Authentication accounts and UIDs are retained.
- New Team-capable Firestore rules are included and must be deployed to the BETA Firebase project.
- Existing legacy `/leaderboard/{uid}` documents are not migrated or deleted.
- Once users join the new Team, the private `teams/{teamId}/leaderboard/{uid}` path becomes authoritative for team ranking.

## Included confirmed functionality

- Complete Team create/join/leave/owner-management workflow.
- Daily and current-week leaderboard sync, including the confirmed weekly freshness fix.
- Persistent Pipeline Session refresh with a per-user/per-day served-contact exclusion list.
- Broadcast contrast and viewport refinements.
- Contacts navigation correction.
- Universal nested/session navigation polish and restored light/dark button contrast.
- Returning daily snapshot with Day Pulse, Leaderboard and Next Block intelligence.
- Four-second returning snapshot handoff with tap-to-open immediately.
- Consumer-ready login copy with persistent Firebase auth restore.

## Firebase

The frontend remains connected to the existing BETA Firebase project:

`daily-accountability-be0ac`

No user-data migration is required.

The bundled `firestore.rules` must be deployed when this BETA release is promoted so Team creation, invite lookup, membership and private Team leaderboard access work.

## Protected systems

- Existing Firebase project and Authentication accounts.
- Existing Firebase UIDs.
- `users/{uid}` personal data and child paths.
- Existing days, appointments, contacts, notes and prospecting data.
- Local UID-scoped cache/data shapes.
- Offline Firestore persistence and sync architecture.
- PWA manifest and icon identity.
- Service-worker behaviour, apart from the required BETA cache-version bump.

## Deployment

Upload the web files in this package to the BETA GitHub Pages workspace. Deploy the bundled Firestore rules to the `daily-accountability-be0ac` Firebase project before testing the Team workflow.

After the new PWA is live, create the Team from the owner account and have each existing user sign in with their existing account and join using the generated invite code.


## v1.35.1 targeted update
- Team Owners can now permanently delete their current team from Team Management.
- A confirmation screen explains that team access is removed while all personal AGNT data remains untouched.
- Team invite code, membership documents and team leaderboard documents are removed with the team.
- No Firestore rules change is required; v1.35.0 rules already permit owner deletion.
