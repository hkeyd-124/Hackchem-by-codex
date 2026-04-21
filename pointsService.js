(function (global) {
  function getVNDate() {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
  }

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getTodayKey() {
    return formatDate(getVNDate());
  }

  function getYesterdayKey() {
    const vn = getVNDate();
    vn.setDate(vn.getDate() - 1);
    return formatDate(vn);
  }

  function getReward(streak) {
    if (streak === 1) return 1;
    if (streak === 2) return 2;
    if (streak === 3) return 3;
    if (streak === 4) return 4;
    if (streak <= 9) return 5;
    return 10;
  }

  function buildCheckinUpdate({ points = 0, streak = 0, lastCheckin = "" }) {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    if (lastCheckin === today) {
      return {
        canCheckin: false,
        today,
        yesterday,
        nextPoints: points,
        nextStreak: streak || 1,
        reward: 0
      };
    }

    const nextStreak = lastCheckin === yesterday ? (streak || 0) + 1 : 1;
    const reward = getReward(nextStreak);

    return {
      canCheckin: true,
      today,
      yesterday,
      nextPoints: points + reward,
      nextStreak,
      reward
    };
  }

  global.pointsService = {
    getVNDate,
    formatDate,
    getTodayKey,
    getYesterdayKey,
    getReward,
    buildCheckinUpdate
  };
})(window);
