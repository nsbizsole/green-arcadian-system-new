# Green Arcadian - Backend

FastAPI backend for the Green Arcadian multi-portal business management system.

## Requirements

- Python 3.9+
- MongoDB (running locally or remote)

## Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in this folder:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=green_arcadian
   CORS_ORIGINS=http://localhost:3000
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Run the server:**
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

   The API will be available at `http://localhost:8001`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |
| `/api/admin/dashboard` | GET | Admin dashboard stats |
| `/api/inventory` | GET/POST | Plant inventory |
| `/api/projects` | GET/POST | Landscaping projects |
| `/api/orders` | GET/POST | Orders management |
| `/api/amc` | GET/POST | AMC subscriptions |

## Default Admin Account

After first run, create an admin account:
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@greenarcadian.com","password":"admin123","full_name":"Admin User","role":"admin"}'
```

Then manually activate it in MongoDB:
```javascript
db.users.updateOne({email:"admin@greenarcadian.com"}, {$set: {status: "active"}})
```
