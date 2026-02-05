# Glamour Studio Backend API

Backend API for the Glamour Studio Beauty Parlour Booking Application.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (Email/Password) + Firebase Admin SDK (Google Sign-In)
- **File Upload:** Cloudinary + Multer
- **Validation:** Express Validator

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required configurations:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FIREBASE_*` - Firebase Admin SDK credentials (for Google Sign-In)
- `CLOUDINARY_*` - Cloudinary credentials (for image uploads)

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
# Using MongoDB Community Server
mongod

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database (Optional)

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- Sample services (hair, skin, makeup, nails, spa)
- Test users (user + admin)
- Sample bookings

**Test Credentials:**
- User: `sarah@glamour.com` / `user123`
- Admin: `admin@glamour.com` / `admin123`

### 5. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | - |
| POST | `/login` | Login with email/password | - |
| POST | `/google` | Google Sign-In | - |
| POST | `/refresh` | Refresh access token | - |
| POST | `/logout` | Logout user | ✅ |
| GET | `/me` | Get current user | ✅ |
| POST | `/check-email` | Check if email exists | - |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get user profile | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| POST | `/avatar` | Upload avatar | ✅ |
| DELETE | `/avatar` | Delete avatar | ✅ |
| PUT | `/password` | Change password | ✅ |
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get user by ID | Admin |
| PUT | `/:id/role` | Update user role | Admin |
| PUT | `/:id/deactivate` | Deactivate user | Admin |
| PUT | `/:id/activate` | Activate user | Admin |

### Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create booking | ✅ |
| GET | `/my-bookings` | Get user's bookings | ✅ |
| GET | `/:id` | Get booking by ID | ✅ |
| PUT | `/:id/cancel` | Cancel booking | ✅ |
| PUT | `/:id/reschedule` | Reschedule booking | ✅ |
| GET | `/` | Get all bookings | Admin |
| GET | `/admin/today` | Get today's bookings | Admin |
| GET | `/admin/upcoming` | Get upcoming bookings | Admin |
| GET | `/admin/pending` | Get pending bookings | Admin |
| GET | `/admin/stats` | Get booking stats | Admin |
| PUT | `/:id/status` | Update booking status | Admin |
| PUT | `/:id/confirm` | Confirm booking | Admin |
| PUT | `/:id/complete` | Complete booking | Admin |

### Services (`/api/services`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all services | - |
| GET | `/categories` | Get service categories | - |
| GET | `/popular` | Get popular services | - |
| GET | `/category/:category` | Get services by category | - |
| GET | `/:id` | Get service by ID | - |
| GET | `/admin/all` | Get all services (inc. inactive) | Admin |
| POST | `/` | Create service | Admin |
| PUT | `/:id` | Update service | Admin |
| DELETE | `/:id` | Delete service | Admin |

## Configuration Files

### Firebase Setup (Google Sign-In)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Copy the values to your `.env` file

### Cloudinary Setup (Image Uploads)

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy Cloud name, API Key, and API Secret
3. Add to your `.env` file

### MongoDB Atlas Setup (Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Create a database user
4. Get the connection string
5. Replace `MONGODB_URI` in `.env`

## Project Structure

```
backend/
├── index.js                 # Entry point
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies
└── src/
    ├── config/
    │   ├── database.js      # MongoDB connection
    │   ├── firebase.js      # Firebase Admin SDK
    │   └── cloudinary.js    # Cloudinary config
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── bookingController.js
    │   └── serviceController.js
    ├── middleware/
    │   ├── auth.js          # JWT authentication
    │   ├── validate.js      # Request validation
    │   └── errorHandler.js  # Error handling
    ├── models/
    │   ├── User.js
    │   ├── Booking.js
    │   └── Service.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── bookingRoutes.js
    │   └── serviceRoutes.js
    ├── scripts/
    │   └── seed.js          # Database seeding
    └── utils/
        └── jwt.js           # JWT utilities
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Request Headers

```
Authorization: Bearer <access_token>
```

### Token Refresh

Access tokens expire after 7 days. Use the refresh endpoint to get a new access token:

```bash
POST /api/auth/refresh
```

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Seed database
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Set up MongoDB Atlas
4. Configure Cloudinary and Firebase
5. Enable HTTPS

```bash
# Start with PM2
pm2 start index.js --name glamour-studio-api
```

## License

ISC
