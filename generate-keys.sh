#!/bin/bash

# Script to generate secure keys for environment variables

echo "🔐 Generating Secure Keys for Jobify"
echo "====================================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "📝 Generated secure keys (copy to your .env file):"
echo ""

# Generate JWT Secret (64 characters)
echo "# JWT Secret (64 characters)"
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo ""

# Generate Encryption Key (32 characters for AES-256)
echo "# Encryption Key (32 characters for AES-256)"
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""

echo "✅ Keys generated successfully!"
echo ""
echo "⚠️  Copy these to your server/.env file"
echo "⚠️  Keep these keys secret and never commit them to git"
echo "⚠️  Use different keys for production"
echo ""
