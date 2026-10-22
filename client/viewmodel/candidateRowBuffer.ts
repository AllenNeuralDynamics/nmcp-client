import {NeuronShape} from "../models/neuron";

export const CandidateBlockSize = 50;

export const CandidateBufferRowLimit = 2000;

// Rows keyed by absolute offset rather than held as per-block arrays, so removing a candidate shifts every later row by
// re-keying alone.
export class CandidateRowBuffer {
    private readonly rows = new Map<number, NeuronShape>();
    private readonly blockUse = new Map<number, number>();
    private useCounter = 0;

    public constructor(public readonly blockSize: number = CandidateBlockSize, public readonly rowLimit: number = CandidateBufferRowLimit) {
    }

    public get size(): number {
        return this.rows.size;
    }

    public get(offset: number): NeuronShape | undefined {
        return this.rows.get(offset);
    }

    // A linear scan stays correct across removal shifts without a second index to keep in step.
    public indexOf(id: string): number | undefined {
        for (const [offset, row] of this.rows) {
            if (row.id === id) {
                return offset;
            }
        }

        return undefined;
    }

    // With an unknown count, only a full block is known to be complete.
    public isBlockComplete(block: number, totalCount: number | null): boolean {
        const start = block * this.blockSize;
        const end = totalCount === null ? start + this.blockSize : Math.min(start + this.blockSize, totalCount);

        for (let offset = start; offset < end; offset++) {
            if (!this.rows.has(offset)) {
                return false;
            }
        }

        return true;
    }

    public store(offset: number, rows: NeuronShape[]): void {
        const blocks = new Set<number>();

        rows.forEach((row, idx) => {
            this.rows.set(offset + idx, row);
            blocks.add(this.blockOf(offset + idx));
        });

        this.touch(blocks);
    }

    public touch(blocks: Iterable<number>): void {
        for (const block of blocks) {
            this.blockUse.set(block, ++this.useCounter);
        }
    }

    // Stops above the limit when only protected blocks remain.
    public evict(protectedBlocks: Set<number>): void {
        while (this.rows.size > this.rowLimit) {
            const victim = this.leastRecentlyUsed(protectedBlocks);

            if (victim === null) {
                return;
            }

            this.deleteBlock(victim);
        }
    }

    public remove(id: string): boolean {
        const removed = this.indexOf(id);

        if (removed === undefined) {
            return false;
        }

        this.rows.delete(removed);

        const later = [...this.rows.keys()].filter(offset => offset > removed).sort((lhs, rhs) => lhs - rhs);

        for (const offset of later) {
            this.rows.set(offset - 1, this.rows.get(offset));
            this.rows.delete(offset);
        }

        return true;
    }

    public clear(): void {
        this.rows.clear();
        this.blockUse.clear();
    }

    private blockOf(offset: number): number {
        return Math.floor(offset / this.blockSize);
    }

    private leastRecentlyUsed(protectedBlocks: Set<number>): number | null {
        const occupied = new Set<number>();

        for (const offset of this.rows.keys()) {
            occupied.add(this.blockOf(offset));
        }

        let victim: number = null;
        let victimUse = Infinity;

        for (const block of occupied) {
            if (protectedBlocks.has(block)) {
                continue;
            }

            const use = this.blockUse.get(block) ?? 0;

            if (use < victimUse) {
                victim = block;
                victimUse = use;
            }
        }

        return victim;
    }

    private deleteBlock(block: number): void {
        const start = block * this.blockSize;

        for (let offset = start; offset < start + this.blockSize; offset++) {
            this.rows.delete(offset);
        }

        this.blockUse.delete(block);
    }
}
