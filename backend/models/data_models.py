"""
Core data models for the AI Smart Queue Routing System
Defines Pydantic models for Customer, Agent, RoutingResult, and TrainingRecord
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
import uuid


class Customer(BaseModel):
    """Customer data model with context and priority information"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    sentiment: Literal['positive', 'neutral', 'negative']
    tier: Literal['premium', 'standard', 'basic']
    issue_type: str
    issue_complexity: float = Field(ge=1.0, le=5.0, description="Issue complexity on 1-5 scale")
    channel: Literal['chat', 'voice', 'phone', 'email']
    wait_time: int = Field(ge=0, description="Wait time in seconds")
    priority: int = Field(ge=1, le=10, description="Priority level 1-10")
    created_at: datetime = Field(default_factory=datetime.now)
    context: Dict[str, Any] = Field(default_factory=dict)


class CustomerCreate(BaseModel):
    """Model for creating new customers"""
    name: str
    sentiment: Literal['positive', 'neutral', 'negative']
    tier: Literal['premium', 'standard', 'basic']
    issue_type: str
    issue_complexity: float = Field(ge=1.0, le=5.0)
    channel: Literal['chat', 'voice', 'phone', 'email']
    priority: int = Field(ge=1, le=10, default=5)
    context: Dict[str, Any] = Field(default_factory=dict)


class Agent(BaseModel):
    """Agent data model with skills and performance metrics"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    specialty: List[str]
    experience: float = Field(ge=0.0, description="Experience in years")
    avg_handling_time: float = Field(ge=0.0, description="Average handling time in minutes")
    past_success_rate: float = Field(ge=0.0, le=1.0, description="Historical success rate")
    current_workload: int = Field(ge=0, description="Number of active customers")
    max_concurrent: int = Field(ge=1, description="Maximum concurrent customers")
    status: Literal['available', 'busy', 'offline']
    skills: Dict[str, float] = Field(default_factory=dict, description="Skill -> proficiency mapping")
    last_updated: datetime = Field(default_factory=datetime.now)


class AgentStatus(BaseModel):
    """Model for updating agent status"""
    status: Literal['available', 'busy', 'offline']


class ConversationSummary(BaseModel):
    """Conversation summary between customer and agent"""
    routing_id: str
    customer_id: str
    agent_id: str
    customer_name: str
    agent_name: str
    channel: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[float] = None
    issue_type: str
    issue_description: str
    resolution_summary: str
    key_points: List[str] = Field(default_factory=list)
    actions_taken: List[str] = Field(default_factory=list)
    follow_up_required: bool = False
    follow_up_notes: Optional[str] = None


class CustomerFeedback(BaseModel):
    """Customer feedback after interaction"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    routing_id: str
    customer_id: str
    agent_id: str
    satisfaction_score: int = Field(ge=1, le=5, description="1-5 star rating")
    agent_professionalism: int = Field(ge=1, le=5)
    issue_resolution: int = Field(ge=1, le=5)
    wait_time_satisfaction: int = Field(ge=1, le=5)
    would_recommend: bool
    comments: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.now)


class RoutingResult(BaseModel):
    """Routing result with score and reasoning"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    agent_id: str
    customer_name: Optional[str] = None
    agent_name: Optional[str] = None
    routing_score: float = Field(ge=0.0, le=1.0, description="Routing score 0-1")
    timestamp: datetime = Field(default_factory=datetime.now)
    reasoning: List[str] = Field(default_factory=list)
    status: Literal['pending', 'active', 'completed'] = 'pending'
    conversation_summary: Optional[ConversationSummary] = None
    customer_feedback: Optional[CustomerFeedback] = None
    actual_handling_time: Optional[float] = Field(None, ge=0.0)
    success_outcome: Optional[bool] = None


class ManualAssignment(BaseModel):
    """Model for manual customer-agent assignment"""
    customer_id: str
    agent_id: str
    reasoning: str = "Manual assignment by supervisor"


class TrainingRecord(BaseModel):
    """Training data schema for ML model"""
    # Customer features
    customer_sentiment: int = Field(description="encoded: negative=0, neutral=1, positive=2")
    customer_tier: int = Field(description="encoded: basic=0, standard=1, premium=2")
    issue_complexity: float
    channel_type: int = Field(description="encoded: chat=0, voice=1")
    
    # Agent features
    agent_experience: float
    agent_specialty_match: float = Field(ge=0.0, le=1.0, description="0-1 based on issue type match")
    agent_past_success: float
    agent_avg_handling_time: float
    agent_current_workload: float = Field(ge=0.0, le=1.0, description="normalized 0-1")
    
    # Context features
    time_of_day: int = Field(ge=0, le=23, description="hour 0-23")
    day_of_week: int = Field(ge=0, le=6, description="0-6")
    queue_length: int = Field(ge=0)
    
    # Target
    success_label: int = Field(description="0 or 1")


class PerformanceMetrics(BaseModel):
    """Analytics and performance metrics"""
    total_routings: int
    average_routing_score: float
    success_rate: float
    avg_handling_time: float
    customer_satisfaction: float
    agent_utilization: float
    start_date: datetime
    end_date: datetime


class AnalyticsData(BaseModel):
    """Time-series analytics data point"""
    timestamp: datetime
    average_rs: float
    total_routings: int
    success_rate: float


class UserLogin(BaseModel):
    """User login credentials"""
    email: str
    password: str


class UserSignup(BaseModel):
    """User signup data"""
    email: str
    password: str
    name: str
    role: Literal['admin', 'customer']


class User(BaseModel):
    """User model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: Literal['admin', 'customer']
    created_at: datetime = Field(default_factory=datetime.now)
    last_login: Optional[datetime] = None


class CustomerQuery(BaseModel):
    """Customer query submission"""
    customer_email: str
    customer_name: str
    sentiment: Literal['positive', 'neutral', 'negative']
    tier: Literal['premium', 'standard', 'basic']
    issue_type: str
    issue_description: str
    channel: Literal['chat', 'voice', 'phone', 'email']
    priority: int = Field(ge=1, le=10, default=5)
    issue_complexity: float = Field(ge=1.0, le=5.0, default=3.0)