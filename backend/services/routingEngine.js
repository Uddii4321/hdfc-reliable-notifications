
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'sampleEvents.json');


const ALLOWED = {
  'login otp': ['sms', 'email', 'inapp'],
  'transaction otp': ['sms', 'email', 'inapp'],
  'fraud alert': ['sms', 'email', 'inapp'],
  'beneficiary added alert': ['sms', 'email', 'inapp'],
  'low balance alert': ['sms', 'email', 'inapp'],
  'payment confirmation': ['sms', 'email', 'inapp'],

  'monthly statement': ['email', 'whatsapp', 'sms'],
  'credit card bill reminder': ['email', 'whatsapp', 'sms'],
  'kyc reminder': ['email', 'whatsapp', 'sms'],
  'reward points update': ['email', 'whatsapp']
};


const DEFAULT_RELIABILITY = {
  sms: 0.75,
  email: 0.92,
  inapp: 0.65,       
  whatsapp: 0.6,
  inbox: 1.0
};


function normChannel(ch) {
  if (!ch) return '';
  return ch.toString().trim().toLowerCase();
}


function loadData() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}


function computeReliability() {
  const rows = loadData();
  const perChannel = {};
  const perEventChannel = {};

  rows.forEach(r => {
    const event = (r.Event_Type || '').toLowerCase();
    const channel = normChannel(r.Intended_Channel || '');

    const delivered = String(r.Delivered_YN || '').toLowerCase() === 'y';

    if (!channel) return;

    
    perChannel[channel] = perChannel[channel] || { attempts: 0, success: 0 };
    perChannel[channel].attempts++;
    if (delivered) perChannel[channel].success++;

    
    perEventChannel[event] = perEventChannel[event] || {};
    perEventChannel[event][channel] =
      perEventChannel[event][channel] || { attempts: 0, success: 0 };

    perEventChannel[event][channel].attempts++;
    if (delivered) perEventChannel[event][channel].success++;
  });

  
  const overall = {};
  Object.keys(DEFAULT_RELIABILITY).forEach(ch => {
    if (perChannel[ch] && perChannel[ch].attempts > 0) {
      overall[ch] = perChannel[ch].success / perChannel[ch].attempts;
    } else {
      overall[ch] = DEFAULT_RELIABILITY[ch];
    }
  });

  
  const byEvent = {};
  Object.keys(perEventChannel).forEach(evt => {
    byEvent[evt] = {};

    Object.keys(perEventChannel[evt]).forEach(ch => {
      const rec = perEventChannel[evt][ch];
      byEvent[evt][ch] =
        rec.attempts > 0 ? (rec.success / rec.attempts) : overall[ch];
    });

    
    Object.keys(DEFAULT_RELIABILITY).forEach(ch => {
      if (!byEvent[evt][ch]) byEvent[evt][ch] = overall[ch];
    });
  });

  return { overall, byEvent };
}


function getAllowedForEvent(eventType) {
  const key = (eventType || '').toLowerCase();
  return ALLOWED[key] ? [...ALLOWED[key]] : ['email', 'sms', 'inapp', 'whatsapp', 'inbox'];
}


function getOrderedChannels(eventType, intendedChannel) {
  const { overall, byEvent } = computeReliability();

  const key = (eventType || '').toLowerCase();
  const allowed = getAllowedForEvent(eventType).map(normChannel);

  const source = byEvent[key] || overall;

  
  const arr = allowed.map(ch => ({
    channel: ch,
    score: source[ch] !== undefined ? source[ch] : overall[ch]
  }));

  const intended = normChannel(intendedChannel || '');

  let explanation = `Allowed channels for "${eventType}" → [${allowed.join(', ')}]. `;

  if (intended && !allowed.includes(intended)) {
    explanation += `Intended channel "${intendedChannel}" is NOT allowed — auto-correcting. `;
  } else if (intended) {
    explanation += `Intended channel "${intendedChannel}" is allowed. `;
  } else {
    explanation += `No intended channel provided. `;
  }

  explanation += `Sorting channels by reliability scores.`;

 
  arr.sort((a, b) => b.score - a.score);

  const ordered = arr.map(x => x.channel);

  
  if (!ordered.includes('inbox')) ordered.push('inbox');

  return {
    orderedChannels: ordered,
    scores: arr.reduce((acc, x) => { acc[x.channel] = x.score; return acc; }, {}),
    explanation
  };
}

module.exports = { getOrderedChannels, computeReliability };
