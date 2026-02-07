# Green Arcadian - Multi-Portal Business Management System

A comprehensive internal business management system for a plantation and flower exporting company.

## Project Structure

```
green-arcadian/
├── frontend/          # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── backend/           # FastAPI backend application
│   ├── server.py
│   ├── requirements.txt
│   └── README.md
└── README.md          # This file
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB
- Yarn (recommended)

### 1. Start MongoDB

Make sure MongoDB is running locally on port 27017.

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=green_arcadian
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
EOF

# Start server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
yarn install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Start development server
yarn start
```

### 4. Create Admin Account

```bash
# Register admin
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@greenarcadian.com","password":"admin123","full_name":"Admin User","role":"admin"}'

# Activate in MongoDB
mongosh green_arcadian --eval 'db.users.updateOne({email:"admin@greenarcadian.com"}, {$set: {status: "active"}})'
```

## Features

- **Multi-Portal System**: Admin, Partner, Crew, Customer portals
- **Plant Inventory**: Stock tracking, batches, growth stages
- **Landscaping Projects**: BOQ, timelines, crew logs
- **AMC Subscriptions**: Automatic scheduling and billing
- **E-commerce**: B2B/B2C with corporate gifting support
- **Export Compliance**: Phytosanitary documents, packing lists
- **Value-Added Production**: Terrariums, dried arrangements

## Technology Stack

- **Frontend**: React 18, TailwindCSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT with Role-Based Access Control

## License

Private - Internal Use Only
