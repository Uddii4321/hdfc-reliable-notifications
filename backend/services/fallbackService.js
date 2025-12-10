
const sms = require('./smsService');
const email = require('./emailService');
const inapp = require('./inAppService');   
const fs = require('fs');
const path = require('path');
const routing = require('./routingEngine');

const inboxPath = path.join(__dirname, '..', '..', 'logs', 'inbox.json');


function scoreToFailProb(score) {
  const s = Number(score) || 0;
  const map = [0.05, 0.15, 0.30, 0.55, 0.75, 0.9];
  return map[Math.max(0, Math.min(5, Math.round(s)))];
}

async function tryChannel(fn, event, prob) {
  try {
    return await fn.send(event, prob);
  } catch (err) {
    return { channel: fn.name || "unknown", success: false, error: err.message };
  }
}

async function processEvent(event) {

  console.log("\n================ NEW EVENT =================");
  console.log("Event:", event.Event_Type);
  console.log("Intended:", event.Intended_Channel);
  console.log("Retry Score:", event.Delivery_Retry_Score);


  const intended = event.Intended_Channel || "";
  const routingResult = routing.getOrderedChannels(event.Event_Type, intended);

  const ordered = routingResult.orderedChannels;
  const scores = routingResult.scores;
  const reason = routingResult.explanation;

  console.log("\n--- Routing Decision ---");
  console.log("Ordered Channels:", ordered);
  console.log("Scores:", scores);
  console.log("Reason:", reason);

  const failProb = scoreToFailProb(event.Delivery_Retry_Score);
  console.log("\nFailure Probability:", failProb);

  let attempts = [];
  let delivered = false;
  let final = null;

  console.log("\n--- BEGIN ATTEMPTS ---");

  for (const ch of ordered) {
    console.log(`\nTrying: ${ch.toUpperCase()}`);

    // SMS
    if (ch === "sms") {
      const r = await tryChannel(sms, event, failProb);
      attempts.push(r);
      console.log("→ Result:", r);
      if (r.success) { delivered = true; final = r; break; }
    }

    // EMAIL
    else if (ch === "email") {
      const r = await tryChannel(email, event, failProb);
      attempts.push(r);
      console.log("→ Result:", r);
      if (r.success) { delivered = true; final = r; break; }
    }

    
    else if (ch === "inapp") {
      const r = await tryChannel(inapp, event, failProb);
      r.channel = "inapp";  
      attempts.push(r);
      console.log("→ Result:", r);
      if (r.success) { delivered = true; final = r; break; }
    }

    
    else if (ch === "whatsapp") {
      const r = await tryChannel(email, event, failProb);
      r.channel = "whatsapp";
      attempts.push(r);
      console.log("→ Result:", r);
      if (r.success) { delivered = true; final = r; break; }
    }

    
    else if (ch === "inbox") {
      console.log("→ Delivering to SECURE INBOX");

      const id = "inbox-" + Date.now();
      const inboxItem = {
        id,
        eventType: event.Event_Type,
        message: `${event.Event_Type} delivered to Secure Inbox (fallback)`,
        timestamp: new Date().toISOString(),
        meta: { reason: "fallback-to-inbox", originalChannel: event.Intended_Channel }
      };

      
      try {
        const arr = JSON.parse(fs.readFileSync(inboxPath, "utf8") || "[]");
        arr.unshift(inboxItem);
        fs.writeFileSync(inboxPath, JSON.stringify(arr, null, 2));
      } catch {
        fs.writeFileSync(inboxPath, JSON.stringify([inboxItem], null, 2));
      }

      delivered = true;
      final = { channel: "inbox", success: true, provider_id: id };
      attempts.push(final);
      break;
    }
  }

  console.log("\n--- FINAL STATUS ---");
  console.log("Delivered:", delivered);
  console.log("Final Channel:", final);
  console.log("Attempts:", attempts);
  console.log("=============================================\n");

  return {
    eventSample: event,
    orderedChannels: ordered,
    channelScores: scores,
    reason,
    attempts,
    delivered,
    final,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { processEvent };
