# LyriFind - Week 3 Testing and Debugging

This project contains the original Week 2 LyriFind application plus the Week 3 testing and debugging module. The application remains in `server/` and `client/`; the focused Week 3 unit-test module is in `backend/`.

## Week 3 Test Result

The standalone Week 3 suite was run on Windows with Node.js `v22.16.0`:

```text
15 tests passed
0 tests failed
0 tests skipped
```

Run it from the project root with:

```text
cd backend
npm test
```

The test module uses Node.js built-in `node:test` and `assert` APIs, so it does not require a database or third-party packages.

The complete Week 2 server suite can be run with:

```text
cd server
npm test
```

In the available environment, this suite was blocked while `mongodb-memory-server` attempted to download MongoDB `7.0.24`; the integration hooks timed out after 60 seconds. This result is recorded in `backend/TEST_RESULTS.md`. Run the command on a computer with access to the MongoDB binary download and replace the record if the result differs.

## Week 3 Contents

- `backend/src/songUtils.js`: search, language filtering, and song validation functions.
- `backend/tests/songUtils.test.js`: 15 unit tests covering normal, negative, boundary, and regression cases.
- `backend/DEBUGGING_REPORT.md`: seven bug scenarios, causes, fixes, and lessons learned.
- `backend/TEST_RESULTS.md`: actual test commands, results, environment details, and limitations.

## Scope and Limitations

The focused suite verifies song utility behavior and input immutability. It does not claim 80% measured code coverage because no coverage tool was run against a defined target. The existing server tests cover broader API behavior, but their database setup could not complete in the available environment.

Further testing should measure the Express API rate limiting under repeated requests, verify audit logging for administrative create/update/delete actions, and add integration evidence for authentication, authorization, MongoDB behavior, and browser workflows.
