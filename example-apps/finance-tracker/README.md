# Personal Finance Tracker

A comprehensive personal finance management application built with React TypeScript frontend and Express.js backend. Track expenses, manage budgets, and generate detailed financial reports with multi-currency support and two-factor authentication.

## Features

### 🎯 Core Functionality
- **Expense Tracking**: Add, edit, and delete expenses with receipt photo upload
- **Budget Management**: Set monthly and yearly budgets with real-time alerts
- **Financial Reports**: Generate monthly and annual reports with CSV export
- **Multi-Currency Support**: Track expenses in different currencies
- **Two-Factor Authentication**: Enhanced security with optional 2FA

### 📊 Analytics & Visualization
- **Interactive Dashboard**: Overview of spending patterns and budget status
- **Chart Visualizations**: Category breakdowns, monthly trends, and daily spending
- **Budget Alerts**: Notifications at 80% and 100% budget utilization
- **Expense Categories**: 8 predefined categories (Food, Housing, Transportation, etc.)

### 📱 User Experience
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live budget calculations and alerts
- **Receipt Management**: Upload and view expense receipts
- **Advanced Filtering**: Search and filter expenses by date, category, and amount

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Chart.js** with react-chartjs-2 for visualizations
- **Axios** for API communication
- **CSS3** with modern responsive design

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image storage
- **Speakeasy** for 2FA implementation
- **Express Validator** for input validation

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or cloud instance)
- Cloudinary account (for receipt image uploads)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables in `.env`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/finance_tracker
   
   # JWT Secret (use a strong, random secret in production)
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the backend server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/enable-2fa` - Enable two-factor authentication
- `POST /api/auth/verify-2fa` - Verify 2FA token

### Expenses
- `GET /api/expenses` - Get user expenses (with filtering)
- `POST /api/expenses` - Create new expense (with file upload)
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/summary` - Get budget summary with spending analysis
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Reports
- `GET /api/reports/monthly` - Generate monthly report
- `GET /api/reports/annual` - Generate annual report

## Usage Guide

### Getting Started

1. **Register an Account:**
   - Navigate to the registration page
   - Provide email, password, and personal details
   - Choose your default currency

2. **Set Up Budgets:**
   - Go to the Budgets page
   - Create monthly or yearly budgets for different categories
   - Set realistic spending limits

3. **Track Expenses:**
   - Add expenses through the Expenses page
   - Upload receipt photos for better record keeping
   - Categorize expenses appropriately

4. **Monitor Progress:**
   - Check the Dashboard for spending overview
   - Review budget alerts and recommendations
   - Analyze spending patterns through charts

5. **Generate Reports:**
   - Use the Reports page to generate detailed analysis
   - Export data to CSV for external analysis
   - Track long-term financial trends

### Two-Factor Authentication

1. **Enable 2FA:**
   - Click "Enable 2FA" in the header
   - Scan the QR code with an authenticator app
   - Enter the verification code to confirm

2. **Supported Apps:**
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
   - Any TOTP-compatible app

### Budget Alerts

The system provides automatic alerts when:
- You reach 80% of your budget (warning)
- You exceed 100% of your budget (danger)
- Alerts appear when adding new expenses

## Development

### Project Structure

```
finance-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation on all API endpoints
- File upload restrictions (type and size)
- CORS configuration for cross-origin requests
- Environment variables for sensitive data

## Deployment

### Backend Deployment
1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables for production
3. Deploy to a cloud service (Heroku, DigitalOcean, AWS, etc.)
4. Ensure HTTPS is enabled

### Frontend Deployment
1. Build the React application
2. Deploy to a static hosting service (Netlify, Vercel, etc.)
3. Update API URL in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the API endpoints for integration help

## Roadmap

Future enhancements planned:
- Mobile app (React Native)
- Investment tracking
- Bill reminders
- Multiple account support
- Data import/export features
- Advanced analytics and insights