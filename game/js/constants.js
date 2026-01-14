// Game Constants
const PLAYER_SIZE = 30;
const PLAYER_SPEED = 200;
const BULLET_SIZE = 8;
const BULLET_SPEED = 500;
const BULLET_MAX_DISTANCE = 600;
const FIRE_RATE = 1000;
const ENEMY_SIZE = 25;
const ENEMY_HITBOX = 35;
const ENEMY_SPEED = 120;
const SPAWN_INTERVAL = 1500;
const FRAGMENT_COUNT_MIN = 3;
const FRAGMENT_COUNT_MAX = 4;
const FRAGMENT_SIZE = 8;
const FRAGMENT_SPEED_MIN = 450;
const FRAGMENT_SPEED_MAX = 550;
const FRAGMENT_LIFETIME = 500;
const FRAGMENT_CONE = Math.PI / 3;
const FRAGMENT_MOVE_TIME = 200;
const FRAGMENT_FADE_TIME = 300;
const CONFETTI_COUNT = 50;
const CONFETTI_COLORS = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00', '#00f'];
const CONFETTI_LIFETIME = 2000;
const CONFETTI_SPEED = 300;
const SHAKE_INTENSITY = 3;
const SHAKE_DURATION = 100;
const HITSTOP_DURATION = 20;
const RECOIL_DISTANCE = 4;
const BODY_SLAM_KNOCKBACK = 50;
const RECOIL_RECOVERY = 0.15;
const MUZZLE_FLASH_SIZE = 12;
const MUZZLE_FLASH_DURATION = 50;
const TRAIL_LENGTH = 5;
const ENEMY_DEATH_DURATION = 100;
const ENEMY_DEATH_SCALE = 1.25;
const GRASS_COLOR = '#5a7a5a';
const GRASS_CHARS = ['\\', '|', '/'];
const GRASS_WAVE_SPEED = 0.003;
const GRASS_CELL_SIZE = 100;
const CARD_DROP_CHANCE = 0.1;
const CARD_DESPAWN_TIME = 10000;
const CARD_WIDTH = 30;
const CARD_HEIGHT = 40;
const CARD_EFFECTS = [
    { id: 'red', name: 'Red Hair', desc: 'Add red tint to hair' },
    { id: 'green', name: 'Green Hair', desc: 'Add green tint to hair' },
    { id: 'blue', name: 'Blue Hair', desc: 'Add blue tint to hair' },
    { id: 'extraBullet', name: 'Extra Bullet', desc: '+1 bullet per shot' },
    { id: 'homing', name: 'Homing Bullets', desc: 'Bullets seek enemies' },
    { id: 'piercing', name: 'Piercing Bullets', desc: 'Go through enemies' },
    { id: 'damage', name: 'Bullet Damage', desc: '+1 damage per bullet' },
    { id: 'bulletSpeed', name: 'Bullet Speed', desc: '+25% bullet speed' },
    { id: 'fireRate', name: 'Fire Rate', desc: '+25% fire rate' }
];
const CARD_UI_WIDTH = 150;
const CARD_UI_HEIGHT = 200;
const HOMING_STRENGTH = 4;
const CARD_PICKUP_ANIM_DURATION = 300;
const CARD_UI_WIDTH_NEW = 250;
const CARD_UI_HEIGHT_NEW = 350;
const MINI_CARD_SIZE = 40;
const MINI_CARD_MARGIN = 5;
const CARD_VIEW_PLAYER_X = 0.6;
const CARD_VIEW_CARD_X = 0.4;
const ENEMY_BASE_HEALTH = 1;
const ENEMY_BULLET_SIZE = 10;
const ENEMY_BULLET_SPEED = 300;
const ENEMY_FIRE_RATE_BASE = 2500;
const PLAYER_INVINCIBILITY_TIME = 1000;
const DIFFICULTY_RAMP_TIME = 180000;
const CARD_VIEW_TIMEOUT = 5000;

// Sprite animation constants
const SPRITE_COLS = 4;
const SPRITE_ROWS = 2;
const ANIMATION_FRAME_TIME = 150;

// Card slot constants
const CARD_SLOT_COUNT = 10;
const CARD_SLOT_WIDTH = 50;
const CARD_SLOT_HEIGHT = 70;
const CARD_SLOT_MARGIN = 10;
const CARD_SLOT_BOTTOM_MARGIN = 20;
const CARD_FADE_DURATION = 300;
const DRAGGED_CARD_WIDTH = 60;
const DRAGGED_CARD_HEIGHT = 80;

// Home screen constants
const HOME_SCROLL_SPEED = 30;
const HOME_ENEMY_COUNT = 8;
const HOME_ENEMY_WANDER_SPEED = 50;

// Game over animation constants
const GAMEOVER_ANIM_DURATION = 800;
const GAMEOVER_ZOOM = 2.0;
const GAMEOVER_ROTATION = -0.15;
const GAMEOVER_OFFSET_X = -0.25;

// Audio constants
const MUSIC_BPM = 100;
const MUSIC_STEP_MS = (60 / MUSIC_BPM / 4) * 1000;
const MUSIC_A = [
    { bass: 55,  chord: [110, 131, 165] },
    { bass: 73,  chord: [147, 175, 220] },
    { bass: 82,  chord: [165, 196, 247] },
    { bass: 55,  chord: [110, 131, 165] },
];
const MUSIC_B = [
    { bass: 87,  chord: [175, 220, 262] },
    { bass: 98,  chord: [196, 247, 294] },
    { bass: 65,  chord: [131, 165, 196] },
    { bass: 82,  chord: [165, 208, 247] },
];
const MUSIC_SEQUENCE = [...MUSIC_A, ...MUSIC_A, ...MUSIC_B, ...MUSIC_A];

// Tutorial constants
const TUTORIAL_DURATION = 5000;
const TUTORIAL_FADE_TIME = 1000;
