# LyriFind Week 3 Debugging Report

## Scope
Tested isolated functions for song search, language filtering, and record validation. The functions avoid database/network dependencies.

## Bug scenarios and fixes
1. **Case-sensitive search** — searching `RAIN AGAIN` failed to match `Rain Again`. Fix: normalize query and searchable text to lowercase.
2. **Whitespace-only query** — spaces were treated as a query. Fix: trim before checking for an empty query.
3. **Missing artist/album crash** — calling string methods on undefined could throw. Fix: search only string-valued fields.
4. **Case-sensitive language filter** — ` english ` did not match `English`. Fix: trim and lowercase both values.
5. **Invalid list input** — null or a non-array could fail. Fix: guard with `Array.isArray`.
6. **Blank required fields** — empty or space-only title/artist could be accepted. Fix: validate trimmed fields.
7. **Shared input mutation** — in-place changes can break callers. Fix: return filtered/copied arrays and test immutability.

## Strategy
The 15 unit tests include normal, negative, boundary, and regression cases. They check expected return values and that source data is not mutated. Run `npm test` from this folder.

## Limitations
The suite targets the selected utility functions only; it does not test live Express routes, MongoDB integration, authentication, or browser flows. The internship asks for tests to detect at least 80% of potential issues, but no numeric coverage claim is made here without measured coverage output. Run tests locally and record the actual result.

## Lessons
Normalize input at function boundaries, validate required fields, handle optional fields safely, keep testable logic isolated, and base claims on reproducible test output.
