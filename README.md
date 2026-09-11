# Tesla Auth (JavaScript port)

Securely generate API tokens for third-party access to your Tesla.

Supports MFA and Captcha through Tesla's native login flow.

This is a dependency-free JavaScript (Node.js) port of the Rust
[`tesla_auth`](https://github.com/adriankumpf/tesla_auth) binary, preserving its
OAuth2 PKCE flow, token output, CLI, and exit codes.

## Requirements

- Node.js 18 or newer (uses the built-in `fetch`, `AbortSignal.timeout`, and
  `node:crypto`). No npm dependencies.

## Usage

```plain
❯ tesla_auth --help
Usage: tesla_auth [-d] [-c] [-v]

Tesla API tokens generator

Options:
  -d, --debug       print debug output
  -c, --clear-browsing-data
                    clear browsing data at startup
  -v, --version     print the version and exit
  --help, help      display usage information
```

### Steps

1. Run `node bin/tesla_auth.js` (or `tesla_auth` once installed).
2. The authorize URL is printed and your default browser is opened.
3. Complete the Tesla SSO flow (credentials, MFA if required).
4. Tesla redirects to `tesla://auth/callback?...`. Copy that full URL from the
   browser's address bar and paste it back into the terminal.
5. The access token, refresh token, and validity are printed.

## Difference from the Rust original

The Rust binary embeds a native webview (`tao`/`wry`) that intercepts the
`tesla://auth/callback` redirect automatically. Node has no standard-library
webview, so this port opens the system browser and reads the pasted callback URL
from stdin. The token generation — PKCE challenge, CSRF check, code exchange,
China-endpoint routing — is identical.

## Development

```bash
# Run the test suite
npm test
```

## License

MIT
