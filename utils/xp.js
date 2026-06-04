function requiredXpForLevel(level) {
  if (level < 2) return 100;
  return 100 + (level - 2) * 50;
}

function calculateLevelFromTotalXp(totalXp) {
  let level = 1;
  while (totalXp >= requiredXpForLevel(level + 1)) {
    totalXp -= requiredXpForLevel(level + 1);
    level++;
  }
  return level;
}

module.exports = { requiredXpForLevel, calculateLevelFromTotalXp };
