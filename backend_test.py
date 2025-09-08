#!/usr/bin/env python3
"""
LCA TV Dashboard Backend API Testing
Comprehensive testing for the advertising management dashboard system
"""

import requests
import json
import time
from datetime import datetime, timedelta
import sys
import uuid

# Backend URL - using localhost as per the configuration
BACKEND_URL = "http://localhost:8001/api"

class LCATVBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.test_results = []
        self.created_client_id = None
        self.created_ad_space_id = None
        self.created_order_id = None
        
        # Test data for admin user
        self.test_admin_data = {
            "username": "testadmin",
            "email": "test@lcatv.bf",
            "password": "test123",
            "full_name": "Test Administrator",
            "role": "admin"
        }
        
        # Test data for client
        self.test_client_data = {
            "company_name": "Test Company Ltd",
            "contact_person": "John Doe",
            "email": "john@testcompany.bf",
            "phone": "+226 70 12 34 56",
            "address": "123 Test Street, Ouagadougou"
        }
        
        # Test data for ad space
        self.test_ad_space_data = {
            "name": "Test Banner Space",
            "position": "header",
            "dimensions": {"width": 728, "height": 90},
            "price_per_day": 5000.0,
            "price_per_week": 30000.0,
            "price_per_month": 100000.0
        }
        
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
                if (data.get("status") == "healthy" and 
                    "services" in data and 
                    "database" in data["services"]):
                    self.log_test("Health Check", True, 
                                f"Status: {data['status']}, DB: {data['services']['database']}", data)
                else:
                    self.log_test("Health Check", False, 
                                f"Invalid response format: {data}")
            else:
                self.log_test("Health Check", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
    
    def test_admin_user_creation(self):
        """Test admin user creation"""
        try:
            response = requests.post(
                f"{self.base_url}/admin/users",
                json=self.test_admin_data,
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                required_fields = ["id", "username", "email", "full_name", "role"]
                missing_fields = [field for field in required_fields if field not in user_data]
                
                if not missing_fields:
                    self.log_test("Admin User Creation", True, 
                                f"Admin user created: {user_data['username']}", user_data)
                else:
                    self.log_test("Admin User Creation", False, 
                                f"Missing fields: {missing_fields}")
            elif response.status_code == 400:
                # User might already exist
                self.log_test("Admin User Creation", True, 
                            "Admin user already exists (expected for repeated tests)")
            else:
                self.log_test("Admin User Creation", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Admin User Creation", False, f"Connection error: {str(e)}")
    
    def test_get_admin_users(self):
        """Test getting admin users list"""
        try:
            response = requests.get(f"{self.base_url}/admin/users", timeout=10)
            
            if response.status_code == 200:
                users = response.json()
                if isinstance(users, list):
                    self.log_test("Get Admin Users", True, 
                                f"Retrieved {len(users)} admin users", 
                                {"count": len(users)})
                else:
                    self.log_test("Get Admin Users", False, 
                                f"Expected list, got: {type(users)}")
            else:
                self.log_test("Get Admin Users", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Admin Users", False, f"Connection error: {str(e)}")
    
    def test_client_management(self):
        """Test client management CRUD operations"""
        # Test GET clients (should return sample clients)
        try:
            response = requests.get(f"{self.base_url}/admin/clients", timeout=10)
            
            if response.status_code == 200:
                clients = response.json()
                if isinstance(clients, list):
                    # Check for sample clients
                    client_names = [client.get("company_name", "") for client in clients]
                    expected_clients = ["Orange", "Moov", "Banque Atlantique"]
                    found_samples = [name for name in expected_clients if any(name in client_name for client_name in client_names)]
                    
                    self.log_test("Get Clients", True, 
                                f"Retrieved {len(clients)} clients, found samples: {found_samples}", 
                                {"count": len(clients), "samples": found_samples})
                else:
                    self.log_test("Get Clients", False, 
                                f"Expected list, got: {type(clients)}")
            else:
                self.log_test("Get Clients", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Clients", False, f"Connection error: {str(e)}")
        
        # Test POST client (create new client)
        try:
            response = requests.post(
                f"{self.base_url}/admin/clients",
                json=self.test_client_data,
                timeout=10
            )
            
            if response.status_code == 200:
                client = response.json()
                if "id" in client and client["company_name"] == self.test_client_data["company_name"]:
                    self.created_client_id = client["id"]
                    self.log_test("Create Client", True, 
                                f"Client created: {client['company_name']}", client)
                else:
                    self.log_test("Create Client", False, 
                                f"Invalid response format: {client}")
            else:
                self.log_test("Create Client", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Create Client", False, f"Connection error: {str(e)}")
        
        # Test PUT client (update client) if we created one
        if self.created_client_id:
            try:
                updated_data = self.test_client_data.copy()
                updated_data["company_name"] = "Updated Test Company Ltd"
                
                response = requests.put(
                    f"{self.base_url}/admin/clients/{self.created_client_id}",
                    json=updated_data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    client = response.json()
                    if client["company_name"] == updated_data["company_name"]:
                        self.log_test("Update Client", True, 
                                    f"Client updated: {client['company_name']}")
                    else:
                        self.log_test("Update Client", False, 
                                    f"Update failed: {client}")
                else:
                    self.log_test("Update Client", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test("Update Client", False, f"Connection error: {str(e)}")
    
    def test_ad_spaces_management(self):
        """Test ad spaces management"""
        # Test GET ad spaces (should return sample ad spaces)
        try:
            response = requests.get(f"{self.base_url}/admin/ad-spaces", timeout=10)
            
            if response.status_code == 200:
                ad_spaces = response.json()
                if isinstance(ad_spaces, list):
                    # Check for sample ad spaces
                    space_names = [space.get("name", "") for space in ad_spaces]
                    expected_spaces = ["Header Banner", "Sidebar", "Footer", "Video Pre-Roll"]
                    found_samples = [name for name in expected_spaces if any(name in space_name for space_name in space_names)]
                    
                    self.log_test("Get Ad Spaces", True, 
                                f"Retrieved {len(ad_spaces)} ad spaces, found samples: {found_samples}", 
                                {"count": len(ad_spaces), "samples": found_samples})
                else:
                    self.log_test("Get Ad Spaces", False, 
                                f"Expected list, got: {type(ad_spaces)}")
            else:
                self.log_test("Get Ad Spaces", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Ad Spaces", False, f"Connection error: {str(e)}")
        
        # Test POST ad space (create new ad space)
        try:
            response = requests.post(
                f"{self.base_url}/admin/ad-spaces",
                json=self.test_ad_space_data,
                timeout=10
            )
            
            if response.status_code == 200:
                ad_space = response.json()
                if "id" in ad_space and ad_space["name"] == self.test_ad_space_data["name"]:
                    self.created_ad_space_id = ad_space["id"]
                    self.log_test("Create Ad Space", True, 
                                f"Ad space created: {ad_space['name']}", ad_space)
                else:
                    self.log_test("Create Ad Space", False, 
                                f"Invalid response format: {ad_space}")
            else:
                self.log_test("Create Ad Space", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Create Ad Space", False, f"Connection error: {str(e)}")
    
    def test_order_management(self):
        """Test order management system"""
        # Test GET orders
        try:
            response = requests.get(f"{self.base_url}/admin/ad-orders", timeout=10)
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    self.log_test("Get Orders", True, 
                                f"Retrieved {len(orders)} orders", 
                                {"count": len(orders)})
                else:
                    self.log_test("Get Orders", False, 
                                f"Expected list, got: {type(orders)}")
            else:
                self.log_test("Get Orders", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Orders", False, f"Connection error: {str(e)}")
        
        # Test POST order (create new order) if we have client and ad space
        if self.created_client_id and self.created_ad_space_id:
            try:
                order_data = {
                    "client_id": self.created_client_id,
                    "ad_space_id": self.created_ad_space_id,
                    "content_type": "image",
                    "content_url": "https://example.com/test-ad.jpg",
                    "start_date": datetime.now().isoformat(),
                    "end_date": (datetime.now() + timedelta(days=7)).isoformat()
                }
                
                response = requests.post(
                    f"{self.base_url}/admin/ad-orders",
                    json=order_data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    order = response.json()
                    if "id" in order and "total_amount" in order:
                        self.created_order_id = order["id"]
                        self.log_test("Create Order", True, 
                                    f"Order created with amount: {order['total_amount']}", order)
                    else:
                        self.log_test("Create Order", False, 
                                    f"Invalid response format: {order}")
                else:
                    self.log_test("Create Order", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test("Create Order", False, f"Connection error: {str(e)}")
        
        # Test PUT order status update if we created an order
        if self.created_order_id:
            try:
                status_data = {
                    "status": "active",
                    "payment_status": "paid"
                }
                
                response = requests.put(
                    f"{self.base_url}/admin/ad-orders/{self.created_order_id}/status",
                    json=status_data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    self.log_test("Update Order Status", True, 
                                f"Order status updated: {result.get('message', 'Success')}")
                else:
                    self.log_test("Update Order Status", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test("Update Order Status", False, f"Connection error: {str(e)}")
    
    def test_dashboard_analytics(self):
        """Test dashboard analytics endpoints"""
        # Test dashboard stats
        try:
            response = requests.get(f"{self.base_url}/admin/dashboard/stats", timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_clients", "active_orders", "monthly_revenue", 
                                 "total_impressions", "total_clicks", "pending_payments"]
                missing_fields = [field for field in required_fields if field not in stats]
                
                if not missing_fields:
                    self.log_test("Dashboard Stats", True, 
                                f"Stats retrieved: {stats['total_clients']} clients, "
                                f"{stats['active_orders']} active orders", stats)
                else:
                    self.log_test("Dashboard Stats", False, 
                                f"Missing fields: {missing_fields}")
            else:
                self.log_test("Dashboard Stats", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Connection error: {str(e)}")
        
        # Test revenue analytics
        try:
            response = requests.get(f"{self.base_url}/admin/analytics/revenue", timeout=10)
            
            if response.status_code == 200:
                revenue_data = response.json()
                if "monthly_revenue" in revenue_data and "total_revenue" in revenue_data:
                    self.log_test("Revenue Analytics", True, 
                                f"Revenue data retrieved: Total {revenue_data['total_revenue']}", 
                                revenue_data)
                else:
                    self.log_test("Revenue Analytics", False, 
                                f"Invalid response format: {revenue_data}")
            else:
                self.log_test("Revenue Analytics", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Revenue Analytics", False, f"Connection error: {str(e)}")
        
        # Test performance analytics
        try:
            response = requests.get(f"{self.base_url}/admin/analytics/performance", timeout=10)
            
            if response.status_code == 200:
                performance_data = response.json()
                if "performance_data" in performance_data and "total_impressions" in performance_data:
                    self.log_test("Performance Analytics", True, 
                                f"Performance data retrieved: {performance_data['total_impressions']} impressions", 
                                performance_data)
                else:
                    self.log_test("Performance Analytics", False, 
                                f"Invalid response format: {performance_data}")
            else:
                self.log_test("Performance Analytics", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Performance Analytics", False, f"Connection error: {str(e)}")
    
    def test_public_api(self):
        """Test public API for ad display and tracking"""
        # Test get ads for position
        positions = ["header", "sidebar", "footer", "video"]
        
        for position in positions:
            try:
                response = requests.get(f"{self.base_url}/public/ads/{position}", timeout=10)
                
                if response.status_code == 200:
                    ads_data = response.json()
                    if "ads" in ads_data and isinstance(ads_data["ads"], list):
                        self.log_test(f"Public API - Get Ads ({position})", True, 
                                    f"Retrieved {len(ads_data['ads'])} ads for {position}", 
                                    {"position": position, "count": len(ads_data["ads"])})
                    else:
                        self.log_test(f"Public API - Get Ads ({position})", False, 
                                    f"Invalid response format: {ads_data}")
                else:
                    self.log_test(f"Public API - Get Ads ({position})", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Public API - Get Ads ({position})", False, f"Connection error: {str(e)}")
        
        # Test ad click recording if we have an order
        if self.created_order_id:
            try:
                response = requests.post(f"{self.base_url}/public/ads/{self.created_order_id}/click", timeout=10)
                
                if response.status_code == 200:
                    result = response.json()
                    self.log_test("Public API - Record Click", True, 
                                f"Click recorded: {result.get('message', 'Success')}")
                else:
                    self.log_test("Public API - Record Click", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_test("Public API - Record Click", False, f"Connection error: {str(e)}")
    
    def test_error_handling(self):
        """Test API error handling"""
        # Test invalid endpoint
        try:
            response = requests.get(f"{self.base_url}/invalid-endpoint", timeout=10)
            if response.status_code == 404:
                self.log_test("Error Handling - 404", True, "Invalid endpoint returns 404")
            else:
                self.log_test("Error Handling - 404", False, 
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - 404", False, f"Connection error: {str(e)}")
        
        # Test invalid client ID
        try:
            response = requests.get(f"{self.base_url}/admin/clients/invalid-id", timeout=10)
            if response.status_code in [400, 404]:
                self.log_test("Error Handling - Invalid ID", True, 
                            "Invalid ID returns appropriate error")
            else:
                self.log_test("Error Handling - Invalid ID", False, 
                            f"Expected 400/404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Invalid ID", False, f"Connection error: {str(e)}")
    
    def cleanup_test_data(self):
        """Clean up test data created during testing"""
        # Delete test client
        if self.created_client_id:
            try:
                response = requests.delete(f"{self.base_url}/admin/clients/{self.created_client_id}", timeout=10)
                if response.status_code == 200:
                    self.log_test("Cleanup - Delete Client", True, "Test client deleted")
            except:
                pass
    
    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print(f"\n🚀 Starting LCA TV Dashboard Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 70)
        
        # 1. Health Check & Database Connection
        print("\n📋 1. HEALTH CHECK & DATABASE CONNECTION")
        self.test_health_check()
        
        # 2. Admin User Management
        print("\n👥 2. ADMIN USER MANAGEMENT")
        self.test_admin_user_creation()
        self.test_get_admin_users()
        
        # 3. Client Management System
        print("\n🏢 3. CLIENT MANAGEMENT SYSTEM")
        self.test_client_management()
        
        # 4. Ad Spaces Management
        print("\n📺 4. AD SPACES MANAGEMENT")
        self.test_ad_spaces_management()
        
        # 5. Order Management System
        print("\n📋 5. ORDER MANAGEMENT SYSTEM")
        self.test_order_management()
        
        # 6. Dashboard Analytics
        print("\n📊 6. DASHBOARD ANALYTICS")
        self.test_dashboard_analytics()
        
        # 7. Public API for Ad Display
        print("\n🌐 7. PUBLIC API FOR AD DISPLAY")
        self.test_public_api()
        
        # 8. Error Handling
        print("\n⚠️  8. ERROR HANDLING")
        self.test_error_handling()
        
        # Cleanup
        print("\n🧹 9. CLEANUP")
        self.cleanup_test_data()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 70)
        print("📊 LCA TV DASHBOARD BACKEND TEST SUMMARY")
        print("=" * 70)
        
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
            "Health Check", "Get Admin Users", "Get Clients", 
            "Get Ad Spaces", "Get Orders", "Dashboard Stats"
        ]
        
        for test_name in critical_tests:
            result = next((r for r in self.test_results if r["test"] == test_name), None)
            if result:
                status = "✅" if result["success"] else "❌"
                print(f"  {status} {test_name}")
        
        # Sample data verification
        print("\n📋 SAMPLE DATA VERIFICATION:")
        client_result = next((r for r in self.test_results if r["test"] == "Get Clients"), None)
        if client_result and client_result["success"]:
            samples = client_result.get("response_data", {}).get("samples", [])
            print(f"  📊 Sample Clients Found: {samples}")
        
        space_result = next((r for r in self.test_results if r["test"] == "Get Ad Spaces"), None)
        if space_result and space_result["success"]:
            samples = space_result.get("response_data", {}).get("samples", [])
            print(f"  📺 Sample Ad Spaces Found: {samples}")

if __name__ == "__main__":
    tester = LCATVBackendTester()
    tester.run_all_tests()