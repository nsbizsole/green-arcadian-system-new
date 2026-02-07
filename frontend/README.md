# Green Arcadian - Frontend

React frontend for the Green Arcadian multi-portal business management system.

## Requirements

- Node.js 18+ 
- Yarn (recommended) or npm

## Setup

1. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in this folder:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

3. **Start the development server:**
   ```bash
   yarn start
   # or
   npm start
   ```

   The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI components
│   └── portals/        # Portal layout components
├── contexts/           # React contexts (Auth, Cart)
├── pages/              # Page components
│   ├── admin/          # Admin portal pages
│   ├── auth/           # Login, Register pages
│   ├── crew/           # Crew portal pages
│   ├── customer/       # Customer portal pages
│   └── partner/        # Partner portal pages
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## Available Scripts

- `yarn start` - Run development server
- `yarn build` - Build for production
- `yarn test` - Run tests

## Features

### Public Website
- Home, Shop, About, Export, Contact pages
- Shopping cart and checkout
- User authentication (Sign In / Sign Up)

### Admin Portal (`/admin`)
- Dashboard with key metrics
- User management
- Plant inventory management
- Project management
- AMC subscriptions
- Orders, RFQ, Exports, Production

### Customer Portal (`/customer`)
- Order history
- Profile management

### Partner Portal (`/partner`)
- Deal registration
- Commission tracking

### Crew Portal (`/crew`)
- Task management
- Work logs

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@greenarcadian.com | admin123 |
