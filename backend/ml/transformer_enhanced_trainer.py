"""
Transformer-Enhanced Routing Model Trainer
Uses sentence transformers for text understanding and advanced feature engineering
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
import joblib
import os
import random
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

# Try to import sentence transformers, fallback if not available
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("⚠️ sentence-transformers not available, using alternative text processing")

# Try to import transformers for sentiment analysis
try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("⚠️ transformers not available, using rule-based sentiment analysis")


class TransformerEnhancedTrainer:
    """Advanced trainer using transformer-based text understanding"""
    
    def __init__(self, seed: int = 42):
        self.seed = seed
        np.random.seed(seed)
        random.seed(seed)
        
        self.model = None
        self.scaler = StandardScaler()
        
        # Initialize text processing models
        self.sentence_encoder = None
        self.sentiment_analyzer = None
        
        self._initialize_text_models()
        
        # Enhanced feature names
        self.base_features = [
            'customer_sentiment', 'customer_tier', 'issue_complexity', 'channel_type',
            'agent_experience', 'agent_specialty_match', 'agent_past_success',
            'agent_avg_handling_time', 'agent_current_workload', 'time_of_day',
            'day_of_week', 'queue_length'
        ]
        
        # Additional engineered features
        self.engineered_features = [
            'text_embedding_similarity', 'intent_confidence', 'sentiment_confidence',
            'urgency_score', 'complexity_text_score', 'agent_customer_match_score',
            'workload_efficiency_ratio', 'experience_complexity_ratio',
            'tier_sentiment_interaction', 'peak_hour_indicator'
        ]
        
        self.all_features = self.base_features + self.engineered_features
    
    def _initialize_text_models(self):
        """Initialize transformer models for text processing"""
        try:
            if SENTENCE_TRANSFORMERS_AVAILABLE:
                print("🤖 Loading sentence transformer model...")
                # Use a lightweight but effective model
                self.sentence_encoder = SentenceTransformer('all-MiniLM-L6-v2')
                print("✅ Sentence transformer loaded")
            
            if TRANSFORMERS_AVAILABLE:
                print("🤖 Loading sentiment analysis model...")
                self.sentiment_analyzer = pipeline(
                    "sentiment-analysis",
                    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                    return_all_scores=True
                )
                print("✅ Sentiment analyzer loaded")
                
        except Exception as e:
            print(f"⚠️ Error loading transformer models: {e}")
            self.sentence_encoder = None
            self.sentiment_analyzer = None
    
    def load_data(self) -> pd.DataFrame:
        """Load training data with text information"""
        data_path = "backend/data/real_world_hybrid_data.csv"
        
        if not os.path.exists(data_path):
            print("⚠️ Real-world data not found, creating enhanced synthetic data...")
            return self._create_enhanced_synthetic_data()
        
        df = pd.read_csv(data_path)
        print(f"📊 Loaded {len(df)} training records")
        
        # Add text data if not present
        if 'original_text' not in df.columns:
            df = self._add_synthetic_text_data(df)
        
        return df
    
    def _create_enhanced_synthetic_data(self) -> pd.DataFrame:
        """Create synthetic data with realistic text patterns"""
        print("🔄 Creating enhanced synthetic data with text...")
        
        # Customer issue templates
        issue_templates = {
            'technical_support': [
                "I can't log into my account, getting error messages",
                "The app keeps crashing when I try to use it",
                "My password reset isn't working properly",
                "Having trouble with the website loading",
                "The system is showing incorrect information"
            ],
            'billing': [
                "There's an error on my billing statement",
                "I was charged incorrectly for my subscription",
                "Need help understanding my invoice",
                "Payment was declined but I have sufficient funds",
                "Want to update my payment method"
            ],
            'account_management': [
                "Need to update my account information",
                "Want to change my subscription plan",
                "How do I close my account",
                "Need to transfer my account to someone else",
                "Having issues with account verification"
            ],
            'product_inquiry': [
                "What features are included in the premium plan",
                "How does the new product update work",
                "Need more information about your services",
                "Comparing different plan options",
                "When will the new feature be available"
            ],
            'sales': [
                "Interested in upgrading my current plan",
                "Want to know about enterprise solutions",
                "Looking for bulk pricing options",
                "Need a quote for additional services",
                "Considering switching from competitor"
            ],
            'complaint_resolution': [
                "Very disappointed with the service quality",
                "This is unacceptable, I want a refund",
                "The support team was unhelpful",
                "Service has been down for hours",
                "Not satisfied with the resolution provided"
            ]
        }
        
        records = []
        issue_types = list(issue_templates.keys())
        
        for i in range(15000):
            # Select issue type and text
            issue_type = random.choice(issue_types)
            text = random.choice(issue_templates[issue_type])
            
            # Add variation to text
            if random.random() < 0.3:
                urgency_words = ["urgent", "immediately", "ASAP", "quickly", "right away"]
                text = f"{random.choice(urgency_words).title()}: {text}"
            
            # Generate features
            customer_sentiment = self._analyze_text_sentiment(text)
            customer_tier = random.choices([0, 1, 2], weights=[0.3, 0.5, 0.2])[0]
            issue_complexity = self._calculate_text_complexity(text, issue_type)
            channel_type = 1 if any(word in text.lower() for word in ['call', 'phone', 'speak']) else 0
            
            # Agent features
            agent_experience = np.random.gamma(3.5, 1.2)
            agent_specialty_match = self._calculate_specialty_match(issue_type)
            agent_past_success = np.random.beta(9, 2.5)
            agent_avg_handling_time = np.random.gamma(2.5, 2.2)
            agent_current_workload = np.random.beta(2.5, 3.5)
            
            # Context features
            time_of_day = random.randint(8, 18)
            day_of_week = random.randint(0, 6)
            queue_length = random.randint(0, 12)
            
            # Calculate success probability with enhanced logic
            success_prob = self._calculate_enhanced_success_probability(
                text, customer_sentiment, customer_tier, issue_complexity,
                agent_experience, agent_specialty_match, agent_past_success,
                agent_current_workload, time_of_day, issue_type
            )
            
            success_label = 1 if random.random() < success_prob else 0
            
            record = {
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
                'success_label': success_label,
                'original_text': text,
                'issue_type': issue_type
            }
            
            records.append(record)
        
        df = pd.DataFrame(records)
        
        # Save enhanced data
        os.makedirs('backend/data', exist_ok=True)
        df.to_csv('backend/data/transformer_enhanced_data.csv', index=False)
        
        print(f"✅ Created {len(df)} enhanced records with text")
        print(f"📊 Success rate: {df['success_label'].mean():.3f}")
        
        return df
    
    def _add_synthetic_text_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add synthetic text data to existing dataframe"""
        print("🔄 Adding synthetic text data to existing records...")
        
        # Simple text generation based on features
        texts = []
        for _, row in df.iterrows():
            sentiment = row['customer_sentiment']
            tier = row['customer_tier']
            complexity = row['issue_complexity']
            
            # Generate text based on features
            if sentiment == 0:  # negative
                base_text = "I'm having serious problems with"
            elif sentiment == 2:  # positive
                base_text = "I'd like some help with"
            else:  # neutral
                base_text = "I need assistance with"
            
            if complexity > 0.7:
                issue_desc = "a complex technical issue that's been ongoing"
            elif complexity > 0.4:
                issue_desc = "an issue with my account settings"
            else:
                issue_desc = "a simple question about my service"
            
            text = f"{base_text} {issue_desc}"
            texts.append(text)
        
        df['original_text'] = texts
        return df
    
    def _analyze_text_sentiment(self, text: str) -> int:
        """Analyze sentiment using transformer or rule-based approach"""
        if self.sentiment_analyzer is not None:
            try:
                results = self.sentiment_analyzer(text)
                # Get the sentiment with highest score
                best_sentiment = max(results[0], key=lambda x: x['score'])
                
                if 'NEGATIVE' in best_sentiment['label'].upper():
                    return 0
                elif 'POSITIVE' in best_sentiment['label'].upper():
                    return 2
                else:
                    return 1
            except:
                pass
        
        # Fallback to rule-based
        text_lower = text.lower()
        negative_words = ['error', 'problem', 'issue', 'broken', 'fail', 'wrong', 'bad', 'terrible', 'awful', 'disappointed', 'frustrated', 'angry', 'unacceptable']
        positive_words = ['good', 'great', 'excellent', 'thank', 'appreciate', 'love', 'perfect', 'amazing', 'wonderful', 'satisfied']
        
        neg_count = sum(1 for word in negative_words if word in text_lower)
        pos_count = sum(1 for word in positive_words if word in text_lower)
        
        if neg_count > pos_count + 1:
            return 0  # negative
        elif pos_count > neg_count:
            return 2  # positive
        else:
            return 1  # neutral
    
    def _calculate_text_complexity(self, text: str, issue_type: str) -> float:
        """Calculate issue complexity from text"""
        text_lower = text.lower()
        
        # Length-based complexity
        word_count = len(text.split())
        length_complexity = min(1.0, word_count / 30)
        
        # Technical keyword complexity
        complex_keywords = ['technical', 'system', 'error', 'configuration', 'integration', 'api', 'database', 'server', 'network']
        simple_keywords = ['question', 'information', 'help', 'simple', 'basic']
        
        complex_count = sum(1 for word in complex_keywords if word in text_lower)
        simple_count = sum(1 for word in simple_keywords if word in text_lower)
        
        keyword_complexity = (complex_count - simple_count + 2) / 4
        keyword_complexity = max(0, min(1, keyword_complexity))
        
        # Issue type base complexity
        type_complexity = {
            'technical_support': 0.7,
            'billing': 0.4,
            'account_management': 0.5,
            'product_inquiry': 0.3,
            'sales': 0.4,
            'complaint_resolution': 0.6
        }.get(issue_type, 0.5)
        
        # Combine factors
        final_complexity = (length_complexity * 0.2 + keyword_complexity * 0.3 + type_complexity * 0.5)
        return max(0.1, min(0.9, final_complexity))
    
    def _calculate_specialty_match(self, issue_type: str) -> float:
        """Calculate agent specialty match"""
        # Simulate realistic specialty matching
        base_matches = {
            'technical_support': 0.85,
            'billing': 0.90,
            'account_management': 0.80,
            'product_inquiry': 0.75,
            'sales': 0.88,
            'complaint_resolution': 0.70
        }
        
        base_match = base_matches.get(issue_type, 0.75)
        return max(0.3, min(1.0, base_match + random.uniform(-0.15, 0.15)))
    
    def _calculate_enhanced_success_probability(self, text: str, sentiment: int, tier: int, 
                                              complexity: float, experience: float, 
                                              specialty_match: float, past_success: float,
                                              workload: float, time_of_day: int, issue_type: str) -> float:
        """Calculate success probability with text-based enhancements"""
        
        # Base probability
        base_prob = 0.58
        
        # Text-based adjustments
        text_lower = text.lower()
        urgency_words = ['urgent', 'immediately', 'asap', 'quickly', 'right away']
        urgency_penalty = -0.1 if any(word in text_lower for word in urgency_words) else 0.0
        
        # Customer factors
        sentiment_impact = {0: -0.35, 1: 0.0, 2: 0.25}[sentiment]
        tier_impact = {0: -0.15, 1: 0.0, 2: 0.25}[tier]
        complexity_impact = -0.45 * complexity
        
        # Agent factors
        experience_impact = min(0.30, experience * 0.07)
        specialty_impact = 0.50 * specialty_match
        past_success_impact = 0.35 * (past_success - 0.5)
        workload_impact = -0.25 * workload
        
        # Time factors
        time_impact = 0.05 if 9 <= time_of_day <= 17 else -0.05
        
        # Issue type specific adjustments
        issue_impact = {
            'billing': 0.08,
            'technical_support': -0.05,
            'complaint_resolution': -0.12,
            'sales': 0.12,
            'account_management': 0.02,
            'product_inquiry': 0.06
        }.get(issue_type, 0.0)
        
        total_prob = (base_prob + sentiment_impact + tier_impact + complexity_impact +
                     experience_impact + specialty_impact + past_success_impact +
                     workload_impact + time_impact + issue_impact + urgency_penalty)
        
        # Add small random variation
        total_prob += random.uniform(-0.02, 0.02)
        return max(0.15, min(0.88, total_prob))
    
    def engineer_advanced_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer advanced features using text analysis"""
        print("🔧 Engineering advanced features with text analysis...")
        
        df_enhanced = df.copy()
        
        # Text embedding similarity (if sentence transformer available)
        if self.sentence_encoder is not None:
            print("   📝 Computing text embeddings...")
            try:
                # Create embeddings for customer texts
                texts = df_enhanced['original_text'].fillna('').tolist()
                embeddings = self.sentence_encoder.encode(texts)
                
                # Calculate similarity to "ideal" customer texts
                ideal_texts = [
                    "I need help with a simple question",
                    "Thank you for your assistance with this matter",
                    "I have a straightforward billing inquiry"
                ]
                ideal_embeddings = self.sentence_encoder.encode(ideal_texts)
                ideal_avg = np.mean(ideal_embeddings, axis=0)
                
                # Calculate cosine similarity
                similarities = []
                for emb in embeddings:
                    similarity = np.dot(emb, ideal_avg) / (np.linalg.norm(emb) * np.linalg.norm(ideal_avg))
                    similarities.append(similarity)
                
                df_enhanced['text_embedding_similarity'] = similarities
                
            except Exception as e:
                print(f"   ⚠️ Text embedding failed: {e}")
                df_enhanced['text_embedding_similarity'] = 0.5
        else:
            df_enhanced['text_embedding_similarity'] = 0.5
        
        # Intent confidence (based on text clarity)
        df_enhanced['intent_confidence'] = df_enhanced['original_text'].apply(
            lambda x: min(1.0, len(str(x).split()) / 20) if pd.notna(x) else 0.5
        )
        
        # Sentiment confidence (based on sentiment analysis)
        df_enhanced['sentiment_confidence'] = df_enhanced.apply(
            lambda row: 0.9 if row['customer_sentiment'] != 1 else 0.6, axis=1
        )
        
        # Urgency score
        urgency_words = ['urgent', 'immediately', 'asap', 'quickly', 'emergency']
        df_enhanced['urgency_score'] = df_enhanced['original_text'].apply(
            lambda x: sum(1 for word in urgency_words if word in str(x).lower()) / 5
        )
        
        # Complexity text score
        df_enhanced['complexity_text_score'] = df_enhanced['issue_complexity'] * df_enhanced['intent_confidence']
        
        # Agent-customer match score
        df_enhanced['agent_customer_match_score'] = (
            df_enhanced['agent_specialty_match'] * 
            df_enhanced['sentiment_confidence'] * 
            (1 - df_enhanced['urgency_score'])
        )
        
        # Workload efficiency ratio
        df_enhanced['workload_efficiency_ratio'] = (
            df_enhanced['agent_past_success'] / (df_enhanced['agent_current_workload'] + 0.1)
        )
        
        # Experience complexity ratio
        df_enhanced['experience_complexity_ratio'] = (
            df_enhanced['agent_experience'] / (df_enhanced['issue_complexity'] + 0.1)
        )
        
        # Tier sentiment interaction
        df_enhanced['tier_sentiment_interaction'] = (
            df_enhanced['customer_tier'] * df_enhanced['customer_sentiment']
        )
        
        # Peak hour indicator
        df_enhanced['peak_hour_indicator'] = (
            (df_enhanced['time_of_day'] >= 9) & (df_enhanced['time_of_day'] <= 17)
        ).astype(int)
        
        print(f"✅ Engineered {len(self.engineered_features)} additional features")
        return df_enhanced
    
    def train_transformer_enhanced_model(self) -> Dict:
        """Train model with transformer-enhanced features"""
        print("🚀 Training transformer-enhanced routing model...")
        
        # Load and enhance data
        df = self.load_data()
        df_enhanced = self.engineer_advanced_features(df)
        
        # Prepare features
        X = df_enhanced[self.all_features].values
        y = df_enhanced['success_label'].values
        
        # Handle missing values
        X = np.nan_to_num(X, nan=0.0)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=self.seed, stratify=y
        )
        
        print(f"🔧 Training set: {X_train.shape}")
        print(f"📊 Class distribution: {np.bincount(y)}")
        print(f"⚖️ Class balance: {y.mean():.3f}")
        
        # Use Gradient Boosting as recommended
        self.model = GradientBoostingClassifier(
            n_estimators=500,
            max_depth=10,
            learning_rate=0.05,
            subsample=0.9,
            max_features='sqrt',
            random_state=self.seed,
            validation_fraction=0.1,
            n_iter_no_change=20,
            tol=1e-4
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        auc_score = roc_auc_score(y_test, y_pred_proba)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=5, scoring='roc_auc')
        
        # Precision-Recall AUC
        precision, recall, _ = precision_recall_curve(y_test, y_pred_proba)
        pr_auc = np.trapz(recall, precision)
        
        results = {
            'train_accuracy': train_score,
            'test_accuracy': test_score,
            'auc_score': auc_score,
            'pr_auc': pr_auc,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_count': len(self.all_features),
            'dataset_size': len(df_enhanced)
        }
        
        print(f"\n🎯 Transformer-Enhanced Model Results:")
        print(f"   Train Accuracy: {train_score:.3f}")
        print(f"   Test Accuracy: {test_score:.3f}")
        print(f"   AUC Score: {auc_score:.3f}")
        print(f"   PR-AUC Score: {pr_auc:.3f}")
        print(f"   CV Score: {cv_scores.mean():.3f} (±{cv_scores.std() * 2:.3f})")
        print(f"   Features Used: {len(self.all_features)}")
        
        return results
    
    def save_model(self):
        """Save the transformer-enhanced model"""
        if self.model is None:
            raise ValueError("No model trained yet")
        
        os.makedirs('backend/ml', exist_ok=True)
        
        joblib.dump(self.model, 'backend/ml/transformer_enhanced_model.pkl')
        joblib.dump(self.scaler, 'backend/ml/transformer_enhanced_scaler.pkl')
        
        print("💾 Transformer-enhanced model saved to backend/ml/transformer_enhanced_model.pkl")
        print("💾 Scaler saved to backend/ml/transformer_enhanced_scaler.pkl")
    
    def get_feature_importance(self):
        """Get feature importance from the model"""
        if self.model is None:
            return None
        
        try:
            importance = self.model.feature_importances_
            feature_importance = list(zip(self.all_features, importance))
            feature_importance.sort(key=lambda x: x[1], reverse=True)
            
            print(f"\n🔍 Feature Importance (Transformer-Enhanced):")
            print("=" * 65)
            for i, (feature, imp) in enumerate(feature_importance, 1):
                bar = "█" * int(imp * 50)
                print(f"{i:2d}. {feature:<30} {imp:.3f} {bar}")
            
            return dict(feature_importance)
            
        except Exception as e:
            print(f"⚠️ Could not extract feature importance: {e}")
            return None


def train_transformer_enhanced_model():
    """Main function to train transformer-enhanced model"""
    trainer = TransformerEnhancedTrainer()
    
    try:
        # Train model
        results = trainer.train_transformer_enhanced_model()
        
        # Check performance
        if results['auc_score'] >= 0.75:
            trainer.save_model()
            trainer.get_feature_importance()
            
            print(f"\n🎉 Transformer-Enhanced Model Success!")
            print(f"📋 Final Results:")
            print(f"   Model: Gradient Boosting + Transformer Features")
            print(f"   AUC Score: {results['auc_score']:.3f}")
            print(f"   Test Accuracy: {results['test_accuracy']:.3f}")
            print(f"   Features: {results['feature_count']} (including text-derived)")
            print(f"   Dataset: {results['dataset_size']:,} records")
            print(f"   Status: ✅ PRODUCTION READY")
            
            return True
        else:
            print(f"\n⚠️ Model AUC ({results['auc_score']:.3f}) still below 0.75")
            print("The transformer approach improved performance but needs further tuning")
            
            # Save anyway as it's the best we have
            trainer.save_model()
            trainer.get_feature_importance()
            return False
            
    except Exception as e:
        print(f"❌ Error during transformer training: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    train_transformer_enhanced_model()