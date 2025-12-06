# Jobify - Quick Reference

## 🚀 Getting Started

```bash
# First time setup
./setup.sh

# Generate secure keys
./generate-keys.sh

# Edit environment files
nano server/.env
nano client/.env
```

## 💻 Development Commands

### Start Development Servers

```bash
# Terminal 1 - Backend (port 3000)
cd server && npm run dev

# Terminal 2 - Frontend (port 5001)
cd client && npm run dev
```

### Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### Build for Production

```bash
# Server
cd server && npm run build

# Client
cd client && npm run build
```

## 🔑 Environment Variables Quick Copy

### Server (.env)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
JWT_SECRET=<run ./generate-keys.sh>
ENCRYPTION_KEY=<run ./generate-keys.sh>
SYSTEM_GMAIL_ID=your-email@gmail.com
SYSTEM_GMAIL_PASSWORD=your-app-password
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### Client (.env)
```env
VITE_API_BASE_URL=/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_APP_NAME=Jobify
```

## 🧰 Useful Commands

### Database
```bash
# Connect to MongoDB
mongosh "mongodb+srv://..."

# View collections
show collections

# Query users
db.users.find().pretty()
```

### Git
```bash
# Never commit .env files!
git status  # Check .env is ignored

# Commit changes
git add .
git commit -m "Your message"
git push
```

### Testing
```bash
# Test server health
curl http://localhost:3000/api/health

# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🐛 Common Issues & Fixes

### Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### Module not found errors
```bash
# Clear node_modules and reinstall
cd server && rm -rf node_modules package-lock.json && npm install
cd client && rm -rf node_modules package-lock.json && npm install
```

### MongoDB connection failed
- Check MONGODB_URI in .env
- Verify network access in MongoDB Atlas
- Check if IP address is whitelisted

### CORS errors
- Verify server is running on port 3000
- Check FRONTEND_URL in server/.env
- Clear browser cache

### JWT errors
- Check JWT_SECRET is set
- Clear localStorage in browser
- Re-login to get new token

### Email not sending
- Use Gmail App Password (not regular password)
- Enable 2FA on Gmail account
- Check daily email quota

## 📚 File Locations

### Configuration
- `server/.env` - Server environment variables
- `client/.env` - Client environment variables
- `server/src/config/env.ts` - Server env config
- `client/src/config/env.ts` - Client env config

### Routes
- `server/src/routes/` - API route definitions
- `server/src/controllers/` - Route handlers
- `client/src/pages/` - Frontend pages

### Models
- `server/src/models/` - MongoDB schemas

### Authentication
- `server/src/middleware/auth.ts` - Auth middleware
- `server/src/controllers/authController.ts` - Auth logic

## 🎯 API Endpoints

```
Authentication:
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/verify-otp
POST   /api/auth/reset-password

Jobs:
GET    /api/jobs
GET    /api/jobs/:id
GET    /api/jobs/with-match-score

Users:
GET    /api/users/me
POST   /api/users/onboarding
PUT    /api/users/profile
POST   /api/users/upload-resume

Email:
POST   /api/email/send
GET    /api/email/stats
GET    /api/email/logs

Subscription:
GET    /api/subscription/status
POST   /api/subscription/create-order
POST   /api/subscription/verify-payment
```

## 📞 Getting Help

1. Check [ENV_SETUP.md](ENV_SETUP.md) for detailed setup
2. Check [README.md](README.md) for full documentation
3. Contact development team for support
