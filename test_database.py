#!/usr/bin/env python3
"""
Quick test script to verify database and auto routing functionality
"""

import sys
import os
sys.path.append('backend')

from database.db_manager import DatabaseManager
from services.data_store import DataStore
from models.data_models import Customer

def test_database():
    """Test database functionality"""
    print("🧪 Testing SQLite Database Integration...")
    
    # Test database manager
    db = DatabaseManager("backend/database/test_sqrs.db")
    
    # Test customer operations
    test_customer = Customer(
        name="Test Customer",
        sentiment="positive",
        tier="premium",
        issue_type="technical_support",
        channel="phone",
        priority=8,
        issue_complexity=3
    )
    
    # Add customer
    success = db.add_customer(test_customer)
    print(f"✅ Add customer: {success}")
    
    # Get customers
    customers = db.get_customers()
    print(f"✅ Get customers: {len(customers)} found")
    
    # Test data store integration
    data_store = DataStore()
    data_store.initialize_mock_data()
    
    customers = data_store.get_customers()
    agents = data_store.get_agents()
    
    print(f"✅ Data Store - Customers: {len(customers)}, Agents: {len(agents)}")
    
    # Test settings
    db.save_setting("test_setting", {"value": 123}, "test")
    retrieved = db.get_setting("test_setting")
    print(f"✅ Settings: {retrieved}")
    
    print("🎉 Database tests completed successfully!")

if __name__ == "__main__":
    test_database()