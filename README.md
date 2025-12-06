# Jobify MVP

A full-stack job search and application platform with email automation and subscription features.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Gmail account (for email features)
- Razorpay account (for payment features) - optional

### Automated Setup

```bash
# Run the setup script
./setup.sh

# Or manually:
cd server && npm install
cd ../client && npm install
```

### Configuration

1. **Copy environment files:**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

2. **Configure server/.env** (see [ENV_SETUP.md](ENV_SETUP.md) for details):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ENCRYPTION_KEY=your_32_character_encryption_key
   ```

3. **Optional services** (for full functionality):
   - Gmail credentials for email features
   - Razorpay credentials for payment features

### Running the Application

**Development Mode:**

```bash
# Terminal 1 - Start server (port 3000)
cd server
npm run dev

# Terminal 2 - Start client (port 5001)
cd client
npm run dev
```

Open [http://localhost:5001](http://localhost:5001) in your browser.

## 📁 Project Structure

```
jobify-mvp/
├── server/              # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── config/      # Database, environment config
│   │   ├── controllers/ # API route handlers
│   │   ├── middleware/  # Authentication, validation
│   │   ├── models/      # MongoDB schemas
│   │   ├── routes/      # API routes
│   │   └── utils/       # Helper functions
│   └── .env             # Server environment variables
├── client/              # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # State management (Zustand)
│   │   ├── lib/         # API client
│   │   └── config/      # Client configuration
│   └── .env             # Client environment variables
└── ENV_SETUP.md         # Detailed setup guide
```

## 🔧 Technology Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT
- **Email:** Nodemailer
- **Payment:** Razorpay
- **Scheduling:** node-cron

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password

### Jobs
- `GET /api/jobs` - Get job listings
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/with-match-score` - Jobs with match scores

### Users
- `GET /api/users/me` - Get current user
- `POST /api/users/onboarding` - Complete onboarding
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-resume` - Upload resume

### Email
- `POST /api/email/send` - Send email to recruiter
- `GET /api/email/stats` - Get email statistics
- `GET /api/email/logs` - Get email logs

### Subscription
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/create-order` - Create payment order
- `POST /api/subscription/verify-payment` - Verify payment

## 🔐 Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `ENCRYPTION_KEY` - 32-character key for AES-256 encryption

### Optional (but recommended)
- `SYSTEM_GMAIL_ID` - Gmail for OTP emails
- `SYSTEM_GMAIL_PASSWORD` - Gmail app password
- `RAZORPAY_KEY_ID` - Razorpay key for payments
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

See [ENV_SETUP.md](ENV_SETUP.md) for detailed configuration guide.

## 🛡️ Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Authentication:** Secure token-based auth
- **Data Encryption:** AES-256 for sensitive data
- **CORS Protection:** Configured allowed origins
- **Input Validation:** Request validation middleware
- **Environment Validation:** Startup checks for required vars

## 📋 User Roles

1. **Job Seeker** - Search jobs, apply, save listings
2. **Recruiter** - Post jobs, view candidates
3. **Admin** - Manage users, jobs, and system settings

## 🎨 Features

### Job Seekers
- ✅ Profile creation with resume upload
- ✅ Job search with filters
- ✅ AI-powered job matching scores
- ✅ Email templates for applications
- ✅ Save jobs and track applications
- ✅ Daily email quota management

### Recruiters
- ✅ Post and manage job listings
- ✅ View applicant profiles
- ✅ Track applications

### Admin
- ✅ User management (ban/activate)
- ✅ Job moderation
- ✅ Email log monitoring
- ✅ System analytics dashboard

## 🧪 Development

### Build for Production

```bash
# Build server
cd server
npm run build

# Build client
cd client
npm run build
```

### Environment Modes

- **Development:** `NODE_ENV=development`
- **Production:** `NODE_ENV=production`

## 📝 Scripts

### Server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Client
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Server won't start
- Check MongoDB connection string
- Verify all required env vars are set
- Ensure port 3000 is available

### Client can't connect to server
- Verify server is running on port 3000
- Check Vite proxy configuration
- Ensure CORS settings allow your origin

### Authentication errors
- Check JWT_SECRET is set
- Verify MongoDB is connected
- Clear browser localStorage

### Email not sending
- Verify Gmail credentials
- Use Gmail App Password (not regular password)
- Check email quota limits

See [ENV_SETUP.md](ENV_SETUP.md) for more troubleshooting tips.

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For issues and questions, please contact the development team.
