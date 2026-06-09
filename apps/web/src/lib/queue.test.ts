import { describe, expect, it, vi, beforeEach } from "vitest";

const mockAdd = vi.fn();
const mockGetJob = vi.fn();
const mockRemove = vi.fn();

vi.mock("bullmq", () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: mockAdd,
    getJob: mockGetJob,
  })),
}));

describe("enqueuePublishJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockAdd.mockResolvedValue({ id: "job-1" });
  });

  it("calculates delay from scheduled time", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00Z"));

    const { enqueuePublishJob } = await import("./queue");
    const scheduledAt = new Date("2026-06-10T12:05:00Z");
    const jobId = await enqueuePublishJob("post-1", scheduledAt);

    expect(jobId).toBe("job-1");
    expect(mockAdd).toHaveBeenCalledWith(
      "publish",
      { scheduledPostId: "post-1" },
      expect.objectContaining({
        jobId: "post-post-1",
        delay: 5 * 60 * 1000,
      })
    );

    vi.useRealTimers();
  });
});

describe("removePublishJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("removes job when found", async () => {
    mockGetJob.mockResolvedValue({ remove: mockRemove });
    const { removePublishJob } = await import("./queue");
    await removePublishJob("job-1");
    expect(mockRemove).toHaveBeenCalled();
  });

  it("no-ops when job id is null", async () => {
    const { removePublishJob } = await import("./queue");
    await removePublishJob(null);
    expect(mockGetJob).not.toHaveBeenCalled();
  });
});
