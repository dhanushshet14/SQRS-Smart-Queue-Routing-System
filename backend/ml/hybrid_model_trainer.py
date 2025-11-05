"""
Hybrid Model Trainer for AI Smart Queue Routing System
Trains models on hybrid datasets (synthetic + real-world data)
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, precision_recall_curve
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
import xgboost as xgb
import joblib
import os
from typing import Tuple, Dict, Any
import matplotlib.pyplot as plt
import seaborn as sns


class HybridModelTrainer:
    """Enhanced trainer for hybrid datasets with comprehensive evaluation"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'customer_sentiment', 'customer_tier', 'issue_complexity', 'channel_type',
            'agent_experience', 'agent_specialty_match', 'agent_past_success',
            'agent_avg_handling_time', 'agent_current_workload', 'time_of_day',
            'day_of_week', 'queue_length'
        ]
        self.model_path = "backend/ml/hybrid_rs_model.pkl"
        self.scaler_path = "backend/ml/hybrid_scaler.pkl"
    
    def load_training_data(self, data_path: str = "backend/data/hybrid_training_data.csv") -> pd.DataFrame:
        """Load hybrid training data"""
        if not os.path.exists(data_path):
            print(f"⚠️ Hybrid data not found at {data_path}")
            print("🔄 Falling back to synthetic data...")
            data_path = "backend/data/training_data.csv"
        
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"No training data found at {data_path}")
        
        df = pd.read_csv(data_path)
        print(f"📊 Loaded {len(df)} training records")
        print(f"✅ Success rate: {df['success_label'].mean():.3f}")
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features with enhanced preprocessing"""
        # Select features
        X = df[self.feature_names].values
        y = df['success_label'].values
        
        # Handle any missing values
        X = np.nan_to_num(X, nan=0.0)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        print(f"🔧 Feature matrix shape: {X_scaled.shape}")
        print(f"📈 Target distribution: {np.bincount(y)}")
        print(f"⚖️ Class balance: {y.mean():.3f} positive, {1-y.mean():.3f} negative")
        
        return X_scaled, y
    
    def train_ensemble_model(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train advanced ensemble model"""
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print("🚀 Training advanced ensemble model...")
        
        # Define base models with optimized parameters
        rf_model = RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            bootstrap=True,
            random_state=42,
            n_jobs=-1
        )
        
        xgb_model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=0.1,
            random_state=42,
            eval_metric='auc'
        )
        
        gb_model = GradientBoostingClassifier(
            n_estimators=150,
            max_depth=7,
            learning_rate=0.08,
            subsample=0.9,
            random_state=42
        )
        
        lr_model = LogisticRegression(
            C=1.0,
            random_state=42,
            max_iter=1000
        )
        
        # Create ensemble
        self.model = VotingClassifier(
            estimators=[
                ('rf', rf_model),
                ('xgb', xgb_model),
                ('gb', gb_model),
                ('lr', lr_model)
            ],
            voting='soft'
        )
        
        # Train ensemble
        self.model.fit(X_train, y_train)
        
        # Comprehensive evaluation
        results = self._comprehensive_evaluation(X_train, X_test, y_train, y_test)
        
        return results
    
    def _comprehensive_evaluation(self, X_train, X_test, y_train, y_test) -> Dict[str, Any]:
        """Comprehensive model evaluation"""
        
        # Basic metrics
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        # Probability predictions
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        y_pred = self.model.predict(X_test)
        
        # AUC Score
        auc_score = roc_auc_score(y_test, y_pred_proba)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=5, scoring='roc_auc')
        
        # Precision-Recall metrics
        precision, recall, _ = precision_recall_curve(y_test, y_pred_proba)
        pr_auc = np.trapz(recall, precision)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # Feature importance (from Random Forest component)
        try:
            rf_estimator = self.model.named_estimators_['rf']
            feature_importance = dict(zip(self.feature_names, rf_estimator.feature_importances_))
        except:
            feature_importance = {}
        
        results = {
            'train_accuracy': train_score,
            'test_accuracy': test_score,
            'auc_score': auc_score,
            'pr_auc': pr_auc,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'confusion_matrix': cm.tolist(),
            'feature_importance': feature_importance,
            'classification_report': classification_report(y_test, y_pred, output_dict=True)
        }
        
        # Print results
        print(f"\n🎯 Hybrid Model Results:")
        print(f"   Train Accuracy: {train_score:.3f}")
        print(f"   Test Accuracy: {test_score:.3f}")
        print(f"   AUC Score: {auc_score:.3f}")
        print(f"   PR-AUC Score: {pr_auc:.3f}")
        print(f"   CV Score: {cv_scores.mean():.3f} (±{cv_scores.std() * 2:.3f})")
        
        # Detailed classification metrics
        report = results['classification_report']
        print(f"\n📊 Classification Metrics:")
        print(f"   Precision: {report['1']['precision']:.3f}")
        print(f"   Recall: {report['1']['recall']:.3f}")
        print(f"   F1-Score: {report['1']['f1-score']:.3f}")
        
        return results
    
    def save_model(self):
        """Save trained model and scaler"""
        if self.model is None:
            raise ValueError("No model to save. Train model first.")
        
        os.makedirs("backend/ml", exist_ok=True)
        
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        
        print(f"💾 Hybrid model saved to {self.model_path}")
        print(f"💾 Scaler saved to {self.scaler_path}")
    
    def validate_model_performance(self, min_auc: float = 0.75) -> bool:
        """Validate model performance"""
        if self.model is None:
            return False
        
        df = self.load_training_data()
        X, y = self.prepare_features(df)
        
        _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        auc_score = roc_auc_score(y_test, y_pred_proba)
        
        meets_requirement = auc_score >= min_auc
        print(f"\n🎯 Model Validation:")
        print(f"   AUC Score: {auc_score:.3f}")
        print(f"   Required: {min_auc:.3f}")
        print(f"   Status: {'✅ PASSED' if meets_requirement else '❌ FAILED'}")
        
        return meets_requirement
    
    def print_feature_importance(self):
        """Print detailed feature importance"""
        if self.model is None:
            print("❌ No model trained yet.")
            return
        
        try:
            rf_estimator = self.model.named_estimators_['rf']
            importance = rf_estimator.feature_importances_
            
            feature_importance = list(zip(self.feature_names, importance))
            feature_importance.sort(key=lambda x: x[1], reverse=True)
            
            print(f"\n🔍 Feature Importance Analysis:")
            print("=" * 50)
            for i, (feature, imp) in enumerate(feature_importance, 1):
                bar = "█" * int(imp * 50)
                print(f"{i:2d}. {feature:<25} {imp:.3f} {bar}")
                
        except Exception as e:
            print(f"⚠️ Could not extract feature importance: {e}")


def train_and_save_hybrid_model():
    """Main function to train hybrid model"""
    trainer = HybridModelTrainer()
    
    try:
        # Load data
        df = trainer.load_training_data()
        
        # Prepare features
        X, y = trainer.prepare_features(df)
        
        # Train model
        results = trainer.train_ensemble_model(X, y)
        
        # Validate performance
        if trainer.validate_model_performance(min_auc=0.75):
            trainer.save_model()
            trainer.print_feature_importance()
            print(f"\n🎉 Hybrid model training completed successfully!")
            
            # Print summary
            print(f"\n📋 Training Summary:")
            print(f"   Dataset: Hybrid (Synthetic + Real-world)")
            print(f"   Records: {len(df):,}")
            print(f"   Features: {len(trainer.feature_names)}")
            print(f"   Model: Advanced Ensemble (RF + XGB + GB + LR)")
            print(f"   AUC Score: {results['auc_score']:.3f}")
            print(f"   Test Accuracy: {results['test_accuracy']:.3f}")
            
            return True
        else:
            print(f"\n❌ Model does not meet performance requirements")
            return False
            
    except Exception as e:
        print(f"❌ Error during training: {str(e)}")
        return False


if __name__ == "__main__":
    train_and_save_hybrid_model()