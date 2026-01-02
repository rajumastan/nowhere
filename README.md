# nowhere — Discord-like Desktop App

A Discord-like desktop application built with Electron, Node.js, Express, Socket.IO, and MongoDB.

## Features
- Real-time messaging with Socket.IO
- Direct Messages (DMs) and Server Channels
- User presence (online/offline)
- Typing indicators
- JWT authentication
- Dark theme UI with smooth animations
- Cross-platform desktop app

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Local Development
```bash
# Clone and setup
cd nowhere

# Install dependencies
npm run install:all

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT_SECRET

# Start development
npm run dev