AGNT v1.30.0 — Appearance Modes

Adds System / Light / Dark appearance selection in Settings. Light preserves the v1.29.4 UI. Dark uses explicit theme colours across navigation, controls, inputs, rings, cards, sheets and Prospector surfaces. No Firebase changes required.

# AGNT V91 — Booking / Editor Header Separation

Incremental update built from V90.

## Changed
- Removed the APPOINTMENTS, Editing Appointment and close controls from the normal new-appointment booking form.
- Kept those controls visible only inside the isolated editor when an existing appointment is being edited.
- Preserved the embedded yellow follow-up metric in the Past Appointments card.

## Unchanged
Firebase, authentication, Firestore paths and rules, UID separation, local cache, sync, appointment data and save logic, navigation, scoring and unrelated UI.

## V95.9
- Follow-up controls now use a single empty circle until an outcome is saved.
- Time-based timeline items remain active until the next timed item begins.

## V103.1.1
- Active prospecting session UI remains on Today while Contacts, Pipeline and Insights stay usable.
- Session progress uses lowercase ‘of’.
- Contacts with any logged event in the previous 21 days are excluded from session rotation.

## V105
- Uses one fresh, shared 50-contact daily prospecting queue for both the Today dashboard and session.
- Applies the 21-day interaction exclusion before selecting the daily 50.
- Dashboard remaining count reduces from the same queue as session outcomes are logged.
- Preserves lowercase “of” in the session progress counter.


## V106 — Appointment contact search and session hand-off
- Appointment contact name searches existing AGNT contacts and can prefill name, number and address.
- Selected appointments retain the linked prospect ID when available.
- Session outcome ‘Appointment booked’ opens the appointment form prefilled for that contact.
- The prospecting outcome is only saved after the appointment booking is successfully completed.
- Cancelling the booking returns safely to the active prospecting session.
- No Firebase paths, rules, authentication, sync, daily queue or unrelated UI were changed.

## V107 — Appointment history and session workflow refinement

- OFI appointments are excluded from Past Appointments while remaining available everywhere else they already appear.
- The appointment contact dropdown now uses native momentum scrolling and selects contacts only on a genuine tap.
- Session-created appointments now save and advance to the next client before the optional calendar hand-off, so returning from Calendar resumes the active session immediately.
- Firebase, authentication, Firestore paths/rules, UID separation, daily queue, 21-day exclusion and unrelated UI remain unchanged.

## v119.5 — Market Pulse Prototype
- Added a manual Market Pulse text importer inside Prospector.
- Parses supported property event labels and full addresses.
- Matches active callable contacts by normalised same street and suburb.
- Creates calling queues through the existing Prospector session workflow.
- Stores imported events per user in local storage with duplicate protection.
- No Outlook access, Cloud Functions, Firestore path changes or Firebase configuration changes.

## v119.10 — Hot Spotting address matching audit
- Rebuilt same-street keys from the stored event address on load so previously imported opportunities use the improved matcher.
- Normalises road type abbreviations and expanded common Australian street types.
- Handles unit, lot, shop, suite, apartment, villa, level and flat prefixes.
- Handles slash addresses, number ranges, alphanumeric street numbers, commas, semicolons and postcode/state formatting.
- Matches against all active callable Prospector contacts while continuing to exclude archived and Do Not Contact records.


## v119.12 — Hot Spotting dropdown and Day Log cleanup
- Collapsed Streets worth knocking into a compact expandable first card.
- Applied one event-status colour palette across Hot Spotting cards and knocking recommendations.
- Increased Day Log time-column spacing so time ranges and icons do not overlap.
- No Firebase, data-model, session-logic or sync changes.


## v119.13 — Hot Spotting cloud persistence
- Added each user’s Hot Spotting events to their existing private Firestore prospecting state.
- Retained the UID-specific local copy as the offline cache.
- Existing local-only Hot Spotting imports migrate to Firestore after the user’s first confirmed cloud load.
- Imports, individual removals and Clear All now sync across that user’s devices.
- No UI, matching, session, Firebase path, rule or unrelated functionality changes.


## v119.14 — Day Log session cleanup

- Day Log remains scoped to the signed-in user's UID-backed day and prospecting data.
- Completed knocking sessions under 60 seconds with no knocks, connects, data, MAP or LAP activity are excluded from the Day Log and its session total.
- No Firebase paths, rules, metrics, session storage, Hot Spotting, Pipeline or UI behaviour changed.


## v125.1 — Quick Call keypad

- Added a compact phone button to the Prospector toolbar.
- Added an in-app keypad for manually entered, unsaved numbers.
- Calls hand off to the native iPhone dialler through `tel:`.
- Returning to AGNT opens an outcome sheet.
- Connected adds one call and one connect. Voicemail, no answer and wrong/disconnected add one call only. Cancelled adds no metrics.
- The post-call screen can prefill a new contact or appointment with the dialled number.
- Firebase configuration, paths, rules, UID separation, existing prospecting data and all unrelated features are unchanged.


## v125.2 — Quick Call presentation refinement
- Formats Australian mobile numbers as 4-3-3 while dialling.
- Enlarges the centred keypad and call control by approximately 10%.
- Removes metric explanations from the outcome choices while retaining the result summary after selection.
- No other application behaviour changed.


## v125.3 — Hot Spotting street session progress
- Hot Spotting street tiles now show called, connects and follow-up progress.
- Session buttons progress from Start Session to Active Session to Session Complete.
- Completed Hot Spotting session buttons display in green while preserving the existing summary.
- No Firebase configuration or rules changes are required.

## v125.4 — Hot Spotting session state correction

- Starting a Hot Spotting street session immediately persists the Active Session state.
- Renamed the matching-contact label to Neighbours Found.
- Skipped contacts count toward street-session progress without adding call or connect metrics.
- Session Complete is now applied only when Review & End Session is selected.
- Early session exit leaves the street in Active Session so it can be resumed.


## v125.5 — Hot Spotting call summary and button colours

- Skipped contacts continue to count as processed for session completion, but are excluded from the visible called total.
- A session with 14 logged calls and 3 skipped contacts across 17 neighbours displays 14/17 called.
- Restored Hot Spotting session button colours: black for Start Session, blue for Active Session and green for Session Complete.
- No other application behaviour changed.


## V125.6 — Prospector Today session states
- Keeps Today’s Pipeline independent from Hot Spotting totals.
- A Hot Spotting interaction only affects Today’s Pipeline when it belongs to the same contact already in that pipeline, through the existing contacted-today rules.
- Prospector Today buttons now mirror Smart Hot Spotting states: black Start Session, blue Active Session and green Session Complete.


## V125.7 — Session-state colour specificity fix

- Corrected CSS specificity so session state colours display over the global primary-button style.
- Start Session remains black.
- Active Session displays blue.
- Session Complete displays green, including disabled completed buttons.
- No session logic, metrics, Firebase or pipeline behaviour changed.


## v125.8 — Hot Spotting SMS beta

- Added contextual SMS alongside Call inside Hot Spotting sessions.
- Message preview uses the contact name and triggering market event address, action and valid price.
- Opens the native iPhone Messages composer with recipient and body prefilled.
- Requires explicit SMS Sent confirmation on return.
- Confirmed SMS messages are recorded as SMS interactions and count as processed session contacts without adding Calls or Connects.
- Added separate SMS totals to Hot Spotting cards and session review.
- Today’s Pipeline remains separate except where the exact same contact is updated through existing contact-recency behaviour.
- No Firebase configuration, authentication, Firestore path or rules changes.


## V125.9 Campaign Broadcast Beta
- Added audience filters, personalised merge fields, recipient preview, SendHype Shortcut payload launch and local campaign history.
- Existing Firebase paths and rules are unchanged.

## V126.0 — AGNT Bulk SMS test environment

- Campaign Broadcast now launches the iOS Shortcut named `AGNT Bulk SMS`.
- Added an isolated test environment inside Campaigns for manually entered names and Australian mobile numbers.
- Supports `{{FirstName}}` and `{{FullName}}` merge fields, configurable delay, message preview and JSON payload preview.
- Test launches are stored locally and never modify live CRM contacts or Firebase data.
- No Firebase configuration, Firestore path or security-rule changes are required.


## V126.2 — Broadcast menu placement and UI alignment

- Removed the standalone Campaigns tab from Prospector navigation.
- Added Broadcast below Pipeline and Hot Spotting on the Prospector Today screen.
- Added broadcast choices for End of month, Just listed, Just sold, Coming soon and Auction reminder.
- Each choice opens the existing audience, message, review and AGNT Bulk SMS flow with an editable starter template.
- Updated the new Broadcast interface to sentence case and aligned typography, weights, spacing and cards with the existing AGNT interface.
- Firebase, authentication, Firestore paths/rules, UID separation, contact data, Pipeline, Hot Spotting, cache and synchronisation logic are unchanged.


## V126.2 — Broadcast audience refinement

- Restored compact grey Broadcast labels to uppercase.
- Consolidated Broadcast navigation to one back button that returns one screen.
- Increased spacing between Broadcast type cards.
- End-of-month broadcasts now use a suburb-wide audience.
- Other Broadcast types now use a suburb, street and individually selectable same-street contacts.
- No Firebase, authentication, Firestore, UID, cache, sync or data-shape changes.

## V126.3 — Broadcast UI alignment

- Matched the spacing between the Pipeline, Hot Spotting and Broadcast cards.
- Changed Broadcast supporting copy to sentence case while preserving uppercase section labels.
- Matched the Broadcast button width to the session buttons above and renamed it `Broadcast`.
- No Firebase, authentication, Firestore, contact-data, cache, sync or workflow changes.

## V126.4 — Native Task UI visual refinement

- Built from the supplied `AGNT BIphoneSave.zip` baseline.
- Visual-only refinement inspired by the approved native iPhone task interface.
- Introduces flatter white surfaces, soft grey controls, black selected states, quieter borders, restrained typography and consistent section-label casing.
- Existing component sizing, viewport behaviour, navigation, Firebase, authentication, Firestore paths, UID separation, local cache, sync and application logic remain unchanged.


## v126.5 — Best-of-both UI refinement
- Retains the native visual direction introduced in v126.4.
- Restores clear accountability-day and calendar-preference controls from the earlier UI.
- Removes legacy background collisions behind selected Settings controls.
- Harmonises card, field, tab, appointment and navigation styling across views.
- Visual-only release; no Firebase, authentication, data-path or application-logic changes.

## v126.6 — Navigation and Broadcast cleanup

Visual-only beta refinement.

- Restored the lighter selected state in the bottom navigation.
- Fixed selected-label clipping for Prospector and Appointments.
- Removed the standalone card treatment around the Broadcast menu heading.
- Grouped Broadcast selections into one shared metric-style surface with dividers.
- No application logic, Firebase, data, viewport or navigation behaviour changed.


## v126.7 — Calendar, session and OFI corrections

- Repaired Apple and Outlook calendar preference rows with grey service icons, fully visible labels and body-weight text.
- Changed completed activity rings to the existing completion green.
- Updated pipeline session navigation to Back / centred progress / End Session.
- Changed the daily welcome title for OFI bookings from Appointment to OFI.
- No other visual, functional, Firebase, Firestore, sync, cache-data or viewport changes.


## v126.8 Broadcast Step Flow Beta
- Broadcast builder split into Recipients, Message, Review & Send, and Success screens.
- Added step-aware back navigation.
- Integrated the existing isolated test environment into Review & Send.
- Added success summary and previous campaign information.
- No changes outside the Broadcast workflow.

## v126.9 — Broadcast Full-Viewport Header
- Broadcast now uses the available viewport without the Prospector section tabs or toolbar.
- Broadcast step title is shown in the top-left application header.
- Step progress is shown in the top-right beside the retained live sync indicator.
- The Today control is hidden only while Broadcast is open.
- Message editor and review preview use matching body-text weight.
- Review previews preserve the exact typed casing, punctuation and line breaks.
- No changes outside the Broadcast workflow.
