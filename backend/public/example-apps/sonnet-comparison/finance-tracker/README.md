# Personal Finance Tracker

A comprehensive personal finance management application built with React TypeScript frontend and Node.js Express backend, featuring expense tracking, budget management, savings goals, and financial reporting.

## Features

### Core Functionality
- **Expense Tracking**: Manual expense entry with receipt photo upload
- **Budget Management**: Monthly and yearly budgets with 80% and 100% spending alerts
- **Savings Goals**: Set and track progress toward financial goals
- **Financial Reporting**: Monthly spending breakdowns, category pie charts, income vs expenses graphs
- **Multi-Currency Support**: Track expenses in different currencies with automatic conversion

### Advanced Features
- **Authentication**: Email/password with optional 2FA using TOTP
- **Receipt Management**: Upload and store receipt photos using Cloudinary
- **Email Notifications**: Budget alerts and important notifications
- **Data Export**: Export financial data to CSV and PDF formats
- **Real-time Updates**: Live budget tracking and goal progress
- **Mobile Responsive**: Optimized for desktop and mobile devices

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer with Cloudinary storage
- **Email**: Nodemailer for notifications
- **2FA**: Speakeasy for TOTP generation
- **Export**: PDFKit for PDF generation, CSV-Writer for CSV export
- **Validation**: Express-validator and Joi
- **Security**: Helmet, CORS, Rate limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **File Upload**: React Dropzone
- **State Management**: React Context API

## Project Structure

```
finance-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA

### Expenses
- `GET /api/expenses` - Get expenses with filtering
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Get expense statistics

### Budgets
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/:id` - Get budget by ID
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/progress` - Get budget progress
- `GET /api/budgets/summary` - Get budget summary

### Savings Goals
- `GET /api/savings-goals` - Get savings goals
- `POST /api/savings-goals` - Create new savings goal
- `GET /api/savings-goals/:id` - Get savings goal by ID
- `PUT /api/savings-goals/:id` - Update savings goal
- `DELETE /api/savings-goals/:id` - Delete savings goal
- `POST /api/savings-goals/:id/add` - Add money to goal
- `POST /api/savings-goals/:id/withdraw` - Withdraw money from goal
- `GET /api/savings-goals/summary` - Get savings goals summary

### Reports
- `GET /api/reports/summary` - Get financial summary
- `GET /api/reports/monthly` - Get monthly report
- `GET /api/reports/income-vs-expenses` - Get income vs expenses data
- `GET /api/reports/export/csv` - Export data to CSV
- `GET /api/reports/export/pdf` - Export data to PDF

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account (for receipt uploads)
- Email service (Gmail/SMTP for notifications)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/finance-tracker
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   PORT=5000
   ```

5. Build and start the server:
   ```bash
   npm run build
   npm start
   
   # For development:
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file (optional):
   ```bash
   # Create .env file if you need to override the API URL
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Database Schema

### User Model
```typescript
{
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  preferredCurrency: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Expense Model
```typescript
{
  userId: ObjectId;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  date: Date;
  receiptUrl?: string;
  receiptPublicId?: string;
  paymentMethod: PaymentMethod;
  location?: string;
  tags: string[];
  isRecurring: boolean;
  recurringFrequency?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Budget Model
```typescript
{
  userId: ObjectId;
  name: string;
  amount: number;
  currency: string;
  category?: ExpenseCategory;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  spent: number;
  alertAt80Percent: boolean;
  alertAt100Percent: boolean;
  alert80PercentSent: boolean;
  alert100PercentSent: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Savings Goal Model
```typescript
{
  userId: ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: Date;
  category: SavingsGoalCategory;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation using Express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Helmet Security**: Security headers with Helmet.js
- **File Upload Security**: File type and size validation for receipts
- **2FA Support**: TOTP-based two-factor authentication

## Testing

The application includes comprehensive test suites:

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy the `build` folder to a static hosting service (Netlify, Vercel, S3, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@financetracker.com or create an issue in the GitHub repository.