import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn(),
    scheduledPost: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    xAccount: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("./lib/email.js", () => ({
  sendFailedPostEmail: vi.fn(),
}));

vi.mock("./lib/x.js", () => ({
  createTweet: vi.fn(),
  uploadMediaFromUrl: vi.fn(),
  isRetryableStatus: vi.fn(),
  needsTokenRefresh: vi.fn(() => false),
  refreshAccessToken: vi.fn(),
  tokenExpiresAt: vi.fn(),
}));

import { prisma } from "./lib/db.js";
import { processPublishJob } from "./publish-job.js";

describe("processPublishJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips published posts", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue(null);
    await processPublishJob("post-1");
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("marks failed when no x account", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue({
      id: "post-1",
      status: "SCHEDULED",
      xAccountId: null,
      xAccount: null,
      user: { email: "test@example.com" },
      text: "hello",
      mediaUrls: [],
      updatedAt: new Date(),
    });
    vi.mocked(prisma.scheduledPost.update).mockResolvedValue({} as never);

    await processPublishJob("post-1");

    expect(prisma.scheduledPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED" }),
      })
    );
  });
});
