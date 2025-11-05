#!/usr/bin/env python3
"""
Comprehensive System Test for AI Smart Queue Routing System
Tests all major functionality including API endpoints, ML model, and integration
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any
import subprocess
import os

class SystemTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str = "", response_time: float = 0):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_time": response_time
        })
        print(f"{status} {test_name} ({response_time:.3f}s) - {message}")
        
    def test_health_check(self):
        """Test basic health endpoint"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/health", timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health Check", True, f"Status: {data.get('status')}", response_time)
                return True
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False
            
    def test_customers_endpoint(self):
        """Test customer management endpoints"""
        try:
            # Test GET customers
            start_time = time.time()
            response = requests.get(f"{self.base_url}/customers")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                customer_count = data.get('count', 0)
                self.log_test("GET Customers", True, f"Found {customer_count} customers", response_time)
                
                # Test POST customer
                new_customer = {
                    "name": "Test Customer",
                    "sentiment": "neutral",
                    "tier": "silver",
                    "issue_type": "technical_support",
                    "channel": "phone",
                    "priority": 3,
                    "issue_complexity": 2
                }
                
                start_time = time.time()
                response = requests.post(f"{self.base_url}/customers", json=new_customer)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    self.log_test("POST Customer", True, "Customer added successfully", response_time)
                    return True
                else:
                    self.log_test("POST Customer", False, f"Status: {response.status_code}", response_time)
                    return False
            else:
                self.log_test("GET Customers", False, f"Status: {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test("Customer Endpoints", False, f"Error: {str(e)}")
            return False
            
    def test_agents_endpoint(self):
        """Test agent management endpoints"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/agents")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                agent_count = data.get('total_count', 0)
                available_count = data.get('available_count', 0)
                self.log_test("GET Agents", True, f"{available_count}/{agent_count} agents available", response_time)
                return True
            else:
                self.log_test("GET Agents", False, f"Status: {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test("Agent Endpoints", False, f"Error: {str(e)}")
            return False
            
    def test_routing_functionality(self):
        """Test AI routing functionality"""
        try:
            # Test auto routing
            start_time = time.time()
            response = requests.post(f"{self.base_url}/route")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                results_count = len(data.get('results', []))
                stats = data.get('statistics', {})
                avg_score = stats.get('average_score', 0)
                
                self.log_test("Auto Routing", True, 
                             f"Routed {results_count} customers, avg score: {avg_score:.3f}", 
                             response_time)
                
                # Test reset functionality
                start_time = time.time()
                response = requests.post(f"{self.base_url}/route/reset")
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    self.log_test("Reset Queue", True, "Queue reset successfully", response_time)
                    return True
                else:
                    self.log_test("Reset Queue", False, f"Status: {response.status_code}", response_time)
                    return False
            else:
                self.log_test("Auto Routing", False, f"Status: {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test("Routing Functionality", False, f"Error: {str(e)}")
            return False
            
    def test_ai_model_endpoints(self):
        """Test AI model management endpoints"""
        try:
            # Test model info
            start_time = time.time()
            response = requests.get(f"{self.base_url}/ai/model/info")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                model_stats = data.get('model_stats', {})
                accuracy = model_stats.get('accuracy', 0)
                self.log_test("AI Model Info", True, f"Model accuracy: {accuracy:.1%}", response_time)
                
                # Test model performance
                start_time = time.time()
                response = requests.get(f"{self.base_url}/ai/model/performance")
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    performance = data.get('current_performance', {})
                    auc_score = performance.get('auc_score', 0)
                    self.log_test("AI Model Performance", True, f"AUC Score: {auc_score:.3f}", response_time)
                    return True
                else:
                    self.log_test("AI Model Performance", False, f"Status: {response.status_code}", response_time)
                    return False
            else:
                self.log_test("AI Model Info", False, f"Status: {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test("AI Model Endpoints", False, f"Error: {str(e)}")
            return False
            
    def test_analytics_endpoint(self):
        """Test analytics and performance metrics"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/analytics/performance")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                queue_metrics = data.get('queue_metrics', {})
                customers_waiting = queue_metrics.get('customers_waiting', 0)
                agents_available = queue_metrics.get('agents_available', 0)
                
                self.log_test("Analytics Endpoint", True, 
                             f"Queue: {customers_waiting} customers, {agents_available} agents", 
                             response_time)
                return True
            else:
                self.log_test("Analytics Endpoint", False, f"Status: {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test("Analytics Endpoint", False, f"Error: {str(e)}")
            return False
            
    def test_performance_benchmarks(self):
        """Test system performance under load"""
        try:
            print("\n🚀 Running Performance Benchmarks...")
            
            # Test multiple concurrent requests
            import concurrent.futures
            import threading
            
            def make_request():
                try:
                    start = time.time()
                    response = requests.get(f"{self.base_url}/customers", timeout=5)
                    return time.time() - start, response.status_code == 200
                except:
                    return 0, False
            
            # Run 20 concurrent requests
            with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
                futures = [executor.submit(make_request) for _ in range(20)]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            
            response_times = [r[0] for r in results if r[1]]
            success_rate = len(response_times) / len(results)
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            
            if success_rate >= 0.95 and avg_response_time < 1.0:
                self.log_test("Performance Benchmark", True, 
                             f"Success rate: {success_rate:.1%}, Avg time: {avg_response_time:.3f}s", 
                             avg_response_time)
                return True
            else:
                self.log_test("Performance Benchmark", False, 
                             f"Success rate: {success_rate:.1%}, Avg time: {avg_response_time:.3f}s", 
                             avg_response_time)
                return False
                
        except Exception as e:
            self.log_test("Performance Benchmark", False, f"Error: {str(e)}")
            return False
            
    def test_ml_model_accuracy(self):
        """Test ML model predictions"""
        try:
            # First get some customers and agents
            customers_response = requests.get(f"{self.base_url}/customers")
            agents_response = requests.get(f"{self.base_url}/agents")
            
            if customers_response.status_code == 200 and agents_response.status_code == 200:
                # Perform routing to test ML predictions
                start_time = time.time()
                routing_response = requests.post(f"{self.base_url}/route")
                response_time = time.time() - start_time
                
                if routing_response.status_code == 200:
                    data = routing_response.json()
                    results = data.get('results', [])
                    
                    if results:
                        scores = [r.get('routing_score', 0) for r in results]
                        avg_score = sum(scores) / len(scores)
                        min_score = min(scores)
                        max_score = max(scores)
                        
                        # Check if scores are reasonable (between 0 and 1)
                        if 0 <= min_score <= max_score <= 1 and avg_score > 0.5:
                            self.log_test("ML Model Accuracy", True, 
                                         f"Avg score: {avg_score:.3f}, Range: {min_score:.3f}-{max_score:.3f}", 
                                         response_time)
                            return True
                        else:
                            self.log_test("ML Model Accuracy", False, 
                                         f"Invalid scores: {min_score:.3f}-{max_score:.3f}", 
                                         response_time)
                            return False
                    else:
                        self.log_test("ML Model Accuracy", False, "No routing results generated", response_time)
                        return False
                else:
                    self.log_test("ML Model Accuracy", False, f"Routing failed: {routing_response.status_code}")
                    return False
            else:
                self.log_test("ML Model Accuracy", False, "Failed to get customers/agents")
                return False
                
        except Exception as e:
            self.log_test("ML Model Accuracy", False, f"Error: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Run all system tests"""
        print("🧪 Starting Comprehensive System Tests for AI Smart Queue Routing System")
        print("=" * 80)
        
        # Check if backend is running
        if not self.test_health_check():
            print("\n❌ Backend server is not running. Please start it with:")
            print("   cd backend && python app.py")
            return False
            
        print("\n📡 Testing API Endpoints...")
        self.test_customers_endpoint()
        self.test_agents_endpoint()
        self.test_routing_functionality()
        self.test_ai_model_endpoints()
        self.test_analytics_endpoint()
        
        print("\n🤖 Testing ML Model...")
        self.test_ml_model_accuracy()
        
        print("\n⚡ Testing Performance...")
        self.test_performance_benchmarks()
        
        # Generate test report
        self.generate_report()
        
        return True
        
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 80)
        print("📊 TEST REPORT SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Performance metrics
        response_times = [t['response_time'] for t in self.test_results if t['response_time'] > 0]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            print(f"Average Response Time: {avg_response_time:.3f}s")
            print(f"Max Response Time: {max_response_time:.3f}s")
        
        print("\n📋 Detailed Results:")
        for test in self.test_results:
            status = "✅" if test['success'] else "❌"
            print(f"  {status} {test['test']}: {test['message']}")
            
        # Overall system health
        print("\n🏥 System Health Assessment:")
        if success_rate >= 90:
            print("🟢 EXCELLENT: System is fully operational and ready for production")
        elif success_rate >= 75:
            print("🟡 GOOD: System is mostly functional with minor issues")
        elif success_rate >= 50:
            print("🟠 WARNING: System has significant issues that need attention")
        else:
            print("🔴 CRITICAL: System has major problems and is not ready for use")
            
        # Recommendations
        print("\n💡 Recommendations:")
        if failed_tests == 0:
            print("  • System is ready for demo and production deployment")
            print("  • Consider load testing with higher concurrent users")
            print("  • Monitor performance metrics in production")
        else:
            print("  • Fix failing tests before demo")
            print("  • Check backend server logs for error details")
            print("  • Verify all dependencies are installed correctly")

def main():
    """Main test execution"""
    print("🚀 AI Smart Queue Routing System - Comprehensive Test Suite")
    print("Testing backend at http://localhost:8000")
    print("Make sure the backend server is running before starting tests.\n")
    
    tester = SystemTester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Test suite failed with error: {str(e)}")
        
    print("\n🎯 Test suite completed!")
    print("For demo preparation, ensure all tests pass before presenting.")

if __name__ == "__main__":
    main()