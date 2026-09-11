import { spawn } from "node:child_process";
import readline from "node:readline";

import { createClient } from "../src/auth.js";

export async function runTerminalFlow({ onTokens, onError }) {
  const client = createClient();
  const authUrl = client.authorizeUrl();

  process.stdout.write(authUrl + "\n");

  const opened = await openSystemBrowser(authUrl);
  if (!opened) {
    process.stderr.write(
      "Could not open a browser automatically. Please open this URL manually:\n",
    );
    process.stderr.write(authUrl + "\n");
  }

  const callbackUrl = await readLineFromStdin();
  if (!callbackUrl) {
    const err = new Error("No callback URL provided");
    onError(err);
    return { outcome: "failure", error: err };
  }

  const result = await client.authenticate(callbackUrl);

  if (result.outcome === "authorized") {
    onTokens(result.tokens);
  } else if (result.outcome === "canceled") {
    onError(new Error("Login canceled"));
  } else {
    onError(result.error);
  }

  return result;
}

export async function openSystemBrowser(url) {
  const platform = process.platform;

  let command;
  let args;
  if (platform === "darwin") {
    command = "open";
    args = [url];
  } else if (platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", url];
  } else {
    command = "xdg-open";
    args = [url];
  }

  return new Promise((resolve) => {
    const child = spawn(command, args, { detached: true, stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("spawn", () => {
      child.unref();
      resolve(true);
    });
  });
}

export function readLineFromStdin() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin });
    rl.once("line", (line) => {
      rl.close();
      resolve(line.trim());
    });
    rl.once("close", () => resolve(""));
  });
}
