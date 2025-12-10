
exports.send = async (event, failProbability) => {
  const p = Math.random();
  const succeeded = p > failProbability;
  return { channel: 'SMS', success: succeeded, provider_id: 'sms-' + Date.now(), meta: { rand: p, failProbability } };
};
