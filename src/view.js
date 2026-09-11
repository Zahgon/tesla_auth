const STYLESHEET = `:root {
  color-scheme: light dark;
  --bg: #f3f4f6;
  --card: #ffffff;
  --fg: #111827;
  --muted: #6b7280;
  --border: #d1d5db;
  --danger: #b91c1c;
  --success: #15803d;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0d10;
    --card: #16191e;
    --fg: #e5e7eb;
    --muted: #9ca3af;
    --border: #374151;
    --danger: #f87171;
    --success: #4ade80;
  }
}
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  padding: 24px;
  background: var(--bg);
  color: var(--fg);
  font: 16px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
main {
  /* \`margin: auto\` rather than \`align-items: center\`, which clips the top of
     the card once the content outgrows the viewport. */
  margin: auto;
  width: min(900px, 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px;
  border-radius: 16px;
  background: var(--card);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}
h1 { margin: 0; text-align: center; font-size: 30px; line-height: 1.2; }
h2 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
p { margin: 0; text-align: center; }
p.muted { color: var(--muted); }
p.danger { color: var(--danger); }
p.success { color: var(--success); font-size: 14px; }
textarea {
  width: 100%;
  height: 12em;
  resize: vertical;
  padding: 12px;
  color: inherit;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
`;

export function progress() {
  return page(
    "<h1>Generating Tokens …</h1>" +
      '<p class="muted">Exchanging the authorization code with Tesla.</p>',
  );
}

export function tokens(t) {
  return page(
    "<h1>Tesla API Tokens</h1>" +
      "<h2>Access Token</h2>" +
      `<textarea readonly onclick="this.select()">${escape(t.access)}</textarea>` +
      "<h2>Refresh Token</h2>" +
      `<textarea readonly onclick="this.select()">${escape(t.refresh)}</textarea>` +
      `<p class="success">Valid for ${escape(String(t.expiresIn))}</p>`,
  );
}

export function error(err) {
  return page(
    "<h1>An error occurred</h1>" +
      `<p class="danger">${escape(errorToString(err))}</p>` +
      '<p class="muted">Please restart tesla_auth and try again.</p>',
  );
}

export function page(body) {
  return (
    "<!DOCTYPE html>" +
    '<html lang="en">' +
    "<head>" +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    "<title>Tesla Auth</title>" +
    `<style>${STYLESHEET}</style>` +
    "</head>" +
    `<body><main>${body}</main></body>` +
    "</html>"
  );
}

export function escape(text) {
  let escaped = "";
  for (const c of text) {
    switch (c) {
      case "&":
        escaped += "&amp;";
        break;
      case "<":
        escaped += "&lt;";
        break;
      case ">":
        escaped += "&gt;";
        break;
      case '"':
        escaped += "&quot;";
        break;
      case "'":
        escaped += "&#39;";
        break;
      default:
        escaped += c;
    }
  }
  return escaped;
}

function errorToString(err) {
  return err instanceof Error ? err.message : String(err);
}

export { STYLESHEET };
