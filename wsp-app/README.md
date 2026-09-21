# WSP — Long Snapper Training

A React Native (Expo) app for long snapper training: warmup + snap logging with
video, a weekly lift/sprint program with weight progression, progress charts,
a coaching article library, and a coach chat.

This directory replaces the original `WSP.html` / `WSP2.html` static
prototypes at the repo root with a real, buildable app.

## Run it

No account, no backend, no setup — everything lives on-device, the same way
the original HTML prototype used browser localStorage.

```bash
cd wsp-app
npm install
npm run web       # fastest way to check it in a browser
npm start         # then scan the QR code with Expo Go for a real device
```

First run: fill out the onboarding profile (name, height, weight, photo,
strengths, flaws) and you're straight into the app — no sign-up step.

## What's real vs. what's a placeholder

- **Real**: profile, snap logs, lift logs, recovery check-ins, and chat
  history all persist between app launches via `AsyncStorage` on the device.
  Snap videos and profile photos reference the local file directly.
- **Placeholder**: the Coach chat is a rule-based keyword-matcher (see
  `src/coach/replyEngine.ts`), not a real LLM. The Learn article library is
  static content. Sprint timing isn't logged anywhere yet.
- **Single-device**: since there's no backend, data doesn't sync across
  phones/browsers and isn't backed up anywhere but that one device's local
  storage. That's the trade-off for zero setup — see below to change it.

## Adding real accounts back

The app used to run on Supabase (accounts, cross-device sync, private video
storage) before being simplified to local-only for easier first-look access.
That groundwork is still here, just disconnected:

- `supabase/migrations/0001_init.sql` — full schema (profiles, snap_logs,
  lift_logs, recovery_checkins, chat_messages, a private media bucket), all
  row-level-secured per athlete.
- `src/lib/supabase.ts` — a ready-to-use Supabase client, reading
  `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env`.

To wire it back in: create a free Supabase project, run the migration, add
the two env vars, and swap `src/context/AppContext.tsx`'s `AsyncStorage`
reads/writes for calls into `supabase` — the function names and signatures
(`updateProfile`, `commitSnapStage`, `logLift`, `saveRecovery`,
`sendChatMessage`, ...) are the same shape they were in the Supabase version,
so no screen code needs to change.

## Turning on the real AI coach

`src/coach/replyEngine.ts` exports one pure function,
`generateCoachReply(userText, profile, recentLogs, liftLogs)`, called from
`sendChatMessage` in `src/context/AppContext.tsx`. To swap in a real model:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com).
2. Add a server-side call (don't call a model API with a secret key directly
   from the app — this is one more reason to bring a backend back for this
   specific feature) that takes the athlete's profile + recent logs and
   returns a reply.
3. Replace the `generateCoachReply(...)` call in `sendChatMessage` with a
   call to that function.

This isn't wired up yet because it has a real per-message cost, unlike
everything else here which is now fully free (no backend at all).

## Shipping to the App Store / Play Store

This app builds with [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios       # requires an Apple Developer account ($99/yr)
eas build --platform android   # requires a Google Play account ($25 one-time)
eas submit
```

Those developer-account fees are Apple's/Google's, not optional, and are
separate from any backend/hosting costs.

## Project structure

```
wsp-app/
  App.tsx                    entry point: loads fonts, wraps app in providers
  src/
    theme.ts                 colors, fonts, spacing — ported from WSP.html's CSS
    types.ts                 shared TypeScript types
    lib/
      supabase.ts             disconnected Supabase client — see "Adding real accounts back"
      liftHistory.ts          helpers over the append-only lift log
    context/AppContext.tsx    all app state, persisted to AsyncStorage, one place
    coach/
      replyEngine.ts          rule-based chat replies (swap point for real AI)
      homeNote.ts             recovery-aware coach note on the Home screen
    data/content.ts           static program/article/drill content
    components/               shared UI (Card, Btn, Tag, BarChart, RecoveryModal, ...)
    screens/                  one file per screen, matches the tab bar
    navigation/RootNavigator.tsx
  supabase/migrations/0001_init.sql   disconnected — see "Adding real accounts back"
```
