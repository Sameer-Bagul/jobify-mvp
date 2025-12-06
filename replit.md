# JobSeeker Pro - MERN Stack Job Platform

## Overview
A full-stack job seeker/recruiter platform with cold email automation capabilities. Built with MERN stack (MongoDB, Express, React, Node.js) using MVC architecture.

## Architecture

### Frontend (client/)
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS with dark theme
- **State Management**: Zustand with persist middleware
- **Port**: 5000 (webview)

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Architecture**: MVC (Models, Controllers, Routes)
- **Authentication**: JWT (7-day expiry)
- **Port**: 3001

## Database Schema (MongoDB)
- **users**: Core user accounts with email, password, role (seeker/recruiter)
- **userProfiles**: Job seeker profiles with skills, experience, Gmail credentials, resume
- **recruiters**: Recruiter company profiles
- **jobs**: Job postings with required skills, location, salary
- **coldEmailLogs**: Track sent emails with status
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

## UI Design
- Dark theme inspired by bug0.com
- Glassmorphism effects with backdrop blur
- Purple/blue gradient accents
- Modern animations and transitions

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
- MONGODB_URI - MongoDB connection string (secret)
- JWT_SECRET - Secret for JWT tokens (defaults to dev secret)

## Running the Project
Both workflows start automatically:
- Backend Server: `cd server && npm run dev`
- Frontend: `cd client && npm run dev`

## Project Structure
```
client/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # API client and utilities
│   ├── store/         # Zustand state management
│   ├── App.tsx        # Main app with routes
│   └── main.tsx       # Entry point
server/
├── src/
│   ├── config/        # Database connection
│   ├── models/        # Mongoose models
│   ├── controllers/   # Business logic
│   ├── routes/        # Express routes
│   ├── middleware/    # Auth middleware
│   └── index.ts       # Entry point
```

## Recent Changes
- Migrated from PostgreSQL/Drizzle to MongoDB/Mongoose (Dec 2024)
- Migrated from Next.js to React Vite (Dec 2024)
- Implemented MVC architecture on backend
- Built dark theme UI with glassmorphism design
- All seeker and recruiter pages rebuilt with new design
