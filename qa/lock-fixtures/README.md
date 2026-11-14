# Lock fixtures

One small file per forbidden pattern. `npm run lock:selftest` feeds each file to `scripts/lock.mjs` as if it lived at
the path named in its first line (`lock-path: <virtual path>; expect: <rules>`) and fails when a rule that must fire
does not, or when the clean fixture (`99-clean-block.astro`) reports anything. The selftest runs in CI on every push.

These files are not part of the site: the lock scans `src/` only.
