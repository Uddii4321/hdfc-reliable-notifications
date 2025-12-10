import pandas as pd
import json
import os

# -------- INPUT FILES --------
sample_file = "Trusted_Notifications_Sample_Events_Updated (1).xlsx"
stats_file = "Event_Type_Stats (1).xlsx"


# -------- OUTPUT FOLDER --------
output_folder = "backend/data"
os.makedirs(output_folder, exist_ok=True)

# -------- CONVERT SAMPLE EVENTS --------
df_events = pd.read_excel(sample_file)
df_events = df_events.fillna("")
sample_events = df_events.to_dict(orient="records")

with open(os.path.join(output_folder, "sampleEvents.json"), "w", encoding="utf-8") as f:
    json.dump(sample_events, f, indent=2)

print("sampleEvents.json created successfully!")

# -------- CONVERT EVENT TYPE STATS --------
df_stats = pd.read_excel(stats_file)
df_stats = df_stats.fillna("")
stats_records = df_stats.to_dict(orient="records")

# convert to dictionary keyed by Event_Type
stats_mapping = {row["Event_Type"]: row for row in stats_records}

with open(os.path.join(output_folder, "eventTypeStats.json"), "w", encoding="utf-8") as f:
    json.dump(stats_mapping, f, indent=2)

print("eventTypeStats.json created successfully!")
