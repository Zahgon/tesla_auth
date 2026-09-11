import { parseArgs, getVersionString } from "./args.js";
import { initLogger, log } from "./logger.js";
import { tokens as tokensPage } from "./view.js";
import { runTerminalFlow } from "../webview/terminal.js";

const USAGE = `Usage: tesla_auth [-d] [-c] [-v]

Tesla API tokens generator

Options:
  -d, --debug       print debug output
  -c, --clear-browsing-data
                    clear browsing data at startup
  -v, --version     print the version and exit
  --help, help      display usage information
`;

export async function main(argv = process.argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    process.stderr.write(e.message);
    process.exit(1);
    return;
  }

  if (args.help) {
    process.stdout.write(USAGE);
    return;
  }

  if (args.version) {
    console.log(getVersionString());
    return;
  }

  initLogger({ debug: args.debug });

  return runTerminalFlow({
    onTokens: (t) => {
      console.log(String(t));
      process.stdout.write(tokensPage(t) + "\n");
    },
    onError: (err) => {
      log.error(err.message);
      process.exitCode = 1;
    },
  });
}
