# PostgreSQL Setup Guide for VP Learning Platform

This guide will help you set up PostgreSQL database integration for the VP Learning Platform.

## Prerequisites

1. **PostgreSQL Installation**
   - Install PostgreSQL on your system
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Node.js and npm**
   - Ensure you have Node.js installed
   - Run `npm install` to install dependencies

## Database Setup

### 1. Create Database

Connect to PostgreSQL and create the database:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE vp_learning;

-- Create user (optional)
CREATE USER vp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vp_learning TO vp_user;
```

### 2. Run Database Schema

Execute the database setup script:

```bash
# Using psql command line
psql -U postgres -d vp_learning -f server/setup-db.sql

# Or using the npm script
npm run setup:db
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vp_learning
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### 1. Start the Backend Server

```bash
# Development mode with auto-restart
npm run server:dev

# Production mode
npm run server
```

The server will start on `http://localhost:5000`

### 2. Start the Frontend

```bash
# Development mode
npm run dev

# Build for production
npm run build
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Health Check
- `GET /api/health` - Server health check

## Database Schema

### Users Table
- `id` - Primary key
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - Unique email address
- `password_hash` - Hashed password
- `user_type` - 'student' or 'instructor'
- `is_active` - Account status
- `email_verified` - Email verification status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### User Profiles Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `bio` - User biography
- `avatar_url` - Profile picture URL
- `phone` - Phone number
- `date_of_birth` - Date of birth
- `country` - Country
- `city` - City
- `skills` - Array of skills
- `website` - Personal website
- `linkedin_url` - LinkedIn profile
- `github_url` - GitHub profile

### User Sessions Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `token` - JWT token
- `expires_at` - Token expiration
- `created_at` - Session creation timestamp

## Security Features

1. **Password Hashing**: Uses bcryptjs for secure password storage
2. **JWT Tokens**: Secure authentication tokens with expiration
3. **Input Validation**: Server-side validation for all inputs
4. **SQL Injection Protection**: Parameterized queries
5. **CORS Configuration**: Proper cross-origin resource sharing

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify port 5432 is accessible

2. **Authentication Failed**
   - Check username/password in `.env`
   - Ensure user has proper permissions

3. **Database Not Found**
   - Run the database creation commands
   - Execute the schema setup script

4. **Port Already in Use**
   - Change the PORT in `.env`
   - Kill existing processes on the port

### Logs

Check server logs for detailed error messages:
```bash
npm run server:dev
```

## Development Tips

1. **Database Management**
   - Use pgAdmin for GUI database management
   - Use psql for command-line access

2. **Testing**
   - Test API endpoints using Postman or curl
   - Check browser network tab for API calls

3. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different configurations for development/production

## Production Deployment

1. **Database**
   - Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
   - Set up proper backup and monitoring

2. **Security**
   - Use strong JWT secrets
   - Enable SSL/TLS
   - Set up proper firewall rules

3. **Environment**
   - Use environment-specific configuration
   - Set up proper logging and monitoring
