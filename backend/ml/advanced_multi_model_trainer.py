"""
Advanced Multi-Model Trainer for AI Smart Queue Routing System
Tests multiple algorithms to find the best performing model
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, RobustScaler, MinMaxScaler
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve
from sklearn.ensemble import (RandomForestClassifier, GradientBoostingClassifier, 
                            ExtraTreesClassifier, AdaBoostClassifier, VotingClassifier)
from sklearn.linear_model import LogisticRegression, RidgeClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
import xgboost as xgb
# Optional imports - will skip if not available
try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

try:
    from catboost import CatBoostClassifier
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False
import joblib
import os
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')


class AdvancedMultiModelTrainer:
    """Tests multiple ML algorithms to find the best performer"""
    
    def __init__(self, seed: int = 42):
        self.seed = seed
        np.random.seed(seed)
        
        self.best_model = None
        self.best_scaler = None
        self.best_score = 0.0
        self.best_model_name = ""
        
        self.feature_names = [
            'customer_sentiment', 'customer_tier', 'issue_complexity', 'channel_type',
            'agent_experience', 'agent_specialty_match', 'agent_past_success',
            'agent_avg_handling_time', 'agent_current_workload', 'time_of_day',
            'day_of_week', 'queue_length'
        ]
        
        self.results = {}
    
    def load_data(self, data_path: str = "backend/data/real_world_hybrid_data.csv") -> pd.DataFrame:
        """Load training data"""
        if not os.path.exists(data_path):
            print(f"⚠️ Real-world data not found, using hybrid data...")
            data_path = "backend/data/hybrid_training_data.csv"
        
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"No training data found")
        
        df = pd.read_csv(data_path)
        print(f"📊 Loaded {len(df)} training records")
        print(f"✅ Success rate: {df['success_label'].mean():.3f}")
        
        return df
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for training"""
        X = df[self.feature_names].values
        y = df['success_label'].values
        
        # Handle missing values
        X = np.nan_to_num(X, nan=0.0)
        
        print(f"🔧 Feature matrix shape: {X.shape}")
        print(f"📈 Class distribution: {np.bincount(y)}")
        print(f"⚖️ Class balance: {y.mean():.3f} positive")
        
        return X, y
    
    def test_scalers(self, X_train: np.ndarray, X_test: np.ndarray, y_train: np.ndarray, y_test: np.ndarray) -> Dict:
        """Test different scaling methods"""
        print("🔍 Testing different scaling methods...")
        
        scalers = {
            'StandardScaler': StandardScaler(),
            'RobustScaler': RobustScaler(),
            'MinMaxScaler': MinMaxScaler(),
            'NoScaling': None
        }
        
        scaler_results = {}
        
        # Use a simple model to test scalers
        test_model = RandomForestClassifier(n_estimators=100, random_state=self.seed)
        
        for scaler_name, scaler in scalers.items():
            try:
                if scaler is not None:
                    X_train_scaled = scaler.fit_transform(X_train)
                    X_test_scaled = scaler.transform(X_test)
                else:
                    X_train_scaled = X_train
                    X_test_scaled = X_test
                
                test_model.fit(X_train_scaled, y_train)
                y_pred_proba = test_model.predict_proba(X_test_scaled)[:, 1]
                auc_score = roc_auc_score(y_test, y_pred_proba)
                
                scaler_results[scaler_name] = auc_score
                print(f"   {scaler_name}: {auc_score:.3f}")
                
            except Exception as e:
                print(f"   {scaler_name}: Failed ({e})")
                scaler_results[scaler_name] = 0.0
        
        best_scaler_name = max(scaler_results, key=scaler_results.get)
        best_scaler = scalers[best_scaler_name]
        
        print(f"🏆 Best scaler: {best_scaler_name} (AUC: {scaler_results[best_scaler_name]:.3f})")
        
        return best_scaler, best_scaler_name
    
    def get_model_configs(self) -> Dict:
        """Get configurations for different models"""
        models = {
            'RandomForest': {
                'model': RandomForestClassifier(
                    n_estimators=500, max_depth=15, min_samples_split=4,
                    min_samples_leaf=2, max_features='sqrt', random_state=self.seed, n_jobs=-1
                ),
                'tune_params': {
                    'n_estimators': [300, 500, 700],
                    'max_depth': [12, 15, 18],
                    'min_samples_split': [3, 4, 5]
                }
            },
            'XGBoost': {
                'model': xgb.XGBClassifier(
                    n_estimators=400, max_depth=10, learning_rate=0.03,
                    subsample=0.9, colsample_bytree=0.8, reg_alpha=0.1,
                    reg_lambda=0.1, random_state=self.seed, eval_metric='auc'
                ),
                'tune_params': {
                    'n_estimators': [300, 400, 500],
                    'max_depth': [8, 10, 12],
                    'learning_rate': [0.02, 0.03, 0.05]
                }
            },

            'GradientBoosting': {
                'model': GradientBoostingClassifier(
                    n_estimators=300, max_depth=8, learning_rate=0.05,
                    subsample=0.9, random_state=self.seed
                ),
                'tune_params': {
                    'n_estimators': [200, 300, 400],
                    'max_depth': [6, 8, 10],
                    'learning_rate': [0.03, 0.05, 0.08]
                }
            },
            'ExtraTrees': {
                'model': ExtraTreesClassifier(
                    n_estimators=500, max_depth=15, min_samples_split=4,
                    min_samples_leaf=2, random_state=self.seed, n_jobs=-1
                ),
                'tune_params': {
                    'n_estimators': [300, 500, 700],
                    'max_depth': [12, 15, 18]
                }
            },
            'SVM': {
                'model': SVC(
                    C=1.0, kernel='rbf', gamma='scale', probability=True, random_state=self.seed
                ),
                'tune_params': {
                    'C': [0.5, 1.0, 2.0],
                    'kernel': ['rbf', 'poly'],
                    'gamma': ['scale', 'auto']
                }
            },
            'LogisticRegression': {
                'model': LogisticRegression(
                    C=1.0, random_state=self.seed, max_iter=2000
                ),
                'tune_params': {
                    'C': [0.5, 1.0, 2.0, 5.0],
                    'penalty': ['l1', 'l2'],
                    'solver': ['liblinear', 'saga']
                }
            },
            'KNN': {
                'model': KNeighborsClassifier(
                    n_neighbors=7, weights='distance'
                ),
                'tune_params': {
                    'n_neighbors': [5, 7, 9, 11],
                    'weights': ['uniform', 'distance']
                }
            }
        }
        
        # Add optional models if available
        if LIGHTGBM_AVAILABLE:
            models['LightGBM'] = {
                'model': lgb.LGBMClassifier(
                    n_estimators=400, max_depth=10, learning_rate=0.03,
                    subsample=0.9, colsample_bytree=0.8, reg_alpha=0.1,
                    reg_lambda=0.1, random_state=self.seed, verbose=-1
                ),
                'tune_params': {
                    'n_estimators': [300, 400, 500],
                    'max_depth': [8, 10, 12],
                    'learning_rate': [0.02, 0.03, 0.05]
                }
            }
        
        if CATBOOST_AVAILABLE:
            models['CatBoost'] = {
                'model': CatBoostClassifier(
                    iterations=400, depth=8, learning_rate=0.03,
                    random_seed=self.seed, verbose=False
                ),
                'tune_params': {
                    'iterations': [300, 400, 500],
                    'depth': [6, 8, 10],
                    'learning_rate': [0.02, 0.03, 0.05]
                }
            }
        
        return models
    
    def train_and_evaluate_model(self, model_name: str, model_config: Dict, 
                                X_train: np.ndarray, X_test: np.ndarray, 
                                y_train: np.ndarray, y_test: np.ndarray) -> Dict:
        """Train and evaluate a single model"""
        print(f"🚀 Training {model_name}...")
        
        try:
            model = model_config['model']
            
            # Train model
            model.fit(X_train, y_train)
            
            # Evaluate
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            
            y_pred_proba = model.predict_proba(X_test)[:, 1]
            auc_score = roc_auc_score(y_test, y_pred_proba)
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
            
            # Precision-Recall AUC
            precision, recall, _ = precision_recall_curve(y_test, y_pred_proba)
            pr_auc = np.trapz(recall, precision)
            
            results = {
                'model': model,
                'train_accuracy': train_score,
                'test_accuracy': test_score,
                'auc_score': auc_score,
                'pr_auc': pr_auc,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std()
            }
            
            print(f"   ✅ {model_name}: AUC={auc_score:.3f}, Test Acc={test_score:.3f}")
            
            return results
            
        except Exception as e:
            print(f"   ❌ {model_name}: Failed ({str(e)[:50]}...)")
            return {
                'model': None,
                'auc_score': 0.0,
                'test_accuracy': 0.0,
                'error': str(e)
            }
    
    def hyperparameter_tuning(self, model_name: str, model_config: Dict,
                            X_train: np.ndarray, y_train: np.ndarray) -> object:
        """Perform hyperparameter tuning for the best models"""
        print(f"🔧 Hyperparameter tuning for {model_name}...")
        
        try:
            base_model = model_config['model']
            param_grid = model_config['tune_params']
            
            # Use smaller CV for speed
            grid_search = GridSearchCV(
                base_model, param_grid, cv=3, scoring='roc_auc',
                n_jobs=-1, verbose=0
            )
            
            grid_search.fit(X_train, y_train)
            
            print(f"   🏆 Best params: {grid_search.best_params_}")
            print(f"   🎯 Best CV score: {grid_search.best_score_:.3f}")
            
            return grid_search.best_estimator_
            
        except Exception as e:
            print(f"   ⚠️ Tuning failed: {e}")
            return model_config['model']
    
    def create_ensemble(self, top_models: List[Tuple[str, object]]) -> VotingClassifier:
        """Create ensemble from top performing models"""
        print(f"🤝 Creating ensemble from top {len(top_models)} models...")
        
        estimators = [(name, model) for name, model in top_models]
        
        ensemble = VotingClassifier(
            estimators=estimators,
            voting='soft'
        )
        
        return ensemble
    
    def train_all_models(self) -> Dict:
        """Train and compare all models"""
        print("🚀 Starting comprehensive model comparison...")
        
        # Load and prepare data
        df = self.load_data()
        X, y = self.prepare_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.seed, stratify=y
        )
        
        # Find best scaler
        best_scaler, scaler_name = self.test_scalers(X_train, X_test, y_train, y_test)
        
        # Scale data
        if best_scaler is not None:
            X_train_scaled = best_scaler.fit_transform(X_train)
            X_test_scaled = best_scaler.transform(X_test)
        else:
            X_train_scaled = X_train
            X_test_scaled = X_test
        
        # Get model configurations
        model_configs = self.get_model_configs()
        
        # Train all models
        print(f"\n🔄 Training {len(model_configs)} different models...")
        
        for model_name, config in model_configs.items():
            result = self.train_and_evaluate_model(
                model_name, config, X_train_scaled, X_test_scaled, y_train, y_test
            )
            self.results[model_name] = result
        
        # Sort by AUC score
        sorted_results = sorted(
            [(name, result) for name, result in self.results.items() if result['auc_score'] > 0],
            key=lambda x: x[1]['auc_score'],
            reverse=True
        )
        
        print(f"\n📊 Model Performance Ranking:")
        print("=" * 60)
        for i, (name, result) in enumerate(sorted_results, 1):
            print(f"{i:2d}. {name:<20} AUC: {result['auc_score']:.3f} | Acc: {result['test_accuracy']:.3f}")
        
        # Get top 3 models for ensemble
        top_3_models = sorted_results[:3]
        
        if len(top_3_models) >= 2:
            print(f"\n🤝 Creating ensemble from top 3 models...")
            
            # Hyperparameter tune top models
            tuned_models = []
            for name, result in top_3_models:
                if result['auc_score'] > 0.7:  # Only tune promising models
                    tuned_model = self.hyperparameter_tuning(
                        name, model_configs[name], X_train_scaled, y_train
                    )
                    tuned_models.append((name, tuned_model))
                else:
                    tuned_models.append((name, result['model']))
            
            # Create and evaluate ensemble
            ensemble = self.create_ensemble(tuned_models)
            ensemble.fit(X_train_scaled, y_train)
            
            # Evaluate ensemble
            ensemble_train_score = ensemble.score(X_train_scaled, y_train)
            ensemble_test_score = ensemble.score(X_test_scaled, y_test)
            ensemble_pred_proba = ensemble.predict_proba(X_test_scaled)[:, 1]
            ensemble_auc = roc_auc_score(y_test, ensemble_pred_proba)
            
            print(f"\n🎯 Ensemble Results:")
            print(f"   Train Accuracy: {ensemble_train_score:.3f}")
            print(f"   Test Accuracy: {ensemble_test_score:.3f}")
            print(f"   AUC Score: {ensemble_auc:.3f}")
            
            # Check if ensemble is better than best individual model
            best_individual_auc = sorted_results[0][1]['auc_score']
            
            if ensemble_auc > best_individual_auc:
                self.best_model = ensemble
                self.best_scaler = best_scaler
                self.best_score = ensemble_auc
                self.best_model_name = "Ensemble"
                print(f"🏆 Ensemble wins! (AUC: {ensemble_auc:.3f} vs {best_individual_auc:.3f})")
            else:
                self.best_model = sorted_results[0][1]['model']
                self.best_scaler = best_scaler
                self.best_score = best_individual_auc
                self.best_model_name = sorted_results[0][0]
                print(f"🏆 Best individual model wins: {self.best_model_name}")
        else:
            # Use best individual model
            self.best_model = sorted_results[0][1]['model']
            self.best_scaler = best_scaler
            self.best_score = sorted_results[0][1]['auc_score']
            self.best_model_name = sorted_results[0][0]
        
        return {
            'best_model_name': self.best_model_name,
            'best_score': self.best_score,
            'best_scaler': scaler_name,
            'all_results': sorted_results,
            'dataset_info': {
                'total_records': len(df),
                'success_rate': df['success_label'].mean(),
                'features': len(self.feature_names)
            }
        }
    
    def save_best_model(self):
        """Save the best performing model"""
        if self.best_model is None:
            raise ValueError("No model trained yet")
        
        os.makedirs('backend/ml', exist_ok=True)
        
        # Save model and scaler
        joblib.dump(self.best_model, 'backend/ml/best_rs_model.pkl')
        if self.best_scaler is not None:
            joblib.dump(self.best_scaler, 'backend/ml/best_scaler.pkl')
        
        print(f"💾 Best model ({self.best_model_name}) saved to backend/ml/best_rs_model.pkl")
        if self.best_scaler is not None:
            print(f"💾 Best scaler saved to backend/ml/best_scaler.pkl")
    
    def get_feature_importance(self):
        """Get feature importance from best model"""
        if self.best_model is None:
            return None
        
        try:
            if hasattr(self.best_model, 'feature_importances_'):
                importance = self.best_model.feature_importances_
            elif hasattr(self.best_model, 'named_estimators_'):
                # Ensemble model - get from first estimator that has feature importance
                for estimator in self.best_model.named_estimators_.values():
                    if hasattr(estimator, 'feature_importances_'):
                        importance = estimator.feature_importances_
                        break
                else:
                    return None
            else:
                return None
            
            feature_importance = list(zip(self.feature_names, importance))
            feature_importance.sort(key=lambda x: x[1], reverse=True)
            
            print(f"\n🔍 Feature Importance ({self.best_model_name}):")
            print("=" * 55)
            for i, (feature, imp) in enumerate(feature_importance, 1):
                bar = "█" * int(imp * 50)
                print(f"{i:2d}. {feature:<25} {imp:.3f} {bar}")
            
            return dict(feature_importance)
            
        except Exception as e:
            print(f"⚠️ Could not extract feature importance: {e}")
            return None


def find_best_model():
    """Main function to find the best model"""
    trainer = AdvancedMultiModelTrainer()
    
    try:
        # Train all models
        results = trainer.train_all_models()
        
        # Check if we have a good model
        if results['best_score'] >= 0.75:
            trainer.save_best_model()
            trainer.get_feature_importance()
            
            print(f"\n🎉 Best Model Found!")
            print(f"📋 Final Results:")
            print(f"   Best Model: {results['best_model_name']}")
            print(f"   AUC Score: {results['best_score']:.3f}")
            print(f"   Scaler: {results['best_scaler']}")
            print(f"   Dataset: {results['dataset_info']['total_records']:,} records")
            print(f"   Status: ✅ PRODUCTION READY")
            
            return True
        else:
            print(f"\n⚠️ Best model AUC ({results['best_score']:.3f}) below 0.75 threshold")
            print("Consider:")
            print("- More feature engineering")
            print("- Different data preprocessing")
            print("- Deep learning approaches")
            return False
            
    except Exception as e:
        print(f"❌ Error during model comparison: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    find_best_model()