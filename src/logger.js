export const Level = {
  Off: "off",
  Error: "error",
  Warn: "warn",
  Info: "info",
  Debug: "debug",
  Trace: "trace",
};

const RANK = { off: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5 };

let globalLevel = "warn";

export function initLogger(options = {}) {
  globalLevel = options.debug === true ? "debug" : "warn";
}

function emit(level, msg) {
  if (RANK[level] <= RANK[globalLevel]) {
    process.stderr.write(`${level}  [tesla_auth]  ${msg}\n`);
  }
}

export const log = {
  error: (msg) => emit("error", msg),
  warn: (msg) => emit("warn", msg),
  info: (msg) => emit("info", msg),
  debug: (msg) => emit("debug", msg),
  trace: (msg) => emit("trace", msg),
};
