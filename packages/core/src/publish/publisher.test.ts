import { describe, expect, it, vi, beforeEach } from "vitest";
import { createPublisher } from "./publisher.js";
import type { PostRepository } from "../ports.js";
import type { TokenService } from "../x/token-service.js";

const postRepository: PostRepository = {
  findById: vi.fn(),
  lockForPublish: vi.fn(),
  markPublished: vi.fn(),
  markFailed: vi.fn(),
  markScheduled: vi.fn(),
  findDuePosts: vi.fn(),
  findStaleQueued: vi.fn(),
  recoverToScheduled: vi.fn(),
};

const tokenService: TokenService = {
  getValidAccessToken: vi.fn().mockResolvedValue("access-token"),
  saveTokens: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock("../x/client.js", () => ({
  createTweet: vi.fn().mockResolvedValue({ data: { id: "tweet-1" } }),
  uploadMediaFromBuffer: vi.fn(),
  uploadMediaFromUrl: vi.fn(),
  isRetryableStatus: vi.fn(() => false),
}));

import { createTweet } from "../x/client.js";

describe("createPublisher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips when lockForPublish returns null", async () => {
    vi.mocked(postRepository.lockForPublish).mockResolvedValue(null);

    const publisher = createPublisher({ postRepository, tokenService });
    await publisher.publishPost("post-1");

    expect(postRepository.lockForPublish).toHaveBeenCalledWith("post-1");
    expect(createTweet).not.toHaveBeenCalled();
  });

  it("publishes a locked post", async () => {
    vi.mocked(postRepository.lockForPublish).mockResolvedValue({
      id: "post-1",
      text: "hello world",
      status: "SCHEDULED",
      mediaPaths: [],
      scheduledAt: new Date(),
      updatedAt: new Date(),
      attemptCount: 1,
      xTweetId: null,
      publishedAt: null,
      failureReason: null,
    });

    const publisher = createPublisher({ postRepository, tokenService });
    await publisher.publishPost("post-1");

    expect(tokenService.getValidAccessToken).toHaveBeenCalled();
    expect(createTweet).toHaveBeenCalledWith(
      "access-token",
      "hello world",
      undefined
    );
    expect(postRepository.markPublished).toHaveBeenCalledWith(
      "post-1",
      "tweet-1"
    );
  });

  it("marks failed when publish throws", async () => {
    vi.mocked(postRepository.lockForPublish).mockResolvedValue({
      id: "post-1",
      text: "hello",
      status: "SCHEDULED",
      mediaPaths: [],
      scheduledAt: new Date(),
      updatedAt: new Date(),
      attemptCount: 1,
      xTweetId: null,
      publishedAt: null,
      failureReason: null,
    });
    vi.mocked(createTweet).mockRejectedValue(new Error("X API down"));
    vi.mocked(postRepository.findById).mockResolvedValue({
      id: "post-1",
      text: "hello",
      status: "QUEUED",
      mediaPaths: [],
      scheduledAt: new Date(),
      updatedAt: new Date(),
      attemptCount: 5,
      xTweetId: null,
      publishedAt: null,
      failureReason: null,
    });

    const publisher = createPublisher({ postRepository, tokenService });
    await publisher.publishPost("post-1");

    expect(postRepository.markFailed).toHaveBeenCalledWith(
      "post-1",
      "X API down"
    );
  });
});
