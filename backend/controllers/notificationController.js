const fallbackService = require('../services/fallbackService');
const data = require('../data/sampleEvents.json');

exports.sendNotification = async (req, res) => {
  try {
    const { eventType } = req.body || {};
    let event = null;
    if (eventType) {
      event = data.find(r => {
        const v = (r.Event_Type || r.EventType || '').toString().toLowerCase();
        return v === eventType.toString().toLowerCase();
      });
    }
    if (!event) event = data[0];

    const result = await fallbackService.processEvent(event);
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
};
