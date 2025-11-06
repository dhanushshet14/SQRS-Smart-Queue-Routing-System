#!/usr/bin/env python3
"""
Test script to verify auto routing functionality
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_auto_routing():
    """Test the auto routing functionality"""
    print("🧪 Testing Auto Routing Functionality")
    print("=" * 50)
    
    try:
        # 1. Check current customers
        print("1️⃣ Checking current customers...")
        customers_response = requests.get(f"{BASE_URL}/customers")
        if customers_response.status_code == 200:
            customers_data = customers_response.json()
            print(f"   📊 Raw customers response: {type(customers_data)}")
            
            # Handle different response formats
            if isinstance(customers_data, dict) and 'customers' in customers_data:
                customers = customers_data['customers']
            elif isinstance(customers_data, list):
                customers = customers_data
            else:
                customers = []
            
            print(f"   📊 Found {len(customers)} customers in queue")
            for i, customer in enumerate(customers[:3]):
                print(f"      {i+1}. {customer['name']} - {customer['issue_type']} (Priority: {customer['priority']})")
        else:
            print(f"   ❌ Failed to get customers: {customers_response.status_code}")
            return
        
        # 2. Check available agents
        print("\n2️⃣ Checking available agents...")
        agents_response = requests.get(f"{BASE_URL}/agents")
        if agents_response.status_code == 200:
            agents_data = agents_response.json()
            print(f"   👥 Raw agents response: {type(agents_data)}")
            
            # Handle different response formats
            if isinstance(agents_data, dict) and 'agents' in agents_data:
                agents = agents_data['agents']
                available_count = agents_data.get('available_count', 0)
            elif isinstance(agents_data, list):
                agents = agents_data
                available_count = len([a for a in agents if a['status'] == 'available'])
            else:
                agents = []
                available_count = 0
            
            print(f"   👥 Found {len(agents)} total agents, {available_count} available")
            
            available_agents = [a for a in agents if a['status'] == 'available' and a['current_workload'] < a['max_concurrent']]
            for i, agent in enumerate(available_agents[:3]):
                print(f"      {i+1}. {agent['name']} - {agent['specialty']} (Workload: {agent['current_workload']}/{agent['max_concurrent']})")
        else:
            print(f"   ❌ Failed to get agents: {agents_response.status_code}")
            return
        
        # 3. Check current routing results
        print("\n3️⃣ Checking current routing results...")
        routing_response = requests.get(f"{BASE_URL}/routing/results")
        if routing_response.status_code == 200:
            routing_data = routing_response.json()
            routing_results = routing_data.get('results', [])
            print(f"   🎯 Found {len(routing_results)} existing routing results")
            active_results = [r for r in routing_results if r['status'] == 'active']
            print(f"   🔄 {len(active_results)} active routing tasks")
        else:
            print(f"   ❌ Failed to get routing results: {routing_response.status_code}")
        
        # 4. Perform auto routing
        print("\n4️⃣ Performing auto routing...")
        if len(customers) == 0:
            print("   ⚠️ No customers to route, adding a test customer first...")
            
            # Add a test customer
            test_customer = {
                "name": "Test Customer Auto Route",
                "sentiment": "neutral",
                "tier": "standard", 
                "issue_type": "technical_support",
                "issue_complexity": 3,
                "channel": "phone",
                "priority": 5,
                "context": {"description": "Test customer for auto routing"}
            }
            
            add_response = requests.post(f"{BASE_URL}/customers", json=test_customer)
            if add_response.status_code == 200:
                print("   ✅ Test customer added successfully")
            else:
                print(f"   ❌ Failed to add test customer: {add_response.status_code}")
                return
        
        # Now perform auto routing
        route_response = requests.post(f"{BASE_URL}/route")
        if route_response.status_code == 200:
            route_data = route_response.json()
            results = route_data.get('results', [])
            message = route_data.get('message', '')
            
            print(f"   ✅ Auto routing successful!")
            print(f"   📝 Message: {message}")
            print(f"   🎯 Routed {len(results)} customers")
            
            for i, result in enumerate(results):
                print(f"      {i+1}. {result['customer_name']} → {result['agent_name']} (Score: {result['routing_score']:.3f})")
        else:
            route_data = route_response.json()
            print(f"   ❌ Auto routing failed: {route_response.status_code}")
            print(f"   📝 Error: {route_data.get('error', 'Unknown error')}")
        
        # 5. Check routing results after routing
        print("\n5️⃣ Checking routing results after auto routing...")
        routing_response = requests.get(f"{BASE_URL}/routing/results")
        if routing_response.status_code == 200:
            routing_data = routing_response.json()
            routing_results = routing_data.get('results', [])
            print(f"   🎯 Now have {len(routing_results)} total routing results")
            active_results = [r for r in routing_results if r['status'] == 'active']
            print(f"   🔄 {len(active_results)} active routing tasks")
            
            for i, result in enumerate(active_results[:3]):
                print(f"      {i+1}. {result['customer_name']} → {result['agent_name']} ({result['status']})")
        
        print("\n" + "=" * 50)
        print("🎉 Auto Routing Test Complete!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_auto_routing()