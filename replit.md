# Jobify - MERN Stack Job Platform

## Overview
A comprehensive job seeker/recruiter platform with cold email automation, AI-powered job matching, Razorpay subscription payments, and admin dashboard. Built with MERN stack (MongoDB, Express, React, Node.js) using MVC architecture.

## Architecture

### Frontend (client/)
- **Framework**: React 18 with Vite
- **Routing**: React Router v6 with v7 future flags enabled
- **Styling**: TailwindCSS with custom dark theme
- **State Management**: Zustand with localStorage persistence
- **API Client**: Axios with JWT interceptors
- **Port**: 5000 (webview)

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Architecture**: MVC (Models, Controllers, Routes)
- **Authentication**: JWT (7-day expiry)
- **File Uploads**: Multer for resume handling
- **Port**: 3001

## Database Schema (MongoDB)

### Core Models
- **User**: Email, password (bcrypt hashed), role (seeker/recruiter/admin), subscription status, email limits
- **UserProfile**: Skills, experience, education, resume, Gmail credentials, preferred job types
- **Recruiter**: Company info, verified status, job count
- **Job**: Title, company, location, salary, skills, type (remote/hybrid/onsite), status

### Supporting Models
- **Subscription**: Plan details, payment history, expiry dates
- **ColdEmailLog**: Sent emails with status tracking, open/reply tracking
- **EmailTemplate**: Reusable email templates per user
- **AdminSettings**: Platform-wide configuration

## Features

### Job Seeker Features
1. **Authentication**: Signup/Login with JWT, forgot password with OTP
2. **Onboarding**: Multi-step profile setup with skills, experience
3. **Job Search**: Filter by location, salary, skills, job type
4. **AI Job Matching**: Match score calculation based on skill overlap
5. **Cold Email Automation**: Send personalized emails to recruiters
6. **Email Templates**: Create and save reusable templates
7. **Resume Upload**: Attach resume to cold emails
8. **Saved Items**: Bookmark jobs and recruiters
9. **Activity Tracking**: View application history

### Recruiter Features
1. **Dashboard**: Overview of posted jobs and applications
2. **Job Management**: Create, edit, delete job postings
3. **Candidate Matching**: View candidates with match scores
4. **Profile Management**: Company details and contact info

### Admin Features
1. **Dashboard**: Platform analytics and metrics
2. **User Management**: View/ban users, manage roles
3. **Job Management**: Moderate job postings
4. **Email Logs**: Monitor platform email activity
5. **Recruiter Management**: Add/edit/remove recruiters
6. **Settings**: Configure platform limits and features

### Subscription Features
1. **Free Tier**: 20 emails/day, basic matching
2. **Pro Plan**: 100 emails/day, AI matching, templates
3. **Premium Plan**: Unlimited emails, priority support
4. **Razorpay Integration**: Secure payment processing

## UI Design
- Dark theme with #0a0a0f background
- Glassmorphism effects with backdrop blur
- Purple (#9333ea) to blue (#3b82f6) gradient accents
- Responsive design for mobile/tablet/desktop
- Modern card-based layouts with hover effects

## API Endpoints

### Auth (/api/auth)
- POST /signup - Register new user
- POST /login - Authenticate user
- POST /forgot-password - Request password reset
- POST /verify-otp - Verify OTP code
- POST /reset-password - Set new password
- POST /change-password - Change current password

### Users (/api/users)
- GET /me - Get current user profile
- POST /onboarding - Complete onboarding
- PUT /profile - Update user profile
- POST /upload-resume - Upload resume file
- GET /saved-items - Get bookmarked items
- POST /saved-items - Save item
- DELETE /saved-items/:type/:id - Remove saved item
- GET /activity - Get user activity log

### Jobs (/api/jobs)
- GET / - List jobs with filters
- GET /filters - Get available filter options
- GET /with-match-score - Jobs with AI match scores
- GET /:id - Get job details
- GET /:id/match-score - Calculate match for specific job

### Recruiters (/api/recruiters)
- GET /profile - Get recruiter profile
- PUT /profile - Update profile
- GET /dashboard - Get recruiter analytics
- GET /jobs - List recruiter's jobs
- POST /jobs - Create new job
- PUT /jobs/:id - Update job
- DELETE /jobs/:id - Delete job
- GET /candidates - Get matching candidates

### Email (/api/email)
- GET /stats - Get email statistics
- POST /send - Send single email
- POST /bulk - Send bulk emails
- GET /logs - Get email history
- GET /templates - Get user templates
- POST /templates - Create template
- PUT /templates/:id - Update template
- DELETE /templates/:id - Delete template
- GET /recruiters - Get recruiter contacts

### Subscription (/api/subscription)
- GET /status - Get subscription status
- POST /create-order - Create Razorpay order
- POST /verify-payment - Verify payment
- GET /history - Get payment history

### Admin (/api/admin)
- GET /dashboard - Platform analytics
- GET /users - List all users
- POST /users/:id/ban - Ban/unban user
- GET /jobs - List all jobs
- DELETE /jobs/:id - Remove job
- GET /email-logs - Platform email logs
- GET /recruiters - Manage recruiters
- POST /recruiters - Add recruiter
- PUT /recruiters/:id - Update recruiter
- DELETE /recruiters/:id - Remove recruiter
- GET /settings - Get platform settings
- PUT /settings - Update settings

## Environment Variables
- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Secret for JWT tokens (uses fallback in dev)
- `RAZORPAY_KEY_ID` - Razorpay API key (optional)
- `RAZORPAY_SECRET` - Razorpay secret (optional)

## Running the Project
Both workflows start automatically:
- **Backend Server**: `cd server && npm run dev`
- **Frontend**: `cd client && npm run dev`

## Project Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Layout.tsx  # Dashboard layout with sidebar
│   │   └── ProtectedRoute.tsx  # Auth & role guard
│   ├── pages/
│   │   ├── Landing.tsx     # Public landing page
│   │   ├── Login.tsx       # Login form
│   │   ├── Signup.tsx      # Registration with role select
│   │   ├── ForgotPassword.tsx  # Password reset flow
│   │   ├── Onboarding.tsx  # Profile setup wizard
│   │   ├── Dashboard.tsx   # Seeker dashboard
│   │   ├── Jobs.tsx        # Job listings
│   │   ├── JobDetail.tsx   # Job details + apply
│   │   ├── Email.tsx       # Cold email composer
│   │   ├── Saved.tsx       # Bookmarked items
│   │   ├── Subscription.tsx    # Plans & payment
│   │   ├── Account.tsx     # Profile settings
│   │   ├── recruiter/      # Recruiter pages
│   │   └── admin/          # Admin pages
│   ├── lib/
│   │   └── api.ts      # Axios client with all endpoints
│   ├── store/
│   │   └── auth.ts     # Zustand auth store
│   ├── App.tsx         # Routes configuration
│   └── main.tsx        # Entry point with router
server/
├── src/
│   ├── config/
│   │   └── database.ts # MongoDB connection
│   ├── models/         # Mongoose schemas
│   ├── controllers/    # Business logic
│   ├── routes/         # Express routers
│   ├── middleware/
│   │   └── auth.ts     # JWT verification
│   ├── utils/          # Helpers (email, validation)
│   └── index.ts        # Express app setup
```

## Role-Based Access Control
- **Public**: Landing, Login, Signup, Forgot Password
- **Seeker**: Dashboard, Jobs, Email, Saved, Subscription, Account
- **Recruiter**: Dashboard, Jobs, PostJob, Candidates, Account
- **Admin**: Dashboard, Users, Jobs, EmailLogs, Recruiters, Settings

## Recent Changes
- Full redesign with dark theme inspired by bug0.com (Dec 2024)
- Migrated from PostgreSQL/Drizzle to MongoDB/Mongoose
- Added role-based access control (RBAC) with protected routes
- Implemented Razorpay subscription integration
- Built complete admin dashboard
- Added AI-powered job matching
- Cold email automation with templates
- Multi-step onboarding flow
- Forgot password with OTP verification
- React Router v7 future flags for forward compatibility
