"""
Training data generator for the AI Smart Queue Routing System
Creates realistic customer-agent interaction history with success labels
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.data_models import TrainingRecord


class TrainingDataGenerator:
    """Generates realistic training data for the routing score model"""
    
    def __init__(self, seed: int = 42):
        random.seed(seed)
        np.random.seed(seed)
        
        # Define realistic data distributions
        self.issue_types = [
            "technical_support", "billing", "account_management", 
            "product_inquiry", "sales", "complaint_resolution"
        ]
        
        self.agent_specialties = {
            "technical_support": ["technical_support", "product_inquiry"],
            "billing": ["billing", "account_management"],
            "sales": ["sales", "product_inquiry"],
            "customer_service": ["complaint_resolution", "account_management"],
            "general": ["technical_support", "billing", "sales"]
        }
    
    def generate_training_data(self, num_records: int = 15000) -> List[TrainingRecord]:
        """Generate training records with realistic patterns"""
        records = []
        
        for _ in range(num_records):
            record = self._generate_single_record()
            records.append(record)
        
        return records
    
    def _generate_single_record(self) -> TrainingRecord:
        """Generate a single training record with realistic correlations"""
        
        # Customer features
        customer_sentiment = random.choices([0, 1, 2], weights=[0.2, 0.5, 0.3])[0]  # negative, neutral, positive
        customer_tier = random.choices([0, 1, 2], weights=[0.4, 0.4, 0.2])[0]  # basic, standard, premium
        issue_complexity = np.random.beta(2, 5)  # Skewed toward simpler issues
        channel_type = random.choices([0, 1], weights=[0.7, 0.3])[0]  # chat, voice
        
        # Agent features
        agent_experience = np.random.gamma(2, 2)  # Years of experience
        agent_past_success = np.random.beta(8, 2)  # Success rate skewed high
        agent_avg_handling_time = np.random.gamma(3, 3)  # Minutes
        agent_current_workload = np.random.beta(2, 3)  # Normalized 0-1
        
        # Issue type and specialty matching
        issue_type = random.choice(self.issue_types)
        agent_specialty_match = self._calculate_specialty_match(issue_type)
        
        # Context features
        time_of_day = random.randint(8, 18)  # Business hours
        day_of_week = random.randint(0, 6)
        queue_length = random.randint(0, 20)
        
        # Calculate success probability based on realistic factors
        success_prob = self._calculate_success_probability(
            customer_sentiment, customer_tier, issue_complexity,
            agent_experience, agent_specialty_match, agent_past_success,
            agent_current_workload, time_of_day
        )
        
        # Generate binary success label
        success_label = 1 if random.random() < success_prob else 0
        
        return TrainingRecord(
            customer_sentiment=customer_sentiment,
            customer_tier=customer_tier,
            issue_complexity=issue_complexity,
            channel_type=channel_type,
            agent_experience=agent_experience,
            agent_specialty_match=agent_specialty_match,
            agent_past_success=agent_past_success,
            agent_avg_handling_time=agent_avg_handling_time,
            agent_current_workload=agent_current_workload,
            time_of_day=time_of_day,
            day_of_week=day_of_week,
            queue_length=queue_length,
            success_label=success_label
        )
    
    def _calculate_specialty_match(self, issue_type: str) -> float:
        """Calculate how well agent specialty matches issue type"""
        # Simulate agent having random specialties
        agent_specialties = random.sample(self.issue_types, random.randint(1, 3))
        
        if issue_type in agent_specialties:
            return random.uniform(0.8, 1.0)  # High match
        elif any(spec in self.agent_specialties.get(issue_type, []) for spec in agent_specialties):
            return random.uniform(0.4, 0.7)  # Partial match
        else:
            return random.uniform(0.0, 0.3)  # Poor match
    
    def _calculate_success_probability(
        self, 
        customer_sentiment: int,
        customer_tier: int, 
        issue_complexity: float,
        agent_experience: float,
        agent_specialty_match: float,
        agent_past_success: float,
        agent_current_workload: float,
        time_of_day: int
    ) -> float:
        """Calculate realistic success probability based on multiple factors"""
        
        # Base probability
        base_prob = 0.5
        
        # Customer factors (very strong impact for clear patterns)
        sentiment_impact = {0: -0.4, 1: 0.0, 2: 0.2}[customer_sentiment]
        tier_impact = {0: -0.15, 1: 0.0, 2: 0.2}[customer_tier]
        complexity_impact = -0.5 * issue_complexity  # More complex = much lower success
        
        # Agent factors (extremely strong impact for very clear patterns)
        experience_impact = min(0.35, agent_experience * 0.1)  # Strong experience effect
        specialty_impact = 0.6 * agent_specialty_match  # Extremely strong specialty match
        past_success_impact = 0.5 * (agent_past_success - 0.5)  # Very strong past performance
        workload_impact = -0.3 * agent_current_workload  # Heavy workload penalty
        
        # Time factors
        time_impact = 0.05 if 9 <= time_of_day <= 17 else -0.05  # Peak hours
        
        # Combine all factors
        total_prob = (base_prob + sentiment_impact + tier_impact + complexity_impact +
                     experience_impact + specialty_impact + past_success_impact +
                     workload_impact + time_impact)
        
        # Add minimal randomness and clamp to [0, 1]
        total_prob += random.uniform(-0.02, 0.02)  # Very reduced randomness for clearer patterns
        return max(0.1, min(0.9, total_prob))  # Avoid extreme probabilities
    
    def export_to_csv(self, records: List[TrainingRecord], filename: str = "training_data.csv"):
        """Export training records to CSV file"""
        data = []
        for record in records:
            data.append(record.model_dump())
        
        df = pd.DataFrame(data)
        df.to_csv(f"backend/data/{filename}", index=False)
        return df
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names for model training"""
        return [
            'customer_sentiment', 'customer_tier', 'issue_complexity', 'channel_type',
            'agent_experience', 'agent_specialty_match', 'agent_past_success',
            'agent_avg_handling_time', 'agent_current_workload', 'time_of_day',
            'day_of_week', 'queue_length'
        ]


def generate_and_save_training_data():
    """Utility function to generate and save training data"""
    generator = TrainingDataGenerator()
    records = generator.generate_training_data(15000)
    
    # Create data directory if it doesn't exist
    import os
    os.makedirs("backend/data", exist_ok=True)
    
    df = generator.export_to_csv(records)
    print(f"Generated {len(records)} training records")
    print(f"Success rate: {df['success_label'].mean():.3f}")
    print(f"Data saved to backend/data/training_data.csv")
    
    return df


if __name__ == "__main__":
    generate_and_save_training_data()