import type { StoredTokens, TokenStore } from "@postwave/core";
import type Database from "better-sqlite3";

type AccountRow = {
  id: string;
  x_user_id: string;
  username: string;
  access_token_enc: string;
  refresh_token_enc: string;
  expires_at: number;
  scopes: string;
  connected_at: number;
};

const ACCOUNT_ID = "default";

export class SqliteTokenStore implements TokenStore {
  private readonly getStmt;
  private readonly upsertStmt;
  private readonly clearStmt;

  constructor(private readonly db: Database.Database) {
    this.getStmt = db.prepare(`
      SELECT
        id, x_user_id, username, access_token_enc, refresh_token_enc,
        expires_at, scopes, connected_at
      FROM x_account
      LIMIT 1
    `);
    this.upsertStmt = db.prepare(`
      INSERT INTO x_account (
        id, x_user_id, username, access_token_enc, refresh_token_enc,
        expires_at, scopes, connected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        x_user_id = excluded.x_user_id,
        username = excluded.username,
        access_token_enc = excluded.access_token_enc,
        refresh_token_enc = excluded.refresh_token_enc,
        expires_at = excluded.expires_at,
        scopes = excluded.scopes,
        connected_at = excluded.connected_at
    `);
    this.clearStmt = db.prepare(`DELETE FROM x_account`);
  }

  async getTokens(): Promise<StoredTokens | null> {
    const row = this.getStmt.get() as AccountRow | undefined;
    if (!row) {
      return null;
    }

    return {
      accessTokenEnc: row.access_token_enc,
      refreshTokenEnc: row.refresh_token_enc,
      tokenExpiresAt: new Date(row.expires_at),
      scopes: row.scopes,
      xUserId: row.x_user_id,
      xUsername: row.username,
    };
  }

  async saveTokens(tokens: StoredTokens): Promise<void> {
    const now = Date.now();
    const xUserId = tokens.xUserId ?? ACCOUNT_ID;
    const username = tokens.xUsername ?? "unknown";

    this.upsertStmt.run(
      ACCOUNT_ID,
      xUserId,
      username,
      tokens.accessTokenEnc,
      tokens.refreshTokenEnc,
      tokens.tokenExpiresAt.getTime(),
      tokens.scopes,
      now
    );
  }

  async clear(): Promise<void> {
    this.clearStmt.run();
  }
}
