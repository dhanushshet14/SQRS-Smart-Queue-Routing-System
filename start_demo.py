#!/usr/bin/env python3
"""
Quick Start Script for AI Smart Queue Routing System Demo
Automatically starts backend and frontend servers for demo
"""

import subprocess
import sys
import time
import os
import signal
import threading
from pathlib import Path

class DemoLauncher:
    def __init__(self):
        self.processes = []
        self.backend_ready = False
        self.frontend_ready = False
        
    def check_dependencies(self):
        """Check if required dependencies are installed"""
        print("🔍 Checking dependencies...")
        
        # Check Python
        try:
            result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
            python_version = result.stdout.strip()
            print(f"✅ {python_version}")
        except:
            print("❌ Python not found")
            return False
            
        # Check Node.js
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            node_version = result.stdout.strip()
            print(f"✅ Node.js {node_version}")
        except:
            print("❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/")
            return False
            
        # Check npm
        try:
            result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
            npm_version = result.stdout.strip()
            print(f"✅ npm {npm_version}")
        except:
            print("❌ npm not found")
            return False
            
        return True
        
    def install_backend_deps(self):
        """Install backend dependencies"""
        print("\n📦 Installing backend dependencies...")
        backend_path = Path("backend")
        
        if not backend_path.exists():
            print("❌ Backend directory not found")
            return False
            
        try:
            # Check if requirements.txt exists
            requirements_file = backend_path / "requirements.txt"
            if not requirements_file.exists():
                print("❌ requirements.txt not found in backend directory")
                return False
                
            # Install requirements
            result = subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ], cwd=backend_path, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Backend dependencies installed")
                return True
            else:
                print(f"❌ Failed to install backend dependencies: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error installing backend dependencies: {str(e)}")
            return False
            
    def install_frontend_deps(self):
        """Install frontend dependencies"""
        print("\n📦 Installing frontend dependencies...")
        frontend_path = Path("frontend")
        
        if not frontend_path.exists():
            print("❌ Frontend directory not found")
            return False
            
        try:
            # Check if package.json exists
            package_file = frontend_path / "package.json"
            if not package_file.exists():
                print("❌ package.json not found in frontend directory")
                return False
                
            # Install dependencies
            result = subprocess.run([
                "npm", "install"
            ], cwd=frontend_path, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Frontend dependencies installed")
                return True
            else:
                print(f"❌ Failed to install frontend dependencies: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error installing frontend dependencies: {str(e)}")
            return False
            
    def start_backend(self):
        """Start the backend server"""
        print("\n🚀 Starting backend server...")
        backend_path = Path("backend")
        
        try:
            # Start backend server
            process = subprocess.Popen([
                sys.executable, "app.py"
            ], cwd=backend_path, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            self.processes.append(("Backend", process))
            
            # Monitor backend startup
            def monitor_backend():
                for line in process.stdout:
                    if "Uvicorn running on" in line:
                        self.backend_ready = True
                        print("✅ Backend server is running on http://localhost:8000")
                        break
                    elif "ERROR" in line or "CRITICAL" in line:
                        print(f"❌ Backend error: {line.strip()}")
                        
            threading.Thread(target=monitor_backend, daemon=True).start()
            
            # Wait for backend to be ready
            timeout = 30
            start_time = time.time()
            while not self.backend_ready and time.time() - start_time < timeout:
                time.sleep(0.5)
                
            if not self.backend_ready:
                print("❌ Backend failed to start within 30 seconds")
                return False
                
            return True
            
        except Exception as e:
            print(f"❌ Error starting backend: {str(e)}")
            return False
            
    def start_frontend(self):
        """Start the frontend server"""
        print("\n🎨 Starting frontend server...")
        frontend_path = Path("frontend")
        
        try:
            # Start frontend server
            process = subprocess.Popen([
                "npm", "run", "dev"
            ], cwd=frontend_path, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            self.processes.append(("Frontend", process))
            
            # Monitor frontend startup
            def monitor_frontend():
                for line in process.stdout:
                    if "Local:" in line and "localhost" in line:
                        self.frontend_ready = True
                        # Extract URL from the line
                        if "http://localhost:" in line:
                            url = line.split("http://localhost:")[1].split()[0]
                            print(f"✅ Frontend server is running on http://localhost:{url}")
                        else:
                            print("✅ Frontend server is running")
                        break
                    elif "ERROR" in line or "EADDRINUSE" in line:
                        print(f"❌ Frontend error: {line.strip()}")
                        
            threading.Thread(target=monitor_frontend, daemon=True).start()
            
            # Wait for frontend to be ready
            timeout = 60
            start_time = time.time()
            while not self.frontend_ready and time.time() - start_time < timeout:
                time.sleep(0.5)
                
            if not self.frontend_ready:
                print("❌ Frontend failed to start within 60 seconds")
                return False
                
            return True
            
        except Exception as e:
            print(f"❌ Error starting frontend: {str(e)}")
            return False
            
    def cleanup(self):
        """Clean up processes"""
        print("\n🧹 Cleaning up processes...")
        for name, process in self.processes:
            try:
                process.terminate()
                process.wait(timeout=5)
                print(f"✅ {name} server stopped")
            except subprocess.TimeoutExpired:
                process.kill()
                print(f"⚠️  {name} server force killed")
            except Exception as e:
                print(f"❌ Error stopping {name}: {str(e)}")
                
    def run_demo(self):
        """Run the complete demo setup"""
        print("🎯 AI Smart Queue Routing System - Demo Launcher")
        print("=" * 60)
        
        try:
            # Check dependencies
            if not self.check_dependencies():
                print("\n❌ Dependency check failed. Please install missing dependencies.")
                return False
                
            # Install dependencies
            if not self.install_backend_deps():
                print("\n❌ Backend setup failed")
                return False
                
            if not self.install_frontend_deps():
                print("\n❌ Frontend setup failed")
                return False
                
            # Start servers
            if not self.start_backend():
                print("\n❌ Backend startup failed")
                return False
                
            if not self.start_frontend():
                print("\n❌ Frontend startup failed")
                return False
                
            # Demo is ready
            print("\n" + "=" * 60)
            print("🎉 DEMO IS READY!")
            print("=" * 60)
            print("📊 Backend API: http://localhost:8000")
            print("📊 API Docs: http://localhost:8000/docs")
            print("🎨 Frontend: Check the frontend URL above")
            print("=" * 60)
            print("\n💡 Demo Tips:")
            print("  • Use 'Auto Route' to see AI in action")
            print("  • Check Settings for AI model management")
            print("  • Reset Queue to generate new data")
            print("  • Monitor real-time performance metrics")
            print("\n⚠️  Press Ctrl+C to stop all servers")
            
            # Keep running until interrupted
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n\n🛑 Demo stopped by user")
                
            return True
            
        except Exception as e:
            print(f"\n❌ Demo setup failed: {str(e)}")
            return False
        finally:
            self.cleanup()

def main():
    """Main entry point"""
    launcher = DemoLauncher()
    
    # Handle Ctrl+C gracefully
    def signal_handler(sig, frame):
        print("\n\n🛑 Received interrupt signal")
        launcher.cleanup()
        sys.exit(0)
        
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        success = launcher.run_demo()
        if not success:
            print("\n❌ Demo setup failed. Check the errors above.")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        launcher.cleanup()
        sys.exit(1)

if __name__ == "__main__":
    main()