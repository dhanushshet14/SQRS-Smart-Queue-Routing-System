"""
Final optimized ML Model Training for AI Smart Queue Routing System
Uses the most effective approach for routing score prediction
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
from typing import Tuple, Dict, Any


class FinalRoutingModelTrainer:
    """Final optimized trainer focusing on the most effective features"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        # Focus on the most predictive features
        self.feature_names = [
            'customer_sentiment', 'customer_tier', 'issue_complexity', 'channel_type',
            'agent_experience', 'agent_specialty_match', 'agent_past_success',
            'agent_current_workload'
        ]
        self.model_path = "backend/ml/final_rs_model.pkl"
        self.scaler_path = "backend/ml/final_scaler.pkl"
    
    def load_training_data(self, data_path: str = "backend/data/training_data.csv") -> pd.DataFrame:
        """Load training data from CSV file"""
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Training data not found at {data_path}")
        
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} training records")
        print(f"Success rate: {df['success_label'].mean():.3f}")
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features focusing on the most important ones"""
        # Select only the most predictive features
        X = df[self.feature_names].values
        y = df['success_label'].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        print(f"Feature matrix shape: {X_scaled.shape}")
        print(f"Target distribution: {np.bincount(y)}")
        
        return X_scaled, y
    
    def train_model(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train Random Forest model - often more robust than XGBoost"""
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print("Training optimized Random Forest model...")
        
        # Use Random Forest which often performs better on this type of problem
        self.model = RandomForestClassifier(
            n_estimators=500,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            bootstrap=True,
            random_state=42,
            n_jobs=-1
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
        
        # Feature importance
        feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
        
        results = {
            'train_accuracy': train_score,
            'test_accuracy': test_score,
            'auc_score': auc_score,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_importance': feature_importance
        }
        
        print(f"Final Model Results:")
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
        
        print(f"Final model saved to {self.model_path}")
        print(f"Scaler saved to {self.scaler_path}")
    
    def validate_model_performance(self, min_auc: float = 0.7) -> bool:
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
        print(f"Final Model AUC: {auc_score:.3f} (Required: {min_auc:.3f})")
        print(f"Performance requirement: {'✓ PASSED' if meets_requirement else '✗ FAILED'}")
        
        return meets_requirement
    
    def print_feature_importance(self):
        """Print feature importance analysis"""
        if self.model is None:
            print("No model trained yet.")
            return
        
        importance = self.model.feature_importances_
        feature_importance = list(zip(self.feature_names, importance))
        feature_importance.sort(key=lambda x: x[1], reverse=True)
        
        print("\nFeature Importance:")
        print("-" * 40)
        for feature, importance in feature_importance:
            print(f"{feature:<25} {importance:.3f}")


def train_and_save_final_model():
    """Main function to train and save the final routing model"""
    trainer = FinalRoutingModelTrainer()
    
    try:
        # Load data
        df = trainer.load_training_data()
        
        # Prepare features
        X, y = trainer.prepare_features(df)
        
        # Train model
        results = trainer.train_model(X, y)
        
        # Validate performance
        if trainer.validate_model_performance():
            # Save model
            trainer.save_model()
            trainer.print_feature_importance()
            print("\n✅ Final model training completed successfully!")
            return True
        else:
            print("\n❌ Final model does not meet performance requirements")
            return False
            
    except Exception as e:
        print(f"❌ Error during final training: {str(e)}")
        return False


if __name__ == "__main__":
    train_and_save_final_model()