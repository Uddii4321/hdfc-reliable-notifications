
exports.send = async (event, failProbability) => {
  const p = Math.random();
  const succeeded = p > failProbability;
  return { channel: 'Email', success: succeeded, provider_id: 'email-' + Date.now(), meta: { rand: p, failProbability } };
};
