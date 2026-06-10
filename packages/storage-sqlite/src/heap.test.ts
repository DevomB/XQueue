import { describe, expect, it } from "vitest";
import { BinaryMinHeap } from "./heap.js";

describe("BinaryMinHeap", () => {
  it("orders entries by scheduledAt ascending", () => {
    const heap = new BinaryMinHeap();
    heap.push({ postId: "c", scheduledAt: 300 });
    heap.push({ postId: "a", scheduledAt: 100 });
    heap.push({ postId: "b", scheduledAt: 200 });

    expect(heap.pop()?.postId).toBe("a");
    expect(heap.pop()?.postId).toBe("b");
    expect(heap.pop()?.postId).toBe("c");
    expect(heap.pop()).toBeUndefined();
  });

  it("breaks ties by postId for stable ordering", () => {
    const heap = new BinaryMinHeap();
    heap.push({ postId: "z", scheduledAt: 100 });
    heap.push({ postId: "a", scheduledAt: 100 });

    expect(heap.pop()?.postId).toBe("a");
    expect(heap.pop()?.postId).toBe("z");
  });

  it("removes entries via tombstones without breaking ordering", () => {
    const heap = new BinaryMinHeap();
    heap.push({ postId: "a", scheduledAt: 100 });
    heap.push({ postId: "b", scheduledAt: 200 });
    heap.push({ postId: "c", scheduledAt: 300 });

    heap.remove("b");
    expect(heap.peek()?.postId).toBe("a");
    expect(heap.pop()?.postId).toBe("a");
    expect(heap.pop()?.postId).toBe("c");
  });

  it("compacts tombstones when they exceed half the heap", () => {
    const heap = new BinaryMinHeap();
    for (let i = 0; i < 4; i++) {
      heap.push({ postId: `keep-${i}`, scheduledAt: i * 10 + 100 });
    }
    for (let i = 0; i < 4; i++) {
      heap.push({ postId: `drop-${i}`, scheduledAt: i * 10 });
    }

    for (let i = 0; i < 4; i++) {
      heap.remove(`drop-${i}`);
    }

    expect(heap.tombstoneCount).toBe(0);
    expect(heap.size).toBe(4);
    expect(heap.peek()?.postId).toBe("keep-0");
  });
});
