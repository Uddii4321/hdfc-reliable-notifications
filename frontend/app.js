console.log("APP.JS LOADED");


function showTab(id) {
  document.querySelectorAll(".tab-section").forEach(tab => {
    tab.style.display = "none";
  });
  document.getElementById(id).style.display = "block";
}


function sendFromDropdown() {
  const type = document.getElementById("eventType").value;
  sendEvent(type);
  showTab("timelineTab"); 
}


async function sendEvent(eventType) {
  console.log("Sending event:", eventType);

  try {
    const res = await fetch("http://localhost:5000/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType })
    });

    if (!res.ok) {
      console.error("Backend error:", res.status, res.statusText);
      return;
    }

    const data = await res.json();
    console.log("Backend response:", data);

    
    document.getElementById("metaChannel").textContent =
      data.eventSample.Intended_Channel || "-";

    document.getElementById("metaScore").textContent =
      data.eventSample.Delivery_Retry_Score || "-";

    
    const scoreSpan = document.getElementById("metaProb");
    const scores = data.channelScores || {};
    let scoreText = "";

    Object.keys(scores).forEach(ch => {
      const reliability = scores[ch];       
      const failProb = Math.round((1 - reliability) * 100);  
      scoreText += `${ch}: ${failProb}% fail   `;
    });

    scoreSpan.textContent = scoreText || "-";

    
    const rawBox = document.getElementById("rawResponse");
    rawBox.textContent =
      JSON.stringify(data, null, 2) +
      "\n\n=== ROUTING EXPLANATION ===\n" +
      data.reason +
      "\n\n=== ORDERED CHANNELS ===\n" +
      data.orderedChannels.join("  →  ");

    
    const timelineList = document.getElementById("timelineList");
    timelineList.innerHTML = "";

    data.attempts.forEach((attempt, i) => {
      const li = document.createElement("li");
      li.className = "list-group-item";

      li.innerHTML = `
        <strong>Attempt ${i + 1}</strong><br>
        Channel: ${attempt.channel}<br>
        Status: ${attempt.success ? "🟢 SUCCESS" : "🔴 FAIL"}
      `;

      timelineList.appendChild(li);
    });

    
    refreshInbox();

  } catch (err) {
    console.error("Fetch failed:", err);
  }
}


async function refreshInbox() {
  try {
    const res = await fetch("http://localhost:5000/api/helpers/inbox");
    if (!res.ok) return;

    const inboxItems = await res.json();
    const inboxList = document.getElementById("inbox");
    inboxList.innerHTML = "";

    inboxItems.forEach(item => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <strong>${item.eventType}</strong>
        <br><small>${item.timestamp}</small>
        <div>${item.message}</div>
      `;
      inboxList.appendChild(li);
    });

  } catch (err) {
    console.error("Inbox error:", err);
  }
}

refreshInbox();
