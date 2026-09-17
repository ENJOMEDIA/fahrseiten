import {
  parseStoredBlocks,
  type StoredBlock,
} from "@/modules/cms/block-schema";

export function normalizePositions(blocks: readonly StoredBlock[]) {
  return blocks.map((block, position) => ({ ...block, position }));
}
export function moveBlock(
  blocks: readonly StoredBlock[],
  id: string,
  direction: -1 | 1,
) {
  const current = blocks.findIndex((block) => block.id === id);
  const target = current + direction;
  if (current < 0 || target < 0 || target >= blocks.length) return [...blocks];
  const next = [...blocks];
  [next[current], next[target]] = [next[target], next[current]];
  return normalizePositions(next);
}
export function duplicateBlock(
  blocks: readonly StoredBlock[],
  id: string,
  newId: string,
) {
  const current = blocks.findIndex((block) => block.id === id);
  if (current < 0) throw new Error("Block nicht gefunden.");
  const copy = structuredClone(blocks[current]);
  copy.id = newId;
  return normalizePositions([
    ...blocks.slice(0, current + 1),
    copy,
    ...blocks.slice(current + 1),
  ]);
}
export function validateDraft(blocks: unknown) {
  return parseStoredBlocks(blocks);
}
