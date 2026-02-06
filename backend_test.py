#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class GreenForgeAPITester:
    def __init__(self, base_url="https://greenscale-co.preview.emergentagent.com/api"):
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

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "email": f"test_user_{timestamp}@greenforge.com",
            "password": "TestPassword123!",
            "full_name": f"Test User {timestamp}",
            "company_name": f"Test Company {timestamp}"
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
            self.token = response['token']
            self.user_data = response['user']
            self.log(f"Registered user: {test_user['email']}")
            return True, response
        return False, {}

    def test_user_login(self):
        """Test user login with existing test user"""
        login_data = {
            "email": "test@greenforge.com",
            "password": "test123"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "/auth/login",
            200,
            login_data,
            auth_required=False
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            return True, response
        return False, {}

    def test_get_profile(self):
        """Test getting user profile"""
        return self.run_test("Get User Profile", "GET", "/auth/me", 200)

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        return self.run_test("Dashboard Stats", "GET", "/dashboard/stats", 200)

    def test_inventory_operations(self):
        """Test inventory CRUD operations"""
        results = []
        
        # Test get plants (empty list is OK)
        success, _ = self.run_test("Get Plants", "GET", "/inventory/plants", 200)
        results.append(success)
        
        # Test create plant
        plant_data = {
            "name": "Test Monstera",
            "scientific_name": "Monstera deliciosa",
            "category": "Indoor Plants",
            "growth_stage": "mature",
            "price": 45.99,
            "cost": 20.00,
            "quantity": 10,
            "min_stock": 5,
            "location": "greenhouse-1",
            "description": "Beautiful test plant"
        }
        
        success, response = self.run_test("Create Plant", "POST", "/inventory/plants", 200, plant_data)
        results.append(success)
        
        if success and 'id' in response:
            plant_id = response['id']
            
            # Test get specific plant
            success, _ = self.run_test(f"Get Plant {plant_id}", "GET", f"/inventory/plants/{plant_id}", 200)
            results.append(success)
            
            # Test update plant
            update_data = {"quantity": 15, "price": 49.99}
            success, _ = self.run_test(f"Update Plant {plant_id}", "PUT", f"/inventory/plants/{plant_id}", 200, update_data)
            results.append(success)
            
            # Test get categories and locations
            success, _ = self.run_test("Get Categories", "GET", "/inventory/categories", 200)
            results.append(success)
            
            success, _ = self.run_test("Get Locations", "GET", "/inventory/locations", 200)
            results.append(success)
        
        return all(results)

    def test_crm_operations(self):
        """Test CRM CRUD operations"""
        results = []
        
        # Test get leads
        success, _ = self.run_test("Get Leads", "GET", "/crm/leads", 200)
        results.append(success)
        
        # Test create lead
        lead_data = {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "phone": "+1234567890",
            "company": "Smith Gardens",
            "source": "website",
            "notes": "Interested in landscape design"
        }
        
        success, response = self.run_test("Create Lead", "POST", "/crm/leads", 200, lead_data)
        results.append(success)
        
        if success and 'id' in response:
            lead_id = response['id']
            
            # Test update lead status
            update_data = {"status": "contacted"}
            success, _ = self.run_test(f"Update Lead {lead_id}", "PUT", f"/crm/leads/{lead_id}", 200, update_data)
            results.append(success)
        
        return all(results)

    def test_project_operations(self):
        """Test Project management operations"""
        results = []
        
        # Test get projects
        success, _ = self.run_test("Get Projects", "GET", "/projects", 200)
        results.append(success)
        
        # Test create project
        project_data = {
            "name": "Garden Redesign Project",
            "client_name": "Jane Doe",
            "client_email": "jane.doe@example.com",
            "description": "Complete backyard redesign",
            "start_date": "2026-01-15T00:00:00Z",
            "end_date": "2026-03-15T00:00:00Z",
            "budget": 5000.00,
            "project_type": "landscaping"
        }
        
        success, response = self.run_test("Create Project", "POST", "/projects", 200, project_data)
        results.append(success)
        
        if success and 'id' in response:
            project_id = response['id']
            
            # Test get specific project
            success, _ = self.run_test(f"Get Project {project_id}", "GET", f"/projects/{project_id}", 200)
            results.append(success)
            
            # Test get project tasks
            success, _ = self.run_test(f"Get Project Tasks", "GET", f"/projects/{project_id}/tasks", 200)
            results.append(success)
        
        return all(results)

    def test_partner_operations(self):
        """Test Partner management operations"""
        results = []
        
        # Test get partners
        success, _ = self.run_test("Get Partners", "GET", "/partners", 200)
        results.append(success)
        
        # Test create partner
        partner_data = {
            "name": "Mike Johnson",
            "email": "mike.johnson@example.com",
            "phone": "+1987654321",
            "company": "Johnson Sales",
            "commission_rate": 12.5
        }
        
        success, response = self.run_test("Create Partner", "POST", "/partners", 200, partner_data)
        results.append(success)
        
        if success and 'id' in response:
            partner_id = response['id']
            
            # Test get specific partner
            success, _ = self.run_test(f"Get Partner {partner_id}", "GET", f"/partners/{partner_id}", 200)
            results.append(success)
        
        return all(results)

    def test_amc_operations(self):
        """Test AMC subscription operations"""
        results = []
        
        # Test get subscriptions
        success, _ = self.run_test("Get AMC Subscriptions", "GET", "/amc/subscriptions", 200)
        results.append(success)
        
        # Test create subscription
        subscription_data = {
            "client_name": "Green Valley Resort",
            "client_email": "manager@greenvalley.com",
            "client_phone": "+1555000123",
            "service_type": "lawn_maintenance",
            "frequency": "monthly",
            "amount": 250.00,
            "start_date": "2026-01-01T00:00:00Z",
            "property_address": "123 Valley Road, Green City",
            "notes": "Monthly lawn care service"
        }
        
        success, response = self.run_test("Create AMC Subscription", "POST", "/amc/subscriptions", 200, subscription_data)
        results.append(success)
        
        # Test get invoices
        success, _ = self.run_test("Get AMC Invoices", "GET", "/amc/invoices", 200)
        results.append(success)
        
        return all(results)

    def test_store_operations(self):
        """Test E-commerce store operations"""
        results = []
        
        # Test get products (public endpoint)
        success, _ = self.run_test("Get Store Products", "GET", "/store/products", 200, auth_required=False)
        results.append(success)
        
        # Test get orders (requires auth)
        success, _ = self.run_test("Get Orders", "GET", "/store/orders", 200)
        results.append(success)
        
        return all(results)

    def test_courses_operations(self):
        """Test Courses operations"""
        results = []
        
        # Test get courses (public endpoint)
        success, _ = self.run_test("Get Courses", "GET", "/courses", 200, auth_required=False)
        results.append(success)
        
        return all(results)

    def run_comprehensive_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting GreenForge OS API Tests")
        self.log("=" * 50)
        
        # Health check (no auth required)
        self.test_health_check()
        
        # Try login with existing test user first
        login_success, _ = self.test_user_login()
        
        # If login fails, try registration
        if not login_success:
            self.log("Login with test user failed, trying registration")
            reg_success, _ = self.test_user_registration()
            if not reg_success:
                self.log("❌ Cannot authenticate - stopping tests", "CRITICAL")
                return
        
        # Profile tests
        self.test_get_profile()
        
        # Dashboard tests
        self.test_dashboard_stats()
        
        # Feature module tests
        self.log("\n📊 Testing Inventory Module")
        self.test_inventory_operations()
        
        self.log("\n👥 Testing CRM Module")
        self.test_crm_operations()
        
        self.log("\n📋 Testing Projects Module")  
        self.test_project_operations()
        
        self.log("\n🤝 Testing Partners Module")
        self.test_partner_operations()
        
        self.log("\n📅 Testing AMC Module")
        self.test_amc_operations()
        
        self.log("\n🛒 Testing Store Module")
        self.test_store_operations()
        
        self.log("\n🎓 Testing Courses Module")
        self.test_courses_operations()
        
        # Summary
        self.log("\n" + "=" * 50)
        self.log(f"📊 Tests Summary:")
        self.log(f"Total Tests: {self.tests_run}")
        self.log(f"Passed: {self.tests_passed}")
        self.log(f"Failed: {len(self.failed_tests)}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            self.log("\n❌ Failed Tests:")
            for failure in self.failed_tests[:5]:  # Show first 5 failures
                self.log(f"  - {failure.get('test', 'Unknown')}: {failure}")
        
        return self.tests_passed, self.tests_run, self.failed_tests

def main():
    tester = GreenForgeAPITester()
    passed, total, failures = tester.run_comprehensive_tests()
    
    # Exit code: 0 if all passed, 1 if any failed
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())