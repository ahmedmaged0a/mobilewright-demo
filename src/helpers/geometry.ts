import type { Locator } from 'mobilewright';

type Box = Awaited<ReturnType<Locator['boundingBox']>>;

function overlapsHorizontally(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width;
}

export async function closestAbove(anchor: Locator, candidates: Locator): Promise<Locator> {
  const anchorBox = await anchor.boundingBox();
  let closest: { locator: Locator; gap: number } | undefined;

  for (const candidate of await candidates.all()) {
    const box = await candidate.boundingBox();
    const gap = anchorBox.y - (box.y + box.height);
    if (gap >= 0 && overlapsHorizontally(anchorBox, box) && (!closest || gap < closest.gap)) {
      closest = { locator: candidate, gap };
    }
  }

  if (!closest) {
    throw new Error('No candidate element found directly above the anchor element');
  }
  return closest.locator;
}
