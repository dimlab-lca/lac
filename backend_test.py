#!/usr/bin/env python3
"""
Backend API Testing for Publicity Campaign App
Tests all backend endpoints with comprehensive coverage
"""

import requests
import json
import time
from datetime import datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://lcatv-burkina.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.test_user_data = {
            "username": "campaign_tester_2025",
            "email": "tester@campaignapp.com", 
            "password": "SecurePass123!",
            "full_name": "Campaign App Tester"
        }
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and "database" in data:
                    self.log_test("Health Check", True, 
                                f"Status: {data['status']}, DB: {data['database']}", data)
                else:
                    self.log_test("Health Check", False, 
                                f"Invalid response format: {data}")
            else:
                self.log_test("Health Check", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
    
    def test_campaigns_public(self):
        """Test public campaigns endpoint"""
        try:
            response = requests.get(f"{self.base_url}/campaigns", timeout=10)
            
            if response.status_code == 200:
                campaigns = response.json()
                if isinstance(campaigns, list):
                    if len(campaigns) > 0:
                        # Check campaign structure
                        campaign = campaigns[0]
                        required_fields = ["id", "title", "description", "modalities", "budget"]
                        missing_fields = [field for field in required_fields if field not in campaign]
                        
                        if not missing_fields:
                            self.log_test("Campaigns API", True, 
                                        f"Retrieved {len(campaigns)} campaigns with valid structure", 
                                        {"count": len(campaigns), "sample": campaign})
                        else:
                            self.log_test("Campaigns API", False, 
                                        f"Missing fields in campaign: {missing_fields}")
                    else:
                        self.log_test("Campaigns API", True, 
                                    "No campaigns found but endpoint works", campaigns)
                else:
                    self.log_test("Campaigns API", False, 
                                f"Expected list, got: {type(campaigns)}")
            else:
                self.log_test("Campaigns API", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Campaigns API", False, f"Connection error: {str(e)}")
    
    def test_user_registration(self):
        """Test user registration"""
        try:
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=self.test_user_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.auth_token = data["access_token"]
                    self.log_test("User Registration", True, 
                                "User registered successfully with JWT token", 
                                {"token_type": data["token_type"]})
                else:
                    self.log_test("User Registration", False, 
                                f"Invalid response format: {data}")
            elif response.status_code == 400:
                # User might already exist, try login instead
                self.log_test("User Registration", True, 
                            "User already exists (expected for repeated tests)")
                return self.test_user_login()
            else:
                self.log_test("User Registration", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("User Registration", False, f"Connection error: {str(e)}")
    
    def test_user_login(self):
        """Test user login"""
        try:
            login_data = {
                "username": self.test_user_data["username"],
                "password": self.test_user_data["password"]
            }
            
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.auth_token = data["access_token"]
                    self.log_test("User Login", True, 
                                "Login successful with JWT token", 
                                {"token_type": data["token_type"]})
                    return True
                else:
                    self.log_test("User Login", False, 
                                f"Invalid response format: {data}")
            else:
                self.log_test("User Login", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Connection error: {str(e)}")
            return False
    
    def test_protected_route_auth_me(self):
        """Test protected route - get current user"""
        if not self.auth_token:
            self.log_test("Protected Route /auth/me", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{self.base_url}/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                required_fields = ["id", "username", "email", "full_name"]
                missing_fields = [field for field in required_fields if field not in user_data]
                
                if not missing_fields:
                    self.log_test("Protected Route /auth/me", True, 
                                f"User data retrieved: {user_data['username']}", user_data)
                else:
                    self.log_test("Protected Route /auth/me", False, 
                                f"Missing fields: {missing_fields}")
            else:
                self.log_test("Protected Route /auth/me", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Protected Route /auth/me", False, f"Connection error: {str(e)}")
    
    def test_protected_route_without_auth(self):
        """Test that protected routes require authentication"""
        try:
            response = requests.get(f"{self.base_url}/auth/me", timeout=10)
            
            if response.status_code == 401 or response.status_code == 403:
                self.log_test("Protected Route Security", True, 
                            "Protected route correctly requires authentication")
            else:
                self.log_test("Protected Route Security", False, 
                            f"Expected 401/403, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Protected Route Security", False, f"Connection error: {str(e)}")
    
    def test_campaign_creation(self):
        """Test campaign creation (protected)"""
        if not self.auth_token:
            self.log_test("Campaign Creation", False, "No auth token available")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            campaign_data = {
                "title": "Test Marketing Campaign 2025",
                "description": "A comprehensive test campaign for our new product launch",
                "modalities": ["video", "text", "audio"],
                "budget": 7500.0,
                "duration_days": 30,
                "target_audience": "Tech enthusiasts and early adopters, 25-45 years"
            }
            
            response = requests.post(
                f"{self.base_url}/campaigns",
                json=campaign_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                campaign = response.json()
                if "id" in campaign and campaign["title"] == campaign_data["title"]:
                    self.log_test("Campaign Creation", True, 
                                f"Campaign created: {campaign['title']}", 
                                {"id": campaign["id"], "modalities": campaign["modalities"]})
                    return campaign["id"]
                else:
                    self.log_test("Campaign Creation", False, 
                                f"Invalid response format: {campaign}")
            else:
                self.log_test("Campaign Creation", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Campaign Creation", False, f"Connection error: {str(e)}")
        
        return None
    
    def test_order_creation(self, campaign_id=None):
        """Test order creation (protected)"""
        if not self.auth_token:
            self.log_test("Order Creation", False, "No auth token available")
            return
            
        # Get a campaign ID if not provided
        if not campaign_id:
            try:
                response = requests.get(f"{self.base_url}/campaigns", timeout=10)
                if response.status_code == 200:
                    campaigns = response.json()
                    if campaigns:
                        campaign_id = campaigns[0]["id"]
                    else:
                        self.log_test("Order Creation", False, "No campaigns available for testing")
                        return
                else:
                    self.log_test("Order Creation", False, "Could not fetch campaigns for order test")
                    return
            except Exception as e:
                self.log_test("Order Creation", False, f"Error fetching campaigns: {str(e)}")
                return
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            order_data = {
                "campaign_id": campaign_id,
                "selected_modalities": ["video", "text"],
                "custom_message": "Please focus on our premium product line and target tech professionals"
            }
            
            response = requests.post(
                f"{self.base_url}/orders",
                json=order_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                order = response.json()
                required_fields = ["id", "campaign_id", "selected_modalities", "total_cost"]
                missing_fields = [field for field in required_fields if field not in order]
                
                if not missing_fields:
                    self.log_test("Order Creation", True, 
                                f"Order created with cost: ${order['total_cost']}", 
                                {"id": order["id"], "modalities": order["selected_modalities"]})
                else:
                    self.log_test("Order Creation", False, 
                                f"Missing fields: {missing_fields}")
            else:
                self.log_test("Order Creation", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Order Creation", False, f"Connection error: {str(e)}")
    
    def test_get_my_orders(self):
        """Test getting user's orders (protected)"""
        if not self.auth_token:
            self.log_test("Get My Orders", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{self.base_url}/orders/my", headers=headers, timeout=10)
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    self.log_test("Get My Orders", True, 
                                f"Retrieved {len(orders)} orders", 
                                {"count": len(orders)})
                else:
                    self.log_test("Get My Orders", False, 
                                f"Expected list, got: {type(orders)}")
            else:
                self.log_test("Get My Orders", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get My Orders", False, f"Connection error: {str(e)}")
    
    def test_rating_system(self, campaign_id=None):
        """Test campaign rating system (protected)"""
        if not self.auth_token:
            self.log_test("Rating System", False, "No auth token available")
            return
            
        # Get a campaign ID if not provided
        if not campaign_id:
            try:
                response = requests.get(f"{self.base_url}/campaigns", timeout=10)
                if response.status_code == 200:
                    campaigns = response.json()
                    if campaigns:
                        campaign_id = campaigns[0]["id"]
                    else:
                        self.log_test("Rating System", False, "No campaigns available for rating")
                        return
                else:
                    self.log_test("Rating System", False, "Could not fetch campaigns for rating test")
                    return
            except Exception as e:
                self.log_test("Rating System", False, f"Error fetching campaigns: {str(e)}")
                return
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            rating_data = {
                "campaign_id": campaign_id,
                "rating": 5,
                "comment": "Excellent campaign with great results and professional execution!"
            }
            
            response = requests.post(
                f"{self.base_url}/ratings",
                json=rating_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if "message" in result:
                    self.log_test("Rating System", True, 
                                f"Rating submitted: {result['message']}", result)
                else:
                    self.log_test("Rating System", False, 
                                f"Unexpected response format: {result}")
            else:
                self.log_test("Rating System", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Rating System", False, f"Connection error: {str(e)}")
    
    def test_cors_headers(self):
        """Test CORS headers for mobile app access"""
        try:
            response = requests.options(f"{self.base_url}/health", timeout=10)
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            if cors_headers["Access-Control-Allow-Origin"]:
                self.log_test("CORS Headers", True, 
                            "CORS headers present for mobile access", cors_headers)
            else:
                # Try a regular GET request to check CORS
                response = requests.get(f"{self.base_url}/health", timeout=10)
                cors_origin = response.headers.get("Access-Control-Allow-Origin")
                if cors_origin:
                    self.log_test("CORS Headers", True, 
                                f"CORS enabled with origin: {cors_origin}")
                else:
                    self.log_test("CORS Headers", False, "No CORS headers found")
                
        except Exception as e:
            self.log_test("CORS Headers", False, f"Connection error: {str(e)}")
    
    def test_error_handling(self):
        """Test API error handling"""
        try:
            # Test invalid endpoint
            response = requests.get(f"{self.base_url}/invalid-endpoint", timeout=10)
            if response.status_code == 404:
                self.log_test("Error Handling - 404", True, "Invalid endpoint returns 404")
            else:
                self.log_test("Error Handling - 404", False, 
                            f"Expected 404, got {response.status_code}")
            
            # Test invalid JSON
            response = requests.post(
                f"{self.base_url}/auth/login",
                data="invalid json",
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            if response.status_code in [400, 422]:
                self.log_test("Error Handling - Invalid JSON", True, 
                            "Invalid JSON returns appropriate error")
            else:
                self.log_test("Error Handling - Invalid JSON", False, 
                            f"Expected 400/422, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Error Handling", False, f"Connection error: {str(e)}")
    
    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print(f"\n🚀 Starting Backend API Tests for: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity and health
        self.test_health_check()
        self.test_cors_headers()
        
        # Public endpoints
        self.test_campaigns_public()
        
        # Authentication flow
        self.test_protected_route_without_auth()
        self.test_user_registration()
        if not self.auth_token:
            self.test_user_login()
        
        # Protected endpoints (require authentication)
        if self.auth_token:
            self.test_protected_route_auth_me()
            campaign_id = self.test_campaign_creation()
            self.test_order_creation(campaign_id)
            self.test_get_my_orders()
            self.test_rating_system(campaign_id)
        
        # Error handling
        self.test_error_handling()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n✅ CRITICAL ENDPOINTS STATUS:")
        critical_tests = [
            "Health Check", "Campaigns API", "User Registration", 
            "User Login", "Protected Route /auth/me"
        ]
        
        for test_name in critical_tests:
            result = next((r for r in self.test_results if r["test"] == test_name), None)
            if result:
                status = "✅" if result["success"] else "❌"
                print(f"  {status} {test_name}")

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()