
exports.send = async (event, failProbability) => {
  const p = Math.random();
  const succeeded = p > failProbability;
  return {
  channel: "In-App Notification",
  success,
  provider_id: "inapp-" + Date.now(),
  meta: { rand }
};

};
