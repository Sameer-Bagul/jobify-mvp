# Environment Setup Guide

## Server Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required Variables

1. **Database**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=YourApp
   ```
   - Get MongoDB connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Authentication**
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```
   - Use a strong random string (32+ characters)
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **Encryption**
   ```env
   ENCRYPTION_KEY=your-32-character-encryption-key!!
   ```
   - Must be exactly 32 characters for AES-256 encryption
   - Used to encrypt sensitive user data (Gmail passwords)

### Optional Variables

4. **Email Service** (Required for OTP functionality)
   ```env
   SYSTEM_GMAIL_ID=your-email@gmail.com
   SYSTEM_GMAIL_PASSWORD=your-gmail-app-password
   ```
   - Create Gmail App Password: [Instructions](https://support.google.com/accounts/answer/185833)
   - **Note**: Use App Password, not your regular Gmail password

5. **Payment Gateway** (Required for subscription features)
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   ```
   - Sign up at [Razorpay](https://razorpay.com)
   - Get test/live keys from [Dashboard](https://dashboard.razorpay.com/app/keys)

6. **Server Configuration**
   ```env
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5001
   ```

## Client Environment Variables

Create `.env` in the client folder (optional):

```env
# All Vite env vars must start with VITE_
VITE_API_BASE_URL=http://localhost:3000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## Quick Start

1. **Server Setup**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your credentials
   npm install
   npm run dev
   ```

2. **Client Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Security Notes

- ⚠️ **Never commit `.env` files** to version control
- ✅ `.env.example` files are safe to commit (no sensitive data)
- 🔐 Use strong, unique values for JWT_SECRET and ENCRYPTION_KEY
- 🔑 Gmail: Use App Passwords, not your main password
- 🧪 Razorpay: Use test keys for development

## Troubleshooting

### Server won't start
- Check if MongoDB URI is correct
- Ensure all required env vars are set
- Check if port 3000 is available

### Auth not working
- Verify JWT_SECRET is set
- Check MongoDB connection
- Clear browser localStorage

### Email not sending
- Verify Gmail credentials
- Check if Gmail App Password is used
- Enable "Less secure app access" if needed

### Payment failing
- Verify Razorpay credentials
- Check if using correct key (test vs live)
- Ensure RAZORPAY_KEY_ID is also set in client
