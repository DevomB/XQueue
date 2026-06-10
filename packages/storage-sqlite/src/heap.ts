export type HeapEntry = {
  postId: string;
  scheduledAt: number;
};

function parentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

function leftChild(i: number): number {
  return i * 2 + 1;
}

function rightChild(i: number): number {
  return i * 2 + 2;
}

function less(a: HeapEntry, b: HeapEntry): boolean {
  if (a.scheduledAt !== b.scheduledAt) {
    return a.scheduledAt < b.scheduledAt;
  }
  return a.postId < b.postId;
}

export class BinaryMinHeap {
  private items: HeapEntry[] = [];
  private tombstones = new Set<string>();

  get size(): number {
    return this.items.length;
  }

  get tombstoneCount(): number {
    return this.tombstones.size;
  }

  push(entry: HeapEntry): void {
    this.items.push(entry);
    this.bubbleUp(this.items.length - 1);
    this.assertInvariant();
  }

  peek(): HeapEntry | undefined {
    this.skipTombstonesAtRoot();
    return this.items[0];
  }

  pop(): HeapEntry | undefined {
    this.skipTombstonesAtRoot();
    if (this.items.length === 0) {
      return undefined;
    }

    const root = this.items[0]!;
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    this.maybeCompact();
    this.assertInvariant();
    return root;
  }

  remove(postId: string): void {
    this.tombstones.add(postId);
    this.skipTombstonesAtRoot();
    this.maybeCompact();
    this.assertInvariant();
  }

  private skipTombstonesAtRoot(): void {
    while (this.items.length > 0) {
      const root = this.items[0]!;
      if (!this.tombstones.has(root.postId)) {
        return;
      }
      this.tombstones.delete(root.postId);
      const last = this.items.pop()!;
      if (this.items.length > 0) {
        this.items[0] = last;
        this.bubbleDown(0);
      }
    }
  }

  private maybeCompact(): void {
    if (this.tombstones.size === 0) {
      return;
    }
    if (this.tombstones.size <= this.items.length / 2) {
      return;
    }

    const live = this.items.filter((item) => !this.tombstones.has(item.postId));
    this.items = live;
    this.tombstones.clear();
    this.heapify();
  }

  private heapify(): void {
    for (let i = parentIndex(this.items.length - 1); i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  private bubbleUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = parentIndex(i);
      if (!less(this.items[i]!, this.items[parent]!)) {
        break;
      }
      this.swap(i, parent);
      i = parent;
    }
  }

  private bubbleDown(index: number): void {
    let i = index;
    while (true) {
      const left = leftChild(i);
      const right = rightChild(i);
      let smallest = i;

      if (left < this.items.length && less(this.items[left]!, this.items[smallest]!)) {
        smallest = left;
      }
      if (right < this.items.length && less(this.items[right]!, this.items[smallest]!)) {
        smallest = right;
      }
      if (smallest === i) {
        break;
      }
      this.swap(i, smallest);
      i = smallest;
    }
  }

  private swap(a: number, b: number): void {
    const tmp = this.items[a]!;
    this.items[a] = this.items[b]!;
    this.items[b] = tmp;
  }

  assertInvariant(): void {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    for (let i = 0; i < this.items.length; i++) {
      const left = leftChild(i);
      const right = rightChild(i);
      if (left < this.items.length && less(this.items[left]!, this.items[i]!)) {
        throw new Error(`Heap invariant violated at index ${i} (left child)`);
      }
      if (right < this.items.length && less(this.items[right]!, this.items[i]!)) {
        throw new Error(`Heap invariant violated at index ${i} (right child)`);
      }
    }
  }
}
