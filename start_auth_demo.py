#!/usr/bin/env python3
"""
Complete startup script for the Smart Queue Routing System with Authentication
"""

import subprocess
import sys
import time
import os
import webbrowser
from pathlib import Path

def print_banner():
    """Print startup banner"""
    print("🚀 Smart Queue Routing System - Authentication Demo")
    print("=" * 60)
    print("🔐 Complete authentication system with:")
    print("   • Admin login portal")
    print("   • Customer signup/login")
    print("   • Role-based dashboards")
    print("   • Session management")
    print("   • Protected endpoints")
    print("=" * 60)

def check_dependencies():
    """Check if required dependencies are installed"""
    print("\n📋 Checking Dependencies...")
    
    # Check Python packages
    required_packages = ['flask', 'flask-cors', 'flask-jwt-extended', 'bcrypt', 'requests']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - MISSING")
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Install with: pip install " + " ".join(missing_packages))
        return False
    
    # Check Node.js dependencies
    if Path("frontend/node_modules").exists():
        print("✅ Node.js dependencies installed")
    else:
        print("❌ Node.js dependencies missing")
        print("Run: cd frontend && npm install")
        return False
    
    return True

def start_backend():
    """Start the Flask backend server"""
    print("\n🔧 Starting Backend Server...")
    
    try:
        # Change to backend directory and start server
        backend_process = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd="backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Check if process is still running
        if backend_process.poll() is None:
            print("✅ Backend server started on http://localhost:8000")
            return backend_process
        else:
            stdout, stderr = backend_process.communicate()
            print(f"❌ Backend failed to start:")
            print(f"   stdout: {stdout.decode()}")
            print(f"   stderr: {stderr.decode()}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def start_frontend():
    """Start the React frontend server"""
    print("\n🎨 Starting Frontend Server...")
    
    try:
        # Try different npm commands based on OS
        npm_commands = ["npm.cmd", "npm"]
        frontend_process = None
        
        for npm_cmd in npm_commands:
            try:
                frontend_process = subprocess.Popen(
                    [npm_cmd, "run", "dev"],
                    cwd="frontend",
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    shell=True
                )
                break
            except FileNotFoundError:
                continue
        
        if not frontend_process:
            print("❌ Could not find npm command")
            return None
        
        # Wait for frontend to start
        time.sleep(5)
        
        if frontend_process.poll() is None:
            print("✅ Frontend server started on http://localhost:3000")
            return frontend_process
        else:
            stdout, stderr = frontend_process.communicate()
            print(f"❌ Frontend failed to start:")
            print(f"   stdout: {stdout.decode()}")
            print(f"   stderr: {stderr.decode()}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return None

def run_auth_tests():
    """Run authentication system tests"""
    print("\n🧪 Running Authentication Tests...")
    
    try:
        result = subprocess.run(
            [sys.executable, "test_auth_system.py"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✅ All authentication tests passed!")
            print(result.stdout)
        else:
            print("⚠️  Some tests may have issues:")
            print(result.stdout)
            if result.stderr:
                print("Errors:", result.stderr)
                
    except subprocess.TimeoutExpired:
        print("⏰ Tests timed out - backend may not be ready")
    except Exception as e:
        print(f"❌ Error running tests: {e}")

def show_demo_instructions():
    """Show demo instructions"""
    print("\n" + "=" * 60)
    print("🎯 DEMO INSTRUCTIONS")
    print("=" * 60)
    
    print("\n🔐 ADMIN LOGIN:")
    print("   URL: http://localhost:3000")
    print("   Email: admin@sqrs.com")
    print("   Password: admin123")
    print("   Features: Full dashboard, customer management, agent pool")
    
    print("\n👤 CUSTOMER LOGIN:")
    print("   URL: http://localhost:3000")
    print("   Click: 'Customer? Click here →'")
    print("   Action: Sign up with any email/password")
    print("   Features: Submit queries, view agents, track queue position")
    
    print("\n🎨 WHAT YOU'LL SEE:")
    print("   • Separate login pages for Admin/Customer")
    print("   • Role-based dashboards")
    print("   • Unique agent names and specialties")
    print("   • Real-time queue management")
    print("   • Customer query submission")
    print("   • Session persistence")
    print("   • Logout functionality")
    
    print("\n🔄 TO RESTART:")
    print("   • Ctrl+C to stop servers")
    print("   • Run this script again")

def main():
    """Main startup function"""
    print_banner()
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install missing dependencies first")
        return
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("\n❌ Failed to start backend server")
        return
    
    # Start frontend  
    frontend_process = start_frontend()
    if not frontend_process:
        print("\n❌ Failed to start frontend server")
        backend_process.terminate()
        return
    
    # Run tests
    time.sleep(2)  # Give servers time to fully start
    run_auth_tests()
    
    # Show instructions
    show_demo_instructions()
    
    # Open browser
    print(f"\n🌐 Opening browser to http://localhost:3000...")
    try:
        webbrowser.open("http://localhost:3000")
    except:
        pass
    
    print(f"\n⚡ System is running! Press Ctrl+C to stop all servers.")
    
    try:
        # Keep script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n🛑 Shutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ All servers stopped. Goodbye!")

if __name__ == "__main__":
    main()