export interface MemoryPhotoAsset {
  id: string;
  filename: string;
  path: string;
  date: string;
  displayDate: string;
  label?: string;
  description?: string;
}

const makePhoto = (filename: string, date: string, label?: string, description?: string): MemoryPhotoAsset => ({
  id: filename,
  filename,
  path: `/portfolio-media/memory-photos/${filename}`,
  date,
  displayDate: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  label,
  description,
});

export const memoryPhotoAssets: MemoryPhotoAsset[] = [
  makePhoto('memory-01.svg', '2024-01-12', 'First Clue', 'A demo snapshot used for the timeline sorting minigame.'),
  makePhoto('memory-02.svg', '2024-03-08', 'Garden Stop', 'A neutral placeholder for a meaningful checkpoint.'),
  makePhoto('memory-03.svg', '2024-06-21', 'Food Quest', 'A sample memory connected to the food restoration puzzle.'),
  makePhoto('memory-04.svg', '2024-09-14', 'Map Detour', 'A sample travel moment for portfolio screenshots.'),
  makePhoto('memory-05.svg', '2025-01-04', 'Rhythm Night', 'A demo image for the rhythm challenge section.'),
  makePhoto('memory-06.svg', '2025-04-18', 'Final Gift', 'A placeholder for the final unlock sequence.'),
];

export const pickMemoryPhotoRound = (photos: MemoryPhotoAsset[], count: number, random = Math.random) => {
  const shuffled = [...photos];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
};

export const arePhotosChronological = (photos: MemoryPhotoAsset[]) =>
  photos.every((photo, index) => index === 0 || photos[index - 1].date <= photo.date);

export const swapPhotoSlots = <T>(order: T[], fromIndex: number, toIndex: number) => {
  const nextOrder = [...order];
  [nextOrder[fromIndex], nextOrder[toIndex]] = [nextOrder[toIndex], nextOrder[fromIndex]];
  return nextOrder;
};

export const reorderPhotoIds = (order: string[], draggedId: string, insertionIndex: number) => {
  const withoutDragged = order.filter((id) => id !== draggedId);
  const boundedIndex = Math.max(0, Math.min(insertionIndex, withoutDragged.length));
  return [
    ...withoutDragged.slice(0, boundedIndex),
    draggedId,
    ...withoutDragged.slice(boundedIndex),
  ];
};
