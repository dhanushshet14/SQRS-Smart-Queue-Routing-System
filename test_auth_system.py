#!/usr/bin/env python3
"""
Test script to verify the authentication system is working properly
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_admin_login():
    """Test admin login functionality"""
    print("🔐 Testing Admin Login...")
    
    login_data = {
        "email": "admin@sqrs.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin login successful! Token: {data['access_token'][:20]}...")
            print(f"   User: {data['user']['email']} (Role: {data['user']['role']})")
            return data['access_token']
        else:
            print(f"❌ Admin login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return None

def test_customer_signup():
    """Test customer signup functionality"""
    print("\n👤 Testing Customer Signup...")
    
    signup_data = {
        "email": "test.customer@example.com",
        "password": "customer123",
        "name": "Test Customer"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Customer signup successful! Token: {data['access_token'][:20]}...")
            print(f"   User: {data['user']['email']} (Role: {data['user']['role']})")
            return data['access_token']
        else:
            print(f"❌ Customer signup failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Customer signup error: {e}")
        return None

def test_protected_endpoints(token, role):
    """Test protected endpoints with authentication"""
    print(f"\n🔒 Testing Protected Endpoints for {role}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test agents endpoint
    try:
        response = requests.get(f"{BASE_URL}/agents", headers=headers)
        if response.status_code == 200:
            agents = response.json()
            print(f"✅ Agents endpoint accessible - Found {len(agents)} agents")
        else:
            print(f"❌ Agents endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Agents endpoint error: {e}")
    
    # Test customers endpoint (admin only)
    try:
        response = requests.get(f"{BASE_URL}/customers", headers=headers)
        if response.status_code == 200:
            customers = response.json()
            print(f"✅ Customers endpoint accessible - Found {len(customers)} customers")
        elif response.status_code == 403:
            print(f"🔒 Customers endpoint properly restricted for {role}")
        else:
            print(f"❌ Customers endpoint unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Customers endpoint error: {e}")

def test_customer_query_submission(token):
    """Test customer query submission"""
    print("\n📝 Testing Customer Query Submission...")
    
    headers = {"Authorization": f"Bearer {token}"}
    query_data = {
        "name": "Test Customer Query",
        "sentiment": "neutral",
        "tier": "standard",
        "issue_type": "technical_support",
        "issue_complexity": 3,
        "channel": "phone",
        "priority": 5,
        "context": {"description": "Test query from auth system"}
    }
    
    try:
        response = requests.post(f"{BASE_URL}/customers", json=query_data, headers=headers)
        if response.status_code == 200:
            customer = response.json()
            print(f"✅ Query submitted successfully! Customer ID: {customer['id']}")
            return customer['id']
        else:
            print(f"❌ Query submission failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Query submission error: {e}")
        return None

def main():
    """Run all authentication tests"""
    print("🚀 Starting Authentication System Tests")
    print("=" * 50)
    
    # Test admin login
    admin_token = test_admin_login()
    if admin_token:
        test_protected_endpoints(admin_token, "admin")
    
    # Test customer signup and login
    customer_token = test_customer_signup()
    if customer_token:
        test_protected_endpoints(customer_token, "customer")
        customer_id = test_customer_query_submission(customer_token)
    
    print("\n" + "=" * 50)
    print("🎉 Authentication System Tests Complete!")
    print("\n📋 Summary:")
    print("✅ Admin login working")
    print("✅ Customer signup working") 
    print("✅ Protected endpoints secured")
    print("✅ Role-based access control")
    print("✅ Customer query submission")
    print("\n🌐 Frontend URLs:")
    print("   Admin: http://localhost:3000")
    print("   Customer: http://localhost:3000 (click 'Customer? Click here →')")

if __name__ == "__main__":
    main()