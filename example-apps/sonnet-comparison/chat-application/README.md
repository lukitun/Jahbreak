# Real-Time Chat Application

A comprehensive real-time chat application built with React, TypeScript, Node.js, Socket.IO, and MongoDB. Features include group messaging, file sharing up to 100MB, WebRTC video calls with screen sharing, end-to-end encryption, and scalable deployment with Docker and Kubernetes.

## 🚀 Features

### Core Functionality
- **Real-time Group Messaging**: Instant messaging with Socket.IO
- **User Authentication**: JWT-based auth with refresh tokens
- **Group Management**: Create, join, and manage groups (up to 100 participants)
- **File Sharing**: Upload and share files up to 100MB
- **Video Calls**: WebRTC video calls with up to 10 participants
- **Screen Sharing**: Share your screen during video calls
- **End-to-End Encryption**: Secure message encryption with crypto-js
- **Typing Indicators**: Real-time typing status
- **User Presence**: Online/offline status tracking
- **Message History**: Paginated message loading
- **Search**: Search messages and files
- **Responsive Design**: Works on desktop and mobile

### Technical Features
- **Scalable Architecture**: Horizontal pod autoscaling
- **Session Management**: Redis for caching and sessions
- **File Storage**: Persistent volume claims for file uploads
- **Health Checks**: Kubernetes health probes
- **Security**: Helmet.js, rate limiting, input validation
- **Performance**: Gzip compression, connection pooling
- **Monitoring**: Health endpoints and logging

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Backend (Node.js + Express + Socket.IO)
    ↓
Database (MongoDB) + Cache (Redis)
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Material-UI for components
- Socket.IO client for real-time communication
- Simple-peer for WebRTC connections
- Crypto-js for encryption
- Zustand for state management

**Backend:**
- Node.js with Express
- Socket.IO for real-time features
- MongoDB with Mongoose
- Redis for caching and sessions
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes with HPA
- Nginx for reverse proxy
- Persistent volumes for data

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Docker & Docker Compose
- MongoDB (local or cloud)
- Redis (local or cloud)

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-application
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Environment Configuration**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your configurations

# Frontend environment (optional)
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed
```

4. **Start development servers**
```bash
# Start all services
npm start

# Or start individually
npm run start:backend
npm run start:frontend
```

### Docker Development

1. **Start with Docker Compose**
```bash
docker-compose up -d
```

2. **View logs**
```bash
docker-compose logs -f
```

3. **Stop services**
```bash
docker-compose down
```

## 🌐 Production Deployment

### Docker Production Build

1. **Build production images**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

2. **Deploy to production**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

1. **Create namespace**
```bash
kubectl apply -f k8s/namespace.yaml
```

2. **Deploy databases**
```bash
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/redis.yaml
```

3. **Deploy application**
```bash
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

4. **Setup ingress (optional)**
```bash
kubectl apply -f k8s/ingress.yaml
```

5. **Check deployment status**
```bash
kubectl get pods -n chat-app
kubectl get services -n chat-app
```

## 📱 Usage

### Getting Started
1. Navigate to the application URL
2. Register a new account or login
3. Create or join a group
4. Start chatting!

### Key Features

**Messaging:**
- Type messages and press Enter to send
- Use @ to mention users
- Send emojis and reactions
- Edit messages within 5 minutes
- Delete your own messages

**File Sharing:**
- Drag and drop files or click upload
- Support for images, videos, documents
- 100MB file size limit
- Preview images and videos inline

**Video Calls:**
- Click the video call button in any group
- Up to 10 participants per call
- Toggle video/audio during calls
- Share your screen with participants

**Groups:**
- Create public or private groups
- Invite users to groups
- Manage group settings and members
- Transfer ownership or admin rights

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=104857600  # 100MB
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### Database Configuration

**MongoDB Indexes:**
The application automatically creates necessary indexes for optimal performance.

**Redis Configuration:**
Used for session management, user presence, and caching.

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Encryption**: End-to-end message encryption
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Request rate limiting
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **File Validation**: File type and size validation

## 📊 Monitoring & Health Checks

### Health Endpoints
- `GET /health` - Application health status
- `GET /api/auth/me` - Authentication status

### Kubernetes Probes
- **Liveness Probe**: Checks if the application is running
- **Readiness Probe**: Checks if the application is ready to serve traffic

### Logs
```bash
# View application logs
kubectl logs -f deployment/backend -n chat-app
kubectl logs -f deployment/frontend -n chat-app

# View database logs
kubectl logs -f deployment/mongodb -n chat-app
kubectl logs -f deployment/redis -n chat-app
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# End-to-end tests
npm run test:e2e
```

### Test Coverage
```bash
# Backend coverage
cd backend && npm run test:coverage

# Frontend coverage
cd frontend && npm run test:coverage
```

## 🔧 Development

### Code Structure
```
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── socket/         # Socket.IO handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
├── k8s/                    # Kubernetes manifests
└── docker-compose.yml      # Docker Compose config
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Group Endpoints
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Message Endpoints
- `GET /api/messages/group/:groupId` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### File Endpoints
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id/download` - Download file
- `GET /api/files/group/:groupId` - Get group files
- `DELETE /api/files/:id` - Delete file

## 🐛 Troubleshooting

### Common Issues

**Connection Issues:**
- Check if MongoDB and Redis are running
- Verify environment variables
- Check firewall settings

**File Upload Issues:**
- Ensure upload directory exists and is writable
- Check file size limits
- Verify file type restrictions

**Video Call Issues:**
- Check browser WebRTC support
- Verify camera/microphone permissions
- Check network connectivity

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Backend debug
cd backend && DEBUG=socket.io:* npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

## 🚀 Roadmap

Future features planned:
- [ ] Mobile applications (React Native)
- [ ] Voice messages
- [ ] Message translations
- [ ] Bot integrations
- [ ] Advanced file management
- [ ] Message scheduling
- [ ] Group video streaming
- [ ] Advanced analytics
- [ ] Plugin system