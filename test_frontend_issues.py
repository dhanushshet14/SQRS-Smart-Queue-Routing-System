#!/usr/bin/env python3
"""
Test script to check frontend functionality issues
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_customer_endpoints():
    """Test customer-related endpoints"""
    print("🧪 Testing Customer Endpoints")
    print("=" * 50)
    
    try:
        # Test 1: Admin add customer endpoint
        print("\n1️⃣ Testing Admin Add Customer...")
        admin_customer_data = {
            "name": "Admin Added Customer",
            "sentiment": "neutral",
            "tier": "standard", 
            "issue_type": "technical_support",
            "issue_complexity": 3.0,
            "channel": "chat",
            "priority": 5
        }
        
        response = requests.post(f"{BASE_URL}/customers", json=admin_customer_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Customer added: {data['customer']['name']}")
            print(f"   📋 Customer ID: {data['customer']['id']}")
        else:
            print(f"   ❌ Failed: {response.text}")
        
        # Test 2: Customer submit query endpoint
        print("\n2️⃣ Testing Customer Submit Query...")
        query_data = {
            "customer_email": "customer@example.com",
            "customer_name": "Query Customer",
            "sentiment": "neutral",
            "tier": "standard",
            "issue_type": "billing",
            "issue_description": "I have a question about my bill",
            "channel": "phone",
            "priority": 5,
            "issue_complexity": 2.0
        }
        
        response = requests.post(f"{BASE_URL}/customer/submit-query", json=query_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Query submitted: {data['customer']['name']}")
            print(f"   📍 Queue position: {data['queue_position']}")
            print(f"   ⏱️ Estimated wait: {data['estimated_wait_time']} minutes")
        else:
            print(f"   ❌ Failed: {response.text}")
        
        # Test 3: Check customers in queue
        print("\n3️⃣ Checking customers in queue...")
        response = requests.get(f"{BASE_URL}/customers")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   📊 Total customers in queue: {data['count']}")
            
            if data['customers']:
                print("   👥 Recent customers:")
                for i, customer in enumerate(data['customers'][-3:], 1):
                    print(f"      {i}. {customer['name']} - {customer['issue_type']} ({customer['tier']})")
        else:
            print(f"   ❌ Failed to get customers: {response.text}")
        
        # Test 4: Check CORS headers
        print("\n4️⃣ Checking CORS configuration...")
        response = requests.options(f"{BASE_URL}/customers")
        print(f"   OPTIONS status: {response.status_code}")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        for header, value in cors_headers.items():
            if value:
                print(f"   ✅ {header}: {value}")
            else:
                print(f"   ⚠️ {header}: Not set")
        
        # Test 5: Test with invalid data
        print("\n5️⃣ Testing with invalid data...")
        invalid_data = {
            "name": "",  # Empty name
            "sentiment": "invalid",  # Invalid sentiment
            "tier": "standard",
            "issue_type": "technical_support",
            "issue_complexity": 10.0,  # Invalid complexity
            "channel": "chat",
            "priority": 15  # Invalid priority
        }
        
        response = requests.post(f"{BASE_URL}/customers", json=invalid_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ✅ Correctly rejected invalid data")
            print(f"   📝 Error: {response.json().get('error', 'No error message')}")
        else:
            print(f"   ⚠️ Unexpectedly accepted invalid data")
        
        print("\n" + "=" * 50)
        print("🎉 Customer Endpoints Test Complete!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()


def test_frontend_connectivity():
    """Test if frontend can connect to backend"""
    print("\n🌐 Testing Frontend Connectivity")
    print("=" * 30)
    
    try:
        # Test basic connectivity
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Backend is accessible")
        else:
            print("❌ Backend connectivity issue")
        
        # Test with browser-like headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Origin': 'http://localhost:3000',
            'Referer': 'http://localhost:3000/'
        }
        
        response = requests.get(f"{BASE_URL}/customers", headers=headers)
        print(f"With browser headers: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ CORS working correctly")
        else:
            print("❌ CORS issue detected")
            
    except Exception as e:
        print(f"❌ Connectivity test failed: {str(e)}")


if __name__ == "__main__":
    test_customer_endpoints()
    test_frontend_connectivity()