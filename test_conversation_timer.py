#!/usr/bin/env python3
"""
Test script for conversation timer functionality
"""

import requests
import json
import time
import threading

BASE_URL = "http://localhost:8000"

def test_conversation_timer_system():
    """Test the complete conversation timer system"""
    print("⏰ Testing Conversation Timer System")
    print("=" * 60)
    
    try:
        # Step 1: Reset queue and add test data
        print("\n1️⃣ Setting up test environment...")
        
        # Reset queue
        reset_response = requests.post(f"{BASE_URL}/route/reset")
        if reset_response.status_code == 200:
            print("   ✅ Queue reset successfully")
        else:
            print(f"   ⚠️ Queue reset failed: {reset_response.status_code}")
        
        # Add a test customer
        customer_data = {
            "name": "Timer Test Customer",
            "sentiment": "neutral",
            "tier": "standard",
            "issue_type": "technical_support",
            "channel": "chat",
            "priority": 5,
            "issue_complexity": 3.0
        }
        
        customer_response = requests.post(f"{BASE_URL}/customers", json=customer_data)
        if customer_response.status_code == 200:
            customer_id = customer_response.json()['customer']['id']
            print(f"   ✅ Test customer added: {customer_id}")
        else:
            print(f"   ❌ Failed to add customer: {customer_response.status_code}")
            return
        
        # Step 2: Perform routing to create active conversation
        print("\n2️⃣ Creating active conversation...")
        
        route_response = requests.post(f"{BASE_URL}/route")
        if route_response.status_code == 200:
            routing_data = route_response.json()
            if routing_data['results']:
                routing_id = routing_data['results'][0]['id']
                customer_name = routing_data['results'][0].get('customer_name', 'Unknown')
                agent_name = routing_data['results'][0].get('agent_name', 'Unknown')
                print(f"   ✅ Conversation started: {customer_name} ↔ {agent_name}")
                print(f"   📋 Routing ID: {routing_id}")
            else:
                print("   ❌ No routing results created")
                return
        else:
            print(f"   ❌ Routing failed: {route_response.status_code}")
            return
        
        # Step 3: Test time status endpoint
        print("\n3️⃣ Testing conversation time status...")
        
        status_response = requests.get(f"{BASE_URL}/conversation/{routing_id}/time-status")
        if status_response.status_code == 200:
            status_data = status_response.json()
            print(f"   ✅ Time status retrieved:")
            print(f"      Time elapsed: {status_data['time_elapsed']} seconds")
            print(f"      Time remaining: {status_data['time_remaining']} seconds")
            print(f"      Status: {status_data['status']}")
            print(f"      Percentage used: {status_data['percentage_used']:.1f}%")
        else:
            print(f"   ❌ Failed to get time status: {status_response.status_code}")
        
        # Step 4: Test SMS alert system
        print("\n4️⃣ Testing SMS alert system...")
        
        # Test warning SMS
        sms_response = requests.post(f"{BASE_URL}/conversation/{routing_id}/send-sms-alert", 
                                   json={"type": "warning"})
        if sms_response.status_code == 200:
            sms_data = sms_response.json()
            print(f"   ✅ Warning SMS sent:")
            print(f"      Message: {sms_data['sms_message']}")
            print(f"      Customer: {sms_data['customer_name']}")
        else:
            print(f"   ❌ Failed to send warning SMS: {sms_response.status_code}")
        
        # Test expired SMS
        sms_expired_response = requests.post(f"{BASE_URL}/conversation/{routing_id}/send-sms-alert", 
                                           json={"type": "expired"})
        if sms_expired_response.status_code == 200:
            sms_expired_data = sms_expired_response.json()
            print(f"   ✅ Expired SMS sent:")
            print(f"      Message: {sms_expired_data['sms_message']}")
        else:
            print(f"   ❌ Failed to send expired SMS: {sms_expired_response.status_code}")
        
        # Step 5: Test time extension (admin feature)
        print("\n5️⃣ Testing time extension...")
        
        extension_response = requests.post(f"{BASE_URL}/conversation/{routing_id}/extend-time",
                                         json={"extension_minutes": 5, "reason": "Complex technical issue"})
        if extension_response.status_code == 200:
            extension_data = extension_response.json()
            print(f"   ✅ Time extension granted:")
            print(f"      Extension: {extension_data['extension_minutes']} minutes")
            print(f"      New limit: {extension_data['new_limit_minutes']} minutes")
            print(f"      Reason: {extension_data['reason']}")
        else:
            print(f"   ❌ Failed to extend time: {extension_response.status_code}")
        
        # Step 6: Test conversation completion
        print("\n6️⃣ Testing conversation completion...")
        
        complete_response = requests.post(f"{BASE_URL}/routing/{routing_id}/complete")
        if complete_response.status_code == 200:
            complete_data = complete_response.json()
            print(f"   ✅ Conversation completed successfully")
            print(f"      Agent status: {complete_data['agent']['status']}")
            print(f"      Agent workload: {complete_data['agent']['current_workload']}")
        else:
            print(f"   ❌ Failed to complete conversation: {complete_response.status_code}")
        
        print("\n" + "=" * 60)
        print("🎉 Conversation Timer System Test Complete!")
        
        # Summary
        print("\n📋 SYSTEM FEATURES TESTED:")
        print("✅ Conversation time tracking")
        print("✅ Time status monitoring")
        print("✅ SMS alert system (warning & expired)")
        print("✅ Time extension capability")
        print("✅ Conversation completion")
        
        print("\n🔧 FRONTEND INTEGRATION:")
        print("- ConversationTimer component shows real-time progress")
        print("- TimeNotificationModal displays pop-up alerts")
        print("- CustomerConversationTimer for customer view")
        print("- Automatic SMS alerts at 8 and 10 minutes")
        print("- Audio notifications for warnings")
        
        print("\n⚙️ BACKEND ENDPOINTS:")
        print(f"- GET /conversation/{{id}}/time-status - Time monitoring")
        print(f"- POST /conversation/{{id}}/send-sms-alert - SMS alerts")
        print(f"- POST /conversation/{{id}}/extend-time - Time extensions")
        print(f"- POST /routing/{{id}}/complete - End conversations")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()


def simulate_real_time_monitoring():
    """Simulate real-time conversation monitoring"""
    print("\n🔄 Starting Real-Time Monitoring Simulation...")
    print("This will create a conversation and monitor it for 30 seconds")
    
    try:
        # Create a conversation
        customer_data = {
            "name": "Real-Time Test Customer",
            "sentiment": "neutral",
            "tier": "premium",
            "issue_type": "billing",
            "channel": "phone",
            "priority": 8,
            "issue_complexity": 4.0
        }
        
        customer_response = requests.post(f"{BASE_URL}/customers", json=customer_data)
        route_response = requests.post(f"{BASE_URL}/route")
        
        if route_response.status_code == 200 and route_response.json()['results']:
            routing_id = route_response.json()['results'][0]['id']
            print(f"📞 Monitoring conversation: {routing_id}")
            
            # Monitor for 30 seconds
            for i in range(30):
                status_response = requests.get(f"{BASE_URL}/conversation/{routing_id}/time-status")
                if status_response.status_code == 200:
                    status = status_response.json()
                    elapsed = status['time_elapsed']
                    remaining = status['time_remaining']
                    percentage = status['percentage_used']
                    
                    print(f"⏱️  {elapsed:3d}s elapsed | {remaining:3d}s remaining | {percentage:5.1f}% used | Status: {status['status']}")
                    
                    # Simulate SMS alerts
                    if elapsed >= 8 * 60 and i == 15:  # Simulate 8-minute warning
                        print("📱 SMS Warning Alert would be sent!")
                    elif elapsed >= 10 * 60 and i == 25:  # Simulate 10-minute expiry
                        print("📱 SMS Expiry Alert would be sent!")
                        print("🚨 Pop-up notification would appear!")
                
                time.sleep(1)
            
            # Complete the conversation
            requests.post(f"{BASE_URL}/routing/{routing_id}/complete")
            print("✅ Monitoring simulation completed")
            
        else:
            print("❌ Failed to create conversation for monitoring")
            
    except Exception as e:
        print(f"❌ Monitoring simulation failed: {str(e)}")


if __name__ == "__main__":
    # Test the conversation timer system
    test_conversation_timer_system()
    
    # Ask user if they want to run real-time monitoring
    print("\n" + "=" * 60)
    response = input("Would you like to run a 30-second real-time monitoring simulation? (y/n): ")
    if response.lower() in ['y', 'yes']:
        simulate_real_time_monitoring()
    
    print("\n🎯 NEXT STEPS:")
    print("1. Start the frontend: npm run dev")
    print("2. Log in as admin to see ConversationTimer components")
    print("3. Create a routing and watch the 10-minute timer")
    print("4. Test pop-up notifications at 8 and 10 minutes")
    print("5. Test SMS alerts and conversation completion")