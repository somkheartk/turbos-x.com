# Smartstore Playwright E2E

## Structure

- `smoke/`: fast critical flows that prove the app boots and the primary admin path is reachable
- `regression/`: route protection, logout, and behavior checks that guard against known breakages
- `mutations/`: flows that change backend state and should reflect the updated result in the UI
- `support/`: shared constants and helpers

## Commands

- `npm run test:e2e`
- `npm run test:e2e:pre-release`
- `npm run test:e2e:smoke`
- `npm run test:e2e:regression`
- `npm run test:e2e:mutation`
- `npm run test:e2e:ui`

## Notes

- The local web app is expected at `http://127.0.0.1:3000` unless `PLAYWRIGHT_BASE_URL` is set.
- The current mutation starter flow assumes the seeded purchase-order data is available from the local backend.
- `npm run test:e2e:pre-release` bundles the current critical release gate: smoke coverage, all regression specs, and the purchase-order approval mutation.
- The pre-release command runs with `--workers=1` on purpose so the local dev server and mutable seeded flows stay stable during a release gate run.
- The pre-release command also runs against a dedicated managed server on `http://127.0.0.1:3100` so it does not collide with a long-running local `next dev` session on `3000`.
- When you already have `next dev` running locally, use `PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e:pre-release` to reuse that server.
