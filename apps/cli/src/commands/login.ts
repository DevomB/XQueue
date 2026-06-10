import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import pc from "picocolors";
import ora from "ora";
import {
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  fetchXUser,
  generatePkce,
  toXCredentials,
} from "@postwave/core";
import { readConfig } from "../config.js";
import { createRuntime } from "../runtime.js";
import { openBrowser } from "../util.js";

const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;

export async function runLogin(): Promise<void> {
  const config = await readConfig();
  const credentials = toXCredentials(config);

  if (!credentials.clientId || credentials.clientId === "YOUR_X_CLIENT_ID") {
    console.error(
      pc.red("X client ID is not configured. Run `postwave init` or edit config.")
    );
    process.exit(1);
  }

  const { verifier, challenge } = generatePkce();
  const state = randomBytes(16).toString("hex");
  const callbackUrl = new URL(credentials.callbackUrl ?? "http://127.0.0.1:3847/callback");
  const port = Number(callbackUrl.port) || 3847;

  const spinner = ora("Waiting for X authorization").start();

  const runtime = await createRuntime(config);

  try {
    const tokens = await new Promise<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope?: string;
    }>((resolve, reject) => {
      let timeout: ReturnType<typeof setTimeout>;
      const server = createServer((req, res) => {
        const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);

        if (url.pathname !== callbackUrl.pathname) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const error = url.searchParams.get("error");
        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`<h1>Authorization failed</h1><p>${error}</p>`);
          clearTimeout(timeout);
          server.close();
          reject(new Error(error));
          return;
        }

        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");

        if (!code || returnedState !== state) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Invalid OAuth response</h1>");
          clearTimeout(timeout);
          server.close();
          reject(new Error("Invalid OAuth state or missing code"));
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Connected!</h1><p>You can close this tab and return to the terminal.</p>"
        );
        clearTimeout(timeout);
        server.close();

        exchangeCodeForTokens(credentials, code, verifier)
          .then((result) => {
            if (!result.refresh_token) {
              reject(new Error("No refresh token received"));
              return;
            }
            resolve({
              access_token: result.access_token,
              refresh_token: result.refresh_token,
              expires_in: result.expires_in,
              scope: result.scope,
            });
          })
          .catch(reject);
      });

      server.listen(port, "127.0.0.1", () => {
        const authorizeUrl = buildAuthorizeUrl(credentials, {
          state,
          codeChallenge: challenge,
        });
        spinner.text = "Opening browser for X login…";
        void openBrowser(authorizeUrl);
        console.log(pc.dim(`\n  If the browser does not open: ${authorizeUrl}\n`));
      });

      server.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      timeout = setTimeout(() => {
        server.close();
        reject(new Error("Login timed out after 5 minutes"));
      }, LOGIN_TIMEOUT_MS);
    });

    const xUser = await fetchXUser(tokens.access_token);
    await runtime.tokenService.saveTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scopes: tokens.scope ?? "",
      xUserId: xUser.data.id,
      xUsername: xUser.data.username,
    });

    spinner.succeed(`Connected as @${xUser.data.username}`);
  } catch (err) {
    spinner.fail("Login failed");
    throw err;
  } finally {
    runtime.close();
  }
}
