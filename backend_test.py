#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class GreenArcadianAPITester:
    def __init__(self, base_url="https://multi-portal-preview.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"Testing {name} - {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200] if response.text else 'No response'
                })
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"Response: {response.text[:200]}", "ERROR")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            self.log(f"❌ {name} - Network Error: {str(e)}", "FAIL")
            return False, {}

    def test_health_check(self):
        """Test API health endpoint"""
        return self.run_test("API Health Check", "GET", "/health", 200, auth_required=False)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("API Root", "GET", "/", 200, auth_required=False)

    # Public Endpoints Tests
    def test_public_products(self):
        """Test public products endpoint"""
        return self.run_test("Get Public Products", "GET", "/products", 200, auth_required=False)

    def test_categories(self):
        """Test categories endpoint"""
        return self.run_test("Get Categories", "GET", "/categories", 200, auth_required=False)

    def test_create_inquiry(self):
        """Test creating inquiry"""
        inquiry_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+1234567890",
            "company": "Test Company", 
            "inquiry_type": "general",
            "message": "This is a test inquiry"
        }
        return self.run_test("Create Inquiry", "POST", "/inquiries", 200, inquiry_data, auth_required=False)

    def test_create_public_order(self):
        """Test creating public order"""
        order_data = {
            "customer_name": "Test Customer",
            "customer_email": "customer@example.com",
            "customer_phone": "+1234567890",
            "customer_address": "123 Test Street, Test City",
            "items": [
                {"id": "1", "name": "Test Product", "price": 50, "quantity": 2}
            ],
            "subtotal": 100.0,
            "shipping": 10.0,
            "total": 110.0,
            "notes": "Test order"
        }
        return self.run_test("Create Public Order", "POST", "/orders/public", 200, order_data, auth_required=False)

    # Auth Tests
    def test_admin_login(self):
        """Test admin login with provided credentials"""
        login_data = {
            "email": "test@greenarcadian.com",
            "password": "test123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/auth/login", 
            200,
            login_data,
            auth_required=False
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            self.log(f"Logged in as: {response['user']['email']}")
            return True, response
        return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "email": f"test_user_{timestamp}@greenarcadian.com",
            "password": "TestPassword123!",
            "full_name": f"Test User {timestamp}",
            "role": "admin"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST", 
            "/auth/register",
            200,
            test_user,
            auth_required=False
        )
        
        if success and 'token' in response:
            # Store token for later use if login fails
            if not self.token:
                self.token = response['token']
                self.user_data = response['user']
            return True, response
        return False, {}

    def test_get_profile(self):
        """Test getting user profile"""
        return self.run_test("Get User Profile", "GET", "/auth/me", 200)

    # Admin Tests  
    def test_admin_dashboard(self):
        """Test admin dashboard stats"""
        return self.run_test("Admin Dashboard Stats", "GET", "/admin/dashboard", 200)

    def test_admin_inventory_get(self):
        """Test getting inventory"""
        return self.run_test("Get Admin Inventory", "GET", "/admin/inventory", 200)

    def test_admin_inventory_create(self):
        """Test creating product in inventory"""
        product_data = {
            "name": "Test Rose Bouquet",
            "category": "Bouquets",
            "price": 75.99,
            "description": "Beautiful test bouquet",
            "care_info": "Keep in cool place",
            "image_url": "https://example.com/test-rose.jpg",
            "stock": 25,
            "unit": "piece",
            "is_featured": True,
            "is_available": True
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "/admin/inventory",
            200,
            product_data
        )
        
        if success and 'id' in response:
            # Test get specific product
            product_id = response['id']
            self.run_test(f"Get Product {product_id}", "GET", f"/products/{product_id}", 200, auth_required=False)
            
            # Test update product
            update_data = {"price": 79.99, "stock": 30}
            self.run_test(f"Update Product {product_id}", "PUT", f"/admin/inventory/{product_id}", 200, update_data)
            
            return True, response
        
        return success, response

    def test_admin_orders(self):
        """Test admin orders endpoint"""
        return self.run_test("Get Admin Orders", "GET", "/admin/orders", 200)

    def test_admin_customers_get(self):
        """Test getting customers"""
        return self.run_test("Get Admin Customers", "GET", "/admin/customers", 200)

    def test_admin_customers_create(self):
        """Test creating customer"""
        customer_data = {
            "name": "Test Customer",
            "email": "testcustomer@example.com",
            "phone": "+1234567890",
            "company": "Test Company",
            "address": "123 Test Street",
            "customer_type": "retail",
            "notes": "Test customer record"
        }
        return self.run_test("Create Customer", "POST", "/admin/customers", 200, customer_data)

    def test_admin_inquiries(self):
        """Test admin inquiries endpoint"""
        return self.run_test("Get Admin Inquiries", "GET", "/admin/inquiries", 200)

    def test_admin_exports(self):
        """Test admin export docs endpoint"""
        return self.run_test("Get Admin Export Docs", "GET", "/admin/exports", 200)

    def run_comprehensive_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting Green Arcadian API Tests")
        self.log("=" * 60)
        
        # Test public endpoints first
        self.log("\n🌍 Testing Public Endpoints")
        self.test_root_endpoint()
        self.test_health_check()
        self.test_public_products()
        self.test_categories()
        self.test_create_inquiry()
        self.test_create_public_order()
        
        # Try admin login first
        self.log("\n🔐 Testing Authentication")
        login_success, _ = self.test_admin_login()
        
        # If login fails, try registration
        if not login_success:
            self.log("Admin login failed, trying registration")
            reg_success, _ = self.test_user_registration()
            if not reg_success:
                self.log("❌ Cannot authenticate - stopping admin tests", "CRITICAL")
                # Still continue with summary of public tests
            else:
                login_success = True
        
        # Test authenticated endpoints
        if login_success and self.token:
            self.test_get_profile()
            
            self.log("\n📊 Testing Admin Dashboard")
            self.test_admin_dashboard()
            
            self.log("\n📦 Testing Admin Inventory")
            self.test_admin_inventory_get()
            self.test_admin_inventory_create()
            
            self.log("\n🛒 Testing Admin Orders")
            self.test_admin_orders()
            
            self.log("\n👥 Testing Admin Customers")
            self.test_admin_customers_get()
            self.test_admin_customers_create()
            
            self.log("\n📧 Testing Admin Inquiries")
            self.test_admin_inquiries()
            
            self.log("\n📋 Testing Admin Export Docs")
            self.test_admin_exports()
        
        # Summary
        self.log("\n" + "=" * 60)
        self.log(f"📊 Green Arcadian API Tests Summary:")
        self.log(f"Total Tests: {self.tests_run}")
        self.log(f"Passed: {self.tests_passed}")
        self.log(f"Failed: {len(self.failed_tests)}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            self.log("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                test_name = failure.get('test', 'Unknown')
                if 'error' in failure:
                    self.log(f"  - {test_name}: {failure['error']}")
                else:
                    self.log(f"  - {test_name}: Expected {failure.get('expected')}, got {failure.get('actual')}")
                    if failure.get('response'):
                        self.log(f"    Response: {failure['response']}")
        
        return self.tests_passed, self.tests_run, self.failed_tests

def main():
    tester = GreenArcadianAPITester()
    passed, total, failures = tester.run_comprehensive_tests()
    
    # Exit code: 0 if all passed, 1 if any failed
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())