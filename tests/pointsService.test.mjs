import test from "node:test";
import assert from "node:assert/strict";

global.window = global;
await import("../pointsService.js");

test("pointsService.getReward keeps existing reward table", () => {
  assert.equal(window.pointsService.getReward(1), 1);
  assert.equal(window.pointsService.getReward(2), 2);
  assert.equal(window.pointsService.getReward(3), 3);
  assert.equal(window.pointsService.getReward(4), 4);
  assert.equal(window.pointsService.getReward(5), 5);
  assert.equal(window.pointsService.getReward(9), 5);
  assert.equal(window.pointsService.getReward(10), 10);
});

test("buildCheckinUpdate blocks duplicate same-day checkin", () => {
  const today = window.pointsService.getTodayKey();
  const result = window.pointsService.buildCheckinUpdate({
    points: 50,
    streak: 4,
    lastCheckin: today
  });

  assert.equal(result.canCheckin, false);
  assert.equal(result.nextPoints, 50);
  assert.equal(result.reward, 0);
});

test("buildCheckinUpdate increments streak for consecutive day", () => {
  const yesterday = window.pointsService.getYesterdayKey();
  const result = window.pointsService.buildCheckinUpdate({
    points: 10,
    streak: 3,
    lastCheckin: yesterday
  });

  assert.equal(result.canCheckin, true);
  assert.equal(result.nextStreak, 4);
  assert.equal(result.reward, 4);
  assert.equal(result.nextPoints, 14);
});

test("buildCheckinUpdate resets streak when gap day", () => {
  const result = window.pointsService.buildCheckinUpdate({
    points: 10,
    streak: 8,
    lastCheckin: "2000-01-01"
  });

  assert.equal(result.canCheckin, true);
  assert.equal(result.nextStreak, 1);
  assert.equal(result.reward, 1);
  assert.equal(result.nextPoints, 11);
});
