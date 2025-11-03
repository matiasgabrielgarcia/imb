# IMB - Property Management System

A complete property management system with React frontend and Node.js backend, featuring two-factor authentication, interactive maps, and comprehensive property management.

## Features

### Authentication & Security
- 🔐 **Two-Factor Authentication** with Google Authenticator (TOTP)
- 📧 **Email Verification** as fallback 2FA method
- 🛡️ **Secure Authentication** with JWT tokens
- 🔑 **Backup Codes** for account recovery

### Property Management
- 🏠 **Property CRUD** - Create, read, update, delete properties
- 🗺️ **Interactive Maps** - Click-to-select coordinates with MapLibre GL
- 📍 **GPS Integration** - Use current location for property coordinates
- 💰 **Sales & Rentals** - Manage property sales and rental records
- ✅ **Form Validation** - Comprehensive validation with real-time feedback
- 📊 **Dashboard** - Overview of all properties and activities

### User Experience
- 🎨 **Modern UI** with Material-UI components
- 📱 **Responsive Design** - Works on all devices
- 🔄 **Real-time Updates** - Live data synchronization
- 🎯 **Intuitive Interface** - Easy-to-use property management

## Project Structure

```
imb/
├── front/                    # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── views/          # Main page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── contexts/       # React contexts
│   └── package.json
├── back/                     # Node.js TypeScript backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── database/       # Database schema & connection
│   └── package.json
├── scripts/                 # Utility scripts
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE 2fa_auth;
```

2. Run the schema file:
```bash
psql -d 2fa_auth -f back/src/database/schema.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd back
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=2fa_auth
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
APP_NAME=2FA Authentication App
```

5. Build and start the backend:
```bash
npm run build
npm start
```

Or for development:
```bash
npm run dev
```

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd front
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` if needed:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

5. Start the development server:
```bash
npm start
```

## Usage

### Creating Users

Since this system doesn't include signup functionality, users need to be created directly in the database:

```sql
INSERT INTO users (username, email, password_hash, two_factor_enabled) 
VALUES ('testuser', 'test@example.com', '$2a$12$hashedpassword', false);
```

**Note:** You'll need to hash the password using bcrypt. You can use the backend API or a bcrypt tool.

### Login Flow

1. **Username/Password**: Enter credentials on the login page
2. **2FA Verification**: 
   - If 2FA is enabled, enter the 6-digit code from Google Authenticator
   - Or use email verification as fallback
3. **Dashboard**: Access the protected dashboard area

### Setting Up 2FA

1. Login to the dashboard
2. Click "Enable 2FA" in the security settings
3. Scan the QR code with Google Authenticator
4. Save the backup codes in a safe place
5. Use the authenticator app for future logins

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/verify-2fa` - Verify 2FA token
- `POST /api/auth/setup-2fa` - Setup 2FA for user
- `POST /api/auth/send-email-code` - Send email verification code
- `POST /api/auth/verify-email-code` - Verify email code

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Sales
- `GET /api/sales` - List all sales
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/property/:propertyId` - Get sales by property
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Rentals
- `GET /api/rentals` - List all rentals
- `GET /api/rentals/:id` - Get rental by ID
- `GET /api/rentals/property/:propertyId` - Get rentals by property
- `POST /api/rentals` - Create new rental
- `PUT /api/rentals/:id` - Update rental
- `DELETE /api/rentals/:id` - Delete rental

### Health Check
- `GET /health` - Server health status

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on login attempts
- Secure 2FA implementation
- CORS protection
- Helmet security headers

## Technologies Used

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with pg
- JWT for authentication
- Speakeasy for TOTP
- QRCode for QR generation
- Nodemailer for email
- Bcryptjs for password hashing

### Frontend
- React with TypeScript
- React Router for navigation
- Axios for API calls
- Context API for state management
- CSS3 with modern styling

## Development

### Backend Development
```bash
cd back
npm run dev  # Starts with nodemon
```

### Frontend Development
```bash
cd front
npm start  # Starts React dev server
```

### Building for Production
```bash
# Backend
cd back
npm run build
npm start

# Frontend
cd front
npm run build
```

## Troubleshooting

1. **Database Connection Issues**: Check PostgreSQL is running and credentials are correct
2. **Email Not Sending**: Verify email credentials and SMTP settings
3. **CORS Errors**: Ensure frontend URL is added to CORS origins
4. **JWT Errors**: Check JWT_SECRET is set and consistent

## License

This project is for educational purposes. Use responsibly and ensure proper security measures in production.
