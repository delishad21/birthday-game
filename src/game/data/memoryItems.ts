import { AREA_HEIGHT, MAP_TILE_SIZE, areaCenters } from './mapLayout';

export type MemoryItemCategory = 'star' | 'toy' | 'easter-egg';

export interface MemoryItem {
  id: string;
  name: string;
  category: MemoryItemCategory;
  x: number;
  y: number;
  color: number;
  promptText: string;
  dialogueLines: string[];
  collectedMessage: string;
  collectedMessageLines?: string[];
}

export const BEAR_NAME = 'Bear';
export const MARSHMALLOW_NAME = 'Marshmallow';
export const PENGUIN_NAME = 'Penguin';
export const COW_NAME = 'Cow';
export const bearCaveEntrancePosition = {
  x: areaCenters['toy-bear'].x,
  y: areaCenters['toy-bear'].y + AREA_HEIGHT / 2 - MAP_TILE_SIZE * 2,
} as const;
export const marshmallowGardenPosition = {
  x: areaCenters['toy-marshmallow'].x,
  y: areaCenters['toy-marshmallow'].y,
} as const;
export const foodTableStarPosition = {
  x: areaCenters['star-food'].x,
  y: areaCenters['star-food'].y - 135,
} as const;
export const penguinPathSidePosition = {
  x: 2975,
  y: 2225,
} as const;
export const cowEasterEggPosition = {
  x: 515,
  y: 2380,
} as const;

// Edit x and y here to manually place memory items around the map.
export const memoryItems: MemoryItem[] = [
  {
    id: 'star-laughter',
    name: 'Star of Laughter',
    category: 'star',
    x: areaCenters['star-laughter'].x,
    y: areaCenters['star-laughter'].y,
    color: 0xffe66d,
    promptText: 'Press E to start the rhythm challenge.',
    dialogueLines: [
      'This memory star holds the playful parts of the journey. Complete a rhythm challenge to reignite it.',
      'Keep time with the chacha beat to restore the star.',
    ],
    collectedMessage: 'The memory star of laughter has returned!',
  },
  {
    id: 'star-adventure',
    name: 'Star of Adventure',
    category: 'star',
    x: areaCenters['star-adventure'].x,
    y: areaCenters['star-adventure'].y,
    color: 0xff8bd1,
    promptText: 'Press E to inspect the suspicious sparkle.',
    dialogueLines: ['The star of adventure glows in response to you solving the maze.', 'The Star of Adventure has been restored!'],
    collectedMessage: 'The Star of Adventure has been restored!',
  },
  {
    id: 'star-food',
    name: 'Star of Food',
    category: 'star',
    x: foodTableStarPosition.x,
    y: foodTableStarPosition.y,
    color: 0xffa85c,
    promptText: 'Press E to remember something delicious.',
    dialogueLines: ['The star of food seems to be missing its fuel as the table is empty. Look around the area and search for food. Simply interact with the food item to put it back on the table.'],
    collectedMessage: 'The star of food has been restored!',
  },
  {
    id: 'star-memories',
    name: 'Star of Moments',
    category: 'star',
    x: areaCenters['star-memories'].x,
    y: areaCenters['star-memories'].y,
    color: 0xff6f91,
    promptText: 'Press E to listen to this bright feeling.',
    dialogueLines: ['This star seems to contain key moments in your memory. Complete the challenge to reignite the star.'],
    collectedMessage: 'The star of moments has been returned!',
  },
  {
    id: 'toy-bear',
    name: BEAR_NAME,
    category: 'toy',
    x: bearCaveEntrancePosition.x,
    y: bearCaveEntrancePosition.y,
    color: 0x8b5a2b,
    promptText: `Press E to talk with ${BEAR_NAME}.`,
    dialogueLines: [`Welcome to the cave. If you are looking for ${MARSHMALLOW_NAME}, check the garden path to the east.`],
    collectedMessage: 'You found the Bear!',
  },
  {
    id: 'toy-marshmallow',
    name: MARSHMALLOW_NAME,
    category: 'toy',
    x: marshmallowGardenPosition.x,
    y: marshmallowGardenPosition.y,
    color: 0xf7f1e3,
    promptText: `Press E to check on ${MARSHMALLOW_NAME}.`,
    dialogueLines: ['The garden is a quiet checkpoint before the final gift unlock.'],
    collectedMessage: 'You found the Marshmallow!',
  },
  {
    id: 'toy-penguin',
    name: PENGUIN_NAME,
    category: 'toy',
    x: penguinPathSidePosition.x,
    y: penguinPathSidePosition.y,
    color: 0xdff6ff,
    promptText: `Press E to greet ${PENGUIN_NAME}.`,
    dialogueLines: ['Every adventure needs a friendly face beside the path.'],
    collectedMessage: 'You found the Penguin!',
  },
  {
    id: 'easter-cow',
    name: COW_NAME,
    category: 'easter-egg',
    x: cowEasterEggPosition.x,
    y: cowEasterEggPosition.y,
    color: 0xb8874f,
    promptText: `Press E to inspect ${COW_NAME}.`,
    dialogueLines: ['You found an optional easter egg tucked away from the main route.'],
    collectedMessage: 'You found the Cow!',
    collectedMessageLines: ['You found the Cow!', 'This one is optional.', 'Nice exploring.'],
  },
];
