// =============================================================================
// args.js — Tesla Auth CLI argument parser (zero-dependency Node port)
// =============================================================================
// Mirrors `argh` derive + CLI handling from main.rs.
// All error messages are written to stderr, but EXIT is NOW handled by the
// caller (not by process.exit inside this module). This allows tests and
// the binary entrypoint to decide the exit behaviour.
// =============================================================================

/**
 * Parses `process.argv` using the same schema as the Rust `argh` derive:
 *   -d, --debug          → debug flag
 *   -c, --clear-browsing-data  → clear browsing data flag
 *   -v, --version        → version flag
 *   --help / help        → print usage and exit(0) — caller's responsibility
 *   Unknown flags → error thrown (caller should exit(2))
 *   Combined short flags processed independently (matching argh)
 *
 * Returns an object with boolean properties matching the Rust Args struct.
 * Throws Error on unrecognized long flags (instead of calling process.exit).
 */
export function parseArgs(argv = process.argv) {
  const args = {
    debug: false,
    clear_browsing_data: false,
    version: false,
  };

  let i = 2; // In Node.js, process.argv = [node_path, script_path, ...args]
  while (i < argv.length) {
    const token = argv[i];

    if (token === "-d" || token === "--debug") {
      args.debug = true;
    } else if (token === "-c" || token === "--clear-browsing-data") {
      args.clear_browsing_data = true;
    } else if (token === "-v" || token === "--version") {
      args.version = true;
    } else if (token === "--help" || token === "help") {
      // Signal help request via return value rather than process.exit
      // Caller should check this and call printUsage + process.exit(0)
      args.help = true;
    } else if (token.startsWith("--")) {
      // Unknown long flag — throw instead of process.exit so caller can decide
      const alias = token.slice(2);
      throw new Error(
        `tesla_auth: unrecognized flag: --${alias}\nTry 'tesla_auth --help' for more information.\n`,
      );
    } else if (token.startsWith("-") && token.length > 1) {
      // Short flags: process each char individually
      const chars = token.slice(1).split("");
      for (const ch of chars) {
        if (ch === "d") {
          args.debug = true;
        } else if (ch === "c") {
          args.clear_browsing_data = true;
        } else if (ch === "v") {
          args.version = true;
        } else {
          throw new Error(
            `tesla_auth: unrecognized flag: -${ch}\nTry 'tesla_auth --help' for more information.\n`,
          );
        }
      }
    } else {
      // positional argument — silently skip
    }

    i += 1;
  }

  return args;
}

/**
 * Check whether a given argv token is the --help / help trigger.
 * (Used by callers who want to short-circuit before full parse.)
 */
export function isHelpRequest(argv = process.argv) {
  return argv.includes("--help") || argv.includes("help");
}

// Export a convenience constant for the binary entrypoint
export const ARGS_SCHEMA = {
  debug: { type: "switch", short: "d" },
  clear_browsing_data: { type: "switch", short: "c" },
  version: { type: "switch", short: "v" },
  help: { type: "help" },
};

// ---------------------------------------------------------------------------
// Version string — matches `println!("{} {}", env!("CARGO_PKG_NAME"), env!("CARGO_PKG_VERSION"))`
// ---------------------------------------------------------------------------

/** The version tuple, matching Cargo.toml [package] section. */
export const VERSION = "0.15.0";

/** Formatted version string: "tesla_auth 0.15.0" */
export function getVersionString() {
  return `tesla_auth ${VERSION}`;
}

// ---------------------------------------------------------------------------
// Exit-code helpers
// ---------------------------------------------------------------------------

/** Exit with code 1 (generic error), matching Rust process exit conventions. */
export function exit1(message) {
  if (message) {
    process.stderr.write(message + "\n");
  }
  process.exit(1);
}

/** Exit with code 0 (success). */
export function exit0() {
  process.exit(0);
}