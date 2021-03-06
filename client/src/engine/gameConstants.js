// Engine
const EVENT_LOOP_DELETE_TIME = 10000;
const PICKUP_RESPAWN_RATE = 8000;

// Player Settings
const PLAYER_HEALTH = 100;
const PLAYER_DAMAGE_TINT = rgbToHex(255, 0, 0);
const STARTING_BULLET_SPEED = 500;
const TIME_BETWEEN_ROLLS = 1000;

// Game Log Settings
const CHAT_LOG_CLEAR_TIME = 3000;

module.exports = { PLAYER_HEALTH, EVENT_LOOP_DELETE_TIME, STARTING_BULLET_SPEED, PLAYER_DAMAGE_TINT, TIME_BETWEEN_ROLLS, CHAT_LOG_CLEAR_TIME, PICKUP_RESPAWN_RATE };

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return  '0x' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
