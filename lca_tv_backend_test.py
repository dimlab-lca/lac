#!/usr/bin/env python3
"""
LCA TV Burkina Faso Backend API Testing
Comprehensive testing for all backend endpoints after video playback fixes
"""

import requests
import json
import time
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env file
BACKEND_URL = "http://localhost:8001/api"

class LCATVBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.test_user_data = {
            "username": "lcatv_tester_2025",
            "email": "tester@lcatv.bf", 
            "password": "LCATest2025!",
            "full_name": "LCA TV Test User",
            "phone": "+22670123456"
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
                if data.get("status") == "healthy":
                    services = data.get("services", {})
                    db_status = services.get("database", "unknown")
                    youtube_status = services.get("youtube_api", "unknown")
                    
                    self.log_test("Health Check", True, 
                                f"Status: {data['status']}, DB: {db_status}, YouTube: {youtube_status}", data)
                else:
                    self.log_test("Health Check", False, 
                                f"Invalid response format: {data}")
            else:
                self.log_test("Health Check", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
    
    def test_youtube_latest_videos(self):
        """Test YouTube API integration - latest videos endpoint"""
        try:
            response = requests.get(f"{self.base_url}/videos/latest", timeout=15)
            
            if response.status_code == 200:
                videos = response.json()
                if isinstance(videos, list):
                    if len(videos) > 0:
                        # Check video structure
                        video = videos[0]
                        required_fields = ["id", "title", "description", "thumbnail", "published_at", "category"]
                        missing_fields = [field for field in required_fields if field not in video]
                        
                        if not missing_fields:
                            self.log_test("YouTube Latest Videos", True, 
                                        f"Retrieved {len(videos)} videos with valid structure", 
                                        {"count": len(videos), "sample_video": video["title"]})
                        else:
                            self.log_test("YouTube Latest Videos", False, 
                                        f"Missing fields in video: {missing_fields}")
                    else:
                        self.log_test("YouTube Latest Videos", True, 
                                    "No videos found but endpoint works (fallback data)", videos)
                else:
                    self.log_test("YouTube Latest Videos", False, 
                                f"Expected list, got: {type(videos)}")
            else:
                self.log_test("YouTube Latest Videos", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("YouTube Latest Videos", False, f"Connection error: {str(e)}")
    
    def test_youtube_live_current(self):
        """Test YouTube API integration - current live stream endpoint"""
        try:
            response = requests.get(f"{self.base_url}/live/current", timeout=10)
            
            if response.status_code == 200:
                live_data = response.json()
                required_fields = ["video_id", "title", "description", "thumbnail", "is_live"]
                missing_fields = [field for field in required_fields if field not in live_data]
                
                if not missing_fields:
                    self.log_test("YouTube Live Current", True, 
                                f"Live stream data: {live_data['title']}", 
                                {"video_id": live_data["video_id"], "is_live": live_data["is_live"]})
                else:
                    self.log_test("YouTube Live Current", False, 
                                f"Missing fields: {missing_fields}")
            else:
                self.log_test("YouTube Live Current", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("YouTube Live Current", False, f"Connection error: {str(e)}")
    
    def test_youtube_category_videos(self):
        """Test YouTube API integration - videos by category"""
        try:
            # Test with a common category
            category = "actualites"
            response = requests.get(f"{self.base_url}/videos/category/{category}", timeout=15)
            
            if response.status_code == 200:
                videos = response.json()
                if isinstance(videos, list):
                    self.log_test("YouTube Category Videos", True, 
                                f"Retrieved {len(videos)} videos for category '{category}'", 
                                {"category": category, "count": len(videos)})
                else:
                    self.log_test("YouTube Category Videos", False, 
                                f"Expected list, got: {type(videos)}")
            else:
                self.log_test("YouTube Category Videos", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("YouTube Category Videos", False, f"Connection error: {str(e)}")
    
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
                                f"User data retrieved: {user_data['username']}", 
                                {"username": user_data["username"], "email": user_data["email"]})
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
    
    def test_breaking_news_get(self):
        """Test breaking news retrieval"""
        try:
            response = requests.get(f"{self.base_url}/breaking-news", timeout=10)
            
            if response.status_code == 200:
                news = response.json()
                if isinstance(news, list):
                    if len(news) > 0:
                        # Check news structure
                        news_item = news[0]
                        required_fields = ["title", "content", "priority", "source", "category"]
                        missing_fields = [field for field in required_fields if field not in news_item]
                        
                        if not missing_fields:
                            self.log_test("Breaking News GET", True, 
                                        f"Retrieved {len(news)} breaking news items", 
                                        {"count": len(news), "sample_title": news_item["title"]})
                        else:
                            self.log_test("Breaking News GET", False, 
                                        f"Missing fields in news: {missing_fields}")
                    else:
                        self.log_test("Breaking News GET", True, 
                                    "No breaking news found but endpoint works", news)
                else:
                    self.log_test("Breaking News GET", False, 
                                f"Expected list, got: {type(news)}")
            else:
                self.log_test("Breaking News GET", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Breaking News GET", False, f"Connection error: {str(e)}")
    
    def test_breaking_news_create(self):
        """Test breaking news creation (protected)"""
        if not self.auth_token:
            self.log_test("Breaking News CREATE", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            news_data = {
                "title": "🔴 TEST - Actualité de Test LCA TV",
                "content": "Ceci est une actualité de test pour vérifier le bon fonctionnement de l'API LCA TV Burkina Faso.",
                "priority": "important",
                "source": "LCA TV Test",
                "category": "test"
            }
            
            response = requests.post(
                f"{self.base_url}/breaking-news",
                json=news_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                news = response.json()
                if "id" in news and news["title"] == news_data["title"]:
                    self.log_test("Breaking News CREATE", True, 
                                f"Breaking news created: {news['title']}", 
                                {"id": news.get("id"), "priority": news["priority"]})
                else:
                    self.log_test("Breaking News CREATE", False, 
                                f"Invalid response format: {news}")
            else:
                self.log_test("Breaking News CREATE", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Breaking News CREATE", False, f"Connection error: {str(e)}")
    
    def test_advertisement_creation(self):
        """Test advertisement creation (protected)"""
        if not self.auth_token:
            self.log_test("Advertisement Creation", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            ad_data = {
                "title": "Publicité Test LCA TV 2025",
                "description": "Campagne publicitaire de test pour vérifier l'API des annonces LCA TV",
                "duration_days": 7,
                "budget": 50000.0,
                "target_audience": "Téléspectateurs burkinabè, 18-65 ans",
                "ad_type": "video",
                "content_url": "https://example.com/test-ad-video.mp4"
            }
            
            response = requests.post(
                f"{self.base_url}/advertisements",
                json=ad_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                ad = response.json()
                if "id" in ad and ad["title"] == ad_data["title"]:
                    self.log_test("Advertisement Creation", True, 
                                f"Advertisement created: {ad['title']}", 
                                {"id": ad.get("id"), "budget": ad["budget"], "status": ad.get("status")})
                else:
                    self.log_test("Advertisement Creation", False, 
                                f"Invalid response format: {ad}")
            else:
                self.log_test("Advertisement Creation", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Advertisement Creation", False, f"Connection error: {str(e)}")
    
    def test_get_my_advertisements(self):
        """Test getting user's advertisements (protected)"""
        if not self.auth_token:
            self.log_test("Get My Advertisements", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{self.base_url}/advertisements/my", headers=headers, timeout=10)
            
            if response.status_code == 200:
                ads = response.json()
                if isinstance(ads, list):
                    self.log_test("Get My Advertisements", True, 
                                f"Retrieved {len(ads)} advertisements", 
                                {"count": len(ads)})
                else:
                    self.log_test("Get My Advertisements", False, 
                                f"Expected list, got: {type(ads)}")
            else:
                self.log_test("Get My Advertisements", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get My Advertisements", False, f"Connection error: {str(e)}")
    
    def test_analytics_overview(self):
        """Test analytics overview endpoint"""
        try:
            response = requests.get(f"{self.base_url}/analytics/overview", timeout=10)
            
            if response.status_code == 200:
                analytics = response.json()
                required_fields = ["total_users", "total_advertisements", "active_breaking_news"]
                missing_fields = [field for field in required_fields if field not in analytics]
                
                if not missing_fields:
                    self.log_test("Analytics Overview", True, 
                                f"Analytics data retrieved successfully", 
                                {"users": analytics["total_users"], "ads": analytics["total_advertisements"]})
                else:
                    self.log_test("Analytics Overview", False, 
                                f"Missing fields: {missing_fields}")
            else:
                self.log_test("Analytics Overview", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Analytics Overview", False, f"Connection error: {str(e)}")
    
    def test_download_package(self):
        """Test download package endpoint"""
        try:
            response = requests.get(f"{self.base_url}/download/package", timeout=15)
            
            if response.status_code == 200:
                # Check if it's JSON response
                try:
                    package_data = response.json()
                    if "app_info" in package_data and "installation_guide" in package_data:
                        self.log_test("Download Package", True, 
                                    f"Package generated successfully: {package_data['app_info']['name']}", 
                                    {"version": package_data["app_info"]["version"]})
                    else:
                        self.log_test("Download Package", False, 
                                    "Invalid package format")
                except json.JSONDecodeError:
                    # Might be binary data
                    content_type = response.headers.get("Content-Type", "")
                    if "application" in content_type:
                        self.log_test("Download Package", True, 
                                    f"Package download ready, size: {len(response.content)} bytes")
                    else:
                        self.log_test("Download Package", False, 
                                    "Invalid response format")
            else:
                self.log_test("Download Package", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Download Package", False, f"Connection error: {str(e)}")
    
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
    
    def run_all_tests(self):
        """Run comprehensive LCA TV backend API tests"""
        print(f"\n🇧🇫 Starting LCA TV Burkina Faso Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 70)
        
        # 1. Health Check
        self.test_health_check()
        self.test_cors_headers()
        
        # 2. YouTube API Integration (as requested)
        print("\n📺 YouTube API Integration Tests:")
        self.test_youtube_latest_videos()
        self.test_youtube_live_current()
        self.test_youtube_category_videos()
        
        # 3. Authentication System (as requested)
        print("\n🔐 Authentication System Tests:")
        self.test_protected_route_without_auth()
        self.test_user_registration()
        if not self.auth_token:
            self.test_user_login()
        
        # 4. Protected endpoints (require authentication)
        if self.auth_token:
            print("\n🛡️ Protected Endpoints Tests:")
            self.test_protected_route_auth_me()
            
            # 5. Breaking News Endpoints (as requested)
            print("\n📰 Breaking News Tests:")
            self.test_breaking_news_get()
            self.test_breaking_news_create()
            
            # 6. Advertisement System
            print("\n📢 Advertisement System Tests:")
            self.test_advertisement_creation()
            self.test_get_my_advertisements()
        
        # 7. Analytics and Download Package (as requested)
        print("\n📊 Analytics & Download Tests:")
        self.test_analytics_overview()
        self.test_download_package()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 70)
        print("📊 LCA TV BACKEND API TEST SUMMARY")
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
        
        print("\n✅ CRITICAL ENDPOINTS STATUS (as requested):")
        critical_tests = [
            "Health Check", 
            "YouTube Latest Videos", 
            "YouTube Live Current",
            "User Registration", 
            "User Login", 
            "Protected Route /auth/me",
            "Breaking News GET",
            "Download Package"
        ]
        
        for test_name in critical_tests:
            result = next((r for r in self.test_results if r["test"] == test_name), None)
            if result:
                status = "✅" if result["success"] else "❌"
                print(f"  {status} {test_name}")
            else:
                print(f"  ⚠️  {test_name} (not tested)")
        
        print(f"\n🇧🇫 LCA TV Burkina Faso Backend API Testing Complete!")

if __name__ == "__main__":
    tester = LCATVBackendTester()
    tester.run_all_tests()