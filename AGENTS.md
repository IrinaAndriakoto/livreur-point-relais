# AGENTS.md

## Dev commands

```
npm install          # install deps
npm start            # expo start (dev menu)
npm run android      # expo start --android
npm run ios          # expo start --ios
npm run web          # expo start --web
npm run lint         # expo lint
```

No test runner is configured. No typecheck script; run `npx tsc --noEmit` manually.

## Architecture

- **Expo ~54** with **expo-router** (file-based routing) on **React 19** / **React Native 0.81**
- Routes live in `src/app/`, **not** root `app/`. Entry: `expo-router/entry`
- Path alias `@/*` → `./src/*`

### 3 tab screens (src/app/_layout.tsx)

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/index.tsx` | Dashboard: stats + CTA to map |
| `/attestations` | `src/app/attestations.tsx` | Transaction table, confirm pickup |
| `/maps` | `src/app/maps.tsx` | OpenStreetMap of relay points |

### Data layer (`src/lib/delivery-data.ts`)

- Reads `EXPO_PUBLIC_API_URL` env var, appends `/getPret` to build the fetch URL.
- `getDashboardTransactions()` → fetches transactions from the API.
- `updateTransactionDispatchStatus(idInterne, status)` → PUT to `/{idInterne}/updateDispatch?status=`.
- `getRelayPoints()` → transactions with coords mapped to `RelayPoint[]`.
- Delivery statuses: `"pret_aro"` | `"enleve_livreur"` | `"remis"`.

### Backend

- API base: `https://assurances.eqima.org/api/v1/transactions` (set in `.env`).
- The `.env` file is in git (not ignored). Do not commit real secrets here.

## Key conventions

- **Themed components** (`ThemedView`, `ThemedText`) + `Colors` palette from `src/constants/theme.ts`. Always use them instead of raw RN `View`/`Text` with hardcoded colors.
- **Platform-specific files**: `.web.tsx` / `.ios.tsx` suffixes used for divergent components (e.g., `openstreetmap-view`, `icon-symbol`, `use-color-scheme`).
- **Spacing** uses the `Spacing` scale (`half`→`six`), not arbitrary numbers.
- **MaxContentWidth = 800**, **BottomTabInset** varies by platform.
- `src/components/animated-icon.tsx` serves the splash overlay via `AnimatedSplashOverlay` in `_layout.tsx`.
- `src/components/web-badge.tsx` is web-only.
- VSCode auto-fixes lint/imports on save (`source.fixAll`, `source.organizeImports`, `source.sortMembers`).

## Expo config quirks

- `app.json` experiments: `typedRoutes: true` (generates types in `.expo/`), `reactCompiler: true`.
- Web output is `static` (SPA, not SSR).
- `/ios` and `/android` directories are gitignored and generated on demand.
