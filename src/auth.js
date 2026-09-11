import crypto from "node:crypto";

import { htimeFromSecs } from "./htime.js";

export const CLIENT_ID = "ownerapi";
export const AUTH_URL = "https://auth.tesla.com/oauth2/v3/authorize";
export const TOKEN_URL = "https://auth.tesla.com/oauth2/v3/token";
export const TOKEN_URL_CN = "https://auth.tesla.cn/oauth2/v3/token";
export const REDIRECT_URL = "tesla://auth/callback";
export const SCOPES = ["openid", "email", "offline_access"];
export const EXCHANGE_TIMEOUT_SECONDS = 30;

function base64UrlNoPad(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function isRedirectUrl(url) {
  const s = typeof url === "string" ? url : String(url);
  return s.startsWith(REDIRECT_URL);
}

function queryMapLastWins(callbackUrl) {
  const u = typeof callbackUrl === "string" ? new URL(callbackUrl) : callbackUrl;
  const map = new Map();
  for (const [key, value] of u.searchParams.entries()) {
    map.set(key, value);
  }
  return map;
}

export function parseCallbackUrl(callbackUrl) {
  const u = typeof callbackUrl === "string" ? new URL(callbackUrl) : callbackUrl;
  const map = queryMapLastWins(u);
  return {
    url: u,
    error: map.get("error"),
    code: map.get("code"),
    state: map.get("state"),
    issuer: map.get("issuer"),
  };
}

export class Tokens {
  constructor(access, refresh, expiresInSeconds) {
    this.access = access;
    this.refresh = refresh;
    this.expiresIn = htimeFromSecs(expiresInSeconds);
  }

  toString() {
    return (
      "\n" +
      "--------------------------------- ACCESS TOKEN ---------------------------------\n\n" +
      `${this.access}\n\n` +
      "--------------------------------- REFRESH TOKEN --------------------------------\n\n" +
      `${this.refresh}\n\n` +
      "----------------------------------- VALID FOR ----------------------------------\n\n" +
      `${this.expiresIn}\n`
    );
  }
}

function ssoTokenFromResponse(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid token response");
  }
  const accessToken = data.access_token;
  if (accessToken === undefined || accessToken === null) {
    throw new Error("access_token field missing");
  }
  const refreshToken = data.refresh_token;
  if (refreshToken === undefined || refreshToken === null) {
    throw new Error("refresh_token field missing");
  }
  const expiresIn = data.expires_in;
  if (expiresIn === undefined || expiresIn === null) {
    throw new Error("expires_in field missing");
  }
  return {
    accessToken: String(accessToken),
    refreshToken: String(refreshToken),
    expiresIn: Number(expiresIn),
  };
}

export class Client {
  constructor() {
    this.pkceVerifier = base64UrlNoPad(crypto.randomBytes(32));
    const challenge = base64UrlNoPad(
      crypto.createHash("sha256").update(this.pkceVerifier).digest(),
    );
    this.csrfToken = base64UrlNoPad(crypto.randomBytes(32));

    const pairs = [
      ["response_type", "code"],
      ["client_id", CLIENT_ID],
      ["state", this.csrfToken],
      ["code_challenge", challenge],
      ["code_challenge_method", "S256"],
      ["redirect_uri", REDIRECT_URL],
      ["scope", SCOPES.join(" ")],
    ];
    const search = new URLSearchParams(pairs).toString();
    this._authorizeUrl = `${AUTH_URL}?${search}`;
  }

  authorizeUrl() {
    return this._authorizeUrl;
  }

  async authenticate(callbackUrl) {
    const { error, code, state, issuer } = parseCallbackUrl(callbackUrl);

    if (error === "login_cancelled") {
      return { outcome: "canceled" };
    }

    if (code === undefined || state === undefined || issuer === undefined) {
      return {
        outcome: "failure",
        error: new Error(
          "Callback URL is missing required query parameters (code, state or issuer)",
        ),
      };
    }

    if (state !== this.csrfToken) {
      return { outcome: "failure", error: new Error("CSRF state does not match!") };
    }

    let issuerUrl;
    try {
      issuerUrl = new URL(issuer);
    } catch (e) {
      return {
        outcome: "failure",
        error: new Error(`Invalid issuer URL: ${e.message}`),
      };
    }

    const tokenUri =
      issuerUrl.host === new URL(TOKEN_URL_CN).host ? TOKEN_URL_CN : TOKEN_URL;

    try {
      const resp = await fetch(tokenUri, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams([
          ["grant_type", "authorization_code"],
          ["code", code],
          ["redirect_uri", REDIRECT_URL],
          ["code_verifier", this.pkceVerifier],
          ["client_id", CLIENT_ID],
        ]),
        signal: AbortSignal.timeout(EXCHANGE_TIMEOUT_SECONDS * 1000),
      });

      if (!resp.ok) {
        const body = await resp.text();
        return {
          outcome: "failure",
          error: new Error(`Server returned error response [${resp.status}]: ${body}`),
        };
      }

      const sso = ssoTokenFromResponse(await resp.json());
      return {
        outcome: "authorized",
        tokens: new Tokens(sso.accessToken, sso.refreshToken, sso.expiresIn),
      };
    } catch (e) {
      return { outcome: "failure", error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
}

export function createClient() {
  return new Client();
}
