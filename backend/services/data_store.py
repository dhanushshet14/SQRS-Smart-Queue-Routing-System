"""
SQLite-backed data store for the AI Smart Queue Routing System
Manages customers, agents, and routing results with persistent storage
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
from models.data_models import Customer, Agent, RoutingResult
from database.db_manager import DatabaseManager


class DataStore:
    """SQLite-backed data store with fallback in-memory storage"""
    
    def __init__(self):
        self.db = DatabaseManager()
        # Fallback in-memory storage
        self.customers: Dict[str, Customer] = {}
        self.agents: Dict[str, Agent] = {}
        self.routing_results: Dict[str, RoutingResult] = {}
        self.analytics_history: List[Dict] = []
    
    def initialize_mock_data(self):
        """Initialize with realistic mock data for demo"""
        # Clean up any invalid data first
        self._cleanup_invalid_data()
        
        # Check if we already have data in database
        existing_agents = self.db.get_agents()
        existing_customers = self.db.get_customers()
        
        if not existing_agents:
            self._create_mock_agents()
        else:
            # Load agents into memory for quick access
            for agent in existing_agents:
                self.agents[agent.id] = agent
        
        if not existing_customers:
            self._create_mock_customers()
        else:
            # Load customers into memory for quick access
            try:
                for customer in existing_customers:
                    # Validate customer data before loading
                    if hasattr(customer, 'issue_complexity') and customer.issue_complexity >= 1.0:
                        self.customers[customer.id] = customer
            except Exception as e:
                print(f"⚠️ Skipping invalid customer data: {e}")
                # Create fresh mock data if existing data is invalid
                self._create_mock_customers()
    
    def _cleanup_invalid_data(self):
        """Clean up any invalid data in the database"""
        try:
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                # Remove customers with invalid issue_complexity
                cursor.execute("DELETE FROM customers WHERE issue_complexity < 1.0 OR issue_complexity > 5.0")
                # Remove customers with invalid priority
                cursor.execute("DELETE FROM customers WHERE priority < 1 OR priority > 10")
                conn.commit()
                print("✅ Database cleanup completed")
        except Exception as e:
            print(f"⚠️ Database cleanup failed: {e}")
    
    def _create_mock_agents(self):
        """Create dynamic mock agents with different specialties"""
        import random
        
        # Dynamic agent names and profiles
        agent_profiles = [
            {
                "name": "Sarah Chen",
                "specialty": ["technical_support", "billing"],
                "base_experience": 3.5,
                "personality": "analytical"
            },
            {
                "name": "Marcus Johnson", 
                "specialty": ["sales", "account_management"],
                "base_experience": 5.2,
                "personality": "persuasive"
            },
            {
                "name": "Elena Rodriguez",
                "specialty": ["technical_support", "product_inquiry"],
                "base_experience": 2.8,
                "personality": "patient"
            },
            {
                "name": "David Kim",
                "specialty": ["billing", "account_management"],
                "base_experience": 4.1,
                "personality": "detail-oriented"
            },
            {
                "name": "Aisha Patel",
                "specialty": ["product_inquiry", "sales"],
                "base_experience": 1.9,
                "personality": "enthusiastic"
            },
            {
                "name": "Alex Thompson",
                "specialty": ["complaint_resolution", "account_management"],
                "base_experience": 6.3,
                "personality": "empathetic"
            },
            {
                "name": "Jordan Lee",
                "specialty": ["technical_support", "complaint_resolution"],
                "base_experience": 3.7,
                "personality": "problem-solver"
            },
            {
                "name": "Taylor Morgan",
                "specialty": ["sales", "product_inquiry"],
                "base_experience": 2.4,
                "personality": "energetic"
            },
            {
                "name": "Rachel Green",
                "specialty": ["billing", "complaint_resolution"],
                "base_experience": 4.8,
                "personality": "diplomatic"
            },
            {
                "name": "Michael Scott",
                "specialty": ["sales", "account_management"],
                "base_experience": 7.2,
                "personality": "charismatic"
            },
            {
                "name": "Priya Sharma",
                "specialty": ["technical_support", "product_inquiry"],
                "base_experience": 3.1,
                "personality": "methodical"
            },
            {
                "name": "James Wilson",
                "specialty": ["complaint_resolution", "billing"],
                "base_experience": 5.5,
                "personality": "calm"
            }
        ]
        
        # Ensure unique agent names - randomly select 5-7 agents to be active
        num_agents = random.randint(5, 7)
        selected_agents = random.sample(agent_profiles, num_agents)
        
        # Track used names to ensure uniqueness
        used_names = set()
        
        mock_agents = []
        
        for agent_profile in selected_agents:
            # Add some variation to experience
            experience_variation = random.uniform(-0.5, 1.0)
            experience = max(0.5, agent_profile["base_experience"] + experience_variation)
            
            # Generate dynamic performance metrics
            base_success = 0.75 + (experience / 10)  # Experience improves success rate
            success_variation = random.uniform(-0.1, 0.15)
            past_success_rate = max(0.6, min(0.98, base_success + success_variation))
            
            # Generate handling time based on experience
            base_handling_time = 15 - (experience * 1.5)  # More experienced = faster
            handling_variation = random.uniform(-2, 4)
            avg_handling_time = max(5, base_handling_time + handling_variation)
            
            # Random status
            status = random.choices(
                ["available", "busy", "offline"],
                weights=[0.6, 0.3, 0.1]
            )[0]
            
            # Current workload
            if status == "available":
                current_workload = random.randint(0, 1)
            elif status == "busy":
                current_workload = random.randint(2, 3)
            else:
                current_workload = 0
            
            # Generate skills based on specialty
            skills = {}
            for specialty in agent_profile["specialty"]:
                base_skill = 0.7 + (experience / 15)
                skill_variation = random.uniform(-0.1, 0.2)
                skills[specialty] = max(0.5, min(1.0, base_skill + skill_variation))
            
            # Add general customer service skill
            skills["customer_service"] = max(0.6, min(0.95, past_success_rate + random.uniform(-0.1, 0.1)))
            
            agent_data = {
                "name": agent_profile["name"],
                "specialty": agent_profile["specialty"],
                "experience": round(experience, 1),
                "avg_handling_time": round(avg_handling_time, 1),
                "past_success_rate": round(past_success_rate, 2),
                "status": status,
                "current_workload": current_workload,
                "skills": {k: round(v, 2) for k, v in skills.items()},
                "personality": agent_profile["personality"]
            }
            
            mock_agents.append(agent_data)
        
        for agent_data in mock_agents:
            agent = Agent(
                name=agent_data["name"],
                specialty=agent_data["specialty"],
                experience=agent_data["experience"],
                avg_handling_time=agent_data["avg_handling_time"],
                past_success_rate=agent_data["past_success_rate"],
                current_workload=agent_data.get("current_workload", 0),
                max_concurrent=3,
                status=agent_data["status"],
                skills=agent_data["skills"]
            )
            # Save to database
            self.db.add_agent(agent)
            self.agents[agent.id] = agent
    
    def _create_mock_customers(self):
        """Create dynamic mock customers in queue"""
        import random
        from datetime import datetime, timedelta
        
        # Dynamic customer names
        first_names = ["John", "Lisa", "Robert", "Maria", "David", "Sarah", "Michael", "Jennifer", 
                      "James", "Emily", "William", "Jessica", "Richard", "Ashley", "Thomas", "Amanda"]
        last_names = ["Smith", "Wang", "Brown", "Garcia", "Johnson", "Chen", "Williams", "Davis",
                     "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Jackson", "White", "Harris"]
        
        # Dynamic issue types and descriptions
        issue_scenarios = {
            "technical_support": [
                "Can't log into account - getting error messages",
                "App keeps crashing during use",
                "Website not loading properly",
                "Password reset not working",
                "System showing incorrect data"
            ],
            "billing": [
                "Incorrect charge on statement",
                "Payment method needs updating", 
                "Invoice discrepancy question",
                "Subscription billing issue",
                "Refund request processing"
            ],
            "account_management": [
                "Need to update account details",
                "Want to change subscription plan",
                "Account verification problems",
                "Profile information update",
                "Account security concerns"
            ],
            "product_inquiry": [
                "Questions about new features",
                "Product comparison information",
                "Service capabilities inquiry",
                "Pricing plan details",
                "Feature availability timeline"
            ],
            "sales": [
                "Interested in premium upgrade",
                "Enterprise solution inquiry",
                "Bulk pricing information",
                "Custom package options",
                "Competitor comparison"
            ],
            "complaint_resolution": [
                "Service quality concerns",
                "Unsatisfied with support",
                "System downtime issues",
                "Feature not working as expected",
                "Response time complaints"
            ]
        }
        
        # Generate 3-6 random customers
        num_customers = random.randint(3, 6)
        mock_customers = []
        
        for i in range(num_customers):
            issue_type = random.choice(list(issue_scenarios.keys()))
            issue_description = random.choice(issue_scenarios[issue_type])
            
            # Generate realistic customer data
            customer_data = {
                "name": f"{random.choice(first_names)} {random.choice(last_names)}",
                "sentiment": random.choices(
                    ["negative", "neutral", "positive"], 
                    weights=[0.3, 0.4, 0.3]
                )[0],
                "tier": random.choices(
                    ["basic", "standard", "premium"], 
                    weights=[0.4, 0.4, 0.2]
                )[0],
                "issue_type": issue_type,
                "issue_complexity": round(random.uniform(1.0, 5.0), 1),
                "channel": random.choices(["chat", "voice"], weights=[0.7, 0.3])[0],
                "priority": random.randint(1, 10),
                "wait_time": random.randint(30, 600),  # 30 seconds to 10 minutes
                "context": {
                    "description": issue_description,
                    "previous_contacts": random.randint(0, 3),
                    "estimated_resolution_time": random.randint(5, 30)
                }
            }
            
            mock_customers.append(customer_data)
        
        for customer_data in mock_customers:
            customer = Customer(
                name=customer_data["name"],
                sentiment=customer_data["sentiment"],
                tier=customer_data["tier"],
                issue_type=customer_data["issue_type"],
                issue_complexity=customer_data["issue_complexity"],
                channel=customer_data["channel"],
                priority=customer_data["priority"],
                wait_time=customer_data["wait_time"],
                created_at=datetime.now() - timedelta(seconds=customer_data["wait_time"])
            )
            # Save to database
            self.db.add_customer(customer)
            self.customers[customer.id] = customer
    
    # Customer operations
    def get_customers(self) -> List[Customer]:
        """Get all customers in queue"""
        try:
            # Try to get from database first
            db_customers = self.db.get_customers('waiting')
            
            # Also include in-memory customers that might not be in DB yet
            all_customers = {}
            
            # Add database customers with validation
            for customer in db_customers:
                # Fix any invalid issue_complexity values
                if hasattr(customer, 'issue_complexity') and customer.issue_complexity < 1.0:
                    customer.issue_complexity = max(1.0, customer.issue_complexity * 5.0)
                all_customers[customer.id] = customer
            
            # Add in-memory customers
            for customer_id, customer in self.customers.items():
                if customer_id not in all_customers:
                    all_customers[customer_id] = customer
            
            # Update memory cache
            self.customers.update(all_customers)
            
            return list(all_customers.values())
        except Exception as e:
            print(f"❌ Error getting customers: {e}")
            # Return only in-memory customers if database fails
            return list(self.customers.values())
    
    def get_customer(self, customer_id: str) -> Optional[Customer]:
        """Get specific customer by ID"""
        # Try database first
        db_customer = self.db.get_customer(customer_id)
        if db_customer:
            self.customers[customer_id] = db_customer
            return db_customer
        return self.customers.get(customer_id)
    
    def add_customer(self, customer: Customer) -> Customer:
        """Add new customer to queue"""
        # Add to memory immediately for fast response
        self.customers[customer.id] = customer
        
        # Save to database asynchronously (non-blocking)
        try:
            self.db.add_customer(customer)
        except Exception as e:
            print(f"⚠️ Database save failed (customer in memory): {e}")
        
        return customer
    
    def remove_customer(self, customer_id: str) -> bool:
        """Remove customer from queue"""
        # Remove from database
        db_success = self.db.remove_customer(customer_id)
        
        # Remove from memory
        if customer_id in self.customers:
            del self.customers[customer_id]
            return True
        
        return db_success
    
    # Agent operations
    def get_agents(self) -> List[Agent]:
        """Get all agents"""
        # Try to get from database first
        db_agents = self.db.get_agents()
        if db_agents:
            # Update memory cache
            for agent in db_agents:
                self.agents[agent.id] = agent
            return db_agents
        return list(self.agents.values())
    
    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get specific agent by ID"""
        # Try database first
        db_agent = self.db.get_agent(agent_id)
        if db_agent:
            self.agents[agent_id] = db_agent
            return db_agent
        return self.agents.get(agent_id)
    
    def update_agent_status(self, agent_id: str, status: str) -> Optional[Agent]:
        """Update agent status"""
        # Update in database
        self.db.update_agent_status(agent_id, status)
        
        # Update in memory
        if agent_id in self.agents:
            self.agents[agent_id].status = status
            self.agents[agent_id].last_updated = datetime.now()
            return self.agents[agent_id]
        return None
    
    def get_available_agents(self) -> List[Agent]:
        """Get agents available for routing"""
        agents = self.get_agents()  # This will get from database
        return [agent for agent in agents 
                if agent.status == "available" and agent.current_workload < agent.max_concurrent]
    
    # Routing results operations
    def add_routing_result(self, result: RoutingResult) -> RoutingResult:
        """Add routing result"""
        self.routing_results[result.id] = result
        return result
    
    def get_routing_results(self) -> List[RoutingResult]:
        """Get all routing results"""
        return list(self.routing_results.values())
    
    def clear_routing_results(self):
        """Clear all routing results (for reset)"""
        self.routing_results.clear()
    
    def update_wait_times(self):
        """Update customer wait times (called periodically)"""
        # Update wait times in database
        self.db.update_wait_times()
        
        # Update in-memory cache
        current_time = datetime.now()
        for customer in self.customers.values():
            customer.wait_time = int((current_time - customer.created_at).total_seconds())