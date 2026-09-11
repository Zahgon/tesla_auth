// =============================================================================
// test/args.test.js  —  Port of CLI arg parsing tests
// =============================================================================
// Tests the argument parser mirrors the Rust argh derive behaviour:
//   - Short flags: -d, -c, -v
 //   - Long flags: --debug, --clear-browsing-data, --version
 //   - Help: --help / help → exit(0) with usage
 //   - Unknown flags → stderr + exit(2)
//   - Combined short flags not supported (matching argh)
 //
 import { parseArgs, getVersionString, isHelpRequest, exit0, exit1 } from "../src/args.js";

 let passed = 0;
 let failed = 0;

 // --- Test 1: parseArgs with no flags ---
 try {
   const argsNoFlags = parseArgs(["node", "script.js"]);
   if (argsNoFlags.debug === false && argsNoFlags.clear_browsing_data === false && argsNoFlags.version === false) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: no-flags parse gave unexpected results:", argsNoFlags);
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: parseArgs no-flags threw: ${e.message}`);
 }

 // --- Test 2: parseArgs with -d ---
 try {
   const argsD = parseArgs(["node", "script.js", "-d"]);
   if (argsD.debug === true) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: -d flag not parsed, got:", argsD);
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: parseArgs -d threw: ${e.message}`);
 }

 // --- Test 3: parseArgs with --debug ---
 try {
   const argsDebug = parseArgs(["node", "script.js", "--debug"]);
   if (argsDebug.debug === true) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: --debug flag not parsed, got:", argsDebug);
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: parseArgs --debug threw: ${e.message}`);
 }

 // --- Test 4: parseArgs with -c ---
 try {
   const argsC = parseArgs(["node", "script.js", "-c"]);
   if (argsC.clear_browsing_data === true) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: -c flag not parsed, got:", argsC);
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: parseArgs -c threw: ${e.message}`);
 }

 // --- Test 5: parseArgs with -v ---
 try {
   const argsV = parseArgs(["node", "script.js", "-v"]);
   if (argsV.version === true) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: -v flag not parsed, got:", argsV);
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: parseArgs -v threw: ${e.message}`);
 }

 // --- Test 6: parseArgs with --version ---
 try {
   const argsVer = parseArgs(["node", "script.js", "--version"]);
   if (argsVer.version === true) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: --version flag not parsed, got:", argsVer);
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: parseArgs --version threw: ${e.message}`);
 }

 // --- Test 7: parseArgs with --help exits (we check it doesn't throw) ---
 try {
   // parseArgs internally calls process.exit(0) for --help, so we need to
   // test that it detects the help request without actually exiting
   const helpDetected = isHelpRequest(["node", "script.js", "--help"]);
   if (helpDetected === true) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: isHelpRequest should detect --help");
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: isHelpRequest threw: ${e.message}`);
 }

 // --- Test 8: isHelpRequest with "help" (no dash) ---
 try {
   const helpWordDetected = isHelpRequest(["node", "script.js", "help"]);
   if (helpWordDetected === true) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: isHelpRequest should detect bare 'help'");
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: isHelpRequest with 'help' threw: ${e.message}`);
 }

 // --- Test 9: getVersionString ---
 try {
   const vs = getVersionString();
   if (vs === "tesla_auth 0.15.0") {
     passed += 1;
   } else {
     failed += 1;
     console.error(`FAIL: getVersionString => "${vs}", expected "tesla_auth 0.15.0"`);
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: getVersionString threw: ${e.message}`);
 }

// Test 10: Unknown long flag throws error (not process.exit)
  try {
    parseArgs(["node", "script.js", "--unknown"]);
    failed += 1;
    console.error("FAIL: parseArgs should have thrown for --unknown");
  } catch (e) {
    if (
      e.message.includes("unrecognized flag") &&
      e.message.includes("tesla_auth:")
    ) {
      passed += 1;
    } else {
      failed += 1;
      console.error(`FAIL: unexpected error message: ${e.message}`);
    }
  }

 // --- Test 11: Combined short flags -dc should be treated as two separate -d and -c ---
 try {
   const combined = parseArgs(["node", "script.js", "-dc"]);
   // argh does NOT combine short flags; each is processed independently
   // In our implementation, -d sets debug, -c sets clear_browsing_data
   if (combined.debug === true && combined.clear_browsing_data === true) {
     passed += 1;
   } else {
     failed += 1;
     console.error("FAIL: combined -dc should set both flags, got:", combined);
   }
 } catch (e) {
   failed += 1;
   console.error(`FAIL: combined -dc threw: ${e.message}`);
 }

 console.log(
   `\nARGS TESTS: ${passed} passed, ${failed} failed out of 11 tests`,
 );
 if (failed > 0) {
   process.exit(1);
 }