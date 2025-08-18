# Modern Blog Platform

A comprehensive, full-stack blog platform built with modern technologies including Next.js, Express.js, PostgreSQL, and Redis. Features include content management, user authentication, nested comments, SEO optimization, and admin panel.

## 🚀 Features

### Core Features
- ✅ **Content Management System (CMS)** - Create, edit, and manage blog posts
- ✅ **User Authentication** - JWT-based authentication with role-based access
- ✅ **Nested Comments System** - Threaded comments with moderation capabilities
- ✅ **SEO Optimization** - Dynamic meta tags, sitemap generation, and Schema.org markup
- ✅ **Admin Panel** - Comprehensive dashboard for content and user management
- ✅ **Rich Text Editor** - Advanced editor for creating formatted content
- ✅ **Category Management** - Organize posts by categories
- ✅ **User Roles** - Admin, Author, and User roles with different permissions

### Technical Features
- ✅ **Server-Side Rendering (SSR)** - Next.js for optimal performance and SEO
- ✅ **API Rate Limiting** - Protect against abuse with intelligent rate limiting
- ✅ **Redis Caching** - High-performance caching layer
- ✅ **Database Migrations** - Version-controlled database schema changes
- ✅ **Docker Support** - Complete containerization for easy deployment
- ✅ **TypeScript** - Full type safety across frontend and backend
- ✅ **Responsive Design** - Mobile-first approach with Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR/SSG
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and state management
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling and validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **Redis** - In-memory data structure store
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging library

### DevOps & Tools
- **Docker & Docker Compose** - Containerization
- **Jest** - Testing framework
- **ESLint & Prettier** - Code linting and formatting
- **Husky** - Git hooks
- **GitHub Actions** - CI/CD pipeline

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-platform
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

5. **Seed the database (optional)**
   ```bash
   docker-compose exec backend npm run seed
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

### Option 2: Manual Setup

1. **Setup PostgreSQL and Redis**
   ```bash
   # Install and start PostgreSQL
   # Install and start Redis
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run migrate
   npm run seed
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🗄 Database Schema

The platform uses a relational database with the following main entities:

- **Users** - User accounts with roles (admin, author, user)
- **Posts** - Blog posts with metadata and content
- **Categories** - Post categorization
- **Comments** - Nested comments with moderation
- **Likes** - User engagement tracking
- **Sessions** - JWT session management

## 🔑 Default Accounts

After running the seed command, these accounts are available:

- **Admin**: admin@blogplatform.com / admin123
- **Author**: john@example.com / password123  
- **User**: jane@example.com / password123

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/logout      - User logout
GET  /api/auth/me          - Get current user
PUT  /api/auth/me          - Update profile
```

### Posts Endpoints
```
GET    /api/posts          - Get all posts
GET    /api/posts/:slug    - Get single post
POST   /api/posts          - Create post (author+)
PUT    /api/posts/:id      - Update post (author+)
DELETE /api/posts/:id      - Delete post (author+)
```

### Comments Endpoints
```
GET    /api/comments/post/:postId  - Get post comments
POST   /api/comments/post/:postId  - Create comment
PUT    /api/comments/:id           - Update comment
DELETE /api/comments/:id           - Delete comment
```

### Admin Endpoints
```
GET /api/admin/dashboard   - Dashboard statistics
GET /api/admin/users       - Manage users
GET /api/admin/posts       - Manage all posts
GET /api/admin/comments    - Manage all comments
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Cross-origin request security
- **Helmet.js** - Security headers
- **Input Validation** - Request validation and sanitization
- **SQL Injection Protection** - Parameterized queries via Sequelize

## 📊 Performance Features

- **Redis Caching** - Database query and API response caching
- **Database Indexing** - Optimized database queries
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Automatic code splitting for faster loading
- **Compression** - Response compression
- **CDN Ready** - Static asset optimization

## 🎨 Customization

### Styling
- Modify `frontend/tailwind.config.js` for design system changes
- Update `frontend/styles/globals.css` for custom styles
- Configure theme colors and fonts in Tailwind configuration

### Features
- Add new API endpoints in `backend/src/routes/`
- Create new pages in `frontend/pages/`
- Extend database schema with new migrations
- Add new React components in `frontend/components/`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test

# Run all tests
npm run test:all
```

## 📦 Deployment

### Production Build

1. **Build the application**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy with production configuration**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables for Production

Ensure these environment variables are set for production:

- `NODE_ENV=production`
- `JWT_SECRET` - Strong secret key
- `DB_PASSWORD` - Secure database password
- `REDIS_URL` - Redis connection string
- `SMTP_*` or `SENDGRID_API_KEY` - Email service configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@blogplatform.com or create an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Express.js community for the robust backend framework
- Tailwind CSS for the utility-first CSS framework
- All open source contributors who made this project possible

---

**Built with ❤️ by the Blog Platform Team**