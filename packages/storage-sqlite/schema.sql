CREATE TABLE IF NOT EXISTS x_account (
  id TEXT PRIMARY KEY,
  x_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  access_token_enc TEXT NOT NULL,
  refresh_token_enc TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  scopes TEXT NOT NULL DEFAULT '',
  connected_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_post (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  scheduled_at INTEGER,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL,
  media_paths TEXT NOT NULL DEFAULT '[]',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  x_tweet_id TEXT,
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_post_status_scheduled ON scheduled_post(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_post_status_updated ON scheduled_post(status, updated_at);
