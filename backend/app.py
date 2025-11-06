"""
AI-Driven Smart Queue Routing System (SQRS) - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import uvicorn
import uuid

from models.data_models import (
    Customer, Agent, RoutingResult, CustomerCreate, ManualAssignment,
    UserLogin, UserSignup, User, CustomerQuery
)
from services.data_store import DataStore
from services.routing_engine import RoutingEngine
import hashlib
import secrets


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize data store with mock data
    app.state.data_store = DataStore()
    app.state.data_store.initialize_mock_data()
    
    # Initialize routing engine
    app.state.routing_engine = RoutingEngine()
    
    # Initialize user storage (in-memory for demo)
    app.state.users = {}
    app.state.sessions = {}
    
    # Create default admin user
    admin_id = str(uuid.uuid4())
    app.state.users[admin_id] = {
        "id": admin_id,
        "email": "admin@sqrs.com",
        "password": hashlib.sha256("admin123".encode()).hexdigest(),
        "name": "System Administrator",
        "role": "admin",
        "created_at": datetime.now()
    }
    
    yield


app = FastAPI(
    title="AI Smart Queue Routing System",
    description="Intelligent customer-agent matching system with ML-powered routing scores",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Smart Queue Routing System API", "status": "running"}


# Authentication Endpoints
@app.post("/auth/signup")
async def signup(user_data: UserSignup):
    """Register a new user"""
    try:
        # Check if email already exists
        for user in app.state.users.values():
            if user["email"] == user_data.email:
                return {"error": "Email already registered"}, 400
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = hashlib.sha256(user_data.password.encode()).hexdigest()
        
        new_user = {
            "id": user_id,
            "email": user_data.email,
            "password": hashed_password,
            "name": user_data.name,
            "role": user_data.role,
            "created_at": datetime.now()
        }
        
        app.state.users[user_id] = new_user
        
        # Create session token
        session_token = secrets.token_urlsafe(32)
        app.state.sessions[session_token] = {
            "user_id": user_id,
            "created_at": datetime.now()
        }
        
        return {
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "email": user_data.email,
                "name": user_data.name,
                "role": user_data.role
            },
            "token": session_token
        }
        
    except Exception as e:
        print(f"❌ Signup error: {str(e)}")
        return {"error": f"Signup failed: {str(e)}"}, 500


@app.post("/auth/login")
async def login(credentials: UserLogin):
    """Login user"""
    try:
        # Find user by email
        user = None
        for u in app.state.users.values():
            if u["email"] == credentials.email:
                user = u
                break
        
        if not user:
            return {"error": "Invalid email or password"}, 401
        
        # Verify password
        hashed_password = hashlib.sha256(credentials.password.encode()).hexdigest()
        if user["password"] != hashed_password:
            return {"error": "Invalid email or password"}, 401
        
        # Create session token
        session_token = secrets.token_urlsafe(32)
        app.state.sessions[session_token] = {
            "user_id": user["id"],
            "created_at": datetime.now()
        }
        
        # Update last login
        user["last_login"] = datetime.now()
        
        return {
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            },
            "token": session_token
        }
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return {"error": f"Login failed: {str(e)}"}, 500


@app.post("/auth/logout")
async def logout(token: dict):
    """Logout user"""
    try:
        session_token = token.get("token")
        if session_token in app.state.sessions:
            del app.state.sessions[session_token]
        return {"message": "Logged out successfully"}
    except Exception as e:
        return {"error": f"Logout failed: {str(e)}"}, 500


@app.get("/auth/me")
async def get_current_user(token: str):
    """Get current user info"""
    try:
        if token not in app.state.sessions:
            return {"error": "Invalid or expired session"}, 401
        
        user_id = app.state.sessions[token]["user_id"]
        user = app.state.users.get(user_id)
        
        if not user:
            return {"error": "User not found"}, 404
        
        return {
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            }
        }
    except Exception as e:
        return {"error": f"Failed to get user: {str(e)}"}, 500


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "customers_in_queue": len(app.state.data_store.customers),
        "available_agents": len([a for a in app.state.data_store.agents.values() if a.status == "available"])
    }


# Customer Management Endpoints
@app.get("/customers")
async def get_customers():
    """Returns all customers currently in queue"""
    app.state.data_store.update_wait_times()
    customers = app.state.data_store.get_customers()
    return {"customers": customers, "count": len(customers)}


@app.post("/customers")
async def add_customer(customer_data: CustomerCreate):
    """Adds a new customer to the queue"""
    try:
        # Create customer with default wait_time of 0
        customer = Customer(
            **customer_data.model_dump(),
            wait_time=0
        )
        added_customer = app.state.data_store.add_customer(customer)
        print(f"✅ Customer added: {added_customer.name} (ID: {added_customer.id})")
        return {"customer": added_customer, "message": "Customer added successfully"}
    except Exception as e:
        print(f"❌ Error adding customer: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Failed to add customer: {str(e)}"}, 400


@app.post("/customer/submit-query")
async def submit_customer_query(query: CustomerQuery):
    """Customer submits a query and gets added to queue"""
    try:
        # Create customer from query
        customer = Customer(
            name=query.customer_name,
            sentiment=query.sentiment,
            tier=query.tier,
            issue_type=query.issue_type,
            channel=query.channel,
            priority=query.priority,
            issue_complexity=query.issue_complexity,
            wait_time=0,
            context={"description": query.issue_description, "email": query.customer_email}
        )
        
        added_customer = app.state.data_store.add_customer(customer)
        
        # Get queue position
        all_customers = app.state.data_store.get_customers()
        queue_position = len(all_customers)
        
        print(f"✅ Customer query submitted: {added_customer.name} (Position: {queue_position})")
        
        return {
            "message": "Query submitted successfully! You've been added to the queue.",
            "customer": added_customer,
            "queue_position": queue_position,
            "estimated_wait_time": queue_position * 5  # Estimate 5 min per customer
        }
    except Exception as e:
        print(f"❌ Error submitting query: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Failed to submit query: {str(e)}"}, 400


@app.delete("/customers/{customer_id}")
async def remove_customer(customer_id: str):
    """Removes customer from queue"""
    success = app.state.data_store.remove_customer(customer_id)
    if success:
        return {"message": "Customer removed successfully"}
    else:
        return {"error": "Customer not found"}, 404


# Agent Management Endpoints
@app.get("/agents")
async def get_agents():
    """Returns all agents with current status"""
    agents = app.state.data_store.get_agents()
    available_count = len([a for a in agents if a.status == "available"])
    return {
        "agents": agents, 
        "total_count": len(agents),
        "available_count": available_count
    }


@app.put("/agents/{agent_id}/status")
async def update_agent_status(agent_id: str, status_data: dict):
    """Updates agent availability status"""
    new_status = status_data.get("status")
    if new_status not in ["available", "busy", "offline"]:
        return {"error": "Invalid status"}, 400
    
    agent = app.state.data_store.update_agent_status(agent_id, new_status)
    if agent:
        return {"agent": agent, "message": "Agent status updated"}
    else:
        return {"error": "Agent not found"}, 404


# Routing Operations
@app.post("/route")
async def auto_route():
    """Performs automatic routing for all queued customers"""
    try:
        print("🔄 Starting auto routing...")
        
        customers = app.state.data_store.get_customers()
        agents = app.state.data_store.get_available_agents()
        
        print(f"📊 Found {len(customers)} customers and {len(agents)} available agents")
        
        # Debug: Print customer and agent details
        if customers:
            print(f"📋 Customers in queue:")
            for i, customer in enumerate(customers[:3]):  # Show first 3
                print(f"   {i+1}. {customer.name} - {customer.issue_type} (Priority: {customer.priority})")
        
        if agents:
            print(f"👥 Available agents:")
            for i, agent in enumerate(agents[:3]):  # Show first 3
                print(f"   {i+1}. {agent.name} - {agent.specialty} (Workload: {agent.current_workload}/{agent.max_concurrent})")
        
        if not customers:
            print("⚠️ No customers in queue to route")
            return {"message": "No customers in queue", "results": []}
        
        if not agents:
            print("⚠️ No agents available for routing")
            return {"message": "No agents available", "results": []}
        
        # Perform routing
        print("🤖 Performing AI routing...")
        routing_results = app.state.routing_engine.route_customers(customers, agents)
        print(f"✅ Generated {len(routing_results)} routing results")
        
        # Debug: Print routing results
        if routing_results:
            print(f"🎯 Routing results:")
            for i, result in enumerate(routing_results):
                print(f"   {i+1}. {result.customer_name} → {result.agent_name} (Score: {result.routing_score:.3f})")
        
        # Store results and update agent workloads
        for result in routing_results:
            app.state.data_store.add_routing_result(result)
            # Update agent workload
            agent = app.state.data_store.get_agent(result.agent_id)
            if agent:
                agent.current_workload += 1
                print(f"📈 Updated {agent.name} workload: {agent.current_workload}/{agent.max_concurrent}")
                # Update agent status in database
                app.state.data_store.db.update_agent_workload(agent.id, agent.current_workload)
            # Remove customer from queue (update status to 'routed')
            app.state.data_store.db.update_customer_status(result.customer_id, 'routed')
            app.state.data_store.remove_customer(result.customer_id)
            print(f"🚀 Routed customer {result.customer_name} and removed from queue")
        
        # Get routing statistics
        stats = app.state.routing_engine.get_routing_statistics(routing_results)
        
        print(f"🎉 Routing completed successfully! {len(routing_results)} customers routed.")
        
        return {
            "results": routing_results,
            "statistics": stats,
            "message": f"Successfully routed {len(routing_results)} customers"
        }
        
    except Exception as e:
        print(f"❌ Error in auto routing: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Routing failed: {str(e)}"}, 500


@app.post("/route/manual")
async def manual_route(assignment: ManualAssignment):
    """Allows manual customer-agent assignment"""
    customer = app.state.data_store.get_customer(assignment.customer_id)
    agent = app.state.data_store.get_agent(assignment.agent_id)
    
    if not customer:
        return {"error": "Customer not found"}, 404
    if not agent:
        return {"error": "Agent not found"}, 404
    if agent.status != "available":
        return {"error": "Agent not available"}, 400
    
    # Create manual routing result
    routing_score = app.state.routing_engine.predictor.predict_routing_score(customer, agent)
    result = RoutingResult(
        customer_id=assignment.customer_id,
        agent_id=assignment.agent_id,
        routing_score=routing_score,
        reasoning=[assignment.reasoning],
        status="active"
    )
    
    # Store result and update data
    app.state.data_store.add_routing_result(result)
    agent.current_workload += 1
    app.state.data_store.remove_customer(assignment.customer_id)
    
    return {"result": result, "message": "Manual routing completed"}


@app.get("/routing/results")
async def get_routing_results():
    """Get all current routing results"""
    try:
        routing_results = app.state.data_store.get_routing_results()
        return {"results": routing_results}
    except Exception as e:
        print(f"❌ Error getting routing results: {str(e)}")
        return {"error": f"Failed to get routing results: {str(e)}"}, 500


@app.post("/route/reset")
async def reset_queue():
    """Resets all assignments and returns customers to queue"""
    # Clear routing results
    app.state.data_store.clear_routing_results()
    
    # Reset agent workloads
    for agent in app.state.data_store.get_agents():
        agent.current_workload = 0
        agent.status = "available"
        # Update in database
        app.state.data_store.db.update_agent_workload(agent.id, 0)
        app.state.data_store.db.update_agent_status(agent.id, "available")
    
    # Reinitialize mock customers
    app.state.data_store._create_mock_customers()
    
    return {"message": "Queue reset successfully"}


# Analytics
@app.get("/analytics/performance")
async def get_performance_metrics():
    """Returns routing performance analytics"""
    routing_results = app.state.data_store.get_routing_results()
    stats = app.state.routing_engine.get_routing_statistics(routing_results)
    
    # Add additional metrics
    customers = app.state.data_store.get_customers()
    agents = app.state.data_store.get_agents()
    
    return {
        "routing_stats": stats,
        "queue_metrics": {
            "customers_waiting": len(customers),
            "agents_available": len([a for a in agents if a.status == "available"]),
            "agents_busy": len([a for a in agents if a.status == "busy"]),
            "total_agents": len(agents)
        },
        "model_info": app.state.routing_engine.predictor.get_model_info()
    }


# Feedback endpoint
@app.post("/feedback")
async def submit_feedback(feedback_data: dict):
    """Submit customer feedback for a conversation"""
    try:
        # In a real system, this would be stored in the database
        feedback = {
            "id": str(uuid.uuid4()),
            "conversation_id": feedback_data.get("conversation_id"),
            "agent_id": feedback_data.get("agent_id"),
            "satisfaction_score": feedback_data.get("satisfaction_score", 5),
            "agent_professionalism": feedback_data.get("agent_professionalism", 5),
            "issue_resolution": feedback_data.get("issue_resolution", 5),
            "wait_time_satisfaction": feedback_data.get("wait_time_satisfaction", 4),
            "would_recommend": feedback_data.get("would_recommend", True),
            "comments": feedback_data.get("comments", ""),
            "submitted_at": datetime.now().isoformat()
        }
        
        # Store feedback (in a real system, this would go to database)
        print(f"📝 Feedback received: {feedback}")
        
        return {
            "message": "Feedback submitted successfully",
            "feedback_id": feedback["id"]
        }
        
    except Exception as e:
        return {"error": f"Failed to submit feedback: {str(e)}"}, 500


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)


# AI Model Management Endpoints
@app.get("/ai/model/info")
async def get_model_info():
    """Get information about the current AI model"""
    model_info = app.state.routing_engine.predictor.get_model_info()
    
    # Add additional model statistics
    model_stats = {
        "model_file": "transformer_enhanced_model.pkl",
        "training_records": 20003,
        "accuracy": 0.863,
        "auc_score": 0.677,
        "features_used": len(model_info.get('features', [])),
        "last_trained": "2024-01-15T10:30:00Z",
        "model_size_mb": 15.2,
        "inference_time_ms": 45
    }
    
    return {
        "model_info": model_info,
        "model_stats": model_stats,
        "status": "active"
    }


@app.post("/ai/model/retrain")
async def retrain_model():
    """Trigger model retraining"""
    try:
        # In a real system, this would trigger background retraining
        # For demo, we'll simulate the process
        import time
        time.sleep(2)  # Simulate training time
        
        # Simulate improved metrics after retraining
        new_stats = {
            "accuracy": 0.871,
            "auc_score": 0.689,
            "training_records": 22500,
            "last_trained": datetime.now().isoformat(),
            "status": "retrained_successfully"
        }
        
        return {
            "message": "Model retrained successfully",
            "new_stats": new_stats,
            "improvement": {
                "accuracy_gain": 0.008,
                "auc_gain": 0.012
            }
        }
        
    except Exception as e:
        return {"error": f"Retraining failed: {str(e)}"}, 500


@app.get("/ai/model/performance")
async def get_model_performance():
    """Get detailed model performance metrics"""
    return {
        "current_performance": {
            "auc_score": 0.677,
            "test_accuracy": 0.863,
            "precision": 0.841,
            "recall": 0.967,
            "f1_score": 0.899
        },
        "feature_importance": {
            "customer_sentiment": 0.088,
            "agent_specialty_match": 0.085,
            "agent_customer_match_score": 0.077,
            "experience_complexity_ratio": 0.073,
            "agent_current_workload": 0.067,
            "agent_experience": 0.065,
            "workload_efficiency_ratio": 0.064,
            "agent_past_success": 0.063,
            "issue_complexity": 0.062,
            "agent_avg_handling_time": 0.061
        },
        "training_history": [
            {"date": "2024-01-15", "auc": 0.677, "accuracy": 0.863},
            {"date": "2024-01-14", "auc": 0.652, "accuracy": 0.841},
            {"date": "2024-01-13", "auc": 0.634, "accuracy": 0.829}
        ]
    }


@app.get("/settings/{category}")
async def get_settings(category: str):
    """Get settings by category"""
    try:
        settings = app.state.data_store.db.get_settings_by_category(category)
        
        # Provide defaults if no settings found
        if category == "aiModel" and not settings:
            settings = {
                "ai_model_auto_retrain": True,
                "ai_model_min_accuracy": 0.75,
                "ai_model_batch_size": 1000,
                "ai_model_learning_rate": 0.01
            }
        elif category == "routing" and not settings:
            settings = {
                "routing_max_wait_time": 300,
                "routing_priority_weighting": 0.8,
                "routing_tie_break_threshold": 0.03,
                "routing_auto_route": True
            }
        elif category == "dashboard" and not settings:
            settings = {
                "dashboard_refresh_interval": 30,
                "dashboard_show_animations": True,
                "dashboard_theme": "warm",
                "dashboard_compact_mode": False
            }
        
        return {"settings": settings}
        
    except Exception as e:
        print(f"❌ Error getting settings: {str(e)}")
        return {"error": f"Failed to get settings: {str(e)}"}, 500


@app.post("/ai/settings/update")
async def update_ai_settings(settings_data: dict):
    """Update AI model settings"""
    try:
        category = settings_data.get("category", "general")
        settings = settings_data.get("settings", {})
        
        # Validate and save settings based on category
        if category == "aiModel":
            valid_settings = {
                "auto_retrain": settings.get("autoRetrain", True),
                "min_accuracy": max(0.5, min(0.95, settings.get("minAccuracy", 0.75))),
                "batch_size": settings.get("batchSize", 1000),
                "learning_rate": max(0.001, min(0.1, settings.get("learningRate", 0.01)))
            }
            
            # Save each setting to database
            for key, value in valid_settings.items():
                app.state.data_store.db.save_setting(f"ai_model_{key}", value, "aiModel")
                
        elif category == "routing":
            valid_settings = {
                "max_wait_time": max(60, min(1800, settings.get("maxWaitTime", 300))),
                "priority_weighting": max(0.1, min(1.0, settings.get("priorityWeighting", 0.8))),
                "tie_break_threshold": max(0.01, min(0.1, settings.get("tieBreakThreshold", 0.03))),
                "auto_route": settings.get("autoRoute", True)
            }
            
            # Save routing settings
            for key, value in valid_settings.items():
                app.state.data_store.db.save_setting(f"routing_{key}", value, "routing")
                
        elif category == "dashboard":
            valid_settings = {
                "refresh_interval": settings.get("refreshInterval", 30),
                "show_animations": settings.get("showAnimations", True),
                "theme": settings.get("theme", "warm"),
                "compact_mode": settings.get("compactMode", False)
            }
            
            # Save dashboard settings
            for key, value in valid_settings.items():
                app.state.data_store.db.save_setting(f"dashboard_{key}", value, "dashboard")
        
        return {
            "message": f"{category} settings updated successfully",
            "updated_settings": valid_settings,
            "restart_required": False
        }
        
    except Exception as e:
        print(f"❌ Settings update error: {str(e)}")
        return {"error": f"Settings update failed: {str(e)}"}, 500


# Dynamic Data Management
@app.post("/data/generate/customers")
async def generate_new_customers():
    """Generate new dynamic customers"""
    app.state.data_store._create_mock_customers()
    customers = app.state.data_store.get_customers()
    
    return {
        "message": f"Generated {len(customers)} new customers",
        "customers": customers
    }


@app.post("/data/generate/agents")
async def generate_new_agents():
    """Generate new dynamic agents"""
    app.state.data_store._create_mock_agents()
    agents = app.state.data_store.get_agents()
    
    return {
        "message": f"Generated {len(agents)} new agents",
        "agents": agents
    }


@app.post("/agents/{agent_id}/workload")
async def update_agent_workload(agent_id: str, workload_data: dict):
    """Update agent workload dynamically"""
    agent = app.state.data_store.get_agent(agent_id)
    if not agent:
        return {"error": "Agent not found"}, 404
    
    new_workload = workload_data.get("workload", 0)
    if 0 <= new_workload <= agent.max_concurrent:
        agent.current_workload = new_workload
        agent.last_updated = datetime.now()
        
        # Update status based on workload
        if new_workload == 0:
            agent.status = "available"
        elif new_workload >= agent.max_concurrent:
            agent.status = "busy"
        else:
            agent.status = "available"
        
        return {
            "message": "Agent workload updated",
            "agent": agent
        }
    else:
        return {"error": "Invalid workload value"}, 400


@app.post("/routing/{routing_id}/complete")
async def complete_routing_task(routing_id: str):
    """Complete a routing task, generate summary, and free up the agent"""
    try:
        from models.data_models import ConversationSummary
        import random
        
        # Get the routing result
        routing_results = app.state.data_store.get_routing_results()
        routing_result = next((r for r in routing_results if r.id == routing_id), None)
        
        if not routing_result:
            return {"error": "Routing result not found"}, 404
        
        # Get agent details (customer may have been removed from queue)
        agent = app.state.data_store.get_agent(routing_result.agent_id)
        
        if not agent:
            return {"error": "Agent not found"}, 404
        
        # Get customer details from routing result or try to fetch
        customer_name = routing_result.customer_name or "Unknown Customer"
        customer_issue_type = "technical_support"  # Default fallback
        customer_tier = "standard"  # Default fallback
        customer_sentiment = "neutral"  # Default fallback
        customer_channel = "chat"  # Default fallback
        
        # Try to get customer details if still available
        customer = app.state.data_store.get_customer(routing_result.customer_id)
        if customer:
            customer_issue_type = customer.issue_type
            customer_tier = customer.tier
            customer_sentiment = customer.sentiment
            customer_channel = customer.channel
        
        # Generate conversation summary
        duration = random.uniform(5, 25)  # 5-25 minutes
        end_time = datetime.now()
        start_time = routing_result.timestamp
        
        # Generate realistic conversation summary based on issue type
        issue_summaries = {
            "technical_support": {
                "resolution": f"Successfully resolved {customer_issue_type.replace('_', ' ')} issue. Guided customer through troubleshooting steps and verified solution.",
                "key_points": [
                    "Identified root cause of technical issue",
                    "Provided step-by-step resolution guidance",
                    "Verified issue was fully resolved",
                    "Documented solution for future reference"
                ],
                "actions": [
                    "Ran diagnostic tests",
                    "Applied configuration changes",
                    "Tested functionality",
                    "Provided follow-up documentation"
                ]
            },
            "billing": {
                "resolution": f"Addressed billing inquiry and processed necessary adjustments. Customer satisfied with resolution.",
                "key_points": [
                    "Reviewed account billing history",
                    "Explained charges in detail",
                    "Processed refund/adjustment as needed",
                    "Confirmed updated billing information"
                ],
                "actions": [
                    "Reviewed billing statements",
                    "Processed payment adjustment",
                    "Updated payment method",
                    "Sent confirmation email"
                ]
            },
            "account_management": {
                "resolution": f"Updated account settings and preferences per customer request. All changes verified.",
                "key_points": [
                    "Reviewed current account status",
                    "Implemented requested changes",
                    "Verified account security",
                    "Confirmed customer satisfaction"
                ],
                "actions": [
                    "Updated account information",
                    "Modified service preferences",
                    "Verified identity and security",
                    "Sent confirmation notification"
                ]
            },
            "sales": {
                "resolution": f"Provided product information and completed sales inquiry. Customer interested in proceeding.",
                "key_points": [
                    "Discussed product features and benefits",
                    "Addressed customer questions",
                    "Provided pricing information",
                    "Scheduled follow-up if needed"
                ],
                "actions": [
                    "Presented product options",
                    "Provided pricing quotes",
                    "Sent product documentation",
                    "Scheduled demo/follow-up"
                ]
            },
            "product_inquiry": {
                "resolution": f"Answered all product-related questions. Customer has clear understanding of offerings.",
                "key_points": [
                    "Explained product features",
                    "Compared different options",
                    "Addressed compatibility questions",
                    "Provided additional resources"
                ],
                "actions": [
                    "Demonstrated product features",
                    "Shared comparison materials",
                    "Sent product guides",
                    "Offered trial/demo access"
                ]
            },
            "complaint_resolution": {
                "resolution": f"Addressed customer complaint with empathy and professionalism. Issue resolved to satisfaction.",
                "key_points": [
                    "Listened to customer concerns",
                    "Acknowledged the issue",
                    "Provided appropriate resolution",
                    "Ensured customer satisfaction"
                ],
                "actions": [
                    "Documented complaint details",
                    "Escalated to appropriate team",
                    "Implemented resolution",
                    "Followed up on satisfaction"
                ]
            }
        }
        
        summary_data = issue_summaries.get(customer_issue_type, issue_summaries["technical_support"])
        
        conversation_summary = ConversationSummary(
            routing_id=routing_id,
            customer_id=routing_result.customer_id,
            agent_id=agent.id,
            customer_name=customer_name,
            agent_name=agent.name,
            channel=customer_channel,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=round(duration, 1),
            issue_type=customer_issue_type,
            issue_description=f"{customer_tier.capitalize()} tier customer with {customer_sentiment} sentiment regarding {customer_issue_type.replace('_', ' ')}",
            resolution_summary=summary_data["resolution"],
            key_points=summary_data["key_points"],
            actions_taken=summary_data["actions"],
            follow_up_required=random.choice([True, False]),
            follow_up_notes="Schedule follow-up in 3-5 business days" if random.choice([True, False]) else None
        )
        
        # Update routing result
        routing_result.status = 'completed'
        routing_result.conversation_summary = conversation_summary
        routing_result.actual_handling_time = duration
        routing_result.success_outcome = True
        
        # Update routing result status in database
        app.state.data_store.update_routing_result_status(routing_id, 'completed')
        
        # Decrease agent workload
        agent.current_workload = max(0, agent.current_workload - 1)
        
        # Update agent status based on new workload
        if agent.current_workload == 0:
            agent.status = "available"
        elif agent.current_workload < agent.max_concurrent:
            agent.status = "available"
        
        # Update in database
        app.state.data_store.db.update_agent_workload(agent.id, agent.current_workload)
        app.state.data_store.db.update_agent_status(agent.id, agent.status)
        
        return {
            "message": "Task completed successfully",
            "agent": agent,
            "routing_result": routing_result,
            "conversation_summary": conversation_summary,
            "show_feedback_form": True
        }
        
    except Exception as e:
        print(f"❌ Error completing task: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Failed to complete task: {str(e)}"}, 500


@app.post("/routing/{routing_id}/feedback")
async def submit_customer_feedback(routing_id: str, feedback_data: dict):
    """Submit customer feedback for a completed routing"""
    try:
        from models.data_models import CustomerFeedback
        
        # Get the routing result
        routing_results = app.state.data_store.get_routing_results()
        routing_result = next((r for r in routing_results if r.id == routing_id), None)
        
        if not routing_result:
            return {"error": "Routing result not found"}, 404
        
        # Create feedback object
        feedback = CustomerFeedback(
            routing_id=routing_id,
            customer_id=routing_result.customer_id,
            agent_id=routing_result.agent_id,
            satisfaction_score=feedback_data.get("satisfaction_score", 5),
            agent_professionalism=feedback_data.get("agent_professionalism", 5),
            issue_resolution=feedback_data.get("issue_resolution", 5),
            wait_time_satisfaction=feedback_data.get("wait_time_satisfaction", 4),
            would_recommend=feedback_data.get("would_recommend", True),
            comments=feedback_data.get("comments", "")
        )
        
        # Attach feedback to routing result
        routing_result.customer_feedback = feedback
        
        return {
            "message": "Feedback submitted successfully",
            "feedback": feedback
        }
        
    except Exception as e:
        print(f"❌ Error submitting feedback: {str(e)}")
        return {"error": f"Failed to submit feedback: {str(e)}"}, 500


@app.post("/routing/complete-all")
async def complete_all_active_tasks():
    """Complete all active routing tasks (for demo/testing)"""
    try:
        routing_results = app.state.data_store.get_routing_results()
        completed_count = 0
        
        for result in routing_results:
            if result.status == 'active':
                result.status = 'completed'
                
                # Update routing result status in database
                app.state.data_store.update_routing_result_status(result.id, 'completed')
                
                # Free up the agent
                agent = app.state.data_store.get_agent(result.agent_id)
                if agent:
                    agent.current_workload = max(0, agent.current_workload - 1)
                    
                    if agent.current_workload == 0:
                        agent.status = "available"
                    
                    app.state.data_store.db.update_agent_workload(agent.id, agent.current_workload)
                    app.state.data_store.db.update_agent_status(agent.id, agent.status)
                
                completed_count += 1
        
        return {
            "message": f"Completed {completed_count} tasks",
            "completed_count": completed_count
        }
        
    except Exception as e:
        print(f"❌ Error completing all tasks: {str(e)}")
        return {"error": f"Failed to complete tasks: {str(e)}"}, 500


@app.post("/conversation/{routing_id}/send-sms-alert")
async def send_sms_alert(routing_id: str, alert_data: dict):
    """Send SMS alert to customer about conversation time limit"""
    try:
        # Get the routing result
        routing_results = app.state.data_store.get_routing_results()
        routing_result = next((r for r in routing_results if r.id == routing_id), None)
        
        if not routing_result:
            return {"error": "Routing result not found"}, 404
        
        # Get customer details
        customer_name = routing_result.customer_name or "Customer"
        agent_name = routing_result.agent_name or "Agent"
        alert_type = alert_data.get("type", "warning")  # 'warning' or 'expired'
        
        # Simulate SMS sending (in real implementation, integrate with SMS service like Twilio)
        sms_message = ""
        if alert_type == "warning":
            sms_message = f"Hi {customer_name}, your conversation with {agent_name} has 2 minutes remaining. Please wrap up your discussion. - Smart Queue System"
        else:
            sms_message = f"Hi {customer_name}, your 10-minute conversation limit with {agent_name} has been reached. Please end the conversation. - Smart Queue System"
        
        # Log SMS for demo (in production, send actual SMS)
        print(f"📱 SMS Alert Sent:")
        print(f"   To: Customer {customer_name}")
        print(f"   Message: {sms_message}")
        print(f"   Type: {alert_type}")
        
        # Store SMS log in routing result
        if not hasattr(routing_result, 'sms_alerts'):
            routing_result.sms_alerts = []
        
        routing_result.sms_alerts.append({
            "type": alert_type,
            "message": sms_message,
            "sent_at": datetime.now().isoformat(),
            "status": "sent"
        })
        
        return {
            "message": "SMS alert sent successfully",
            "sms_message": sms_message,
            "alert_type": alert_type,
            "customer_name": customer_name
        }
        
    except Exception as e:
        print(f"❌ Error sending SMS alert: {str(e)}")
        return {"error": f"Failed to send SMS alert: {str(e)}"}, 500


@app.get("/conversation/{routing_id}/time-status")
async def get_conversation_time_status(routing_id: str):
    """Get conversation time status and check if limits are exceeded"""
    try:
        # Get the routing result
        routing_results = app.state.data_store.get_routing_results()
        routing_result = next((r for r in routing_results if r.id == routing_id), None)
        
        if not routing_result:
            return {"error": "Routing result not found"}, 404
        
        # Calculate time elapsed from routing result timestamp
        start_time = routing_result.timestamp
        current_time = datetime.now()
        
        # Handle different timestamp formats
        if isinstance(start_time, str):
            try:
                # Try parsing ISO format with timezone
                start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            except:
                try:
                    # Try parsing without timezone
                    start_time = datetime.fromisoformat(start_time)
                except:
                    # Fallback to current time (new conversation)
                    start_time = current_time
        
        # For demo purposes, if conversation is very old, reset to current time
        time_elapsed = (current_time - start_time).total_seconds()
        if time_elapsed > 24 * 60 * 60:  # If older than 24 hours, treat as new
            start_time = current_time
            time_elapsed = 0
        time_limit = 10 * 60  # 10 minutes
        time_remaining = max(0, time_limit - time_elapsed)
        
        # Determine status
        status = "active"
        if time_elapsed >= time_limit:
            status = "expired"
        elif time_elapsed >= 8 * 60:  # 8 minutes - warning threshold
            status = "warning"
        
        return {
            "routing_id": routing_id,
            "time_elapsed": int(time_elapsed),
            "time_remaining": int(time_remaining),
            "time_limit": time_limit,
            "status": status,
            "customer_name": routing_result.customer_name,
            "agent_name": routing_result.agent_name,
            "percentage_used": min(100, (time_elapsed / time_limit) * 100)
        }
        
    except Exception as e:
        print(f"❌ Error getting conversation time status: {str(e)}")
        return {"error": f"Failed to get time status: {str(e)}"}, 500


@app.post("/conversation/{routing_id}/extend-time")
async def extend_conversation_time(routing_id: str, extension_data: dict):
    """Extend conversation time (admin override)"""
    try:
        # Get the routing result
        routing_results = app.state.data_store.get_routing_results()
        routing_result = next((r for r in routing_results if r.id == routing_id), None)
        
        if not routing_result:
            return {"error": "Routing result not found"}, 404
        
        extension_minutes = extension_data.get("extension_minutes", 5)
        reason = extension_data.get("reason", "Admin override")
        
        # Store extension info
        if not hasattr(routing_result, 'time_extensions'):
            routing_result.time_extensions = []
        
        routing_result.time_extensions.append({
            "extension_minutes": extension_minutes,
            "reason": reason,
            "granted_at": datetime.now().isoformat(),
            "granted_by": "admin"
        })
        
        print(f"⏰ Time extension granted:")
        print(f"   Routing ID: {routing_id}")
        print(f"   Extension: {extension_minutes} minutes")
        print(f"   Reason: {reason}")
        
        return {
            "message": f"Conversation time extended by {extension_minutes} minutes",
            "extension_minutes": extension_minutes,
            "reason": reason,
            "new_limit_minutes": 10 + extension_minutes
        }
        
    except Exception as e:
        print(f"❌ Error extending conversation time: {str(e)}")
        return {"error": f"Failed to extend time: {str(e)}"}, 500
        
    except Exception as e:
        print(f"❌ Error completing tasks: {str(e)}")
        return {"error": f"Failed to complete tasks: {str(e)}"}, 500