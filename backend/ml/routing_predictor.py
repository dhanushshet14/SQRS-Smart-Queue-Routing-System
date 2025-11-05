"""
Routing Score Predictor for AI Smart Queue Routing System
Core ML component that calculates success probability between customer-agent pairs
"""

import numpy as np
import joblib
import os
from typing import Dict, List, Tuple
from models.data_models import Customer, Agent


class RoutingScorePredictor:
    """Core ML component that calculates success probability between customer-agent pairs"""
    
    def __init__(self, model_path: str = "backend/ml/transformer_enhanced_model.pkl"):
        self.model_path = model_path
        self.scaler_path = "backend/ml/transformer_enhanced_scaler.pkl"
        self.model = None
        self.scaler = None
        # Enhanced feature names for transformer model
        self.base_features = [
            'customer_sentiment', 'customer_tier', 'issue_complexity', 'channel_type',
            'agent_experience', 'agent_specialty_match', 'agent_past_success',
            'agent_avg_handling_time', 'agent_current_workload', 'time_of_day',
            'day_of_week', 'queue_length'
        ]
        
        self.engineered_features = [
            'text_embedding_similarity', 'intent_confidence', 'sentiment_confidence',
            'urgency_score', 'complexity_text_score', 'agent_customer_match_score',
            'workload_efficiency_ratio', 'experience_complexity_ratio',
            'tier_sentiment_interaction', 'peak_hour_indicator'
        ]
        
        self.feature_names = self.base_features + self.engineered_features
        self._load_model()
    
    def _load_model(self):
        """Load trained model and scaler"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                print("✅ ML model and scaler loaded successfully")
            else:
                print("⚠️ ML model files not found. Using fallback rule-based scoring.")
                self.model = None
                self.scaler = None
        except Exception as e:
            print(f"❌ Error loading ML model: {str(e)}")
            self.model = None
            self.scaler = None
    
    def _encode_customer_features(self, customer: Customer) -> List[float]:
        """Encode customer features for ML model"""
        # Encode sentiment: negative=0, neutral=1, positive=2
        sentiment_map = {'negative': 0, 'neutral': 1, 'positive': 2}
        customer_sentiment = sentiment_map.get(customer.sentiment, 1)
        
        # Encode tier: basic=0, standard=1, premium=2
        tier_map = {'basic': 0, 'standard': 1, 'premium': 2}
        customer_tier = tier_map.get(customer.tier, 1)
        
        # Encode channel: chat=0, voice=1
        channel_map = {'chat': 0, 'voice': 1}
        channel_type = channel_map.get(customer.channel, 0)
        
        return [customer_sentiment, customer_tier, customer.issue_complexity, channel_type]
    
    def _create_enhanced_features(self, customer: Customer, agent: Agent) -> np.ndarray:
        """Create all features for transformer-enhanced model"""
        import datetime
        
        # Base features
        customer_features = self._encode_customer_features(customer)
        
        # Agent features
        specialty_match = self._calculate_specialty_match(agent, customer)
        workload_ratio = agent.current_workload / max(agent.max_concurrent, 1)
        
        # Current time features
        now = datetime.datetime.now()
        time_of_day = now.hour
        day_of_week = now.weekday()
        queue_length = 5  # Default queue length
        
        # Base feature vector
        base_features = customer_features + [
            agent.experience,
            specialty_match,
            agent.past_success_rate,
            agent.avg_handling_time,
            workload_ratio,
            time_of_day,
            day_of_week,
            queue_length
        ]
        
        # Engineered features (simplified for production)
        text_embedding_similarity = 0.7  # Default similarity
        intent_confidence = 0.8
        sentiment_confidence = 0.9 if customer.sentiment != 'neutral' else 0.6
        urgency_score = 0.3 if customer.priority > 7 else 0.1
        complexity_text_score = customer.issue_complexity * intent_confidence
        agent_customer_match_score = specialty_match * sentiment_confidence * (1 - urgency_score)
        workload_efficiency_ratio = agent.past_success_rate / (workload_ratio + 0.1)
        experience_complexity_ratio = agent.experience / (customer.issue_complexity + 0.1)
        tier_sentiment_interaction = customer_features[1] * customer_features[0]  # tier * sentiment
        peak_hour_indicator = 1 if 9 <= time_of_day <= 17 else 0
        
        engineered_features = [
            text_embedding_similarity, intent_confidence, sentiment_confidence,
            urgency_score, complexity_text_score, agent_customer_match_score,
            workload_efficiency_ratio, experience_complexity_ratio,
            tier_sentiment_interaction, peak_hour_indicator
        ]
        
        # Combine all features
        all_features = base_features + engineered_features
        
        return np.array(all_features)
    
    def _calculate_specialty_match(self, agent: Agent, customer: Customer) -> float:
        """Calculate how well agent specialty matches customer issue type"""
        if not agent.specialty:
            return 0.3  # Default for agents with no specialty
        
        # Direct match
        if customer.issue_type in agent.specialty:
            return 0.9
        
        # Related specialties
        related_matches = {
            'technical_support': ['product_inquiry'],
            'billing': ['account_management'],
            'sales': ['product_inquiry'],
            'account_management': ['billing'],
            'product_inquiry': ['technical_support', 'sales'],
            'complaint_resolution': ['account_management']
        }
        
        related = related_matches.get(customer.issue_type, [])
        if any(spec in agent.specialty for spec in related):
            return 0.6
        
        return 0.2  # Poor match
    
    def predict_routing_score(self, customer: Customer, agent: Agent) -> float:
        """Predicts success probability (0-1) for customer-agent pair"""
        try:
            if self.model is None or self.scaler is None:
                return self._fallback_rule_based_score(customer, agent)
            
            # Create all features for transformer model
            features = self._create_enhanced_features(customer, agent)
            
            # Scale features
            features_scaled = self.scaler.transform(features.reshape(1, -1))
            
            # Predict probability
            probability = self.model.predict_proba(features_scaled)[0][1]
            
            # Ensure score is between 0 and 1
            return max(0.0, min(1.0, probability))
            
        except Exception as e:
            print(f"❌ Error in ML prediction: {str(e)}")
            return self._fallback_rule_based_score(customer, agent)
    
    def _fallback_rule_based_score(self, customer: Customer, agent: Agent) -> float:
        """Fallback rule-based scoring when ML model is unavailable"""
        score = 0.5  # Base score
        
        # Customer factors
        sentiment_bonus = {'negative': -0.2, 'neutral': 0.0, 'positive': 0.1}
        score += sentiment_bonus.get(customer.sentiment, 0.0)
        
        tier_bonus = {'basic': -0.05, 'standard': 0.0, 'premium': 0.1}
        score += tier_bonus.get(customer.tier, 0.0)
        
        # Issue complexity penalty (normalize 1-5 to 0-1 scale)
        normalized_complexity = (customer.issue_complexity - 1) / 4
        score -= normalized_complexity * 0.3
        
        # Agent factors
        specialty_match = self._calculate_specialty_match(agent, customer)
        score += specialty_match * 0.4
        
        # Experience bonus (diminishing returns)
        experience_bonus = min(0.2, agent.experience * 0.05)
        score += experience_bonus
        
        # Past success bonus
        score += (agent.past_success_rate - 0.5) * 0.3
        
        # Workload penalty
        workload_ratio = agent.current_workload / max(agent.max_concurrent, 1)
        score -= workload_ratio * 0.2
        
        return max(0.1, min(0.9, score))
    
    def predict_batch(self, customer_agent_pairs: List[Tuple[Customer, Agent]]) -> List[float]:
        """Batch prediction for multiple customer-agent pairs"""
        scores = []
        for customer, agent in customer_agent_pairs:
            score = self.predict_routing_score(customer, agent)
            scores.append(score)
        return scores
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        return {
            'model_loaded': self.model is not None,
            'model_type': type(self.model).__name__ if self.model else 'Rule-based fallback',
            'feature_count': len(self.feature_names),
            'features': self.feature_names
        }