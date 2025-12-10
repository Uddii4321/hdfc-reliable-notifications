exports.scoreToFailProb = (score) => {
  const s = Number(score) || 0;
  const map = [0.05, 0.15, 0.30, 0.55, 0.75, 0.9];
  const idx = Math.max(0, Math.min(5, Math.round(s)));
  return map[idx];
};
