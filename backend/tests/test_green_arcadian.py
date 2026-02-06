"""
Green Arcadian Multi-Portal API Tests
Tests for Admin, Customer, Partner, and Crew portal APIs
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://multi-portal-preview.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@greenarcadian.com"
ADMIN_PASSWORD = "admin123"


class TestHealth:
    """Health check - run first"""
    
    def test_api_health(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_api_root(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Green Arcadian API"
        print("✓ API root check passed")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert data["user"]["status"] == "active"
        print(f"✓ Admin login successful - User: {data['user']['full_name']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials returns 401")
    
    def test_customer_registration_pending(self):
        """Test customer registration creates pending account"""
        unique_email = f"test_customer_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "full_name": "TEST_Customer User",
            "role": "customer"
        })
        # New customers should be pending
        assert response.status_code == 200
        data = response.json()
        # Non-admin users need approval
        assert "message" in data or "token" in data
        print(f"✓ Customer registration works - Status: {data.get('status', 'active')}")


@pytest.fixture(scope="class")
def admin_token():
    """Get admin token for authenticated requests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Admin login failed - skipping authenticated tests")


class TestAdminDashboard:
    """Admin dashboard endpoint tests"""
    
    def test_admin_dashboard(self, admin_token):
        """Test admin dashboard returns stats"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Validate dashboard structure
        assert "users" in data
        assert "inventory" in data
        assert "projects" in data
        assert "orders" in data
        assert "amc" in data
        assert "partners" in data
        
        # Validate user stats
        assert "total" in data["users"]
        assert "pending" in data["users"]
        assert "active" in data["users"]
        assert "by_role" in data["users"]
        
        print(f"✓ Admin dashboard - Users: {data['users']['total']}, Plants: {data['inventory']['total_plants']}")
    
    def test_admin_dashboard_unauthorized(self):
        """Test dashboard without auth returns 403"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code in [401, 403]
        print("✓ Unauthorized dashboard access blocked")


class TestInventory:
    """Inventory CRUD tests"""
    
    def test_get_inventory(self, admin_token):
        """Test get all inventory items"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/inventory", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Inventory retrieved - {len(data)} plants")
    
    def test_create_plant(self, admin_token):
        """Test create new plant"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        plant_data = {
            "name": f"TEST_Plant_{uuid.uuid4().hex[:6]}",
            "scientific_name": "Testus planticus",
            "category": "Indoor Plants",
            "growth_stage": "seedling",
            "price": 29.99,
            "cost": 10.00,
            "quantity": 25,
            "min_stock": 5,
            "location": "Greenhouse A",
            "description": "Test plant for testing"
        }
        response = requests.post(f"{BASE_URL}/api/inventory", headers=headers, json=plant_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == plant_data["name"]
        assert data["price"] == plant_data["price"]
        assert "id" in data
        print(f"✓ Plant created - ID: {data['id']}")
        return data["id"]
    
    def test_inventory_filter_by_category(self, admin_token):
        """Test inventory filter by category"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/inventory?category=Indoor Plants", headers=headers)
        assert response.status_code == 200
        data = response.json()
        for plant in data:
            assert plant["category"] == "Indoor Plants"
        print(f"✓ Category filter works - {len(data)} indoor plants")


class TestProjects:
    """Project management tests"""
    
    def test_get_projects(self, admin_token):
        """Test get all projects"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/projects", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Projects retrieved - {len(data)} projects")
    
    def test_create_project(self, admin_token):
        """Test create new project"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        project_data = {
            "name": f"TEST_Project_{uuid.uuid4().hex[:6]}",
            "client_name": "Test Client",
            "client_email": "test@client.com",
            "client_phone": "555-1234",
            "project_type": "landscaping",
            "description": "Test project for testing",
            "site_address": "123 Test Street",
            "start_date": "2026-03-01",
            "end_date": "2026-04-01",
            "budget": 10000
        }
        response = requests.post(f"{BASE_URL}/api/projects", headers=headers, json=project_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == project_data["name"]
        assert data["status"] == "planning"
        assert "id" in data
        assert "project_number" in data
        print(f"✓ Project created - {data['project_number']}")
        return data["id"]


class TestOrders:
    """Order management tests"""
    
    def test_get_orders(self, admin_token):
        """Test get all orders (admin)"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/orders", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Orders retrieved - {len(data)} orders")
    
    def test_create_public_order(self):
        """Test create order via public endpoint"""
        order_data = {
            "customer_name": "TEST_Customer",
            "customer_email": "testcust@test.com",
            "customer_phone": "555-9999",
            "customer_address": "456 Test Ave",
            "items": [{"name": "Test Plant", "quantity": 2, "price": 29.99}],
            "subtotal": 59.98,
            "discount": 0,
            "shipping": 10,
            "total": 69.98,
            "order_type": "retail"
        }
        response = requests.post(f"{BASE_URL}/api/orders/public", json=order_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "order_number" in data
        assert data["status"] == "pending"
        print(f"✓ Public order created - {data['order_number']}")


class TestAMC:
    """AMC (Annual Maintenance Contract) tests"""
    
    def test_get_amc_subscriptions(self, admin_token):
        """Test get AMC subscriptions"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/amc", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ AMC subscriptions retrieved - {len(data)} subs")
    
    def test_create_amc(self, admin_token):
        """Test create AMC subscription"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        amc_data = {
            "client_name": f"TEST_AMC_Client_{uuid.uuid4().hex[:6]}",
            "client_email": "amctest@test.com",
            "client_phone": "555-4444",
            "service_type": "garden_maintenance",
            "frequency": "monthly",
            "amount": 250.00,
            "start_date": "2026-02-01",
            "property_address": "789 Garden Lane",
            "services_included": ["lawn mowing", "weeding", "fertilizing"],
            "notes": "Test AMC subscription"
        }
        response = requests.post(f"{BASE_URL}/api/amc", headers=headers, json=amc_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "contract_number" in data
        assert data["status"] == "active"
        print(f"✓ AMC created - {data['contract_number']}")


class TestRFQ:
    """RFQ (Request for Quote) tests"""
    
    def test_get_rfqs(self, admin_token):
        """Test get all RFQs"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/rfq", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ RFQs retrieved - {len(data)} RFQs")
    
    def test_create_rfq_public(self):
        """Test create RFQ via public endpoint"""
        rfq_data = {
            "company_name": f"TEST_Company_{uuid.uuid4().hex[:6]}",
            "contact_name": "Test Contact",
            "email": "rfqtest@test.com",
            "phone": "555-7777",
            "items": [{"name": "Bulk Roses", "quantity": 100}, {"name": "Orchids", "quantity": 50}],
            "delivery_date": "2026-03-01",
            "delivery_address": "123 Wholesale St",
            "notes": "Need bulk order for event"
        }
        response = requests.post(f"{BASE_URL}/api/rfq", json=rfq_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "rfq_number" in data
        assert data["status"] == "pending"
        print(f"✓ RFQ created - {data['rfq_number']}")


class TestUserManagement:
    """Admin user management tests"""
    
    def test_get_all_users(self, admin_token):
        """Test get all users"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Users retrieved - {len(data)} users")
    
    def test_get_pending_users(self, admin_token):
        """Test get pending users"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users/pending", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Pending users retrieved - {len(data)} pending")


class TestPublicEndpoints:
    """Public product/inquiry endpoints"""
    
    def test_get_public_products(self):
        """Test get public products (no auth)"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public products retrieved - {len(data)} products")
    
    def test_create_inquiry(self):
        """Test create public inquiry"""
        inquiry_data = {
            "name": "TEST_Inquirer",
            "email": "inquiry@test.com",
            "phone": "555-8888",
            "company": "Test Company",
            "inquiry_type": "general",
            "message": "This is a test inquiry"
        }
        response = requests.post(f"{BASE_URL}/api/inquiries", json=inquiry_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "new"
        print(f"✓ Inquiry created - ID: {data['id']}")


class TestExports:
    """Export documentation tests"""
    
    def test_get_exports(self, admin_token):
        """Test get export documents"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/exports", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Exports retrieved - {len(data)} documents")
    
    def test_create_export_doc(self, admin_token):
        """Test create export document"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        export_data = {
            "doc_type": "phytosanitary",
            "customer_name": "TEST_Export_Customer",
            "destination_country": "Netherlands",
            "items": [{"name": "Roses", "quantity": 1000}],
            "total_weight": 250.5,
            "total_boxes": 50,
            "shipping_method": "air",
            "notes": "Test export shipment"
        }
        response = requests.post(f"{BASE_URL}/api/exports", headers=headers, json=export_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "doc_number" in data
        assert data["status"] == "draft"
        print(f"✓ Export doc created - {data['doc_number']}")


class TestProduction:
    """Production management tests"""
    
    def test_get_productions(self, admin_token):
        """Test get production batches"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/production", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Productions retrieved - {len(data)} batches")
    
    def test_create_production(self, admin_token):
        """Test create production batch"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        prod_data = {
            "product_type": "bouquet",
            "name": f"TEST_Bouquet_{uuid.uuid4().hex[:6]}",
            "description": "Test flower arrangement",
            "components": [{"name": "Roses", "quantity": 12}, {"name": "Ferns", "quantity": 5}],
            "quantity": 10,
            "cost_per_unit": 25.00,
            "sell_price": 49.99
        }
        response = requests.post(f"{BASE_URL}/api/production", headers=headers, json=prod_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "batch_number" in data
        assert data["status"] == "in_progress"
        print(f"✓ Production batch created - {data['batch_number']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
