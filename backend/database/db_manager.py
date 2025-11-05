"""
SQLite Database Manager for AI Smart Queue Routing System
Handles customer data persistence and retrieval
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from contextlib import contextmanager
from models.data_models import Customer, Agent, RoutingResult


class DatabaseManager:
    """Manages SQLite database operations for the routing system"""
    
    def __init__(self, db_path: str = "backend/database/sqrs.db"):
        self.db_path = db_path
        self.ensure_database_exists()
        self.init_tables()
    
    def ensure_database_exists(self):
        """Ensure database directory exists"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections with optimizations"""
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row  # Enable dict-like access
        # Enable WAL mode for better concurrent access
        conn.execute('PRAGMA journal_mode=WAL')
        # Optimize for speed
        conn.execute('PRAGMA synchronous=NORMAL')
        conn.execute('PRAGMA cache_size=10000')
        conn.execute('PRAGMA temp_store=MEMORY')
        try:
            yield conn
        finally:
            conn.close()
    
    def init_tables(self):
        """Initialize database tables"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Customers table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS customers (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    sentiment TEXT NOT NULL,
                    tier TEXT NOT NULL,
                    issue_type TEXT NOT NULL,
                    channel TEXT NOT NULL,
                    priority INTEGER NOT NULL,
                    issue_complexity REAL NOT NULL,
                    wait_time INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'waiting'
                )
            ''')
            
            # Agents table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS agents (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    specialty TEXT NOT NULL,  -- JSON array
                    experience REAL NOT NULL,
                    past_success_rate REAL NOT NULL,
                    avg_handling_time REAL NOT NULL,
                    current_workload INTEGER DEFAULT 0,
                    max_concurrent INTEGER NOT NULL,
                    status TEXT DEFAULT 'available',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Routing results table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS routing_results (
                    id TEXT PRIMARY KEY,
                    customer_id TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    routing_score REAL NOT NULL,
                    reasoning TEXT,  -- JSON array
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP NULL,
                    FOREIGN KEY (customer_id) REFERENCES customers (id),
                    FOREIGN KEY (agent_id) REFERENCES agents (id)
                )
            ''')
            
            # System settings table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS system_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    category TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create indexes for faster queries
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_customers_status 
                ON customers(status)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_agents_status 
                ON agents(status)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_routing_customer 
                ON routing_results(customer_id)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_routing_agent 
                ON routing_results(agent_id)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_routing_status 
                ON routing_results(status)
            ''')
            
            conn.commit()
            print("✅ Database tables and indexes initialized successfully")
    
    # Customer operations
    def add_customer(self, customer: Customer) -> bool:
        """Add a new customer to the database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO customers (
                        id, name, sentiment, tier, issue_type, channel, 
                        priority, issue_complexity, wait_time, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    customer.id, customer.name, customer.sentiment, customer.tier,
                    customer.issue_type, customer.channel, customer.priority,
                    customer.issue_complexity, customer.wait_time, 'waiting'
                ))
                # Don't commit immediately for better performance
                # conn.commit() will happen when context manager exits
                return True
        except Exception as e:
            print(f"❌ Error adding customer: {e}")
            return False
    
    def get_customers(self, status: str = 'waiting') -> List[Customer]:
        """Get all customers with specified status"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT * FROM customers WHERE status = ? ORDER BY created_at ASC
                ''', (status,))
                
                customers = []
                for row in cursor.fetchall():
                    customer = Customer(
                        id=row['id'],
                        name=row['name'],
                        sentiment=row['sentiment'],
                        tier=row['tier'],
                        issue_type=row['issue_type'],
                        channel=row['channel'],
                        priority=row['priority'],
                        issue_complexity=float(row['issue_complexity']),
                        wait_time=int(row['wait_time'])
                    )
                    customers.append(customer)
                
                return customers
        except Exception as e:
            print(f"❌ Error getting customers: {e}")
            return []
    
    def get_customer(self, customer_id: str) -> Optional[Customer]:
        """Get a specific customer by ID"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM customers WHERE id = ?', (customer_id,))
                row = cursor.fetchone()
                
                if row:
                    return Customer(
                        id=row['id'],
                        name=row['name'],
                        sentiment=row['sentiment'],
                        tier=row['tier'],
                        issue_type=row['issue_type'],
                        channel=row['channel'],
                        priority=row['priority'],
                        issue_complexity=float(row['issue_complexity']),
                        wait_time=int(row['wait_time'])
                    )
                return None
        except Exception as e:
            print(f"❌ Error getting customer: {e}")
            return None
    
    def update_customer_status(self, customer_id: str, status: str) -> bool:
        """Update customer status"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE customers SET status = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ''', (status, customer_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"❌ Error updating customer status: {e}")
            return False
    
    def remove_customer(self, customer_id: str) -> bool:
        """Remove customer from database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM customers WHERE id = ?', (customer_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"❌ Error removing customer: {e}")
            return False
    
    def update_wait_times(self):
        """Update wait times for all waiting customers"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE customers 
                    SET wait_time = (
                        (julianday('now') - julianday(created_at)) * 24 * 60 * 60
                    )
                    WHERE status = 'waiting'
                ''')
                conn.commit()
        except Exception as e:
            print(f"❌ Error updating wait times: {e}")
    
    # Agent operations
    def add_agent(self, agent: Agent) -> bool:
        """Add a new agent to the database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO agents (
                        id, name, specialty, experience, past_success_rate,
                        avg_handling_time, current_workload, max_concurrent, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    agent.id, agent.name, json.dumps(agent.specialty), agent.experience,
                    agent.past_success_rate, agent.avg_handling_time, agent.current_workload,
                    agent.max_concurrent, agent.status
                ))
                conn.commit()
                return True
        except Exception as e:
            print(f"❌ Error adding agent: {e}")
            return False
    
    def get_agents(self) -> List[Agent]:
        """Get all agents"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM agents ORDER BY name ASC')
                
                agents = []
                for row in cursor.fetchall():
                    agent = Agent(
                        id=row['id'],
                        name=row['name'],
                        specialty=json.loads(row['specialty']),
                        experience=row['experience'],
                        past_success_rate=row['past_success_rate'],
                        avg_handling_time=row['avg_handling_time'],
                        current_workload=row['current_workload'],
                        max_concurrent=row['max_concurrent'],
                        status=row['status']
                    )
                    agents.append(agent)
                
                return agents
        except Exception as e:
            print(f"❌ Error getting agents: {e}")
            return []
    
    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get a specific agent by ID"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM agents WHERE id = ?', (agent_id,))
                row = cursor.fetchone()
                
                if row:
                    return Agent(
                        id=row['id'],
                        name=row['name'],
                        specialty=json.loads(row['specialty']),
                        experience=row['experience'],
                        past_success_rate=row['past_success_rate'],
                        avg_handling_time=row['avg_handling_time'],
                        current_workload=row['current_workload'],
                        max_concurrent=row['max_concurrent'],
                        status=row['status']
                    )
                return None
        except Exception as e:
            print(f"❌ Error getting agent: {e}")
            return None
    
    def update_agent_status(self, agent_id: str, status: str) -> bool:
        """Update agent status"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE agents SET status = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ''', (status, agent_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"❌ Error updating agent status: {e}")
            return False
    
    def update_agent_workload(self, agent_id: str, workload: int) -> bool:
        """Update agent workload"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE agents SET current_workload = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ''', (workload, agent_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"❌ Error updating agent workload: {e}")
            return False
    
    # Routing results operations
    def add_routing_result(self, result: RoutingResult) -> bool:
        """Add a routing result to the database"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO routing_results (
                        id, customer_id, agent_id, routing_score, reasoning, status
                    ) VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    result.id, result.customer_id, result.agent_id,
                    result.routing_score, json.dumps(result.reasoning), result.status
                ))
                conn.commit()
                return True
        except Exception as e:
            print(f"❌ Error adding routing result: {e}")
            return False
    
    def get_routing_results(self) -> List[RoutingResult]:
        """Get all routing results"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT * FROM routing_results ORDER BY created_at DESC LIMIT 50
                ''')
                
                results = []
                for row in cursor.fetchall():
                    result = RoutingResult(
                        id=row['id'],
                        customer_id=row['customer_id'],
                        agent_id=row['agent_id'],
                        routing_score=row['routing_score'],
                        reasoning=json.loads(row['reasoning']),
                        status=row['status'],
                        timestamp=datetime.fromisoformat(row['created_at'])
                    )
                    results.append(result)
                
                return results
        except Exception as e:
            print(f"❌ Error getting routing results: {e}")
            return []
    
    def clear_routing_results(self) -> bool:
        """Clear all routing results"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM routing_results')
                conn.commit()
                return True
        except Exception as e:
            print(f"❌ Error clearing routing results: {e}")
            return False
    
    # System settings operations
    def save_setting(self, key: str, value: Any, category: str = 'general') -> bool:
        """Save a system setting"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO system_settings (key, value, category, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ''', (key, json.dumps(value), category))
                conn.commit()
                return True
        except Exception as e:
            print(f"❌ Error saving setting: {e}")
            return False
    
    def get_setting(self, key: str, default_value: Any = None) -> Any:
        """Get a system setting"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT value FROM system_settings WHERE key = ?', (key,))
                row = cursor.fetchone()
                
                if row:
                    return json.loads(row['value'])
                return default_value
        except Exception as e:
            print(f"❌ Error getting setting: {e}")
            return default_value
    
    def get_settings_by_category(self, category: str) -> Dict[str, Any]:
        """Get all settings in a category"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT key, value FROM system_settings WHERE category = ?
                ''', (category,))
                
                settings = {}
                for row in cursor.fetchall():
                    settings[row['key']] = json.loads(row['value'])
                
                return settings
        except Exception as e:
            print(f"❌ Error getting settings by category: {e}")
            return {}
    
    # Database maintenance
    def reset_database(self):
        """Reset all data (for demo purposes)"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM customers')
                cursor.execute('DELETE FROM routing_results')
                cursor.execute('UPDATE agents SET current_workload = 0, status = "available"')
                conn.commit()
                print("✅ Database reset successfully")
        except Exception as e:
            print(f"❌ Error resetting database: {e}")
    
    def get_database_stats(self) -> Dict[str, int]:
        """Get database statistics"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                stats = {}
                
                # Count customers
                cursor.execute('SELECT COUNT(*) FROM customers WHERE status = "waiting"')
                stats['customers_waiting'] = cursor.fetchone()[0]
                
                # Count agents
                cursor.execute('SELECT COUNT(*) FROM agents WHERE status = "available"')
                stats['agents_available'] = cursor.fetchone()[0]
                
                cursor.execute('SELECT COUNT(*) FROM agents')
                stats['total_agents'] = cursor.fetchone()[0]
                
                # Count routing results
                cursor.execute('SELECT COUNT(*) FROM routing_results')
                stats['total_routings'] = cursor.fetchone()[0]
                
                return stats
        except Exception as e:
            print(f"❌ Error getting database stats: {e}")
            return {}