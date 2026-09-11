// =============================================================================
// test/htime.test.js  —  Port of Rust #[cfg(test)] mod tests from htime.rs
// =============================================================================
// Tests the Duration formatter's word-based output, mirroring the Rust tests:
//
//   assert_eq!(pp(0), "less than a minute");
//   assert_eq!(pp(MINUTE - 1), "less than a minute");
//   assert_eq!(pp(30), "less than a minute");
//   assert_eq!(pp(MINUTE), "1 minute");
//
//   assert_eq!(pp(DAY / 2), "12 hours");
//   assert_eq!(pp(DAY), "1 day");
//   assert_eq!(pp(10 * DAY), "10 days");
//
//   assert_eq!(pp(DAY + MINUTE - 1), "1 day");
//   assert_eq!(pp(DAY + MINUTE), "1 day 1 minute");
//   assert_eq!(pp(DAY - 1), "23 hours 59 minutes");
//
//   assert_eq!(pp(2 * DAY - 1), "1 day 23 hours 59 minutes");
//
import { Duration } from "../src/htime.js";

const DAY = 24 * 60 * 60;
const MINUTE = 60;

function pp(secs) {
  return Duration.fromSecs(secs).toString();
}

const tests = [
  // Basic minute boundaries
  [0, "less than a minute"],
  [MINUTE - 1, "less than a minute"],
  [30, "less than a minute"],
  [MINUTE, "1 minute"],

  // Hour and day spans
  [DAY / 2, "12 hours"],
  [DAY, "1 day"],
  [10 * DAY, "10 days"],

  // Edge cases around day boundaries
  [DAY + MINUTE - 1, "1 day"],
  [DAY + MINUTE, "1 day 1 minute"],
  [DAY - 1, "23 hours 59 minutes"],

  [2 * DAY - 1, "1 day 23 hours 59 minutes"],
];

let passed = 0;
let failed = 0;

for (const [secs, expected] of tests) {
  const actual = pp(secs);
  if (actual === expected) {
    passed += 1;
  } else {
    failed += 1;
    console.error(
      `FAIL: Duration.fromSecs(${secs}) => "${actual}", expected "${expected}"`,
    );
  }
}

console.log(`\nHTIME TESTS: ${passed} passed, ${failed} failed out of ${tests.length}`);
if (failed > 0) {
  process.exit(1);
}