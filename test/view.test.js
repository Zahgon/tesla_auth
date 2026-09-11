// =============================================================================
// test/view.test.js  —  Port of Rust #[cfg(test)] mod tests from view.rs
// =============================================================================
// Tests the escape function and page/tokens/error builders,
// mirroring the Rust test suite.
//
// Tests:
//   - escape("a&b")           => "a&b"
//   - escape("</textarea><script>alert('x')</script>")
//     => "</textarea><script>alert('x')</script>"
//   - escape("plain text")    => "plain text"
//   - Tokens output format
//   - Error output format
//   - page() wraps body correctly
//
import { escape, page, tokens, error } from "../src/view.js";

let passed = 0;
let failed = 0;

// --- escape tests ---
const escapeTests = [
  ["a&b", "a&amp;b"],
  [
    "</textarea><script>alert('x')</script>",
    "&lt;/textarea&gt;&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;",
  ],
  ["plain text", "plain text"],
];

for (const [input, expected] of escapeTests) {
  const actual = escape(input);
  if (actual === expected) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: escape("${input}") => "${actual}", expected "${expected}"`);
  }
}

// --- page test ---
const pageBody = "<h1>Hello</h1>";
const pagified = page(pageBody);
const pageHasDoctype = pagified.startsWith("<!DOCTYPE html>");
const pageHasHtml = pagified.includes("<html");
const pageHasStyle = pagified.includes("<style>");
const pageHasMain = pagified.includes("<main>");
if (pageHasDoctype && pageHasHtml && pageHasStyle && pageHasMain) {
  passed += 1;
} else {
  failed += 1;
  console.error("FAIL: page() output missing expected HTML structure");
}

// --- tokens test ---
// We can't fully test tokens without a real SsoToken, but we can verify
// the builder doesn't throw and produces expected markers.
try {
  const fakeTokens = {
    access: "TEST_ACCESS_TOKEN",
    refresh: "TEST_REFRESH_TOKEN",
    expiresIn: "1 hour",
  };
  const tokensOutput = tokens(fakeTokens);
  const hasAccessText =
    tokensOutput.includes("Access Token") &&
    tokensOutput.includes("TEST_ACCESS_TOKEN");
  const hasRefreshText =
    tokensOutput.includes("Refresh Token") &&
    tokensOutput.includes("TEST_REFRESH_TOKEN");
  const hasValidText = tokensOutput.includes("Valid for 1 hour");
  if (hasAccessText && hasRefreshText && hasValidText) {
    passed += 1;
  } else {
    failed += 1;
    console.error("FAIL: tokens() output missing expected sections");
  }
} catch (e) {
  failed += 1;
  console.error(`FAIL: tokens() threw: ${e.message}`);
}

// --- error test ---
try {
  const fakeError = new Error("test error message");
  const errorOutput = error(fakeError);
  const hasDanger = errorOutput.includes("danger");
  const hasMessage = errorOutput.includes("test error message");
  if (hasDanger && hasMessage) {
    passed += 1;
  } else {
    failed += 1;
    console.error("FAIL: error() output missing expected markers");
  }
} catch (e) {
  failed += 1;
  console.error(`FAIL: error() threw: ${e.message}`);
}

console.log(
  `\nVIEW TESTS: ${passed} passed, ${failed} failed out of ${escapeTests.length + 3}`,
);
if (failed > 0) {
  process.exit(1);
}