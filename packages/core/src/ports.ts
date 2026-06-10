export type PostStatus =
  | "SCHEDULED"
  | "QUEUED"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

export type ScheduledPost = {
  id: string;
  text: string;
  status: PostStatus;
  mediaPaths: string[];
  scheduledAt: Date | null;
  updatedAt: Date;
  attemptCount: number;
  xTweetId: string | null;
  publishedAt: Date | null;
  failureReason: string | null;
};

export interface PostRepository {
  findById(id: string): Promise<ScheduledPost | null>;
  lockForPublish(id: string): Promise<ScheduledPost | null>;
  markPublished(id: string, xTweetId: string): Promise<void>;
  markFailed(id: string, reason: string): Promise<void>;
  markScheduled(id: string): Promise<void>;
  findDuePosts(now: Date): Promise<ScheduledPost[]>;
  findStaleQueued(threshold: Date): Promise<ScheduledPost[]>;
  recoverToScheduled(id: string): Promise<void>;
}

export interface Scheduler {
  start(onDuePost: (postId: string) => void | Promise<void>): void;
  stop(): void;
}

export type StoredTokens = {
  accessTokenEnc: string;
  refreshTokenEnc: string;
  tokenExpiresAt: Date;
  scopes: string;
  xUserId?: string;
  xUsername?: string;
};

export interface TokenStore {
  getTokens(): Promise<StoredTokens | null>;
  saveTokens(tokens: StoredTokens): Promise<void>;
  clear(): Promise<void>;
}

export type MediaFile = {
  buffer: Buffer;
  mimeType: string;
};

export interface MediaStorage {
  saveMedia(buffer: Buffer, mimeType: string): Promise<string>;
  readMedia(path: string): Promise<MediaFile>;
  deleteMedia(path: string): Promise<void>;
}
