// =============================================================================
// test/logger.test.js  —  Port of simple_logger tests
// =============================================================================
// Tests the SimpleLogger format and initialization, mirroring the Rust
// simple_logger behaviour:
//
//   - Format: "<LEVEL>  [<TARGET>]  <MSG>" written to stderr
 //   - Level names padded to 5 chars: "ERROR", "WARN  ", "DEBUG"
//   - No colors, no timestamps
 //   - Module-level filtering via init(level, moduleLevels)
//   - init() called once per process
 //
 import { initLogger, log, Level } from "../src/logger.js";

 let passed = 0;
 let failed = 0;

// --- Test 1: initLogger with debug level ---
try {
  // Redirect stderr temporarily to capture output
  const originalStderrWrite = process.stderr.write;
  const logs = [];

  process.stderr.write = (...args) => {
    logs.push(args.join(""));
    return true;
  };

  initLogger({ debug: true });

  // Call a log method
  log.debug("this is a debug message");

  // Restore
  process.stderr.write = originalStderrWrite;

  // The debug message should appear (global level is "debug")
  const hasDebugLog = logs.some((l) => l.includes("debug") && l.includes("this is a debug message"));
  if (hasDebugLog) {
    passed += 1;
  } else {
    failed += 1;
    console.error("FAIL: debug log not captured, output:", logs);
  }
} catch (e) {
  failed += 1;
  console.error(`FAIL: initLogger debug test threw: ${e.message}`);
}

// --- Test 2: initLogger default (warn level) ---
try {
  const originalStderrWrite = process.stderr.write;
  const logs = [];

  process.stderr.write = (...args) => {
    logs.push(args.join(""));
    return true;
  };

  initLogger(); // default: warn level

  log.warn("this is a warning");

  process.stderr.write = originalStderrWrite;

  const hasWarnLog = logs.some((l) => l.includes("warn") && l.includes("this is a warning"));
  if (hasWarnLog) {
    passed += 1;
  } else {
    failed += 1;
    console.error("FAIL: warn log not captured, output:", logs);
  }
} catch (e) {
  failed += 1;
  console.error(`FAIL: initLogger warn test threw: ${e.message}`);
}

// --- Test 3: log formats match the expected pattern ---
try {
  const originalStderrWrite = process.stderr.write;
  const formatLogs = [];

  process.stderr.write = (...args) => {
    formatLogs.push(args.join(""));
    return true;
  };

  initLogger({ debug: true }); // use debug level so all levels are visible

  log.error("error message");
  log.warn("warn message");
  log.info("info message");
  log.debug("debug message");

  process.stderr.write = originalStderrWrite;

  // Verify each line has the expected format: "LEVEL  [TARGET]  MSG"
  const levelPattern = /^(error|warn|info|debug)\s{2}\[\S+\]\s .+/;

  let allMatch = true;
  for (const line of formatLogs) {
    if (!levelPattern.test(line)) {
      console.error(`FAIL: line doesn't match expected format: "${line}"`);
      allMatch = false;
    }
  }

  if (allMatch && formatLogs.length === 4) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: expected 4 formatted lines, got ${formatLogs.length}`);
  }
} catch (e) {
  failed += 1;
  console.error(`FAIL: log format test threw: ${e.message}`);
}

// --- Test 4: Level constants are exported correctly ---
try {
  const levelKeys = Object.keys(Level).filter(
    (k) => isNaN(Number(k)),
  ); // exclude numeric if any
  const expectedKeys = ["Off", "Error", "Warn", "Info", "Debug", "Trace"];
  const correct = JSON.stringify(levelKeys.sort()) === JSON.stringify(expectedKeys.sort());
  if (correct) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: Level enum keys mismatch: ${JSON.stringify(levelKeys)} vs ${JSON.stringify(expectedKeys)}`);
  }
} catch (e) {
  failed += 1;
  console.error(`FAIL: Level constants test threw: ${e.message}`);
}

console.log(
  `\nLOGGER TESTS: ${passed} passed, ${failed} failed out of 4 tests`,
);
if (failed > 0) {
  process.exit(1);
}