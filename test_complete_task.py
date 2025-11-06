#!/usr/bin/env python3
"""
Test script to verify task completion functionality
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_complete_task_flow():
    """Test the complete task flow"""
    print("🧪 Testing Complete Task Flow")
    print("=" * 50)
    
    try:
        # 1. Check initial state
        print("\n1️⃣ Checking initial state...")
        
        customers_response = requests.get(f"{BASE_URL}/customers")
        agents_response = requests.get(f"{BASE_URL}/agents")
        routing_response = requests.get(f"{BASE_URL}/routing/results")
        
        print(f"   Customers in queue: {len(customers_response.json()['customers'])}")
        print(f"   Available agents: {agents_response.json()['available_count']}")
        print(f"   Active routing results: {len([r for r in routing_response.json()['results'] if r['status'] == 'active'])}")
        
        # 2. Add a test customer if none exist
        if len(customers_response.json()['customers']) == 0:
            print("\n2️⃣ Adding test customer...")
            customer_data = {
                "name": "Test Customer",
                "sentiment": "neutral",
                "tier": "standard",
                "issue_type": "technical_support",
                "issue_complexity": 3.0,
                "channel": "chat",
                "priority": 5
            }
            
            add_response = requests.post(f"{BASE_URL}/customers", json=customer_data)
            if add_response.status_code == 200:
                print("   ✅ Test customer added successfully")
            else:
                print(f"   ❌ Failed to add customer: {add_response.text}")
                return
        
        # 3. Perform auto routing
        print("\n3️⃣ Performing auto routing...")
        route_response = requests.post(f"{BASE_URL}/route")
        
        if route_response.status_code == 200:
            route_data = route_response.json()
            print(f"   ✅ Routing successful: {len(route_data['results'])} customers routed")
            
            if route_data['results']:
                routing_id = route_data['results'][0]['id']
                customer_name = route_data['results'][0].get('customer_name', 'Unknown')
                agent_name = route_data['results'][0].get('agent_name', 'Unknown')
                print(f"   📋 First routing: {customer_name} → {agent_name} (ID: {routing_id})")
                
                # 4. Check routing results
                print("\n4️⃣ Checking routing results...")
                routing_response = requests.get(f"{BASE_URL}/routing/results")
                active_results = [r for r in routing_response.json()['results'] if r['status'] == 'active']
                print(f"   Active routing results: {len(active_results)}")
                
                if active_results:
                    # 5. Complete the first task
                    print(f"\n5️⃣ Completing task {routing_id}...")
                    complete_response = requests.post(f"{BASE_URL}/routing/{routing_id}/complete")
                    
                    if complete_response.status_code == 200:
                        complete_data = complete_response.json()
                        print("   ✅ Task completed successfully")
                        print(f"   📝 Message: {complete_data.get('message', 'No message')}")
                        
                        # Check agent status
                        if 'agent' in complete_data:
                            agent = complete_data['agent']
                            print(f"   👤 Agent {agent['name']}: workload={agent['current_workload']}, status={agent['status']}")
                        
                        # 6. Verify task completion
                        print("\n6️⃣ Verifying task completion...")
                        time.sleep(1)  # Give database time to update
                        
                        routing_response = requests.get(f"{BASE_URL}/routing/results")
                        results = routing_response.json()['results']
                        completed_result = next((r for r in results if r['id'] == routing_id), None)
                        
                        if completed_result:
                            print(f"   📊 Task status: {completed_result['status']}")
                            if completed_result['status'] == 'completed':
                                print("   ✅ Task status updated to completed")
                            else:
                                print(f"   ❌ Task status not updated: {completed_result['status']}")
                        else:
                            print("   ❌ Routing result not found")
                        
                        # Check agent availability
                        agents_response = requests.get(f"{BASE_URL}/agents")
                        agents_data = agents_response.json()
                        print(f"   👥 Available agents after completion: {agents_data['available_count']}")
                        
                    else:
                        print(f"   ❌ Failed to complete task: {complete_response.text}")
                else:
                    print("   ⚠️ No active routing results to complete")
            else:
                print("   ⚠️ No routing results created")
        else:
            print(f"   ❌ Routing failed: {route_response.text}")
        
        # 7. Final state check
        print("\n7️⃣ Final state check...")
        customers_response = requests.get(f"{BASE_URL}/customers")
        agents_response = requests.get(f"{BASE_URL}/agents")
        routing_response = requests.get(f"{BASE_URL}/routing/results")
        
        print(f"   Customers in queue: {len(customers_response.json()['customers'])}")
        print(f"   Available agents: {agents_response.json()['available_count']}")
        print(f"   Active routing results: {len([r for r in routing_response.json()['results'] if r['status'] == 'active'])}")
        print(f"   Completed routing results: {len([r for r in routing_response.json()['results'] if r['status'] == 'completed'])}")
        
        print("\n" + "=" * 50)
        print("🎉 Complete Task Test Finished!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_complete_task_flow()