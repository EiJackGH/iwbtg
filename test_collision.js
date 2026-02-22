const { checkCollision } = require('./game.js');
const assert = require('assert');

console.log('Running tests...');

// Test 1: Rectangles are colliding
const rect1 = { x: 0, y: 0, width: 10, height: 10 };
const rect2 = { x: 5, y: 5, width: 10, height: 10 };
assert.strictEqual(checkCollision(rect1, rect2), true, 'Should detect collision when overlapping');

// Test 2: Rectangles are not colliding
const rect3 = { x: 20, y: 20, width: 10, height: 10 };
assert.strictEqual(checkCollision(rect1, rect3), false, 'Should not detect collision when separate');

// Test 3: Rectangles are touching edges
const rect4 = { x: 10, y: 0, width: 10, height: 10 };
assert.strictEqual(checkCollision(rect1, rect4), false, 'Should not detect collision when only touching edges');

console.log('All tests passed!');
