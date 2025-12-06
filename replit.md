# JobSeeker Pro - Job Platform with Cold Email Automation

## Overview
A full-stack job seeker/recruiter platform with cold email automation capabilities. Built with client-server architecture using separate package.json files.

## Architecture

### Frontend (client/)
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS
- **State Management**: Zustand with persist middleware
- **Port**: 5000 (webview)

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (7-day expiry)
- **Port**: 3001

### Shared (shared/ and server/shared/)
- Database schema definitions using Drizzle ORM

## Database Schema
- **users**: Core user accounts with email, password, role (seeker/recruiter)
- **user_profiles**: Job seeker profiles with skills, experience, Gmail credentials, resume
- **recruiters**: Recruiter company profiles
- **jobs**: Job postings with required skills, location, salary
- **cold_email_logs**: Track sent emails with status
- **subscriptions**: User subscription management

## Key Features

### Job Seeker
- Signup/Login with JWT authentication
- Onboarding flow for profile setup
- Gmail SMTP integration for cold emails
- Send up to 20 emails per day
- Resume upload and attachment

### Recruiter
- Post and manage job listings
- View matching candidates based on skill overlap
- Candidate matching with score calculation

## API Endpoints

### Auth (/api/auth)
- POST /signup - Register new user
- POST /login - Authenticate user

### Users (/api/users)
- GET /me - Get current user
- POST /onboarding - Complete onboarding
- PUT /profile - Update profile

### Jobs (/api/jobs)
- GET / - List all active jobs
- GET /:id - Get job details
- GET /match/:jobId - Get matching candidates

### Recruiters (/api/recruiters)
- GET /profile - Get recruiter profile
- PUT /profile - Update recruiter profile
- POST /jobs - Create job
- GET /jobs - List recruiter's jobs
- PUT /jobs/:id - Update job
- DELETE /jobs/:id - Delete job (soft delete)

### Email (/api/email)
- GET /stats - Get email stats
- POST /send - Send cold email
- GET /logs - Get email history

## Environment Variables
- DATABASE_URL - PostgreSQL connection string
- JWT_SECRET - Secret for JWT tokens (defaults to dev secret)

## Running the Project
Both workflows start automatically:
- Backend Server: `cd server && npm run dev`
- Frontend: `cd client && npm run dev`

## Recent Changes
- Initial MVP implementation (Dec 2024)
- Client-server architecture with separate package.json
- PostgreSQL database with Drizzle ORM
- Cold email automation system
- Candidate matching algorithm
