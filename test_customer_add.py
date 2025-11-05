#!/usr/bin/env python3
"""
Quick test to verify customer addition works
"""

import requests
import json

def test_add_customer():
    """Test adding a customer"""
    print("🧪 Testing Customer Addition...")
    
    # Test customer data
    customer_data = {
        "name": "Test Customer",
        "sentiment": "positive",
        "tier": "premium",
        "issue_type": "technical_support",
        "channel": "phone",
        "priority": 8,
        "issue_complexity": 3.5
    }
    
    try:
        # Add customer
        print(f"📤 Sending customer data: {customer_data['name']}")
        response = requests.post(
            "http://localhost:8000/customers",
            json=customer_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Customer added successfully!")
            print(f"   ID: {data['customer']['id']}")
            print(f"   Name: {data['customer']['name']}")
            print(f"   Message: {data['message']}")
            
            # Verify customer is in queue
            print("\n🔍 Checking customer queue...")
            queue_response = requests.get("http://localhost:8000/customers")
            queue_data = queue_response.json()
            
            print(f"📊 Customers in queue: {queue_data['count']}")
            
            # Find our customer
            found = False
            for customer in queue_data['customers']:
                if customer['name'] == customer_data['name']:
                    found = True
                    print(f"✅ Customer found in queue!")
                    print(f"   ID: {customer['id']}")
                    print(f"   Wait time: {customer['wait_time']}s")
                    break
            
            if not found:
                print(f"❌ Customer NOT found in queue!")
                print(f"   Queue contents: {[c['name'] for c in queue_data['customers']]}")
            
        else:
            print(f"❌ Failed to add customer")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_add_customer()
