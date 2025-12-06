#!/bin/bash

# Jobify Setup Script
# This script helps set up the development environment

set -e  # Exit on error

echo "🚀 Jobify Environment Setup"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists in server
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Server .env not found. Creating from example...${NC}"
    if [ -f "server/.env.example" ]; then
        cp server/.env.example server/.env
        echo -e "${GREEN}✅ Created server/.env${NC}"
        echo -e "${YELLOW}⚠️  Please edit server/.env with your credentials${NC}"
    else
        echo -e "${RED}❌ server/.env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Server .env exists${NC}"
fi

# Check if .env exists in client
if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠️  Client .env not found. Creating from example...${NC}"
    if [ -f "client/.env.example" ]; then
        cp client/.env.example client/.env
        echo -e "${GREEN}✅ Created client/.env${NC}"
    else
        echo -e "${YELLOW}⚠️  client/.env.example not found, using defaults${NC}"
    fi
else
    echo -e "${GREEN}✅ Client .env exists${NC}"
fi

echo ""
echo "📦 Installing Dependencies"
echo "=========================="

# Install server dependencies
echo -e "${YELLOW}Installing server dependencies...${NC}"
cd server
npm install
cd ..
echo -e "${GREEN}✅ Server dependencies installed${NC}"

# Install client dependencies
echo -e "${YELLOW}Installing client dependencies...${NC}"
cd client
npm install
cd ..
echo -e "${GREEN}✅ Client dependencies installed${NC}"

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Configure your environment variables:"
echo "   - Edit server/.env with your credentials"
echo "   - See ENV_SETUP.md for detailed instructions"
echo ""
echo "2. Start the development servers:"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd client && npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:5001"
echo ""
echo -e "${YELLOW}⚠️  Important: Make sure MongoDB is running and credentials are correct${NC}"
echo ""
