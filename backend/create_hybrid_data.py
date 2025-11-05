import pandas as pd
import numpy as np
import random
import os

print('Creating enhanced hybrid dataset...')

np.random.seed(42)
random.seed(42)

records = []
for i in range(15000):
    customer_sentiment = random.choices([0, 1, 2], weights=[0.25, 0.45, 0.30])[0]
    customer_tier = random.choices([0, 1, 2], weights=[0.35, 0.45, 0.20])[0]
    issue_complexity = np.random.beta(2.5, 4)
    channel_type = random.choices([0, 1], weights=[0.65, 0.35])[0]
    
    agent_experience = np.random.gamma(3, 1.2)
    agent_specialty_match = np.random.beta(4, 2)
    agent_past_success = np.random.beta(10, 2.5)
    agent_avg_handling_time = np.random.gamma(2.5, 2.5)
    agent_current_workload = np.random.beta(2.5, 3.5)
    
    time_of_day = random.randint(8, 18)
    day_of_week = random.randint(0, 6)
    queue_length = random.randint(0, 12)
    
    # Enhanced success probability calculation (more balanced)
    base_prob = 0.55
    sentiment_impact = {0: -0.30, 1: 0.0, 2: 0.15}[customer_sentiment]
    tier_impact = {0: -0.12, 1: 0.0, 2: 0.15}[customer_tier]
    complexity_impact = -0.45 * issue_complexity
    experience_impact = min(0.25, agent_experience * 0.06)
    specialty_impact = 0.50 * agent_specialty_match
    past_success_impact = 0.35 * (agent_past_success - 0.5)
    workload_impact = -0.25 * agent_current_workload
    time_impact = 0.03 if 9 <= time_of_day <= 17 else -0.03
    
    total_prob = (base_prob + sentiment_impact + tier_impact + complexity_impact + 
                 experience_impact + specialty_impact + past_success_impact + 
                 workload_impact + time_impact)
    total_prob += random.uniform(-0.02, 0.02)
    total_prob = max(0.1, min(0.95, total_prob))
    success_label = 1 if random.random() < total_prob else 0
    
    records.append({
        'customer_sentiment': customer_sentiment,
        'customer_tier': customer_tier,
        'issue_complexity': issue_complexity,
        'channel_type': channel_type,
        'agent_experience': agent_experience,
        'agent_specialty_match': agent_specialty_match,
        'agent_past_success': agent_past_success,
        'agent_avg_handling_time': agent_avg_handling_time,
        'agent_current_workload': agent_current_workload,
        'time_of_day': time_of_day,
        'day_of_week': day_of_week,
        'queue_length': queue_length,
        'success_label': success_label
    })

df = pd.DataFrame(records)
os.makedirs('backend/data', exist_ok=True)
df.to_csv('backend/data/hybrid_training_data.csv', index=False)

print(f'Created hybrid dataset with {len(records)} records')
print(f'Success rate: {df["success_label"].mean():.3f}')
print('Saved to backend/data/hybrid_training_data.csv')