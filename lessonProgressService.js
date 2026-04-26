(function (global) {
  function buildLessonStorageKeys({ lessonId, uid, wallet, sessionService }) {
    const progressKey = sessionService.buildScopedKey("progress", lessonId, uid);
    const bestKey = sessionService.buildScopedKey("best", lessonId, uid);

    const oldProgressKey = sessionService.buildScopedKey("progress", lessonId, wallet);
    const oldBestKey = sessionService.buildScopedKey("best", lessonId, wallet);

    return {
      progressKey,
      bestKey,
      oldProgressKey,
      oldBestKey
    };
  }

  function migrateLegacyLessonKeys({ oldProgressKey, progressKey, oldBestKey, bestKey }) {
    if (localStorage.getItem(oldProgressKey) && !localStorage.getItem(progressKey)) {
      localStorage.setItem(progressKey, localStorage.getItem(oldProgressKey));
    }

    if (localStorage.getItem(oldBestKey) && !localStorage.getItem(bestKey)) {
      localStorage.setItem(bestKey, localStorage.getItem(oldBestKey));
    }
  }

  function getRank(score) {
    if (score >= 420) return "gold";
    if (score >= 360) return "silver";
    return "bronze";
  }

  global.lessonProgressService = {
    buildLessonStorageKeys,
    migrateLegacyLessonKeys,
    getRank
  };
})(window);
