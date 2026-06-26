import Phaser from 'phaser';
import {
  adventureAreaAssets,
  adventureAreaPlacement,
  adventureMazeBlockingBodies,
  adventureMazeWalls,
  getAdventureWallDepth,
} from './data/adventureArea';
import {
  caveAreaManifest,
  getCaveBlockingBodiesFromAlpha,
  getCaveBlockingBodies,
  getCaveDepthForPlayerY,
  getCaveLayerDepth,
  getCaveLayerWorldPlacement,
} from './data/caveArea';
import {
  gardenFlooringPlacement,
  getGardenPlantDepth,
  gardenPlantAssets,
  gardenPlantBlockingBodies,
  gardenPlantPlacements,
} from './data/gardenArea';
import { toyImageAssets } from './data/toyAssets';
import { type FlipbookId, type FlipbookPage } from './data/flipbooks';
import {
  laughterDanceBeatmap,
  laughterDanceInstruction,
  laughterDancePreSongBufferMs,
  laughterDanceSong,
} from './data/laughterDance';
import {
  FOOD_COLLISION_STRIP_HEIGHT,
  FOOD_COLLISION_TOP_TRIM,
  FOOD_BLOCKING_DEPTH_UP_SHIFT,
  FOOD_ON_TABLE_DEPTH_OFFSET,
  FOOD_TABLETOP_DEPTH_OFFSET,
  foodAreaLayers,
  foodAreaPlacement,
  foodObjectAssets,
  getAlphaStripBlockingBodies,
  getFoodBlockingLayerDepth,
  getPaddedFoodLayerPlacement,
  type AlphaBounds,
  type AlphaStripRow,
} from './data/foodArea';
import {
  FOOD_FLOOR_DISPLAY_SIZE,
  FOOD_FOUND_THUMBNAIL_SIZE,
  FOOD_FOUND_THUMBNAIL_TEXT_GAP,
  countMissingFoodItems,
  foodQuestItems,
  getFoodCropScale,
  type FoodQuestItem,
} from './data/foodQuest';
import {
  getLaughterBlockingBodies,
  getLaughterLayerDepth,
  getLaughterLayerWorldPlacement,
  laughterAreaManifest,
} from './data/laughterArea';
import {
  MAP_COLUMNS,
  MAP_ROWS,
  MAP_TILE_SIZE,
  MAP_WORLD_HEIGHT,
  MAP_WORLD_WIDTH,
  finalArea,
  finalGiftCollisionBody,
  finalGiftPosition,
  grassOverlayAssets,
  grassOverlayPlacements,
  pathCells,
  spawnPosition,
  treeAssets,
  treePlacements,
} from './data/mapLayout';
import { memoryZones } from './data/mapDecor';
import {
  getMemoryFlooringDepth,
  getMemoryCollectibleDepth,
  getMemoryFlooringHitboxBodiesFromAlpha,
  isMemoryFlooringPointInsideAlpha,
  memoryAreaAssets,
  memoryAreaPlacement,
} from './data/memoryArea';
import { memoryItems, type MemoryItem } from './data/memoryItems';
import {
  arePhotosChronological,
  memoryPhotoAssets,
  pickMemoryPhotoRound,
  swapPhotoSlots,
  type MemoryPhotoAsset,
} from './data/memoryPhotoMinigame';
import {
  finalGiftToyPlacements,
  finalGiftStarHoleAsset,
  starVisualsById,
  type FinalGiftToyId,
  type StarVisualId,
} from './data/starVisuals';
import {
  CAVE_GUIDE_DISPLAY_SIZE,
  CAMERA_ZOOM,
  GARDEN_KEEPER_DISPLAY_SIZE,
  COLLECTED_ITEM_DISPLAY_SCALE,
  DIALOGUE_DEPTH,
  ENDING_DEPTH,
  FINAL_GIFT_FOOTPRINT_SIZE,
  FINAL_GIFT_VISUAL_SIZE,
  HUD_DEPTH,
  HIDDEN_MASCOT_DISPLAY_SIZE,
  PATH_FRIEND_DISPLAY_SIZE,
  PLAYER_DISPLAY_HEIGHT,
  PLAYER_DISPLAY_WIDTH,
  PLAYER_HITBOX_HEIGHT,
  PLAYER_HITBOX_OFFSET_X,
  PLAYER_HITBOX_OFFSET_Y,
  PLAYER_HITBOX_WIDTH,
  STAR_DISPLAY_SIZE,
  STAR_FLOAT_DISTANCE,
  TREE_VISUAL_DEPTH_OFFSET,
  UI_SCALE,
  UI_CAMERA_ZOOM,
  getCollectedItemDisplaySize,
} from './gamePresentation';
import {
  REQUIRED_TOYS,
  REQUIRED_MEMORY_STARS,
  findNearbyUncollectedMemoryItem,
  getCollectedCounts,
  isFinalGiftUnlocked,
} from './memoryItemState';
import {
  addBeatmapNote,
  getActiveNotes,
  getDdrDirectionsForInputKeys,
  getMissedNoteIds,
  isBeatmapPastFinalNote,
  judgeBeatmapInput,
  type BeatmapNote,
  type DdrDirection,
} from './ddr/beatmap';
import { getPlayerAnimationFrame, type PlayerDirection } from './playerAnimation';
import { getPlayerMoveSpeed } from './playerMovement';

const WORLD_WIDTH = MAP_WORLD_WIDTH;
const WORLD_HEIGHT = MAP_WORLD_HEIGHT;
const TILE_SIZE = MAP_TILE_SIZE;
const INTERACTION_RADIUS = 72;
const PLAYER_DEPTH_TO_HITBOX_FRONT_OFFSET = PLAYER_HITBOX_OFFSET_Y - PLAYER_DISPLAY_HEIGHT / 2;
const DANCE_LEAD_TIME_MS = 3000;
const DANCE_HIT_WINDOW_MS = 180;
const DANCE_END_DELAY_MS = 850;
const CHALLENGE_SKIP_FAILURE_THRESHOLD = 1;
const DANCE_DIRECTIONS: DdrDirection[] = ['left', 'down', 'up', 'right'];
const DANCE_DIRECTION_LABELS: Record<DdrDirection, string> = { left: '←', down: '↓', up: '↑', right: '→' };
const DANCE_ARROW_CENTER_X = 480;
const DANCE_ARROW_SPACING = 82;
const getDanceArrowX = (index: number) => DANCE_ARROW_CENTER_X + (index - (DANCE_DIRECTIONS.length - 1) / 2) * DANCE_ARROW_SPACING;
const MEMORY_PHOTO_ROUND_SIZE = 6;
const MEMORY_PHOTO_SLOT_POSITIONS = [
  { x: 130, y: 284 },
  { x: 270, y: 284 },
  { x: 410, y: 284 },
  { x: 550, y: 284 },
  { x: 690, y: 284 },
  { x: 830, y: 284 },
] as const;
const FOOD_FOUND_MESSAGE_TEXT_X = 430;
const FOOD_FOUND_MESSAGE_Y = 336;
const ui = (value: number) => value * UI_SCALE;
const uiFont = (value: number) => `${ui(value)}px`;
const FINAL_GIFT = {
  x: finalGiftPosition.x,
  y: finalGiftPosition.y,
  radius: 92,
  lockedPrompt: 'Press E to check the final gift',
  unlockedPrompt: 'Press E to open the final gift',
};
const INTRO_LINES = [
  "You open your eyes and find yourself in a mysterious place. You find that you can't seem to remember anything. Your memories seem to be scattered around the mysterious place, perhaps you should look around for some items.",
];
const ALL_CORE_MEMORIES_RESTORED_LINE = 'All core memories have been restored! Return to the starting area.';
const getToyDisplaySize = (itemId: string) => {
  switch (itemId) {
    case 'toy-bear':
      return CAVE_GUIDE_DISPLAY_SIZE;
    case 'toy-marshmallow':
      return GARDEN_KEEPER_DISPLAY_SIZE;
    case 'toy-penguin':
      return PATH_FRIEND_DISPLAY_SIZE;
    case 'easter-cow':
      return HIDDEN_MASCOT_DISPLAY_SIZE;
    default:
      return GARDEN_KEEPER_DISPLAY_SIZE;
  }
};
const getToyTextureKey = (itemId: string) => {
  switch (itemId) {
    case 'toy-bear':
      return toyImageAssets.bear.key;
    case 'toy-marshmallow':
      return toyImageAssets.marshmallow.key;
    case 'toy-penguin':
      return toyImageAssets.penguin.key;
    case 'easter-cow':
      return toyImageAssets.cow.key;
    default:
      return toyImageAssets.marshmallow.key;
  }
};

const PLAYER_SPRITE_ASSETS = [
  { key: 'player-forward-standing', path: '/character-sprite/forward-standing.png' },
  { key: 'player-forward-walk-1', path: '/character-sprite/forward-walk-1.png' },
  { key: 'player-forward-walk-2', path: '/character-sprite/forward-walk-2.png' },
  { key: 'player-side-standing', path: '/character-sprite/side-standing.png' },
  { key: 'player-side-walk-1', path: '/character-sprite/side-walk-1.png' },
  { key: 'player-side-walk-2', path: '/character-sprite/side-walk-2.png' },
  { key: 'player-back-standing', path: '/character-sprite/back-standing.png' },
  { key: 'player-back-walk-1', path: '/character-sprite/back-walk-1.png' },
  { key: 'player-back-walk-2', path: '/character-sprite/back-walk-2.png' },
] as const;

type ActiveDialogue =
  | { kind: 'memory'; item: MemoryItem; lineIndex: number }
  | { kind: 'message'; title: string; lines: string[]; lineIndex: number };
type CollectableItemObject = Phaser.GameObjects.GameObject & {
  setAlpha: (value?: number) => CollectableItemObject;
  setScale: (x: number, y?: number) => CollectableItemObject;
  setDisplaySize?: (width: number, height: number) => CollectableItemObject;
};
type DanceState = 'playing' | 'completed';
type DanceSound = Phaser.Sound.BaseSound & { seek?: number };
type MemoryPhotoCard = {
  container: Phaser.GameObjects.Container;
  dateText: Phaser.GameObjects.Text;
};

export default class GameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private danceKeys?: Record<'Z' | 'X' | 'PERIOD' | 'FORWARD_SLASH', Phaser.Input.Keyboard.Key>;
  private wasd?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private interactKeys?: Record<'E' | 'SPACE', Phaser.Input.Keyboard.Key>;
  private sprintKeys?: Record<'SHIFT' | 'LEFT_SHIFT' | 'RIGHT_SHIFT', Phaser.Input.Keyboard.Key>;
  private restartKey?: Phaser.Input.Keyboard.Key;
  private propBodies?: Phaser.Physics.Arcade.StaticGroup;
  private caveLayers: Array<{ image: Phaser.GameObjects.Image; baseDepth: number }> = [];
  private memoryFlooringImage?: Phaser.GameObjects.Image;
  private memoryFlooringAlphaMetrics?: { rows: AlphaStripRow[]; sourceSize: { width: number; height: number } };
  private uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private lastPlayerDirection: PlayerDirection = 'forward';
  private lastPlayerFlipX = false;
  private itemObjects = new Map<string, CollectableItemObject>();
  private itemEffects = new Map<string, Phaser.GameObjects.Shape[]>();
  private foodTableObjects = new Map<string, Phaser.GameObjects.Image>();
  private foodWorldObjects = new Map<string, Phaser.GameObjects.Image>();
  private returnedFoodIds = new Set<string>();
  private foodQuestStarted = false;
  private pendingFoodStarCollectItem?: MemoryItem;
  private finalGiftStarImages = new Map<StarVisualId, Phaser.GameObjects.Image>();
  private finalGiftToyImages = new Map<FinalGiftToyId, Phaser.GameObjects.Image>();
  private collectedItemIds = new Set<string>();
  private endingActive = false;
  private endingContainer?: Phaser.GameObjects.Container;
  private hudContainer?: Phaser.GameObjects.Container;
  private activeDialogue?: ActiveDialogue;
  private starsText?: Phaser.GameObjects.Text;
  private toysText?: Phaser.GameObjects.Text;
  private finalGiftPedestal?: Phaser.GameObjects.Image;
  private finalGiftImage?: Phaser.GameObjects.Image;
  private finalGiftGlow?: Phaser.GameObjects.Arc;
  private finalGiftPromptText?: Phaser.GameObjects.Text;
  private danceContainer?: Phaser.GameObjects.Container;
  private danceStatusText?: Phaser.GameObjects.Text;
  private danceMissCounterText?: Phaser.GameObjects.Text;
  private danceFeedbackText?: Phaser.GameObjects.Text;
  private danceRetryButton?: Phaser.GameObjects.Container;
  private danceSkipButton?: Phaser.GameObjects.Container;
  private danceNoteObjects = new Map<string, Phaser.GameObjects.Text>();
  private danceNotes: BeatmapNote[] = [];
  private danceHitNoteIds = new Set<string>();
  private danceMissedNoteIds = new Set<string>();
  private danceMissCount = 0;
  private danceState?: DanceState;
  private danceTargetItem?: MemoryItem;
  private pendingDanceItem?: MemoryItem;
  private danceSong?: DanceSound;
  private danceStartedAtMs = 0;
  private danceSongStartTimer?: Phaser.Time.TimerEvent;
  private danceEndTimer?: Phaser.Time.TimerEvent;
  private memoryPhotoContainer?: Phaser.GameObjects.Container;
  private memoryPhotoTargetItem?: MemoryItem;
  private pendingMemoryPhotoItem?: MemoryItem;
  private memoryPhotoSelected: MemoryPhotoAsset[] = [];
  private memoryPhotoOrder: string[] = [];
  private memoryPhotoCards = new Map<string, MemoryPhotoCard>();
  private memoryPhotoStatusText?: Phaser.GameObjects.Text;
  private memoryPhotoSubmitButton?: Phaser.GameObjects.Container;
  private memoryPhotoRetryButton?: Phaser.GameObjects.Container;
  private memoryPhotoCompleteTimer?: Phaser.Time.TimerEvent;
  private memoryPhotoActive = false;
  private flipbookActive = false;
  private dialogueBox?: Phaser.GameObjects.Container;
  private dialogueNameText?: Phaser.GameObjects.Text;
  private dialogueLineText?: Phaser.GameObjects.Text;
  private collectedMessageText?: Phaser.GameObjects.Text;
  private collectedMessageImage?: Phaser.GameObjects.Image;
  private collectedMessageTimer?: Phaser.Time.TimerEvent;
  private pendingDialogueAction?: () => void;
  private pendingCoreMemoryRestoredMessage = false;
  private hasShownCoreMemoryRestoredMessage = false;

  private readonly handleMemoryPhotoComplete = () => {
    const item = this.memoryPhotoTargetItem;
    this.memoryPhotoActive = false;
    this.memoryPhotoTargetItem = undefined;
    if (item) {
      this.collectItem(item);
    }
  };

  private readonly handleMemoryPhotoCancel = () => {
    this.memoryPhotoActive = false;
    this.memoryPhotoTargetItem = undefined;
  };

  private readonly handleFlipbookClosed = (event: Event) => {
    this.flipbookActive = false;

    const detail = (event as CustomEvent<{ flipbookId?: FlipbookId; completed?: boolean }>).detail;
    if (detail?.flipbookId === 'final' && detail.completed) {
      this.startFinalEnding();
      return;
    }

    if (!this.pendingCoreMemoryRestoredMessage || !this.isFinalGiftUnlocked()) {
      return;
    }

    this.pendingCoreMemoryRestoredMessage = false;
    this.showCoreMemoryRestoredMessage();
  };

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('map-grass', '/grass.png');
    this.load.image('map-path-center', '/path-center.png');
    this.load.image('map-path-edge', '/path-edge.png');
    this.load.image('map-path-corner', '/path-corner.png');
    this.load.image('map-path-inner-corner', '/path-inner-corner.png');
    this.load.image('special-gift-flooring', '/special-area/gift-area/gift area flooring.png');
    this.load.image(finalGiftStarHoleAsset.key, finalGiftStarHoleAsset.path);
    this.load.image('special-gift-pedestal', '/special-area/gift-area/Gift Pedestal.png');
    this.load.image('special-gift', '/special-area/gift-area/gift.png');
    this.load.audio(laughterDanceSong.key, laughterDanceSong.path);
    for (const photo of memoryPhotoAssets) {
      this.load.image(photo.id, photo.path);
    }
    for (const visual of Object.values(starVisualsById)) {
      this.load.image(visual.starKey, visual.starPath);
      this.load.image(visual.filledKey, visual.filledPath);
    }
    this.load.image(adventureAreaAssets.flooring.key, adventureAreaAssets.flooring.path);
    for (const wallAsset of adventureAreaAssets.walls) {
      this.load.image(wallAsset.key, wallAsset.path);
    }
    this.load.image(memoryAreaAssets.flooring.key, memoryAreaAssets.flooring.path);
    this.load.image(memoryAreaAssets.hitbox.key, memoryAreaAssets.hitbox.path);
    this.load.image(toyImageAssets.bear.key, toyImageAssets.bear.path);
    this.load.image(toyImageAssets.penguin.key, toyImageAssets.penguin.path);
    this.load.image(toyImageAssets.cow.key, toyImageAssets.cow.path);
    this.load.image('garden-area-flooring', '/garden-area/garden-area-flooring.png');
    this.load.image(toyImageAssets.marshmallow.key, toyImageAssets.marshmallow.path);
    for (const asset of foodAreaLayers) {
      this.load.image(asset.key, asset.path);
    }
    for (const asset of foodObjectAssets) {
      this.load.image(asset.key, asset.path);
    }
    for (const item of foodQuestItems) {
      this.load.image(item.floorAssetKey, item.floorAssetPath);
    }
    for (const layer of caveAreaManifest.layers) {
      this.load.image(layer.key, `/special-area/cave-area/${layer.file}`);
    }
    for (const layer of laughterAreaManifest.layers) {
      this.load.image(layer.key, `/special-area/laughter-area/${layer.file}`);
    }
    for (const sprite of PLAYER_SPRITE_ASSETS) {
      this.load.image(sprite.key, sprite.path);
    }
    for (const grass of grassOverlayAssets) {
      this.load.image(grass.key, grass.path);
    }
    for (const plant of gardenPlantAssets) {
      this.load.image(plant.key, plant.path);
    }
    for (const tree of treeAssets) {
      this.load.image(tree.key, tree.path);
    }
  }

  create() {
    this.resetRuntimeState();
    this.cameras.main.setBackgroundColor('#1b1736');
    this.cameras.main.fadeIn(900, 0, 0, 0);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.propBodies = this.physics.add.staticGroup();

    this.createMap();
    this.createCaveArea();
    this.createLaughterArea();
    this.createAdventureArea();
    this.createMemoryArea();
    this.createTrees();
    this.createFoodArea();
    this.createFinalGiftArea();
    this.createGardenArea();
    this.createMemoryItems();
    this.createPlayer();
    this.createUiCamera();
    this.createHud();
    this.createDialogueUi();
    this.createControls();
    this.openIntroDialogue();
    window.addEventListener('memory-photo-minigame:complete', this.handleMemoryPhotoComplete);
    window.addEventListener('memory-photo-minigame:cancel', this.handleMemoryPhotoCancel);
    window.addEventListener('flipbook:closed', this.handleFlipbookClosed);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('memory-photo-minigame:complete', this.handleMemoryPhotoComplete);
      window.removeEventListener('memory-photo-minigame:cancel', this.handleMemoryPhotoCancel);
      window.removeEventListener('flipbook:closed', this.handleFlipbookClosed);
    });
  }

  private resetRuntimeState() {
    this.player = undefined;
    this.cursors = undefined;
    this.wasd = undefined;
    this.interactKeys = undefined;
    this.sprintKeys = undefined;
    this.restartKey = undefined;
    this.propBodies = undefined;
    this.caveLayers = [];
    this.memoryFlooringImage = undefined;
    this.memoryFlooringAlphaMetrics = undefined;
    this.uiCamera = undefined;
    this.lastPlayerDirection = 'forward';
    this.lastPlayerFlipX = false;
    this.itemObjects.clear();
    this.itemEffects.clear();
    this.foodTableObjects.clear();
    this.foodWorldObjects.clear();
    this.returnedFoodIds.clear();
    this.foodQuestStarted = false;
    this.pendingFoodStarCollectItem = undefined;
    this.finalGiftStarImages.clear();
    this.finalGiftToyImages.clear();
    this.collectedItemIds.clear();
    this.endingActive = false;
    this.endingContainer = undefined;
    this.hudContainer = undefined;
    this.activeDialogue = undefined;
    this.starsText = undefined;
    this.toysText = undefined;
    this.finalGiftPedestal = undefined;
    this.finalGiftImage = undefined;
    this.finalGiftGlow = undefined;
    this.finalGiftPromptText = undefined;
    this.danceContainer = undefined;
    this.danceStatusText = undefined;
    this.danceMissCounterText = undefined;
    this.danceFeedbackText = undefined;
    this.danceRetryButton = undefined;
    this.danceSkipButton = undefined;
    this.danceNoteObjects.clear();
    this.danceNotes = [];
    this.danceHitNoteIds.clear();
    this.danceMissedNoteIds.clear();
    this.danceMissCount = 0;
    this.danceState = undefined;
    this.danceTargetItem = undefined;
    this.pendingDanceItem = undefined;
    this.danceSong = undefined;
    this.danceStartedAtMs = 0;
    this.danceSongStartTimer = undefined;
    this.danceEndTimer = undefined;
    this.memoryPhotoContainer = undefined;
    this.memoryPhotoTargetItem = undefined;
    this.pendingMemoryPhotoItem = undefined;
    this.memoryPhotoSelected = [];
    this.memoryPhotoOrder = [];
    this.memoryPhotoCards.clear();
    this.memoryPhotoStatusText = undefined;
    this.memoryPhotoSubmitButton = undefined;
    this.memoryPhotoRetryButton = undefined;
    this.memoryPhotoCompleteTimer = undefined;
    this.memoryPhotoActive = false;
    this.flipbookActive = false;
    this.dialogueBox = undefined;
    this.dialogueNameText = undefined;
    this.dialogueLineText = undefined;
    this.collectedMessageText = undefined;
    this.collectedMessageImage = undefined;
    this.collectedMessageTimer = undefined;
    this.pendingDialogueAction = undefined;
    this.pendingCoreMemoryRestoredMessage = false;
    this.hasShownCoreMemoryRestoredMessage = false;
  }

  update() {
    if (
      !this.player ||
      !this.cursors ||
      !this.wasd ||
      !this.interactKeys ||
      !this.sprintKeys ||
      !this.restartKey
    ) {
      return;
    }

    const interacted =
      Phaser.Input.Keyboard.JustDown(this.interactKeys.E) ||
      Phaser.Input.Keyboard.JustDown(this.interactKeys.SPACE);
    const restartPressed = Phaser.Input.Keyboard.JustDown(this.restartKey);

    if (this.danceState) {
      this.player.setVelocity(0, 0);
      this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
      this.updateDanceMinigame();
      return;
    }

    if (this.memoryPhotoActive || this.memoryPhotoContainer) {
      this.player.setVelocity(0, 0);
      this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
      return;
    }

    if (this.flipbookActive) {
      this.player.setVelocity(0, 0);
      this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
      return;
    }

    if (this.endingActive) {
      this.player.setVelocity(0, 0);
      this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));

      if (restartPressed) {
        this.scene.restart();
      }

      return;
    }

    if (this.activeDialogue) {
      this.player.setVelocity(0, 0);
      this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));

      if (interacted) {
        this.advanceDialogue();
      }

      return;
    }

    this.updateFinalGiftPrompt();

    if (interacted) {
      const nearbyFood = this.findNearbyFoodQuestItem();
      if (nearbyFood) {
        this.collectFoodQuestItem(nearbyFood);
        this.player.setVelocity(0, 0);
        this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
        return;
      }

      const nearbyItem = findNearbyUncollectedMemoryItem(
        memoryItems,
        this.collectedItemIds,
        { x: this.player.x, y: this.player.y },
        INTERACTION_RADIUS,
      );

      if (nearbyItem) {
        if (nearbyItem.id === 'star-laughter') {
          this.openDanceChallengeDialogue(nearbyItem);
          this.player.setVelocity(0, 0);
          this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
          return;
        }
        if (nearbyItem.id === 'star-memories') {
          this.openMemoryPhotoChallengeDialogue(nearbyItem);
          this.player.setVelocity(0, 0);
          this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
          return;
        }
        if (nearbyItem.id === 'star-food') {
          this.handleFoodStarInteraction(nearbyItem);
          this.player.setVelocity(0, 0);
          this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
          return;
        }
        this.openDialogue(nearbyItem);
        this.player.setVelocity(0, 0);
        this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
        return;
      }

      if (this.isPlayerNearFinalGift()) {
        this.openFinalGiftDialogue();
        this.player.setVelocity(0, 0);
        this.updatePlayerAnimation(new Phaser.Math.Vector2(0, 0));
        return;
      }
    }

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    const velocity = new Phaser.Math.Vector2(
      Number(right) - Number(left),
      Number(down) - Number(up),
    );

    if (velocity.lengthSq() > 0) {
      const isSprinting = this.sprintKeys.SHIFT.isDown || this.sprintKeys.LEFT_SHIFT.isDown || this.sprintKeys.RIGHT_SHIFT.isDown;
      velocity.normalize().scale(getPlayerMoveSpeed(isSprinting));
    }

    this.player.setVelocity(velocity.x, velocity.y);
    this.updatePlayerAnimation(velocity);
    this.player.setDepth(this.player.y);
    this.updateMemoryAreaDepth();
    this.updateCaveDepth();
  }

  private createMap() {
    const graphics = this.add.graphics();
    const pathCellSet = new Set(pathCells.map((cell) => this.getPathCellKey(cell.col, cell.row)));

    for (let row = 0; row < MAP_ROWS; row += 1) {
      for (let col = 0; col < MAP_COLUMNS; col += 1) {
        this.addMapTile('map-grass', col, row);
      }
    }

    for (const cell of pathCells) {
      this.addPathTile(cell.col, cell.row, pathCellSet);
    }

    this.createGrassOverlays();
    this.createMemoryZones();

    graphics.lineStyle(6, 0xffd873, 1);
    graphics.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  }

  private addMapTile(textureKey: string, col: number, row: number, angle = 0) {
    return this.add
      .image(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, textureKey)
      .setDisplaySize(TILE_SIZE, TILE_SIZE)
      .setAngle(angle)
      .setDepth(0);
  }

  private addPathTile(col: number, row: number, pathCellSet: Set<string>) {
    const grassSides = this.getGrassSides(col, row, pathCellSet);
    const innerCornerAngle = this.getPathInnerCornerAngle(col, row, pathCellSet);
    if (innerCornerAngle !== undefined) {
      this.addMapTile('map-path-inner-corner', col, row, innerCornerAngle);
      return;
    }

    const cornerAngle = this.getPathCornerAngle(grassSides);

    if (cornerAngle !== undefined) {
      this.addMapTile('map-path-corner', col, row, cornerAngle);
      return;
    }

    const edgeAngle = this.getPathEdgeAngle(grassSides[0]);
    if (edgeAngle !== undefined) {
      this.addMapTile('map-path-edge', col, row, edgeAngle);
      return;
    }

    this.addMapTile('map-path-center', col, row);
  }

  private createGrassOverlays() {
    for (const grass of grassOverlayPlacements) {
      const x = grass.col * TILE_SIZE + TILE_SIZE / 2;
      const y = grass.row * TILE_SIZE + TILE_SIZE / 2;
      const displaySize = this.getPropDisplaySize(grass.propType);

      this.add
        .image(x, y, grass.assetKey)
        .setDisplaySize(displaySize, displaySize)
        .setAlpha(grass.alpha ?? 1)
        .setDepth(grass.blocksMovement ? y : 0.5);

      if (grass.blocksMovement) {
        this.addStaticPropBody(x, y);
      }
    }
  }

  private createLaughterArea() {
    const placement = getLaughterLayerWorldPlacement();

    for (const layer of laughterAreaManifest.layers) {
      this.add
        .image(placement.x, placement.y, layer.key)
        .setDisplaySize(placement.width, placement.height)
        .setOrigin(0.5, 1)
        .setDepth(getLaughterLayerDepth(layer, PLAYER_DEPTH_TO_HITBOX_FRONT_OFFSET));
    }

    for (const body of getLaughterBlockingBodies()) {
      this.addStaticPropBody(body.x, body.y);
    }
  }

  private createAdventureArea() {
    this.add
      .image(adventureAreaPlacement.x, adventureAreaPlacement.y, adventureAreaAssets.flooring.key)
      .setDisplaySize(adventureAreaPlacement.width, adventureAreaPlacement.height)
      .setDepth(1);

    for (const wall of adventureMazeWalls) {
      this.add
        .image(wall.x, wall.y, wall.assetKey)
        .setDisplaySize(wall.width, wall.height)
        .setOrigin(wall.originX, wall.originY)
        .setDepth(getAdventureWallDepth(wall, PLAYER_DEPTH_TO_HITBOX_FRONT_OFFSET));
    }

    for (const body of adventureMazeBlockingBodies) {
      this.addStaticPropBody(body.x, body.y, body.width, body.height);
    }
  }

  private createMemoryArea() {
    this.memoryFlooringImage = this.add
      .image(memoryAreaPlacement.x, memoryAreaPlacement.y, memoryAreaAssets.flooring.key)
      .setDisplaySize(memoryAreaPlacement.width, memoryAreaPlacement.height)
      .setDepth(1);

    const flooringMetrics = this.getTextureAlphaMetrics(memoryAreaAssets.flooring.key);
    if (flooringMetrics) {
      this.memoryFlooringAlphaMetrics = { rows: flooringMetrics.exactRows, sourceSize: flooringMetrics.sourceSize };
    }

    const hitboxMetrics = this.getTextureAlphaMetrics(memoryAreaAssets.hitbox.key);
    if (!hitboxMetrics) {
      return;
    }

    for (const body of getMemoryFlooringHitboxBodiesFromAlpha(hitboxMetrics.rows, hitboxMetrics.sourceSize)) {
      this.addStaticPropBody(body.x, body.y, body.width, body.height);
    }
  }

  private createCaveArea() {
    const placement = getCaveLayerWorldPlacement();
    const caveBlockingBodies = [];

    for (const layer of caveAreaManifest.layers) {
      const baseDepth = getCaveLayerDepth(layer);
      const image = this.add
        .image(placement.x, placement.y, layer.key)
        .setDisplaySize(placement.width, placement.height)
        .setOrigin(0.5, 1)
        .setDepth(baseDepth);
      this.caveLayers.push({ image, baseDepth });

      const metrics = this.getTextureAlphaMetrics(layer.key);
      caveBlockingBodies.push(
        ...(metrics
          ? getCaveBlockingBodiesFromAlpha(metrics.rows, metrics.sourceSize, metrics.bounds)
          : getCaveBlockingBodies()),
      );
    }

    for (const body of caveBlockingBodies) {
      this.addStaticPropBody(body.x, body.y, body.width, body.height);
    }
  }

  private createGardenArea() {
    this.add
      .image(gardenFlooringPlacement.x, gardenFlooringPlacement.y, 'garden-area-flooring')
      .setDisplaySize(gardenFlooringPlacement.width, gardenFlooringPlacement.height)
      .setDepth(1);

    for (const plant of gardenPlantPlacements) {
      const x = plant.col * TILE_SIZE + TILE_SIZE / 2;
      const y = (plant.row + 1) * TILE_SIZE;
      this.add
        .image(x, y, plant.assetKey)
        .setOrigin(0.5, 1)
        .setDepth(getGardenPlantDepth(plant.row));
    }

    for (const body of gardenPlantBlockingBodies) {
      this.addStaticPropBody(body.x, body.y, body.width, body.height);
    }
  }

  private updateCaveDepth() {
    if (!this.player) {
      return;
    }

    for (const layer of this.caveLayers) {
      layer.image.setDepth(getCaveDepthForPlayerY(this.player.y, layer.baseDepth));
    }
  }

  private updateMemoryAreaDepth() {
    if (!this.player || !this.memoryFlooringImage) {
      return;
    }

    const probeX = this.player.x;
    const probeY = this.player.y + PLAYER_DEPTH_TO_HITBOX_FRONT_OFFSET;
    const isInsideFlooringAlpha = this.memoryFlooringAlphaMetrics
      ? isMemoryFlooringPointInsideAlpha(
          probeX,
          probeY,
          this.memoryFlooringAlphaMetrics.rows,
          this.memoryFlooringAlphaMetrics.sourceSize,
        )
      : false;

    this.memoryFlooringImage.setDepth(getMemoryFlooringDepth(this.player.y, isInsideFlooringAlpha));
  }

  private getPropDisplaySize(propType: 'tall-grass' | 'flower' | 'mushroom' | 'rock' | 'bush') {
    switch (propType) {
      case 'bush':
        return 62;
      case 'flower':
        return 54;
      case 'mushroom':
        return 44;
      case 'rock':
        return 48;
      case 'tall-grass':
      default:
        return 60;
    }
  }

  private getGrassSides(col: number, row: number, pathCellSet: Set<string>) {
    const sides: Array<'top' | 'right' | 'bottom' | 'left'> = [];
    if (!pathCellSet.has(this.getPathCellKey(col, row - 1))) {
      sides.push('top');
    }
    if (!pathCellSet.has(this.getPathCellKey(col + 1, row))) {
      sides.push('right');
    }
    if (!pathCellSet.has(this.getPathCellKey(col, row + 1))) {
      sides.push('bottom');
    }
    if (!pathCellSet.has(this.getPathCellKey(col - 1, row))) {
      sides.push('left');
    }
    return sides;
  }

  private getPathInnerCornerAngle(col: number, row: number, pathCellSet: Set<string>) {
    const hasPath = (targetCol: number, targetRow: number) => pathCellSet.has(this.getPathCellKey(targetCol, targetRow));
    if (hasPath(col, row - 1) && hasPath(col + 1, row) && !hasPath(col + 1, row - 1)) {
      return 0;
    }
    if (hasPath(col + 1, row) && hasPath(col, row + 1) && !hasPath(col + 1, row + 1)) {
      return 90;
    }
    if (hasPath(col, row + 1) && hasPath(col - 1, row) && !hasPath(col - 1, row + 1)) {
      return 180;
    }
    if (hasPath(col - 1, row) && hasPath(col, row - 1) && !hasPath(col - 1, row - 1)) {
      return 270;
    }
    return undefined;
  }

  private getPathCornerAngle(sides: Array<'top' | 'right' | 'bottom' | 'left'>) {
    const sideSet = new Set(sides);
    if (sideSet.has('top') && sideSet.has('left')) {
      return 0;
    }
    if (sideSet.has('top') && sideSet.has('right')) {
      return 90;
    }
    if (sideSet.has('right') && sideSet.has('bottom')) {
      return 180;
    }
    if (sideSet.has('bottom') && sideSet.has('left')) {
      return 270;
    }
    return undefined;
  }

  private getPathEdgeAngle(side?: 'top' | 'right' | 'bottom' | 'left') {
    switch (side) {
      case 'top':
        return 0;
      case 'right':
        return 90;
      case 'bottom':
        return 180;
      case 'left':
        return 270;
      default:
        return undefined;
    }
  }

  private getPathCellKey(col: number, row: number) {
    return `${col},${row}`;
  }

  private createMemoryZones() {
    for (const zone of memoryZones) {
      this.add
        .rectangle(zone.x, zone.y, zone.width, zone.height, zone.primaryColor, 0.18)
        .setStrokeStyle(3, zone.secondaryColor, 0.72);
      this.add
        .text(zone.x, zone.y - zone.height / 2 + 18, zone.label, {
          color: '#fff8fb',
          fontFamily: 'monospace',
          fontSize: '12px',
          stroke: '#17112a',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(2);
    }
  }

  private createTrees() {
    for (const tree of treePlacements) {
      const x = tree.col * TILE_SIZE + TILE_SIZE / 2;
      const y = (tree.row + 1) * TILE_SIZE;
      this.add
        .image(x, y, tree.assetKey)
        .setDisplaySize(TILE_SIZE * 2.5, TILE_SIZE * 3.75)
        .setOrigin(0.5, 1)
        .setDepth(y - TREE_VISUAL_DEPTH_OFFSET);

      this.addStaticPropBody(x, tree.row * TILE_SIZE + TILE_SIZE / 2);
    }
  }

  private addStaticPropBody(x: number, y: number, width = TILE_SIZE, height = TILE_SIZE) {
    const body = this.add.rectangle(x, y, width, height, 0x000000, 0);
    this.physics.add.existing(body, true);
    this.propBodies?.add(body);
  }

  private getTextureAlphaMetrics(textureKey: string):
    | { bounds: AlphaBounds; rows: AlphaStripRow[]; exactRows: AlphaStripRow[]; sourceSize: { width: number; height: number } }
    | undefined {
    const source = this.textures.get(textureKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    context.drawImage(source, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;
    const rows: AlphaStripRow[] = [];
    const exactRows: AlphaStripRow[] = [];

    const getSegmentsFromColumns = (alphaColumns: boolean[]) => {
      const segments = [];
      let segmentStart: number | undefined;
      for (let x = 0; x < alphaColumns.length; x += 1) {
        if (alphaColumns[x]) {
          segmentStart ??= x;
        } else if (segmentStart !== undefined) {
          segments.push({ minX: segmentStart, maxX: x - 1 });
          segmentStart = undefined;
        }
      }
      if (segmentStart !== undefined) {
        segments.push({ minX: segmentStart, maxX: alphaColumns.length - 1 });
      }
      return segments;
    };

    for (let stripY = 0; stripY < canvas.height; stripY += FOOD_COLLISION_STRIP_HEIGHT) {
      const alphaColumns = new Array<boolean>(canvas.width).fill(false);
      const maxStripY = Math.min(stripY + FOOD_COLLISION_STRIP_HEIGHT, canvas.height);
      for (let y = stripY; y < maxStripY; y += 1) {
        const exactAlphaColumns = new Array<boolean>(canvas.width).fill(false);
        for (let x = 0; x < canvas.width; x += 1) {
          if (data[(y * canvas.width + x) * 4 + 3] > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            alphaColumns[x] = true;
            exactAlphaColumns[x] = true;
          }
        }

        const exactSegments = getSegmentsFromColumns(exactAlphaColumns);
        if (exactSegments.length > 0) {
          exactRows.push({ y, segments: exactSegments });
        }
      }

      const segments = getSegmentsFromColumns(alphaColumns);

      if (segments.length > 0) {
        rows.push({ y: stripY, segments });
      }
    }

    if (maxX < minX || maxY < minY) {
      return undefined;
    }

    return { bounds: { minX, minY, maxX, maxY }, rows, exactRows, sourceSize: { width: canvas.width, height: canvas.height } };
  }

  private createFoodArea() {
    for (const layer of foodAreaLayers) {
      const metrics = this.getTextureAlphaMetrics(layer.key);
      if (!metrics) {
        continue;
      }

      const placement = getPaddedFoodLayerPlacement(metrics.bounds, metrics.sourceSize);
      const blockingBodies = layer.blocksMovement
        ? getAlphaStripBlockingBodies(
            metrics.rows,
            metrics.sourceSize,
            FOOD_COLLISION_STRIP_HEIGHT,
            FOOD_COLLISION_TOP_TRIM,
            metrics.bounds.minY,
          )
        : [];
      const depth = layer.key === 'food-area-flooring'
        ? 1
        : layer.alwaysBelowPlayer
          ? 2
          : getFoodBlockingLayerDepth(
              blockingBodies,
              placement.visibleBottomY,
              PLAYER_DEPTH_TO_HITBOX_FRONT_OFFSET,
              FOOD_BLOCKING_DEPTH_UP_SHIFT,
            ) + (layer.depthOffset ?? 0);
      this.add
        .image(placement.x, placement.y, layer.key)
        .setDisplaySize(placement.width, placement.height)
        .setDepth(depth);

      if (layer.blocksMovement) {
        for (const body of blockingBodies) {
          this.addStaticPropBody(body.x, body.y, body.width, body.height);
        }
      }
    }

    for (const asset of foodObjectAssets) {
      const metrics = this.getTextureAlphaMetrics(asset.key);
      if (!metrics) {
        continue;
      }

      const placement = getPaddedFoodLayerPlacement(metrics.bounds, metrics.sourceSize);
      const tableFood = this.add
        .image(placement.x, placement.y, asset.key)
        .setDisplaySize(placement.width, placement.height)
        .setDepth(placement.visibleBottomY + (asset.depthOffset ?? 0))
        .setVisible(false);
      this.foodTableObjects.set(asset.key, tableFood);
    }

    this.createFoodQuestCollectibles();
  }

  private createFoodQuestCollectibles() {
    for (const item of foodQuestItems) {
      const metrics = this.getTextureAlphaMetrics(item.floorAssetKey);
      const food = this.add
        .image(item.worldPosition.x, item.worldPosition.y, item.floorAssetKey)
        .setDepth(item.worldPosition.y)
        .setVisible(false);
      if (metrics) {
        food.setScale(getFoodCropScale(metrics.bounds, FOOD_FLOOR_DISPLAY_SIZE));
      } else {
        food.setDisplaySize(FOOD_FLOOR_DISPLAY_SIZE, FOOD_FLOOR_DISPLAY_SIZE);
      }
      this.foodWorldObjects.set(item.id, food);
    }
  }

  private createFinalGiftArea() {
    this.add
      .image(finalArea.x, finalArea.y, 'special-gift-flooring')
      .setDisplaySize(finalArea.width, finalArea.height)
      .setDepth(1);
    this.add
      .image(finalArea.x, finalArea.y, finalGiftStarHoleAsset.key)
      .setDisplaySize(finalArea.width, finalArea.height)
      .setDepth(2);
    for (const [starId, visual] of Object.entries(starVisualsById) as Array<[StarVisualId, (typeof starVisualsById)[StarVisualId]]>) {
      const filledStar = this.add
        .image(finalArea.x, finalArea.y, visual.filledKey)
        .setDisplaySize(finalArea.width, finalArea.height)
        .setDepth(3)
        .setVisible(false);
      this.finalGiftStarImages.set(starId, filledStar);
    }
    for (const [toyId, placement] of Object.entries(finalGiftToyPlacements) as Array<[
      FinalGiftToyId,
      (typeof finalGiftToyPlacements)[FinalGiftToyId],
    ]>) {
      const image = this.add
        .image(finalArea.x + placement.offsetX, finalArea.y + placement.offsetY, getToyTextureKey(toyId))
        .setDisplaySize(placement.displaySize, placement.displaySize)
        .setOrigin(0.5, 1)
        .setDepth(finalArea.y + placement.offsetY)
        .setVisible(false);
      this.finalGiftToyImages.set(toyId, image);
    }
    this.finalGiftGlow = this.add.circle(FINAL_GIFT.x, FINAL_GIFT.y, 70, 0xfff3a3, 0.22).setVisible(false);
    this.finalGiftPedestal = this.add
      .image(FINAL_GIFT.x, FINAL_GIFT.y, 'special-gift-pedestal')
      .setDisplaySize(FINAL_GIFT_VISUAL_SIZE, FINAL_GIFT_VISUAL_SIZE)
      .setDepth(FINAL_GIFT.y + FINAL_GIFT_FOOTPRINT_SIZE / 2 - 1);
    this.finalGiftImage = this.add
      .image(FINAL_GIFT.x, FINAL_GIFT.y, 'special-gift')
      .setDisplaySize(FINAL_GIFT_VISUAL_SIZE, FINAL_GIFT_VISUAL_SIZE)
      .setDepth(FINAL_GIFT.y + FINAL_GIFT_FOOTPRINT_SIZE / 2);
    this.addStaticPropBody(
      finalGiftCollisionBody.x,
      finalGiftCollisionBody.y,
      finalGiftCollisionBody.width,
      finalGiftCollisionBody.height,
    );

    this.finalGiftPromptText = this.add
      .text(FINAL_GIFT.x, FINAL_GIFT.y - 82, '', {
        align: 'center',
        color: '#fff8fb',
        fontFamily: 'monospace',
        fontSize: '15px',
        stroke: '#17112a',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(9)
      .setVisible(false);
  }

  private createMemoryItems() {
    // Configure manual item placement in src/game/data/memoryItems.ts by editing each item's x and y.
    for (const item of memoryItems) {
      if (item.category === 'star') {
        const starDepth = item.id === 'star-memories'
          ? getMemoryCollectibleDepth()
          : item.id === 'star-food'
            ? foodAreaPlacement.y + FOOD_TABLETOP_DEPTH_OFFSET + 1
            : item.y;
        const visual = starVisualsById[item.id as StarVisualId];
        const glow = this.add.circle(item.x, item.y, 38, item.color, 0.28).setDepth(starDepth - 1);
        const star = this.add
          .image(item.x, item.y, visual.starKey)
          .setDisplaySize(STAR_DISPLAY_SIZE, STAR_DISPLAY_SIZE)
          .setDepth(starDepth);
        this.tweens.add({ targets: glow, alpha: 0.08, scale: 1.2, duration: 1050, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: [glow, star], y: item.y - STAR_FLOAT_DISTANCE, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.itemEffects.set(item.id, [glow]);
        this.itemObjects.set(item.id, star);
        continue;
      }

      const highlight = this.add.circle(item.x, item.y, 29, item.color, 0.18).setDepth(item.y - 1);
      const toy = this.add
        .image(item.x, item.y, getToyTextureKey(item.id))
        .setDisplaySize(getToyDisplaySize(item.id), getToyDisplaySize(item.id))
        .setDepth(item.y);
      this.tweens.add({ targets: highlight, alpha: 0.34, duration: 1200, yoyo: true, repeat: -1 });
      this.itemEffects.set(item.id, [highlight]);
      this.itemObjects.set(item.id, toy);
    }
  }

  private startDanceMinigame(item: MemoryItem) {
    this.stopDanceTimersAndTweens();
    this.danceContainer?.destroy(true);
    this.danceTargetItem = item;
    this.danceState = 'playing';
    this.danceHitNoteIds.clear();
    this.danceMissedNoteIds.clear();
    this.danceMissCount = 0;
    this.danceNoteObjects.clear();
    this.danceStartedAtMs = this.time.now;
    this.danceNotes = laughterDanceBeatmap.reduce<BeatmapNote[]>(
      (notes, note) => addBeatmapNote(notes, note.timeMs, note.direction),
      [],
    );
    this.stopDanceSong();
    this.danceSong = this.sound.add(laughterDanceSong.key) as DanceSound;
    this.createDanceOverlay();
    this.danceSongStartTimer = this.time.delayedCall(laughterDancePreSongBufferMs, () => {
      if (this.danceState !== 'playing') {
        return;
      }
      this.danceSong?.play();
    });
  }

  private openDanceChallengeDialogue(item: MemoryItem) {
    this.pendingDanceItem = item;
    this.activeDialogue = {
      kind: 'message',
      title: item.name,
      lines: item.dialogueLines,
      lineIndex: 0,
    };
    this.collectedMessageTimer?.remove(false);
    this.collectedMessageText?.setVisible(false);
    this.collectedMessageImage?.setVisible(false);
    this.updateDialogueUi();
    this.dialogueBox?.setVisible(true);
  }

  private openMemoryPhotoChallengeDialogue(item: MemoryItem) {
    this.pendingMemoryPhotoItem = item;
    this.activeDialogue = {
      kind: 'message',
      title: item.name,
      lines: item.dialogueLines,
      lineIndex: 0,
    };
    this.collectedMessageTimer?.remove(false);
    this.collectedMessageText?.setVisible(false);
    this.collectedMessageImage?.setVisible(false);
    this.updateDialogueUi();
    this.dialogueBox?.setVisible(true);
  }

  private createDanceOverlay() {
    this.danceContainer?.destroy(true);

    const panel = this.add.rectangle(ui(480), ui(270), ui(860), ui(490), 0x17112a, 0.94).setStrokeStyle(ui(4), 0xffd873);
    const title = this.add.text(ui(480), ui(48), 'Dance of Laughter', {
      align: 'center',
      color: '#ffe68a',
      fontFamily: 'monospace',
      fontSize: uiFont(22),
      stroke: '#17112a',
      strokeThickness: ui(4),
    }).setOrigin(0.5);
    const hint = this.add.text(ui(480), ui(82), laughterDanceInstruction, {
      align: 'center',
      color: '#ffd6e9',
      fontFamily: 'monospace',
      fontSize: uiFont(14),
      stroke: '#17112a',
      strokeThickness: ui(3),
      wordWrap: { width: ui(760) },
    }).setOrigin(0.5);
    const arrowPanel = this.add.rectangle(ui(DANCE_ARROW_CENTER_X), ui(294), ui(360), ui(330), 0x0f1831, 0.7).setStrokeStyle(ui(2), 0x6a3d8f);
    const targets = DANCE_DIRECTIONS.map((direction, index) =>
      this.add.text(ui(getDanceArrowX(index)), ui(132), DANCE_DIRECTION_LABELS[direction], {
        align: 'center',
        color: '#ffe68a',
        fontFamily: 'monospace',
        fontSize: uiFont(34),
        stroke: '#17112a',
        strokeThickness: ui(5),
      }).setOrigin(0.5),
    );
    this.danceStatusText = this.add.text(ui(480), ui(492), '', {
      align: 'center',
      color: '#fff8fb',
      fontFamily: 'monospace',
      fontSize: uiFont(16),
      stroke: '#17112a',
      strokeThickness: ui(4),
    }).setOrigin(0.5);
    this.danceMissCounterText = this.add.text(ui(792), ui(48), 'Misses 0', {
      align: 'right',
      color: '#ffd6e9',
      fontFamily: 'monospace',
      fontSize: uiFont(15),
      stroke: '#17112a',
      strokeThickness: ui(4),
    }).setOrigin(1, 0.5);
    this.danceFeedbackText = this.add.text(ui(DANCE_ARROW_CENTER_X), ui(294), '', {
      align: 'center',
      color: '#9ff3ff',
      fontFamily: 'monospace',
      fontSize: uiFont(34),
      stroke: '#17112a',
      strokeThickness: ui(6),
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const retryBack = this.add.rectangle(ui(480), ui(438), ui(180), ui(52), 0xffd873, 1).setStrokeStyle(ui(3), 0xd6884f).setInteractive({ useHandCursor: true });
    const retryText = this.add.text(ui(480), ui(438), 'Retry Dance', {
      align: 'center',
      color: '#2b1748',
      fontFamily: 'monospace',
      fontSize: uiFont(16),
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.danceRetryButton = this.add.container(0, 0, [retryBack, retryText]).setVisible(false);
    retryBack.on('pointerdown', () => {
      if (this.danceTargetItem) {
        this.startDanceMinigame(this.danceTargetItem);
      }
    });

    const skipBack = this.add.rectangle(ui(590), ui(438), ui(170), ui(52), 0x9ff3ff, 1).setStrokeStyle(ui(3), 0x4d8ea8).setInteractive({ useHandCursor: true });
    const skipText = this.add.text(ui(590), ui(438), 'Continue', {
      align: 'center',
      color: '#2b1748',
      fontFamily: 'monospace',
      fontSize: uiFont(15),
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.danceSkipButton = this.add.container(0, 0, [skipBack, skipText]).setVisible(false);
    skipBack.on('pointerdown', () => this.continueDanceMinigame());

    this.danceContainer = this.useUiCamera(this.add
      .container(0, 0, [
        panel,
        title,
        hint,
        arrowPanel,
        ...targets,
        this.danceMissCounterText,
        this.danceFeedbackText,
        this.danceStatusText,
        this.danceRetryButton,
        this.danceSkipButton,
      ])
      .setScrollFactor(0)
      .setDepth(DIALOGUE_DEPTH + 20));
  }

  private updateDanceMinigame() {
    if (!this.danceState || !this.danceStatusText) {
      return;
    }

    if (this.danceState !== 'playing') {
      return;
    }

    const currentTimeMs = this.getDanceSongTimeMs();
    this.handleDanceInput(currentTimeMs);
    this.updateDanceNotes(currentTimeMs);
    this.updateDanceMisses(currentTimeMs);

    const bufferRemainingMs = Math.max(0, laughterDancePreSongBufferMs - (this.time.now - this.danceStartedAtMs));
    this.danceMissCounterText?.setText(`Misses ${this.danceMissCount}`);
    this.danceStatusText.setText(bufferRemainingMs > 0
      ? `Get ready... song starts in ${Math.ceil(bufferRemainingMs / 1000)}`
      : `Hits ${this.danceHitNoteIds.size}/${this.danceNotes.length}`);

    if (isBeatmapPastFinalNote(this.danceNotes, currentTimeMs, DANCE_HIT_WINDOW_MS)) {
      this.completeDanceMinigame();
    }
  }

  private handleDanceInput(currentTimeMs: number) {
    if (!this.cursors || currentTimeMs < 0) {
      return;
    }

    const pressedDirections = getDdrDirectionsForInputKeys({
      left: Phaser.Input.Keyboard.JustDown(this.cursors.left),
      down: Phaser.Input.Keyboard.JustDown(this.cursors.down),
      up: Phaser.Input.Keyboard.JustDown(this.cursors.up),
      right: Phaser.Input.Keyboard.JustDown(this.cursors.right),
      z: this.danceKeys ? Phaser.Input.Keyboard.JustDown(this.danceKeys.Z) : false,
      x: this.danceKeys ? Phaser.Input.Keyboard.JustDown(this.danceKeys.X) : false,
      period: this.danceKeys ? Phaser.Input.Keyboard.JustDown(this.danceKeys.PERIOD) : false,
      slash: this.danceKeys ? Phaser.Input.Keyboard.JustDown(this.danceKeys.FORWARD_SLASH) : false,
    });

    for (const direction of pressedDirections) {
      const judgement = judgeBeatmapInput(this.danceNotes, this.danceHitNoteIds, currentTimeMs, direction, DANCE_HIT_WINDOW_MS);
      if (judgement.result === 'hit') {
        this.danceHitNoteIds.add(judgement.noteId);
        const noteObject = this.danceNoteObjects.get(judgement.noteId);
        noteObject?.setAlpha(0.25).setColor('#caff8a');
        this.showDanceFeedback('HIT', 0x9ff3ff);
      } else {
        this.addDanceMiss();
      }
    }
  }

  private showDanceFeedback(message: string, color: number) {
    if (!this.danceFeedbackText) {
      return;
    }

    this.tweens.killTweensOf(this.danceFeedbackText);
    this.danceFeedbackText.setText(message).setColor(`#${color.toString(16).padStart(6, '0')}`).setAlpha(0.7);
    this.tweens.add({ targets: this.danceFeedbackText, alpha: 0, duration: 420, delay: 220 });
  }

  private getDanceSongTimeMs() {
    const elapsedSinceDanceStartMs = this.time.now - this.danceStartedAtMs;
    if (elapsedSinceDanceStartMs < laughterDancePreSongBufferMs) {
      return Math.round(elapsedSinceDanceStartMs - laughterDancePreSongBufferMs);
    }

    return Math.round((this.danceSong?.seek ?? 0) * 1000);
  }

  private updateDanceNotes(currentTimeMs: number) {
    if (!this.danceContainer) {
      return;
    }

    const activeIds = new Set(getActiveNotes(this.danceNotes, currentTimeMs, DANCE_LEAD_TIME_MS).map((note) => note.id));
    for (const [noteId, object] of this.danceNoteObjects) {
      if (!activeIds.has(noteId) || this.danceHitNoteIds.has(noteId) || this.danceMissedNoteIds.has(noteId)) {
        object.destroy();
        this.danceNoteObjects.delete(noteId);
      }
    }

    for (const note of getActiveNotes(this.danceNotes, currentTimeMs, DANCE_LEAD_TIME_MS)) {
      if (this.danceHitNoteIds.has(note.id) || this.danceMissedNoteIds.has(note.id)) {
        continue;
      }

      const directionIndex = DANCE_DIRECTIONS.indexOf(note.direction);
      const progress = 1 - (note.timeMs - currentTimeMs) / DANCE_LEAD_TIME_MS;
      const x = ui(getDanceArrowX(directionIndex));
      const y = Phaser.Math.Linear(ui(432), ui(132), Phaser.Math.Clamp(progress, 0, 1));
      let noteObject = this.danceNoteObjects.get(note.id);
      if (!noteObject) {
        noteObject = this.add.text(x, y, DANCE_DIRECTION_LABELS[note.direction], {
          align: 'center',
          color: '#9ff3ff',
          fontFamily: 'monospace',
          fontSize: uiFont(32),
          stroke: '#17112a',
          strokeThickness: ui(5),
        }).setOrigin(0.5);
        this.danceContainer.add(noteObject);
        this.danceNoteObjects.set(note.id, noteObject);
      }
      noteObject.setPosition(x, y);
    }
  }

  private updateDanceMisses(currentTimeMs: number) {
    const resolvedNoteIds = new Set([...this.danceHitNoteIds, ...this.danceMissedNoteIds]);
    const missedNoteIds = getMissedNoteIds(this.danceNotes, resolvedNoteIds, currentTimeMs, DANCE_HIT_WINDOW_MS);
    if (missedNoteIds.length === 0) {
      return;
    }

    for (const noteId of missedNoteIds) {
      this.danceMissedNoteIds.add(noteId);
    }
    this.addDanceMiss(missedNoteIds.length);
  }

  private addDanceMiss(count = 1) {
    if (this.danceState !== 'playing') {
      return;
    }

    this.danceMissCount += count;
    this.danceMissCounterText?.setText(`Misses ${this.danceMissCount}`);
    this.showDanceFeedback('MISS', 0xff8aa8);
  }

  private continueDanceMinigame() {
    const item = this.danceTargetItem;
    this.cleanupDanceMinigame();
    if (item) {
      this.collectItem(item);
    }
  }

  private completeDanceMinigame() {
    if (this.danceState !== 'playing') {
      return;
    }

    this.danceState = 'completed';
    this.stopDanceSong();
    this.stopDanceTimersAndTweens();
    this.showDanceResultsScreen();
  }

  private showDanceResultsScreen() {
    const hitCount = this.danceHitNoteIds.size;
    const noteCount = this.danceNotes.length;
    const missCount = this.danceMissCount;

    this.danceContainer?.destroy(true);
    this.danceNoteObjects.clear();

    const panel = this.add.rectangle(ui(480), ui(270), ui(640), ui(360), 0x17112a, 0.96).setStrokeStyle(ui(4), 0xffd873);
    const title = this.add.text(ui(480), ui(156), 'Dance Results', {
      align: 'center',
      color: '#ffe68a',
      fontFamily: 'monospace',
      fontSize: uiFont(24),
      stroke: '#17112a',
      strokeThickness: ui(5),
    }).setOrigin(0.5);
    this.danceStatusText = this.add.text(ui(480), ui(238), `Hits ${hitCount}/${noteCount}\nMisses ${missCount}`, {
      align: 'center',
      color: '#fff8fb',
      fontFamily: 'monospace',
      fontSize: uiFont(20),
      stroke: '#17112a',
      strokeThickness: ui(5),
    }).setOrigin(0.5);

    const retryBack = this.add.rectangle(ui(380), ui(366), ui(180), ui(56), 0xffd873, 1).setStrokeStyle(ui(3), 0xd6884f).setInteractive({ useHandCursor: true });
    const retryText = this.add.text(ui(380), ui(366), 'Retry Dance', {
      align: 'center',
      color: '#2b1748',
      fontFamily: 'monospace',
      fontSize: uiFont(16),
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.danceRetryButton = this.add.container(0, 0, [retryBack, retryText]);
    retryBack.on('pointerdown', () => {
      if (this.danceTargetItem) {
        this.startDanceMinigame(this.danceTargetItem);
      }
    });

    const continueBack = this.add.rectangle(ui(580), ui(366), ui(180), ui(56), 0x9ff3ff, 1).setStrokeStyle(ui(3), 0x4d8ea8).setInteractive({ useHandCursor: true });
    const continueText = this.add.text(ui(580), ui(366), 'Continue', {
      align: 'center',
      color: '#2b1748',
      fontFamily: 'monospace',
      fontSize: uiFont(16),
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.danceSkipButton = this.add.container(0, 0, [continueBack, continueText]);
    continueBack.on('pointerdown', () => this.continueDanceMinigame());

    this.danceMissCounterText = undefined;
    this.danceFeedbackText = undefined;
    this.danceContainer = this.useUiCamera(this.add
      .container(0, 0, [panel, title, this.danceStatusText, this.danceRetryButton, this.danceSkipButton])
      .setScrollFactor(0)
      .setDepth(DIALOGUE_DEPTH + 20));
  }

  private cleanupDanceMinigame() {
    this.stopDanceSong();
    this.stopDanceTimersAndTweens();
    this.danceContainer?.destroy(true);
    this.danceContainer = undefined;
    this.danceStatusText = undefined;
    this.danceMissCounterText = undefined;
    this.danceFeedbackText = undefined;
    this.danceRetryButton = undefined;
    this.danceSkipButton = undefined;
    this.danceNoteObjects.clear();
    this.danceNotes = [];
    this.danceHitNoteIds.clear();
    this.danceMissedNoteIds.clear();
    this.danceMissCount = 0;
    this.danceState = undefined;
    this.danceTargetItem = undefined;
    this.pendingDanceItem = undefined;
    this.danceSong = undefined;
    this.danceStartedAtMs = 0;
    this.danceSongStartTimer = undefined;
  }

  private stopDanceTimersAndTweens() {
    this.danceSongStartTimer?.remove(false);
    this.danceEndTimer?.remove(false);
    if (this.danceFeedbackText) {
      this.tweens.killTweensOf(this.danceFeedbackText);
    }
    this.danceSongStartTimer = undefined;
    this.danceEndTimer = undefined;
  }

  private stopDanceSong() {
    this.danceSong?.stop();
    if (this.danceSong) {
      this.sound.remove(this.danceSong);
    }
    this.danceSong = undefined;
    this.sound.removeByKey(laughterDanceSong.key);
  }

  private startMemoryPhotoMinigame(item: MemoryItem) {
    this.cleanupMemoryPhotoMinigame();
    this.memoryPhotoTargetItem = item;
    this.memoryPhotoActive = true;
    window.dispatchEvent(new CustomEvent('memory-photo-minigame:start'));
  }

  private createMemoryPhotoOverlay() {
    this.memoryPhotoContainer?.destroy(true);
    this.memoryPhotoCards.clear();

    const panel = this.add.rectangle(ui(480), ui(270), ui(880), ui(500), 0x17112a, 0.95).setStrokeStyle(ui(4), 0xffd873);
    const title = this.add.text(ui(480), ui(44), 'Memory Timeline', {
      align: 'center',
      color: '#ffe68a',
      fontFamily: 'monospace',
      fontSize: uiFont(22),
      stroke: '#17112a',
      strokeThickness: ui(4),
    }).setOrigin(0.5);
    const hint = this.add.text(ui(480), ui(74), 'Drag the photos into chronological order, oldest to newest.', {
      align: 'center',
      color: '#ffd6e9',
      fontFamily: 'monospace',
      fontSize: uiFont(13),
      stroke: '#17112a',
      strokeThickness: ui(3),
    }).setOrigin(0.5);
    this.memoryPhotoStatusText = this.add.text(ui(480), ui(468), '', {
      align: 'center',
      color: '#fff8fb',
      fontFamily: 'monospace',
      fontSize: uiFont(14),
      stroke: '#17112a',
      strokeThickness: ui(4),
    }).setOrigin(0.5);

    this.memoryPhotoSubmitButton = this.createMemoryPhotoButton(390, 506, 'Submit', 0xffd873, () => this.submitMemoryPhotoOrder());
    this.memoryPhotoRetryButton = this.createMemoryPhotoButton(570, 506, 'Retry', 0xff9ecb, () => {
      if (this.memoryPhotoTargetItem) {
        this.startMemoryPhotoMinigame(this.memoryPhotoTargetItem);
      }
    }).setVisible(false);

    this.memoryPhotoContainer = this.useUiCamera(this.add
      .container(0, 0, [
        panel,
        title,
        hint,
        this.memoryPhotoStatusText,
        this.memoryPhotoSubmitButton,
        this.memoryPhotoRetryButton,
      ])
      .setScrollFactor(0)
      .setDepth(DIALOGUE_DEPTH + 20));

    this.memoryPhotoOrder.forEach((photoId, slotIndex) => {
      const photo = this.memoryPhotoSelected.find((selectedPhoto) => selectedPhoto.id === photoId);
      if (photo) {
        this.createMemoryPhotoCard(photo, slotIndex);
      }
    });
  }

  private createMemoryPhotoCard(photo: MemoryPhotoAsset, slotIndex: number) {
    if (!this.memoryPhotoContainer) {
      return;
    }

    const slot = MEMORY_PHOTO_SLOT_POSITIONS[slotIndex];
    const back = this.add.rectangle(0, 0, ui(126), ui(126), 0xfff8e8, 1).setStrokeStyle(ui(3), 0xffd873);
    const image = this.add.image(0, ui(-12), photo.id).setDisplaySize(ui(108), ui(92));
    const dateText = this.add.text(0, ui(52), photo.displayDate, {
      align: 'center',
      color: '#2b1748',
      fontFamily: 'monospace',
      fontSize: uiFont(12),
      fontStyle: 'bold',
    }).setOrigin(0.5).setVisible(false);
    const card = this.add.container(ui(slot.x), ui(slot.y), [back, image, dateText])
      .setSize(ui(126), ui(126))
      .setInteractive(new Phaser.Geom.Rectangle(ui(-63), ui(-63), ui(126), ui(126)), Phaser.Geom.Rectangle.Contains);
    card.setData('photoId', photo.id);
    this.input.setDraggable(card);
    card.on('dragstart', () => {
      this.memoryPhotoContainer?.bringToTop(card);
      card.setAlpha(0.82);
    });
    card.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      card.setPosition(dragX, dragY);
    });
    card.on('dragend', () => {
      card.setAlpha(1);
      this.dropMemoryPhotoCard(photo.id, card.x, card.y);
    });

    this.memoryPhotoContainer.add(card);
    this.memoryPhotoCards.set(photo.id, { container: card, dateText });
  }

  private createMemoryPhotoButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const back = this.add.rectangle(ui(x), ui(y), ui(140), ui(44), color, 1).setStrokeStyle(ui(3), 0xd6884f).setInteractive({ useHandCursor: true });
    const text = this.add.text(ui(x), ui(y), label, {
      align: 'center',
      color: '#2b1748',
      fontFamily: 'monospace',
      fontSize: uiFont(15),
      fontStyle: 'bold',
    }).setOrigin(0.5);
    back.on('pointerdown', onClick);
    return this.add.container(0, 0, [back, text]);
  }

  private dropMemoryPhotoCard(photoId: string, x: number, y: number) {
    const fromIndex = this.memoryPhotoOrder.indexOf(photoId);
    const toIndex = this.getMemoryPhotoSlotIndex(x, y);
    if (fromIndex !== -1 && toIndex !== undefined && fromIndex !== toIndex) {
      this.memoryPhotoOrder = swapPhotoSlots(this.memoryPhotoOrder, fromIndex, toIndex);
    }
    this.snapMemoryPhotoCardsToSlots();
  }

  private getMemoryPhotoSlotIndex(x: number, y: number) {
    const closest = MEMORY_PHOTO_SLOT_POSITIONS
      .map((slot, index) => ({ index, distance: Phaser.Math.Distance.Between(x, y, ui(slot.x), ui(slot.y)) }))
      .sort((a, b) => a.distance - b.distance)[0];
    return closest && closest.distance <= ui(105) ? closest.index : undefined;
  }

  private snapMemoryPhotoCardsToSlots() {
    this.memoryPhotoOrder.forEach((photoId, slotIndex) => {
      const card = this.memoryPhotoCards.get(photoId)?.container;
      const slot = MEMORY_PHOTO_SLOT_POSITIONS[slotIndex];
      card?.setPosition(ui(slot.x), ui(slot.y));
    });
  }

  private submitMemoryPhotoOrder() {
    const orderedPhotos = this.getOrderedMemoryPhotos();
    this.memoryPhotoCards.forEach((card) => card.dateText.setVisible(true));
    this.memoryPhotoSubmitButton?.setVisible(false);

    if (arePhotosChronological(orderedPhotos)) {
      this.memoryPhotoStatusText?.setText('Correct! The Star of Moments returns.');
      this.memoryPhotoCompleteTimer = this.time.delayedCall(800, () => {
        const item = this.memoryPhotoTargetItem;
        this.cleanupMemoryPhotoMinigame();
        if (item) {
          this.collectItem(item);
        }
      });
      return;
    }

    this.memoryPhotoStatusText?.setText('Not quite. Check the dates, then try a fresh set.');
    this.memoryPhotoRetryButton?.setVisible(true);
  }

  private getOrderedMemoryPhotos() {
    return this.memoryPhotoOrder
      .map((photoId) => this.memoryPhotoSelected.find((photo) => photo.id === photoId))
      .filter((photo): photo is MemoryPhotoAsset => Boolean(photo));
  }

  private cleanupMemoryPhotoMinigame(clearTarget = true) {
    this.memoryPhotoCompleteTimer?.remove(false);
    this.memoryPhotoContainer?.destroy(true);
    this.memoryPhotoContainer = undefined;
    this.memoryPhotoSelected = [];
    this.memoryPhotoOrder = [];
    this.memoryPhotoCards.clear();
    this.memoryPhotoStatusText = undefined;
    this.memoryPhotoSubmitButton = undefined;
    this.memoryPhotoRetryButton = undefined;
    this.memoryPhotoCompleteTimer = undefined;
    this.memoryPhotoActive = false;
    if (clearTarget) {
      this.memoryPhotoTargetItem = undefined;
    }
  }

  private handleFoodStarInteraction(item: MemoryItem) {
    if (!this.foodQuestStarted) {
      this.foodQuestStarted = true;
      this.revealFoodQuestItems();
      this.openMessageDialogue(item.name, item.dialogueLines);
      return;
    }

    const missingCount = countMissingFoodItems(this.returnedFoodIds);
    if (missingCount > 0) {
      this.openMessageDialogue(item.name, [`${missingCount} food ${missingCount === 1 ? 'item is' : 'items are'} still missing from the food table.`]);
      return;
    }

    this.pendingFoodStarCollectItem = item;
    this.openMessageDialogue(item.name, ['The food table is full again. The Star of Food has been restored.']);
  }

  private revealFoodQuestItems() {
    for (const item of foodQuestItems) {
      this.foodWorldObjects.get(item.id)?.setVisible(!this.returnedFoodIds.has(item.id));
    }
  }

  private findNearbyFoodQuestItem() {
    if (!this.player || !this.foodQuestStarted) {
      return undefined;
    }

    return foodQuestItems.find((item) => {
      if (this.returnedFoodIds.has(item.id)) {
        return false;
      }
      const dx = item.worldPosition.x - this.player!.x;
      const dy = item.worldPosition.y - this.player!.y;
      return dx * dx + dy * dy <= INTERACTION_RADIUS * INTERACTION_RADIUS;
    });
  }

  private collectFoodQuestItem(item: FoodQuestItem) {
    this.returnedFoodIds.add(item.id);
    this.foodWorldObjects.get(item.id)?.setVisible(false);
    this.foodTableObjects.get(item.tableAssetKey)?.setVisible(true);
    this.showCollectedMessage(`${item.name} has been returned to the table!`, item.floorAssetKey);
    if (countMissingFoodItems(this.returnedFoodIds) === 0) {
      this.time.delayedCall(2100, () => {
        this.openMessageDialogue('Star of Food', ['All food items have been collected! Return to the table to collect the star.']);
      });
    }
  }

  private openIntroDialogue() {
    this.openMessageDialogue('A Mysterious Place', INTRO_LINES);
  }

  private openMessageDialogue(title: string, lines: string[], onComplete?: () => void) {
    this.activeDialogue = { kind: 'message', title, lines, lineIndex: 0 };
    this.pendingDialogueAction = onComplete;
    this.collectedMessageTimer?.remove(false);
    this.collectedMessageText?.setVisible(false);
    this.collectedMessageImage?.setVisible(false);
    this.updateDialogueUi();
    this.dialogueBox?.setVisible(true);
  }

  private createPlayer() {
    const playerTexture = 'player-forward-standing';

    this.player = this.physics.add.sprite(spawnPosition.x, spawnPosition.y, playerTexture);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(1400);
    this.player.setDisplaySize(PLAYER_DISPLAY_WIDTH, PLAYER_DISPLAY_HEIGHT);
    this.player.body?.setSize(PLAYER_HITBOX_WIDTH, PLAYER_HITBOX_HEIGHT).setOffset(PLAYER_HITBOX_OFFSET_X, PLAYER_HITBOX_OFFSET_Y);
    this.player.setDepth(this.player.y);

    if (this.propBodies) {
      this.physics.add.collider(this.player, this.propBodies);
    }

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(CAMERA_ZOOM);
  }

  private updatePlayerAnimation(velocity: Phaser.Math.Vector2) {
    if (!this.player) {
      return;
    }

    const frame = getPlayerAnimationFrame(velocity, this.lastPlayerDirection, this.lastPlayerFlipX, this.time.now);
    this.player.setTexture(frame.textureKey);
    this.player.setFlipX(frame.flipX);
    this.lastPlayerDirection = frame.direction;
    this.lastPlayerFlipX = frame.flipX;
  }

  private createControls() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.danceKeys = this.input.keyboard?.addKeys('Z,X,PERIOD,FORWARD_SLASH') as Record<
      'Z' | 'X' | 'PERIOD' | 'FORWARD_SLASH',
      Phaser.Input.Keyboard.Key
    >;
    this.wasd = this.input.keyboard?.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;
    this.interactKeys = this.input.keyboard?.addKeys('E,SPACE') as Record<
      'E' | 'SPACE',
      Phaser.Input.Keyboard.Key
    >;
    this.sprintKeys = this.input.keyboard?.addKeys('SHIFT,LEFT_SHIFT,RIGHT_SHIFT') as Record<
      'SHIFT' | 'LEFT_SHIFT' | 'RIGHT_SHIFT',
      Phaser.Input.Keyboard.Key
    >;
    this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  private createUiCamera() {
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'ui');
    this.uiCamera.setScroll(0, 0).setZoom(UI_CAMERA_ZOOM);
    this.uiCamera.ignore(this.children.list);
  }

  private useUiCamera<T extends Phaser.GameObjects.GameObject>(gameObject: T) {
    this.cameras.main.ignore(gameObject);
    return gameObject;
  }

  private useWorldCamera<T extends Phaser.GameObjects.GameObject>(gameObject: T) {
    this.uiCamera?.ignore(gameObject);
    return gameObject;
  }

  private createHud() {
    const hudStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      color: '#fff8fb',
      fontFamily: 'monospace',
      fontSize: uiFont(18),
      stroke: '#17112a',
      strokeThickness: ui(5),
    };

    this.starsText = this.add.text(ui(18), ui(16), `Memory Stars: 0/${REQUIRED_MEMORY_STARS}`, hudStyle).setScrollFactor(0).setDepth(HUD_DEPTH);
    this.toysText = this.add.text(ui(18), ui(42), `Toys: 0/${REQUIRED_TOYS}`, hudStyle).setScrollFactor(0).setDepth(HUD_DEPTH);
    const controlsText = this.add
      .text(ui(18), ui(506), 'Move: WASD/Arrows | Sprint: Shift | Interact: E/Space', {
        ...hudStyle,
        fontSize: uiFont(15),
      })
      .setScrollFactor(0);

    this.hudContainer = this.useUiCamera(this.add
      .container(0, 0, [this.starsText, this.toysText, controlsText])
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH));

    // Future collectible memory data will update these separate Stars and Toys objective groups.
  }

  private playSoundCue(_cue: 'collect' | 'dialogue' | 'ending' | 'ui') {
    // Placeholder for future audio files; no sound assets are required for this polish pass.
  }

  private createDialogueUi() {
    const panel = this.add.rectangle(ui(480), ui(430), ui(880), ui(180), 0x17112a, 0.94).setStrokeStyle(ui(4), 0xffd873);
    this.dialogueNameText = this.add.text(ui(72), ui(354), '', {
      color: '#ffe68a',
      fontFamily: 'monospace',
      fontSize: uiFont(20),
      stroke: '#17112a',
      strokeThickness: ui(4),
    });
    this.dialogueLineText = this.add.text(ui(72), ui(392), '', {
      color: '#fff8fb',
      fontFamily: 'monospace',
      fontSize: uiFont(18),
      stroke: '#17112a',
      strokeThickness: ui(4),
      wordWrap: { width: ui(810) },
    });
    const hintText = this.add.text(ui(72), ui(492), 'Press E or Space to continue', {
      color: '#ffd6e9',
      fontFamily: 'monospace',
      fontSize: uiFont(14),
      stroke: '#17112a',
      strokeThickness: ui(3),
    });

    this.dialogueBox = this.useUiCamera(this.add
      .container(0, 0, [panel, this.dialogueNameText, this.dialogueLineText, hintText])
      .setScrollFactor(0)
      .setDepth(DIALOGUE_DEPTH)
      .setVisible(false));

    this.collectedMessageText = this.useUiCamera(this.add
      .text(ui(480), ui(FOOD_FOUND_MESSAGE_Y), '', {
        align: 'center',
        color: '#fff8fb',
        fontFamily: 'monospace',
        fontSize: uiFont(18),
        stroke: '#17112a',
        strokeThickness: ui(5),
        wordWrap: { width: ui(720) },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DIALOGUE_DEPTH + 1)
      .setVisible(false));
    this.collectedMessageImage = this.useUiCamera(this.add
      .image(ui(FOOD_FOUND_MESSAGE_TEXT_X - FOOD_FOUND_THUMBNAIL_TEXT_GAP - FOOD_FOUND_THUMBNAIL_SIZE / 2), ui(FOOD_FOUND_MESSAGE_Y), foodQuestItems[0].floorAssetKey)
      .setScrollFactor(0)
      .setDepth(DIALOGUE_DEPTH + 1)
      .setVisible(false));
  }

  private openDialogue(item: MemoryItem) {
    this.activeDialogue = { kind: 'memory', item, lineIndex: 0 };
    this.collectedMessageTimer?.remove(false);
    this.collectedMessageText?.setVisible(false);
    this.collectedMessageImage?.setVisible(false);
    this.playSoundCue('dialogue');
    this.updateDialogueUi();
    this.dialogueBox?.setVisible(true);
  }

  private openFinalGiftDialogue() {
    const unlocked = this.isFinalGiftUnlocked();
    const counts = getCollectedCounts(memoryItems, this.collectedItemIds);

    if (unlocked) {
      this.playSoundCue('ending');
      this.openMessageDialogue('Final Gift', ['All core memories restored! The gift box opens.', 'Inside you find a note.'], () => {
        this.openFlipbook('final');
      });
      return;
    }

    this.activeDialogue = {
      kind: 'message',
      title: 'Final Gift',
      lines: [
        'Not all core memories have been restored!',
        `Memory Stars: ${counts.stars}/${REQUIRED_MEMORY_STARS}`,
        `Toys: ${counts.toys}/${REQUIRED_TOYS}`,
      ],
      lineIndex: 0,
    };
    this.collectedMessageTimer?.remove(false);
    this.collectedMessageText?.setVisible(false);
    this.collectedMessageImage?.setVisible(false);
    this.updateDialogueUi();
    this.dialogueBox?.setVisible(true);
  }

  private startFinalEnding() {
    if (this.endingActive) {
      return;
    }

    this.endingActive = true;
    this.activeDialogue = undefined;
    this.dialogueBox?.setVisible(false);
    this.finalGiftPromptText?.setVisible(false);
    this.collectedMessageTimer?.remove(false);
    this.collectedMessageText?.setVisible(false);
    this.collectedMessageImage?.setVisible(false);
    this.player?.setVelocity(0, 0);

    const fade = this.useUiCamera(this.add.rectangle(ui(480), ui(270), ui(960), ui(540), 0x000000, 0).setScrollFactor(0).setDepth(ENDING_DEPTH));
    const endText = this.add
      .text(ui(480), ui(270), 'The End', {
        align: 'center',
        color: '#fff8fb',
        fontFamily: 'monospace',
        fontSize: uiFont(42),
        stroke: '#000000',
        strokeThickness: ui(6),
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScrollFactor(0);
    const restartText = this.add
      .text(ui(480), ui(470), 'Press R to play again', {
        align: 'center',
        color: '#ffd6e9',
        fontFamily: 'monospace',
        fontSize: uiFont(16),
        stroke: '#17112a',
        strokeThickness: ui(4),
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScrollFactor(0);

    this.endingContainer = this.useUiCamera(this.add
      .container(0, 0, [
        endText,
        restartText,
      ])
      .setScrollFactor(0)
      .setDepth(ENDING_DEPTH + 1));

    this.tweens.add({ targets: fade, alpha: 1, duration: 800 });
    this.tweens.add({ targets: endText, alpha: 1, duration: 700, delay: 650 });
    this.tweens.add({ targets: restartText, alpha: 1, duration: 500, delay: 1200 });
  }

  private advanceDialogue() {
    if (!this.activeDialogue) {
      return;
    }

    const lines = this.getActiveDialogueLines();
    const nextLineIndex = this.activeDialogue.lineIndex + 1;

    if (nextLineIndex < lines.length) {
      this.activeDialogue = { ...this.activeDialogue, lineIndex: nextLineIndex };
      this.updateDialogueUi();
      return;
    }

    if (this.activeDialogue.kind === 'message') {
      const pendingDanceItem = this.pendingDanceItem;
      const pendingMemoryPhotoItem = this.pendingMemoryPhotoItem;
      const pendingFoodStarCollectItem = this.pendingFoodStarCollectItem;
      const pendingDialogueAction = this.pendingDialogueAction;
      this.pendingDanceItem = undefined;
      this.pendingMemoryPhotoItem = undefined;
      this.pendingFoodStarCollectItem = undefined;
      this.pendingDialogueAction = undefined;
      this.activeDialogue = undefined;
      this.dialogueBox?.setVisible(false);
      if (pendingDanceItem) {
        this.startDanceMinigame(pendingDanceItem);
      }
      if (pendingMemoryPhotoItem) {
        this.startMemoryPhotoMinigame(pendingMemoryPhotoItem);
      }
      if (pendingFoodStarCollectItem) {
        this.collectItem(pendingFoodStarCollectItem);
      }
      pendingDialogueAction?.();
      return;
    }

    this.collectActiveItem();
  }

  private updateDialogueUi() {
    if (!this.activeDialogue || !this.dialogueNameText || !this.dialogueLineText) {
      return;
    }

    const lines = this.getActiveDialogueLines();
    const title = this.activeDialogue.kind === 'memory' ? this.activeDialogue.item.name : this.activeDialogue.title;

    this.dialogueNameText.setText(title);
    this.dialogueLineText.setText(lines[this.activeDialogue.lineIndex] ?? '');
  }

  private getActiveDialogueLines() {
    if (!this.activeDialogue) {
      return [];
    }

    return this.activeDialogue.kind === 'memory' ? this.activeDialogue.item.dialogueLines : this.activeDialogue.lines;
  }

  private collectActiveItem() {
    if (!this.activeDialogue || this.activeDialogue.kind !== 'memory') {
      return;
    }

    const { item } = this.activeDialogue;
    this.activeDialogue = undefined;
    this.dialogueBox?.setVisible(false);

    this.collectItem(item);
  }

  private collectItem(item: MemoryItem) {
    this.collectedItemIds.add(item.id);

    const itemObject = this.itemObjects.get(item.id);
    itemObject?.setAlpha(0.28);
    if ((item.category === 'toy' || item.category === 'easter-egg') && itemObject?.setDisplaySize) {
      const displaySize = getCollectedItemDisplaySize(getToyDisplaySize(item.id));
      itemObject.setDisplaySize(displaySize, displaySize);
    } else if (item.category === 'star' && itemObject?.setDisplaySize) {
      const displaySize = getCollectedItemDisplaySize(STAR_DISPLAY_SIZE);
      itemObject.setDisplaySize(displaySize, displaySize);
    } else {
      itemObject?.setScale(COLLECTED_ITEM_DISPLAY_SCALE);
    }
    this.itemEffects.get(item.id)?.forEach((effect) => effect.setVisible(false));

    this.updateHudCounters();
    this.updateFinalGiftVisual();
    this.createCollectionSparkle(item.x, item.y, item.color);
    this.playSoundCue('collect');
    this.showPostCollectionUi(item);
  }

  private showPostCollectionUi(item: MemoryItem) {
    switch (item.id) {
      case 'star-laughter':
        this.openMessageDialogue(item.name, [item.collectedMessage], () => this.openFlipbook('laughter'));
        return;
      case 'star-memories':
        this.openMessageDialogue(item.name, [item.collectedMessage], () => {
          this.openFlipbook('moments');
        });
        return;
      case 'star-food':
        this.openMessageDialogue(item.name, [item.collectedMessage], () => this.openFlipbook('food'));
        return;
      case 'star-adventure':
        this.openFlipbook('adventure');
        return;
      case 'easter-cow':
        this.showCollectedMessageSequence(item.collectedMessageLines ?? [item.collectedMessage], getToyTextureKey(item.id), getCollectedItemDisplaySize(getToyDisplaySize(item.id)));
        return;
      default:
        if (item.category === 'toy') {
          this.showCollectedMessage(item.collectedMessage, getToyTextureKey(item.id), getCollectedItemDisplaySize(getToyDisplaySize(item.id)));
          this.maybeShowCoreMemoryRestoredAfterPopup();
          return;
        }
        this.showCollectedMessage(item.collectedMessage);
        this.maybeShowCoreMemoryRestoredAfterPopup();
    }
  }

  private openFlipbook(flipbookId: FlipbookId, pages?: FlipbookPage[], title?: string) {
    if (this.isFinalGiftUnlocked() && flipbookId !== 'final') {
      this.pendingCoreMemoryRestoredMessage = true;
    }
    this.flipbookActive = true;
    window.dispatchEvent(new CustomEvent('flipbook:open', { detail: { flipbookId, pages, title } }));
  }

  private maybeShowCoreMemoryRestoredAfterPopup() {
    if (!this.isFinalGiftUnlocked() || this.hasShownCoreMemoryRestoredMessage) {
      return;
    }

    this.time.delayedCall(2200, () => this.showCoreMemoryRestoredMessage());
  }

  private showCoreMemoryRestoredMessage() {
    if (!this.canShowCoreMemoryRestoredMessage()) {
      return;
    }

    this.hasShownCoreMemoryRestoredMessage = true;
    this.openMessageDialogue('Core Memories', [ALL_CORE_MEMORIES_RESTORED_LINE]);
  }

  private canShowCoreMemoryRestoredMessage() {
    return this.isFinalGiftUnlocked()
      && !this.hasShownCoreMemoryRestoredMessage
      && !this.activeDialogue
      && !this.endingActive
      && !this.endingContainer
      && !this.flipbookActive;
  }

  private createCollectionSparkle(x: number, y: number, color: number) {
    const sparkles = Array.from({ length: 10 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 10;
      const sparkle = this.useWorldCamera(this.add.star(x, y, 4, 3, 8, index % 2 === 0 ? color : 0xfff3a3, 1).setDepth(8));
      this.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * 44,
        y: y + Math.sin(angle) * 44,
        alpha: 0,
        scale: 0.4,
        duration: 520,
        onComplete: () => sparkle.destroy(),
      });
      return sparkle;
    });

    this.tweens.add({ targets: sparkles, angle: 90, duration: 520 });
  }

  private updateHudCounters() {
    const counts = getCollectedCounts(memoryItems, this.collectedItemIds);
    this.starsText?.setText(`Memory Stars: ${counts.stars}/${REQUIRED_MEMORY_STARS}`);
    this.toysText?.setText(`Toys: ${counts.toys}/${REQUIRED_TOYS}`);
  }

  private isFinalGiftUnlocked() {
    return isFinalGiftUnlocked(getCollectedCounts(memoryItems, this.collectedItemIds));
  }

  private isPlayerNearFinalGift() {
    if (!this.player) {
      return false;
    }

    const dx = FINAL_GIFT.x - this.player.x;
    const dy = FINAL_GIFT.y - this.player.y;

    return dx * dx + dy * dy <= FINAL_GIFT.radius * FINAL_GIFT.radius;
  }

  private updateFinalGiftPrompt() {
    if (!this.finalGiftPromptText) {
      return;
    }

    if (!this.isPlayerNearFinalGift()) {
      this.finalGiftPromptText.setVisible(false);
      return;
    }

    this.finalGiftPromptText.setText(this.isFinalGiftUnlocked() ? FINAL_GIFT.unlockedPrompt : FINAL_GIFT.lockedPrompt);
    this.finalGiftPromptText.setVisible(true);
  }

  private updateFinalGiftVisual() {
    const unlocked = this.isFinalGiftUnlocked();

    this.finalGiftGlow?.setVisible(unlocked);
    for (const [starId, image] of this.finalGiftStarImages) {
      image.setVisible(this.collectedItemIds.has(starId));
    }
    for (const [toyId, image] of this.finalGiftToyImages) {
      image.setVisible(this.collectedItemIds.has(toyId));
    }
  }

  private showCollectedMessage(message: string, imageKey?: string, imageDisplaySize?: number) {
    if (!this.collectedMessageText) {
      return;
    }

    this.collectedMessageTimer?.remove(false);
    this.tweens.killTweensOf(this.collectedMessageText);
    if (this.collectedMessageImage) {
      this.tweens.killTweensOf(this.collectedMessageImage);
    }
    this.collectedMessageText
      .setText(message)
      .setX(ui(imageKey ? FOOD_FOUND_MESSAGE_TEXT_X : 480))
      .setOrigin(imageKey ? 0 : 0.5, 0.5)
      .setAlpha(1)
      .setVisible(true);
    if (imageKey && this.collectedMessageImage) {
      const metrics = this.getTextureAlphaMetrics(imageKey);
      this.collectedMessageImage
        .setTexture(imageKey)
        .setPosition(ui(FOOD_FOUND_MESSAGE_TEXT_X - FOOD_FOUND_THUMBNAIL_TEXT_GAP - FOOD_FOUND_THUMBNAIL_SIZE / 2), ui(FOOD_FOUND_MESSAGE_Y))
        .setAlpha(1)
        .setVisible(true);
      if (imageDisplaySize !== undefined) {
        this.collectedMessageImage.setDisplaySize(ui(imageDisplaySize), ui(imageDisplaySize));
      } else if (metrics) {
        this.collectedMessageImage.setScale(getFoodCropScale(metrics.bounds, ui(FOOD_FOUND_THUMBNAIL_SIZE)));
      } else {
        this.collectedMessageImage.setDisplaySize(ui(FOOD_FOUND_THUMBNAIL_SIZE), ui(FOOD_FOUND_THUMBNAIL_SIZE));
      }
    } else {
      this.collectedMessageImage?.setVisible(false);
    }

    this.collectedMessageTimer = this.time.delayedCall(1700, () => {
      this.tweens.add({
        targets: imageKey && this.collectedMessageImage ? [this.collectedMessageText, this.collectedMessageImage] : this.collectedMessageText,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.collectedMessageText?.setVisible(false);
          this.collectedMessageImage?.setVisible(false);
        },
      });
    });
  }

  private showCollectedMessageSequence(lines: string[], imageKey?: string, imageDisplaySize?: number, index = 0) {
    if (index >= lines.length) {
      this.maybeShowCoreMemoryRestoredAfterPopup();
      return;
    }

    this.showCollectedMessage(lines[index], index === 0 ? imageKey : undefined, imageDisplaySize);
    this.collectedMessageTimer = this.time.delayedCall(2100, () => {
      this.showCollectedMessageSequence(lines, imageKey, imageDisplaySize, index + 1);
    });
  }
}
