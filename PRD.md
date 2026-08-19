# Pawday Product Requirements Document

| Field | Value |
| --- | --- |
| Product | Pawday |
| Version | 1.0 |
| Status | Draft for MVP planning |
| Last updated | August 19, 2026 |
| Platforms | iOS and Android; responsive web as a secondary target |
| Prototype | Expo SDK 54 React Native application |

## 1. Product summary

Pawday is a warm, low-friction companion for pet owners who want to keep everyday care consistent and preserve meaningful memories in one place. It combines a daily care checklist, scheduled reminders, a photo journal, and encouraging progress rewards.

The product should feel supportive rather than clinical. A user should be able to open Pawday, understand what their pet needs today, complete a task, and leave in under 30 seconds.

## 2. Problem

Pet care is made up of small, recurring actions such as meals, medication, walks, grooming, and play. These actions are often tracked through memory, alarms, notes, or several unrelated apps. That creates three problems:

1. Owners can forget or duplicate care, especially when multiple people or pets are involved.
2. Generic reminder tools do not provide a clear view of a pet's daily care history.
3. Health routines and positive memories live in separate places, making care feel like administration instead of part of a relationship.

Pawday addresses this with one calm daily view that connects care, consistency, and memories.

## 3. Vision

Help every pet receive consistent, loving care while giving owners a joyful record of their life together.

## 4. Goals and success measures

### MVP goals

- Let a user create and manage one or more pet profiles.
- Show the selected pet's care tasks for the current day.
- Let a user create, edit, complete, and delete recurring or one-time care reminders.
- Notify the user when a scheduled task is due.
- Preserve task completion state and history across sessions.
- Let a user save and browse journal moments with an optional photo and note.
- Encourage consistency with accurate streaks and a small set of earned badges.

### Product success metrics

| Metric | Initial target |
| --- | --- |
| Onboarding completion | At least 70% of users who begin onboarding create a pet and first reminder |
| Activation | At least 60% of new users complete one care task within 24 hours |
| Week-one retention | At least 30% of activated users return in days 7–13 |
| Care completion | Median active user completes at least 60% of scheduled weekly tasks |
| Reminder creation | At least 2 active reminders per activated user by day 7 |
| Journal adoption | At least 25% of retained users save a moment within 30 days |
| Notification reliability | At least 98% of eligible local notifications are scheduled successfully |

Targets are hypotheses and should be revised after the first production cohort.

### Non-goals for MVP

- Veterinary diagnosis, symptom interpretation, or treatment recommendations.
- Medical-record storage or integration with veterinary clinics.
- Social feeds, public profiles, comments, or follower mechanics.
- GPS walk tracking, wearable integration, or live location sharing.
- Payments, subscriptions, or commerce.
- Household collaboration and real-time multi-user synchronization.
- Desktop-first workflows.

## 5. Target users

### Primary persona: routine-focused pet owner

An individual caring for one or two pets who wants a simple way to remember daily needs and see what has already been done. They value speed, friendly language, and reliable reminders.

### Secondary persona: memory keeper

A pet owner who regularly takes photos and wants a dedicated, private scrapbook organized around their pets rather than a public social network.

### Future persona: shared household caregiver

A couple, family, sitter, or roommate group coordinating responsibility for the same pets. Shared households are out of scope for MVP but should influence data ownership decisions.

## 6. Core user journeys

### 6.1 First-time setup

1. User opens Pawday and sees a short statement of value.
2. User creates a pet with a name, animal type, and optional photo, breed, and birth date.
3. User chooses at least one suggested care routine or creates a custom reminder.
4. User is asked for notification permission only after a reminder time is selected and the benefit is explained.
5. User lands on Home with today's schedule populated.

### 6.2 Complete today's care

1. User opens Home and sees the current date, selected pet, progress, and tasks in chronological order.
2. User taps a task to mark it complete.
3. Progress, streak eligibility, and awards update immediately.
4. User can tap again to undo an accidental completion.
5. Completion remains correct after closing and reopening the app.

### 6.3 Create a care reminder

1. User opens Schedule and taps **Add care reminder**.
2. User enters a title, selects a category, time, recurrence, and pet.
3. User optionally adds a duration or note.
4. User saves the reminder and sees it in the selected dates.
5. Pawday schedules or updates the corresponding local notification.

### 6.4 Save a journal moment

1. User opens Journal and taps an add control.
2. User chooses an existing photo or continues without one.
3. User enters a required title and optional note and date.
4. User saves the moment and immediately sees it at the top of the journal.
5. The entry remains available after restarting the app.

### 6.5 Switch pets

1. User taps the current pet avatar or selector.
2. User selects another pet.
3. Home, Schedule, Journal, and Awards update to the selected pet.
4. The selected pet remains active on the next app launch.

## 7. Functional requirements

Priority uses **P0** for launch-critical, **P1** for important follow-up, and **P2** for later enhancement.

### 7.1 Onboarding and pet profiles

| ID | Priority | Requirement |
| --- | --- | --- |
| PET-01 | P0 | A user can create a pet with a required name and animal type. |
| PET-02 | P0 | A user can optionally add a photo, breed, birth date or approximate age, and color/theme. |
| PET-03 | P0 | A user can edit and delete a pet profile, with confirmation before deletion. |
| PET-04 | P0 | A user can create and switch between multiple pets. |
| PET-05 | P0 | All care tasks, journal moments, and awards are associated with a specific pet. |
| PET-06 | P1 | Pawday offers starter routine templates based on animal type. |
| PET-07 | P1 | The app supports an accessible fallback avatar when no photo is provided. |

### 7.2 Home and daily care

| ID | Priority | Requirement |
| --- | --- | --- |
| HOME-01 | P0 | Home displays the actual local date and an appropriate time-of-day greeting. |
| HOME-02 | P0 | Home shows the selected pet and today's tasks in chronological order. |
| HOME-03 | P0 | Each task shows its title, scheduled time, category, and completion state. |
| HOME-04 | P0 | A user can complete and uncomplete a task with one tap. |
| HOME-05 | P0 | Daily completed and total counts and the progress bar update immediately and accurately. |
| HOME-06 | P0 | The app distinguishes a day with no scheduled tasks from an error or loading state. |
| HOME-07 | P1 | A daily care tip is relevant to the selected pet type and is not medical advice. |
| HOME-08 | P1 | A user can navigate directly from Home to the full schedule. |

### 7.3 Schedule and reminders

| ID | Priority | Requirement |
| --- | --- | --- |
| SCH-01 | P0 | Schedule supports navigating between calendar dates. |
| SCH-02 | P0 | A user can create a one-time or recurring task with title, pet, category, local time, start date, and recurrence. |
| SCH-03 | P0 | Supported recurrence includes daily, selected weekdays, weekly, monthly, and no recurrence. |
| SCH-04 | P0 | A user can edit, pause, and delete a reminder. |
| SCH-05 | P0 | Editing a recurring reminder lets the user apply the change to one occurrence or future occurrences. |
| SCH-06 | P0 | Local notifications are scheduled for enabled reminders when system permission allows. |
| SCH-07 | P0 | The app clearly communicates disabled notification permission and links to system settings where supported. |
| SCH-08 | P0 | Time-zone and daylight-saving changes do not shift a task away from its intended local time. |
| SCH-09 | P1 | A user can add an optional duration and note. |
| SCH-10 | P1 | A notification action can mark a task complete without opening the app where the platform supports it. |
| SCH-11 | P1 | Overdue, completed, and upcoming tasks have distinct accessible states. |

Initial task categories are Food, Medication, Walk, Play, Grooming, Training, Appointment, and Other. Medication is a scheduling label only; Pawday must not recommend a dose or treatment.

### 7.4 Journal

| ID | Priority | Requirement |
| --- | --- | --- |
| JRN-01 | P0 | A user can create a moment with a required title and pet and an optional photo, note, and date. |
| JRN-02 | P0 | A saved moment appears in reverse chronological order without requiring a refresh. |
| JRN-03 | P0 | Journal entries and referenced media persist across app sessions. |
| JRN-04 | P0 | The app requests photo-library permission in context and handles denial without blocking text-only entries. |
| JRN-05 | P0 | A user can view, edit, and delete a moment, with confirmation before deletion. |
| JRN-06 | P1 | A user can filter the journal by pet and year. |
| JRN-07 | P1 | Images are resized and compressed to control storage while preserving acceptable display quality. |
| JRN-08 | P2 | A user can export or share an individual moment using the system share sheet. |

### 7.5 Streaks, points, and awards

| ID | Priority | Requirement |
| --- | --- | --- |
| AWD-01 | P0 | Streaks are calculated from persisted care history, not hard-coded values. |
| AWD-02 | P0 | A day counts toward a streak when all tasks scheduled for that pet that day are completed by the end of the local day. |
| AWD-03 | P0 | Days with no scheduled tasks neither extend nor break a streak. |
| AWD-04 | P0 | Badge progress and unlock state are derived from persisted events. |
| AWD-05 | P0 | The MVP includes First Task, 7-Day Streak, 10 Walks, and 12 Memories badges. |
| AWD-06 | P1 | Completing care grants kindness points under a documented, deterministic rule. |
| AWD-07 | P1 | Reward language remains encouraging and never shames users for missed care. |

### 7.6 Settings and data management

| ID | Priority | Requirement |
| --- | --- | --- |
| SET-01 | P0 | A user can manage notification preferences and see the current system permission state. |
| SET-02 | P0 | A user can view the privacy policy and terms from the app. |
| SET-03 | P0 | A user can delete all Pawday data stored on the device. |
| SET-04 | P1 | A user can export their structured care and journal data in a portable format. |
| SET-05 | P1 | A user can choose the first day of the week and time display follows the device locale. |

## 8. Data model

The MVP should use a local persistent database. The model should allow a future authenticated sync service without changing user-facing concepts.

### Pet

- `id`: UUID
- `name`: string
- `animalType`: enum or normalized string
- `breed`: optional string
- `birthDate`: optional date
- `photoUri`: optional managed local URI
- `themeColor`: optional color token
- `createdAt`, `updatedAt`: timestamps

### CareReminder

- `id`: UUID
- `petId`: UUID
- `title`: string
- `category`: enum
- `localTime`: hour and minute
- `startDate`: local date
- `recurrenceRule`: structured recurrence value
- `durationMinutes`: optional positive integer
- `note`: optional string
- `notificationsEnabled`: boolean
- `isPaused`: boolean
- `createdAt`, `updatedAt`: timestamps

### CareOccurrence

- `id`: stable occurrence identifier
- `reminderId`: UUID
- `petId`: UUID
- `scheduledFor`: timezone-aware timestamp plus intended local date
- `status`: scheduled, completed, skipped, or missed
- `completedAt`: optional timestamp
- `createdAt`, `updatedAt`: timestamps

### JournalMoment

- `id`: UUID
- `petId`: UUID
- `title`: string
- `note`: optional string
- `photoUri`: optional managed local URI
- `occurredOn`: local date
- `createdAt`, `updatedAt`: timestamps

### AwardState

- `petId`: UUID
- `awardKey`: stable string identifier
- `progress`: number
- `unlockedAt`: optional timestamp

## 9. Business and calculation rules

- The device's current locale and time zone define a calendar day.
- Task completion is idempotent: repeated taps or notification actions must not create duplicate completion events.
- A user may undo completion. Streaks, points, and awards must be recalculated consistently after an undo.
- Deleting a reminder does not silently delete its historical completed occurrences.
- Deleting a pet deletes or detaches all related data only after explicit confirmation that explains the impact.
- If notification permission is denied, reminders and in-app schedules continue to work.
- All static dates, counts, names, and reward values visible in the prototype must be replaced with derived data for production.

## 10. UX and content requirements

- Preserve the prototype's warm visual direction: cream background, rounded cards, muted category colors, friendly illustrations, and concise copy.
- Prioritize the selected pet, today's progress, and next incomplete task above secondary content.
- Keep common actions reachable with one hand and give interactive targets a minimum size of 44 by 44 points.
- Show immediate visual feedback for completion, saves, errors, and destructive actions.
- Use friendly language without implying that the app is a substitute for veterinary care.
- Avoid guilt-based messages. A broken streak should invite the user to begin again.
- Support dynamic text sizing without clipping essential content.
- Do not rely on color alone to convey state.
- Provide accessibility labels, roles, hints, and logical focus order for interactive controls.
- Support screen readers, reduced motion, and sufficient text/background contrast aligned with WCAG 2.2 AA where applicable.
- Handle loading, empty, offline, permission-denied, and recoverable error states on every core screen.

## 11. Privacy, security, and safety

- MVP data is private and stored locally on the device by default.
- Collect only data required for the described features.
- Do not upload pet photos or journal content without an explicit sync or backup feature and user consent.
- Use platform-managed app storage for copied journal media; do not depend solely on temporary picker URIs.
- Never store secrets or sensitive tokens in source code or unencrypted application preferences.
- Analytics events must not include journal text, pet names, photo contents, medication notes, or other user-entered free text.
- Provide clear disclosure for notification and photo permissions before the system prompt.
- Include a persistent disclaimer that Pawday organizes owner-provided routines and does not provide medical advice or emergency services.
- If cloud sync is introduced, require encryption in transit, authenticated access, deletion support, and a documented retention policy before launch.

## 12. Analytics

Track privacy-safe product events with anonymous installation or account identifiers:

- `onboarding_started`
- `pet_created`
- `starter_routine_selected`
- `onboarding_completed`
- `reminder_created`, with category and recurrence type only
- `reminder_notification_permission_result`
- `care_task_completed` and `care_task_uncompleted`, with category only
- `journal_moment_created`, with booleans for photo and note presence
- `award_unlocked`, with award key
- `pet_switched`
- `data_exported`
- `all_data_deleted`

Every event must document its purpose, properties, retention, and whether it is required or optional. Product analytics should be disabled until consent requirements for target markets are confirmed.

## 13. Non-functional requirements

### Reliability

- No user-created task or journal moment is lost during a normal app restart or version update.
- Local database writes are transactional where an action changes multiple records.
- Notification schedules are reconciled after reminder edits, app updates, time-zone changes, and permission changes.

### Performance

- Warm app launch reaches an interactive Home screen within 2 seconds on supported mid-range devices.
- Task completion feedback appears within 100 milliseconds.
- Core lists remain responsive with 500 reminders, 5,000 occurrences, and 1,000 journal moments.
- Journal thumbnails use bounded dimensions and lazy loading.

### Compatibility

- Support the current Expo SDK 54 platform baseline and the iOS and Android versions supported by that SDK at implementation time.
- Layouts must work from compact mobile widths through the existing 520-point content maximum.
- Web is supported for core navigation and data entry, but notification and media behavior may use documented platform-specific fallbacks.

### Observability

- Capture non-sensitive crashes and handled errors with app version and platform context.
- Monitor failures in database migration, media persistence, and notification scheduling.

## 14. MVP acceptance criteria

The MVP is ready for release when all of the following are true:

1. A new user can create a pet and recurring reminder, then see today's generated occurrence.
2. Completing a task updates Home, Schedule, progress, care history, streak, and eligible awards consistently.
3. User-created pets, reminders, completions, and journal moments survive a force-close and restart.
4. A scheduled local notification is delivered on a supported physical device when permission is granted.
5. Editing or deleting a reminder updates future notifications without leaving duplicates.
6. A user can add, edit, and delete a journal moment with or without a photo.
7. Switching pets filters all four primary tabs correctly.
8. The UI uses the real date and contains no prototype-only hard-coded user data or progress values.
9. Core journeys pass accessibility review with VoiceOver and TalkBack.
10. The app handles denied photo and notification permissions without crashing or blocking unrelated functionality.
11. Database migration and upgrade testing preserves data from the previous production schema.
12. Type checking, automated unit tests for schedule and streak rules, integration tests for persistence, and release builds pass for both mobile platforms.

## 15. Delivery phases

### Phase 1: durable core

- Introduce navigation and a maintainable feature/module structure.
- Add local database schema and migrations.
- Replace sample pets, tasks, dates, memories, and awards with persistent data.
- Implement onboarding and pet profile management.

### Phase 2: schedules and notifications

- Implement reminder CRUD, recurrence generation, calendar navigation, and completion history.
- Add local notifications, permission education, and schedule reconciliation.
- Add unit tests for recurrence, time zones, streaks, and point calculations.

### Phase 3: journal and rewards

- Persist journal entries and managed images.
- Implement detail, edit, delete, empty, and error states.
- Connect streaks, kindness points, and badges to real events.

### Phase 4: release readiness

- Add settings, privacy controls, data deletion, analytics consent, and observability.
- Complete accessibility, performance, device, migration, and release-build testing.
- Run a small beta, review success metrics and qualitative feedback, and fix launch blockers.

## 16. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Recurrence or time-zone bugs produce incorrect reminders | Missed or mistimed care | Store intended local schedule separately, test DST boundaries, and reconcile notifications |
| Gamification creates guilt or encourages meaningless completion | Loss of trust | Reward consistency gently, allow undo, avoid punitive language, and test copy with owners |
| Local-only data is lost with device loss or uninstall | Loss of care history and memories | Explain local storage; prioritize export and evaluate opt-in backup after MVP |
| Photo storage grows without bounds | Device storage pressure | Resize images, generate thumbnails, expose storage usage, and support deletion |
| Medication reminders are mistaken for medical guidance | Safety and legal risk | Keep user-entered scheduling only and display clear medical disclaimers |
| Notification denial reduces utility | Lower retention | Provide useful in-app schedules, contextual education, and a settings recovery path |

## 17. Open product decisions

- Is the first release intentionally local-only, or must cross-device backup be included before launch?
- Should a care day require every scheduled task for the streak, or should users be able to mark tasks as skipped without penalty?
- Are kindness points valuable beyond badges, or should the MVP use only streaks and milestone awards?
- Should medication tasks have stronger completion confirmation or missed-task behavior than ordinary care tasks?
- Which countries and languages are in the first launch, and what privacy or consent requirements follow from that choice?
- Is responsive web a release target or only a development/demo surface?
- When should shared household care move into scope, and should the local data model prepare for caregiver attribution now?

## 18. Prototype-to-MVP gap summary

The current prototype successfully validates the visual direction and the four-part information architecture: Home, Schedule, Journal, and Awards. It also demonstrates pet switching, in-session task completion, image selection, and a journal-entry modal.

Before release, the product needs persistent storage, real calendar behavior, reminder management, notification delivery, real journal creation, pet profile CRUD, data-driven rewards, settings and privacy controls, complete state handling, accessibility work, and automated testing. The prototype should therefore be treated as the UX baseline, not as a production data architecture.
