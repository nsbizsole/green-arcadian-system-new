# GreenForge OS - Product Requirements Document

## Overview
GreenForge OS is a comprehensive multi-tenant platform for green businesses including plantation, nursery, landscaping, and maintenance operations.

## Original Problem Statement
Build "GreenForge OS" - World's Best Green Business Platform for managing plant nursery inventory, landscaping projects, AMC maintenance subscriptions, sales partner commissions, B2B/B2C e-commerce, export compliance, and value-added production.

## User Personas
1. **Nursery Owner/Admin** - Manages inventory, staff, and business operations
2. **Sales Partners** - Track deals and commissions
3. **Project Managers** - Handle landscaping projects and work orders
4. **Customers (B2B/B2C)** - Purchase plants and gift sets via e-commerce

## Core Requirements (Static)
- Multi-tenant architecture with tenant isolation
- JWT-based authentication
- Plant inventory with stock management and reservations
- CRM pipeline with dynamic quote builder
- Project management with task tracking
- AMC subscription management with auto-billing
- Partner commission tracking with deal locking
- E-commerce storefront for B2B/B2C
- Courses/learning platform

## What's Been Implemented (Feb 6, 2026)

### Backend (FastAPI + MongoDB)
- ✅ Authentication system (register, login, JWT tokens)
- ✅ Multi-tenant data isolation
- ✅ Dashboard statistics API
- ✅ Plant Inventory CRUD with reservations
- ✅ CRM Leads & Quotes management
- ✅ Project & Task management
- ✅ Partner & Deal tracking
- ✅ AMC Subscriptions & Invoice generation
- ✅ E-commerce Products & Orders
- ✅ Courses API

### Frontend (React + Tailwind + Shadcn)
- ✅ Landing page with product showcase
- ✅ Authentication (Login/Register)
- ✅ Dashboard with KPI cards
- ✅ Inventory management page
- ✅ CRM Pipeline with Kanban view
- ✅ Projects management
- ✅ Partners & Commission tracking
- ✅ AMC Billing management
- ✅ Public Store page
- ✅ Public Courses page
- ✅ Settings page

## Prioritized Backlog

### P0 (Critical)
- [x] Core authentication
- [x] Multi-tenant isolation
- [x] Basic CRUD for all modules

### P1 (High Priority)
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Export compliance (phytosanitary docs)
- [ ] PDF invoice generation

### P2 (Medium Priority)
- [ ] Mobile-responsive offline crew app
- [ ] Gantt chart visualization for projects
- [ ] Bulk import/export for inventory
- [ ] Customer portal

### P3 (Nice to Have)
- [ ] AI-powered recommendations
- [ ] Advanced reporting & analytics
- [ ] White-label customization
- [ ] Multi-currency support

## Next Tasks
1. Stripe integration for e-commerce payments
2. PDF invoice generation for AMC billing
3. Email notifications (SendGrid/Resend)
4. Advanced search and filtering
5. Data export functionality
