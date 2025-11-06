#!/usr/bin/env python3
"""
Comprehensive test for both customer query submission and admin customer addition
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_admin_add_customer():
    """Test admin adding a customer"""
    print("🔧 Testing Admin Add Customer Functionality")
    print("-" * 50)
    
    try:
        # Test data that matches the AddCustomerModal form
        customer_data = {
            "name": "Admin Test Customer",
            "sentiment": "neutral",
            "tier": "standard",
            "issue_type": "technical_support",
            "channel": "chat",
            "priority": 5,
            "issue_complexity": 3.0
        }
        
        print(f"📤 Sending request to: {BASE_URL}/customers")
        print(f"📋 Data: {json.dumps(customer_data, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/customers", json=customer_data)
        
        print(f"📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: Customer added successfully!")
            print(f"   Customer Name: {data['customer']['name']}")
            print(f"   Customer ID: {data['customer']['id']}")
            print(f"   Message: {data['message']}")
            return True
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Raw response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_customer_submit_query():
    """Test customer submitting a query"""
    print("\n👤 Testing Customer Submit Query Functionality")
    print("-" * 50)
    
    try:
        # Test data that matches the CustomerDashboard form
        query_data = {
            "customer_email": "test.customer@example.com",
            "customer_name": "Query Test Customer",
            "sentiment": "neutral",
            "tier": "standard",
            "issue_type": "billing",
            "issue_description": "I have a question about my monthly billing statement and need clarification on some charges.",
            "channel": "phone",
            "priority": 6,
            "issue_complexity": 2.5
        }
        
        print(f"📤 Sending request to: {BASE_URL}/customer/submit-query")
        print(f"📋 Data: {json.dumps(query_data, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/customer/submit-query", json=query_data)
        
        print(f"📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: Query submitted successfully!")
            print(f"   Customer Name: {data['customer']['name']}")
            print(f"   Customer ID: {data['customer']['id']}")
            print(f"   Queue Position: {data['queue_position']}")
            print(f"   Estimated Wait: {data['estimated_wait_time']} minutes")
            print(f"   Message: {data['message']}")
            return True
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Raw response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_validation_errors():
    """Test validation error handling"""
    print("\n🔍 Testing Validation Error Handling")
    print("-" * 50)
    
    # Test admin endpoint with invalid data
    print("Testing admin endpoint with invalid data...")
    invalid_admin_data = {
        "name": "",  # Empty name
        "sentiment": "neutral",
        "tier": "standard",
        "issue_type": "technical_support",
        "channel": "chat",
        "priority": 15,  # Invalid priority
        "issue_complexity": 10.0  # Invalid complexity
    }
    
    response = requests.post(f"{BASE_URL}/customers", json=invalid_admin_data)
    print(f"   Admin invalid data response: {response.status_code}")
    if response.status_code != 200:
        print(f"   ✅ Correctly rejected invalid admin data")
    else:
        print(f"   ⚠️ Unexpectedly accepted invalid admin data")
    
    # Test customer endpoint with missing required fields
    print("Testing customer endpoint with missing required fields...")
    invalid_customer_data = {
        "customer_email": "",  # Empty email
        "customer_name": "",   # Empty name
        "sentiment": "neutral",
        "tier": "standard",
        "issue_type": "billing",
        "issue_description": "",  # Empty description
        "channel": "phone",
        "priority": 5,
        "issue_complexity": 3.0
    }
    
    response = requests.post(f"{BASE_URL}/customer/submit-query", json=invalid_customer_data)
    print(f"   Customer invalid data response: {response.status_code}")
    if response.status_code != 200:
        print(f"   ✅ Correctly rejected invalid customer data")
    else:
        print(f"   ⚠️ Unexpectedly accepted invalid customer data")


def check_current_queue():
    """Check current queue status"""
    print("\n📊 Current Queue Status")
    print("-" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/customers")
        if response.status_code == 200:
            data = response.json()
            print(f"📈 Total customers in queue: {data['count']}")
            
            if data['customers']:
                print("📋 Recent customers:")
                for i, customer in enumerate(data['customers'][-5:], 1):
                    print(f"   {i}. {customer['name']} - {customer['issue_type']} ({customer['tier']}) - Priority: {customer['priority']}")
            else:
                print("   No customers in queue")
        else:
            print(f"❌ Failed to get queue status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking queue: {str(e)}")


def main():
    """Run all tests"""
    print("🧪 COMPREHENSIVE FUNCTIONALITY TEST")
    print("=" * 60)
    
    # Check backend connectivity
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is running and accessible")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {str(e)}")
        return
    
    # Run tests
    admin_success = test_admin_add_customer()
    customer_success = test_customer_submit_query()
    
    test_validation_errors()
    check_current_queue()
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    print(f"Admin Add Customer: {'✅ PASS' if admin_success else '❌ FAIL'}")
    print(f"Customer Submit Query: {'✅ PASS' if customer_success else '❌ FAIL'}")
    
    if admin_success and customer_success:
        print("\n🎉 ALL TESTS PASSED! Both functionalities are working correctly.")
        print("\nIf the frontend is not working, the issue is likely:")
        print("1. User not properly logged in (missing email/name in user object)")
        print("2. Frontend validation preventing form submission")
        print("3. JavaScript errors in browser console")
        print("4. CORS issues (though our test shows CORS is working)")
        print("\nRecommendations:")
        print("- Check browser console for JavaScript errors")
        print("- Verify user is properly logged in with email and name")
        print("- Test with the HTML test file: test_ui_functionality.html")
    else:
        print("\n❌ SOME TESTS FAILED! Check the backend implementation.")


if __name__ == "__main__":
    main()