# AGNT BETA v1.36.6 — Team Appointment Assignment Release

Consumer-ready BETA promotion of the confirmed working AGNT Staging v1.36.6 application into the existing functioning BETA environment.

## Release baseline
- Application/UI source: confirmed working `AGNT Staging v1.36.6 — Targeted Appointment Contrast`.
- Firebase environment: existing BETA project `daily-accountability-be0ac`.
- Existing Firebase Authentication accounts and UIDs are retained.
- Existing personal data remains under the current `users/{uid}` paths.
- Existing Team membership, invite-code and Team leaderboard paths are retained.
- No user-data migration is required.

## Included functionality
- Complete Team create/join/leave/owner-management workflow, including Team deletion.
- Daily and current-week Team leaderboard sync.
- Persistent Pipeline Session refresh with per-user/per-day served-contact exclusion.
- Broadcast contrast and viewport refinements.
- Universal nested/session navigation polish.
- Returning Daily Snapshot for four seconds on every second returning app open.
- Consumer-ready login with persistent Firebase authentication restore.
- Team appointment assignment after Book Appointment, defaulting to Me.
- Assignment choices use the live Team leaderboard display name and show first name only.
- The original setter keeps the appointment statistic and personal source appointment.
- The assigned teammate receives a Team-owned appointment mirror without another user writing into their private `users/{uid}` records.
- Recipient sees the appointment in their appointment/timeline surfaces without receiving the setter's appointment statistic.
- Live/next-open appointment notification with Got it and Add to Calendar.
- Setter-facing appointment/log/leaderboard context shows `Booked for [First name]` where applicable.
- Targeted dark-mode contrast fixes for appointment contact suggestions and Editing Appointment.

## Firebase
The frontend is connected to the existing BETA Firebase project `daily-accountability-be0ac`.
The bundled `firestore.rules` retains the current Team/private-data permission model and adds `teams/{teamId}/appointments/{appointmentId}`.
Deploy the bundled rules to the BETA Firebase project as part of this release. No data migration is required.

## Protected systems retained
Existing Firebase/Auth UIDs, `users/{uid}` personal data, days, contacts, prospecting, appointments, notes/history, Team membership/leaderboard data, UID-scoped local cache shapes, offline Firestore sync, manifest/icon identity and service-worker behaviour remain preserved. Only release cache identifiers were bumped.
