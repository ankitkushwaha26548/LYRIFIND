# LyriFind Week 4 — Code Review and Refactoring Report

## Scope
This review covers the song utility module: search by title/artist/album, language filtering, and song-record validation. It does not claim to audit every part of the full React/Express/MongoDB application.

## Findings
| ID | Finding | Risk | Refactoring |
|---|---|---|---|
| CR-01 | Text normalization repeated or inconsistent | Search behavior differs for case/spacing | Added shared `normalizeText` helper |
| CR-02 | Optional song fields may be absent | Runtime errors during string operations | Check field types before processing |
| CR-03 | Invalid list input can reach array methods | Unhandled errors | Guard with `Array.isArray` |
| CR-04 | Blank query/filter behavior unclear | Unexpected empty results | Return shallow copy for empty filter |
| CR-05 | Required-field checks can diverge | Invalid records accepted | Centralized validation in `validateSong` |
| CR-06 | Input mutation not guarded | Shared data can change unexpectedly | Use non-mutating operations and regression test |
| CR-07 | Logic coupled to routes is harder to test | Slower debugging and maintenance | Keep pure helpers separate from API/database code |

## Before and after
- Before: normalization rules could be repeated or omitted. After: one helper trims and lowercases strings consistently.
- Before: absent fields could reach string methods. After: only string fields are searched.
- Before: invalid list inputs could fail. After: non-arrays return an empty list.
- Before: required-field validation could vary. After: title and artist checks are centralized with clear errors.
- Before: mutation behavior was not tested. After: a regression test confirms the source list is unchanged.

## Rationale
The refactoring reduces duplication, makes edge cases explicit, and keeps the code easier to understand. Pure functions are independently testable without MongoDB or HTTP requests. The included 15 tests cover the selected behaviors but do not prove the entire application is defect-free.

## Validation
Run `npm test` from the `backend` folder. Record the actual Node.js version and pass/fail results. Do not claim a measured code-coverage percentage unless you run a coverage tool and preserve its output.

## Further recommendations
Add route-level tests for authentication, favorites, and admin CRUD; validate request bodies; apply rate limiting and security headers; log security-sensitive admin actions; add pagination and database indexes; and check dependency vulnerabilities.

# Refactoring Changelog
1. Added `normalizeText` for consistent trimming and lowercasing.
2. Added a guard for non-array song lists.
3. Standardized empty-query and empty-language behavior.
4. Made search safe when optional metadata is missing.
5. Centralized required title/artist validation.
6. Preserved source data using non-mutating operations.
7. Added regression tests for edge cases and immutability.
8. Documented review findings and before/after behavior.
