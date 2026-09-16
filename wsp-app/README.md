# WSP — Long Snapper Training

A React Native (Expo) app for long snapper training: warmup + snap logging with
video, a weekly lift/sprint program with weight progression, progress charts,
a coaching article library, and a coach chat. Backed by Supabase (auth,
database, and private video storage) so an athlete's data follows them across
devices instead of living in one browser's localStorage.

This directory replaces the original `WSP.html` / `WSP2.html` static
prototypes at the repo root with a real, buildable app.

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the SQL Editor, paste and run everything in
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates the `profiles`, `snap_logs`, `lift_logs`, `recovery_checkins`,
   and `chat_messages` tables (all with row-level security so an athlete can
   only ever see their own data), a trigger that creates a profile row the
   moment someone signs up, and a private `wsp-media` storage bucket for
   snap videos and profile photos.
3. In **Project Settings → API**, copy the **Project URL** and the
   **anon public** key.
4. In `wsp-app/`, copy `.env.example` to `.env` and fill in those two values:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   `EXPO_PUBLIC_*` vars are inlined into the app at build/start time — never
   put a service-role/secret key there, only the public anon key.

By default new athletes can sign up straight from the app. If you'd rather
approve accounts by hand, turn on "Confirm email" (or disable public sign-ups
entirely) under **Authentication → Providers** in the Supabase dashboard.

## 2. Run it

```bash
cd wsp-app
npm install
npm run web       # fastest way to check it in a browser
npm start         # then scan the QR code with Expo Go for a real device
```

First run: sign up with an email/password, fill out the onboarding profile
(name, height, weight, photo, strengths, flaws), and you're in.

## 3. What's real vs. what's a placeholder

- **Real**: accounts, profile, snap logs, lift logs, recovery check-ins, and
  chat history all persist to Supabase Postgres. Snap videos and profile
  photos upload to Supabase Storage and are served through short-lived
  signed URLs (the bucket is private, scoped per-athlete via RLS).
- **Placeholder**: the Coach chat is still the original rule-based
  keyword-matcher (see `src/coach/replyEngine.ts`), not a real LLM — see
  below for how to upgrade it. The Learn article library is static content.
  Sprint timing isn't logged anywhere yet (the Progress screen says so
  rather than faking a chart).

## Turning on the real AI coach

`src/coach/replyEngine.ts` exports one pure function,
`generateCoachReply(userText, profile, recentLogs, liftLogs)`, called from
`sendChatMessage` in `src/context/AppContext.tsx`. To swap in a real model:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com).
2. Add a server-side call (a Supabase Edge Function is the natural place —
   never call a model API with a secret key directly from the app) that
   takes the athlete's profile + recent logs and returns a reply.
3. Replace the `generateCoachReply(...)` call in `sendChatMessage` with a
   call to that function.

This isn't wired up yet because it has a real per-message cost, unlike
everything else here which runs on free tiers.

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
separate from Supabase/hosting costs.

## Project structure

```
wsp-app/
  App.tsx                    entry point: loads fonts, wraps app in providers
  src/
    theme.ts                 colors, fonts, spacing — ported from WSP.html's CSS
    types.ts                 shared TypeScript types
    lib/
      supabase.ts             Supabase client + isSupabaseConfigured check
      media.ts                signed-URL hook for private storage files
      liftHistory.ts          helpers over the append-only lift_logs table
    context/AppContext.tsx    auth + all data loading/mutation, one place
    coach/
      replyEngine.ts          rule-based chat replies (swap point for real AI)
      homeNote.ts             recovery-aware coach note on the Home screen
    data/content.ts           static program/article/drill content
    components/               shared UI (Card, Btn, Tag, BarChart, RecoveryModal, ...)
    screens/                  one file per screen, matches the tab bar
    navigation/RootNavigator.tsx
  supabase/migrations/0001_init.sql
```
