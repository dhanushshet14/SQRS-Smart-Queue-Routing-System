"""
Advanced ML Model Training for AI Smart Queue Routing System
Uses feature engineering and neural networks for better performance
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import joblib
import os
from typing import Tuple, Dict, Any


class AdvancedRoutingModelTrainer:
    """Advanced trainer with feature engineering and better models"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.poly_features = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
        self.feature_names = [
            'customer_sentiment', 'customer_tier', 'issue_complexity', 'channel_type',
            'agent_experience', 'agent_specialty_match', 'agent_past_success',
            'agent_avg_handling_time', 'agent_current_workload', 'time_of_day',
            'day_of_week', 'queue_length'
        ]
        self.model_path = "backend/ml/advanced_rs_model.pkl"
        self.scaler_path = "backend/ml/advanced_scaler.pkl"
        self.poly_path = "backend/ml/poly_features.pkl"
    
    def load_training_data(self, data_path: str = "backend/data/training_data.csv") -> pd.DataFrame:
        """Load training data from CSV file"""
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Training data not found at {data_path}")
        
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} training records")
        print(f"Success rate: {df['success_label'].mean():.3f}")
        
        return df
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create advanced features for better model performance"""
        df_engineered = df.copy()
        
        # Interaction features
        df_engineered['sentiment_tier_interaction'] = df['customer_sentiment'] * df['customer_tier']
        df_engineered['experience_specialty_interaction'] = df['agent_experience'] * df['agent_specialty_match']
        df_engineered['complexity_experience_ratio'] = df['issue_complexity'] / (df['agent_experience'] + 0.1)
        df_engineered['workload_success_ratio'] = df['agent_current_workload'] / (df['agent_past_success'] + 0.1)
        
        # Customer quality score
        df_engineered['customer_quality'] = (
            df['customer_sentiment'] * 0.4 + 
            df['customer_tier'] * 0.6 - 
            df['issue_complexity'] * 0.3
        )
        
        # Agent quality score
        df_engineered['agent_quality'] = (
            df['agent_experience'] * 0.3 +
            df['agent_specialty_match'] * 0.4 +
            df['agent_past_success'] * 0.3 -
            df['agent_current_workload'] * 0.2
        )
        
        # Match quality score
        df_engineered['match_quality'] = df_engineered['customer_quality'] * df_engineered['agent_quality']
        
        # Time-based features
        df_engineered['is_peak_hour'] = ((df['time_of_day'] >= 9) & (df['time_of_day'] <= 17)).astype(int)
        df_engineered['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        
        # Queue pressure
        df_engineered['queue_pressure'] = df['queue_length'] / 20.0  # Normalize
        
        return df_engineered   
 
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features with engineering and scaling"""
        # Engineer features
        df_engineered = self.engineer_features(df)
        
        # Select features (original + engineered)
        feature_cols = self.feature_names + [
            'sentiment_tier_interaction', 'experience_specialty_interaction',
            'complexity_experience_ratio', 'workload_success_ratio',
            'customer_quality', 'agent_quality', 'match_quality',
            'is_peak_hour', 'is_weekend', 'queue_pressure'
        ]
        
        X = df_engineered[feature_cols].values
        y = df_engineered['success_label'].values
        
        # Handle any NaN or inf values
        X = np.nan_to_num(X, nan=0.0, posinf=1.0, neginf=0.0)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        print(f"Engineered features shape: {X_scaled.shape}")
        print(f"Target distribution: {np.bincount(y)}")
        
        return X_scaled, y
    
    def train_model(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train advanced model with feature engineering"""
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print("Training advanced XGBoost model with feature engineering...")
        
        # Use XGBoost with optimal parameters for this problem
        self.model = xgb.XGBClassifier(
            n_estimators=500,
            max_depth=8,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=0.1,
            random_state=42,
            eval_metric='auc'
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        # Predict probabilities for AUC calculation
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        auc_score = roc_auc_score(y_test, y_pred_proba)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=5, scoring='roc_auc')
        
        results = {
            'train_accuracy': train_score,
            'test_accuracy': test_score,
            'auc_score': auc_score,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std()
        }
        
        print(f"Advanced Model Results:")
        print(f"  Train Accuracy: {train_score:.3f}")
        print(f"  Test Accuracy: {test_score:.3f}")
        print(f"  AUC Score: {auc_score:.3f}")
        print(f"  CV Score: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        
        return results
    
    def save_model(self):
        """Save trained model and scaler"""
        if self.model is None:
            raise ValueError("No model to save. Train model first.")
        
        # Create ml directory if it doesn't exist
        os.makedirs("backend/ml", exist_ok=True)
        
        # Save model and scaler
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        
        print(f"Advanced model saved to {self.model_path}")
        print(f"Scaler saved to {self.scaler_path}")
    
    def validate_model_performance(self, min_auc: float = 0.75) -> bool:
        """Validate that model meets performance requirements"""
        if self.model is None:
            return False
        
        # Load test data for validation
        df = self.load_training_data()
        X, y = self.prepare_features(df)
        
        # Split for validation
        _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Calculate AUC
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        auc_score = roc_auc_score(y_test, y_pred_proba)
        
        meets_requirement = auc_score >= min_auc
        print(f"Advanced Model AUC: {auc_score:.3f} (Required: {min_auc:.3f})")
        print(f"Performance requirement: {'✓ PASSED' if meets_requirement else '✗ FAILED'}")
        
        return meets_requirement


def train_and_save_advanced_model():
    """Main function to train and save the advanced routing model"""
    trainer = AdvancedRoutingModelTrainer()
    
    try:
        # Load data
        df = trainer.load_training_data()
        
        # Prepare features with engineering
        X, y = trainer.prepare_features(df)
        
        # Train model
        results = trainer.train_model(X, y)
        
        # Validate performance
        if trainer.validate_model_performance():
            # Save model
            trainer.save_model()
            print("\n✅ Advanced model training completed successfully!")
            return True
        else:
            print("\n❌ Advanced model does not meet performance requirements")
            return False
            
    except Exception as e:
        print(f"❌ Error during advanced training: {str(e)}")
        return False


if __name__ == "__main__":
    train_and_save_advanced_model()